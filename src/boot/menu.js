import { boot } from 'quasar/wrappers'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'

export default boot(async ({ app }) => {
  app.use(ContextMenu)
})
