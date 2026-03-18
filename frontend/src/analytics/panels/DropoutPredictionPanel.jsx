export default function DropoutPredictionPanel({ data }) {

  const highRisk =
    data.filter(s => s.attendance < 50).length;

  const mediumRisk =
    data.filter(s => s.attendance >= 50 && s.attendance < 75).length;

  const safe =
    data.filter(s => s.attendance >= 75).length;

  return (

    <div className="bg-white p-6 rounded-xl shadow-lg">

      <h3 className="text-lg font-semibold mb-4">
        AI Dropout Prediction
      </h3>

      <div className="grid grid-cols-3 gap-4 text-center">

        <div>
          <p className="text-3xl font-bold text-red-600">
            {highRisk}
          </p>
          <p className="text-sm">High Risk</p>
        </div>

        <div>
          <p className="text-3xl font-bold text-yellow-500">
            {mediumRisk}
          </p>
          <p className="text-sm">Medium Risk</p>
        </div>

        <div>
          <p className="text-3xl font-bold text-green-600">
            {safe}
          </p>
          <p className="text-sm">Safe</p>
        </div>

      </div>

    </div>

  );

}