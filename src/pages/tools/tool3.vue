<template>
  <div :class="$style.container">
    <q-icon name="mic" size="100px" color="amber" />
    <DisplayTime style="margin: 20px 0 20px 0;" :is-play="isPlay" :is-twinkle="!isPause" :time="duration" />
    <q-btn-group rounded>
      <q-btn color="" rounded glossy :disable="!source" icon="preview" label="预览" @click="onPreview" />
      <q-btn color="" rounded glossy :disable="!isPlay" icon="stop_circle" label="结束" @click="onStop" />
      <q-btn color="" rounded glossy :icon="isPause ? 'play_circle' : 'pause_circle'" :label="isPause ? '开始' : '暂停'"
        @click="onStartOrPause" />
      <q-btn color="" rounded glossy :disable="!source" icon="download" label="保存" @click="onSave" />
      <q-btn color="" rounded glossy :disable="!source" icon="delete_forever" label="清除" @click="onClean" />
      <q-btn-dropdown auto-close rounded glossy color="" label="配置" :disable="isPlay" :disable-dropdown="isPlay">
        <q-list dense padding :class="$style.contorller">
          <q-toggle v-model="tool3.systemVideo" color="amber" label="系统音频" />
          <q-toggle v-model="tool3.humanVideo" color="amber" label="环境音频" />
        </q-list>
      </q-btn-dropdown>
    </q-btn-group>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { download, mergeStream } from 'src/utils/helper'
import useMediaRecorder from 'src/hooks/useMediaRecorder'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'
import useStore from 'stores/useStore'
import { storeToRefs } from 'pinia'
import getBlobDuration from 'get-blob-duration'
import DisplayTime from 'components/DisplayTime.vue'

const isPlay = ref(false)
const isPause = ref(true)
const source = ref("")
const duration = ref(0)
const timer = ref(null)
const systemVideoStream = ref(null)
const humanVideoStream = ref(null)
const controller = ref(null)
const title = ref("")
const router = useRouter()
const store = useStore()
const { tool3 } = storeToRefs(store)


onMounted(async () => {

  systemVideoStream.value = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'desktop'
      }
    },
    video: {
      mandatory: {
        chromeMediaSource: 'desktop'
      }
    }
  })
  humanVideoStream.value = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })

  if (tool3.value.isPreviewing) {
    const { url, title: oTitle } = store.cleanTool1AsThreePart()
    title.value = oTitle
    source.value = url
    duration.value = Math.floor(await getBlobDuration(url))
    tool3.value.isPreviewing = false
    store.canTurnBack = false
  }
})

const onPreview = () => {
  store.saveTool1AsThreePart(source.value, title.value)
  tool3.value.isPreviewing = true
  store.canTurnBack = true
  router.push({ name: "TOOL1" })
}

const onStop = () => {
  isPause.value = true
  isPlay.value = false
  controller.value.stop()
  clearInterval(timer.value)
}

const onStartOrPause = () => {
  if (isPlay.value) {

    if (isPause.value) {
      // 继续录制
      controller.value.resume()
      timer.value = setInterval(() => {
        duration.value++
      }, 1000)

    } else {
      // 暂停
      controller.value.pause()
      clearInterval(timer.value)
      timer.value = null

    }
    isPause.value = !isPause.value

  } else {
    // 开始
    onClean()

    let stream
    const { systemVideo, humanVideo } = tool3.value
    if (systemVideo && humanVideo) {
      stream = mergeStream(systemVideoStream.value, humanVideoStream.value)
    } else if (humanVideo) {
      stream = humanVideoStream.value
    } else if (systemVideo) {
      stream = systemVideoStream.value
    } else {
      Notify.create({
        type: "negative",
        message: "请选择配置音频采集来源!"
      })
      return
    }

    controller.value = useMediaRecorder(stream, null, {
      onStop: blob => {
        source.value = window.URL.createObjectURL(blob)
        title.value = `zcytools_${new Date().getTime()}.mp3`
      }
    })

    isPlay.value = true
    isPause.value = false
    controller.value.start()
    timer.value = setInterval(() => {
      duration.value++
    }, 1000)

  }
}

const onSave = () => download(title.value, source.value)

const onClean = () => {
  if (source.value) {
    if (!tool3.value.isPreviewing) {
      window.URL.revokeObjectURL(source.value)
    }
    source.value = ""
  }
  duration.value = 0
  controller.value = null
  title.value = ""
}

onBeforeUnmount(() => {
  clearInterval(timer.value)
  onClean()
})

</script>

<style module>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.contorller {
  display: flex;
  flex-direction: column;
  width: 150px;
  background-color: rgba(0, 0, 0, .7);
  color: #fff;
}
</style>