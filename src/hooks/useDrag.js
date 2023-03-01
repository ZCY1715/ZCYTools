class Drag {
  pageX = 0
  pageY = 0

  constructor() { }

  run() {
    window.addEventListener("mousedown", this.mouseDown.bind(this))
  }

  mouseDown(e) {
    this.pageX = e.pageX
    this.pageY = e.pageY
    const mouseMoveCallback = this.moveEvent.bind(this)
    window.addEventListener("mousemove", mouseMoveCallback)
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", mouseMoveCallback)
    })
    window.addEventListener("mouseout", () => {
      window.removeEventListener("mousemove", mouseMoveCallback)
    })
  }

  moveEvent(e) {
    const x = e.pageX - this.pageX
    const y = e.pageY - this.pageY
    window.myWindowAPI.drag({ x, y })
  }
}

export default () => {
  const drag = new Drag()
  return { drag }
}