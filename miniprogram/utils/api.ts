// API 基础地址
const BASE_URL = 'http://127.0.0.1:8289'; // 替换为您的实际 API 基础 URL

// 请求方法封装
const request = (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any, header?: any) => {
  return new Promise((resolve, reject) => {
    // 获取存储的 token
    const token = wx.getStorageSync('token') || '';
    
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token,
        ...header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token 过期或无效，需要重新登录
          wx.navigateTo({
            url: '/pages/login/login'
          });
          reject(new Error('登录已过期，请重新登录'));
        } else {
          reject(new Error(`请求失败：${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 导出 API 方法
export default {
  getBanners: () => {
    return request('/api/v1/banner/list', 'GET');
  },
  
  // 添加获取监控列表的方法
  getMonitorList: () => {
    return request('/api/v1/monitor/list', 'GET');
  },
  
  // 添加获取新闻列表的方法
  getNewsList: () => {
    return request('/api/v1/news/list', 'GET');
  },
  
  // 可以添加更多 API 方法...
}; 