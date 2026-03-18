import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Save } from "lucide-react";

export default function Attendance() {

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");

  const [attendance, setAttendance] = useState({});

  const [stats, setStats] = useState({
    present: 0,
    absent: 0
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjectId) {
      fetchStudentsBySubject(subjectId);
    } else {
      fetchAllStudents();
    }

    // Reset selection when subject changes
    setAttendance({});
    setStats({ present: 0, absent: 0 });
  }, [subjectId]);

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentsBySubject = async (subjectId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/attendance/subject/${subjectId}/students`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      // fallback to all students
      fetchAllStudents();
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = (studentId, status) => {

    setAttendance({
      ...attendance,
      [studentId]: status
    });

    updateStats(studentId, status);
  };

  const updateStats = (studentId, status) => {

    let present = 0;
    let absent = 0;

    const updated = {
      ...attendance,
      [studentId]: status
    };

    Object.values(updated).forEach(s => {
      if (s === "PRESENT") present++;
      if (s === "ABSENT") absent++;
    });

    setStats({ present, absent });
  };

  const submitAttendance = async () => {

    if (!subjectId) {
      alert("Select Subject");
      return;
    }

    if (!date) {
      alert("Select Date");
      return;
    }

    try {
      const requests = Object.keys(attendance).map((studentId) => {
        return axios.post("http://localhost:8080/api/attendance", {
          studentId,
          subjectId,
          date,
          status: attendance[studentId]
        });
      });

      await Promise.all(requests);

      alert("Attendance Saved Successfully");

      setAttendance({});
      setDate("");

      setStats({
        present: 0,
        absent: 0
      });

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Error saving attendance: ${err.response.data.message}`);
      } else {
        alert("Error saving attendance");
      }
    }

  };

  return (

    <div className="min-h-screen space-y-6">

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Attendance Management
      </h1>

      <p className="text-gray-600 mb-4">Record and manage student attendance</p>

      {/* FILTERS */}

      <div className="flex gap-4 mb-6">

        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="border p-3 rounded-xl"
        >

          <option value="">Select Subject</option>

          {subjects.map(sub => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}

        </select>

        <input
          type="date"
          value={date}
          onChange={(e)=>setDate(e.target.value)}
          className="border p-3 rounded-xl"
        />

      </div>

      {/* STATS */}

      <div className="flex gap-6 mb-6">

        <div className="bg-green-100 px-6 py-3 rounded-xl">
          Present: <b>{stats.present}</b>
        </div>

        <div className="bg-red-100 px-6 py-3 rounded-xl">
          Absent: <b>{stats.absent}</b>
        </div>

        <div className="bg-blue-100 px-6 py-3 rounded-xl">
          Total: <b>{students.length}</b>
        </div>

      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >

        <table className="w-full">

          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Roll No</th>
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>

            {students.map(student => (

              <tr key={student.id} className="border-b">

                <td className="p-3">{student.rollNo}</td>
                <td className="p-3">{student.name}</td>

                <td className="p-3 flex gap-3">

                  <button
                    onClick={() => handleStatusChange(student.id, "PRESENT")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                      attendance[student.id] === "PRESENT"
                        ? "bg-green-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    <CheckCircle size={16}/>
                    Present
                  </button>

                  <button
                    onClick={() => handleStatusChange(student.id, "ABSENT")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                      attendance[student.id] === "ABSENT"
                        ? "bg-red-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    <XCircle size={16}/>
                    Absent
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        <div className="mt-6">

          <button
            onClick={submitAttendance}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
          >
            <Save size={18}/>
            Save Attendance
          </button>

        </div>

      </motion.div>

    </div>

  );
}