import { ref, onBeforeUnmount, onMounted } from 'vue'

// el : ref(HTMLElement)

export default function (el, { onLeave, onEnter, beforeToggle }) {

  const isPicInPic = ref(false)

  const onEnterpictureinpicture = () => {
    isPicInPic.value = true
    onEnter && onEnter()
  }
  const onLeavepictureinpicture = () => {
    isPicInPic.value = false
    onLeave && onLeave()
  }
  const togglePicInPic = () => {
    if (beforeToggle && !beforeToggle()) return
    if (isPicInPic.value) {
      document.exitPictureInPicture()
    } else {
      el.value.requestPictureInPicture()
    }
  }

  onMounted(() => {
    el.value.addEventListener("enterpictureinpicture", onEnterpictureinpicture)
    el.value.addEventListener("leavepictureinpicture", onLeavepictureinpicture)
  })
  onBeforeUnmount(() => {
    el.value.removeEventListener("enterpictureinpicture", onEnterpictureinpicture)
    el.value.removeEventListener("leavepictureinpicture", onLeavepictureinpicture)
  })

  return { togglePicInPic }
}