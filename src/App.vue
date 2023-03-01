<template>
  <router-view />
</template>

<script setup>
import useDrag from './hooks/useDrag'

const { drag } = useDrag()
drag.run()

</script>
