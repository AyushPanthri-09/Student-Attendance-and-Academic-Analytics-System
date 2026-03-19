export default function RiskTable({ data }) {

  return (

    <div className="bg-white p-6 rounded shadow">

      <h2 className="text-lg font-semibold text-red-600 mb-4">
        Students Below 75%
      </h2>

      <table className="w-full border">

        <thead className="bg-gray-100">

          <tr>
            <th className="p-2">Student</th>
            <th className="p-2">Subject</th>
            <th className="p-2">Attendance %</th>
          </tr>

        </thead>

        <tbody>

          {data.map((s, i) => (

            <tr key={i} className="border-t text-center">

              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.subject}</td>

              <td className="p-2 text-red-600">
                {s.percentage.toFixed(2)}%
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}