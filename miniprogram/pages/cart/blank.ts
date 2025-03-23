Page({
    data: {
      // Your existing data properties
    },
    onLoad() {
      
    },
    navigateToHome() {
      wx.switchTab({
        url: '/pages/home/home'
      });
    }
  }); 