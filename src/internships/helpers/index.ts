export function areInternshipsDatesValid(
  initial: string,
  until: string,
) {
  const initialDate = new Date(initial);
  const untilDate = new Date(until);
  return (
    initialDate.getTime() < untilDate.getTime()
  );
}
