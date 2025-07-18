<template>
  <div class="home">
    <div class="homepage" v-if="itemname == '路由'">
      路由
    </div>
    <div class="homepage" v-if="itemname == '登录系统'">
      登录系统
    </div>
    <div class="register" v-if="itemname == '创建'">
      <!-- <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
       :model="ruleForm" 包含整个对象 :rules="rules" 设置对应的规则  你可以在 JavaScript 中用 this.$refs.ruleForm 调用它的方法 
         prop="pass" 会绑定到 ruleForm.pass 上，并用 rules.pass 来进行校验  
      <el-form-item label="姓名" prop="name">
        <el-input type="text" v-model="ruleForm.name" autocomplete="off" ></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pass">
        <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
        <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
      <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
      </el-form> -->
      <el-form :model="form" ref="form" label-width="80px">
      <el-form-item label="账号">
        <el-input v-model="form.id"></el-input>  
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" show-password></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleRegister">注册</el-button>
      </el-form-item>
    </el-form>
    </div> 
  </div>
</template>

<script>
import { register } from '@/api/api';
export default {
  name: 'home',
  data() {
      var checkName = (rule, value, callback) => {
        if(value === ''){
          callback(new Error('请输入名字'))
        } else {
        callback();//回调函数
        }
      };
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.ruleForm.checkPass !== '') {
            this.$refs.ruleForm.validateField('checkPass');
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.ruleForm.pass) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {
        // ruleForm: {
        //   pass: '',
        //   checkPass: '',
        //   name: ''
        // },
        // rules: {
        //   pass: [
        //     { validator: validatePass, trigger: 'blur' }
        //   ],
        //   checkPass: [
        //     { validator: validatePass2, trigger: 'blur' }
        //   ],
        //   name: [
        //     { validator: checkName, trigger: 'blur' }// trigger: 'blur'离开输入栏救出触发 validator: checkName触发哪个rule
        //   ]
        // }
        form: {
        id:'',
        username: '',
        password: ''
      }
      };
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {//对于所以的rules有一个valid valid 是一个布尔值 如果有一个不行 就会整个报错
          if (valid) {
            alert('submit!');
          } else {
            console.log('error submit!!');
            return false;
          }
        });

      },
      resetForm(formName) {
        this.$refs[formName].resetFields();//重置所有的东西
      },
      async handleRegister() {
      try {
        console.log(this.form,"this.form");
        
        const res = await register(this.form)
        this.$message.success('注册成功')
      } catch (err) {
        this.$message.error('注册失败: ' + (err.response?.data?.message || '未知错误'))
      }
    }
    },
  props: {
    itemname:String,
    }
}
</script>

<style scoped>
.home{
  width: 100%;
  height: 100%;
}
</style>