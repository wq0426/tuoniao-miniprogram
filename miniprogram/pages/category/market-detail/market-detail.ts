interface MarketItem {
  id: number;
  price: string;
  quantity: string;
  date: string;
  img: string;
  totalPrice?: string;
}

Page({
  data: {
    soldItems: [] as MarketItem[],
    unsoldItems: [] as MarketItem[],
    showRecyclePopup: false,
    currentItemId: null,
    showSuccessModal: false,
    showPriceModal: false,
    newPrice: '',
    editingItemId: null
  },
  
  onLoad() {
    console.log('Market Detail page loaded');
    this.fetchMarketData();
  },
  
  fetchMarketData() {
    wx.showLoading({
      title: '加载中',
    });
    
    try {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      
      wx.request({
        url: app.globalData.domain + '/api/v1/market/mine',
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0) {
            // Transform API data to match our UI structure
            const soldItems = this.transformSoldItems(res.data.data.selled_list);
            const unsoldItems = this.transformUnsoldItems(res.data.data.no_sell_list);
            
            // Update the page data
            this.setData({
              soldItems,
              unsoldItems
            });
          } else {
            wx.showToast({
              title: '获取市场数据失败',
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
          wx.hideLoading();
        }
      }) as any;
    } catch (err) {
      console.error('Failed to fetch market data:', err);
      wx.hideLoading();
    }
  },
  
  transformSoldItems(selledList: any[]): MarketItem[] {
    return selledList.map((item, index) => {
      return {
        id: index + 1, // Generate ID based on index
        price: item.egg_price.toString(),
        quantity: item.egg_num.toString(),
        date: item.date,
        img: "https://txtimages.oss-cn-beijing.aliyuncs.com/category/selled.png",
        totalPrice: item.total.toString()
      };
    });
  },
  
  transformUnsoldItems(noSellList: any[]): MarketItem[] {
    return noSellList.map((item, index) => {
      return {
        id: item.id, // Generate ID based on index, using 100+ to avoid conflicts with sold items
        price: item.egg_price.toString(),
        quantity: item.egg_num.toString(),
        date: item.date,
        img: "https://txtimages.oss-cn-beijing.aliyuncs.com/category/nosell.png"
      };
    });
  },
  
  navigateBack() {
    wx.navigateBack();
  },
  
  modifyPrice(e: any) {
    const itemId = e.currentTarget.dataset.id;
    const currentItem = this.data.unsoldItems.find(item => item.id === itemId);
    
    this.setData({
      showPriceModal: true,
      editingItemId: itemId,
      newPrice: currentItem ? currentItem.price : ''
    });
  },
  
  onPriceInput(e: any) {
    let value = e.detail.value;
    
    if (value && !/^\d*\.?\d{0,2}$/.test(value)) {
      return;
    }
    
    this.setData({
      newPrice: value
    });
  },
  
  closePriceModal() {
    this.setData({
      showPriceModal: false,
      newPrice: '',
      editingItemId: null
    });
  },
  
  confirmPrice() {
    const { newPrice, editingItemId } = this.data;
    
    if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
      wx.showToast({
        title: '请输入有效价格',
        icon: 'none'
      });
      return;
    }
    
    if (Number(newPrice) > 300) {
      wx.showToast({
        title: '单价不能超过300元',
        icon: 'none'
      });
      return;
    }
    
    const unsoldItems = this.data.unsoldItems.map(item => {
      if (item.id === editingItemId) {
        return { ...item, price: newPrice };
      }
      return item;
    });

    // 通过接口更新price
    try {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      
      wx.request({
        url: app.globalData.domain + '/api/v1/market/update-price',
        method: 'POST',
        data: {
          id: editingItemId,
          price: parseFloat(newPrice)
        },
        header: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token
        },
        complete: () => {   
          wx.hideLoading();
        }
      }) as any;
    } catch (err) {
      console.error('Failed to fetch product data:', err);
      wx.hideLoading();
    }
    
    this.setData({ 
      unsoldItems,
      showPriceModal: false,
      newPrice: '',
      editingItemId: null
    });
    
    wx.showToast({
      title: '价格修改成功',
      icon: 'success'
    });
  },
  
  recycleItem(e: any) {
    const itemId = e.currentTarget.dataset.id;
    console.log('Opening recycle options for item:', itemId);
    
    // Show the popup and store the current item id
    this.setData({
      showRecyclePopup: true,
      currentItemId: itemId
    });
  },
  
  // Close the popup
  closeRecyclePopup() {
    this.setData({
      showRecyclePopup: false,
      currentItemId: null
    });
  },
  
  // Sell to platform option
  sellToPlatform() {
    const itemId = this.data.currentItemId;
    console.log('Selling item to platform:', itemId);
    
    // Navigate to platform recycle page
    wx.navigateTo({
      url: `/pages/category/market-detail/platform-recycle/platform-recycle?itemId=${itemId}`
    });
    
    // Close the popup
    this.setData({
      showRecyclePopup: false
    });
  },
  
  // Send back to self option
  sendBackToSelf() {
    const itemId = this.data.currentItemId;
    console.log('Sending item back to self:', itemId);
    
    // Remove the item from unsoldItems
    const unsoldItems = this.data.unsoldItems.filter(item => item.id !== itemId);
    this.setData({ 
      unsoldItems,
      showRecyclePopup: false,
      currentItemId: null,
      showSuccessModal: true
    });
    
    // Automatically close the modal after 2 seconds
    setTimeout(() => {
      this.setData({
        showSuccessModal: false
      });
    }, 2000);
  },
  
  // Prevent bubble for modal content
  preventBubble() {
    // This prevents the click from bubbling to the overlay
    return;
  },
  
  // Close success modal
  closeSuccessModal() {
    this.setData({
      showSuccessModal: false
    });
  },
  
  // Add a new method to be called when returning from the platform-recycle page
  completePlatformRecycle(itemId: number) {
    console.log('Completing platform recycle for item:', itemId);
    
    // Remove the item from unsoldItems
    const unsoldItems = this.data.unsoldItems.filter(item => item.id !== itemId);
    this.setData({
      unsoldItems,
      currentItemId: null
    });
    
    wx.showToast({
      title: '已卖出给平台',
      icon: 'success'
    });
  }
}); 