Page({
  data: {
    order: null,
    loading: true,
    expanded: true  // 默认展开显示详细信息
  },

  onLoad(options: any) {
    // 从路由参数获取订单ID
    const orderId = options.id;
    if (orderId) {
      this.fetchOrderDetail(orderId);
    } else {
      wx.showToast({
        title: '订单ID不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 获取订单详情
  fetchOrderDetail(orderId: string) {
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
      url: `${app.globalData.domain}/api/v1/order/detail/${orderId}`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          this.setData({
            order: res.data.data,
            loading: false
          });
        } else {
          wx.showToast({
            title: res.data?.message || '获取订单详情失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取订单详情失败:', err);
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

  // 复制内容到剪贴板
  copyText(e: any) {
    const text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },

  // 再次购买
  buyAgain() {
    if (!this.data.order || !this.data.order.products || this.data.order.products.length === 0) {
      return;
    }
    
    // 将商品添加到购物车或直接跳转到商品详情页
    const firstProduct = this.data.order.products[0];
    wx.navigateTo({
      url: `/pages/product/product?id=${firstProduct.product_id}`
    });
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 添加toggleMoreInfo函数
  toggleMoreInfo() {
    const currentState = this.data.expanded;
    this.setData({
      expanded: !currentState
    });
  },
}); 