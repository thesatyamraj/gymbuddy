/**
 * Online status badge — green dot indicator
 */
export default function OnlineBadge({ isOnline, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  if (!isOnline) return null;

  return (
    <span
      className={`${sizeClasses[size]} bg-emerald-500 rounded-full border-2 border-white shadow-sm inline-block`}
      title="Online"
    />
  );
}
