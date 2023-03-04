<template>
  <q-fab :class="$style.container" color="amber" text-color="black" icon="keyboard_arrow_down" direction="down" glossy>
    <q-fab-action v-for="item of menuLists" color="amber" text-color="black" :icon="item.icon"
      @click="() => onClick(item.name)" :label="item.text">
    </q-fab-action>
  </q-fab>
</template>

<script setup>
import { menuLists } from 'src/utils/constants'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const onClick = name => {
  if (route.name === name) return
  router.push({ name })
}

</script>

<style module>
.container {
  position: fixed;
  top: 10px;
  right: 20px;
}
</style>