import { defineStore } from 'pinia'

const useStore = defineStore('store', {
  state: () => ({
    audio: {
      url: "",
      title: "",
      duration: 0,
      currentTime: 0,
      volume: 60
    },
    video: {
      url: "",
      title: "",
      duration: 0,
      currentTime: 0,
      volume: 60
    }
  }),
  getters: {
  },
  actions: {
    saveAudio(url, title, duration, currentTime, volume) {
      this.audio = {
        url,
        title,
        duration,
        currentTime,
        volume
      }
    },
    saveVideo(url, title, duration, currentTime, volume) {
      this.video = {
        url,
        title,
        duration,
        currentTime,
        volume
      }
    },
  }
})

export default useStore