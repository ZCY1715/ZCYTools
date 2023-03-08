<template>
  <div :class="$style.container">
    <video :class="$style.video" ref="videoRef"></video>
    <div :class="$style.controller"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useStore from 'stores/useStore'


const store = useStore()
const videoRef = ref(null)

onMounted(async () => {

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: store.index4.deviceId
    }, audio: true
  })


})

</script>

<style module>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.video {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
}

.controller {
  width: 100%;
  height: 100px;
  border-radius: 0 0 20px 20px;
}
</style>