/**
 * 워드마크. 이 앱에서 오버프린트를 쓰는 유일한 자리다.
 * 리소 인쇄에서 판이 어긋나 두 잉크가 겹치는 그 순간이 이 앱의 서명이다.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`overprint font-display leading-none ${className}`}
      data-text="그린스텝"
    >
      그린스텝
    </span>
  );
}
