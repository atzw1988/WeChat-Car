// pages/orderpay/orderpay.js
var app = getApp();
var http = require('../../utils/http.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show_detail:false,
        pay_checked:false,
        sel_order:{},
        mobile:'',
        paymentType: '1'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.get_order()
    },
    //获取跳转的订单详情
    get_order(){
        wx.getStorage({
            key: 'sel_order',
            success: (res) => {
                console.log(res)
                this.setData({
                    sel_order: res.data
                })
                wx.setStorage({
                    key: 'nopay_car',
                    data: res.data.car_no
                })        
            },
            fail: () => {},
            complete: () => {}
        })
        wx.getStorage({
            key: 'mobile',
            success: res => {
                this.setData({
                    mobile:res.data
                })
            }
        })
    },
    //详情显示或者隐藏
    detail_show() {
        this.setData({
            show_detail: !this.data.show_detail
        })
    },
    use_money(){
        this.setData({
            pay_checked: false
        })
    },
    use_wx(){
        this.setData({
            pay_checked: true
        })
    },
    gopay(){
        if (this.data.pay_checked){
            wx.getStorage({
                key: 'token',
                success: (res) => {
                    wx.request({
                        url: http.reqUrl + '/wx/paypay',
                        data: {
                            mobile: this.data.mobile,
                            order_no: this.data.sel_order.order_no,
                            amount: this.data.sel_order.charge_money,
                            paymentType: this.data.paymentType
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded', // 默认值
                            'token': res.data
                        },
                        method: 'POST',
                        success: function (res) {
                            wx.requestPayment({
                                timeStamp: res.data.data.timeStamp,
                                nonceStr: res.data.data.nonceStr,
                                package: res.data.data.package,
                                signType: res.data.data.signType,
                                paySign: res.data.data.paySign,
                                success: function (res) {
                                    wx.showToast({
                                        title: '支付成功',
                                        image: '../../img/chenggong.png'
                                    })
                                    wx.redirectTo({
                                        url: '../parking/parking',
                                        success: function (e) {
                                            var page = getCurrentPages().pop();
                                            if (page == undefined || page == null) return;
                                            page.onShow();
                                        }
                                    })
                                },
                                fail: function (res) {
                                    wx.showToast({
                                        title: '支付失败',
                                        image: '../../img/shibai.png'
                                    })
                                },
                                complete: function (res) {

                                }
                            })
                        }
                    })
                },
            })
        }else{
            console.log('余额支付')
            var that = this
            wx.getStorage({
                key: 'mobile',
                success: function (res) {
                    that.setData({
                        mobile: res.data
                    })
                    wx.request({
                        url: http.reqUrl + '/query/userMoney',
                        data: {
                            mobile: res.data
                        },
                        header: {
                            'content-type': 'application/json' // 默认值
                        },
                        method: 'GET',
                        success: function (res) {
                            let mymoney = res.data.data
                            if (mymoney >= that.data.sel_order.charge_money) {
                                wx.request({
                                    url: http.reqUrl + '/balance/pay',
                                    data: {
                                        mobile: that.data.mobile,
                                        userMoney: that.data.sel_order.charge_money,
                                        orderNo: that.data.sel_order.order_no
                                    },
                                    header: {
                                        'content-type': 'application/x-www-form-urlencoded', // 默认值
                                    },
                                    method: 'GET',
                                    success: function (res) {
                                        if (res.data.success) {
                                            wx.showToast({
                                                title: '余额支付成功',
                                                image: '../../img/chenggong.png',
                                                duration: 2000,
                                                success: function () {
                                                    wx.redirectTo({
                                                        url: '../parking/parking',
                                                        success: function (e) {
                                                            var page = getCurrentPages().pop();
                                                            if (page == undefined || page == null) return;
                                                            page.onShow();
                                                        }
                                                    })
                                                }
                                            })
                                        } else {
                                            wx.showToast({
                                                title: '支付失败',
                                                image: '../../img/shibai.png'
                                            })
                                        }
                                    }
                                })
                            }
                            if (mymoney < that.data.sel_order.charge_money) {
                                wx.showModal({
                                    title: '温馨提示',
                                    content: '您的余额不足，可以选择微信支付',
                                    success(res) {
                                        if (res.confirm) {
                                            wx.getStorage({
                                                key: 'token',
                                                success: function (res) {
                                                    wx.request({
                                                        url: http.reqUrl + '/wx/paypay',
                                                        data: {
                                                            mobile: that.data.mobile,
                                                            order_no: that.data.sel_order.order_no,
                                                            amount: that.data.sel_order.charge_money,
                                                            paymentType: that.data.paymentType
                                                        },
                                                        header: {
                                                            'content-type': 'application/x-www-form-urlencoded', // 默认值
                                                            'token': res.data
                                                        },
                                                        method: 'POST',
                                                        success: function (res) {
                                                            wx.requestPayment({
                                                                timeStamp: res.data.data.timeStamp,
                                                                nonceStr: res.data.data.nonceStr,
                                                                package: res.data.data.package,
                                                                signType: res.data.data.signType,
                                                                paySign: res.data.data.paySign,
                                                                success: function (res) {
                                                                    wx.showToast({
                                                                        title: '支付成功',
                                                                        image: '../../img/chenggong.png'
                                                                    })
                                                                    // that.onShow()
                                                                    wx.redirectTo({
                                                                        url: '../parking/parking',
                                                                        success: function (e) {
                                                                            var page = getCurrentPages().pop();
                                                                            if (page == undefined || page == null) return;
                                                                            page.onShow();
                                                                        }
                                                                    })
                                                                },
                                                                fail: function (res) {
                                                                    wx.showToast({
                                                                        title: '支付失败',
                                                                        image: '../../img/shibai.png'
                                                                    })
                                                                },
                                                                complete: function (res) {

                                                                }
                                                            })
                                                        }
                                                    })
                                                },
                                            })
                                        } else if (res.cancel) {
                                            wx.navigateTo({
                                                url: '../payfor/payfor',
                                                success: function (e) {
                                                    var page = getCurrentPages().pop();
                                                    if (page == undefined || page == null) return;
                                                    page.onShow();
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
    },
})