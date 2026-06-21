import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Dumbbell,
  MapPin,
  Clock,
  Edit,
  Mail,
  Calendar,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

/**
 * Profile page — displays current user's profile details
 * Clean card-based layout with photo, stats, and info sections
 */
export default function ProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 hover:shadow-sm transition-all text-sm font-medium text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface ring-1 ring-slate-200 rounded-3xl shadow-card overflow-hidden"
        >
          {/* Cover / Photo Section */}
          <div className="relative h-48 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

            {/* Edit Button */}
            <button
              onClick={() => navigate('/profile/edit')}
              className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-xl border border-white/30 hover:bg-white/30 transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* Avatar */}
          <div className="relative -mt-16 flex justify-center">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-primary-100 flex items-center justify-center border-4 border-white shadow-xl">
                <User className="w-16 h-16 text-primary-400" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="text-center px-8 pt-4 pb-6">
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>

            {user.bio && (
              <p className="text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {user.gymName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user.gymName}
                </span>
              )}
              {user.workoutType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                  <Dumbbell className="w-3.5 h-3.5" />
                  {user.workoutType}
                </span>
              )}
              {user.timing && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {user.timing}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface ring-1 ring-slate-200 rounded-3xl shadow-card mt-4 p-6"
        >
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Account Details
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-medium text-slate-700">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Member Since</p>
                <p className="text-sm font-medium text-slate-700">
                  {user.createdAt
                    ? format(new Date(user.createdAt), 'MMMM d, yyyy')
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Profile Status</p>
                <p className="text-sm font-medium text-slate-700">
                  {user.isProfileComplete ? (
                    <span className="text-emerald-400">✓ Complete</span>
                  ) : (
                    <span className="text-amber-400">Incomplete</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <button
            onClick={() => navigate('/profile/edit')}
            className="w-full py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
          <button
            onClick={() => navigate('/profile/change-password')}
            className="w-full py-3.5 mt-3 bg-surface ring-1 ring-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </button>
        </motion.div>
      </div>
    </div>
  );
}
