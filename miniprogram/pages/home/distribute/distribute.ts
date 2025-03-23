Page({
  data: {
    longitude: 103.99,  // 默认居中显示成都总部
    latitude: 31.04,    
    markers: [
      {
        id: 1,
        longitude: 81.32,
        latitude: 43.96,
        title: '新疆分布式农场',
        iconPath: 'https://txtimages.oss-cn-beijing.aliyuncs.com/icons/flag.png',
        width: 30,
        height: 30
      },
      {
        id: 2,
        longitude: 104.47,
        latitude: 31.05,
        title: '成都总部农场德阳分区',
        iconPath: 'https://txtimages.oss-cn-beijing.aliyuncs.com/icons/flag.png',
        width: 30,
        height: 30
      },
      {
        id: 3,
        longitude: 104.23,
        latitude: 29.51,
        title: '自贡分布式农场',
        iconPath: 'https://txtimages.oss-cn-beijing.aliyuncs.com/icons/flag.png',
        width: 30,
        height: 30
      },
      {
        id: 4,
        longitude: 106.52,
        latitude: 26.49,
        title: '贵州分布式农场',
        iconPath: 'https://txtimages.oss-cn-beijing.aliyuncs.com/icons/flag.png',
        width: 30,
        height: 30
      },
      {
        id: 5,
        longitude: 103.99,
        latitude: 31.04,
        title: '四川成都总部农场',
        iconPath: 'https://txtimages.oss-cn-beijing.aliyuncs.com/icons/flag.png',
        width: 30,
        height: 30
      }
    ],
    showDetail: false,
    title: '',
    address: '',
    description: '',
    svgSupported: true,
    // Store province data for highlighting
    provinces: [
      { id: 1, name: '新疆', active: false },
      { id: 2, name: '四川', active: false },
      { id: 3, name: '自贡', active: false },
      { id: 4, name: '贵州', active: false },
    ],
    // Farm data
    farmData: [
      {
        id: 1,
        title: '新疆分布式农场',
        address: '新疆维吾尔自治区乌鲁木齐市',
        description: '新疆分布式农场位于新疆维吾尔自治区，占地面积约1000亩，主要养殖黑颈鸵鸟，年产量约5000只。农场采用现代化养殖技术，确保鸵鸟生长健康，肉质鲜美。'
      },
      {
        id: 2,
        title: '成都总部农场德阳分区',
        address: '四川省德阳市',
        description: '德阳分区是成都总部农场的重要分支，占地面积约800亩，专注于鸵鸟育种研究，拥有先进的育种设备和专业的科研团队，为农场提供高质量的种鸟。'
      },
      {
        id: 3,
        title: '自贡分布式农场',
        address: '四川省自贡市',
        description: '自贡分布式农场位于四川省自贡市，占地面积约600亩，主要养殖蓝颈鸵鸟，年产量约3000只。农场致力于生态养殖，打造绿色、健康的鸵鸟产品。'
      },
      {
        id: 4,
        title: '贵州分布式农场',
        address: '贵州省贵阳市',
        description: '贵州分布式农场位于贵州省贵阳市，占地面积约500亩，主要养殖红颈鸵鸟，年产量约2500只。农场结合当地特色，打造了集养殖、观光、教育于一体的综合性农场。'
      },
      {
        id: 5,
        title: '四川成都总部农场',
        address: '四川省成都市',
        description: '四川成都总部农场是整个鸵鸟养殖网络的核心，占地面积约1200亩，拥有完整的鸵鸟养殖产业链，包括养殖、加工、研发等环节，年产量约7000只。总部农场还设有培训中心，为各分布式农场提供技术支持。'
      }
    ]
  },
  
  onLoad() {
    console.log('Distribute page loaded');
    
    // 获取用户位置（仅用于定位，不会影响农场标记）
    this.getUserLocation();
    
    // Check if SVG is supported or rendering properly
    try {
      // Add a small delay to allow rendering
      setTimeout(() => {
        // Check if SVG elements exist and have width
        const query = wx.createSelectorQuery();
        query.select('.map-container svg').boundingClientRect();
        query.exec((res) => {
          if (!res[0] || res[0].width === 0) {
            this.setData({ svgSupported: false });
            console.log('SVG not rendering properly, falling back to image');
          }
        });
      }, 500);
    } catch (e) {
      this.setData({ svgSupported: false });
      console.error('Error checking SVG support', e);
    }
  },
  
  // 当点击地图标记时触发
  onMarkerTap(e) {
    const markerId = e.markerId;
    console.log('点击了标记', markerId);
    // 根据标记ID打开对应农场详情
    this.openDetailByMarkerId(markerId);
  },
  
  // 通过标记ID打开详情
  openDetailByMarkerId(markerId) {
    const currentFarm = this.data.farmData.find(farm => farm.id === markerId);
    if (currentFarm) {
      this.setData({
        showDetail: true,
        title: currentFarm.title,
        address: currentFarm.address,
        description: currentFarm.description
      });
    }
  },
  
  getUserLocation() {
    // 先检查权限
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] === undefined || res.authSetting['scope.userLocation'] === true) {
          // 用户已授权或首次使用
          wx.getLocation({
            type: 'gcj02',  // 使用国测局坐标系
            success: (res) => {
              console.log('获取位置成功:', res);
              // 仅更新地图中心位置，保留所有农场标记
              this.setData({
                longitude: res.longitude,
                latitude: res.latitude
              });
            },
            fail: (err) => {
              console.error('获取位置失败:', err);
              // 保持默认位置（成都总部）
            }
          });
        } else {
          // 用户拒绝授权，显示引导
          wx.showModal({
            title: '需要位置权限',
            content: '请允许使用您的位置信息以查看附近农场',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: (authRes) => {
                    if (authRes.authSetting['scope.userLocation']) {
                      this.getUserLocation();
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  },
  
  // 保留原有方法，同时兼容新旧UI
  openDetail(e) {
    const currentId = e.currentTarget.dataset.id;
    // 调用通过ID打开详情的方法
    this.openDetailByMarkerId(parseInt(currentId));
  },
  
  // 关闭详情
  closeDetail() {
    this.setData({
      showDetail: false
    });
  },
  
  // 返回首页
  navigateToHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
}); 