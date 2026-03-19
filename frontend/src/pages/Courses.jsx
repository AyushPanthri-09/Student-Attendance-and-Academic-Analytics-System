import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, BookOpen, Search, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function Courses() {

  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [newCourse, setNewCourse] = useState({
    name: "",
    duration: ""
  });

  // Fetch courses
 const fetchCourses = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/courses");
    setCourses(res.data);
  } catch (error) {
    toast.error("Failed to load courses");
  }
};

  // Fetch faculty
  const fetchFaculty = () => {
    axios.get("http://localhost:8080/api/faculty")
      .then(res => setFacultyList(res.data));
  };

  useEffect(() => {
    fetchCourses();
    fetchFaculty();
  }, []);

const handleSave = async () => {

  try {

    setSaving(true);

    await axios.post("http://localhost:8080/api/courses", newCourse);

    toast.success("Course created successfully 🎉");

    setShowModal(false);
    setNewCourse({ name: "", duration: "" });

    fetchCourses();

  } catch (error) {

    toast.error("Failed to create course ❌");

  } finally {

    setSaving(false);

  }

};

const handleAssign = async () => {

  if (!selectedFacultyId) {
    toast.error("Please select a faculty");
    return;
  }

  try {

    setAssigning(true);

    await axios.put(
      `http://localhost:8080/api/courses/${selectedCourseId}/assign-faculty/${selectedFacultyId}`
    );

    toast.success("Faculty assigned successfully 👨‍🏫");

    setAssignModal(false);
    setSelectedFacultyId("");

    fetchCourses();

  } catch (error) {

    toast.error("Failed to assign faculty ❌");

  } finally {

    setAssigning(false);

  }

};

const filteredCourses = courses.filter(course =>
  course.name?.toLowerCase().includes(searchTerm.toLowerCase())
);

  return (
    <div className="min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Courses Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage academic courses and faculty assignments
          </p>
        </div>

        <div className="flex items-center gap-4">

          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl shadow hover:bg-purple-700 transition"
          >
            <Plus size={18} />
            Add Course
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">

        {filteredCourses.length === 0 ? (
          <div className="p-16 text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">
              No Courses Available
            </h2>
          </div>
        ) : (
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm text-gray-500">ID</th>
                <th className="p-4 text-sm text-gray-500">Name</th>
                <th className="p-4 text-sm text-gray-500">Duration</th>
                <th className="p-4 text-sm text-gray-500 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCourses.map(course => (
                <motion.tr
                  key={course.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4">{course.id}</td>
                  <td className="p-4">{course.name}</td>
                  <td className="p-4">{course.duration}</td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setAssignModal(true);
                      }}
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                    >
                      <UserPlus size={16} />
                      Assign Faculty
                    </button>
                  </td>

                </motion.tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

      {/* Assign Faculty Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white p-8 rounded-2xl w-96 shadow-2xl"
          >
            <h2 className="text-xl font-semibold mb-6">
              Assign Faculty
            </h2>

            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full p-3 border rounded-lg mb-6 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select Faculty</option>
              {facultyList.map(faculty => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name} ({faculty.department})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setAssignModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleAssign}
                disabled={assigning}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-60"
              >
                {assigning ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Assigning...
                  </>
                ) : (
                  "Assign"
                )}
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* Add Course Modal */}
{showModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">

    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="bg-white p-8 rounded-2xl w-96 shadow-2xl"
    >

      <h2 className="text-xl font-semibold mb-6">
        Add New Course
      </h2>

      <input
        type="text"
        placeholder="Course Name"
        value={newCourse.name}
        onChange={(e) =>
          setNewCourse({ ...newCourse, name: e.target.value })
        }
        className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
      />

      <input
        type="text"
        placeholder="Duration (eg: 6 Months)"
        value={newCourse.duration}
        onChange={(e) =>
          setNewCourse({ ...newCourse, duration: e.target.value })
        }
        className="w-full p-3 border rounded-lg mb-6 focus:ring-2 focus:ring-purple-500 outline-none"
      />

      <div className="flex justify-end gap-4">

        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white flex items-center gap-2 disabled:opacity-60"
        >

          {saving ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Saving...
            </>
          ) : (
            "Save Course"
          )}

        </button>

      </div>

    </motion.div>

  </div>
)}

    </div>
  );
}