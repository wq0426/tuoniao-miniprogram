Page({
  data: {
    userInfo: {
      avatar: 'https://txtimages.oss-cn-beijing.aliyuncs.com/profile/avatar.png',
      nickname: '',
      gender: '未知',
      birthDate: '',
      memberLevel: '默认会员',
      phoneNumber: ''
    }
  },

  onLoad() {
    // Load user information if available
    this.getProfile();
  },

  getProfile() {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: app.globalData.domain + '/api/v1/account/profile',
      method: 'GET',
      header: {
        'Authorization': "Bearer " + token
      },
      success: (res: any) => {
        console.log('Get profile success:', res);
        if (res.data && res.data.code === 0) {
          this.setData({
            'userInfo': res.data.data
          });
        } else {
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          });
        }
      }
    });
  },

  navigateToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile',
      fail: () => {
        // Fallback if switchTab fails
        wx.navigateBack();
      }
    });
  },

  updateProfile(method: 'PUT' | 'POST', data: any) {
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    wx.request({
      url: app.globalData.domain + '/api/v1/account/profile',
      method: method,
      data: data,
      header: {
        'Authorization': "Bearer " + token
      },
      success: (res: any) => {
        console.log('Update avatar success:', res);
        // 刷新用户信息
        this.getProfile();
      }
    });
  },

  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('Choose image success:', res.tempFiles[0].path);
        wx.getFileSystemManager().readFile({
          filePath: res.tempFiles[0].path,
          encoding: 'base64',
          success: (result) => {
            const base64Data = result.data;
            // Update avatar in a real app
            this.updateProfile('PUT', {
              avatar_base64: base64Data
            });
            // For demo, just show a toast
            wx.showToast({
              title: '头像更新成功',
              icon: 'success'
            });
          },
          fail: (error) => {
            console.error('Failed to convert image to Base64:', error);
          }
        });
      }
    });
  },

  editNickname() {
    wx.showModal({
      title: '设置昵称',
      editable: true,
      placeholderText: '请输入昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'userInfo.nickname': res.content
          });
          this.updateProfile('PUT', {
            nickname: res.content
          });
          wx.showToast({
            title: '昵称更改成功',
            icon: 'success'
          });
        }
      }
    });
  },

  selectGender() {
    wx.showActionSheet({
      itemList: ['男', '女', '未知'],
      success: (res) => {
        this.setData({
          'userInfo.gender': res.tapIndex
        });
        this.updateProfile('PUT', {
          gender: res.tapIndex + 1
        });
        wx.showToast({
          title: '性别更改成功',
          icon: 'success'
        });
      }
    });
  },

  onBirthDateChange(e: any) {
    this.setData({
      'userInfo.birthday': e.detail.value
    });
    this.updateProfile('PUT', {
      birthday: e.detail.value
    }); 
    wx.showToast({
      title: '生日更改成功',
      icon: 'success'
    });
  },

  checkMemberLevel() {
    this.updateProfile('PUT', {
      member_level: 1
    });
    this.setData({
      'userInfo.member_level': 1
    });
    wx.showToast({
      title: '会员等级更改成功',
      icon: 'success'
    });
  },

  manageAddress() {
    wx.showModal({
      title: '更改地址',
      editable: true,
      placeholderText: '请输入地址',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'userInfo.address': res.content
          });
          this.updateProfile('PUT', { 
            address: res.content
          });
          wx.showToast({
            title: '地址更改成功',
            icon: 'success'
          });
        }
      }
    });
  },

  bindPhone() {
    wx.showModal({
      title: '绑定手机号',
      editable: true,
      placeholderText: '请输入手机号',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'userInfo.phone': res.content
          });
          this.updateProfile('PUT', {
            phone: res.content
          });
          wx.showToast({
            title: '手机号绑定成功',
            icon: 'success'
          });
        }
      }
    });
  },

  verifyRealName() {
    wx.showToast({
      title: '实名认证功能待实现',
      icon: 'none'
    });
  },

  manageAccountSecurity() {
    wx.showToast({
      title: '账户安全功能待实现',
      icon: 'none'
    });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({
            url: '/pages/auth/auth'
          });
        }
      }
    });
  }
}); 