export const APP_NAME = "친환경 챌린지";

/**
 * 워드마크.
 * 방송 자막 스티커처럼 두툼하게, 테두리를 한 겹 두르고 살짝 기울여서.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden>🌿</span>
      <span className="wordmark">{APP_NAME}</span>
    </span>
  );
}
