Page({
  data: {
    currentDate: '2025年2月',
    gameSectionExpanded: false,
    productSectionExpanded: true,
    breedingSectionExpanded: true,
    gameEggIncome: {},
    productBirdIncome: {},
    breedingBirdIncome: {},
    // 日期选择相关
    showDatePickerModal: false,
    selectedYear: '2025年',
    selectedMonth: '2月',
    tempYear: '2025年',
    tempMonth: '2月',
    currentIncomeType: 'game',
    currentYear: new Date().getFullYear(), // 当前年份
    
    // 年份和月份列表
    yearList: ['2023年', '2024年', '2025年', '2026年', '2027年'],
    monthList: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    
    // swiper 当前索引
    yearIndex: 2,  // 默认选中2025年
    monthIndex: 1  // 默认选中2月
  },

  onLoad() {
    // 初始化年份列表
    this.initYearList();
    
    // 设置当前日期
    this.setCurrentDate();

    // 获取收益数据
    this.fetchIncomeData();
  },

  // 初始化年份列表
  initYearList() {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    
    // 生成从当前年份-2到当前年份+2的年份列表
    for (let i = -2; i <= 2; i++) {
      yearList.push(`${currentYear + i}年`);
    }
    
    this.setData({
      yearList: yearList,
      // 默认选中当前年份
      yearIndex: 2
    });
  },

  // 设置当前日期
  setCurrentDate() {
    const now = new Date();
    const currentYear = `${now.getFullYear()}年`;
    const currentMonth = `${now.getMonth() + 1}月`;
    
    // 查找当前年月在列表中的索引
    const yearIndex = this.data.yearList.findIndex(year => year === currentYear);
    const monthIndex = now.getMonth(); // 月份是0-11，而我们的monthList是1-12，所以直接使用getMonth()
    
    this.setData({
      selectedYear: currentYear,
      selectedMonth: currentMonth,
      tempYear: currentYear,
      tempMonth: currentMonth,
      yearIndex: yearIndex !== -1 ? yearIndex : 2,
      monthIndex: monthIndex,
      currentDate: `${currentYear}${currentMonth}`
    });
  },

  // 显示日期选择器
  showDatePicker(e) {
    const type = e.currentTarget.dataset.type;
    
    this.setData({
      currentIncomeType: type,
      showDatePickerModal: true,
      tempYear: this.data.selectedYear,
      tempMonth: this.data.selectedMonth
    });
  },

  // 年份滑动事件处理
  onYearSwiperChange(e) {
    const currentIndex = e.detail.current;
    this.setData({
      yearIndex: currentIndex,
      tempYear: this.data.yearList[currentIndex]
    });
  },

  // 月份滑动事件处理
  onMonthSwiperChange(e) {
    const currentIndex = e.detail.current;
    this.setData({
      monthIndex: currentIndex,
      tempMonth: this.data.monthList[currentIndex]
    });
  },

  // 取消日期选择
  cancelDateSelection() {
    this.setData({
      showDatePickerModal: false
    });
  },

  // 确认日期选择
  confirmDateSelection() {
    this.setData({
      selectedYear: this.data.tempYear,
      selectedMonth: this.data.tempMonth,
      currentDate: `${this.data.tempYear}${this.data.tempMonth}`,
      showDatePickerModal: false
    });
    
    // 根据选择的日期更新收益数据
    this.fetchIncomeData(this.data.selectedYear, this.data.selectedMonth, this.data.currentIncomeType);
  },

  // 获取收益数据
  fetchIncomeData(year = this.data.selectedYear, month = this.data.selectedMonth, type = this.data.currentIncomeType) {
    // 这里应该是调用API获取对应日期和类型的收益数据
    const token = wx.getStorageSync('token') || '';
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 显示加载状态
    wx.showLoading({
      title: '加载中...'
    });

    const app = getApp();
    wx.request({
      url: `${app.globalData.domain}/api/v1/earning/list`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          // 处理收益数据
          this.processIncomeData(res.data.data.list);
        } else {
          wx.showToast({
            title: res.data.message || '获取收益数据失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 处理收益数据
  processIncomeData(incomeList: Array<any>) {
    incomeList.forEach(item => {
      if (item.id === 1) {
        item.date_list.forEach(it => {
          it.expanded = false;
        });
        this.setData({
          gameEggIncome: item.date_list,
        });
      } else if (item.id === 2) {
        item.date_list.forEach(it => {
          it.expanded = false;
        });
        this.setData({
          productBirdIncome: item.date_list,
        });
      } else if (item.id === 3) {
        item.date_list.forEach(it => {
          it.expanded = false;
        });
        this.setData({
          breedingBirdIncome: item.date_list,
        });
      }
    });
  },

  // 切换区块展开/收起状态
  toggleSection(e) {
    const type = e.currentTarget.dataset.type;
    const date = e.currentTarget.dataset.date;
    
    if (type === 'game') {
      // 遍历gameEggIncome，将expanded设置为!this.data.gameSectionExpanded
      this.data.gameEggIncome.forEach(it => {
        if (it.date === date) {
          it.expanded = !it.expanded;
        }
      });
      this.setData({
        gameEggIncome: this.data.gameEggIncome
      });
    } else if (type === 'product') {
      this.data.productBirdIncome.forEach(it => {
        if (it.date === date) {
          it.expanded = !it.expanded;
        }
      });
      this.setData({
        productBirdIncome: this.data.productBirdIncome
      });
    } else if (type === 'breeding') {
      this.data.breedingBirdIncome.forEach(it => {
        if (it.date === date) {
          it.expanded = !it.expanded;
        }
      });
      this.setData({
        breedingBirdIncome: this.data.breedingBirdIncome
      });
    }
  },

  // 点击年份时显示年份选择器
  tapYear() {
    // 未来可以在这里实现年份选择的逻辑
    // 例如显示年份选择列表或者使用系统日期选择器
  },

  // 点击月份时显示月份选择器
  tapMonth() {
    // 未来可以在这里实现月份选择的逻辑
    // 例如显示月份选择列表或者使用系统日期选择器
  }
}); 