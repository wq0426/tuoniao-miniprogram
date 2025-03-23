Page({
  data: {
    orderItemId: '',
    product: {
      id: '',
      name: '',
      image: ''
    },
    overallRating: 5,
    ratingTexts: ['非常差', '差', '一般', '好', '非常好'],
    ratingItems: [
      { key: 'freshness', label: '新鲜程度', rating: 4, ratingText: '好' },
      { key: 'packaging', label: '快递包装', rating: 3, ratingText: '一般' },
      { key: 'delivery', label: '送货速度', rating: 2, ratingText: '差' },
      { key: 'service', label: '服务态度', rating: 1, ratingText: '非常差' }
    ],
    reviewContent: '',
    uploadedFiles: [],
    isAnonymous: false,
    isReview: false
  },

  onLoad(options) {
    if (options.orderItemId) {
      this.setData({
        orderItemId: options.orderItemId
      });
      this.loadOrderDetails(options.orderItemId);
    }
    if (options.reviewId) {
      this.setData({
        reviewId: options.reviewId,
        isReview: true
      });
      this.loadReviewDetails(options.reviewId);
    }
  },

  // 加载订单详情
  loadOrderDetails(orderItemId: any) {
    // 这里应该是从服务器获取订单详情的逻辑
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: `${app.globalData.domain}/api/v1/order/detail/${orderItemId}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          const product = res.data.data.products.length > 0 ? res.data.data.products[0] : null;
          console.log("product:",product);
          this.setData({
            product: {
              id: product.product_id,
              name: product.product_name,
              image: product.header_img
            }
          });
        }
      }
    });
  },

  // 加载评价详情
  loadReviewDetails(reviewId: any) {
    // 这里应该是从服务器获取评价详情的逻辑
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: `${app.globalData.domain}/api/v1/review/detail/${reviewId}`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          console.log("review:",res.data.data);
          const reviewData = res.data.data;
          const ratingItems = [
            { key: 'freshness', label: '新鲜程度', rating: reviewData.freshness_rating, ratingText: this.data.ratingTexts[reviewData.freshness_rating - 1] },
            { key: 'packaging', label: '快递包装', rating: reviewData.packaging_rating, ratingText: this.data.ratingTexts[reviewData.packaging_rating - 1] },
            { key: 'delivery', label: '送货速度', rating: reviewData.delivery_rating, ratingText: this.data.ratingTexts[reviewData.delivery_rating - 1] },
            { key: 'service', label: '服务态度', rating: reviewData.service_rating, ratingText: this.data.ratingTexts[reviewData.service_rating - 1] }
          ];
          
          // 处理图片数据
          const uploadedFiles = reviewData.images ? reviewData.images : [];
          
          this.setData({
            product: {
              id: reviewData.product_id,
              name: reviewData.product_name,
              image: reviewData.product_image
            },
            reviewContent: reviewData.content,
            overallRating: reviewData.rating,
            ratingItems: ratingItems,
            isAnonymous: reviewData.is_anonymous,
            uploadedFiles: uploadedFiles
          });
        }
      }
    });
  },

  // 设置总体评分
  setOverallRating(e) {
    const rating = e.currentTarget.dataset.rating;
    this.setData({
      overallRating: rating
    });
  },

  // 设置各项评分
  setItemRating(e: any) {
    const { itemKey, rating } = e.currentTarget.dataset;
    const ratingItems = this.data.ratingItems.map(item => {
      if (item.key === itemKey) {
        return {
          ...item,
          rating,
          ratingText: this.data.ratingTexts[rating - 1]
        };
      }
      return item;
    });
    this.setData({ ratingItems });
  },

  // 输入评价内容
  onContentInput(e) {
    this.setData({
      reviewContent: e.detail.value
    });
  },

  // 选择媒体文件
  chooseMedia() {
    wx.chooseMedia({
      count: 9 - this.data.uploadedFiles.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFiles = res.tempFiles.map(file => file.tempFilePath);
        this.setData({
          uploadedFiles: [...this.data.uploadedFiles, ...tempFiles]
        });
      }
    });
  },

  // 删除上传的文件
  deleteFile(e) {
    const index = e.currentTarget.dataset.index;
    const uploadedFiles = this.data.uploadedFiles.filter((_, i) => i !== index);
    this.setData({ uploadedFiles });
  },

  // 切换匿名评价
  toggleAnonymous() {
    this.setData({
      isAnonymous: !this.data.isAnonymous
    });
  },

  // 提交评价
  submitReview() {
    // 检查评价内容是否为空
    if (!this.data.reviewContent.trim()) {
      wx.showToast({
        title: '请输入评价内容',
        icon: 'none'
      });
      return;
    }

    const app = getApp();   
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: `${app.globalData.domain}/api/v1/review/create`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      data: {
        order_item_id: parseInt(this.data.orderItemId),
        product_id: this.data.product.id,
        rating: this.data.overallRating,
        freshness_rating: this.data.ratingItems[0].rating,
        packaging_rating: this.data.ratingItems[1].rating,
        delivery_rating: this.data.ratingItems[2].rating,
        service_rating: this.data.ratingItems[3].rating,
        content: this.data.reviewContent,
        images: this.data.uploadedFiles,
        is_anonymous: this.data.isAnonymous
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          wx.showLoading({
            title: '提交中...'
          });
          setTimeout(() => {
            wx.hideLoading();
            
            wx.showToast({
              title: '评价成功',
              icon: 'success',
              duration: 2000,
              success: () => {
                // 延迟返回上一页，让用户看到成功提示
                setTimeout(() => {
                  wx.navigateBack();
                }, 2000);
              }
            });
          }, 1500);
          wx.showToast({
            title: '评价成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data?.message || '评价失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('提交评价失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
}); 