import api from '../../utils/api';

Page({
    data: {
        userInfo: {
            avatar: '',
            nickname: '',
            phone: '',
            points: 0,
            balance: 0,
            level: '',
            member_expire: '',  // 会员过期时间
            orders: {
                unpaid: 0,
                unshipped: 0,
                shipped: 0,
                completed: 0
            }
        },
        loading: true,
        progressPercentage: 0  // 添加进度百分比属性
    },
    onLoad() {
        this.fetchUserProfile();
    },
    onShow() {
        this.fetchUserProfile();
    },
    fetchUserProfile() {
        const app = getApp();
        const token = wx.getStorageSync('token') || '';
        
        if (!token) {
            this.setData({
                loading: false
            });
            return;
        }
        
        wx.request({
            url: `${app.globalData.domain}/api/v1/account/profile`,
            method: 'GET',
            header: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            success: (res: any) => {
                if (res.data && res.data.code === 0 && res.data.data) {
                    const userData = res.data.data;
                    
                    // 计算进度百分比
                    let percentage = 0;
                    if (userData.step_max_point && userData.step_max_point > 0) {
                        percentage = (userData.point / userData.step_max_point) * 100;
                        // 限制最大值为100%
                        percentage = Math.min(percentage, 100);
                    }
                    this.setData({
                        userInfo: userData,
                        progressPercentage: percentage,
                        loading: false
                    });
                } else {
                    wx.showToast({
                        title: res.data?.message || '获取用户信息失败',
                        icon: 'none'
                    });
                    this.setData({
                        loading: false
                    });
                }
            },
            fail: (err) => {
                console.error('获取用户信息失败:', err);
                wx.showToast({
                    title: '网络错误',
                    icon: 'none'
                });
                this.setData({
                    loading: false
                });
            }
        });
    },
    navigateToHome() {
      wx.navigateTo({
        url: '/pages/home/home'
      });
    },
    navigateToProfileDetail() {
      wx.navigateTo({
        url: '/pages/profile/profile-detail/profile-detail'
      });
    },
    navigateToCouponList() {
      wx.navigateTo({
        url: '/pages/profile/coupon-list/coupon-list'
      });
    },
    navigateToBalance() {
      wx.navigateTo({
        url: '/pages/profile/balance/balance?balance=' + this.data.userInfo.user_asset.balance
      });
    },
    navigateToPointsExchange() {
      wx.navigateTo({
        url: '/pages/profile/points-exchange/points-exchange'
      });
    },
    navigateToRights() {
      wx.navigateTo({
        url: '/pages/profile/rights/rights'
      });
    },
    navigateToPendingPayment() {
      wx.navigateTo({
        url: '/pages/orders/orders?tab=1'  // tab=1 表示跳转到"待付款"标签页
      });
    },
    navigateToAllOrders() {
      wx.navigateTo({
        url: '/pages/orders/orders?tab=0'  // tab=0 表示跳转到"全部"标签页
      });
    },
    navigateToOrders(e: any) {
      const type = e.currentTarget.dataset.type;
      wx.navigateTo({
        url: `/pages/orders/orders?tab=${type}`
      });
    },
    navigateToReturns(e: any) {
      const type = e.currentTarget.dataset.type;
      wx.navigateTo({
        url: `/pages/returns/returns?tab=${type}`
      });
    },
    navigateToMyReviews(e: any) {
      const type = e.currentTarget.dataset.type || 0; // 默认跳转到"全部"标签
      wx.navigateTo({
        url: `/pages/my-reviews/my-reviews?tab=${type}`
      });
    },
    navigateToIncome() {
      wx.navigateTo({
        url: '/pages/income/income'
      });
    },
    navigateToAddress() {
      wx.navigateTo({
        url: '/pages/address/address'
      });
    },
    navigateToAboutUs() {
      wx.navigateTo({
        url: '/pages/about-us/about-us'
      });
    },
    navigateToSettings() {
      wx.navigateTo({
        url: '/pages/settings/settings'
      });
    },
    navigateToOrder(e: any) {
      const status = e.currentTarget.dataset.status;
      wx.navigateTo({
        url: `/pages/orders/orders?status=${status}`
      });
    },
    navigateToService() {
      wx.openCustomerServiceChat({
        extInfo: {},
        success(res) {
          console.log('打开客服窗口', res);
        }
      });         
    }
}); 