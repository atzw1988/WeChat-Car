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
        wx.showLoading({
            title: '加载中',
        })
        var that = this;
        wx.getStorage({
            key: 'userID',
            success(res) {
                // console.log(res)
                that.setData({
                    userId: res.data + ""
                })
                wx.request({
                    url: http.reqUrl +'/query/parkOrde',
                    data: {
                        userId: that.data.userId
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'POST',
                    success: function (res) {
                        // console.log(res)
                        if(res.data.data!=null){
                            that.setData({
                                pakingList: res.data.data
                            })
                            if (that.data.pakingList) {
                                that.setData({
                                    parkNum: res.data.data.length
                                })
                            }
                            let length = res.data.data.length
                            let time = res.data.data
                            for (var i = 0; i < length; i++) {
                                if (time[i].pay_type == 0) {
                                    that.setData({
                                        payfor: time[i].charge_money
                                    })
                                }
                            }
                            wx.hideLoading();
                        }else{
                            that.setData({
                              parkNum: 0,
                              payfor:0
                            })
                            wx.hideLoading();
                        }
                    }
                })
            }
        })
    },
    bindGetUserInfo(e) {
        console.log(e.detail.userInfo)
    },
    // wx.showShareMenu({
    //   withShareTicket: true
    // });
    // var that = this;
    // wx.getStorage({
    //   key: 'userInfo',
    //   success: function (res) {

    //     that.setData({
    //       userInfo: res.data
    //     })
    //   }
    // });
    // wx.getStorage({
    //   key: 'plateNo',
    //   success: function (res) {

    //     that.setData({
    //       userNo: res.data
    //     })
    //   }
    // });
    // wx.getStorage({
    //   key: 'userID',
    //   success: function (res) {
    //     var oData = {
    //       id: res.data,
    //       sign: 2
    //     }
    //     app.func.req('/appuser/parkrecord', oData, function (res) {

    //       that.setData({
    //         parkNum: res.tr
    //       });
    //     });
    //   }
    // });
//   },

//   userNo: function(){
//     wx.navigateTo({
//       url: '../plate1/plate1'
//     });
//   },
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
    }
});