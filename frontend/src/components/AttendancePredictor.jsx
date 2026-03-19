import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api";

export default function AttendancePredictor(){

  const [studentId,setStudentId]=useState("");
  const [future,setFuture]=useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);

  const predict = async () => {

    if(!studentId || !future){
      alert("Enter Student ID and Future Classes");
      return;
    }

    setLoading(true);

    try{

      const res = await axios.get(
        `${API}/attendance/predict/${studentId}/${future}`
      );

      setResult(res.data);

    }catch(err){

      alert("Prediction failed");

    }

    setLoading(false);
  };

  return(

    <div className="p-6 border rounded mt-8 bg-white shadow">

      <h2 className="text-xl font-bold mb-4">
        AI Attendance Predictor
      </h2>

      <div className="flex gap-4 mb-4">

        <input
          type="number"
          placeholder="Student ID"
          className="border p-2 rounded w-40"
          value={studentId}
          onChange={(e)=>setStudentId(e.target.value)}
        />

        <input
          type="number"
          placeholder="Future Classes Attended"
          className="border p-2 rounded w-56"
          value={future}
          onChange={(e)=>setFuture(e.target.value)}
        />

        <button
          onClick={predict}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Predicting..." : "Predict"}
        </button>

      </div>

      {result && (

        <div className="grid grid-cols-2 gap-6 mt-4">

          <div className="bg-blue-100 p-4 rounded text-center">

            <h3 className="font-bold">
              Predicted Attendance
            </h3>

            <p className="text-2xl font-bold">
              {result.predictedPercentage.toFixed(2)}%
            </p>

          </div>

          <div className={`p-4 rounded text-center ${
            result.examEligible ? "bg-green-100" : "bg-red-100"
          }`}>

            <h3 className="font-bold">
              Exam Eligibility
            </h3>

            <p className="text-2xl font-bold">

              {result.examEligible
                ? "Eligible"
                : "Not Eligible"}

            </p>

          </div>

        </div>

      )}

    </div>
  );
}