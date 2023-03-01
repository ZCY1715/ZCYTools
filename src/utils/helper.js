export function formatTime(timeNum) {
  const s = timeNum % 60
  timeNum = Math.floor(timeNum / 60)
  const m = timeNum % 60
  const h = Math.floor(timeNum / 60)
  return `${h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`
}