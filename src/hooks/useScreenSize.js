import { ref } from 'vue'

const sizeRef = ref(null)

export default () => {

  if (!sizeRef.value) {
    sizeRef.value = window.myWindowAPI.getWorkAreaSize()
  }

  return sizeRef.value
}