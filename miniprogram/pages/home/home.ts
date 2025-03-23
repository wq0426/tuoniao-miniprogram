import api from '../../utils/api';

Page({
  data: {
    message: '立即体验',
    banners: [], // 存储 banner 数据
    loading: true, // 加载状态
    recommendedProducts: [], // 存储推荐产品数据
    jiesuan: 0
  },
  onLoad() {
    // 同步获取banner数据
    this.fetchBanners();
    // 获取推荐产品数据
    this.fetchRecommendedProducts();
  },
  navigateToAuth() {
    wx.navigateTo({
      url: '/pages/auth/auth'
    });
  },
  navigateToMonitor() {
    wx.navigateTo({
      url: '/pages/home/monitor/monitor'
    });
  },
  navigateToNews() {
    wx.navigateTo({
      url: '/pages/home/news/news'
    });
  },
  navigateToAdoption() {
    // First, make sure the app has globalData
    const app = getApp();
    if (!app.globalData) {
      app.globalData = {};
    }
    
    // Set the selected tab before navigation
    app.globalData.selectedCategoryTab = 2;
    // Then navigate to the category page
    wx.navigateTo({
      url: '/pages/category/category'
    });
  },
  navigateToProduct() {
    wx.navigateTo({
      url: '/pages/category/product/product'
    });
  },
  navigateToDistribute() {
    wx.navigateTo({
      url: '/pages/home/distribute/distribute'
    });
  },
  navigateToDetail() {
    wx.navigateTo({
      url: '/pages/category/detail/detail'
    });
  },
  navigateToNewsDetail() {
    wx.navigateTo({
      url: '/pages/home/news/detail/detail'
    });
  },
  navigateToWechatArticle(e: any) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  },
  // 从 API 获取 banner 数据
  fetchBanners() {
    this.setData({ loading: true });
    
    try {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      
      wx.request({
        url: app.globalData.domain + '/api/v1/banner/list',
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0 && res.data.data) {
            this.setData({
              banners: res.data.data,
              loading: false
            });
          } else {
            // API 返回错误
            console.error('API error:', (res.data && res.data.message) || '获取 banner 失败');
            this.setData({ loading: false });
          }
        },
        sync: true
      }) as any;
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      this.setData({ loading: false });
    }
  },
  // 从 API 获取推荐产品数据
  fetchRecommendedProducts() {
    try {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      
      // 定义产品行的类型接口
      interface ProductRow {
        left: {
          id: string;
          name: string;
          price: number;
          img: string;
          quantity: number;
          isShowCart: boolean;
        };
        right: {
          id: string;
          name: string;
          price: number;
          img: string;
          quantity: number;
          isShowCart: boolean;
        } | null;
      }
      
      // 使用同步方式获取推荐产品
      wx.request({
        url: app.globalData.domain + '/api/v1/product/recommend',
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0 && res.data.data) {
            // 将API数据转换为UI所需格式
            this.formatProductsForUI(res.data.data, token);
          } else {
            // API 返回错误
            console.error('API error:', (res.data && res.data.message) || '获取推荐产品失败');
          }
        },
        sync: true
      }) as any;
    } catch (err) {
      console.error('Failed to fetch recommended products:', err);
    }
  },
  
  // 格式化产品数据以适应UI布局（两列布局）
  formatProductsForUI(products: any[], token: string){
    // 定义明确类型的行数组
    const rows: any[] = [];
    
    // 请求cart数据（同步方式）
    const app = getApp();
    const cartMap = new Map<string, number>();
    
    wx.request({
      url: app.globalData.domain + '/api/v1/cart/list',
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0 && res.data.data) {
          res.data.data.forEach((item: any) => {
            if (item.list && item.list.length > 0) {
              item.list.forEach((item2: any) => {
                cartMap.set(item2.product_id, item2.quantity);
              });
            }
          });
        }

        // 将产品两两分组
        for (let i = 0; i < products.length; i += 2) {
          const leftQuantity = cartMap.get(products[i].product_id) || 0;
          const rightQuantity = (i + 1 < products.length) ? (cartMap.get(products[i + 1].product_id) || 0) : 0;
          
          const row = {
            left: {
              id: products[i].product_id,
              name: products[i].product_name,
              price: products[i].product_current_price,
              img: products[i].header_img || 'https://txtimages.oss-cn-beijing.aliyuncs.com/home/product1.jpg', // 使用默认图片如果API没返回
              quantity: leftQuantity,
              isShowCart: true
            },
            right: i + 1 < products.length ? {
              id: products[i + 1].product_id,
              name: products[i + 1].product_name,
              price: products[i + 1].product_current_price,
              img: products[i + 1].header_img || 'https://txtimages.oss-cn-beijing.aliyuncs.com/home/product2.jpg',
              quantity: rightQuantity,
              isShowCart: true
            } : null // 如果没有配对的右侧产品，则设为null
          };
          
          rows.push(row);
        }
        this.setData({
          recommendedProducts: rows
        });
      },
      sync: true
    }) as any;
  },

  navigateToMovie() {
    wx.showToast({
      title: '该功能正在开发中',
      icon: 'none',
      duration: 2000
    });
  },
  
  // 处理产品点击，导航到详情页
  navigateToProductDetail(e: any) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/category/detail/detail?id=${productId}`
    });
  },
  // 处理 banner 点击事件
  onBannerTap(e: any) {
    const banner = e.currentTarget.dataset.banner;
    if (banner && banner.url) {
      // 内部页面跳转
      wx.navigateTo({
        url: banner.url
      });
    }
  },

  toggleCartControls(e: any) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    this.data.recommendedProducts.forEach((r: any)  => {
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
    this.setData({
      recommendedProducts: this.data.recommendedProducts,
    });
    wx.showToast({
      title: '添加购物车成功',
      icon: 'success',
      duration: 2000
    });
  },
}) 