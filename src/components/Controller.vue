<template>
  <q-fab :class="$style.container" color="amber" text-color="black" icon="keyboard_arrow_down" direction="down">
    <q-fab-action v-for="item, index of menuLists" color="amber" text-color="black" :icon="item.icon"
      @click="() => onClick(index)" :label="item.text">
    </q-fab-action>
  </q-fab>
</template>

<script setup>
import useStore from 'src/stores/useStore'
import { menuLists } from 'src/utils/constants'

const store = useStore()

const onClick = index => {
  if (store.toolIndex === index) return
  store.toolIndex = index
}

</script>

<style module>
.container {
  position: fixed;
  top: 20px;
  right: 20px;
}
</style>