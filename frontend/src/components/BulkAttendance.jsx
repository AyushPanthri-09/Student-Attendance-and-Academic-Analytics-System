import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api";

export default function BulkAttendance() {

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");

  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const res = await axios.get(`${API}/courses`);
    setCourses(res.data);
  };

  const loadStudents = async (courseId) => {
    const res = await axios.get(`${API}/students/course/${courseId}`);
    setStudents(res.data);
  };

  const loadSubjects = async (courseId) => {
    const res = await axios.get(`${API}/subjects/course/${courseId}`);
    setSubjects(res.data);
  };

  const handleCourseChange = (id) => {
    setCourseId(id);
    loadStudents(id);
    loadSubjects(id);
  };

  const markStatus = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status
    });
  };

  const saveAttendance = async () => {

    const records = students.map(s => ({
      student: { id: s.id },
      subject: { id: subjectId },
      date,
      status: attendance[s.id] || "ABSENT"
    }));

    await axios.post(`${API}/attendance/bulk`, records);

    alert("Attendance Saved");
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Bulk Attendance
      </h1>

      {/* Filters */}

      <div className="grid grid-cols-3 gap-4 mb-6">

        <select
          className="border p-2"
          onChange={(e) => handleCourseChange(e.target.value)}
        >
          <option>Select Course</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="border p-2"
          onChange={(e) => setSubjectId(e.target.value)}
        >
          <option>Select Subject</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2"
          onChange={(e) => setDate(e.target.value)}
        />

      </div>

      {/* Students Table */}

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Student</th>
            <th className="p-2">Present</th>
            <th className="p-2">Absent</th>
          </tr>
        </thead>

        <tbody>

          {students.map(s => (

            <tr key={s.id} className="text-center border-t">

              <td className="p-2">{s.name}</td>

              <td>

                <input
                  type="radio"
                  name={`att-${s.id}`}
                  onChange={() => markStatus(s.id, "PRESENT")}
                />

              </td>

              <td>

                <input
                  type="radio"
                  name={`att-${s.id}`}
                  onChange={() => markStatus(s.id, "ABSENT")}
                />

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <button
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
        onClick={saveAttendance}
      >
        Save Attendance
      </button>

    </div>
  );
}