"use client";

import { useState } from "react";

import { FEED_PAGE_SIZE, loadFeed, type FeedItem } from "@/lib/feed";
import { createClient } from "@/lib/supabase/client";

export function PhotoFeed({
  initialItems,
  campaignId,
}: {
  initialItems: FeedItem[];
  campaignId: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [done, setDone] = useState(initialItems.length < FEED_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    const last = items.at(-1);
    if (!last) return;

    setLoading(true);
    setError(null);
    try {
      const next = await loadFeed(createClient(), campaignId, last.createdAt);
      setItems((prev) => [...prev, ...next]);
      if (next.length < FEED_PAGE_SIZE) setDone(true);
    } catch {
      setError("더 불러오지 못했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-2 rounded-sm border-2 border-dashed border-rule px-4 py-8">
        <p className="font-semibold">아직 올라온 인증샷이 없어요.</p>
        <p className="text-sm text-ink-soft">
          오늘 화면에서 실천을 기록할 때 사진을 함께 남기면 여기에 보입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-6">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-2">
            {item.photoUrl ? (
              // 서명 URL 은 만료되는 임시 주소라 next/image 최적화 대상이 아니다.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.photoUrl}
                alt={`${item.nickname}님의 ${item.challengeTitle} 인증샷`}
                loading="lazy"
                className="w-full rounded-sm border-2 border-rule object-cover"
              />
            ) : (
              <div className="rounded-sm border-2 border-dashed border-rule px-4 py-6 text-sm text-ink-soft">
                사진을 불러오지 못했어요.
              </div>
            )}

            <div className="flex items-baseline gap-2">
              <span aria-hidden>{item.challengeIcon}</span>
              <span className="font-semibold">{item.nickname}</span>
              <span className="text-sm text-ink-soft">
                {item.challengeTitle}
              </span>
            </div>

            {item.memo && <p className="text-sm">{item.memo}</p>}
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="text-sm font-medium text-pink">
          {error}
        </p>
      )}

      {!done && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="w-full rounded-full border-2 border-green/50 bg-paper/60 px-4 py-3.5 font-bold disabled:opacity-55"
        >
          {loading ? "불러오는 중" : "더 보기"}
        </button>
      )}
    </div>
  );
}
