<template>
  <div class="aside">
    <div class="top-title">
      <h3>RuoYi</h3>
    </div>
    <div class="item-list">
      <div class="item-button" :class="{ moveRight: !isCollapse }" @click="toggleCollapse">
        <!-- 得是class 然后:class发生改变 然后让其能够发生变化 -->
        <i :class="isCollapse ? 'el-icon-arrow-right' : 'el-icon-arrow-left'"></i>
      </div>
      <el-menu
        default-active="1-4-1"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        :collapse="isCollapse"
      >
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-s-home"></i>
            <span slot="title">首页</span>
          </template>
          <el-menu-item-group>
            <span slot="title">分组一</span>
            <el-menu-item index="1-1" @click="ChoseSend('路由')">路由</el-menu-item>
            <!-- 在""想传输数据需要'' -->
            <el-menu-item index="1-2" @click="ChoseSend('登录系统')">登录系统</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="分组2">
            <el-menu-item index="1-2" @click="ChoseSend('创建')">注册</el-menu-item>
          </el-menu-item-group>
          <el-submenu index="1-4">
            <span slot="title">选项4</span>
            <el-menu-item index="1-4-1">选项1</el-menu-item>
          </el-submenu>
        </el-submenu>
        <el-menu-item index="2">
          <i class="el-icon-setting"></i>
          <span slot="title">系统管理</span>
        </el-menu-item>
        <el-menu-item index="3" disabled>
          <i class="el-icon-monitor"></i>
          <span slot="title">系统监控</span>
        </el-menu-item>
        <el-menu-item index="4">
          <i class="el-icon-menu"></i>
          <span slot="title" @click="">导航四</span>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script>
export default {
  name: 'leftBar',
  data() {
    return {
      isCollapse: false,
      send: "无"
    }
  },
  methods: {
    handleOpen(index) {
      console.log('open:', index)
    },
    handleClose(index) {
      console.log('close:', index)
    },
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    },
    ChoseSend(src){
      this.send = src ;
      this.$emit("chilMes",this.send)
    }
  }
}
</script>

<style scoped >
.aside{
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  .top-title{
    width: 100%;
    height: 75px;
    text-align: center;
  }
}
.item-list{
  flex:1;
  height: 100%;
  position: relative;
  width: 100%;
  /* 折叠按钮 */
  /* .item-toggle {
  width: 100%;
  height: 40px;
  text-align: center;//居中
  line-height: 40px;//调整行高
  cursor: pointer;
  background-color: #f5f5f5;
  font-size: 18px;
} */
/* 悬浮箭头按钮 */
.item-button {
  position: absolute;
  top: 100px; /* 自行调整上下位置 */
  right: 105px;
  /* 这里是相对于item-list的位移 */
  width: 20px;
  height: 40px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-left: none;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: right 0.3s;
  /* 当right发生改变的时候 会触发新的效果 0.3秒完成 */
  }
  .item-button:hover {
  background-color: #1257be;
}
/* ✅ 正确的 .moveRight：作用于 .item-button 本身 */
.item-button.moveRight {
  right: -25px;

  /* 注意这里是相对item-button的相对位移 不是绝对位移 */
}
}
</style>
