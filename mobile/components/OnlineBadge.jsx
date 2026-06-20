import { View } from 'react-native';

/**
 * Online status badge — green dot indicator
 */
export default function OnlineBadge({ isOnline, size = 'md' }) {
  const sizeMap = {
    sm: 10,
    md: 12,
    lg: 16,
  };

  if (!isOnline) return null;

  const dotSize = sizeMap[size] || 12;

  return (
    <View
      style={{
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: 'white',
      }}
    />
  );
}
