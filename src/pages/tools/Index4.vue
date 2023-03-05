<template>
  <div :class="$style.container">
    <video :class="$style.showVideo" ref="videoRef" v-if="canUsed" />
    <span :class="$style.takeShot" @click="shot" v-show="!isShot">
      <q-icon name="add_a_photo" size="30px" color="white" />
      <q-circular-progress v-if="index4.isDelay" :value="progress" size="50px" :thickness="0.15" color="orange"
        track-color="grey-3" :class="$style.progress" animation-speed="100" />
    </span>
    <q-select color="white" :class="$style.selectDevice" dark standout label-color="orange" v-model="deviceName"
      :options="allDeviceNames" label="设备" dense options-dark options-dense />
    <span :class="$style.delayShot">
      <q-toggle v-model="index4.isDelay" color="orange" dark size="lg" dense label="延时拍摄" icon="alarm" left-label />
      <q-input v-model="index4.delayTime" type="number" dark color="orange" dense label="延时时长" standout
        :disable="!index4.isDelay" />
    </span>
    <div :class="$style.showPic" v-show="isShot">
      <canvas :width="W * .95" :height="H * .95" :class="$style.showPicCanvas" ref="canvasRef"></canvas>
      <span :class="$style.dealPic">
        <q-btn icon="download" rounded glossy color="amber" text-color="black" label="保存" @click="onDownload" />
        <q-btn icon="delete_forever" rounded glossy color="amber" text-color="black" label="清除" @click="onClean" />
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { download } from 'src/utils/helper'
import useScreenSize from 'src/hooks/useScreenSize'
import useStore from 'src/stores/useStore'
import { storeToRefs } from 'pinia'
import { Notify, Loading } from 'quasar'

const store = useStore()
const { index4 } = storeToRefs(store)
const videoRef = ref(null)
const canvasRef = ref(null)
const W = ref(800)
const H = ref(600)
const canUsed = ref(false)
const isShot = ref(false)
const progress = ref(0)

const deviceName = computed({
  get() {
    return canUsed.value ? index4.value.cameras[index4.value.index].name : "未检测到可用设备"
  },
  set: async (v) => {
    const index = index4.value.cameras.findIndex(c => c.name === v)
    index4.value.index = index
    Loading.show()
    await useDeviceById(index4.value.cameras[index].id)
    Loading.hide()
  }
})
const allDeviceNames = computed(() => {
  return index4.value.cameras?.map(c => c.name)
})

const useDeviceById = async id => {
  const { width, height } = useScreenSize()

  const constraints = {
    video: { width, height, deviceId: id },
    audio: false,
  }

  const stream = await navigator.mediaDevices.getUserMedia(constraints)

  videoRef.value.srcObject = stream
  videoRef.value.play()
}

onMounted(async () => {

  Loading.show()

  if (!index4.value.cameras.length) {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter((d) => d.kind.includes('video')).map(c => ({
      name: c.label,
      id: c.deviceId
    }))
    if (!cameras.length) {
      Loading.hide()
      const notify = Notify.create({
        type: "negative",
        message: "无可用设备!",
        position: "top",
        timeout: 0
      })
      onBeforeUnmount(() => {
        notify()
      })
    }
    index4.value.cameras = cameras
  }

  canUsed.value = true

  if (index4.value.cameras.length <= index4.value.index) {
    index4.value.index = 0
  }

  const deviceId = index4.value.cameras[index4.value.index].id
  await useDeviceById(deviceId)

  const { width, height } = useScreenSize()
  H.value = W.value * height / width

  Loading.hide()
})

const draw = () => {
  const canvas = canvasRef.value
  const { width, height } = canvas
  const ctx = canvas.getContext('2d')
  const backingStore = ctx.backingStorePixelRatio ||
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio || 1
  const ratio = (window.devicePixelRatio || 1) / backingStore
  ctx.clearRect(-width * ((ratio - 1) / 2), -height * ((ratio - 1) / 2), width * ratio, height * ratio)
  ctx.drawImage(videoRef.value, -width * ((ratio - 1) / 2), -height * ((ratio - 1) / 2), width * ratio, height * ratio)
}

const shot = async () => {
  if (!canUsed.value) return

  if (index4.value.isDelay) {
    await delay()
  }

  isShot.value = true
  draw()
}

const delay = () => new Promise((resolve) => {
  const delayTime = index4.value.delayTime * 10

  const circleRun = () => {
    progress.value++
    if (progress.value !== 100) {
      setTimeout(circleRun, delayTime)
    } else {
      resolve(true)
    }
  }

  setTimeout(circleRun, delayTime)
})

const onClean = () => {
  isShot.value = false
  progress.value = 0
}

const onDownload = () => {
  const url = canvasRef.value.toDataURL("image/png", 1)
  download(`zcytools-${new Date().getTime()}.png`, url)
}

</script>

<style module>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.showVideo {
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  border-radius: 20px;
}

.takeShot {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #aaa;
  border: 5px solid #666;
  top: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.showPic {
  position: absolute;
  z-index: 1;
  border-radius: 20px;
  border: 10px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1);
  opacity: 1;
  animation: scaleAction 1s;
}

@keyframes scaleAction {
  0% {
    transform: scale(1.2);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.showPicCanvas {
  border-radius: 20px;
}

.dealPic {
  position: absolute;
  z-index: 2;
  top: 80%;
}

.dealPic>* {
  margin: 0 10px 0 10px;
}

.selectDevice {
  position: absolute;
  bottom: 20px;
  left: 20px;
}

.delayShot {
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: #fff;
  display: flex;
}

.delayShot>* {
  margin: 0 10px 0 10px;
}

.delayShot>:nth-child(2) {
  width: 100px;
}

.progress {
  position: absolute;
}
</style>