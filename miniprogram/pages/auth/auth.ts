Page({
  data: {
    isLogging: false,
    isAuthorized: false,
    backButtonSrc: 'https://txtimages.oss-cn-beijing.aliyuncs.com/back.png', // Default image source
    circleImageSrc: '', // Default circle image source
    circleGouImageSrc: '',
    termsAccepted: false // Track whether terms are accepted
  },
  onLoad() {
    console.log('Auth page loaded');
  },
  authorize() {
    // Simulate authorization process
    this.setData({
      isAuthorized: true
    });
    wx.showToast({
      title: 'Authorization successful',
      icon: 'success'
    });
    // Navigate to the index page after authorization
    wx.navigateTo({
      url: '/pages/index/index'
    });
  },
  navigateToGuide() {
    wx.navigateTo({
      url: '/pages/guide/guide'
    });
  },
  navigateToLogin() {
    // Only allow navigation if terms are accepted
    if (this.data.termsAccepted) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    } else {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none',
        duration: 2000
      });
    }
  },
  onBackButtonTap() {
    // Handle the tap event
    wx.navigateTo({
      url: '/pages/guide/guide'
    });
  },
  onBackButtonHover() {
    // Change to active image on hover
    this.setData({
      backButtonSrc: 'https://txtimages.oss-cn-beijing.aliyuncs.com/back.png-active.png'
    });
  },
  onBackButtonLeave() {
    // Revert to default image when hover ends
    this.setData({
      backButtonSrc: 'https://txtimages.oss-cn-beijing.aliyuncs.com/back.png'
    });
  },
  onTipsCircleTap() {
    const newTermsAccepted = !this.data.termsAccepted;
    
    if (newTermsAccepted) {
      this.setData({
        circleImageSrc: 'https://txtimages.oss-cn-beijing.aliyuncs.com/icons/circle.png',
        circleGouImageSrc: 'https://txtimages.oss-cn-beijing.aliyuncs.com/icons/gou.png',
        termsAccepted: true
      });
    } else {
      this.setData({
        circleImageSrc: '',
        circleGouImageSrc: '',
        termsAccepted: false
      });
    }
  },
  loginWithWechat() {
    const app = getApp();
    let that = this;
    that.setData({
      isLogging: true
    });
    wx.login({
      success(res) {
        let code = res.code;
        console.log("code:",code);
        if (code) {
          // 将 code 发送至后端服务器
          wx.request({
            url: app.globalData.domain + '/api/v1/account/wechat_mini_login',
            method: 'POST',
            header: {
              'content-type': 'application/json',
            },
            data: { code: code },
            success: (response) => {
              console.log("response1:",response);
              // 获取用户信息权限
              wx.showModal({
                title: '授权请求',
                content: '我们需要获取您的用户信息以完善会员资料，是否授权？',
                success (res) {
                  if (res.confirm) {
                    wx.getUserProfile({
                      desc: '用于完善会员信息', // 声明用途
                      success(res) {
                        console.log("res2:",res);
                        // 包含用户昵称、头像等加密数据
                        const encryptedData = res.encryptedData;
                        const iv = res.iv;
                        const sessionKey = response.data.data.session_key;
                        const openid = response.data.data.openid;
                        // 将 encryptedData 和 iv 发送至后端解密
                        wx.request({
                          url: app.globalData.domain + '/api/v1/account/wechat/decrypt',
                          method: 'POST',
                          data: { encryptedData, iv, sessionKey, openid },
                          success: (response) => {
                            console.log("response2:",response);
                            if (response.data.code == 0) {
                              // 后端返回自定义登录态（如 token）
                              wx.setStorageSync('token', response.data.data.token);
                              wx.setStorageSync('user_info', response.data.data.user_info);
                              that.setData({
                                isLogging: false
                              });
                              wx.navigateTo({
                                url: '/pages/home/home'
                              });
                            } else {
                              wx.showToast({
                                title: '登录失败，请稍后再试',
                                icon: 'none',
                                duration: 2000
                              });
                            }
                          }
                        });
                      }
                    });
                  } else if (res.cancel) {
                    wx.showToast({
                      title: '授权失败，无法登录',
                      icon: 'none',
                      style: 'font-size: 27rpx'
                    });
                  }
                }
              });
            }
          });
        }
      }
    });
  }
}) 