Page({
  data: {
    returnId: '',
    returnDetail: {
      id: '',
      status: 'completed',
      statusText: '退款成功',
      productName: '鸵小妥精选-元宝肉',
      productImage: 'https://txtimages.oss-cn-beijing.aliyuncs.com/product/product1.jpg',
      price: '298',
      quantity: 1,
      returnId: '11111111111111111111',
      serviceType: '仅退款',
      reason: '退款',
      description: '000',
      applyTime: '2025-02-22 15:31',
      approveTime: '02/24 20:51',
      completeTime: '02/24 20:51'
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        returnId: options.id
      });
      this.fetchReturnDetail(options.id);
    }
  },

  // 获取退款详情数据
  fetchReturnDetail(id: string) {
    const app = getApp();
    const apiUrl = app.globalData.domain;
    const token = wx.getStorageSync('token') || '';
    // 调用/refund/detail/{refund_id}获取退款详情数据
    wx.request({
      url: apiUrl + `/api/v1/refund/detail/${id}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: (res: any) => {
        console.log("==>",res.data.data);
        if (res.data.code === 0) {
          this.setData({
            returnDetail: res.data.data.refund,
            orderDetail: res.data.data.order_detail
          });
        } else {
          wx.showToast({
            title: '获取退款详情失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 复制退款编号
  copyReturnId() {
    wx.setClipboardData({
      data: this.data.returnDetail.returnId,
      success: () => {
        wx.showToast({
          title: '已复制退款编号',
          icon: 'success'
        });
      }
    });
  }
}); 