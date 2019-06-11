// pages/pdaorder/pdaorder.js
var app = getApp();
var http = require('../../utils/http.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order_list:[],
        total_money: 0,
        paymentType: '1',
        mobile:''
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
        this.get_carno()
    },
    //获取要查询的车牌
    get_carno(){
        wx.getStorage({
            key: 'car_no',
            success: (res) => {
                this.get_pda_order(res.data)
            },
        })
    },
    //根据车牌查询pda订单详情
    get_pda_order(res){
        console.log(res)
        this.data.total_money = 0
        let all_money = 0
        wx.request({
            url: http.reqUrl + '/query/carDetails',
            data: {
                carNo: res
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: (res) => {
                console.log(res)
                if(res.data.code == 0){
                    let data = res.data.data
                    data.forEach(item => {
                        if (item.sumMins < 60){
                            item.sumMins = item.sumMins + '分钟'
                        } else if (item.sumMins == 60){
                            item.sumMins = '1小时'
                        }else {
                            item.sumMins = Math.floor(item.sumMins / 60) + '小时' + item.sumMins % 60 + '分钟'
                        }
                        all_money += item.shouldmoney
                    })
                    this.setData({
                        order_list: data,
                        total_money: all_money
                    })
                }
            },
            fail: () => {},
            complete: () => {}
        });
          
    },
    //支付
    to_pay(){
        let that = this
        wx.getStorage({
            key: 'order_no',
            success: (res) => {
                let order_no = res.data
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
                                if (mymoney >= this.total_money) {
                                    wx.request({
                                        url: http.reqUrl + '/balance/pay',
                                        data: {
                                            mobile: that.data.mobile,
                                            userMoney: this.total_money,
                                            orderNo: order_no
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
                                                        wx.navigateTo({
                                                            url: '../payfor/payfor',
                                                            success: (result) => {

                                                            },
                                                            fail: () => {},
                                                            complete: () => {}
                                                        });

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
                                if (mymoney < this.total_money) {
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
                                                                order_no: order_no,
                                                                amount: this.total_money,
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
                    }
                })
            },
            fail: () => {},
            complete: () => {}
        })    
    }
})