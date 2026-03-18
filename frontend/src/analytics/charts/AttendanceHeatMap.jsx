import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

export default function AttendanceHeatmap({ data }) {

  return (

    <div className="bg-white p-6 rounded-xl shadow-lg">

      <h3 className="text-lg font-semibold mb-4">
        Attendance Heatmap
      </h3>

      <CalendarHeatmap
        startDate={new Date("2025-01-01")}
        endDate={new Date("2025-12-31")}
        values={data}
      />

    </div>

  );

}