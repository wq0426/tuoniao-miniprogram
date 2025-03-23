Page({
  data: {
    showPaymentModal: false,
    selectedPaymentMethod: 'wechat',
    totalPrice: 0
  },

  onLoad() {
    // 页面加载时的初始化
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 输入金额时触发
  onAmountInput(e: any) {
    let value = e.detail.value;
    
    // 验证只能输入数字和小数点
    if (value && !/^\d*\.?\d{0,2}$/.test(value)) {
      value = this.data.amount;
    }
    
    this.setData({
      totalPrice: value
    });
  },

  // 打开支付弹窗
  openPaymentModal() {
    this.setData({
      showPaymentModal: true
    });
  },

  // 关闭支付弹窗
  closePaymentModal() {
    this.setData({
      showPaymentModal: false
    });
  },

  selectPaymentMethod(e: any) {
    const method = e.currentTarget.dataset.method;
    this.setData({
      selectedPaymentMethod: method
    });
  },

  // 处理充值
  handleRecharge() {
    const { totalPrice } = this.data;
    
    if (!totalPrice || totalPrice <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      });
      return;
    }

    // 在实际应用中，这里会调用支付API
    wx.showLoading({
      title: '处理中...'
    });

    // 模拟支付过程
    setTimeout(() => {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      
      if (!token) {
        wx.hideLoading();
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      wx.request({
        url: `${app.globalData.domain}/api/v1/asset/recharge`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        data: {
          amount: parseInt(totalPrice.toString())
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0) {
            wx.hideLoading();
            wx.showToast({
              title: '充值成功',
              icon: 'success',
              duration: 2000,
              success: () => {
                // 延迟返回，让用户看到成功提示
                setTimeout(() => {
                  wx.navigateBack();
                }, 2000);
              }
            });
          } else {
            wx.hideLoading();
            wx.showToast({
              title: res.data?.message || '充值失败',
              icon: 'none'
            });
            return;
          }
        },
        fail: (err) => {
          console.error('充值请求失败:', err);
          wx.hideLoading();
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          return;
        }
      });
    }, 1500);
  }
}); 