const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
Page({
  data: {
    avatarUrl: undefined,
    avatarUrlTmpFile: undefined,
    gender: undefined,
    genderArray: [ '男性', '女性'],
    genderIndex: -1
  },
  onLoad: function (options) {
    this.getUserApiInfo()
  },
  onShow: function () {
  },
  bindMobile() {
    this.setData({
      bindMobileShow: true
    })
  },
  bindMobileOk(e) {
    console.log(e.detail); // 这里是组件里data的数据
    this.setData({
      bindMobileShow: false
    })
    this.getUserApiInfo()
  },
  bindMobileCancel() {
    this.setData({
      bindMobileShow: false
    })
  },
  async getUserApiInfo() {
    const res = await WXAPI.userDetail(wx.getStorageSync('token'))
    if (res.code == 0) {
      let _data = {}
      _data.apiUserInfoMap = res.data
      _data.nick = res.data.base.nick
      _data.avatarUrl = res.data.base.avatarUrl
      if (!res.data.base.gender) {
        _data.gender = '未知'
      }
      if (res.data.base.gender == 1) {
        _data.gender = '男性'
      }
      if (res.data.base.gender == 2) {
        _data.gender = '女性'
      }
      
      this.setData(_data)
    }
  },
  async formSubmit(e) {
    console.log(e);
    const postData = {
      token: wx.getStorageSync('token'),
      nick: this.data.nick
    }
    if (this.data.avatarUrlTmpFile) {
      const res = await WXAPI.uploadFileV2(wx.getStorageSync('token'), this.data.avatarUrlTmpFile)
      if (res.code == 0) {
        postData.avatarUrl = res.data.url
      }
    }
    if (this.data.genderIndex != -1) {
      postData.gender = this.data.genderIndex*1 + 1
    }
    postData.extJsonStr = JSON.stringify(e.detail.value)
    console.log(postData);
    // https://www.yuque.com/apifm/nu0f75/ykr2zr
    const res = await WXAPI.modifyUserInfoV2(postData)
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    }
    wx.showToast({
      title: '编辑成功',
    })
    setTimeout(() => {
      wx.navigateBack({
        delta: 0,
      })
    }, 1000);
  },
  async onChooseAvatar(e) {
    console.log(e);
    const avatarUrl = e.detail.avatarUrl
    this.setData({
      avatarUrl: avatarUrl,
      avatarUrlTmpFile: avatarUrl
    })
  },
  bindPickerChange: function(e) {
    this.setData({
      genderIndex: e.detail.value,
      gender: this.data.genderArray[e.detail.value]
    })
  },
})