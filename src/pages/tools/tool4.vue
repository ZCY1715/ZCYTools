<template>
  <div :class="$style.container">
    <video :class="$style.showVideo" ref="videoRef" />
    <span :class="$style.takeShot" @click="shot" v-show="!isShot">
      <q-icon name="add_a_photo" size="30px" color="white" />
      <q-circular-progress v-if="tool4.isDelay" :value="progress" size="50px" :thickness="0.15" color="orange"
        track-color="grey-3" :class="$style.progress" animation-speed="100" />
    </span>
    <q-select color="white" :class="$style.selectDevice" dark standout label-color="orange" v-model="deviceName"
      :options="allDevices.map(d => d.name).sort()" label="设备" dense options-dark options-dense />
    <span :class="$style.delayShot">
      <q-toggle v-model="tool4.isDelay" color="orange" dark size="lg" dense label="延时拍摄" icon="alarm" left-label />
      <q-input v-model="tool4.delayTime" type="number" dark color="orange" dense label="延时时长" standout
        :disable="!tool4.isDelay" />
    </span>
    <div :class="$style.showPic" v-show="isShot">
      <canvas :width="W" :height="H" :class="$style.showPicCanvas" ref="canvasRef"></canvas>
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
import useLocalStore from 'src/hooks/useLocalStore'

const store = useStore()
const { tool4 } = storeToRefs(store)
const localStore = useLocalStore()
const videoRef = ref(null)
const canvasRef = ref(null)
const W = ref(800 * .95)
const H = computed(() => {
  const { width, height } = useScreenSize()
  return W.value * height / width
})
const isShot = ref(false)
const progress = ref(0)
const allDevices = ref([])
const deviceName = computed({
  get() {
    if (allDevices.value.length === 0) return "无可用设备"
    return allDevices.value.find(c => c.id === tool4.value.deviceId).name
  },
  set: async (v) => {
    Loading.show()
    const id = allDevices.value.find(c => c.name === v).id
    tool4.value.deviceId = id
    await useDeviceById(id)
    Loading.hide()
  }
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

  let notify
  onBeforeUnmount(() => notify && notify())

  Loading.show()

  tool4.value.deviceId = await localStore.get("tool4_deviceId")

  const devices = await navigator.mediaDevices.enumerateDevices()
  allDevices.value = devices.filter((d) => d.kind.includes('video')).map(c => ({
    name: c.label,
    id: c.deviceId
  }))

  if (!allDevices.value.length) {
    Loading.hide()
    notify = Notify.create({
      type: "negative",
      message: "未检测到可用设备!",
      position: "top",
      timeout: 0
    })
    return
  }

  if (allDevices.value.findIndex(c => c.id === tool4.value.deviceId) < 0) {
    tool4.value.deviceId = allDevices.value[0].id
  }

  await useDeviceById(tool4.value.deviceId)

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
  if (allDevices.value.length === 0) return
  if (tool4.value.isDelay) await delay()
  isShot.value = true
  draw()
}

const delay = () => new Promise((resolve) => {
  const delayTime = tool4.value.delayTime * 10

  const circleRun = () => {
    progress.value++
    if (progress.value === 100) resolve(true)
    else setTimeout(circleRun, delayTime)
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

store.$subscribe((mutation, state) => {
  localStore.set("tool4_deviceId", state.tool4.deviceId)
})

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