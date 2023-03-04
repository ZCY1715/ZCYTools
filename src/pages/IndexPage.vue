<template>
  <div :class="$style.bodyBorder"></div>
  <div :class="$style.container">
    <router-view />
  </div>
</template>

<script setup>

</script>

<style module>
.container {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container> :first-child {
  border-radius: 20px;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(ellipse closest-side at center, rgb(14, 10, 88), rgb(34, 34, 34));
}

.bodyBorder {
  position: absolute;
  top: 10px;
  left: 10px;
  width: calc(100% - 20px);
  height: calc(100% - 20px);
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