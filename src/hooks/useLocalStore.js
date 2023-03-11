
export default () => ({
  get: async key => await window.myWindowAPI.getStoreValue(key),
  set: async (key, value) => {
    if (!value) return
    await window.myWindowAPI.setStoreValue(key, value)
  },
  clear: async () => await window.myWindowAPI.clearStoreValue()
})