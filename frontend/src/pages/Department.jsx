import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import analyticsService from "../services/analyticsService";
import { emitAnalyticsDataChanged } from "../utils/analyticsSync";

export default function Departments() {

    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    const fetchDepartments = async () => {
        try {
            const res = await axios.get("/api/departments");
            setDepartments(res.data);
        } catch {
            toast.error("Failed to load departments");
        }
    };

    const addDepartment = async () => {
        if (!name.trim()) {
            toast.error("Department name is required");
            return;
        }

        try {
            await axios.post("/api/departments", {
                name: name.trim(),
                code: code.trim() || null,
            });
            analyticsService.clearCache();
            emitAnalyticsDataChanged('departments-create');
            setName("");
            setCode("");
            toast.success("Department added");
            fetchDepartments();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to add department");
        }
    };

    const deleteDepartment = async (id) => {
        if (!window.confirm("Delete this department?")) {
            return;
        }

        try {
            await axios.delete(`/api/departments/${id}`);
            analyticsService.clearCache();
            emitAnalyticsDataChanged('departments-delete');
            toast.success("Department deleted");
            fetchDepartments();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Department cannot be deleted");
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-6">Departments</h1>

            <div className="mb-4">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Department Name"
                    className="border p-2 mr-2"
                />
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Department Code (optional)"
                    className="border p-2 mr-2"
                />
                <button
                    onClick={addDepartment}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Add
                </button>
            </div>

            {departments.map(dep => (
                <div key={dep.id} className="bg-white p-4 mb-2 shadow rounded flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{dep.name}</p>
                        <p className="text-xs text-gray-500">{dep.code || "No code"}</p>
                    </div>
                    <button
                        onClick={() => deleteDepartment(dep.id)}
                        className="bg-rose-600 text-white px-3 py-1 rounded text-sm"
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}