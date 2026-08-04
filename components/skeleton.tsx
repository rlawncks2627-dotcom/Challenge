/**
 * 로딩 자리표시자.
 * 인쇄물에는 원래 로딩이 없다. 잉크가 아직 안 올라간 판처럼, 자리만 비워둔다.
 */
export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-sm bg-paper-sunk ${className}`}
    />
  );
}

export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="불러오는 중"
      className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-7 px-6 py-10"
    >
      <div className="flex flex-col gap-3">
        <SkeletonLine className="h-5 w-24" />
        <SkeletonLine className="h-8 w-40" />
        <SkeletonLine className="h-4 w-52" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }, (_, i) => (
          <SkeletonLine key={i} className="h-[74px] w-full" />
        ))}
      </div>
    </div>
  );
}
