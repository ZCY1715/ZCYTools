
export default function (stream, type, { onStart, onPause, onResume, onStop }) {

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=h264'
  })

  let isActive = false
  const data = []

  mediaRecorder.ondataavailable = (e) => {
    data.push(e.data)
  }

  const controller = {
    start: () => {
      mediaRecorder.start()
      isActive = true
    },
    pause: () => mediaRecorder.pause(),
    resume: () => mediaRecorder.resume(),
    stop: () => {
      if (isActive) {
        mediaRecorder.stop()
        isActive = false
      }
    }
  }

  onStart && (mediaRecorder.onstart = onStart)
  onPause && (mediaRecorder.onpause = onPause)
  onResume && (mediaRecorder.onresume = onResume)
  onStop && (mediaRecorder.onstop = () => onStop(new Blob(data, { type: type ?? mediaRecorder.mimeType })))

  return controller

}