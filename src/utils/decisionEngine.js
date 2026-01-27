export function generateDecisionInsights({
  emails,
  crm,
  erp,
  news,
  competitors
}) {
  const signals = [
    ...emails.slice(0, 3),
    ...crm.slice(0, 2),
    ...news.slice(0, 3),
    ...competitors.slice(0, 2),
  ];

  return signals.map((s, idx) => ({
    id: idx,
    title: s.subject || s.title || "Strategic Signal Detected",
    confidence: Math.floor(70 + Math.random() * 25),
    impact: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
    recommendation: "CEO attention recommended",
  }));
}
