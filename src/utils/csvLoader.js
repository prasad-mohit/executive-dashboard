export async function loadCSV(path) {
  const res = await fetch(path);
  const text = await res.text();

  const [header, ...rows] = text.trim().split("\n");
  const keys = header.split(",");

  return rows.map(row => {
    const values = row.split(",");
    return Object.fromEntries(
      keys.map((k, i) => [k.trim(), values[i]?.trim()])
    );
  });
}
