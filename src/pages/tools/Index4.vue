<template>
  <div :class="$style.container">
    <video :class="$style.showVideo" ref="videoRef" />
    <span :class="$style.takeShot" @click="shot" v-show="!isShot">
      <q-icon name="add_a_photo" size="30px" color="white" />
    </span>
    <div :class="$style.showPic" v-show="isShot">
      <canvas :width="W * .95" :height="H * .95" :class="$style.showPicCanvas" ref="canvasRef"></canvas>
      <span :class="$style.controller">
        <q-btn icon="download" rounded glossy color="amber" text-color="black" label="保存" @click="onDownload" />
        <q-btn icon="delete_forever" rounded glossy color="amber" text-color="black" label="清除" @click="onClean" />
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { download } from 'src/utils/helper'

const videoRef = ref(null)
const canvasRef = ref(null)
const W = ref(800)
const H = ref(600)
const isShot = ref(false)

onMounted(() => {

  const { width, height } = window.myWindowAPI.getWorkAreaSize()

  navigator.mediaDevices.getUserMedia({ video: { width, height }, audio: false }).then(stream => {
    videoRef.value.srcObject = stream
    videoRef.value.play()
  })

  H.value = W.value * height / width

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

const shot = () => {
  isShot.value = true
  draw()
}

const onClean = () => isShot.value = false

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

/* .showPicCanvas {
  width: 100%;
  height: 100%;
} */

.controller {
  position: absolute;
  z-index: 2;
  top: 80%;
}

.controller>* {
  margin: 0 10px 0 10px;
}
</style>