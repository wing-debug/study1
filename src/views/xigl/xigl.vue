<template>
  <div class="container">
    
    <div class="left-bar">
    <leftBar @chilMes="HanldeMes"></leftBar>
    </div>
    <div class="content">
      <navBar></navBar>
      <maIn :itemname="name"></maIn>
    </div>
  </div>
</template>

<script>
import navBar from './components/header.vue';
import leftBar from './components/aside.vue';
import maIn from './components/home.vue'
export default {
  name: 'xigl',
  components:{
    navBar,leftBar, maIn
  },
  data() {
    return {
      name:'创建'
    }
  },
  computed: {
  },
  methods: {
    HanldeMes(src){
      console.log(src,"src");
      this.name = src ;
    }
  },
  watch: {
  },
  created() {
  },
}
</script>

<style lang="less" scoped>
.container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  /* 这个设置成row就会按照列来排序  */
}
.left-bar{
  width: 200px;
  height: 100%;
  /* background-color: #2d3a4b; */
}
.content{
  display: flex;//注意父组件使用了flex 如果子组件不加上flex-shrink: 0; 会被自动压缩 导致告诉不是你自己设置的
  flex: 1;
  flex-direction: column;
  height: 100%;
  
}

</style>