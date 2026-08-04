import { redirect } from "next/navigation";

import { AdminCampaignForm } from "@/components/admin-campaign-form";
import { AdminChallengeForm } from "@/components/admin-challenge-form";
import { Wordmark } from "@/components/wordmark";
import { adminSignOut } from "@/lib/actions/admin";
import { readAdminSession } from "@/lib/admin-session";
import { formatCo2 } from "@/lib/co2";
import { normalizeCode } from "@/lib/invite-code";
import { formatSlot } from "@/lib/roster";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard({
  params,
}: PageProps<"/admin/[code]">) {
  const { code: rawCode } = await params;
  const code = normalizeCode(decodeURIComponent(rawCode));

  const session = await readAdminSession();
  if (!session || session.code !== code) redirect("/admin");

  const supabase = await createClient();
  const args = { p_invite_code: session.code, p_admin_code: session.admin };

  const [{ data: overview }, { data: challenges }, { data: participants }] =
    await Promise.all([
      supabase.rpc("admin_campaign_overview", args),
      supabase.rpc("admin_list_challenges", args),
      supabase.rpc("admin_list_participants", args),
    ]);

  const campaign = overview?.[0];
  // 관리자 코드가 바뀌었거나 캠페인이 사라진 경우.
  if (!campaign) redirect("/admin");

  const nextSortOrder =
    (challenges ?? []).reduce((max, c) => Math.max(max, c.sort_order), 0) + 1;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-10">
      <header className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <Wordmark className="text-xl" />
          <form action={adminSignOut}>
            <button type="submit" className="text-sm text-ink-soft underline underline-offset-4">
              나가기
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl leading-tight font-bold">{campaign.name}</h1>
          <p className="text-sm text-ink-soft">캠페인 관리</p>
        </div>

        {/* 운영자가 가장 자주 찾아가는 값. 참가자에게 알려줄 코드다. */}
        <div className="flex flex-col gap-1 border-l-4 border-green pl-4">
          <p className="text-sm text-ink-soft">참가자에게 알려줄 초대코드</p>
          <p className="font-mono text-2xl font-semibold tracking-[0.2em]">
            {campaign.invite_code}
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-3">
          <Stat label="참가자" value={`${campaign.participant_count}명`} />
          <Stat label="실천" value={`${campaign.checkin_count}회`} />
          <Stat label="누적 절감" value={formatCo2(campaign.total_co2_g)} />
        </dl>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">캠페인 설정</h2>
        <AdminCampaignForm
          name={campaign.name}
          startDate={campaign.start_date}
          endDate={campaign.end_date}
          goalCo2G={campaign.goal_co2_g}
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">실천 항목</h2>
          <p className="text-sm text-ink-soft">
            점수와 절감량은 체크인 시점의 값이 기록으로 남습니다. 여기서 값을
            바꿔도 지난 기록과 순위는 변하지 않습니다.
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {(challenges ?? []).map((challenge) => (
            <AdminChallengeForm key={challenge.id} challenge={challenge} />
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold">항목 추가</h3>
          <ul>
            <AdminChallengeForm defaultSortOrder={nextSortOrder} />
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">
          참가자 현황 ({participants?.length ?? 0}명)
        </h2>

        {(participants?.length ?? 0) === 0 ? (
          <p className="rounded-sm border-2 border-dashed border-rule px-4 py-6 text-ink-soft">
            아직 참가자가 없습니다. 위 초대코드를 공유해주세요.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-rule text-left text-ink-soft">
                  <th className="py-2 pr-3 font-semibold">자리</th>
                  <th className="py-2 pr-3 font-semibold">닉네임</th>
                  <th className="py-2 pr-3 font-semibold">점수</th>
                  <th className="py-2 pr-3 font-semibold">실천</th>
                  <th className="py-2 pr-3 font-semibold">절감</th>
                  <th className="py-2 font-semibold">참가일</th>
                </tr>
              </thead>
              <tbody>
                {participants?.map((p) => (
                  <tr key={p.nickname} className="border-b border-rule">
                    <td className="py-2 pr-3 font-mono whitespace-nowrap">
                      {formatSlot(p.grade, p.class_no, p.student_no)}
                    </td>
                    <td className="py-2 pr-3 font-semibold">{p.nickname}</td>
                    <td className="py-2 pr-3 font-mono">{p.total_points}</td>
                    <td className="py-2 pr-3 font-mono">{p.checkin_count}</td>
                    <td className="py-2 pr-3 font-mono">
                      {formatCo2(p.total_co2_g)}
                    </td>
                    <td className="py-2 font-mono text-ink-soft">
                      {p.joined_at.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-sm border-2 border-rule px-3 py-3">
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className="font-display text-xl leading-none">{value}</dd>
    </div>
  );
}
