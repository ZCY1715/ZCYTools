<template>
  <div :class="$style.showTime">
    <span
      :class="[$style.light, props.isPlay ? $style.light_red : $style.light_green, props.isTwinkle ? $style.light_twinkle : '']"></span>
    <span>{{ formatTime(props.time) }}</span>
  </div>
</template>

<script setup>
import { formatTime } from 'src/utils/helper'

const props = defineProps({
  isPlay: {
    type: Boolean,
    required: true
  },
  isTwinkle: {
    type: Boolean,
    required: true
  },
  time: {
    type: Number,
    default: 0
  }
})

</script>

<style module>
.showTime {
  color: #aaa;
  font-size: 20px;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes showAndHide {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.light {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
  opacity: 1;
}

.light_twinkle {
  animation: showAndHide 1s infinite;
}

.light_green {
  background-color: rgb(11, 235, 11);
}

.light_red {
  background-color: red;
}
</style>