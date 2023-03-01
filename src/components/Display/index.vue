<template>
  <div :class="$style.bodyBorder"></div>
  <div :class="$style.container">
    <component :is="com" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import useStore from 'stores/useStore'
import Index1 from './tools/Index1.vue'
import Index2 from './tools/Index2.vue'
import Index3 from './tools/Index3.vue'
import Index4 from './tools/Index4.vue'
import Index5 from './tools/Index5.vue'
import Index6 from './tools/Index6.vue'
import Index7 from './tools/Index7.vue'

const store = useStore()
const componentList = [Index1, Index2, Index3, Index4, Index5, Index6, Index7]

const com = computed(() => componentList[store.toolIndex])

</script>

<style module>
.container {
  width: 100%;
  height: 100%;
  border-radius: 20px;
}

.container> :first-child {
  border-radius: 20px;
}

.bodyBorder {
  position: absolute;
  top: 10px;
  left: 10px;
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  text-align: center;
  font-size: 24px;
  border-radius: 20px;
  transition: all .3s;
}

.bodyBorder::before,
.bodyBorder::after {
  content: "";
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 3px solid rgb(156, 161, 179);
  border-radius: 20px;
  animation: clippath 20s infinite linear;
}

.bodyBorder::after {
  animation: clippath 20s infinite -10s linear;
}

@keyframes clippath {

  0%,
  100% {
    clip-path: inset(0 0 98% 0);
  }

  25% {
    clip-path: inset(0 98% 0 0);
  }

  50% {
    clip-path: inset(98% 0 0 0);
  }

  75% {
    clip-path: inset(0 0 0 98%);
  }
}
</style>