<template>
  <div :class="$style.container" ref="containerRef">
    <div :class="$style.openFile" v-if="!src">
      <span ref="openFileRef">
        <q-icon name="post_add" size="35px" color="amber" />
      </span>
      <span>点击导入视频或拖拽至此区域...</span>
    </div>
    <video v-else :class="$style.video" :src="src" controls controlslist="nodownload noremoteplayback" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Uploader from 'src/utils/Uploader'

const src = ref("")
const containerRef = ref(null)
const openFileRef = ref(null)
const videoList = ref([])

function loadVideo(video) {
  const url = window.URL.createObjectURL(video)

  src.value = url
}

onMounted(() => {
  new Uploader({ el: containerRef.value, mode: "Drag" }, fileList => {
    const video = fileList[0].file
    loadVideo(video)
  })

  new Uploader({ el: openFileRef.value, mode: "Click", pattern: "SingleFile" }, ({ file }) => {
    loadVideo(file)
  })
})

</script>

<style module>
.container {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(ellipse closest-side at center, rgb(14, 10, 88), rgb(34, 34, 34));
  display: flex;
  justify-content: center;
  align-items: center;
}

.openFile {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.openFile> :first-child {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.openFile> :nth-child(2) {
  font-size: 20px;
  color: #aaa;
  margin-top: 10px;
}

.video {
  width: 100%;
  height: 100%;
}
</style>