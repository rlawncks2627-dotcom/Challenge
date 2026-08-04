import { SkeletonLine } from "@/components/skeleton";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="불러오는 중"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10"
    >
      <SkeletonLine className="h-8 w-56" />
      <SkeletonLine className="h-20 w-full" />
      <SkeletonLine className="h-64 w-full" />
      <SkeletonLine className="h-40 w-full" />
    </div>
  );
}
