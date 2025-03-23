Page({
    data: {
        url: ''
    },
    onLoad(options) {
        const trackingNumber = 'SF3147825920361';
        const url = `https://m.sf-express.com/sf/?from=wechat#/search/billNumber/${trackingNumber}`;
        this.setData({
            url: url
        });
    }
}) 