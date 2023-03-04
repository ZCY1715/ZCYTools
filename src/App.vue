<template>
  <router-view />
  <TurnBack v-if="store.canTurnBack" />
  <Controller v-else />
</template>

<script setup>
import Controller from 'components/Controller.vue'
import TurnBack from 'components/TurnBack.vue'
import useDrag from './hooks/useDrag'
import useMenu from './hooks/useMenu'
import useStore from 'stores/useStore'

const store = useStore()

const { drag } = useDrag()
drag.run()
const { menu } = useMenu()
menu.run()

</script>
