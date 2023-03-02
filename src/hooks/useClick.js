const vClick = {
  mounted(el, binding) {

    const { click, dbclick } = binding.value
    let clickTimer = null

    click && el.addEventListener('click', () => {

      if (!dbclick) return click()

      if (clickTimer) {
        window.clearTimeout(clickTimer)
        clickTimer = null
        return
      }
      clickTimer = setTimeout(() => {
        click()
        clickTimer = null
      }, 300)
    })

    dbclick && el.addEventListener('dblclick', () => {
      if (clickTimer) {
        window.clearTimeout(clickTimer)
        clickTimer = null
      }
      dbclick()
    })
  }
}

export default () => {
  return { vClick }
}