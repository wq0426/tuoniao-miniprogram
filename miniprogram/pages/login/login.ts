// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  data: {
    backButtonSrc: 'https://txtimages.oss-cn-beijing.aliyuncs.com/back.png',
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    phoneNumber: '',
    verificationCode: '',
    countdown: 0,
    isCountingDown: false
  },
  methods: {
    // 事件处理函数
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs',
      })
    },
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    },
    // 验证手机号是否合法
    isPhoneNumberValid(phone: string): boolean {
      const phoneRegex = /^1[3-9]\d{9}$/; // 简单的手机号正则
      return phoneRegex.test(phone);
    },

    // 验证验证码是否合法
    isVerificationCodeValid(code: string): boolean {
      return code.length === 6; // 假设验证码为6位数字
    },

    // 获取验证码
    getVerificationCode() {
      // Only proceed if not already counting down
      if (this.data.isCountingDown) {
        return;
      }
      
      if (!this.isPhoneNumberValid(this.data.phoneNumber)) {
        wx.showToast({
          title: '手机号不合法',
          icon: 'none',
          style: 'font-size: 27rpx'
        });
        return;
      }

      // Call the API to get the verification code
      // This part is commented out in your code but shown for completeness
      wx.request({
        url: app.globalData.domain + '/api/v1/account/code',
        method: 'POST',
        data: {
          phone: this.data.phoneNumber
        },
        success: (res) => {
          if (res.data.code === 0) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success',
            style: 'font-size: 27rpx'
          });
          
          // Start the countdown after showing the success toast
          this.startCountdown();
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              style: 'font-size: 27rpx'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '网络错误',
            icon: 'none',
            style: 'font-size: 27rpx'
          });
        }
      });
    },
    
    startCountdown() {
      // Set initial countdown state
      this.setData({
        countdown: 60,
        isCountingDown: true
      });
      
      // Start the timer
      const timer = setInterval(() => {
        if (this.data.countdown <= 1) {
          // When countdown reaches 0, clear the timer and reset
          clearInterval(timer);
          this.setData({
            countdown: 0,
            isCountingDown: false
          });
        } else {
          // Decrement the countdown
          this.setData({
            countdown: this.data.countdown - 1
          });
        }
      }, 1000);
    },

    // 登录
    login() {
      // 验证手机号
      if (!this.isPhoneNumberValid(this.data.phoneNumber)) {
        wx.showToast({
          title: '手机号不合法',
          icon: 'none',
          style: 'font-size: 27rpx'
        });
        return;
      }

      // 验证验证码
      if (!this.isVerificationCodeValid(this.data.verificationCode)) {
        wx.showToast({
          title: '验证码不合法',
          icon: 'none',
          style: 'font-size: 27rpx'
        });
        return;
      }

      // 调用登录接口
      wx.request({
        url: app.globalData.domain + '/api/v1/account/login',
        method: 'POST',
        data: {
          phone: this.data.phoneNumber,
          code: this.data.verificationCode
        },
        success: (res) => {
          if (res.data.code === 0) {
            // 设置token和过期时间
            wx.setStorageSync('token', res.data.data.accessToken)
            // 登录成功，跳转至首页
              wx.redirectTo({
              url: '/pages/home/home',
              success: () => {},
              fail: () => {
                wx.showToast({
                  title: '无法跳转到首页',
                  icon: 'none',
                  style: 'font-size: 27rpx'
                });
              }
            })
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              style: 'font-size: 27rpx'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '网络错误',
            icon: 'none',
            style: 'font-size: 27rpx'
          });
        }
      });
    },

    // 输入框变化事件
    onPhoneNumberChange(e: any) {
      this.setData({
        phoneNumber: e.detail.value,
      });
    },

    onVerificationCodeChange(e: any) {
      this.setData({
        verificationCode: e.detail.value,
      });
    },

    onBackButtonTap() {
      // Handle the tap event
      wx.navigateTo({
        url: '/pages/auth/auth'
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
  },
})
