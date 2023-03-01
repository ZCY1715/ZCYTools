<template>
  <div ref="containerRef" :class="$style.container" tabindex="0" @focus="showVolume = false">
    <audio ref="audioRef" style="display: none;"></audio>
    <div :class="$style.main">
      <canvas ref="canvasRef" :class="$style.canvas"></canvas>
      <span :class="$style.title">
        <q-icon name="queue_music" color="amber" size="25px" />
        <span :class="$style.rollText">
          <span>{{ title }}</span>
        </span>
      </span>
    </div>
    <div :class="$style.controller">
      <div :class="$style.progress">
        <q-slider :model-value="currentTime" @update:model-value="progressChange" color="amber" thumb-color="orange"
          :min="0" :max="duration" :class="$style.slider" dark />
        <span :class="$style.displayTime">{{ formatTime(Math.floor(currentTime)) }} / {{ formatTime(duration) }}</span>
      </div>
      <div :class="$style.warp">
        <div :class="$style.left" ref="openFileRef">
          <q-icon name="post_add" size="35px" color="amber" />
        </div>
        <div :class="$style.middle" @click="onClick">
          <q-icon :name="isActive ? 'pause_circle' : 'play_circle'" size="70px" color="amber" />
        </div>
        <div :class="$style.right" tabindex="0" @focus="showVolume = true">
          <q-icon :name="volume === 0 ? 'volume_off' : 'volume_up'" size="35px" color="amber" />
          <q-slider v-show="showVolume" :class="$style.volumeControl" v-model="volume" :min="0" :max="100" color="amber"
            vertical reverse dark :label-value="volume" label />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import Uploader from 'src/utils/Uploader'
import { Loading, Notify } from 'quasar'
import { formatTime } from 'src/utils/helper'


const isActive = ref(false)
const title = ref("")
const musicURLs = ref([])
const duration = ref(0)
const currentTime = ref(0)

function loadMusic(music) {
  Loading.show()

  isActive.value = false
  const url = window.URL.createObjectURL(music)

  const newAudio = new Audio(url)

  const onSuccess = () => {
    title.value = music.name
    duration.value = 0
    audioRef.value.src = url
    musicURLs.value.push(url)

    audioRef.value.addEventListener("loadedmetadata", () => {
      duration.value = Math.floor(audioRef.value.duration)
      Loading.hide()
      Notify.create({
        type: "positive",
        message: "加载成功!",
      })

    }, { once: true })

  }

  const onFail = () => {
    Loading.hide()
    Notify.create({
      type: "negative",
      message: "文件类型不支持!",
    })
  }

  newAudio.addEventListener("loadeddata", onSuccess, { once: true })
  newAudio.addEventListener("error", onFail, { once: true })

}

onUnmounted(() => {
  musicURLs.value.forEach(url => {
    window.URL.revokeObjectURL(url)
  })
  musicURLs.value = []
})

const audioRef = ref(null)
const volume = ref(60)
const showVolume = ref(false)

const setVolume = () => {
  audioRef.value.volume = volume.value / 100
}

watch(volume, setVolume)

const analyserRef = ref(null)
const dataArray = ref(null)
const containerRef = ref(null)
const openFileRef = ref(null)

onMounted(() => {

  const audCtx = new AudioContext()
  const source = audCtx.createMediaElementSource(audioRef.value)
  const analyser = audCtx.createAnalyser()
  analyser.fftSize = 512
  dataArray.value = new Uint8Array(analyser.frequencyBinCount)
  source.connect(analyser)
  analyser.connect(audCtx.destination)
  analyserRef.value = analyser

  new Uploader({ el: containerRef.value, mode: "Drag" }, fileList => {
    const music = fileList[0].file
    loadMusic(music)
  })

  new Uploader({ el: openFileRef.value, mode: "Click", pattern: "SingleFile" }, ({ file: music }) => {
    loadMusic(music)
  })

  audioRef.value.addEventListener("timeupdate", () => {
    currentTime.value = audioRef.value.currentTime
  })

  audioRef.value.addEventListener("ended", () => {
    currentTime.value = 0
    isActive.value = false
  })

  setVolume()

})

const canvasRef = ref(null)
const timer = ref(null)
function draw() {
  timer.value = requestAnimationFrame(draw)

  /** @type { HTMLCanvasElement } */
  const canvas = canvasRef.value
  const ctx = canvas.getContext("2d")
  const { width, height } = canvas

  ctx.clearRect(0, 0, width, height)
  analyserRef.value.getByteFrequencyData(dataArray.value)

  const len = dataArray.value.length / 2.5
  const barWidth = width / len / 2
  ctx.fillStyle = '#78C5F7'
  for (let i = 0; i < len; i++) {
    const data = dataArray.value[i]
    const barHeight = data / 255 * height
    const x1 = i * barWidth + width / 2
    const x2 = width / 2 - (i + 1) * barWidth
    const y = height - barHeight
    ctx.fillRect(x1, y, barWidth - 2, barHeight)
    ctx.fillRect(x2, y, barWidth - 2, barHeight)
  }

}


watch(isActive, () => {
  if (isActive.value) {
    audioRef.value.play()
    draw()
  } else {
    audioRef.value.pause()
    cancelAnimationFrame(timer.value)
  }
}, { flush: "post" })

const onClick = () => {
  if (!audioRef.value.src) {
    Notify.create({
      type: "info",
      message: "请导入音乐！"
    })
    return
  }
  isActive.value = !isActive.value
}

const progressChange = v => {
  currentTime.value = v
  audioRef.value.currentTime = v
}

</script>

<style module>
.container {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(ellipse closest-side at center, rgb(14, 10, 88), rgb(34, 34, 34));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main {
  flex: 3;
  width: 100%;
  position: relative;
}

.canvas {
  width: 100%;
  height: 100%;
}

.title {
  position: absolute;
  display: inline-flex;
  align-items: center;
  z-index: 1;
  left: 10px;
  top: 10px;
  width: 120px;
  height: 30px;
}

@keyframes revolve {
  0% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(180deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.title> :first-child {
  animation: revolve 3s infinite linear;
  background-color: #000;
  border-radius: 50%;
}

@keyframes roll {
  0% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(-100%);
  }
}

.rollText {
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
}

.rollText> :first-child {
  width: 100%;
  display: inline-block;
  color: orange;
  white-space: nowrap;
  user-select: none;
  animation: roll 10s infinite linear normal;
}

.controller {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
}

.warp {
  width: 80%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}

.left,
.right,
.middle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background-color: #0006;
}

.left,
.right {
  width: 50px;
  height: 50px;
  position: relative;
}

.middle {
  width: 80px;
  height: 80px;

}

.progress {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 28px;
}

.slider {
  transform: translateY(-14px);
  width: 98%;
}

.displayTime {
  color: #aaa;
  position: absolute;
  right: 20px;
  top: 10px;
}

.volumeControl {
  position: absolute;
  bottom: 50px;
  height: 100px;
}
</style>