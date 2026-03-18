import { Bar } from "react-chartjs-2";

const DepartmentComparison = ({ data }) => {

  const departments = ["CSE","ECE","ME","CE"];

  const values = departments.map(dep =>
    data.filter(s => s.department === dep)
        .reduce((a,b)=>a + b.attendance,0) /
    (data.filter(s => s.department === dep).length || 1)
  );

  const chartData = {
    labels: departments,
    datasets: [
      {
        label: "Average Attendance",
        data: values
      }
    ]
  };

  return <Bar data={chartData} />;
};

export default DepartmentComparison;