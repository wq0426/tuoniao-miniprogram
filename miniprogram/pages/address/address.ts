Page({
  data: {
    addressList: [],
    searchKeyword: '',
    isSelectMode: false,
    addressId: ''
  },

  onLoad(options) {
    // Check if this is being opened in selection mode
    const addressId = options && options.id;
    const cartIds = options && options.cart_ids;
    const productId = options && options.product_id;
    const couponId = options && options.coupon_id;
    const orderItemId = options && options.order_item_id;
    this.setData({
      isSelectMode: addressId !== undefined,
      addressId: addressId,
      cartIds: cartIds,
      productId: productId,
      couponId: couponId,
      orderItemId: orderItemId
    });
    
    // Fetch address list from API
    this.fetchAddressList();
  },
  
  onShow() {
    // Refresh address list when returning to this page
    this.fetchAddressList();
  },

  // 搜索输入处理
  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({
      searchKeyword: keyword
    });
    
    if (keyword) {
      this.filterAddressList(keyword);
    } else {
      // If search is cleared, fetch full list again
      this.fetchAddressList();
    }
  },

  // 过滤地址列表
  filterAddressList(keyword) {
    if (!keyword) {
      // 如果关键词为空，恢复完整列表
      this.fetchAddressList();
      return;
    }
    
    // 过滤逻辑
    const filteredList = this.data.addressList.filter(item => 
      item.name.includes(keyword) || item.phone.includes(keyword)
    );
    
    this.setData({
      addressList: filteredList
    });
  },

  // 获取地址列表 - Updated to use real API
  fetchAddressList() {
    // Show loading indicator
    wx.showLoading({
      title: '加载中...'
    });
    
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    
    wx.request({
      url: `${app.globalData.domain}/api/v1/address/list`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0 && res.data.data) {
          const addresses = res.data.data;
          
          // Transform the API data to match our UI format
          const formattedAddresses = addresses.map((addr: any) => {
            return {
              id: addr.id.toString(),
              name: addr.name,
              phone: addr.phone,
              province: addr.province,
              city: addr.city,
              district: addr.district,
              street: addr.street.split(' ')[0] || '', // Try to extract street if available
              detail: addr.street,
              isDefault: addr.is_default === 1
            };
          });
          
          this.setData({
            addressList: formattedAddresses
          });
        } else {
          wx.showToast({
            title: '获取地址失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('Failed to fetch addresses:', err);
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

  // 选择地址 - Updated for selection mode
  selectAddress(e) {
    const addressId = e.currentTarget.dataset.id;
    const selectedAddress = this.data.addressList.find(item => item.id === addressId);
    // Store the selected address in storage for the checkout page
    wx.setStorageSync('selectedAddress', selectedAddress);
    wx.redirectTo({
      url: `/pages/cart/checkout/checkout?id=${addressId}&cart_ids=${this.data.cartIds}&product_id=${this.data.productId}&coupon_id=${this.data.couponId}&order_item_id=${this.data.orderItemId}`
    });
  },

  // 编辑地址
  editAddress(e) {
    const addressId = e.currentTarget.dataset.id;
    const selectedAddress = this.data.addressList.find(item => item.id === addressId);
    // 缓存地址列表
    wx.setStorageSync('addressSelected', selectedAddress);
    wx.navigateTo({
      url: `/pages/address-edit/address-edit?id=${addressId}`
    });
  },

  // 添加新地址
  addNewAddress() {
    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    });
  },

  // 删除地址
  deleteAddress(e: any) {
    // 给一个确认弹窗
    wx.showModal({
      title: '提示',
      content: '确定删除该地址吗？',
      success: (res: any) => {
        if (res.confirm) {
          const addressId = e.currentTarget.dataset.id;
          const addressIdInt = parseInt(addressId);
          const app = getApp();
          const token = wx.getStorageSync('token') || '';
          wx.showLoading({
            title: '删除中...'
          });
          wx.request({
            url: `${app.globalData.domain}/api/v1/address/delete`,
            method: 'POST',
            data: {
              id: addressIdInt
            },
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            success: (res: any) => {
              if (res.data && res.data.code === 0) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                this.fetchAddressList();
              } else {
                wx.showToast({
                  title: res.data.message || '删除失败',
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
        }
      }
    });
  },
  
  // Set as default address
  setAsDefault(e) {
    const addressId = e.currentTarget.dataset.id;
    
    // Here you would call your API to set this as the default address
    // Then refresh the address list
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    
    wx.showLoading({
      title: '设置中...'
    });
    
    wx.request({
      url: `${app.globalData.domain}/api/v1/address/default`,
      method: 'POST',
      data: {
        id: addressId
      },
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          wx.showToast({
            title: '设置成功',
            icon: 'success'
          });
          
          // Refresh address list
          this.fetchAddressList();
        } else {
          wx.showToast({
            title: res.data.message || '设置失败',
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
  }
}); 