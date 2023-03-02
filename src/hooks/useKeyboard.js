import { onMounted, onBeforeUnmount } from "vue"

export default function ({ onUp, onDown, onLeft, onRight, onSpace }) {

  const keyObj = {
    32: () => onSpace && onSpace(),
    37: () => onLeft && onLeft(),
    38: () => onUp && onUp(),
    39: () => onRight && onRight(),
    40: () => onDown && onDown()
  }

  const onKeyDown = e => keyObj[e.keyCode] && keyObj[e.keyCode]()

  onMounted(() => window.addEventListener("keydown", onKeyDown))

  onBeforeUnmount(() => window.removeEventListener("keydown", onKeyDown))

}