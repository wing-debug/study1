<template>
  <div id="app">
    <xigl></xigl>
  </div>
</template>

<script>
import xigl from './views/xigl/xigl.vue';
export default {
  name: 'App',
  components:{
    xigl
  }
}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
