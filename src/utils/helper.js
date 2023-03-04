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

export function download(filename, blob) {
  const a = document.createElement("a")
  const objUrl = URL.createObjectURL(blob)
  a.href = objUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(objUrl)
  a.remove()
}


export function mergeStream(sysStream, micStream) {
  if (!sysStream.getAudioTracks().length) {
    sysStream.addTrack(micStream.getAudioTracks()[0])
    return sysStream
  }
  const context = new AudioContext();
  const baseSource = context.createMediaStreamSource(sysStream)
  const extraSource = context.createMediaStreamSource(micStream)
  const dest = context.createMediaStreamDestination()

  const baseGain = context.createGain()
  const extraGain = context.createGain()
  baseGain.gain.value = 0.8
  extraGain.gain.value = 0.8
  baseSource.connect(baseGain).connect(dest)
  extraSource.connect(extraGain).connect(dest)
  return dest.stream
}