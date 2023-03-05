<template>
  <div :class="$style.container" ref="containerRef" tabindex="0" @focus="showVolume = false">
    <div :class="$style.openFile" v-if="!isInit">
      <span ref="openFileRef">
        <q-icon name="post_add" size="35px" color="amber" />
      </span>
      <span>点击导入视频或拖拽至此区域...</span>
    </div>
    <video v-show="isInit" ref="videoRef" :class="$style.video"
      v-click="{ click: toggleActive, dbclick: toggleFullscreen }" />
    <div :class="$style.controller" v-show="!isSlient">
      <div :class="$style.progress">
        <q-slider :model-value="currentTime" @update:model-value="progressChange" color="amber" thumb-color="orange"
          :min="0" :max="duration" :class="$style.slider" dark />
        <span :class="$style.displayTime">{{ formatTime(Math.floor(currentTime)) }} / {{ formatTime(duration) }}</span>
      </div>
      <div :class="$style.warp">
        <span :class="$style.left">
          <q-icon :name="volume === 0 ? 'volume_off' : 'volume_up'" size="35px" color="amber" tabindex="0"
            @focus="showVolume = true" />
          <q-slider :class="[showVolume ? $style.volumeShow : $style.volumeHide]" v-model="volume" :min="0" :max="100"
            color="amber" dark :label-value="volume" label />
        </span>
        <span :class="$style.middle">
          <q-icon :name="isActive ? 'pause_circle' : 'play_circle'" size="50px" color="amber" @click="toggleActive" />
        </span>
        <span :class="$style.right">
          <q-icon name="picture_in_picture" size="35px" color="amber" @click="togglePicInPic" />
          <q-icon :name="isFullscreen ? 'fullscreen_exit' : 'fullscreen'" size="35px" color="amber"
            @click="toggleFullscreen" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Uploader from 'src/utils/Uploader'
import { Notify, Loading } from 'quasar'
import useStore from 'stores/useStore'
import { storeToRefs } from 'pinia'
import { formatTime, debounce } from 'src/utils/helper'
import useClick from 'src/hooks/useClick'
import useFullscreen from 'src/hooks/useFullscreen'
import usePicInPic from 'src/hooks/usePicInPic'
import useSilentMouse from 'src/hooks/useSilentMouse'
import useKeyboard from 'src/hooks/useKeyboard'
import getBlobDuration from 'get-blob-duration'

const store = useStore()
const { index2 } = storeToRefs(store)
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
const showVolume = ref(false)
const { togglePicInPic } = usePicInPic(videoRef, {
  onLeave: () => {
    if (videoRef.value.paused) {
      isActive.value = false
    }
  },
  beforeToggle: () => isInit.value
})
const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef)
const { isSlient, debounceSlient } = useSilentMouse({
  beforeToggle: () => isInit.value
})

const onSuccess = async (name, url) => {
  isActive.value = false
  title.value = name
  if (isInit.value) {
    window.URL.revokeObjectURL(videoRef.value.src)
  } else {
    isInit.value = true
  }
  videoRef.value.src = url

  duration.value = Math.floor(await getBlobDuration(url))

  Loading.hide()
  Notify.create({
    type: "positive",
    message: "加载成功!",
  })

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

const progressChange = v => {
  currentTime.value = v
  videoRef.value.currentTime = v
}

watch(isActive, () => isActive.value ? videoRef.value.play() : videoRef.value.pause())
watch(volume, () => videoRef.value.volume = volume.value / 100)

const onTimeUpdate = () => currentTime.value = videoRef.value.currentTime
const onEnded = () => {
  currentTime.value = 0
  isActive.value = false
}

onMounted(() => {
  new Uploader({ el: containerRef.value, mode: "Drag" }, fileList => {
    const video = fileList[0].file
    loadVideo(video)
  })

  new Uploader({ el: openFileRef.value, mode: "Click", pattern: "SingleFile" }, ({ file }) => {
    loadVideo(file)
  })

  videoRef.value.addEventListener("timeupdate", onTimeUpdate)
  videoRef.value.addEventListener("ended", onEnded)


  if (index2.value.url) {
    videoRef.value.src = index2.value.url
    title.value = index2.value.title
    volume.value = index2.value.volume
    duration.value = index2.value.duration
    videoRef.value.currentTime = index2.value.currentTime
    isInit.value = true
  }

})

onBeforeUnmount(() => {

  videoRef.value.removeEventListener("timeupdate", onTimeUpdate)
  videoRef.value.removeEventListener("ended", onEnded)

  store.saveIndex2(
    videoRef.value.src,
    title.value,
    duration.value,
    currentTime.value,
    volume.value
  )
})

const debounceNOTShowVolume = debounce(() => {
  showVolume.value = false
}, 1000)

useKeyboard({
  onUp: () => {
    volume.value = volume.value + 5 > 100 ? 100 : volume.value + 5
    showVolume.value = true
    isSlient.value = false
    debounceSlient()
    debounceNOTShowVolume()
  },
  onDown: () => {
    volume.value = volume.value - 5 < 0 ? 0 : volume.value - 5
    showVolume.value = true
    isSlient.value = false
    debounceSlient()
    debounceNOTShowVolume()
  },
  onLeft: () => {
    if (!videoRef.value.src) return
    isSlient.value = false
    debounceSlient()
    videoRef.value.currentTime = currentTime.value - 5 < 0 ? 0 : currentTime.value - 5
  },
  onRight: () => {
    if (!videoRef.value.src) return
    isSlient.value = false
    debounceSlient()
    if (currentTime.value + 5 > duration.value) return
    videoRef.value.currentTime = currentTime.value + 5
  },
  onSpace: () => {
    toggleActive()
  }
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
  height: 100px;
  background-color: rgba(0, 0, 0, .3);
  display: flex;
  flex-direction: column;
}

.progress {
  width: 100%;
  height: 28px;
}

.displayTime {
  color: #aaa;
  position: absolute;
  right: 20px;
  top: 10px;
}

.slider {
  transform: translateY(-14px);
  width: 98%;
}

.warp {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-radius: 0 0 20px 20px;
}

.left,
.right {
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.left>*,
.right>*,
.middle>* {
  cursor: pointer;
}

.left>*,
.right>* {
  margin: 0 10px 0 10px;
}

.volumeShow {
  width: 100px;
  opacity: 1;
  transition: .3s;
}

.volumeHide {
  width: 0;
  opacity: 0;
  transition: .3s;
}
</style>