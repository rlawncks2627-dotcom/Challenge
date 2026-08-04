/**
 * 내 기록 화면의 월간 달력.
 *
 * Date 객체로 날짜를 굴리면 시간대에 끌려간다. 여기서는 'YYYY-MM-DD' 문자열과
 * 숫자만 다룬다 — 캠페인의 날짜는 벽에 붙은 달력의 날짜지 순간이 아니다.
 */

export type YearMonth = { year: number; month: number }; // month: 1~12

/** 캠페인 기간이 걸치는 달들. */
export function monthsBetween(startDate: string, endDate: string): YearMonth[] {
  const [startYear, startMonth] = parse(startDate);
  const [endYear, endMonth] = parse(endDate);

  const months: YearMonth[] = [];
  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push({ year, month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return months;
}

/**
 * 일요일 시작 6주 그리드. 그 달에 속하지 않는 칸은 null.
 * 주 수를 고정하지 않으면 달을 넘길 때 화면 높이가 출렁인다.
 */
export function buildMonthGrid(year: number, month: number): (string | null)[][] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const dayCount = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: (string | null)[] = Array(firstWeekday).fill(null);
  for (let day = 1; day <= dayCount; day += 1) {
    cells.push(`${year}-${pad(month)}-${pad(day)}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function parse(isoDate: string): [number, number] {
  const [year, month] = isoDate.split("-");
  return [Number(year), Number(month)];
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
