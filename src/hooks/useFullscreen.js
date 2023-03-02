import { ref, onBeforeUnmount, onMounted } from 'vue'

// el : ref(HTMLElement)
export default function (el) {

  const isFullscreen = ref(false)

  const onFullscreenChange = () => {
    isFullscreen.value = document.fullscreen ?? (!!document.fullscreenElement)
  }

  const toggleFullscreen = () => {
    if (isFullscreen.value) {
      document.exitFullscreen()
    } else {
      el.value && el.value.requestFullscreen()
    }
  }

  onMounted(() => {
    document.addEventListener("fullscreenchange", onFullscreenChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener("fullscreenchange", onFullscreenChange)
  })


  return { isFullscreen, toggleFullscreen }

}