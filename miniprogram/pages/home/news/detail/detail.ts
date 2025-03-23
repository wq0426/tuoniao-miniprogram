Page({
  data: {
    title: '',
    date: '',
    content: ''
  },
  onLoad(options) {
    this.setData({
      title: options.title,
      date: options.date,
      content: options.content
    });
  },
  navigateToHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },
  navigateToDetail() {
    wx.navigateTo({
      url: '/pages/home/monitor/detail/detail'
    });
  }
}); 