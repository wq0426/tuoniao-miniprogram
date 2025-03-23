Page({
  data: {
    currentTab: 0,
    balanceRecords: [],
    withdrawRecords: [],
    loading: false
  },

  onLoad(options: any) {
    if (options.tab == 0) {
      this.setData({ currentTab: 0 });
      // 加载余额明细数据
      this.fetchBalanceRecords();
    } else if (options.tab == 1) {
      this.setData({ currentTab: 1 });
      // 加载提现记录数据
      this.fetchWithdrawRecords();
    }
  },

  switchTab(e: any) {
    const tabIndex = e.currentTarget.dataset.index;
    this.setData({
      currentTab: tabIndex
    });

    // 根据当前标签页加载相应数据
    if (tabIndex == 0) {
      this.fetchBalanceRecords();
    } else if (tabIndex == 1) {
      this.fetchWithdrawRecords();
    }
  },

  // 获取余额明细
  fetchBalanceRecords() {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    wx.request({
      url: `${app.globalData.domain}/api/v1/asset/balance/records`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          this.setData({
            balanceRecords: res.data.data.records || []
          });
        } else {
          wx.showToast({
            title: res.data?.message || '获取余额明细失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取余额明细失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 获取提现记录
  fetchWithdrawRecords() {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    wx.request({
      url: `${app.globalData.domain}/api/v1/withdraw/list`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          this.setData({
            withdrawRecords: res.data.data.list || []
          });
        } else {
          wx.showToast({
            title: res.data?.message || '获取提现记录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取提现记录失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  navigateBack() {
    wx.navigateBack();
  }
}); 