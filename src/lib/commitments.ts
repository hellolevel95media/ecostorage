export interface Commitment {
  title: string;
  text: string;
}

export function parseCommitments(body?: string | null): { intro: string; points: Commitment[] } {
  const lines = (body ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const intro = lines.filter((l) => !l.startsWith("- ")).join(" ");
  const points = lines
    .filter((l) => l.startsWith("- "))
    .map((l) => {
      const text = l.slice(2);
      const i = text.indexOf(": ");
      return i > 0 ? { title: text.slice(0, i), text: text.slice(i + 2) } : { title: "", text };
    });
  return { intro, points };
}

export function serializeCommitments(intro: string, points: Commitment[]): string {
  const cleaned = points
    .map((p) => ({ title: p.title.replace(/\s+/g, " ").replace(/:/g, " -").replace(/\s+/g, " ").trim(), text: p.text.replace(/\s+/g, " ").trim() }))
    .filter((p) => p.text);
  const lines = cleaned.map((p) => (p.title ? `- ${p.title}: ${p.text}` : `- ${p.text}`));
  return [intro.replace(/\s+/g, " ").trim(), ...lines].filter(Boolean).join("\n");
}
