<template>
  <div class="top-bar">
   
      <img src="@/assets/logo.png"   alt="描述" />
    
    
  </div>
</template>

<script>
import logo from '@/assets/logo.png'
export default {
  name: 'top-bar',
  data() {
    return {
    }
  },
  computed: {
  },
  methods: {
  },
  watch: {
  },
  created() {
  },
}
</script>

<style lang="less" scoped>
.top-bar{
  height: 75px;
  width: 100%;
  flex-shrink: 0;
  background-color:#0a9aee;
  position: relative;
  img {//这里很重要 如果没有照片会按照原始的大小 一定要限制其高宽
    height: 70px;
    width: 70px;
    position: absolute;
    left: 20px
  }
}
</style>