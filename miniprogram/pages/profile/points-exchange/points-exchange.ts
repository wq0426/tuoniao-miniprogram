Page({
  data: {
    points: 0,
    nickname: '',
    exchangeItems: []
  },

  onLoad() {
    this.getPoints();
  },

  getPoints() {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';

    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
    }

    wx.request({
      url: `${app.globalData.domain}/api/v1/asset/info`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          this.setData({
            points: res.data.data.points,
            nickname: res.data.data.nickname
          });
        } else {
          wx.showToast({
            title: res.data?.message || '获取积分失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取积分失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });

    // 获取积分兑换列表
    this.getExchangeItems();
  },

  getExchangeItems() {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';

    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: `${app.globalData.domain}/api/v1/point/exchange/list`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          this.setData({
            exchangeItems: res.data.data.list
          });
        } else {
          wx.showToast({
            title: res.data?.message || '获取兑换列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取兑换列表失败:', err);
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

  showRules() {
    wx.navigateTo({
      url: '/pages/profile/points-exchange-rules/points-exchange-rules'
    });
  },

  viewExchangeRecord() {
    wx.navigateTo({
      url: '/pages/profile/points-exchange-records/points-exchange-records'
    });
  },

  exchangeItem(e: any) {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    const itemId = e.currentTarget.dataset.id;
    const item = this.data.exchangeItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    if (this.data.points < item.points) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });

      return;
    }
    
    wx.showModal({
      title: '确认兑换',
      content: `确定使用${item.points}积分兑换"${item.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.domain}/api/v1/point/exchange/exchange`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            data: {
              config_id: itemId
            },
            success: (res: any) => {
              if (res.data && res.data.code === 0) {  
                // Update points (in a real app this would be an API call)
                this.setData({
                  points: this.data.points - item.points
                });
                // Mock exchange success
                wx.showToast({
                  title: '兑换成功',
                  icon: 'success'
                });
                // 刷新积分兑换列表
                this.getExchangeItems();
              } else {
                wx.showToast({
                  title: res.data?.message || '兑换失败', 
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('兑换失败:', err);  
              wx.showToast({
                title: '兑换失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  }
}); 