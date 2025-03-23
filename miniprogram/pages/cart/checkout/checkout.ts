interface CheckoutItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: string;
}

interface Address {
  province: string;
  city: string;
  district: string;
  street: string;
  name: string;
  phone: string;
}

Page({
  data: {
    cartItems: [] as CheckoutItem[],
    address: {},
    productPrice: '70.00',
    shippingFee: '10.00',
    memberDiscount: '5.00',
    totalPrice: '75',
    notes: {} as Record<string, string>,
    showPaymentModal: false,
    selectedPaymentMethod: 1,
    orderItems: [],
    orderSubmitting: false,
    showCancelConfirm: false,  // 控制撤销确认弹窗显示
    currentOrderId: '',
    orderId: 0,
    userAsset: {}
  },
  
  onLoad(options: any) {
    const cartIds = options.cart_ids || '';
    const productId = options.product_id || 0;
    const couponId = options.coupon_id || 0;
    const orderItemId = options.order_item_id || 0;
    this.setData({
      params: options
    });

    this.loadUserInfo();
    this.loadCheckoutItems(cartIds, productId, couponId, orderItemId);
    this.fetchAddressList(options);
  },
  
  // onShow() {
  //   const selectedAddress = wx.getStorageSync('selectedAddress');
  //   console.log("22==>",selectedAddress);
  //   if (selectedAddress) {
  //     this.setData({
  //       address: selectedAddress
  //     });
  //     wx.removeStorageSync('selectedAddress');
  //   }
  // },

  confirmPay() {
    this.submitOrder(1);
  },

  closeModal() {
    this.setData({
      showCancelConfirm: false,
      currentOrderId: ''
    });
    setTimeout(() => {
      this.submitOrder(0);
      this.setData({
        showPaymentModal: false
      });
    }, 500);
  },
  
  loadCheckoutItems(cartIds: string, productId: number, couponId: number, orderItemId: number) {
    // const checkoutItems = wx.getStorageSync('checkoutItems') || [];
    // 调用/api/v1/cart/detail 获取购物车详情
    const app = getApp();
    const token = wx.getStorageSync('token') || '';

    if (productId > 0) {
      let cartItems: any[] = [];
      let coupon: any = {};
      // 使用Promise.all同步调用两个接口
      const productPromise = new Promise<void>((resolve) => {
        wx.request({
          url: `${app.globalData.domain}/api/v1/product/detail?product_id=${productId}`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          success: (res: any) => {
            cartItems = [res.data.data];
            resolve();
          },
          fail: () => {
            resolve();
          }
        });
      });

      // 调用/api/v1/coupon/detail 获取优惠券详情
      const couponPromise = new Promise<void>((resolve) => {
        wx.request({
          url: `${app.globalData.domain}/api/v1/coupon/detail?coupon_id=${couponId}`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          success: (res: any) => {
            coupon = res.data.data;
            resolve();
          },
          fail: () => {
            resolve();
          }
        });
      });

      // 等待两个请求都完成后再继续执行
      Promise.all([productPromise, couponPromise]).then(() => {
        let total = 0;
        let couponItemMap = {};
        if (cartItems.length > 0) {
          couponItemMap[cartItems[0].product_id] = coupon
          cartItems = this.transformCartData(cartItems, couponItemMap);
          total += parseFloat(cartItems[0].price) * cartItems[0].quantity;
          if (parseFloat(cartItems[0].couponPrice) > 0) {
            total -= parseFloat(cartItems[0].couponPrice);
          }
          if (parseFloat(cartItems[0].memberDiscount) > 0) {
            total -= parseFloat(cartItems[0].memberDiscount);
          }
          // 加上运费
          total += parseFloat(cartItems[0].courierFeeMin);
        }
        this.setData({
          cartItems: cartItems,
          totalPrice: total.toFixed(2),
        });
      });
    } else if (cartIds.length > 0) {
      // 调用/api/v1/cart/detail 获取购物车详情
      wx.request({
        url: `${app.globalData.domain}/api/v1/product/details?cart_ids=${cartIds}`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0 && res.data.data) {
            const cartItems = res.data.data;
            let total = 0;
            let couponItemMap = {};
            
            // 处理购物车数据
            if (cartItems.length > 0) {
              cartItems.forEach((item: any) => {
                couponItemMap[item.product_id] = { id: item.coupon_id, coupon_price: item.coupon_price };
              });
              
              const transformedCartItems = this.transformCartData(cartItems, couponItemMap);
              
              // 计算总价
              transformedCartItems.forEach((item: any) => {
                total += parseFloat(item.price) * item.quantity;
                if (parseFloat(item.couponPrice) > 0) {
                  total -= parseFloat(item.couponPrice);
                }
                if (parseFloat(item.memberDiscount) > 0) {
                  total -= parseFloat(item.memberDiscount);
                }
                if (parseFloat(item.courierFeeMin) > 0) {
                  total += parseFloat(item.courierFeeMin);
                }
              });
              
              this.setData({
                cartItems: transformedCartItems,
                totalPrice: total.toFixed(2),
              });
            } else {
              this.setData({
                cartItems: [],
                totalPrice: '0.00',
              });
            }
          }
        },
        fail: () => {
          wx.showToast({
            title: '获取购物车信息失败',
            icon: 'none'
          });
        }
      });
    } else if (orderItemId > 0) {
      // 调用/api/v1/order/detail 获取订单详情
      wx.request({
        url: `${app.globalData.domain}/api/v1/order/products?order_item_id=${orderItemId}`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0 && res.data.data) {
            const cartItems = res.data.data;
            let total = 0;
            // 处理购物车数据
            if (cartItems.length > 0) {
              const transformedCartItems = this.transformCartData(cartItems);
              // 计算总价
              transformedCartItems.forEach((item: any) => {
                total += parseFloat(item.price) * item.quantity;
                if (parseFloat(item.couponPrice) > 0) {
                  total -= parseFloat(item.couponPrice);
                }
                if (parseFloat(item.memberDiscount) > 0) {
                  total -= parseFloat(item.memberDiscount);
                }
                if (parseFloat(item.courierFeeMin) > 0) {
                  total += parseFloat(item.courierFeeMin);
                }
              });
              this.setData({
                cartItems: transformedCartItems,
                totalPrice: total.toFixed(2),
                orderId: cartItems[0].item_id
              });
            } else {
              this.setData({
                cartItems: [],
                totalPrice: '0.00',
              });
            }
          }
        }
      });
    }
  },

  loadUserInfo() {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: `${app.globalData.domain}/api/v1/asset/info`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        this.setData({
          userAsset: res.data.data
        });
      }
    });
  },

  transformCartData(apiData: any[]) {
    let allCartItems: any[] = [];
    
    // Flatten store structure and transform each item
    apiData.forEach((item: any) => {
      allCartItems.push({
        cartId: item.cart_id,
        id: item.product_id,
        name: item.product_name,
        price: item.product_current_price,
        quantity: item.product_quantity || 1,
        image: item.header_img,
        selected: false,
        storeId: 1,
        storeName: "鸵小妥",
        courierFeeMin: item.courier_fee_min,
        currentPrice: item.product_current_price,
        memberDiscount: item.member_discount,
        couponId: item.coupon_id || 0,
        couponPrice: item.coupon_price || 0
      });
    });
    return allCartItems;
  },
  
  fetchAddressList(options: any) {
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
        if (res.data && res.data.code === 0 && res.data.data && res.data.data.length > 0) {
          const addresses = res.data.data;
          
          if (options.id) {
            const selectedAddress = addresses.find((addr: any) => addr.id === parseInt(options.id));
            this.setData({
              address: {
                id: selectedAddress.id,
                name: selectedAddress.name,
                phone: selectedAddress.phone,
                province: selectedAddress.province,
                city: selectedAddress.city,
                district: selectedAddress.district,
                detail: selectedAddress.street,
                isDefault: selectedAddress.is_default === 1
              }
            });
          } else {
            let selectedAddress = addresses.find((addr: any) => addr.is_default === 1);
            if (!selectedAddress && addresses.length > 0) {
              selectedAddress = addresses[0];
            }
          
            if (selectedAddress) {
              this.setData({
                address: {
                  id: selectedAddress.id,
                  name: selectedAddress.name,
                  phone: selectedAddress.phone,
                  province: selectedAddress.province,
                  city: selectedAddress.city,
                  district: selectedAddress.district,
                  detail: selectedAddress.street,
                  isDefault: selectedAddress.is_default === 1
                }
              });
            }
          }
        }
      },
      fail: (err) => {
        console.error('Failed to fetch addresses:', err);
      }
    });
  },
  
  onNoteChange(e: any) {
    const productId = e.currentTarget.dataset.id;
    const notes = this.data.notes;
    notes[productId] = e.detail.value;
    
    this.setData({ notes });
  },
  
  submitOrder(paymentStatus: number) {
    // 取paymentStatus的值
    const paymentStatusValue = typeof paymentStatus === 'object' ? 
      (paymentStatus.currentTarget?.dataset?.status || 0) : 
      parseInt(String(paymentStatus), 10);
    if (this.data.orderSubmitting) {
      return;
    }

    if (!this.data.address) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      });
      return;
    }

    if (this.data.orderId > 0) {
      if (paymentStatusValue === 0) {
        wx.showToast({
          title: '支付已取消',
          icon: 'none'
        });
        return;
      } else {
        const app = getApp();
        const token = wx.getStorageSync('token') || '';
        this.setData({ orderSubmitting: true });
        const orderId = parseInt(this.data.orderId);
        // 调用/order/status接口更新订单状态
        wx.request({
          url: `${app.globalData.domain}/api/v1/order/status`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          data: {
            order_id: orderId,
            status: paymentStatusValue
          },
          success: (res: any) => {
            if (res.data && res.data.code === 0) {
              wx.showToast({
                title: '订单状态更新成功',
                icon: 'success'
              });
              
              // 支付成功后返回订单列表页
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1
                });
              }, 1500);
            }
          },
          fail: (err: any) => {
            wx.showToast({
              title: '订单状态更新失败',
              icon: 'none'
            });
          },
          complete: () => {
            this.setData({ orderSubmitting: false });
            this.setData({ showPaymentModal: false });
          }
        });
      }
    } else {
      this.setData({ orderSubmitting: true });
      const items: any[] = []
      this.data.cartItems.forEach((item: any) => {
        items.push({
          cart_id: item.cartId,
          courier_fee_min: parseFloat(item.courierFeeMin),
          current_price: parseFloat(item.price),
          member_discount: parseFloat(item.memberDiscount),
          image: item.image,
          note: this.data.notes[item.id] || "",
          product_id: parseInt(item.id),
          product_name: item.name,
          quantity: item.quantity,
          store_id: 1,
          store_name: "鸵小妥",
          category1_id: item.category1Id,
          category2_id: item.category2Id,
          coupon_id: item.couponId,
          coupon_price: parseFloat(item.couponPrice),
        })
      });
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      wx.request({
        url: `${app.globalData.domain}/api/v1/order/create`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        data: {
          items: items,
          address: this.data.address,
          payment_method: this.data.selectedPaymentMethod,
          status: paymentStatusValue
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0) {
            wx.showToast({
              title: '订单创建成功',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
            this.setData({ orderSubmitting: false });
          } else {
            wx.showToast({
              title: res.data.message || '订单创建失败',
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
          this.setData({ orderSubmitting: false });
        }
      });
    }
  },
  
  navigateBack() {
    wx.navigateBack();
  },
  
  navigateToAddress() {
    if (!this.data.address) {
      wx.showToast({
        title: '请先添加收货地址',
        icon: 'none'
      });
      return;
    }
    const cartIds = this.data.params.cart_ids || '';
    const productId = this.data.params.product_id || 0;
    const couponId = this.data.params.coupon_id || 0;
    const orderItemId = this.data.params.order_item_id || 0;
    wx.navigateTo({
      url: '/pages/address/address?id='+this.data.address.id+'&cart_ids='+cartIds+'&product_id='+productId+'&coupon_id='+couponId+'&order_item_id='+orderItemId
    });
  },
  
  decreaseQuantity(e: any) {
    const id = e.currentTarget.dataset.id;
    const cartItems = this.data.cartItems.map(item => {
      if (item.id === id && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    
    this.setData({ cartItems });
    this.calculateTotalPrice();
  },
  
  increaseQuantity(e: any) {
    const id = e.currentTarget.dataset.id;
    const cartItems = this.data.cartItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    
    this.setData({ cartItems });
    this.calculateTotalPrice();
  },
  
  calculateTotalPrice() {
    let total = 0;
    this.data.cartItems.forEach((item: any) => {
      total += parseFloat(item.price) * item.quantity;
    });
    
    this.setData({
      totalPrice: total.toFixed(2)
    });
  },
  
  focusNotes(e: any) {
    const productId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '订单备注',
      editable: true,
      placeholderText: '请填写订单备注信息',
      content: this.data.notes[productId] || '',
      success: (res) => {
        if (res.confirm) {
          this.data.cartItems.forEach((item: any) => {
            if (item.id === productId) {
              item.note = res.content || '';
            }
          });
          this.setData({
            notes: {
              ...this.data.notes,
              [productId]: res.content
            }
          });
        }
      }
    });
  },
  
  placeOrder() {
    this.setData({
      showPaymentModal: true
    });
  },
  
  closePaymentModal() {
    // 在关闭支付弹窗时，显示确认取消弹窗
    this.setData({
      showCancelConfirm: true
    });
  },
  
  selectPaymentMethod(e: any) {
    const method = e.currentTarget.dataset.method;
    this.setData({
      selectedPaymentMethod: parseInt(method)
    });
  }
}); 