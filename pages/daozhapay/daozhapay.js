// pages/daozhapay/daozhapay.js
var app = getApp();
var http = require('../../utils/http.js');
Page({
    data: {
        parkTime1: '',
        parkNo: '',
        carnumber: '',
        consumedMoney1: '',
        moneyremain: 0,
        order_no: '',
        money: 0,
        mobile: '',
        paymentType: '3',
        showPayPwdInput: false,  //是否展示密码输入层
        pwdVal: '',  //输入的密码
        payFocus: true, //文本框焦点
    },
    onShareAppMessage: function () {
        return {
            title: '华腾智能停车',
            path: '/pages/index/index',
        }
    },
    onLoad: function () {
        // this.showInputLayer();
        wx.showShareMenu({
            withShareTicket: true
        });
        var that = this;
        wx.getStorage({
            key: 'order_no',
            success: function (res) {
                that.setData({
                    order_no: res.data
                })
            },
        })
        wx.getStorage({
            key: 'buy_time',
            success: function (res) {
                that.setData({
                    parkTime1: res.data
                });
            },
        });
        wx.getStorage({
            key: 'charge_money',
            success: function (res) {
                that.setData({
                    money: res.data
                });
            },
        });
        wx.getStorage({
            key: 'carNo',
            success: function (res) {
                that.setData({
                    carnumber: res.data
                });
            },
        });
        wx.getStorage({
            key: 'parkNo',
            success: function (res) {
                that.setData({
                    parkNo: res.data
                });
            },
        });
    },
    returnOut: function () {
        wx.reLaunch({
            url: '../daozhapark/daozhapark'
        })
    },
    payfor: function () {
        var that = this;
        wx.getStorage({
            key: 'mobile',
            success: function (res) {
                that.setData({
                    mobile: res.data
                })
                wx.request({
                    url: http.reqUrl + '/wx/paypay',
                    data: {
                        id: that.data.mobile,
                        amount: that.data.money,
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
                                wx.navigateTo({
                                    url: '../index/index',
                                    success: function (e) {
                                        var page = getCurrentPages().pop();
                                        if (page == undefined || page == null) return;
                                        page.onShow();
                                    }
                                })
                            },
                            fail: function (res) {
                                console.log('失败')
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
    },
    hidePayLayer: function () {
        var val = this.data.pwdVal;
        this.setData({
            showPayPwdInput: false,
            payFocus: false,
            pwdVal: ''
        },
            function () {
                wx.showToast({
                    title: val,
                })
            });
    },
    getFocus: function () {
        this.setData({
            payFocus: true
        });
    },
    inputPwd: function (e) {
        this.setData({
            pwdVal: e.detail.value
        });
        if (e.detail.value.length >= 6) {
            this.hidePayLayer();
        }
    }
})
