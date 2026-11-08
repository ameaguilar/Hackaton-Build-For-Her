export const moodOptions = ["Bien", "Tranquilo", "Cansado", "Bajo"];
export function moodLabel(value: string) {
  const legacy: Record<string, string> = {
    "☺": "Bien",
    "🙂": "Bien",
    "•‿•": "Tranquilo",
    "•︵•": "Bajo",
  };
  return legacy[value] ?? value;
}
