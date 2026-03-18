import { useEffect, useState } from "react";
import axios from "axios";

export default function Departments() {

    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState("");

    const fetchDepartments = async () => {
        const res = await axios.get("http://localhost:8080/api/departments");
        setDepartments(res.data);
    };

    const addDepartment = async () => {
        await axios.post("http://localhost:8080/api/departments", { name });
        setName("");
        fetchDepartments();
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    return (
        <div className="ml-64 p-8">
            <h1 className="text-2xl font-bold mb-6">Departments</h1>

            <div className="mb-4">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Department Name"
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
                <div key={dep.id} className="bg-white p-4 mb-2 shadow rounded">
                    {dep.name}
                </div>
            ))}
        </div>
    );
}