export function predictDropout(student) {

  const score =
    student.attendance * 0.5 +
    student.assignments * 0.3 +
    student.examScore * 0.2;

  if (score < 40) return "HIGH";
  if (score < 65) return "MEDIUM";

  return "LOW";

}