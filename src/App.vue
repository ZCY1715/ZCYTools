<template>
  <router-view />
</template>

<script setup>
import useDrag from './hooks/useDrag'
import useMenu from './hooks/useMenu'

const { drag } = useDrag()
drag.run()
const { menu } = useMenu()
menu.run()

</script>
