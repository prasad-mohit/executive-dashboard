export default function CEOSwitch() {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
      <span className="font-semibold">CEO Automation Mode</span>
      <select className="border rounded px-2 py-1">
        <option>Observe</option>
        <option>Recommend</option>
        <option>Execute</option>
      </select>
    </div>
  );
}
