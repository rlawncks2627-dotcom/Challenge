/**
 * 오류는 사과하지 않는다. 무엇이 잘못됐고 어떻게 고치는지만 말한다.
 */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="flex gap-2 text-sm font-medium text-pink">
      <span aria-hidden>✕</span>
      <span>{message}</span>
    </p>
  );
}
