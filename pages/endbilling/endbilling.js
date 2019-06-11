var app = getApp();
var http = require('../../utils/http.js');
Page({
    data:{
        parkTime1:'',
        parkNo: '',
        carnumber:'',
        consumedMoney1: '',
        moneyremain: 0,
        order_no:'',
        money: 0,
        mobile:'',
        paymentType: '1',
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
    onLoad: function(){
        // this.showInputLayer();
        wx.showShareMenu({
        withShareTicket: true
        });
        var that = this;
        wx.getStorage({
            key: 'order_no',
            success: function(res) {
                that.setData({
                    order_no:res.data
                })
            },
        })
        wx.getStorage({
            key: 'buy_time',
            success: function(res) {
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
    returnOut: function(){
        wx.reLaunch({
            url: '../index/index',
            success: function (e) {
                var page = getCurrentPages().pop();
                if (page == undefined || page == null) return;
                page.onShow();
            }
        })
    },
    payfor: function(){
        var that = this;
        wx.getStorage({
            key: 'mobile',
            success: function(res) {
                that.setData({
                    mobile:res.data
                })
                console.log(res)
                wx.request({
                    url: http.reqUrl + '/query/userMoney',
                    data: {
                        mobile: res.data
                    },
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    method: 'GET',
                    success: function(res){
                        console.log(res)
                        let mymoney = res.data.data
                        let num = res.data.data - mymoney
                        if (mymoney >= that.data.money){
                            wx.request({
                                url: http.reqUrl + '/balance/pay',
                                data: {
                                    mobile: that.data.mobile,
                                    userMoney: that.data.money,
                                    orderNo: that.data.order_no
                                },
                                header: {
                                    'content-type': 'application/x-www-form-urlencoded', // 默认值
                                },
                                method: 'GET',
                                success: function(res){
                                    console.log(res)
                                    if (res.data.success){
                                        wx.showToast({
                                            title: '支付成功',
                                            image: '../../img/chenggong.png'
                                        })
                                        wx.navigateTo({
                                            url: '../index/index',
                                        })
                                    }else{
                                        wx.showToast({
                                            title: '支付失败',
                                            image: '../../img/shibai.png'
                                        })
                                    }
                                }
                            })
                        }
                        if(mymoney < that.data.money){
                            wx.showModal({
                                title: '温馨提示',
                                content: '您的余额不足，可以选择微信支付',
                                success(res){
                                    if (res.confirm){
                                        wx.getStorage({
                                            key: 'token',
                                            success: function(res) {
                                                wx.request({
                                                    url: http.reqUrl + '/wx/paypay',
                                                    data: {
                                                        mobile: that.data.mobile,
                                                        amount: that.data.money,
                                                        order_no: that.data.order_no,
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
                                                                    url: '../person/person',
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
