import AttendanceTrendChart from "../charts/AttendanceTrendChart";
import SubjectAttendanceChart from "../charts/SubjectAttendanceChart";

export default function AttendanceCharts({ data }) {

  return (

    <div className="grid grid-cols-2 gap-6">

      <AttendanceTrendChart data={data} />
      <SubjectAttendanceChart data={data} />

    </div>

  );

}