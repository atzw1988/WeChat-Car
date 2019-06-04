var app = getApp();
var http = require('../../utils/http.js');
Page({
    data: {
        carNumber: [], //汽车牌照
        carkind: '普通汽车',
        user_no: 1,
        coupons: '无',
        parkNum: 0
    },
    onShareAppMessage: function () {
        return {
            title: '华腾智能停车',
            path: '/pages/index/index',
        }
    },
    onLoad: function () {
        //右上角分享
        wx.showShareMenu({
            withShareTicket: true
        });
    },
    //获取用户的车牌列表
    onShow: function () {
        var that = this;
        wx.getStorage({
            key: 'mobile',
            success: function (res) {
                wx.request({
                    url: http.reqUrl + '/query/carNo',
                    data: {
                        mobile: res.data
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'GET',
                    success: function (res) {
                        if (res.data.success) {
                            that.setData({
                                carNumber: res.data.data
                            })
                        } else {
                            that.setData({
                                carNumber: '',
                            })
                        }
                    }
                })
            }
        });
    },
    //添加车牌
    addmycar: function () {
        wx.navigateTo({
            url: '../plate1/plate1'
        });
    },
    sel_car: function(e){
        console.log(e)
        var that = this
        let num = e.currentTarget.id
        let car = that.data.carNumber[num]
        console.log(car)
        wx.getStorage({
            key: 'to_sel_car',
            success: (res) => {
                wx.setStorage({
                    key: 'sel_car',
                    data: car,
                    success: () => {
                        wx.removeStorage({
                            key: 'to_sel_car',
                            success: () => {
                                wx.redirectTo({
                                    url: '../carNumber/carNumber',
                                })
                            },
                        })
                    }
                })
            },
            fail: (res) => {
                wx.setStorage({
                    key: 'card_car_no',
                    data: car.car_no,
                    complete: function () {
                        wx.getStorage({
                            key: 'card_park_name',
                            success: () => {
                                wx.redirectTo({
                                    url: '../cardpay/cardpay'
                                })
                            },
                            fail: () => {
                                wx.navigateTo({
                                    url: '../selpark/selpark'
                                })
                            }
                        })

                    }
                })
            }
        })   
    }
});