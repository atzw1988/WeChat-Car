var app = getApp();
var http = require('../../utils/http.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        searchSongList: [], //放置返回数据的数组  
        isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组  
        searchPageNum: 1,   // 设置加载的第几次，默认是第一次  
        itemPage: 0,      //返回数据的页面数  
        imgParking: true, //无数据图片，默认false，隐藏  
        searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
        searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏 
        parkingList:{},
        paymentType:'1', 
        online_order: {},
        pda_order_list:[],
        online: false,
        offline: false,
        mobile:''
    },
    onShareAppMessage: function () {
        return {
            title: '华腾智能停车',
            path: '/pages/index/index',
        }
    },
    onLoad: function () {
        wx.showShareMenu({
            withShareTicket: true
        });
        let that = this;
        wx.getStorage({
            key: 'mobile',
            success: function (res) {
                that.setData({
                    mobile: res.data,
                    searchPageNum: 1,   //第一次加载，设置1  
                    searchSongList: [],  //放置返回数据的数组,设为空  
                    isFromSearch: true,  //第一次加载，设置true  
                    searchLoading: true,  //把"上拉加载"的变量设为true，显示  
                    searchLoadingComplete: false //把“没有数据”设为false，隐藏  
                })
                // that.fetchSearchList();
            }
        })

    },
    onShow: function () {
        this.get_no_pay()
        this.get_pda_no_pay()
        
    },
    //判断是否显示无订单图片
    show_imgParking(){
        if (!this.data.online && !this.data.offline) {
            this.setData({
                imgParking: false
            })
        }
    },
    //查询是否有待缴车费
    get_no_pay(){
        wx.getStorage({
            key: 'mobile',
            success:(res) => {
                this.setData({
                    mobile: res.data
                })
                wx.request({
                    url: http.reqUrl + '/query/notUnpaid',
                    data: {
                        mobile: res.data
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'POST',
                    success: (res) => {
                        console.log(res)
                        if(res.data.code == 0){
                            let data = res.data.data
                            data.parkstart_time = http.formatDatenew(data.parkstart_time)
                            data.parkend_time = http.formatDatenew(data.parkend_time)
                            if (data.buy_time < 60){
                                data.buy_time = data.buy_time + '分钟'
                            }else if(data.buy_time == 60){
                                data.buy_time = '1小时'
                            }else{
                                data.buy_time = Math.floor(data.buy_time / 60) + '小时' + data.buy_time % 60 + '分钟'
                            }
                            this.setData({
                                imgParking:true,
                                online:true,
                                online_order: data
                            })
                        }else{
                            this.setData({
                                online:false
                            })
                        }
                    }
                })
            }
        })
    },
    //查询PDA是否有欠费
    get_pda_no_pay(){
        wx.getStorage({
            key: 'mobile',
            success: (res) => {
                this.setData({
                    mobile: res.data
                })
                wx.request({
                    url: http.reqUrl + '/lack/statistical',
                    data: {
                        mobile: res.data
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'POST',
                    success: (res) => {
                        console.log(res)
                        if(res.data.code == 0){
                            this.setData({
                                pda_order_list:res.data.data,
                                offline: true
                            })
                        }else{
                            this.setData({
                                offline: false
                            })
                        }
                        this.show_imgParking()
                    }
                })
            },
            fail: () => {},
            complete: () => {}
        })     
    },
    //待缴车费页面支付线上车费
    to_pay_online() {
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
                        if (mymoney >= that.data.online_order.charge_money) {
                            wx.request({
                                url: http.reqUrl + '/balance/pay',
                                data: {
                                    mobile: that.data.mobile,
                                    userMoney: that.data.online_order.charge_money,
                                    orderNo: that.data.online_order.order_no
                                },
                                header: {
                                    'content-type': 'application/x-www-form-urlencoded', // 默认值
                                },
                                method: 'GET',
                                success: function (res) {
                                    if (res.data.success){
                                        wx.showToast({
                                            title: '余额支付成功',
                                            image: '../../img/chenggong.png',
                                            duration: 2000,
                                            success	: function(){
                                                that.setData({
                                                    online: false
                                                })
                                                that.onShow()
                                            }
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
                        if (mymoney < that.data.online_order.charge_money) {
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
                                                        order_no: that.data.online_order.order_no,
                                                        amount: that.data.online_order.charge_money,
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
    //待缴车费页面支付线下车费
    to_pay_offline(e){
        let order = this.data.pda_order_list[e.currentTarget.id]
        let that = this
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
                        if (mymoney >= order.oweAmount * -1) {
                            wx.request({
                                url: http.reqUrl + '/balance/pay',
                                data: {
                                    mobile: that.data.mobile,
                                    userMoney: order.oweAmount * -1,
                                    orderNo: order.id
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
                                                // that.setData({
                                                //     offline: false
                                                // })
                                                that.onShow()
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
                        if (mymoney < order.oweAmount * -1) {
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
                                                        order_no: order.id,
                                                        amount: order.oweAmount * -1,
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
    to_pdaorder(e){
        let car_no = this.data.pda_order_list[e.currentTarget.id].carnumber
        let order_no = this.data.pda_order_list[e.currentTarget.id].id
        wx.setStorage({
            key: 'order_no',
            data: order_no,
            success: (result) => {
                wx.setStorage({
                    key: 'car_no',
                    data: car_no,
                    success: () => {
                        wx.navigateTo({
                            url: '../pdaorder/pdaorder'
                        })
                    }
                })
            },
            fail: () => {},
            complete: () => {}
        })
    }
})
