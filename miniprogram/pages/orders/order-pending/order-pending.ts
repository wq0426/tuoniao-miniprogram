Page({
  data: {
    orderId: '',
    countdownMin: 25,
    countdownSec: 0,
    timer: null as any,
    orderInfo: {
      id: '1',
      status: 'pending',
      productName: '鸵小妥精选-元宝肉',
      productImage: 'https://txtimages.oss-cn-beijing.aliyuncs.com/product/product1.jpg',
      price: '298',
      quantity: 1
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        orderId: options.id
      });
      this.fetchOrderDetails(options.id);
    }
    
    // 开始倒计时
    this.startCountdown();
  },

  onUnload() {
    // 清除定时器避免内存泄漏
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  // 获取订单详情
  fetchOrderDetails(orderId: string) {
    // 实际应用中这里应该从服务器获取订单详情
    console.log(`Fetching order details for order: ${orderId}`);
    
    // 这里仅为演示，使用静态数据
    // this.setData({
    //   orderInfo: {
    //     ...this.data.orderInfo,
    //     id: orderId
    //   }
    // });
  },

  // 开始倒计时
  startCountdown() {
    // 初始化为25分钟
    let totalSeconds = this.data.countdownMin * 60;
    
    const timer = setInterval(() => {
      totalSeconds--;
      
      if (totalSeconds <= 0) {
        // 时间到，清除定时器并处理订单超时
        clearInterval(timer);
        this.handleOrderTimeout();
        return;
      }
      
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      this.setData({
        countdownMin: minutes,
        countdownSec: seconds
      });
    }, 1000);
    
    this.setData({ timer });
  },

  // 订单超时处理
  handleOrderTimeout() {
    wx.showModal({
      title: '支付超时',
      content: '您的订单已超时未支付，是否重新下单？',
      confirmText: '重新下单',
      cancelText: '返回首页',
      success: (res) => {
        if (res.confirm) {
          // 跳转到购物车或商品详情页重新下单
          wx.switchTab({
            url: '/pages/cart/cart'
          });
        } else {
          // 返回首页
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }
    });
  },

  // 取消订单
  cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用取消订单接口
          console.log(`Cancelling order: ${this.data.orderId}`);
          
          // 假设取消成功
          wx.showToast({
            title: '订单已取消',
            icon: 'success',
            success: () => {
              // 延迟返回订单列表页
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            }
          });
        }
      }
    });
  },

  // 去支付
  goToPay() {
    // 这里应该调用支付API
    console.log(`Processing payment for order: ${this.data.orderId}`);
    
    // 模拟支付过程
    wx.showLoading({
      title: '正在支付...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        success: () => {
          // 支付成功后跳转到订单详情页
          setTimeout(() => {
            wx.redirectTo({
              url: `/pages/orders/order-detail/order-detail?id=${this.data.orderId}&status=paid`
            });
          }, 1500);
        }
      });
    }, 2000);
  }
}); 