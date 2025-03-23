// pages/product-detail/product-detail.js
Page({
    data: {
      product: {},
      cartCount: 0,
      showCouponPopup: false,
      couponList: [],
      selectedCouponId: 0
    },
  
    onLoad: function (options) {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      if (options.id) {
        // Fetch product details from API using the product ID
        wx.request({
          url: app.globalData.domain + `/api/v1/product/detail?product_id=${options.id}`,
          method: 'GET',
          header: {
            'content-type': 'application/json',
            'Authorization': "Bearer " + token
          },
          success: (res) => {
            if (res.data && res.data.code === 0) {
              const productData = res.data.data;
              // Transform API data to match our UI structure
              this.setData({
                couponList: productData.product_coupons,
                product: {
                  id: productData.product_id,
                  name: productData.product_name,
                  category1Id: productData.category1_id,
                  category2Id: productData.category2_id,
                  price: productData.product_current_price,
                  originalPrice: productData.product_original_price,
                  unit: productData.product_unit,
                  spec: productData.product_spec,
                  sales: productData.product_sales,
                  headerImg: productData.header_img,
                  courierFeeMin: productData.courier_fee_min,
                  courierFeeMax: productData.courier_fee_max,
                  memberDiscount: productData.member_discount,
                  delivery: `¥${productData.courier_fee_min}-${productData.courier_fee_max}`,
                  currentIndex: 0,
                  images: productData.product_images,
                  coupons: productData.product_coupons,
                  productContent: productData.product_content,
                  commentCount: productData.product_evaluate_nums
                }
              });
            } else {
              wx.showToast({
                title: '获取商品信息失败',
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
      }
    },
  
    // 轮播图切换事件
    swiperChange(e) {
      this.setData({
        'product.currentIndex': e.detail.current
      });
    },
  
    // 查看全部评价
    viewAllComments() {
      wx.navigateTo({
        url: '/pages/comments/comments?productId=' + this.data.product.id
      });
    },
  
    // 领取优惠券
    getCoupon(e) {
      this.setData({
        showCouponPopup: true
      });
    },
  
    // 关闭优惠券弹窗
    closeCouponPopup() {
      this.setData({
        showCouponPopup: false
      });
    },
  
    // 领取优惠券
    catchCoupon(e) {
      const couponId = e.currentTarget.dataset.id;
      
      wx.showToast({
        title: `已选择优惠券${couponId}`,
        icon: 'success'
      });

      // 调用领取优惠券API
      const token = wx.getStorageSync('token') || '';
      if (!token) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      const app = getApp();
      wx.request({
        url: `${app.globalData.domain}/api/v1/coupon/claim`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        data: {
          coupon_id: couponId
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0) {
            wx.showToast({
              title: '领取成功',
              icon: 'success'
            });
            // 刷新优惠券列表
            this.fetchCoupons(couponId);
          } else {
            wx.showToast({
              title: res.data?.message || '领取失败',
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

    // 使用优惠券
    useCoupon(e) {
      const couponId = e.currentTarget.dataset.id;
      // 更新优惠券状态
      this.data.couponList.forEach((coupon: any) => {
        if (coupon.coupon_id === couponId) {
          coupon.is_received = 2;
        }
      });
      this.setData({
        couponList: this.data.couponList,
        selectedCouponId: couponId
      });
      wx.showToast({
        title: '使用优惠券成功',
        icon: 'success'
      });
      // 关闭弹窗
      this.setData({
        showCouponPopup: false
      });
    },

    // 刷新优惠券列表
    fetchCoupons(couponId: number) {
      // 遍历couponList，将couponId对应的coupon设置为已领取
      this.data.couponList.forEach((coupon: any) => {
        if (coupon.coupon_id === couponId) {
          coupon.is_received = 1;
        }
      });
      this.setData({
        couponList: this.data.couponList
      });
    },
  
    // 查看详情介绍
    viewDetail() {
      wx.navigateTo({
        url: '/pages/product-detail-info/product-detail-info?productId=' + this.data.product.id
      });
    },
  
    // 加入购物车
    addToCart() {
      let count = this.data.cartCount + 1;
      this.setData({
        cartCount: count
      });

      // 调用/api/v1/cart/add
      const token = wx.getStorageSync('token') || '';
      if (!token) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      const app = getApp();
      wx.request({
        url: `${app.globalData.domain}/api/v1/cart/add`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        data: {
          product_id: this.data.product.id,
          quantity: count,
          coupon_id: this.data.selectedCouponId
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0) {
              wx.showToast({
              title: '已加入购物车',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: res.data?.message || '加入购物车失败',
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
  
    // 立即购买
    buyNow() {
      // 根据product.id 获取商品信息
      const product = this.data.product;
      // const selectedItems = [{
      //   cartId: 0,
      //   courierFeeMin: product.courierFeeMin,
      //   id: product.id,
      //   image: product.headerImg,
      //   memberDiscount: product.memberDiscount,
      //   name: product.name,
      //   price: product.price,
      //   quantity: 1,
      //   selected: true,
      //   storeId: 1,
      //   storeName: "鸵小妥",
      //   couponPrice: this.data.couponList.find((coupon: any) => coupon.coupon_id === this.data.selectedCouponId)?.coupon_price || 0,
      //   couponId: this.data.selectedCouponId
      // }];
      // wx.setStorageSync('checkoutItems', selectedItems);
      wx.navigateTo({
        url: '/pages/cart/checkout/checkout?product_id=' + product.id + '&coupon_id=' + this.data.selectedCouponId
      });
    },
  
    // 跳转到店铺
    goToShop() {
      wx.navigateTo({
        url: '/pages/home/home'
      });
    },
  
    // 跳转到购物车
    goToCart() {
      wx.navigateTo({
        url: '/pages/cart/cart'
      });
    },
  
    // 联系客服
    contactService() {
      // 微信小程序客服功能
      // 这里可以不做任何处理，微信会自动处理
    }
  })