/** 참가 자리를 이루는 값의 범위. DB 의 check 제약과 같은 숫자다. */
export const GRADES = [1, 2, 3, 4, 5, 6] as const;
export const CLASSES = [1, 2, 3, 4, 5] as const;
export const STUDENT_NUMBERS = Array.from({ length: 30 }, (_, i) => i + 1);

export function isValidSlot(grade: number, classNo: number, studentNo: number) {
  return (
    GRADES.includes(grade as (typeof GRADES)[number]) &&
    CLASSES.includes(classNo as (typeof CLASSES)[number]) &&
    Number.isInteger(studentNo) &&
    studentNo >= 1 &&
    studentNo <= 30
  );
}

/** '3학년 2반 15번' */
export function formatSlot(
  grade: number | null,
  classNo: number | null,
  studentNo: number | null,
) {
  if (grade === null || classNo === null || studentNo === null) return "–";
  return `${grade}학년 ${classNo}반 ${studentNo}번`;
}
