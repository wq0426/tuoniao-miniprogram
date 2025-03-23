Page({
  data: {
    currentTab: 2, // 默认显示"已评价"标签
    reviewDetail: {
      id: '',
      orderId: '',
      date: '2025-02-15',
      content: '这个很好很棒特别好特别棒，好吃好好吃好吃好好吃',
      images: [
        '/images/reviews/sample1.png',
        '/images/reviews/sample2.png',
        '/images/reviews/sample3.png'
      ],
      productName: '鸵小要优选-鸵鸟精肉',
      productImage: '/images/products/ostrich-meat.png',
      quantity: 1,
      isAnonymous: false
    }
  },

  onLoad(options) {
    // 如果有传入orderId，则获取对应的评价详情
    if (options.orderId) {
      this.getReviewDetail(options.orderId);
    }
    
    // 如果有传入tabIndex，则设置当前标签
    if (options.tab) {
      this.setData({
        currentTab: parseInt(options.tab)
      });
    }
  },

  // 获取评价详情
  getReviewDetail(orderId) {
    // 实际应用中应该调用API获取评价详情
    // 这里使用模拟数据
    console.log(`获取订单 ${orderId} 的评价详情`);
    
    // 这里可以根据orderId从服务器获取真实数据
    // 此处为演示，直接使用默认数据
    this.setData({
      'reviewDetail.orderId': orderId
    });
  },

  // 切换标签
  switchTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    
    // 跳转到对应的评价列表页面
    wx.redirectTo({
      url: `/pages/my-reviews/my-reviews?tab=${tab}`
    });
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.reviewDetail.images;
    
    wx.previewImage({
      current: images[index],
      urls: images
    });
  }
}); 