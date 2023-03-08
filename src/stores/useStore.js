import { defineStore } from 'pinia'

const useStore = defineStore('store', {
  state: () => ({
    canTurnBack: false,
    tool1: {
      loadAsThreePart: {
        eable: false,
        url: "",
        title: ""
      },
      url: "",
      title: "",
      currentTime: 0,
      volume: 60,
    },
    tool2: {
      url: "",
      title: "",
      currentTime: 0,
      volume: 60
    },
    tool3: {
      isPreviewing: false,
      systemVideo: true,
      humanVideo: true,
    },
    tool4: {
      deviceId: "",
      isDelay: false,
      delayTime: 3,
    }
  }),
  getters: {
  },
  actions: {
    saveTool1(url, title, currentTime, volume) {
      this.tool1.url = url
      this.tool1.title = title
      this.tool1.currentTime = currentTime
      this.tool1.volume = volume
    },
    saveTool1AsThreePart(url, title) {
      this.tool1.loadAsThreePart.eable = true
      this.tool1.loadAsThreePart.url = url
      this.tool1.loadAsThreePart.title = title
    },
    cleanTool1AsThreePart() {
      this.tool1.loadAsThreePart.eable = false
      const { url, title } = this.tool1.loadAsThreePart
      this.tool1.loadAsThreePart.url = ""
      this.tool1.loadAsThreePart.title = ""
      return { url, title }
    },
    saveTool2(url, title, currentTime, volume) {
      this.tool2.url = url
      this.tool2.title = title
      this.tool2.currentTime = currentTime
      this.tool2.volume = volume
    },
  }
})



export default useStore