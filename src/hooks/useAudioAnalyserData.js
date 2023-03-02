import { ref, onMounted } from 'vue'

// el : ref(HTMLElement)
export default function (el) {

  const audCtx = new AudioContext()
  const analyser = audCtx.createAnalyser()
  analyser.fftSize = 512
  const dataArray = ref(new Uint8Array(analyser.frequencyBinCount))
  analyser.connect(audCtx.destination)

  onMounted(() => {
    const source = audCtx.createMediaElementSource(el.value)
    source.connect(analyser)
  })

  const updateDataArray = () => {
    analyser.getByteFrequencyData(dataArray.value)
  }

  return { dataArray, updateDataArray }

}