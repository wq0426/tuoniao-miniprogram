Page({
  data: {
    monitors: [],
    loading: true,
    error: false,
    errorMessage: ''
  },
  
  onLoad() {
    this.fetchMonitorData();
  },
  
  // 获取监控数据
  fetchMonitorData() {
    this.setData({ loading: true, error: false });
    
    try {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      
      // 问题在于wx.request是异步的，但我们在使用同步方式调用并立即打印
      // 使用回调函数处理响应
      wx.request({
        url: app.globalData.domain + '/api/v1/monitor/list',
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0 && res.data.data.length > 0) {
            this.setData({
              monitors: res.data.data,
              loading: false
            });
            // 在数据设置完成后打印，确保能看到更新后的数据
            console.log('Monitor data after update:', this.data.monitors);
          } else {
            // API 返回错误
            this.setData({
              loading: false,
              error: true,
              errorMessage: (res.data && res.data.message) || '获取监控数据失败'
            });
          }
        },
        fail: (err) => {
          console.error('Request failed:', err);
          this.setData({
            loading: false,
            error: true,
            errorMessage: '网络请求失败'
          });
        }
      });
      // 这里打印的monitors可能是空的，因为request是异步的
      // 正确的做法是在success回调中打印
    } catch (err) {
      console.error('Error in fetchMonitorData:', err);
      this.setData({
        loading: false,
        error: true,
        errorMessage: '获取监控数据失败'
      });
    }
  },
  
  // 导航到详情页
  navigateToDetail(e) {
    const monitorId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/home/monitor/detail/detail?id=${monitorId}`
    });
  },
  
  // 返回首页
  navigateToHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },
  
  // 重试加载
  retryFetch() {
    this.fetchMonitorData();
  }
}); 