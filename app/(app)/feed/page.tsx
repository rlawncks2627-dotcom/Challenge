import { PhotoFeed } from "@/components/photo-feed";
import { loadFeed } from "@/lib/feed";
import { getCurrentParticipant } from "@/lib/participant";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const participant = await getCurrentParticipant();
  if (!participant) return null;

  const { campaign } = participant;
  const supabase = await createClient();
  const items = await loadFeed(supabase, campaign.id);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">인증 피드</h1>
        <p className="text-sm text-ink-soft">
          {campaign.name} 참가자들이 남긴 기록
        </p>
      </header>

      <PhotoFeed initialItems={items} campaignId={campaign.id} />
    </main>
  );
}
