<template>
  <q-btn round color="amber" glossy text-color="black" icon="keyboard_double_arrow_right" :class="$style.container"
    @click="onClick" size="18px" />
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const onClick = () => router.back()

</script>

<style module>
.container {
  position: fixed;
  top: 10px;
  right: 20px;
}
</style>
