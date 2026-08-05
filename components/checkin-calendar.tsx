import {
  buildMonthGrid,
  monthsBetween,
  WEEKDAY_LABELS,
  type YearMonth,
} from "@/lib/calendar";

/**
 * 실천 달력. 스탬프 카드를 한 달치로 펼친 것이다.
 * 하루에 몇 개를 찍었는지에 따라 잉크가 진해진다.
 */
export function CheckinCalendar({
  startDate,
  endDate,
  today,
  countsByDate,
}: {
  startDate: string;
  endDate: string;
  today: string;
  countsByDate: Map<string, number>;
}) {
  const months = monthsBetween(startDate, endDate);

  return (
    <div className="flex flex-col gap-6">
      {months.map((month) => (
        <Month
          key={`${month.year}-${month.month}`}
          month={month}
          startDate={startDate}
          endDate={endDate}
          today={today}
          countsByDate={countsByDate}
        />
      ))}
    </div>
  );
}

function Month({
  month,
  startDate,
  endDate,
  today,
  countsByDate,
}: {
  month: YearMonth;
  startDate: string;
  endDate: string;
  today: string;
  countsByDate: Map<string, number>;
}) {
  const weeks = buildMonthGrid(month.year, month.month);

  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{month.month}월</h3>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            aria-hidden
            className="pb-1 text-center font-mono text-xs text-ink-soft"
          >
            {label}
          </div>
        ))}

        {weeks.flat().map((date, index) => {
          if (!date) return <div key={`gap-${index}`} />;

          const count = countsByDate.get(date) ?? 0;
          const inPeriod = date >= startDate && date <= endDate;
          const day = Number(date.slice(-2));

          return (
            <div
              key={date}
              title={`${day}일 · ${count}개 실천`}
              className={`flex aspect-square items-center justify-center rounded-sm border text-xs ${cellStyle(count, inPeriod)} ${
                date === today ? "ring-2 ring-green ring-offset-1 ring-offset-paper" : ""
              }`}
            >
              {count > 0 ? (
                <span className="font-display leading-none">{count}</span>
              ) : (
                <span className={inPeriod ? "text-ink-soft" : "text-ink-soft/40"}>
                  {day}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** 찍은 개수가 많을수록 잉크가 진해진다. */
function cellStyle(count: number, inPeriod: boolean): string {
  if (count === 0) {
    return inPeriod ? "border-rule" : "border-rule/40";
  }
  if (count >= 4) return "border-green bg-green text-white";
  if (count >= 2) return "border-green/70 bg-green/60 text-white";
  return "border-green/50 bg-mint/60 text-ink";
}
