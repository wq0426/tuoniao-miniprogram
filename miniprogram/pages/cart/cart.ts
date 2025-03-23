Page({
    data: {
      cartItems: [],
      selectedAll: false,
      isEditMode: false,
      isCartEmpty: true,
      totalPrice: 0
    },
    onLoad() {
      this.fetchCartData();
    },
    onShow() {
      // Refresh cart data every time the page is shown
      this.fetchCartData();
    },
    fetchCartData() {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      
      wx.showLoading({
        title: '加载中...'
      });
      
      wx.request({
        url: `${app.globalData.domain}/api/v1/cart/list`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0 && res.data.data) {
            // Transform API data to UI format
            const cartItems = this.transformCartData(res.data.data);
  
            const isCartEmpty = cartItems.length === 0;
            
            this.setData({
              cartItems: cartItems,
              isCartEmpty: isCartEmpty,
              selectedAll: false, // Reset selection when data is refreshed
              totalPrice: 0 // Reset total price
            });

            // Calculate the initial total price
            this.calculateTotalPrice();
          } else {
            wx.showToast({
              title: '获取购物车数据失败',
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
      });
    },
    transformCartData(apiData: any[]) {
      let allCartItems: any[] = [];
      
      // Flatten store structure and transform each item
      apiData.forEach(store => {
        const storeItems = store.list.map((item: any) => ({
          cartId: item.cart_id,
          id: item.product_id,
          name: item.product_name,
          price: item.current_price,
          quantity: item.quantity || 1,
          image: `https://txtimages.oss-cn-beijing.aliyuncs.com/home/product${(item.product_id % 3) + 1}.jpg`, // Default image based on ID
          selected: false, // Default not selected
          storeId: item.store_id,
          storeName: item.store_name,
          courierFeeMin: item.courier_fee_min,
          currentPrice: item.current_price,
          memberDiscount: item.member_discount,
          couponId: item.coupon_id,
          couponPrice: item.coupon_price
        }));
        allCartItems = allCartItems.concat(storeItems);
      });
      return allCartItems;
    },
    navigateToCategory() {
      wx.navigateTo({
        url: '/pages/category/category'
      });
    },
    toggleEditMode() {
      this.setData({
        isEditMode: !this.data.isEditMode
      });
    },
    toggleItemSelection(e: any) {
      const id = e.currentTarget.dataset.id;
      const cartItems = this.data.cartItems.map((item: any) => {
        if (item.id === id) {
          return { ...item, selected: !item.selected };
        }
        return item;
      });
      
      // Check if all items are selected
      const selectedAll = cartItems.length > 0 && cartItems.every((item: any) => item.selected);
      
      this.setData({
        cartItems,
        selectedAll
      });
      
      // Update total price
      this.calculateTotalPrice();
    },
    toggleSelectAll() {
      const selectedAll = !this.data.selectedAll;
      const cartItems = this.data.cartItems.map((item: any) => ({
        ...item,
        selected: selectedAll
      }));
      
      this.setData({
        selectedAll,
        cartItems
      });
      
      // Update total price
      this.calculateTotalPrice();
    },
    decreaseQuantity(e: any) {
      const id = e.currentTarget.dataset.id;
      const cartItems = this.data.cartItems.map((item: any) => {
        if (item.id === id && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      
      this.setData({ cartItems });
      this.updateItemQuantity(id, cartItems.find(item => item.id === id).quantity);
      this.calculateTotalPrice();
    },
    increaseQuantity(e: any) {
      const id = e.currentTarget.dataset.id;
      const cartItems = this.data.cartItems.map((item: any) => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      
      this.setData({ cartItems });
      this.updateItemQuantity(id, cartItems.find(item => item.id === id).quantity);
      this.calculateTotalPrice();
    },
    updateItemQuantity(productId: number, quantity: number) {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      
      wx.request({
        url: `${app.globalData.domain}/api/v1/cart/add`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        data: {
          product_id: productId,
          quantity: quantity
        },
        success: (res: any) => {
          if (res.data && res.data.code !== 0) {
            wx.showToast({
              title: '更新数量失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
        }
      });
    },
    deleteSelectedItems() {
      const selectedItems = this.data.cartItems.filter((item: any) => item.selected);
      
      if (selectedItems.length === 0) {
        wx.showToast({
          title: '请先选择商品',
          icon: 'none'
        });
        return;
      }
      
      wx.showModal({
        title: '提示',
        content: '确定要删除选中的商品吗？',
        success: (res) => {
          if (res.confirm) {
            this.performDeleteItems(selectedItems);
          }
        }
      });
    },
    performDeleteItems(selectedItems: any[]) {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
    
      // ids使用逗号隔开id
      let ids = ""
      selectedItems.forEach((item: any) => {
        ids += `${item.cartId},`
      });
      ids = ids.slice(0, -1);
      console.log("ids:",ids)
      wx.request({
        url: `${app.globalData.domain}/api/v1/cart/delete`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        data: {
          ids: ids
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0) {
            
              this.fetchCartData();
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
        
          }
        },
        fail: () => {
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          });
        }
      });
    },
    calculateTotalPrice() {
      let total = 0;
      this.data.cartItems.forEach((item: any) => {
        if (item.selected) {
          total += parseFloat(item.price) * item.quantity;
        }
        // 扣减优惠券
        total -= parseFloat(item.couponPrice);
      });
      
      this.setData({
        totalPrice: total.toFixed(2)
      });
    },
    navigateToCheckout() {
      const selectedItems = this.data.cartItems.filter((item: any) => item.selected);
      
      if (selectedItems.length === 0) {
        wx.showToast({
          title: '请先选择商品',
          icon: 'none'
        });
        return;
      }
      // // Store selected items for checkout
      // wx.setStorageSync('checkoutItems', selectedItems);
      
      let cartIds = ""
      selectedItems.forEach((item: any) => {
        cartIds += `${item.cartId},`
      });
      cartIds = cartIds.slice(0, -1);

      // Navigate to checkout page
      wx.navigateTo({
        url: '/pages/cart/checkout/checkout?cart_ids=' + cartIds
      });
    },

    navigateToHome() {
      wx.navigateTo({
        url: '/pages/home/home'
      });
    }
  }); 