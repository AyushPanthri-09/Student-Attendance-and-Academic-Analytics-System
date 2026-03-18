import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Users, Eye } from "lucide-react";

export default function Students() {

  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  const [newStudent, setNewStudent] = useState({
    rollNo: "",
    name: ""
  });

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/students");
      setStudents(res.data);
    } catch {
      toast.error("Failed to load students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSaveStudent = async () => {

    if (!newStudent.rollNo || !newStudent.name) {
      toast.error("All fields required");
      return;
    }

    try {

      setSaving(true);

      if (editMode) {

        await axios.put(
          `http://localhost:8080/api/students/${currentStudentId}`,
          newStudent
        );

        toast.success("Student updated");

      } else {

        await axios.post(
          "http://localhost:8080/api/students",
          newStudent
        );

        toast.success("Student added");

      }

      resetForm();
      fetchStudents();

    } catch {

      toast.error("Operation failed");

    } finally {

      setSaving(false);

    }
  };

  const handleViewAttendance = (studentId) => {
    navigate(`/student-attendance/${studentId}`);
  };

  const handleEdit = (student) => {

    setNewStudent({
      rollNo: student.rollNo,
      name: student.name
    });

    setCurrentStudentId(student.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this student?")) return;

    try {

      await axios.delete(`http://localhost:8080/api/students/${id}`);

      toast.success("Student deleted");

      fetchStudents();

    } catch {

      toast.error("Delete failed");

    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setNewStudent({ rollNo: "", name: "" });
    setCurrentStudentId(null);
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Students Management
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Manage and monitor student records
          </p>
        </div>

        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <div className="relative">

            <Search size={18} className="absolute left-3 top-3 text-gray-400"/>

            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />

          </div>

          {/* ADD BUTTON */}
          <button
            onClick={()=>setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition"
          >
            <Plus size={18}/>
            Add Student
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">

        {filteredStudents.length === 0 ? (

          <div className="p-16 text-center">

            <Users size={48} className="mx-auto text-gray-300 mb-4"/>

            <h2 className="text-xl font-semibold text-gray-700">
              No Students Found
            </h2>

          </div>

        ) : (

          <table className="min-w-full text-left">

            <thead className="bg-gray-50 border-b">

              <tr>
                <th className="p-4 text-sm text-gray-500">ID</th>
                <th className="p-4 text-sm text-gray-500">Roll No</th>
                <th className="p-4 text-sm text-gray-500">Name</th>
                <th className="p-4 text-sm text-gray-500 text-center">Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredStudents.map(student => (

                <motion.tr
                  key={student.id}
                  initial={{opacity:0,y:5}}
                  animate={{opacity:1,y:0}}
                  className="border-b hover:bg-gray-50 transition"
                >

                  <td className="p-4">{student.id}</td>
                  <td className="p-4">{student.rollNo}</td>
                  <td className="p-4">{student.name}</td>

                  <td className="p-4 text-center space-x-3">

                    <button
                      onClick={()=>handleViewAttendance(student.id)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Eye size={16}/>
                      View Attendance
                    </button>

                    <button
                      onClick={()=>handleEdit(student)}
                      className="inline-flex items-center gap-1 text-yellow-600 hover:text-yellow-700"
                    >
                      <Pencil size={16}/>
                      Edit
                    </button>

                    <button
                      onClick={()=>handleDelete(student.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16}/>
                      Delete
                    </button>

                  </td>

                </motion.tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

      {/* MODAL */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">

          <motion.div
            initial={{scale:0.9}}
            animate={{scale:1}}
            className="bg-white p-8 rounded-2xl w-96 shadow-2xl"
          >

            <h2 className="text-xl font-semibold mb-6">
              {editMode ? "Edit Student" : "Add Student"}
            </h2>

            <input
              placeholder="Roll Number"
              value={newStudent.rollNo}
              onChange={(e)=>setNewStudent({...newStudent,rollNo:e.target.value})}
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              placeholder="Student Name"
              value={newStudent.name}
              onChange={(e)=>setNewStudent({...newStudent,name:e.target.value})}
              className="w-full p-3 border rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <div className="flex justify-end gap-4">

              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveStudent}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
              >

                {saving ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </>
                ) : (
                  editMode ? "Update" : "Save"
                )}

              </button>

            </div>

          </motion.div>

        </div>

      )}

    </div>
  );
}