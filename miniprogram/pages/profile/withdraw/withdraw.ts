Page({
  data: {
    amount: '',
    balance: '345',  // 应该从全局状态或上一页传递
    minAmount: '0.01',
    maxDailyAmount: '5000',
    showMethodSelector: false,
    withdrawMethod: {
      id: 'wechat',
      name: '微信钱包',
      icon: '/images/icons/wechat-pay.png'
    },
    withdrawMethods: [
      {
        id: 'wechat',
        name: '微信钱包',
        icon: '/images/icons/wechat-pay.png'
      },
      {
        id: 'alipay',
        name: '支付宝',
        icon: '/images/icons/alipay.png'
      }
    ]
  },

  onLoad(options) {
    // 如果上一页传递了余额信息，则使用
    if (options && options.balance) {
      this.setData({
        balance: options.balance
      });
    }
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 打开提现方式选择器
  openMethodSelector() {
    this.setData({
      showMethodSelector: true
    });
  },
  
  // 关闭提现方式选择器
  closeMethodSelector() {
    this.setData({
      showMethodSelector: false
    });
  },
  
  // 选择提现方式
  selectWithdrawMethod(e) {
    const methodId = e.currentTarget.dataset.id;
    const method = this.data.withdrawMethods.find(m => m.id === methodId);
    
    this.setData({
      withdrawMethod: method,
      showMethodSelector: false
    });
  },

  // 输入金额时触发
  onAmountInput(e: any) {
    let value = e.detail.value;
    
    // 验证只能输入数字和小数点
    if (value && !/^\d*\.?\d{0,2}$/.test(value)) {
      value = this.data.amount;
    }
    
    this.setData({
      amount: value
    });
  },

  // 处理提现
  handleWithdraw() {
    const { amount, balance, minAmount } = this.data;
    
    if (!amount || parseFloat(amount) <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      });
      return;
    }

    if (parseFloat(amount) < parseFloat(minAmount)) {
      wx.showToast({
        title: `最少提现金额${minAmount}元`,
        icon: 'none'
      });
      return;
    }

    // 检查余额是否足够
    if (parseFloat(amount) > parseFloat(balance)) {
      wx.showToast({
        title: '余额不足',
        icon: 'none'
      });
      return;
    }

    // 在实际应用中，这里会调用提现API
    wx.showLoading({
      title: '处理中...'
    });

    // 模拟提现过程
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
        url: `${app.globalData.domain}/api/v1/withdraw/create`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        data: {
          amount: parseFloat(amount)
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0) {
            wx.hideLoading();
            wx.showToast({
              title: '提现申请已提交',
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
              title: res.data?.message || '提现失败',
              icon: 'none'
            });
            return;
          }
        },
        fail: (err) => {
          console.error('提现请求失败:', err);
          wx.hideLoading();
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          return;
        }
      });
    }, 1500);
  },

  // 全部提现
  withdrawAll() {
    this.setData({
      amount: this.data.balance
    });
  }
}); 