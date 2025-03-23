interface CouponItem {
  id: number;
  amount: string;
  condition: string;
  description: string;
  expiryDate: string;
  isUsed: boolean;
  isExpired: boolean;
}

Page({
  data: {
    currentTab: 0,
    coupons: [] as CouponItem[],
    couponList: [],
    loading: true
  },

  onLoad() {
    this.fetchCoupons();
  },

  // 获取优惠券列表
  fetchCoupons() {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    
    if (!token) {
      this.setData({
        loading: false
      });
      return;
    }

    wx.showLoading({
      title: '加载中...',
    });

    let url = `${app.globalData.domain}/api/v1/coupon/list`;
    wx.request({
      url: url,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          this.setData({
            coupons: res.data.data,
            couponList: res.data.data[0] || [],
            loading: false
          });
        } else {
          wx.showToast({
            title: res.data?.message || '获取优惠券失败',
            icon: 'none'
          });
          this.setData({
            loading: false
          });
        }
      },
      fail: (err) => {
        console.error('获取优惠券失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        this.setData({
          loading: false
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  navigateBack() {
    wx.navigateBack();
  },

  switchTab(e: any) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    console.log(tab, this.data.coupons, this.data.coupons[tab]);
    this.setData({
      currentTab: tab,
      couponList: this.data.coupons[tab] || []
    });
  },

  useCoupon(e: any) {
    const productId = e.currentTarget.dataset.productId;
    wx.redirectTo({
      url: `/pages/category/detail/detail?id=${productId}`
    });
  }
}); 