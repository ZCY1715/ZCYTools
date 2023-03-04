

export default function (stream, { onStart, onPause, onResume, onStop }) {

  const mediaRecorder = new MediaRecorder(stream)

  const data = []

  mediaRecorder.ondataavailable = (e) => {
    data.push(e.data)
  }

  const controller = {
    start: () => mediaRecorder.start(),
    pause: () => mediaRecorder.pause(),
    resume: () => mediaRecorder.resume(),
    stop: () => mediaRecorder.stop()
  }

  onStart && (mediaRecorder.onstart = onStart)
  onPause && (mediaRecorder.onpause = onPause)
  onResume && (mediaRecorder.onresume = onResume)
  onStop && (mediaRecorder.onstop = () => onStop(new Blob(data, { type: mediaRecorder.mimeType })))

  return controller

}