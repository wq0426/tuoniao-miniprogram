Page({
    onLoad() {},
    redirectToNextPage() {
        wx.navigateTo({
            url: '/pages/auth/auth'
        });
    }
}) 