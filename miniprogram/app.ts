// app.ts

// Define the IAppOption interface with the domain property
interface IAppOption {
  globalData: {
    domain: string;
    userInfo?: WechatMiniprogram.UserInfo;
  }
}

App<IAppOption>({
  globalData: {
    domain: "https://ht.qxzgmsy.cn"
    //domain: "http://localhost:8289"
  },
  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      // 未登录，跳转到登录页
      wx.redirectTo({
        url: '/pages/guide/guide'
      })
      // wx.setStorageSync('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiJGOG1vMmJlIiwiUm9sZSI6MSwiTmlja25hbWUiOiJVbmtub3duIiwiU2l0ZU5vIjowLCJTaWduIjoiYjdmNzdmZmNiMTczNmE4MDYxMWZmZDE2NjRmYzY2NGYiLCJpc3MiOiJGOG1vMmJlIiwic3ViIjoid2VjaGF0IiwiYXVkIjpbIlVua25vd24iXSwiZXhwIjoxNzQ0MzY5NTc0LCJuYmYiOjE3NDE3Nzc1NzQsImlhdCI6MTc0MTc3NzU3NCwianRpIjoiRjhtbzJiZSJ9.mwGJF7MZ8c8NiWTrtw_J5QrW9VSz1U0firn6MnSgvOQ')
      // wx.redirectTo({
      //   url: '/pages/home/home'
      // })
    } else {
      // 已登录，跳转到首页 
      wx.redirectTo({
        url: '/pages/home/home'
      })
    }
  },
})