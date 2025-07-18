import request from "@/utils/request";

export function register(data){
    return request({
        url: '/register',
        method: 'post',
        data: data, // 包含 username 和 password
        headers: {
          'Content-Type': 'application/json'
        }
      })
}