Page({
    data: {
        orderId: '',
        trackingNumber: 'SF3146527917804', // Default or placeholder
        logistics: [],
        phone: ''
    },
    onLoad(options) {
        if (options.order_id) {
            this.setData({
                orderId: options.order_id
            });
            this.fetchLogisticsInfo(options.order_id);
        }
    },
    // 获取物流信息
    fetchLogisticsInfo(orderId) {
        const app = getApp();
        const token = wx.getStorageSync('token') || '';
        
        if (!token) {
            wx.showToast({
                title: '请先登录',
                icon: 'none'
            });
            return;
        }
        
        // 这里使用示例数据，实际应该调用后端API获取物流信息
        wx.request({
          url: `${app.globalData.domain}/api/v1/order/get-order-info`,
          method: 'POST',
          header: {
            'Authorization': 'Bearer ' + token
          },
          data: {
            orderItemNo: orderId
          },
          success: (res) => {
            console.log(res)
            if (res.data && res.data.code === 0) {
              const logisticsData = res.data.data;
              this.setData({
                trackingNumber: logisticsData.mailNo,
                logistics: logisticsData.routes,
                phone: logisticsData.phone
              });
            } else {
              wx.showToast({
                title: res.data?.message || '获取物流信息失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            console.error('获取物流信息失败:', err);
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            });
          }
        });
        
        // 使用模拟数据（根据订单ID可以加入一些变化）
        // 实际项目中应该替换为真实API调用
        console.log(`Fetching logistics for order: ${orderId}`);
    },
    // 返回上一页
    navigateBack() {
        wx.navigateBack();
    },
    // 复制快递单号
    copyTrackingNumber() {
        wx.setClipboardData({
            data: this.data.trackingNumber,
            success: () => {
                wx.showToast({
                    title: '复制成功',
                    icon: 'success'
                });
            }
        });
    },
    // 拨打快递员电话
    callCourier() {
        wx.makePhoneCall({
            phoneNumber: this.data.phone,
            fail: (err) => {
                console.error('拨打电话失败:', err);
            }
        });
    }
}) 