Page({
  data: {
    reviewId: '',
    productId: '',
    commentText: '',
    inputFocus: false,
    currentCommentId: '',
    showEmojiPanel: false,
    emojiList: [
      '😀', '😂', '😊', '🙂', '😍', 
      '😘', '🤔', '😮', '😴', '😏',
      '👍', '👎', '👌', '✌️', '🙏',
      '🎉', '🎂', '🎁', '❤️', '💔'
    ],
    reviewDetail: {},
    replyToUserName: '',
    replyToCommentId: 0
  },

  onLoad(options) {
    if (options.reviewId) {
      this.setData({
        reviewId: options.reviewId,
        productId: options.productId || ''
      });
      // 在实际应用中，这里应当使用reviewId获取评价详情数据
      this.fetchReviewDetail(options.reviewId);
    }
  },
  
  // 获取评价详情数据
  fetchReviewDetail(reviewId: string) {
    // 实际应用中应该调用后端API获取数据
    const app = getApp(); 
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: app.globalData.domain + '/api/v1/review/detail/' + reviewId,
      header: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token  
      },
      success: (res: any) => {
        console.log('Fetching review detail for review:', res.data.data);
        this.setData({
          reviewDetail: res.data.data,
          comments: res.data.data.evaluate_list
        });
      },
      fail: (err) => {
        console.error('Fetching review detail failed:', err);
      }
    });
  },
  
  // 判断指定评论是否有回复
  hasReplies(parentId: number) {
    if (!this.data.reviewDetail || !this.data.reviewDetail.evaluate_list) {
      return false;
    }
    // 判断evaluate_list列表的id为parentId的元素的comment_list长度是否大于0
    return this.data.reviewDetail.evaluate_list.some((item: any) => item.id === parentId && item.comment_list.length > 0);
  },
  
  // 显示回复输入框
  showReplyInput(e) {
    const commentId = e.currentTarget.dataset.commentId;
    const userName = e.currentTarget.dataset.userName;
    
    this.setData({
      inputFocus: true,
      replyToUserName: userName,
      replyToCommentId: commentId
    });
  },
  
  // 输入评论内容
  onCommentInput(e) {
    this.setData({
      commentText: e.detail.value
    });
  },
  
  // 提交评论
  submitComment() {
    if (!this.data.commentText.trim()) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      });
      return;
    }
    
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ submitting: true });
    // 根据评论类型判断提交评论还是回复评论
    let url = ''
    let data = {}
    if (this.data.replyToCommentId) {
      url = '/api/v1/review/reply'
      data = {  
        evaluate_id: this.data.replyToCommentId,
        content: this.data.commentText
      }
    } else {
      url = '/api/v1/review/comment'
      data = {
        review_id: this.data.reviewDetail.id,
        content: this.data.commentText
      }
    }
    wx.request({
      url: `${app.globalData.domain}${url}`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: data,
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          wx.showToast({
            title: '评论成功',
            icon: 'success'
          });
          // 清空输入框
          this.setData({
            commentText: '',
            replyToUserName: '',
            replyToCommentId: 0,
            showEmojiPanel: false
          });
          // 重新获取评论数据
          this.fetchReviewDetail(this.data.reviewDetail.id);
        } else {
          wx.showToast({
            title: res.data?.message || '评论失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ submitting: false });
      }
    });
  },
  
  // 切换表情面板显示状态
  toggleEmojiPanel() {
    this.setData({
      showEmojiPanel: !this.data.showEmojiPanel
    });
  },
  
  // 选择表情
  selectEmoji(e) {
    const emoji = e.currentTarget.dataset.emoji;
    this.setData({
      commentText: this.data.commentText + emoji
    });
  }
}); 