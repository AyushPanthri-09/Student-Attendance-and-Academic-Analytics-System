import { useEffect, useState } from "react";
import axios from "axios";

export default function Faculty() {

    const [facultyList, setFacultyList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [faculty, setFaculty] = useState({
        name: ""
    });

    const fetchFaculty = () => {
        axios.get("http://localhost:8080/api/faculty")
            .then(res => setFacultyList(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleSave = () => {

        if (editMode) {
            axios.put(`http://localhost:8080/api/faculty/${currentId}`, faculty)
                .then(() => {
                    resetForm();
                    fetchFaculty();
                });
        } else {
            axios.post("http://localhost:8080/api/faculty", faculty)
                .then(() => {
                    resetForm();
                    fetchFaculty();
                });
        }
    };

    const handleEdit = (item) => {
        setFaculty({ name: item.name });
        setCurrentId(item.id);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this faculty?")) {
            axios.delete(`http://localhost:8080/api/faculty/${id}`)
                .then(() => fetchFaculty());
        }
    };

    const resetForm = () => {
        setShowModal(false);
        setEditMode(false);
        setFaculty({ name: "" });
        setCurrentId(null);
    };

    const filteredFaculty = facultyList.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="ml-64 min-h-screen bg-gray-100 p-10">

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-700">
                        Faculty Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage faculty members
                    </p>
                </div>

                <div className="flex items-center gap-4">

                    <input
                        type="text"
                        placeholder="Search faculty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 w-72 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-purple-600 text-white px-5 py-2 rounded-lg shadow hover:bg-purple-700 transition">
                        + Add Faculty
                    </button>

                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 text-sm text-gray-600">ID</th>
                        <th className="p-4 text-sm text-gray-600">Name</th>
                        <th className="p-4 text-sm text-gray-600 text-center">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredFaculty.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{item.id}</td>
                            <td className="p-4">{item.name}</td>

                            <td className="p-4 text-center space-x-3">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}

                    {filteredFaculty.length === 0 && (
                        <tr>
                            <td colSpan="3" className="text-center p-6 text-gray-500">
                                No faculty found.
                            </td>
                        </tr>
                    )}

                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

                    <div className="bg-white p-8 rounded-2xl w-96 shadow-2xl">

                        <h2 className="text-xl font-semibold mb-6">
                            {editMode ? "Edit Faculty" : "Add New Faculty"}
                        </h2>

                        <input
                            type="text"
                            placeholder="Faculty Name"
                            value={faculty.name}
                            onChange={(e) =>
                                setFaculty({ name: e.target.value })
                            }
                            className="w-full p-3 border rounded mb-6 focus:ring-2 focus:ring-purple-500 outline-none"
                        />

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">
                                {editMode ? "Update" : "Save"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}