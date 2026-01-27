export default function AttentionList({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        No attention items detected
      </div>
    );
  }

  return (
    <ul className="space-y-3 text-sm">
      {items.slice(0, 5).map((item, idx) => (
        <li
          key={idx}
          className={`p-3 rounded border ${
            item.severity === "high"
              ? "bg-red-50 border-red-200"
              : item.severity === "medium"
              ? "bg-yellow-50 border-yellow-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          {item.title}
        </li>
      ))}
    </ul>
  );
}
