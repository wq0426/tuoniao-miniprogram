Page({
  data: {
    productId: '',
    reviews: [],
    reviewImages: {
      0: [
        'https://txtimages.oss-cn-beijing.aliyuncs.com/category/category1.jpg',
        'https://txtimages.oss-cn-beijing.aliyuncs.com/category/category2.jpg',
        'https://txtimages.oss-cn-beijing.aliyuncs.com/category/category3.jpg'
      ],
      1: [
        'https://txtimages.oss-cn-beijing.aliyuncs.com/category/category1.jpg',
        'https://txtimages.oss-cn-beijing.aliyuncs.com/category/category2.jpg'
      ]
    }
  },

  onLoad(options) {
    if (options.productId) {
      this.setData({
        productId: options.productId
      });
      
      // 在实际应用中，这里应当使用productId去获取评价数据
      this.fetchReviews(options.productId);
    }
  },
  
  // 获取评价数据
  fetchReviews(productId: string) {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    // 调用/review/product/:product_id接口获取商品下所有的评论
    wx.request({
      url: app.globalData.domain + "/api/v1/review/product/" + productId,
      header: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      },
      success: (res: any) => {
        if (res.data.code === 0) {
          this.setData({
            reviews: res.data.data.reviews,
          });
        }
      }
    });
  },
  
  // 预览图片
  previewImage(e) {
    const { index, reviewIndex } = e.currentTarget.dataset;
    const images = this.data.reviewImages[reviewIndex];
    
    wx.previewImage({
      current: images[index],
      urls: images
    });
  },
  
  // 点赞
  toggleLike(e) {
    // 实现点赞功能
    console.log('Toggle like for review');
  },
  
  // 添加评论
  addComment(e) {
    // 实现添加评论功能
    console.log('Add comment to review');
  },
  
  // 添加导航方法
  navigateToReviewDetail(e) {
    const { reviewId, productId } = e.currentTarget.dataset;
    // 将本地变量的浏览量+1并存储
    this.addViewNum(reviewId);
    wx.navigateTo({
      url: `/pages/review-detail/review-detail?reviewId=${reviewId}&productId=${productId}`
    });
  },

  addViewNum(reviewId: string) {
    // 实际应用中应该调用/api/v1/review/increment-counter增加浏览人数
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: app.globalData.domain + '/api/v1/review/increment_counter',
      method: 'POST',
      data: { review_id: parseInt(reviewId), type: 0 },
      header: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      },
      success: (res: any) => {
        console.log('Increment view num success:', this.data.reviews);
        // 将浏览人数+1
        this.setData({
          reviews: this.data.reviews.map((review: any) => {
            if (review.id === reviewId) {
              review.view_nums += 1;
            }
            return review;
          })
        });
      },
      fail: (err) => {
        console.error('Increment view num failed:', err);
      }
    });
  },

  raiseReview: function(e) {
    const { reviewId, productId } = e.currentTarget.dataset;
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    let type = 0;
    // 是否已经点过赞了
    this.data.reviews.forEach((review: any) => {
      if (review.id === reviewId) {
        if (review.praise_nums > 0) {
          review.praise_nums -= 1;
          type = 3;
        } else {
          review.praise_nums += 1;
          type = 2;
        }
        // 调用接口增加点赞数
        wx.request({
          url: app.globalData.domain + '/api/v1/review/increment_counter',
          method: 'POST',
          data: { review_id: parseInt(reviewId), type: type },
          header: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token
          },
          success: (res: any) => {
            console.log('Increment praise num success:', this.data.reviews);
          }
        });
      }
    });
    this.setData({
      reviews: this.data.reviews
    });
  }
}); 