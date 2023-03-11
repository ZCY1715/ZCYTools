<template>
  <div :class="$style.container">
    <video :class="$style.video" ref="videoRef"></video>
    <div :class="$style.selectDevices">
      <q-select color="white" dark standout label-color="orange" v-model="videoDeviceName"
        :options="videoDevices.map(d => d.name).sort()" label="视频设备" dense options-dark options-dense />
      <q-select color="white" dark standout label-color="orange" v-model="audioDeviceName"
        :options="audioDevices.map(d => d.name).sort()" label="音频设备" dense options-dark options-dense />
    </div>
    <div :class="$style.controller">
      <DisplayTime :is-play="isStart" :is-twinkle="isStart" :time="duration" />
      <q-btn-group rounded>
        <q-btn color="" rounded glossy icon="preview" :disable="!source" label="预览" @click="onPreview" />
        <q-btn color="" rounded glossy icon="stop_circle" :disable="!isStart" label="结束" @click="onStop" />
        <q-btn color="" rounded glossy icon="play_circle" :disable="isStart" label="开始" @click="onStart" />
        <q-btn color="" rounded glossy icon="download" :disable="!source" label="保存" @click="onSave" />
        <q-btn color="" rounded glossy icon="delete_forever" :disable="!source" label="清除" @click="onClear" />
      </q-btn-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import useStore from 'stores/useStore'
import { storeToRefs } from 'pinia'
import { Notify, Loading } from 'quasar'
import { download } from 'src/utils/helper'
import useScreenSize from 'src/hooks/useScreenSize'
import useLocalStore from 'src/hooks/useLocalStore'
import useMediaRecorder from 'src/hooks/useMediaRecorder'
import DisplayTime from 'src/components/DisplayTime.vue'
import getBlobDuration from 'get-blob-duration'
import { useRouter } from 'vue-router'

const store = useStore()
const { tool5 } = storeToRefs(store)
const router = useRouter()
const localStore = useLocalStore()
const videoRef = ref(null)
const videoDevices = ref([])
const audioDevices = ref([])
const videoDeviceName = computed({
  get() {
    if (videoDevices.value.length === 0) return "无可用视频设备"
    return videoDevices.value.find(c => c.id === tool5.value.videoDeviceId).name
  },
  set: async (v) => {
    Loading.show()
    const id = videoDevices.value.find(c => c.name === v).id
    tool5.value.videoDeviceId = id
    await useDeviceById(id)
    Loading.hide()
  }
})
const audioDeviceName = computed({
  get() {
    if (audioDevices.value.length === 0) return "无可用音频设备"
    return audioDevices.value.find(c => c.id === tool5.value.audioDeviceId).name
  },
  set: async (v) => {
    const id = audioDevices.value.find(c => c.name === v).id
    tool5.value.audioDeviceId = id
  }
})
const isStart = ref(false)
const source = ref("")
const title = ref("")
const duration = ref(0)
const controller = ref(null)
const timer = ref(null)

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

  tool5.value.videoDeviceId = await localStore.get("tool5_videoDeviceId")
  tool5.value.audioDeviceId = await localStore.get("tool5_audioDeviceId")

  const devices = await navigator.mediaDevices.enumerateDevices()
  videoDevices.value = devices.filter((d) => d.kind.includes('video')).map(c => ({
    name: c.label,
    id: c.deviceId
  }))
  audioDevices.value = devices.filter((d) => d.kind.includes('audio') && !["default", "communications"].includes(d.deviceId)).map(c => ({
    name: c.label,
    id: c.deviceId
  }))

  if (videoDevices.value.length === 0) {
    Loading.hide()
    notify = Notify.create({
      type: "negative",
      message: "未检测到可用视频设备!",
      position: "top",
      timeout: 0
    })
    return
  }

  if (videoDevices.value.findIndex(c => c.id === tool5.value.videoDeviceId) < 0) {
    tool5.value.videoDeviceId = videoDevices.value[0].id
  }
  if (audioDevices.value.findIndex(c => c.id === tool5.value.audioDeviceId) < 0) {
    tool5.value.audioDeviceId = audioDevices.value[0].id
  }

  await useDeviceById(tool5.value.videoDeviceId)

  if (tool5.value.isPreviewing) {
    const { url, title: oTitle } = store.cleanTool2AsThreePart()
    title.value = oTitle
    source.value = url
    duration.value = Math.floor(await getBlobDuration(url))
    tool5.value.isPreviewing = false
    store.canTurnBack = false
  }

  Loading.hide()
})

const onPreview = () => {
  store.saveTool2AsThreePart(source.value, title.value)
  tool5.value.isPreviewing = true
  store.canTurnBack = true
  router.push({ name: "TOOL2" })
}

const onStop = () => {
  isStart.value = false
  clearInterval(timer.value)
  timer.value = null
  controller.value.stop()
}

const onStart = async () => {

  onClear()

  const { width, height } = useScreenSize()
  const constraints = {
    video: { width, height, deviceId: tool5.value.videoDeviceId },
    audio: { deviceId: tool5.value.audioDeviceId }
  }

  const stream = await navigator.mediaDevices.getUserMedia(constraints)
  controller.value = useMediaRecorder(stream, 'video/mp4', {
    onStop: blob => {
      source.value = window.URL.createObjectURL(blob)
      title.value = `zcytools_${new Date().getTime()}.mp4`
    }
  })

  controller.value.start()
  timer.value = setInterval(() => duration.value++, 1000)
  isStart.value = true

}

const onSave = () => {
  download(title.value, source.value)
}

const onClear = () => {

  if (controller.value) {
    controller.value.stop()
    controller.value = null
  }

  if (source.value) {
    if (!tool5.value.isPreviewing) {
      window.URL.revokeObjectURL(source.value)
    }
    source.value = ""
    title.value = ""
  }

  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }

  duration.value = 0

}

onBeforeUnmount(() => {
  onClear()
})

store.$subscribe((mutation, state) => {
  localStore.set("tool5_videoDeviceId", state.tool5.videoDeviceId)
  localStore.set("tool5_audioDeviceId", state.tool5.audioDeviceId)
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
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  border-radius: 20px;
}

.controller {
  position: absolute;
  bottom: 0;
  z-index: 1;
  width: 100%;
  height: 100px;
  border-radius: 0 0 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.selectDevices {
  position: absolute;
  z-index: 1;
  left: 20px;
  top: 20px;
}

.selectDevices>* {
  margin-bottom: 10px;
  width: 300px;
}
</style>