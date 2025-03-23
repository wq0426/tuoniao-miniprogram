Page({
  data: {
    balance: 0
  },

  onLoad(options: any) {
    // 调用接口获取余额
    this.getBalance();
  },
  
  onShow() {
    // 每次页面显示时刷新余额数据
    this.getBalance();
  },
  
  getBalance() {
    const app = getApp();
    const token = wx.getStorageSync('token') || ''; 
    
    wx.request({
      url: `${app.globalData.domain}/api/v1/asset/info`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          this.setData({
            balance: res.data.data.balance
          });
          console.log('onLoad:',res.data.data.balance);
        } else {
          wx.showToast({
            title: res.data?.message || '获取余额失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取余额失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  navigateBack() {
    wx.navigateBack();
  },

  handleRecharge() {
    wx.navigateTo({
      url: '/pages/profile/recharge/recharge'
    });
  },

  handleWithdraw() {
    wx.navigateTo({
      url: '/pages/profile/withdraw/withdraw?balance=' + this.data.balance
    });
  },

  handleTransfer() {
    wx.showToast({
      title: '转增功能开发中',
      icon: 'none'
    });
  },

  navigateToBalanceDetails() {
    wx.navigateTo({
      url: '/pages/profile/balance-detail/balance-detail?tab=0'
    });
  },

  navigateToWithdrawalRecords() {
    wx.navigateTo({
      url: '/pages/profile/balance-detail/balance-detail?tab=1'
    });
  },

  navigateToTransferRecords() {
    wx.showToast({
      title: '转增记录页面开发中',
      icon: 'none'
    });
  }
}); 