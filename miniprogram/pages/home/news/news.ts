Page({
  data: {
    activeType: 1, // 默认激活第一个标签类型
    newsTypes: [], // 所有新闻类型
    currentNewsList: [], // 当前显示的新闻列表
    loading: true,
    error: false,
    errorMessage: ''
  },
  
  onLoad(options) {
    this.fetchNewsData(options.keyword || '');
  },
  
  // 获取新闻数据
  fetchNewsData(keyword: string) {
    this.setData({ loading: true, error: false });
    
    try {
      const app = getApp();
      const token = wx.getStorageSync('token') || '';
      
      wx.request({
        url: app.globalData.domain + '/api/v1/news/list?keyword=' + keyword,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        success: (res: any) => {
          if (res.data && res.data.code === 0 && res.data.data) {
            // 获取所有新闻类型和数据
            const newsTypes = res.data.data;
            
            // 处理每个类型中的新闻项，格式化日期
            newsTypes.forEach((typeItem: any) => {
              if (typeItem.list && typeItem.list.length > 0) {
                typeItem.list = typeItem.list.map((newsItem: any) => {
                  // 格式化日期
                  const dateObj = new Date(newsItem.date);
                  const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
                  
                  return {
                    ...newsItem,
                    formattedDate: formattedDate
                  };
                });
              }
            });
            
            // 查找默认类型的新闻列表
            const activeType = this.data.activeType;
            const defaultTypeItem = newsTypes.find((item: any) => item.type === activeType);
            const currentNewsList = defaultTypeItem ? defaultTypeItem.list || [] : [];
            
            this.setData({
              newsTypes: newsTypes,
              currentNewsList: currentNewsList,
              loading: false
            });
          } else {
            // API 返回错误
            this.setData({
              loading: false,
              error: true,
              errorMessage: (res.data && res.data.message) || '获取新闻数据失败'
            });
          }
        },
        fail: (err) => {
          console.error('Request failed:', err);
          this.setData({
            loading: false,
            error: true,
            errorMessage: '网络请求失败'
          });
        }
      });
    } catch (err) {
      console.error('Error in fetchNewsData:', err);
      this.setData({
        loading: false,
        error: true,
        errorMessage: '获取新闻数据失败'
      });
    }
  },

  onSearchConfirm(e: any) {
    this.fetchNewsData(e.detail.value);
  },
  
  // 标签点击处理
  handleTagTap(e: any) {
    const typeId = parseInt(e.currentTarget.dataset.type, 10);
    // 找到对应类型的新闻列表
    const typeItem = this.data.newsTypes.find((item: any) => item.type === typeId);
    const newsList = typeItem ? typeItem.list || [] : [];
    this.setData({
      activeType: typeId,
      currentNewsList: newsList
    });
    
    // 记录当前选中的标签，方便页面返回时保持状态
    wx.setStorageSync('news_active_type', typeId);
    
    // 可选：滚动到内容区顶部
    wx.createSelectorQuery()
      .select('.search-content-list')
      .boundingClientRect(rect => {
        if (rect) {
          wx.pageScrollTo({
            scrollTop: rect.top,
            duration: 300
          });
        }
      }).exec();
  },
  
  // 导航到新闻详情
  navigateToDetail(e: any) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/home/news/detail/detail?title=${item.title}&date=${item.date}&content=${item.content}`
    });
  },
  
  // 重试获取数据
  retryFetch() {
    this.fetchNewsData();
  },
  
  // 返回首页
  navigateToHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
}); 