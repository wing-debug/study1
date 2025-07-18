import axios from "axios";
const service = axios.create({
    baseURL: 'http://localhost:8088/user', // 根据你后端地址修改
    timeout: 5000,
  })

  // 请求拦截器
service.interceptors.request.use(
    config => {
      // 可以在这里添加 token
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )
  
  // 响应拦截器
  service.interceptors.response.use(
    response => {
      return response.data
    },
    error => {
      return Promise.reject(error)
    }
  )
  
  export default service