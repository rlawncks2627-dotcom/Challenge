/**
 * 워드마크.
 * 키키의 가게 간판처럼, 손으로 칠해 살짝 떠 있는 글씨.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span aria-hidden>🌿</span>
      <span className="wordmark">그린스텝</span>
    </span>
  );
}
