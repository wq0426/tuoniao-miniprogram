Page({
    onLoad() {},
    redirectToNextPage() {
        wx.redirectTo({
            url: '/pages/auth/auth'
        });
    }
}) 