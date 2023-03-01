class Drag {
  pageX = 0
  pageY = 0
  body = null
  constructor() { }

  run() {
    window.addEventListener("DOMContentLoaded", () => {
      this.body = document.querySelector("body")
      this.body.addEventListener("mousedown", this.mouseDown.bind(this))
    })
  }

  mouseDown(e) {
    this.pageX = e.pageX
    this.pageY = e.pageY
    const mouseMoveCallback = this.moveEvent.bind(this)
    this.body?.addEventListener("mousemove", mouseMoveCallback)
    this.body?.addEventListener("mouseup", () => {
      this.body?.removeEventListener("mousemove", mouseMoveCallback)
    })
    this.body?.addEventListener("mouseout", () => {
      this.body?.removeEventListener("mousemove", mouseMoveCallback)
    })
  }

  moveEvent(e) {
    const x = e.pageX - this.pageX
    const y = e.pageY - this.pageY
    window.api.drag({ x, y })
  }
}

export default () => {
  const drag = new Drag()
  return { drag }
}