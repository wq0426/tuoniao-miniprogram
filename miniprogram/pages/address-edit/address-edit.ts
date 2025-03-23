import * as site from './site';

Page({
  data: {
    // 地址数据
    addressData: {
      id: '',
      name: '',
      phone: '',
      region: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false
    },
    
    // 编辑模式（true为编辑，false为新增）
    isEdit: false,
    
    // 地区选择器相关
    showRegionPicker: false,
    provinces: [],
    cities: [],
    districts: [],
    regionValue: [0, 0, 0],
    selectedRegion: {
      province: '',
      city: '',
      district: ''
    },
    
    // 区域数据结构 - 省市区层级关系
    regionData: {
      
    },

  },

  onLoad(options) {
    // 提取regionData
    this.setData({
        regionData: {
            ...site.regionData
        },
        provinces: Object.keys(site.regionData),
    });
    // 初始化城市和区域数据
    this.initRegionData();
    // 如果传入id，表示是编辑模式
    if (options.id) {
      const addressSelected = wx.getStorageSync('addressSelected'); 
      // 获取地址详情
      this.fetchAddressDetail(addressSelected);
      
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: '编辑地址'
      });
    }
  },
  
  // 初始化地区数据 - 根据当前选择的省份加载对应的城市
  initRegionData() {
    const { provinces, regionData, regionValue } = this.data;
    const selectedProvince = provinces[regionValue[0]];
    
    if (selectedProvince && regionData[selectedProvince]) {
      const cities = regionData[selectedProvince].cities || [];
      const selectedCity = cities[regionValue[1]] || cities[0] || '';
      const districts = selectedCity ? (regionData[selectedProvince].districts[selectedCity] || []) : [];
      
      this.setData({
        cities,
        districts,
        selectedRegion: {
          province: selectedProvince,
          city: selectedCity,
          district: districts[regionValue[2]] || districts[0] || ''
        }
      });
    }
  },
  
  // 获取地址详情
  fetchAddressDetail(addressSelected: any) {
    this.setData({
      isEdit: true,
      addressData: addressSelected
    });
    // 初始化地区选择器的值
    this.initRegionValueFromAddress(addressSelected);
  },
  
  // 从地址初始化地区选择器的值
  initRegionValueFromAddress(addressSelected: any) {
    const { provinces, regionData } = this.data;
    
    // 查找省份索引
    const provinceIndex = provinces.findIndex(p => p === addressSelected.province);
    if (provinceIndex === -1) return;
    
    // 设置城市列表
    const cities = regionData[addressSelected.province]?.cities || [];
    
    // 查找城市索引
    const cityIndex = cities.findIndex(c => c === addressSelected.city);
    if (cityIndex === -1) return;
    
    // 设置区域列表
    const districts = regionData[addressSelected.province]?.districts[addressSelected.city] || [];
    
    // 查找区域索引
    const districtIndex = districts.findIndex(d => d === addressSelected.district);
    
    // 更新数据
    this.setData({
      cities,
      districts,
      regionValue: [provinceIndex, cityIndex, districtIndex !== -1 ? districtIndex : 0],
      selectedRegion: {
        province: addressSelected.province,
        city: addressSelected.city,
        district: addressSelected.district
      }
    });
  },

  // 监听区域选择改变
  onRegionChange(e) {
    const { provinces, cities, districts, regionData } = this.data;
    const values = e.detail.value;
    
    // 获取当前选中的省市区名称
    const selectedProvince = provinces[values[0]] || '';
    
    // 如果省份改变，需要更新城市列表
    let updatedCities = cities;
    let updatedDistricts = districts;
    let cityIndex = values[1];
    let districtIndex = values[2];
    
    // 省份变化时更新城市列表
    if (selectedProvince !== this.data.selectedRegion.province) {
      updatedCities = regionData[selectedProvince]?.cities || [];
      cityIndex = 0; // 重置城市索引
      districtIndex = 0; // 重置区域索引
    }
    
    // 获取当前选中的城市
    const selectedCity = updatedCities[cityIndex] || '';
    
    // 城市变化时更新区域列表
    if (selectedCity !== this.data.selectedRegion.city || selectedProvince !== this.data.selectedRegion.province) {
      updatedDistricts = regionData[selectedProvince]?.districts[selectedCity] || [];
      if (!updatedDistricts.length) {
        districtIndex = 0;
      }
    }
    
    // 获取当前选中的区域
    const selectedDistrict = updatedDistricts[districtIndex] || '';
    
    // 更新数据
    this.setData({
      cities: updatedCities,
      districts: updatedDistricts,
      regionValue: [values[0], cityIndex, districtIndex],
      selectedRegion: {
        province: selectedProvince,
        city: selectedCity,
        district: selectedDistrict
      }
    });
  },
  
  // 打开地区选择器
  openRegionPicker() {
    this.setData({
      showRegionPicker: true
    });
  },
  
  // 关闭地区选择器
  closeRegionPicker() {
    this.setData({
      showRegionPicker: false
    });
  },
  
  // 确认地区选择
  confirmRegion() {
    const { selectedRegion } = this.data;
    const { province, city, district } = selectedRegion;
    
    if (province && city && district) {
      const region = `${province} ${city} ${district}`;
      
      this.setData({
        'addressData.region': region,
        'addressData.province': province,
        'addressData.city': city,
        'addressData.district': district,
        showRegionPicker: false
      });
    } else {
      wx.showToast({
        title: '请选择完整的地区信息',
        icon: 'none'
      });
    }
  },

  // 姓名输入
  onNameInput(e) {
    this.setData({
      'addressData.name': e.detail.value
    });
  },
  
  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      'addressData.phone': e.detail.value
    });
  },
  
  // 详细地址输入
  onDetailInput(e) {
    this.setData({
      'addressData.detail': e.detail.value
    });
  },
  
  // 切换默认地址
  toggleDefaultAddress() {
    this.setData({
      'addressData.isDefault': !this.data.addressData.isDefault
    });
  },
  
  // 验证表单
  validateForm() {
    const { addressData } = this.data;
    
    if (!addressData.name) {
      wx.showToast({
        title: '请填写收货人姓名',
        icon: 'none'
      });
      return false;
    }
    
    if (!addressData.phone) {
      wx.showToast({
        title: '请填写手机号码',
        icon: 'none'
      });
      return false;
    }
    
    if (!/^1\d{10}$/.test(addressData.phone)) {
      wx.showToast({
        title: '请填写正确的手机号码',
        icon: 'none'
      });
      return false;
    }
    
    if (!addressData.region) {
      wx.showToast({
        title: '请选择地区',
        icon: 'none'
      });
      return false;
    }
    
    if (!addressData.detail) {
      wx.showToast({
        title: '请填写详细地址',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },
  
  // 保存地址
  saveAddress() {
    const { addressData, isEdit } = this.data;
    
    // 表单验证
    if (!this.validateForm()) {
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '保存中...'
    });
    
    // 构建API请求数据
    const apiData = {
      name: addressData.name,
      phone: addressData.phone,
      province: addressData.province,
      city: addressData.city,
      district: addressData.district,
      street: addressData.detail,
      is_default: addressData.isDefault ? 1 : 0
    };
    
    // 如果是编辑模式，添加ID字段
    if (isEdit) {
      apiData.id = parseInt(addressData.id);
    }
    
    // 确定API端点
    const app = getApp();
    const token = wx.getStorageSync('token') || '';
    const apiEndpoint = isEdit ? 
      `${app.globalData.domain}/api/v1/address/update` : 
      `${app.globalData.domain}/api/v1/address/add`;
    
    // 调用API
    wx.request({
      url: apiEndpoint,
      method: 'POST',
      data: apiData,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res: any) => {
        if (res.data && res.data.code === 0) {
          wx.hideLoading();
          wx.showToast({
            title: isEdit ? '修改成功' : '添加成功',
            icon: 'success',
            duration: 2000,
            success: () => {
              // 返回上一页
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            }
          });
        } else {
          wx.hideLoading();
          wx.showToast({
            title: res.data?.message || (isEdit ? '修改失败' : '添加失败'),
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('API request failed:', err);
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  }
}); 