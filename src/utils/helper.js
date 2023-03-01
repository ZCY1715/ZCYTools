export function formatTime(timeNum) {
  const s = timeNum % 60
  timeNum = Math.floor(timeNum / 60)
  const m = timeNum % 60
  const h = Math.floor(timeNum / 60)
  return `${h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`
}

export function debounce(fn, delay) {
  let timer = null
  let isAbort = false
  function _debounce(...args) {
    if (isAbort) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
  _debounce.abort = () => {
    isAbort = true
    timer && clearTimeout(timer)
  }
  return _debounce
}
