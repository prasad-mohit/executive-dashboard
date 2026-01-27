export default function RecommendedActions() {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">
        ✅ Recommended Actions
      </h3>

      <ul className="space-y-3 text-sm">
        <li className="p-3 border rounded flex justify-between items-center">
          <div>
            <strong>Call with Sales Head</strong>
            <div className="text-gray-500">
              Address delayed high-value deals
            </div>
          </div>
          <span className="text-green-600 font-semibold">High Priority</span>
        </li>

        <li className="p-3 border rounded flex justify-between items-center">
          <div>
            <strong>Competitive Response Strategy</strong>
            <div className="text-gray-500">
              Adjust positioning post competitor funding
            </div>
          </div>
          <span className="text-yellow-600 font-semibold">Medium</span>
        </li>

        <li className="p-3 border rounded flex justify-between items-center">
          <div>
            <strong>Board Update Draft</strong>
            <div className="text-gray-500">
              Proactive risk communication
            </div>
          </div>
          <span className="text-blue-600 font-semibold">Optional</span>
        </li>
      </ul>
    </div>
  );
}
