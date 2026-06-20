import { Stack } from 'expo-router';

/**
 * App group layout — Stack for tabs + modal screens (chat, profile edit/setup)
 */
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="chat/[matchId]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="profile/change-password"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="profile/setup"
        options={{ animation: 'fade' }}
      />
    </Stack>
  );
}
