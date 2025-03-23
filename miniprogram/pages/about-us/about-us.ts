Page({
  data: {
    certificateImage: 'https://example.com/certificate.jpg', // 替换为实际的证书图片地址
    currentCertificate: 0, // 添加轮播图当前索引
    certificates: [
      [
        'https://txtimages.oss-cn-beijing.aliyuncs.com/about/member1.png',
        'https://txtimages.oss-cn-beijing.aliyuncs.com/about/member2.png'
      ],
      [
        'https://txtimages.oss-cn-beijing.aliyuncs.com/about/breeding1.png',
        'https://txtimages.oss-cn-beijing.aliyuncs.com/about/breeding2.png'
      ]
    ]
  },

  onLoad() {
    // 页面加载时的逻辑
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.src || this.data.certificates[this.data.currentCertificate];
    wx.previewImage({
      current: current,
      urls: this.data.certificates
    });
  },

  // 切换证书
  swiperChange(e) {
    this.setData({
      currentCertificate: e.detail.current
    });
  }
}); 