import { useEffect, useState } from "react"
import axios from "axios"
import { Plus, Trash2 } from "lucide-react"

export default function Subjects() {

  const [subjects,setSubjects] = useState([])
  const [name,setName] = useState("")

  const API = "http://localhost:8080/api/subjects"

  const fetchSubjects = async () => {
    const res = await axios.get(API)
    setSubjects(res.data)
  }

  useEffect(()=>{
    fetchSubjects()
  },[])

  const addSubject = async () => {

    if(!name) return

    await axios.post(API,{
      name
    })

    setName("")
    fetchSubjects()
  }

  const deleteSubject = async(id) => {

    await axios.delete(`${API}/${id}`)
    fetchSubjects()

  }

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Subjects
      </h1>

      {/* Add Subject */}

      <div className="flex gap-3 mb-6">

        <input
          type="text"
          placeholder="Subject Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="border p-2 rounded w-64"
        />

        <button
          onClick={addSubject}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          <Plus size={18}/> Add
        </button>

      </div>


      {/* Subjects List */}

      <table className="w-full border">

        <thead className="bg-gray-100">

          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Action</th>
          </tr>

        </thead>

        <tbody>

          {subjects.map(s => (

            <tr key={s.id}>

              <td className="p-2 border">{s.id}</td>
              <td className="p-2 border">{s.name}</td>

              <td className="p-2 border">

                <button
                  onClick={()=>deleteSubject(s.id)}
                  className="text-red-500"
                >
                  <Trash2 size={18}/>
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}