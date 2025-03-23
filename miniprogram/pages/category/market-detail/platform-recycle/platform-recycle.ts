Page({
  data: {
    itemId: null,
    price: "100"
  },
  
  onLoad(options) {
    console.log('Platform Recycle page loaded');
    
    if (options.itemId) {
      this.setData({
        itemId: parseInt(options.itemId)
      });
    }
  },
  
  navigateBack() {
    wx.navigateBack();
  },
  
  cancel() {
    console.log('Recycling canceled');
    wx.navigateBack();
  },
  
  confirm() {
    console.log('Confirming recycle for item:', this.data.itemId);
    
    // Return to previous page with success result
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    // Call the completion function on the previous page
    if (prevPage && typeof prevPage.completePlatformRecycle === 'function') {
      prevPage.completePlatformRecycle(this.data.itemId);
    }
    
    wx.navigateBack();
  }
}); 