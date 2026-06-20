/**
 * Skeleton loading card for the swipe deck
 */
export default function SkeletonCard() {
  return (
    <div className="w-full max-w-sm aspect-[3/4] max-h-[520px] rounded-3xl overflow-hidden bg-white shadow-card">
      <div className="w-full h-full skeleton" />
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
        <div className="h-6 w-32 skeleton rounded-lg" />
        <div className="flex gap-2">
          <div className="h-6 w-20 skeleton rounded-full" />
          <div className="h-6 w-24 skeleton rounded-full" />
        </div>
        <div className="h-4 w-full skeleton rounded-lg" />
      </div>
    </div>
  );
}
