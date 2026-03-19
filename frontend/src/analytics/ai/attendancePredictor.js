export const predictAttendance = (attendanceHistory) => {

  const avg =
    attendanceHistory.reduce((a,b)=>a+b,0) /
    attendanceHistory.length;

  return avg * 1.02;
};