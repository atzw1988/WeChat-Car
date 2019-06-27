var http = require('utils/http.js');
var QQMapWX = require('libs/qqmap-wx-jssdk.js');
App({
    data:{
        userInfo:'',
        token:'',
        oAddress :'',
    },
    globalData:{
        mobile:''
    },
    onShareAppMessage: function () {
        return {
            title: '华腾智能停车',
            path: '/pages/index/index',
        }
    },
    onLaunch: function (){
        const updateManager = wx.getUpdateManager()
        console.log(updateManager)
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            console.log(res.hasUpdate)
        })

        updateManager.onUpdateReady(function () {
            // wx.showModal({
            //     title: '更新提示',
            //     content: '新版本已经准备好，请下载并重启应用？',
            //     showCancel: false,
            //     success: function (res) {
            //         if (res.confirm) {
            //             // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            //             updateManager.applyUpdate()
            //         }
            //     }
            // })
            updateManager.applyUpdate()
        })

        updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
                title: '更新提示',
                content: '新版本下载失败',
                showCancel: false
            })
        })
        var that = this;
        wx.showLoading({
            title: '登录中...'
        });
        wx.getLocation({
            type: 'wgs84', //返回可以用于wx.openLocation的经纬度
            success: function (res) {
                var latitude = res.latitude;
                var longitude = res.longitude;
                // 实例化API核心类
                var demo = new QQMapWX({
                    key: 'XKBBZ-5RKWS-4TQOB-6CMPO-U2ORF-V5BKW' // 必填
                });
                demo.reverseGeocoder({
                    location: {
                        latitude: latitude,
                        longitude: longitude
                    },
                    success: function (res) {
                        // 获取用户当前所在区域
                        var oAddress = res.result.address_component.district;
                        wx.setStorage({
                            key: 'oAddress',
                            data: oAddress
                        });
                        wx.login({
                            success: function (res) {
                                wx.request({
                                    url: http.reqUrl + '/xiaoLogin',
                                    data: {
                                        code: res.code,
                                        areaName: oAddress
                                    },
                                    method: 'POST',
                                    header: {
                                        'content-type': 'application/x-www-form-urlencoded'
                                    },
                                    success: function (res) {
                                        console.log(res)
                                        if(res.data.success){
                                            wx.hideLoading();
                                            wx.setStorage({
                                                key: 'token',
                                                data: res.data.data.token,
                                                complete: function () {
                                                }
                                            })
                                            wx.setStorage({
                                                key: 'session_key',
                                                data: res.data.data.session_key,
                                                complete: function () {
                                                }
                                            })
                                            wx.setStorage({
                                                key: 'mobile',
                                                data: res.data.data.mobile,
                                                complete: function () {}
                                            })
                                            that.globalData.mobile = res.data.data.mobile
                                            let num = res.data.data.mobile
                                            if (that.employIdCallback) {
                                                that.employIdCallback(num);
                                            }
                                        }
                                        if(res.data.fail){
                                            wx.hideLoading();
                                            wx.showModal({
                                                title: '提示',
                                                content: '登录异常，请稍后重试',
                                                showCancel: false,
                                                success: function (res) {
                                                    if (res.confirm) {
                                                    }
                                                }
                                            });
                                        }
                                    },
                                    fail: function (res) {
                                        wx.hideLoading();
                                        wx.showModal({
                                            title: '提示',
                                            content: '微信登录出错，请重新进入小程序或清除下缓存！',
                                            showCancel: false,
                                            success: function (res) {
                                                if (res.confirm) {
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        wx.checkSession({
            success: function () {
                //session 未过期，并且在本生命周期一直有效
            },
            fail: function () {
                //登录态过期
                wx.login() //重新登录
            }
        })
    },
    onLoad:function(){
    },
    getUserInfo: function (cb) {
        var that = this;

        if (this.globalData.userInfo) {
        // 用户信息
            if (!this.globalData.userInfo.ofoInfo) {
                var userInfo2 = wx.getStorageSync("userInfo");
                if (userInfo2 && userInfo2 == 'object')
                    this.globalData.userInfo = userInfo2;
            }
            typeof cb == "function" && cb(this.globalData.userInfo)
            return;
        }
        var userInfo2 = wx.getStorageSync("userInfo");
        if (userInfo2 && typeof userInfo2 == 'object') {
            this.globalData.userInfo = userInfo2
            typeof cb == "function" && cb(this.globalData.userInfo)
            return
        }
        //调用登录接口
        wx.login({
            success: function () {
                wx.getUserInfo({
                    success: function (res) {
                        that.globalData.userInfo = res.userInfo
                        typeof cb == "function" && cb(that.globalData.userInfo)
                        wx.setStorage({
                            key: 'userInfo',
                            data: res.userInfo
                        });
                    }
                })
            }
        })
    },
    getUserInfoSync() {
        return this.globalData.userInfo;
    },
    globalData: {
        userInfo: null
    },
    func: {
        req: http.req
    }
})