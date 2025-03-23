// custom-tabbar.js
Component({
    data: {
      selected: 0,
      color: "#8a8a8a",
      selectedColor: "#ADC05A",
      list: [
        {
          pagePath: "/pages/home/home",
          text: "首页",
          iconPath: "/images/icons/home.png",
          selectedIconPath: "/images/icons/home-active.png"
        },
        {
          pagePath: "/pages/category/category",
          text: "分类",
          iconPath: "/images/icons/category.png",
          selectedIconPath: "/images/icons/category-active.png"
        },
        {
          pagePath: "",
          text: "",
          iconPath: "/images/tabbar/game.png",
          selectedIconPath: "/images/tabbar/game.png",
          isCenter: true
        },
        {
          pagePath: "/pages/cart/cart",
          text: "购物车",
          iconPath: "/images/icons/cart.png",
          selectedIconPath: "/images/icons/cart-active.png"
        },
        {
          pagePath: "/pages/profile/profile",
          text: "个人中心",
          iconPath: "/images/icons/profile.png",
          selectedIconPath: "/images/icons/profile-active.png"
        }
      ]
    },

    lifetimes: {
      attached() {
        this.setData({
          selected: this.getTabBarIndex()
        });
      },

      pageLifetimes: {
        show() {
          this.setData({
            selected: this.getTabBarIndex()
          });
        }
      }
    },
  
    methods: {
      switchTab(e) {
        const data = e.currentTarget.dataset;
        // Skip if it's the center logo (no navigation)
        if (data.isCenter) return;
        
        const url = data.path;
        if (!url) return;
        
        // Use redirectTo instead of switchTab
        wx.redirectTo({
          url,
          success: () => {
            this.setData({
              selected: parseInt(data.index)
            });
          },
          fail: (err) => {
            console.error("Navigation failed:", err);
          }
        });
      },

      getTabBarIndex() {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const currentPath = currentPage.route;
        
        // Find the tab index but skip the center logo tab
        let tabIndex = -1;
        this.data.list.forEach((item, index) => {
          if (!item.isCenter) {
            const itemPath = item.pagePath.startsWith('/') ? item.pagePath.substr(1) : item.pagePath;
            if (itemPath === currentPath) {
              tabIndex = index;
            }
          }
        });
        
        return tabIndex !== -1 ? tabIndex : 0;
      }
    }
  });