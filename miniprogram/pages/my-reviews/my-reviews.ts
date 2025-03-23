Page({
  data: {
    currentTab: 0,
    tabs: ['全部', '待评价', '已评价'],
    reviewItems: [
      {
        id: '1',
        orderId: '10001',
        productId: '101',
        storeName: '鸵小妥',
        storeIcon: 'https://txtimages.oss-cn-beijing.aliyuncs.com/icons/dianpu.png',
        statusText: '已完成',
        productName: '鸵小妥优选-鸵鸟精肉',
        productImage: 'https://txtimages.oss-cn-beijing.aliyuncs.com/product/product2.jpg',
        price: '75',
        quantity: 1,
        reviewStatus: 'pending',
        orderTime: '2023-06-10'
      },
      {
        id: '2',
        orderId: '10002',
        productId: '102',
        storeName: '鸵小妥',
        storeIcon: 'https://txtimages.oss-cn-beijing.aliyuncs.com/icons/dianpu.png',
        statusText: '已完成',
        productName: '鸵小妥精选-元宝肉',
        productImage: 'https://txtimages.oss-cn-beijing.aliyuncs.com/product/product1.jpg',
        price: '298',
        quantity: 1,
        reviewStatus: 'completed',
        orderTime: '2023-06-15',
        reviewTime: '2025-02-15',
        reviewContent: '这个很好很棒特别好特别棒，好吃好好吃好吃好好吃',
        reviewImages: [
          'https://txtimages.oss-cn-beijing.aliyuncs.com/category/product1.jpg',
          'https://txtimages.oss-cn-beijing.aliyuncs.com/category/product2.jpg',
          'https://txtimages.oss-cn-beijing.aliyuncs.com/category/product3.jpg'
        ],
        isAnonymous: false
      }
    ],
    allReviewItems: [],
    showSettingsModal: false,
    currentReviewId: ''
  },

  onLoad(options: any) {
    const tab = options.tab || 0;
    this.setData({
      currentTab: tab
    });
    this.switchTab({ currentTarget: { dataset: { index: tab } } });
  },

  onShow() {
    const tabIndex = this.data.currentTab;
    this.switchTab({ currentTarget: { dataset: { index: tabIndex } } });
  },

  // 切换标签
  switchTab(e: any) {
    const tabIndex = e.currentTarget.dataset.index;
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: `${app.globalData.domain}/api/v1/review/user/tab?tab=${tabIndex}`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          // 保存所有评价项目的副本，便于筛选
          this.setData({
            reviewItems: res.data.data.list,
            currentTab: tabIndex
          });
        }
      }
    });
  },

  // 删除评价
  deleteReview(e) {
    const reviewId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除这条订单记录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          const token = wx.getStorageSync('token') || '';
          // 调用/apt/v1/delete/:review_id接口删除评价
          wx.request({
            url: `${app.globalData.domain}/api/v1/review/delete/${reviewId}`,
            method: 'DELETE',
            header: {
              'Authorization': 'Bearer ' + token
            },
            success: (res: any) => {
              if (res.data && res.data.code === 0) {
                // 从当前列表和全部列表中移除该订单
                const reviewItems = this.data.reviewItems.filter(item => item.id !== reviewId);
                const allReviewItems = this.data.allReviewItems.filter(item => item.id !== reviewId);
                this.setData({
                  reviewItems,
                  allReviewItems
                });
                
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
              }
            }
          })
        }
      }
    });
  },

  // 跳转到评价页面
  navigateToReview(e) {
    const orderItemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/review/review?orderItemId=${orderItemId}`
    });
  },

  // 查看评价
  viewReview(e) {
    const orderId = e.currentTarget.dataset.id;
    const reviewId = e.currentTarget.dataset.reviewId;
    console.log("reviewId:",reviewId);
    wx.navigateTo({
      url: `/pages/review/review?orderItemId=${orderId}&reviewId=${reviewId}`
    });
  },

  // 跳转到商品详情
  navigateToProductDetail(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product/product?id=${productId}`
    });
  },

  // 添加预览图片的功能
  previewImage(e) {
    const urls = e.currentTarget.dataset.urls;
    const current = e.currentTarget.dataset.current;
    
    wx.previewImage({
      current,
      urls
    });
  },

  // 修改点击删除按钮的处理函数
  onReviewSettingsClick(e) {
    const reviewId = e.currentTarget.dataset.id;
    this.setData({
      showSettingsModal: true,
      currentReviewId: reviewId
    });
  },

  // 关闭设置弹窗
  closeSettingsModal() {
    this.setData({
      showSettingsModal: false
    });
  },

  // 设置评价为公开
  setReviewPublic() {
    const reviewId = this.data.currentReviewId;
    // 更新指定评价的匿名状态
    const { reviewItems, allReviewItems } = this.data;
    
    // 更新当前显示列表中的评价
    const updatedReviewItems = reviewItems.map(item => {
      if (item.id === reviewId) {
        return { ...item, isAnonymous: false };
      }
      return item;
    });
    
    // 更新全部评价列表
    const updatedAllReviewItems = allReviewItems.map(item => {
      if (item.id === reviewId) {
        return { ...item, isAnonymous: false };
      }
      return item;
    });

    // 调用/api/v1/review/update_anonymous接口更新评价的匿名状态
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: `${app.globalData.domain}/api/v1/review/update_anonymous`,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + token
      },
      data: {
        review_id: reviewId,
        is_anonymous: false
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          this.setData({
            reviewItems: updatedReviewItems,
            allReviewItems: updatedAllReviewItems,
            showSettingsModal: false
          });
          wx.showToast({
            title: '已设为公开',
            icon: 'success'
          });
        }
      }
    });
  },

  // 隐藏评价
  hideReview() {
    const reviewId = this.data.currentReviewId;
    // 更新指定评价的匿名状态
    const { reviewItems, allReviewItems } = this.data;
    
    // 更新当前显示列表中的评价
    const updatedReviewItems = reviewItems.map(item => {
      if (item.id === reviewId) {
        return { ...item, isAnonymous: true };
      }
      return item;
    });
    
    // 更新全部评价列表
    const updatedAllReviewItems = allReviewItems.map(item => {
      if (item.id === reviewId) {
        return { ...item, isAnonymous: true };
      }
      return item;
    });
    
    wx.showModal({
      title: '确认匿名',
      content: '匿名后评价将无法恢复，确定继续吗？',
      confirmColor: '#FF0000',
      success: (res) => {
        if (res.confirm) {
          // 调用/api/v1/review/update_anonymous接口更新评价的匿名状态
          const app = getApp();
          const token = wx.getStorageSync('token') || '';
          wx.request({
            url: `${app.globalData.domain}/api/v1/review/update_anonymous`,
            method: 'POST',
            header: {
              'Authorization': 'Bearer ' + token
            },
            data: {
              review_id: reviewId,
              is_anonymous: true
            },
            success: (res: any) => {
              if (res.data && res.data.code === 0) {
                this.setData({
                  reviewItems: updatedReviewItems,
                  allReviewItems: updatedAllReviewItems,
                  showSettingsModal: false
                });
                wx.showToast({
                  title: '已设为匿名',
                  icon: 'success'
                });
                this.closeSettingsModal();
              }
            }
          }); 
        }
      }
    });
  }
}); 