var app = getApp();
var http = require('../../utils/http.js');
Page({
  data:{
    userNo: '点击输入',//'点击输入'
    user_no: 1,
    coupons: '无',
    parkNum: 0, 
    payfor:0,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onShareAppMessage: function () {
    return {
      title: '华腾智能停车',
      path: '/pages/index/index',
    }
  },
    onLoad() {
        // 查看是否授权
        
    },
    bindGetUserInfo(e) {
        console.log(e.detail.userInfo)
    },
    onLoad:function(){
        // 查看是否授权
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.getUserInfo({
                        success(res) {
                            console.log(res.userInfo)
                        }
                    })
                }
            }
        })
    },
    onShow: function () {
        // wx.showLoading({
        //     title: '加载中',
        // })
        // this.get_order_num()
    },
    bindGetUserInfo(e) {
        console.log(e.detail.userInfo)
    },
    parkingList: function(){
        wx.navigateTo({
            url: '../parking/parking'
        });
    },

    refundList: function(){
        wx.navigateTo({
            url: '../refund/refund'
        });
    },
    payforList:function(){
        wx.navigateTo({
            url: '../payfor/payfor'
        });
    },
    mycardList:function(){
        wx.navigateTo({
            url: '../mycard/mycard',
        })
    },
    myWallet:function(){
        wx.navigateTo({
            url: '../mywallet/mywallet',
        })
    },
    mycarList:function(){
        wx.navigateTo({
            url: '../mycar/mycar',
        })
    },
    to_service(){
        wx.navigateTo({
            url: '../service/service',
        })
    }
});