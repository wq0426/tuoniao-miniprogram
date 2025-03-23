Page({
  data: {
    showSelect: false,
    selectedItemIndex: 0,
    selectedItemName: '新疆监控',
    itemNames: ['新疆监控', '孵化室', '育雏室', '小鸵鸟', '中鸵鸟', '大鸵鸟', '种鸟'],
    isFullscreen: false
  },
  onLoad() {
    console.log('Monitor page loaded in landscape mode');
    // 设置屏幕常亮，适合长时间观看监控
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
  },
  onUnload() {
    // 恢复屏幕自动锁定
    wx.setKeepScreenOn({
      keepScreenOn: false
    });
  },
  navigateToHome() {
    wx.navigateBack();
  },
  toggleSelect() {
    // 切换下拉菜单显示状态
    this.setData({
      showSelect: !this.data.showSelect
    });
  },
  selectItem(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      selectedItemIndex: index,
      selectedItemName: this.data.itemNames[index],
      showSelect: false
    });
  },
  toggleFullscreen() {
    // 切换全屏状态
    const isFullscreen = !this.data.isFullscreen;
    this.setData({ isFullscreen });
    
    wx.showToast({
      title: isFullscreen ? '已进入全屏模式' : '已退出全屏模式',
      icon: 'none',
      duration: 1500
    });
  }
}); 