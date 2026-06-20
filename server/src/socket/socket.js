const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message.model');
const Match = require('../models/Match.model');

/** In-memory map of userId → socketId for online user tracking */
const userSocketMap = {};

/** @type {Server} */
let io;

/**
 * Initialize Socket.io server with authentication and event handlers
 * @param {import('http').Server} server - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const allowedOrigins = [
          process.env.CLIENT_WEB_URL || 'http://localhost:5173',
          process.env.CLIENT_MOBILE_URL || 'http://localhost:8081',
        ];

        if (
          allowedOrigins.includes(origin) ||
          /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin) ||
          /^http:\/\/localhost/.test(origin)
        ) {
          return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware — verify JWT before allowing connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 User connected: ${userId} (socket: ${socket.id})`);

    // Track online user
    userSocketMap[userId] = socket.id;
    io.emit('online_users', Object.keys(userSocketMap));

    // Join a match room for real-time chat
    socket.on('join_match', (matchId) => {
      socket.join(matchId);
      console.log(`📌 User ${userId} joined match room: ${matchId}`);
    });

    // Leave a match room
    socket.on('leave_match', (matchId) => {
      socket.leave(matchId);
      console.log(`📌 User ${userId} left match room: ${matchId}`);
    });

    // Handle sending messages via socket (alternative to REST endpoint)
    socket.on('send_message', async ({ matchId, content }) => {
      try {
        if (!content || !content.trim()) return;

        // Verify user is part of this match
        const match = await Match.findById(matchId);
        if (!match) return;

        const isParticipant = match.users.some(
          (id) => id.toString() === userId
        );
        if (!isParticipant) return;

        // Save message to DB
        const message = await Message.create({
          matchId,
          senderId: userId,
          content: content.trim(),
        });

        const populatedMessage = await Message.findById(message._id).populate(
          'senderId',
          'name profilePhoto'
        );

        // Update match's last message
        await Match.findByIdAndUpdate(matchId, {
          lastMessage: message._id,
          lastMessageAt: message.createdAt,
        });

        // Emit to all users in the match room
        io.to(matchId).emit('new_message', populatedMessage);

        // Emit match update for chat list
        const otherUserId = match.users.find(
          (id) => id.toString() !== userId
        );
        const receiverSocketId = userSocketMap[otherUserId?.toString()];
        if (receiverSocketId) {
          const updatedMatch = await Match.findById(matchId)
            .populate('users', 'name profilePhoto gymName workoutType timing bio')
            .populate('lastMessage', 'content senderId createdAt read');
          io.to(receiverSocketId).emit('match_updated', updatedMatch);
        }
      } catch (error) {
        console.error('Socket send_message error:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing', ({ matchId }) => {
      socket.to(matchId).emit('user_typing', { userId });
    });

    socket.on('stop_typing', ({ matchId }) => {
      socket.to(matchId).emit('user_stop_typing', { userId });
    });

    // Mark messages as read via socket
    socket.on('mark_read', async ({ matchId }) => {
      try {
        await Message.updateMany(
          { matchId, senderId: { $ne: userId }, read: false },
          { $set: { read: true } }
        );
        io.to(matchId).emit('messages_read', { matchId, readBy: userId });
      } catch (error) {
        console.error('Socket mark_read error:', error.message);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${userId}`);
      delete userSocketMap[userId];
      io.emit('online_users', Object.keys(userSocketMap));
    });
  });

  return io;
}

/**
 * Get the Socket.io server instance
 * @returns {Server}
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

/**
 * Get the socket ID for a specific user
 * @param {string} userId - The user's ID
 * @returns {string|undefined} The socket ID or undefined if offline
 */
function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

module.exports = { initSocket, getIO, getReceiverSocketId };
