import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { debounce } from 'src/utils/helper'

export default function ({ beforeToggle }) {

  const isSlient = ref(false)

  const debounceSlient = debounce(() => {
    isSlient.value = true
  }, 5000)

  const onMouseMove = () => {
    isSlient.value = false
    if (beforeToggle && beforeToggle()) {
      debounceSlient()
    }
  }

  onMounted(() => window.addEventListener("mousemove", onMouseMove))

  onBeforeUnmount(() => {
    window.removeEventListener("mousemove", onMouseMove)
    document.querySelector("html").removeAttribute("style")
    debounceSlient.abort()
  })

  watch(isSlient, () => {
    if (isSlient.value) {
      document.querySelector("html").style = "cursor: none;"
    } else {
      document.querySelector("html").removeAttribute("style")
    }
  })

  return { isSlient, debounceSlient }

}