import { defineStore } from 'pinia'

const useStore = defineStore('store', {
  state: () => ({
    canTurnBack: false,
    index1: {
      url: "",
      title: "",
      duration: 0,
      currentTime: 0,
      volume: 60
    },
    index2: {
      url: "",
      title: "",
      duration: 0,
      currentTime: 0,
      volume: 60
    },
    index3: {
      eable: false,
      url: "",
      title: "",
      systemVideo: true,
      humanVideo: true,
    },
    index4: {
      deviceId: "",
      cameras: [],
      isDelay: false,
      delayTime: 3,
    }
  }),
  getters: {
  },
  actions: {
    saveIndex1(url, title, duration, currentTime, volume) {
      this.index1 = {
        url,
        title,
        duration,
        currentTime,
        volume
      }
    },
    saveIndex2(url, title, duration, currentTime, volume) {
      this.index2 = {
        url,
        title,
        duration,
        currentTime,
        volume
      }
    },
    saveIndex3(eable, url, title) {
      this.index3.eable = eable
      this.index3.url = url
      this.index3.title = title
    }
  }
})



export default useStore