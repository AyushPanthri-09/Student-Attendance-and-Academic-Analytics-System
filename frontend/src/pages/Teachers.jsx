import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Plus, Search, Trash } from "lucide-react";

export default function Teachers() {

  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newTeacher, setNewTeacher] = useState({
    name: "",
    department: ""
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/faculty");
      setTeachers(res.data);
    } catch {
      toast.error("Failed to load teachers");
    }
  };

  const addTeacher = async () => {
    if (!newTeacher.name) {
      toast.error("Teacher name required");
      return;
    }

    try {
      setSaving(true);

      await axios.post("http://localhost:8080/api/faculty", {
        name: newTeacher.name
      });

      toast.success("Teacher added");

      setNewTeacher({ name: "", department: "" });
      setShowModal(false);
      fetchTeachers();

    } catch {
      toast.error("Error adding teacher");
    } finally {
      setSaving(false);
    }
  };

  const deleteTeacher = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/faculty/${id}`);
      toast.success("Teacher deleted");
      fetchTeachers();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Teachers Management
          </h1>
        </div>

        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400"/>
            <input
              type="text"
              placeholder="Search teachers..."
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
            Add Teacher
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Department</th>
              <th className="p-4 text-left">Courses</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredTeachers.map(t => (

              <motion.tr
                key={t.id}
                initial={{opacity:0,y:10}}
                animate={{opacity:1,y:0}}
                className="border-t hover:bg-gray-50"
              >

                <td className="p-4 font-medium">
                  {t.name}
                </td>

                <td className="p-4">
                  {t.department || "—"}
                </td>

                <td className="p-4 text-sm text-gray-500">
                  {t.courses?.join(", ") || "None"}
                </td>

                <td className="p-4 text-right">

                  <button
                    onClick={()=>deleteTeacher(t.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={18}/>
                  </button>

                </td>

              </motion.tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ADD TEACHER MODAL */}

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white rounded-2xl p-8 w-96 shadow-xl">

            <h2 className="text-xl font-bold mb-6">
              Add Teacher
            </h2>

            <input
              placeholder="Teacher Name"
              value={newTeacher.name}
              onChange={(e)=>setNewTeacher({...newTeacher,name:e.target.value})}
              className="w-full border rounded-lg px-4 py-2 mb-4"
            />

            <div className="flex justify-end gap-4">

              <button
                onClick={()=>setShowModal(false)}
                className="px-4 py-2 text-gray-500"
              >
                Cancel
              </button>

              <button
                onClick={addTeacher}
                disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                {saving ? "Saving..." : "Add Teacher"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}