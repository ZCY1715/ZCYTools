import ContextMenu from '@imengyu/vue3-context-menu'

const crerateMenuItems = () => {
  return [
    {
      label: "关闭",
      onClick: () => {
        window.myWindowAPI.close()
      }
    },
    {
      label: "最小化",
      onClick: () => {
        window.myWindowAPI.minimize()
      }
    }
  ]
}

class Menu {
  constructor() { }
  run() {
    window.addEventListener("contextmenu", e => {
      ContextMenu.showContextMenu({
        x: e.pageX,
        y: e.pageY,
        items: crerateMenuItems(),
        theme: 'flat'
      })
    })
  }
}

export default () => {
  const menu = new Menu()
  return { menu }
}