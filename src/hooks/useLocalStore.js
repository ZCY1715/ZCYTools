
export default () => ({
  get: async key => await window.myWindowAPI.getStoreValue(key),
  set: async (key, value) => await window.myWindowAPI.setStoreValue(key, value)
})