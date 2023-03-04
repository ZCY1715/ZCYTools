<template>
  <router-view />
  <Controller />
</template>

<script setup>
import Controller from 'components/Controller.vue'
import useDrag from './hooks/useDrag'
import useMenu from './hooks/useMenu'

const { drag } = useDrag()
drag.run()
const { menu } = useMenu()
menu.run()

</script>
