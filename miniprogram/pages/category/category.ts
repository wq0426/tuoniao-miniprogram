Page({
  data: {
    activeTab: 1,
    products: [],
    marketStats: {
      soldCount: 2,
      unsoldCount: 1
    },
    categoryData: [],
    isShowCart: true,
    jiesuan: 0,
  },
  onLoad(options) {
    // Check if we have a tab parameter, otherwise default to 1
    this.fetchProductData(options.tab);
  },
  onShow() {
    // Check if we have a selected tab from global data
    const app = getApp();
    if (app.globalData && app.globalData.selectedCategoryTab) {
      const selectedTab = app.globalData.selectedCategoryTab;
      // Clear the global data
      app.globalData.selectedCategoryTab = null;
      // Switch to the selected tab
      this.loadProducts(selectedTab);
    }
  },
  navigateToHome() {
    wx.navigateTo({
      url: '/pages/home/home'
    });
  },
  navigateToDetail(e: any) {
    // Get the product ID from the dataset
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/category/detail/detail?id=${productId}`
    });
  },
  navigateToAdoption() {
    console.log('Navigating to adoption page');
    wx.redirectTo({
      url: '/pages/category/adoption/adoption'
    });
  },
  navigateToMarketDetail() {
    wx.navigateTo({
      url: '/pages/category/market-detail/market-detail'
    });
  },
  switchTab(e: any) {
    console.log('Switching tab to:', e.currentTarget.dataset.id);
    const categoryId = parseInt(e.currentTarget.dataset.id);
    this.loadProducts(categoryId);
  },
  fetchProductData() {
    wx.showLoading({
      title: '加载中',
    });
    
    try {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      wx.request({
        url: app.globalData.domain + '/api/v1/product/list',
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0) {
            this.transformApiData(res.data.data);
          } else {
            wx.showToast({
              title: '获取商品分类失败',
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
      console.error('Failed to fetch product data:', err);
      wx.hideLoading();
    }
  },
  transformApiData(apiData: any[]) {
    // Transform API data to match our UI structure
    const categoryData = apiData.map(category => {
      return {
        categoryId: category.category1_id,
        categoryName: category.category1_name,
        subCategories: category.category2_list.map(subCategory => {
          return {
            categoryId: subCategory.category2_id,
            categoryName: subCategory.category2_name,
            products: this.transformProductsToUIFormat(subCategory.product_list)
          };
        })
      };
    });
    // Store the transformed data
    this.setData({
      categoryData: categoryData
    });
    // Load the first category by default
    if (categoryData && categoryData.length > 0) {
      this.loadProducts(categoryData[0].categoryId);
    }
  },
  transformProductsToUIFormat(products: any[]) {
    // Group products into pairs for the UI layout
    const rows: any[] = [];
    for (let i = 0; i < products.length; i += 2) {
      const row = {
        left: {},
        right: {}
      };
      
      // Add the first product
      row.left = {
        id: products[i].product_id,
        img: products[i].header_img,
        name: products[i].product_name,
        sell: products[i].product_sales.toString(),
        price: products[i].product_current_price.toString(),
        quantity: products[i].product_quantity,
        isShowCart: true
        };
      
      // Add the second product if it exists
      if (i + 1 < products.length) {
        row.right = {
          id: products[i + 1].product_id,
          img: products[i + 1].header_img,
          name: products[i + 1].product_name,
          sell: products[i + 1].product_sales.toString(),
          price: products[i + 1].product_current_price.toString(),
          quantity: products[i + 1].product_quantity,
          isShowCart: true
        };
      }
      
      rows.push(row);
    }
    
    return rows;
  },
  loadProducts(categoryId: number) {
    console.log('Loading products for category:', categoryId);
    
    // Find the selected category from our transformed data
    const categoryData = this.data.categoryData || [];
    const selectedCategory = categoryData.find(cat => cat.categoryId === categoryId);
    
    if (!selectedCategory) {
      console.log('Category not found:', categoryId);
      return;
    }
    
    // Transform into the format expected by the UI
    const productsForUI = selectedCategory.subCategories.map(subCat => {
      return {
        categoryName: subCat.categoryName,
        list: subCat.products
      };
    });
    
    // For now, we'll continue handling tab 9 (market) the same way as before
    if (categoryId === 9) {
      // Manually construct market data for now, can be updated later to use API
      // Fetch market data from API
      const app = getApp<IAppOption>();
      const token = wx.getStorageSync('token') || '';
      wx.request({
        url: `${app.globalData.domain}/api/v1/market/mine`,
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'Authorization': "Bearer " + token
        },
        success: (res: any) => {
          if (res.data.code === 0) {
            // Transform others items and add to marketData
            const othersItems = res.data.data.others.map((item: any) => ({
              id: item.id,
              price: item.egg_price.toString(),
              quantity: item.egg_num.toString(),
              date: item.date,
              img: "https://txtimages.oss-cn-beijing.aliyuncs.com/category/nosell.png"
            }));
            // Update the page data with combined market items and stats
            this.setData({
              activeTab: categoryId,
              products: [],
              marketItems: othersItems,
              marketStats: {
                soldCount: res.data.data.summary.total_selled,
                unsoldCount: res.data.data.summary.total_no_sell
              }
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
        }
      });
    } else {
      this.setData({
        activeTab: categoryId,
        products: productsForUI,
        marketItems: []
      });
    }
  },
  navigateToCheckout() {
    wx.navigateTo({
      url: '/pages/cart/checkout/checkout'
    });
  },
  decreaseQuantity(e: any) {
    const id = e.currentTarget.dataset.id;
    let totalPrice = this.data.jiesuan;
    const cartItems = this.data.products.map(item => {
      item.list.forEach(row => {
        row.forEach(r => {
          if (r.id === id) {
            r.quantity = r.quantity - 1;
            // 减少总价
            totalPrice -= parseFloat(r.price);
            this.updateItemQuantity(id, -1);
          }
          return r;
        });
        return row;
      });
      return item;
    });
    this.setData({ 
      products: cartItems,
      jiesuan: Math.max(0, totalPrice) // 确保不会出现负数
    });
  },
  increaseQuantity(e: any) {
    const id = e.currentTarget.dataset.id;
    let totalPrice = this.data.jiesuan;
    const cartItems = this.data.products.map(item => {
      item.list.forEach(row => {
        row.forEach(r => {
          if (r.id === id) {
            r.quantity = r.quantity + 1;
            // 增加总价
            totalPrice += parseFloat(r.price);
            this.updateItemQuantity(id, 1);
          }
          return r;
        });
        return row;
      });
      return item;
    }); 
    this.setData({
      products: cartItems,
      jiesuan: totalPrice
    });
  },
  toggleCartControls(e: any) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    const token = wx.getStorageSync('token') || '';

    const products = this.data.products.map(category => {
      category.list.map(r => {
            if (r.left && r.left.id === id) {
              r.left.quantity = r.left.quantity + 1;
              // 调用接口实现添加购物车
              wx.request({
                url: app.globalData.domain + '/api/v1/cart/add',
                header: {
                  'Content-Type': 'application/json',
                  'Authorization': "Bearer " + token
                },
                method: 'POST',
                data: {
                  product_id: id,
                  quantity: 1
                },
                success: (res: any) => {
                  console.log(res);
                }
              });
            }
            if (r.right && r.right.id === id) {
              r.right.quantity = r.right.quantity + 1;
              // 调用接口实现添加购物车
              wx.request({
                url: app.globalData.domain + '/api/v1/cart/add',
                header: {
                  'Content-Type': 'application/json',
                  'Authorization': "Bearer " + token
                },
                method: 'POST',
                data: {
                  product_id: id,
                  quantity: 1
                },
                success: (res: any) => {
                  console.log(res);
                }
              });
            }
            return r;
        });
      return category;
    });
    // Store the transformed data
    this.setData({
      products: products
    });
    wx.showToast({
      title: '添加购物车成功',
      icon: 'success',
      duration: 2000
    });
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
});