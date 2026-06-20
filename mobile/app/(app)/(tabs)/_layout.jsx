import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Flame, Heart, MessageCircle, User } from 'lucide-react-native';
import { useChatStore } from '../../../store/chatStore';
import { useMatchStore } from '../../../store/matchStore';

/**
 * Bottom tab navigator with custom styling, unread message badge, and new match count badge
 * Tabs: Discover 🔥 | Matches ❤️ | Chats 💬 | Profile 👤
 */
export default function TabsLayout() {
  const { totalUnread } = useChatStore();
  const { newMatchCount } = useMatchStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Flame size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Heart size={size} color={color} />
              {newMatchCount > 0 && (
                <View
                  className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 rounded-full items-center justify-center"
                >
                  <Text className="text-white text-[9px] font-bold">
                    {newMatchCount > 9 ? '9+' : newMatchCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <View>
              <MessageCircle size={size} color={color} />
              {totalUnread > 0 && (
                <View
                  className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 rounded-full items-center justify-center"
                >
                  <Text className="text-white text-[9px] font-bold">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
