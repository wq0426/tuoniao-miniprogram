Page({
  data: {
    currentTab: 0,
    searchKeyword: '',
    tabs: ['全部', '待付款', '待发货', '待收货', '已完成'],
    orders: [],
    allOrders: [], // 用于存储所有订单数据，便于筛选
    page: 1,
    pageSize: 9999,
    totalOrders: 0,
    loading: false,
    hasMore: true
  },

  onLoad(options) {
    // 根据URL参数设置当前选中的标签
    if (options && options.tab) {
      const tabIndex = parseInt(options.tab);
      this.setData({
        currentTab: tabIndex
      });
    }
    
    // 获取订单列表
    this.fetchOrders();
  },

  onShow() {
    // 获取订单列表
    this.fetchOrders();
  },
  
  // 获取订单列表
  fetchOrders(page = 1, append = false) {
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
      url: `${app.globalData.domain}/api/v1/order/list`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      data: {
        page: page,
        page_size: this.data.pageSize,
        status: this.getStatusFilter()
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          const orderData = res.data.data;
          const orders = orderData.orders || [];
          
          const allOrders: any[] = [];
          orders.forEach((order: any) => {
              allOrders.push({
                ...order, product: order.product
              });
          });
          // 处理订单数据
          this.setData({
            orders: allOrders,
            totalOrders: orderData.total || 0,
            page: orderData.page || 1,
            hasMore: orders.length >= this.data.pageSize
          });
          console.log("orders:",this.data.orders);
          console.log("totalOrders:",this.data.totalOrders);
          console.log(this.data.page);
          console.log(this.data.hasMore);
          
          // 应用当前选中标签的筛选
          this.filterOrdersByTab(this.data.currentTab);
        } else {
          wx.showToast({
            title: res.data?.message || '获取订单失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取订单列表失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
      }
    });
  },
  
  // 根据当前标签获取状态筛选参数
  getStatusFilter() {
    const tabIndex = this.data.currentTab;
    switch (tabIndex) {
      case 0: return '-1'; // 全部
      case 1: return '0'; // 待付款
      case 2: return '1'; // 待发货
      case 3: return '2'; // 待收货
      case 4: return '3'; // 已完成
      default: return '-1';
    }
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.fetchOrders(1, false);
  },
  
  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.fetchOrders(this.data.page + 1, true);
    }
  },
  
  // 切换标签
  switchTab(e: any) {
    const tabIndex = e.currentTarget.dataset.index;
    this.setData({
      currentTab: tabIndex,
      page: 1,
      hasMore: true
    });
    
    // 重新获取订单
    this.fetchOrders(1, false);
  },
  
  // 根据标签筛选订单
  filterOrdersByTab(tabIndex: number) {
    // 由于我们现在使用API来过滤，这个方法只用于本地搜索时
    if (this.data.searchKeyword) {
      let filteredOrders = this.data.orders.filter(order => 
        order.order_no.includes(this.data.searchKeyword) || 
        order.store_name?.includes(this.data.searchKeyword)
      );
      
      this.setData({
        orders: filteredOrders
      });
    }
  },
  
  // 搜索输入
  onSearchInput(e: any) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },
  
  // 执行搜索
  onSearch() {
    if (this.data.searchKeyword) {
      this.filterOrdersByTab(this.data.currentTab);
    } else {
      // 如果搜索关键词为空，重新获取订单
      this.fetchOrders(1, false);
    }
  },
  
  // 删除订单
  deleteOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该订单吗？',
      success: res => {
        if (res.confirm) {
          const app = getApp();
          const token = wx.getStorageSync('token') || '';
          
          wx.request({
            url: `${app.globalData.domain}/api/v1/order/delete`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            data: {
              id: orderId
            },
            success: (res: any) => {
              if (res.data && res.data.code === 0) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                
                // 刷新订单列表
                this.fetchOrders(1, false);
              } else {
                wx.showToast({
                  title: res.data?.message || '删除失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('删除订单失败:', err);
              wx.showToast({
                title: '网络错误',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 取消订单
  cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: res => {
        if (res.confirm) {
          const app = getApp(); 
          const token = wx.getStorageSync('token') || '';
          
          wx.request({
            url: `${app.globalData.domain}/api/v1/order/status`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
              },  
            data: {
              order_id: orderId,
              status: 5
            },
            success: (res: any) => {
              if (res.data && res.data.code === 0) {
                wx.showToast({
                  title: '取消订单成功',
                  icon: 'success'
                });
                
                // 刷新订单列表
                this.fetchOrders(1, false);
              } else {
                wx.showToast({
                  title: res.data?.message || '取消订单失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('取消订单失败:', err);
              wx.showToast({
                title: '网络错误',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },
  
  // 再次购买
  buyAgain(e: any) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/cart/checkout/checkout?order_id=${orderId}`
    });
  },
  
  // 查看物流
  checkLogistics(e) {
    const orderId = e.currentTarget.dataset.id;
    console.log("orderId:",orderId);
    wx.navigateTo({
      url: `/pages/orders/logistics/logistics?order_id=${orderId}`
    });
  },
  
  // 评价订单
  reviewOrder(e: any) {
    const orderItemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/review/review?orderItemId=${orderItemId}`
    });
  },
  
  // 跳转到订单详情
  navigateToOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/orders/detail/detail?order_id=${orderId}`
    });
  },

  // 去支付
  goPay(e: any) {
    const orderItemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/cart/checkout/checkout?order_item_id=${orderItemId}`
    });
  },

  // 申请退款
  refund(e: any) {
    const orderId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '申请退款',
      content: '确定要申请退款吗？',
      success: (res: any) => {
        if (res.confirm) {
          // 实现退款API调用
          const app = getApp(); 
          const token = wx.getStorageSync('token') || '';
          
          wx.request({
            url: `${app.globalData.domain}/api/v1/refund/create`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            data: {
              order_item_id: orderId,
              refund_reason: '用户申请退款',
              images: "",
              refund_type: 1
            },
            success: (res: any) => {
              if (res.data && res.data.code === 0) {
                wx.showToast({
                  title: '退款申请已提交',
                  icon: 'success'
                });
                // 刷新订单列表
                this.fetchOrders(1, false);
              } else {
                wx.showToast({
                  title: res.data?.message || '退款申请失败',
                  icon: 'none'
                });
              }
            }
          });
        }
      }
    });
  },

  // 已收货
  received(e: any) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确认已收货吗？',
      success: (res: any) => {
        if (res.confirm) {
          // 实现已收货API调用
          const app = getApp(); 
          const token = wx.getStorageSync('token') || '';
          wx.request({
            url: `${app.globalData.domain}/api/v1/order/status`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            data: {
              order_id: orderId,
              status: 3
            },
            success: (res: any) => {
              if (res.data && res.data.code === 0) {
                wx.showToast({
                  title: '已收货',
                  icon: 'success'
                });
                // 刷新订单列表
                this.fetchOrders(1, false);
              } else {  
                wx.showToast({
                  title: res.data?.message || '已收货失败',
                  icon: 'none'
                });
              }
            }
          });
        }
      }
    });
  },

  viewOrderDetail(e: any) {
    const orderId = e.currentTarget.dataset.id;
    console.log(orderId);
    wx.navigateTo({
      url: `/pages/orders/detail/detail?id=${orderId}`
    });
  }
}); 