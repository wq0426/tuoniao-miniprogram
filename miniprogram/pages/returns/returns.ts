Page({
  data: {
    currentTab: 0,
    searchKeyword: '',
    tabs: ['全部', '进行中', '已完成'],
    returns: [
      {
        id: '1',
        storeName: '鸵小妥',
        storeIcon: 'https://txtimages.oss-cn-beijing.aliyuncs.com/icons/dianpu.png',
        status: 'processing',
        statusText: '退款进行中',
        productName: '鸵小妥精选-元宝肉',
        productImage: 'https://txtimages.oss-cn-beijing.aliyuncs.com/product/product1.jpg',
        price: '298',
        quantity: 1,
        reason: '商品质量问题',
        applyTime: '2023-06-15'
      },
      {
        id: '2',
        storeName: '鸵小妥',
        storeIcon: 'https://txtimages.oss-cn-beijing.aliyuncs.com/icons/dianpu.png',
        status: 'completed',
        statusText: '退款成功',
        productName: '鸵小妥优选-鸵鸟精肉',
        productImage: 'https://txtimages.oss-cn-beijing.aliyuncs.com/product/product2.jpg',
        price: '75',
        quantity: 1,
        reason: '不想要了',
        applyTime: '2023-06-10',
        completeTime: '2023-06-12'
      }
    ],
    allReturns: [], // 用于存储所有退换货数据，便于筛选
    showCancelConfirm: false,  // 控制撤销确认弹窗显示
    currentReturnId: ''        // 当前操作的退换货ID
  },

  onLoad() {
    // 初始化所有退换货数据, 调用/api/v1/return/list接口
    this.getReturns(0);
    // 根据URL参数设置当前选中的标签
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    
    if (options && options.tab) {
      const tabIndex = parseInt(options.tab);
      this.setData({
        currentTab: tabIndex
      });
      this.filterReturnsByTab(tabIndex);
    }
  },

  getReturns(status: number) {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: `${app.globalData.domain}/api/v1/refund/list?status=${status}`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        console.log('getReturns success:', res);
        this.setData({
          returns: res.data.data.list
        });
      },
      fail: (err) => {
        console.error('getReturns failed:', err);
      }
    });
  },
  
  // 切换标签
  switchTab(e: any) {
    // 根据标签筛选退换货
    const tabIndex = e.currentTarget.dataset.index;
    this.getReturns(tabIndex);
    this.setData({
      currentTab: tabIndex
    });
    this.filterReturnsByTab(tabIndex);
  },
  
  // 根据标签筛选退换货
  filterReturnsByTab(tabIndex: number) {
    let allReturns = this.data.allReturns;
    let filteredReturns = [];
    
    switch (tabIndex) {
      case 0: // 全部
        filteredReturns = allReturns;
        break;
      case 1: // 处理中
        filteredReturns = allReturns.filter(item => item.status === 'processing');
        break;
      case 2: // 已完成
        filteredReturns = allReturns.filter(item => item.status === 'completed');
        break;
      default:
        filteredReturns = allReturns;
    }
    
    this.setData({
      returns: filteredReturns
    });
  },
  
  // 搜索输入事件
  onSearchInput(e: any) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },
  
  // 执行搜索
  onSearch() {
    const { searchKeyword, allReturns, currentTab } = this.data;
    let filteredReturns = allReturns;
    
    // 先按标签筛选
    switch (currentTab) {
      case 1: // 处理中
        filteredReturns = filteredReturns.filter(item => item.status === 'processing');
        break;
      case 2: // 已完成
        filteredReturns = filteredReturns.filter(item => item.status === 'completed');
        break;
    }
    
    // 再按关键词筛选
    if (searchKeyword) {
      filteredReturns = filteredReturns.filter(item => 
        item.productName.includes(searchKeyword) || 
        item.storeName.includes(searchKeyword) ||
        item.reason.includes(searchKeyword)
      );
    }
    
    this.setData({
      returns: filteredReturns
    });
  },
  
  // 修改取消申请方法 - 显示自定义弹窗
  cancelReturn(e: any) {
    const returnId = e.currentTarget.dataset.id;
    this.setData({
      showCancelConfirm: true,
      currentReturnId: returnId
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showCancelConfirm: false,
      currentReturnId: ''
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    return;
  },

  // 确认撤销
  confirmCancel() {
    const returnId = this.data.currentReturnId;
    if (!returnId) return;

    // 从列表中移除该记录
    const { returns, allReturns } = this.data;
    const updatedReturns = returns.filter(item => item.id !== returnId);
    const updatedAllReturns = allReturns.filter(item => item.id !== returnId);
    
    // 调用/api/v1/refund/cancel接口
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: `${app.globalData.domain}/api/v1/refund/cancel`,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + token
      },
      data: {
        refund_id: returnId
      },
      success: (res: any) => {
        if (res.data.code == 0) {
          this.setData({
            returns: updatedReturns,
            allReturns: updatedAllReturns,
            showCancelConfirm: false,
            currentReturnId: ''
          });
          
          wx.showToast({
            title: '已撤销申请',
            icon: 'success'
            });
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('confirmCancel failed:', err);
      }
    }); 
  },
  
  // 删除记录
  deleteReturn(e: any) {
    const returnId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该退换货记录吗？',
      success: res => {
        if (res.confirm) {
          // 调用/api/v1/refund/delete接口
          const app = getApp();
          const token = wx.getStorageSync('token') || '';
          wx.request({
            url: `${app.globalData.domain}/api/v1/refund/delete/${returnId}`,
            method: 'DELETE',
            header: {
              'Authorization': 'Bearer ' + token
            },
            success: (res: any) => {
              if (res.data.code == 0) {
                // 从列表中移除该记录
                const { returns, allReturns } = this.data;
                const updatedReturns = returns.filter(item => item.id !== returnId);
                const updatedAllReturns = allReturns.filter(item => item.id !== returnId);
                
                this.setData({
                  returns: updatedReturns,
                  allReturns: updatedAllReturns
                });
                
                wx.showToast({
                    title: '删除成功',
                      icon: 'success'
                    });
                  } else {
                    wx.showToast({
                      title: res.data.message,
                      icon: 'none'
                    });
              }
            }
          });
        }
      }
    });
  },
  
  // 查看进度
  trackReturn(e: any) {
    const returnId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/returns/return-detail/return-detail?id=${returnId}`
    });
  },
  
  // 查看详情
  viewDetails(e: any) {
    const returnId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/return-detail/return-detail?id=${returnId}`
    });
  },
  
  // 跳转到退换货详情
  navigateToReturnDetail(e: any) {
    const returnId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/returns/return-detail/return-detail?id=${returnId}`
    });
  }
}); 