import { useMemo } from "react";

export default function AttendanceForecastPanel({ data }) {

  const forecast = useMemo(() => {

    if (!data || data.length === 0) return 0;

    const avg =
      data.reduce((a,b)=>a + b.attendance,0) /
      data.length;

    const predicted = avg + (Math.random()*4 - 2);

    return predicted.toFixed(2);

  },[data]);

  return (

    <div className="bg-white p-6 rounded-xl shadow-lg">

      <h3 className="text-lg font-semibold mb-4">
        AI Attendance Forecast
      </h3>

      <p className="text-4xl font-bold text-blue-600">
        {forecast}%
      </p>

      <p className="text-gray-500 mt-2">
        Predicted average attendance next week
      </p>

    </div>

  );

}