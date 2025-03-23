Page({
  data: {
    records: [
      {
        id: 1,
        name: '满100-20元优惠券',
        points: 30,
        date: '2023-09-15 14:30:25',
        status: '已完成'
      },
      {
        id: 2,
        name: '满200-65元优惠券',
        points: 150,
        date: '2023-08-23 10:15:38',
        status: '已完成'
      },
      {
        id: 3,
        name: '鸵鸟排骨兑换券',
        points: 600,
        date: '2023-07-07 16:42:59',
        status: '已完成'
      },
      {
        id: 4,
        name: '满400-100元优惠券',
        points: 300,
        date: '2023-06-20 09:05:12',
        status: '已完成'
      },
      {
        id: 5,
        name: '满100-35元优惠券',
        points: 60,
        date: '2023-05-18 18:23:47',
        status: '已完成'
      }
    ]
  },

  onLoad() {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    // 调用接口/point/exchange/records
    wx.request({
      url: `${app.globalData.domain}/api/v1/asset/exchange/records?page=1&page_size=9999`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          this.setData({
            records: res.data.data.records
          });
        }
      }
    });
  },

  navigateBack() {
    wx.navigateBack();
  },

  exchangeItem(e: any) {
    wx.navigateTo({
      url: '/pages/category/category'
    });
  }
}); 