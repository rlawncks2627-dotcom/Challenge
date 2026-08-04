"use client";

import { useEffect, useRef, useState } from "react";

import { resizeToWebP } from "@/lib/image";

export type SheetSubmit = { photo: Blob | null; memo: string };

/**
 * 사진과 한 줄 메모를 붙여 체크인하는 시트.
 * 사진은 선택이다 — 여기까지 왔다는 건 남기고 싶다는 뜻이지만, 강요하지 않는다.
 */
export function CheckinSheet({
  title,
  onSubmit,
  onClose,
}: {
  title: string;
  onSubmit: (value: SheetSubmit) => Promise<void>;
  onClose: () => void;
}) {
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const resized = await resizeToWebP(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPhoto(resized);
      setPreviewUrl(URL.createObjectURL(resized));
    } catch (e) {
      setError(e instanceof Error ? e.message : "사진을 불러오지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ photo, memo });
    } catch (e) {
      setError(e instanceof Error ? e.message : "기록하지 못했습니다.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} 기록하기`}
        tabIndex={-1}
        className="relative flex w-full max-w-sm flex-col gap-5 rounded-t-lg border-t-4 border-green bg-paper px-6 pt-6 pb-8"
      >
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-ink-soft">기록하기</p>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="photo"
            className="text-sm font-semibold tracking-wide text-ink-soft"
          >
            인증 사진 (선택)
          </label>

          {previewUrl ? (
            // 사용자가 방금 고른 사진의 blob URL이라 next/image 최적화 대상이 아니다.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="선택한 인증 사진 미리보기"
              className="max-h-56 w-full rounded-sm border-2 border-rule object-cover"
            />
          ) : null}

          <input
            id="photo"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => pickPhoto(e.target.files?.[0])}
            className="w-full rounded-sm border-2 border-rule bg-paper-sunk px-3 py-3 text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-paper"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="memo"
            className="text-sm font-semibold tracking-wide text-ink-soft"
          >
            한 줄 메모 (선택)
          </label>
          <textarea
            id="memo"
            value={memo}
            maxLength={200}
            rows={2}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="오늘은 어땠나요?"
            className="w-full resize-none rounded-sm border-2 border-rule bg-paper-sunk px-3 py-3 text-ink placeholder:text-ink-soft placeholder:opacity-45 focus:border-green focus:outline-none"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-pink">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-sm border-2 border-ink px-4 py-3.5 font-semibold"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex-[2] rounded-sm bg-green px-4 py-3.5 font-semibold text-paper transition-transform active:translate-y-[2px] disabled:opacity-55"
          >
            {busy ? "기록하는 중" : "완료로 표시"}
          </button>
        </div>
      </div>
    </div>
  );
}
