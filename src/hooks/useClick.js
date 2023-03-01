const vClick = {
  mounted(el, binding) {
    let clickTimer = null

    // 单击
    el.addEventListener('click', () => {
      if (clickTimer) {
        window.clearTimeout(clickTimer)
        clickTimer = null
      }
      clickTimer = setTimeout(() => {
        binding.value.click()
      }, 300)
    })

    // 双击
    el.addEventListener('dblclick', () => {
      if (clickTimer) {
        window.clearTimeout(clickTimer);
        clickTimer = null;
      }
      binding.value.dbclick()
    })
  },
}

export default () => {
  return { vClick }
}