const sources = [
  { name: "Email Server", status: "Connected" },
  { name: "Salesforce CRM", status: "Connected" },
  { name: "ERP System", status: "Connected" },
  { name: "HR Platform", status: "Connected" },
  { name: "News Feeds", status: "Connected" },
  { name: "+ Add Connector", status: "Configure" },
];

export default function SourceStatus() {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold mb-3">Data Sources</h2>
      <ul className="space-y-2">
        {sources.map((s, i) => (
          <li key={i} className="flex justify-between">
            <span>{s.name}</span>
            <span className="text-green-600">{s.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
