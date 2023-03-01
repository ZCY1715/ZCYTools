<template>
  <div :class="$style.container" ref="containerRef">
    <div :class="$style.openFile" v-if="!isInit">
      <span ref="openFileRef">
        <q-icon name="post_add" size="35px" color="amber" />
      </span>
      <span>点击导入视频或拖拽至此区域...</span>
    </div>
    <video v-show="isInit" ref="videoRef" :class="$style.video"
      v-click="{ click: toggleActive, dbclick: toggleFullscreen }" />
    <div :class="$style.controller" v-show="showController">
      <span :class="$style.left">
        <q-icon size="35px" color="amber" />
        <q-icon :name="volume === 0 ? 'volume_off' : 'volume_up'" size="35px" color="amber" />
      </span>
      <span :class="$style.middle">
        <q-icon :name="isActive ? 'pause_circle' : 'play_circle'" size="50px" color="amber" @click="toggleActive" />
      </span>
      <span :class="$style.right">
        <q-icon name="picture_in_picture" size="35px" color="amber" @click="togglePicInPic" />
        <q-icon :name="isFullScreen ? 'fullscreen_exit' : 'fullscreen'" size="35px" color="amber"
          @click="toggleFullscreen" />
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Uploader from 'src/utils/Uploader'
import { Notify, Loading } from 'quasar'
import useStore from 'stores/useStore'
import { formatTime, debounce } from 'src/utils/helper'
import useClick from 'src/hooks/useClick'

const store = useStore()
const { vClick } = useClick()
const isInit = ref(false)
const isActive = ref(false)
const containerRef = ref(null)
const openFileRef = ref(null)
const videoRef = ref(null)
const title = ref("")
const duration = ref(0)
const currentTime = ref(0)
const volume = ref(60)
const isPictureInPicture = ref(false)
const isFullScreen = ref(false)
const showController = ref(true)

const onSuccess = (name, url) => {
  isActive.value = false
  title.value = name
  duration.value = 0
  if (isInit.value) {
    window.URL.revokeObjectURL(videoRef.value.src)
  } else {
    isInit.value = true
  }
  videoRef.value.src = url

  videoRef.value.addEventListener("loadedmetadata", () => {
    duration.value = Math.floor(videoRef.value.duration)
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

const loadVideo = video => {
  Loading.show()
  const url = window.URL.createObjectURL(video)

  const newVideo = document.createElement("video")
  newVideo.src = url

  newVideo.addEventListener("loadeddata", () => onSuccess(video.name, url), { once: true })
  newVideo.addEventListener("error", onFail, { once: true })

}

const toggleActive = () => {
  if (!isInit.value) {
    isActive.value = false
    return
  }
  isActive.value = !isActive.value
}

const onEnterpictureinpicture = () => isPictureInPicture.value = true
const onLeavepictureinpicture = () => {
  isPictureInPicture.value = false
  if (videoRef.value.paused) {
    isActive.value = false
  }
}
const togglePicInPic = () => {
  if (!isInit.value) return
  if (isPictureInPicture.value) {
    document.exitPictureInPicture()
  } else {
    videoRef.value.requestPictureInPicture()
  }
}
const onFullscreenChange = () => {
  isFullScreen.value = document.fullscreen ?? (!!document.fullscreenElement)
}
const toggleFullscreen = () => {
  if (isFullScreen.value) {
    document.exitFullscreen()
  } else {
    containerRef.value.requestFullscreen()
  }
}

const debounceNotShow = debounce(() => {
  showController.value = false
  document.querySelector("html").style = "cursor: none;"
}, 3000)
const onMouseMove = () => {
  showController.value = true
  document.querySelector("html").removeAttribute("style")
  if (isInit.value) {
    debounceNotShow()
  }
}

onMounted(() => {
  new Uploader({ el: containerRef.value, mode: "Drag" }, fileList => {
    const video = fileList[0].file
    loadVideo(video)
  })

  new Uploader({ el: openFileRef.value, mode: "Click", pattern: "SingleFile" }, ({ file }) => {
    loadVideo(file)
  })

  videoRef.value.addEventListener("enterpictureinpicture", onEnterpictureinpicture)
  videoRef.value.addEventListener("leavepictureinpicture", onLeavepictureinpicture)
  document.addEventListener("fullscreenchange", onFullscreenChange)
  containerRef.value.addEventListener("mousemove", onMouseMove)
  if (store.video.url) {
    videoRef.value.src = store.video.url
    title.value = store.video.title
    volume.value = store.video.volume
    duration.value = store.video.duration
    videoRef.value.currentTime = store.video.currentTime
    isInit.value = true
  }

})

watch(isActive, () => isActive.value ? videoRef.value.play() : videoRef.value.pause())

onBeforeUnmount(() => {
  videoRef.value.removeEventListener("enterpictureinpicture", onEnterpictureinpicture)
  videoRef.value.removeEventListener("leavepictureinpicture", onLeavepictureinpicture)
  document.removeEventListener("fullscreenchange", onFullscreenChange)
  containerRef.value.removeEventListener("mousemove", onMouseMove)
  document.querySelector("html").removeAttribute("style")
  store.saveVideo(
    videoRef.value.src,
    title.value,
    duration.value,
    currentTime.value,
    volume.value
  )
})

</script>

<style module>
.container {
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
  border-radius: 20px;
}

.controller {
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 0 0 20px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left,
.right {
  margin: 0 50px 0 50px;
}

.left>*,
.right>*,
.middle>* {
  margin: 0 10px 0 10px;
  cursor: pointer;
}
</style>