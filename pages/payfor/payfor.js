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
        var that = this;
        wx.getStorage({
            key: 'mobile',
            success(res) {
                that.setData({
                    mobile: res.data
                })
                wx.request({
                    url: http.reqUrl +'/query/parkOrde',
                    data: {
                        mobile: that.data.mobile
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'POST',
                    success: function (res) {
                        if (res.data.data!=null){
                            let arr = res.data.data.filter(item => {
                                return item.pay_type == 0 && item.parkend_time != undefined && item.charge_money > 0
                            })
                            if(arr.length == 1){
                                arr.forEach(item => {
                                    item.parkstart_time = http.formatDatenew(item.parkstart_time)
                                    item.parkend_time = http.formatDatenew(item.parkend_time)
                                    if (item.buy_time < 60) {
                                        item.buy_time = item.buy_time + '分钟'
                                    } else if (item.buy_time == 60) {
                                        item.buy_time = '1小时'
                                    } else {
                                        item.buy_time = Math.floor(item.buy_time / 60) + '小时' + item.buy_time % 60 + '分钟'
                                    }
                                })
                                that.setData({
                                    imgParking: false,
                                    parkingList: arr[0]
                                })
                            }else{
                                that.setData({
                                    imgParking: true
                                })
                            }
                        }else{
                            that.setData({
                                imgParking: true
                            })
                        }                    
                    }
                })
            }
        })
    },
    //待缴车费页面支付车费
    gopay: function () {
        var that = this
        wx.getStorage({
            key: 'mobile',
            success: function (res) {
                that.setData({
                    mobile: res.data
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
                    success: function (res) {
                        let mymoney = res.data.data
                        if (mymoney >= that.data.parkingList.charge_money) {
                            console.log(that.data.parkingList.order_no)
                            wx.request({
                                url: http.reqUrl + '/balance/pay',
                                data: {
                                    mobile: that.data.mobile,
                                    userMoney: that.data.parkingList.charge_money,
                                    orderNo: that.data.parkingList.order_no
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
                                                that.onShow();
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
                            // that.setData({ 
                            //     showPayPwdInput: true, 
                            //     payFocus: true 
                            // });
                        }
                        if (mymoney < that.data.parkingList.charge_money) {
                            wx.showModal({
                                title: '温馨提示',
                                content: '您的余额不足，可以选择微信支付',
                                success(res) {
                                    if (res.confirm) {
                                        console.log(that.data.parkingList)
                                        wx.getStorage({
                                            key: 'token',
                                            success: function (res) {
                                                wx.request({
                                                    url: http.reqUrl + '/wx/paypay',
                                                    data: {
                                                        mobile: that.data.mobile,
                                                        order_no: that.data.parkingList.order_no,
                                                        amount: that.data.parkingList.charge_money,
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
        // wx.getStorage({
        //     key: 'token',
        //     success: function (res) {
        //         console.log(that.data.paymentType)
        //         wx.request({
        //             url: http.reqUrl +'/wechat/wx/paypay',
        //             data: {
        //                 mobile: that.data.mobile,
        //                 amount: that.data.parkingList.charge_money,
        //                 paymentType: that.data.paymentType
        //             },
        //             header: {
        //                 'content-type': 'application/x-www-form-urlencoded', // 默认值
        //                 'token': res.data
        //             },
        //             method: 'POST',
        //             success: function (res) {
        //                 wx.requestPayment({
        //                     timeStamp: res.data.data.timeStamp,
        //                     nonceStr: res.data.data.nonceStr,
        //                     package: res.data.data.package,
        //                     signType: res.data.data.signType,
        //                     paySign: res.data.data.paySign,
        //                     success: function (res) {
        //                         that.onShow()
        //                         wx.navigateTo({
        //                             url: '../person/person',
        //                             success: function (e) {
        //                                 var page = getCurrentPages().pop();
        //                                 if (page == undefined || page == null) return;
        //                                 page.onShow();
        //                             }
        //                         })
        //                     },
        //                     fail: function (res) {

        //                     },
        //                     complete: function (res) {

        //                     }
        //                 })
        //             }
        //         })
        //     },
        // })
    },
    // timeConversion: function (time) {
    //     var today = new Date(parseInt(time));
    //     var year = today.getFullYear();
    //     var month = today.getMonth() + 1;
    //     var day = today.getDate();
    //     var hours = today.getHours();
    //     var minutes = today.getMinutes();
    //     if (month < 10) {
    //         month = "0" + month;
    //     }
    //     if (day < 10) {
    //         day = "0" + day;
    //     }
    //     if (hours < 10) {
    //         hours = "0" + hours;
    //     }
    //     if (minutes < 10) {
    //         minutes = "0" + minutes;
    //     }
    //     return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
    //     // return new Date(parseInt(time)).toLocaleString().replace(/:\d{1,2}$/, ' ');
    // },
    // timeLong: function (resultTime) {
    //     var m = parseInt(resultTime / 60000);
    //     if (m <= 60) {
    //         return m
    //     }
    //     if (m > 60) {
    //         var h = parseInt(m / 60);
    //         var m1 = m - (h * 60);
    //         if (m1 == 0) {
    //             var result = h + '小时';
    //         } else {
    //             var result = h + '小时' + m1 + '分';
    //         }
    //         return result;
    //     }
    // },
    // //访问网络  
    // fetchSearchList: function () {
    //     let that = this;
    //     let searchPageNum = that.data.searchPageNum;//把第几次加载次数作为参数  
    //     //访问网络  

    //     var oData = {
    //         pageIndex: searchPageNum,
    //         mobile: that.data.mobile,
    //         sign: 1
    //     }
    //     app.func.req('/appuser/parkrecord', oData, function (res) {

    //         let searchList = [];
    //         if (res.map.length > 0) {
    //             res.map.map(function (item) {
    //                 var parkTime = item.park_time;
    //                 var oLong = parseInt(item.park_end_time) - parseInt(parkTime)
    //                 item.park_end_time = that.timeLong(oLong);
    //                 item.park_time = that.timeConversion(item.park_time);
    //                 item.orderMoney = parseInt(item.orderMoney) / 100
    //                 return item;
    //             });

    //             searchList = res.map
    //             that.data.searchSongList.concat(searchList);
    //             that.setData({
    //                 itemPage: res.tp,
    //                 searchSongList: that.data.searchSongList.concat(searchList) //获取数据数组  
    //             });
    //             if (res.tp == 1) {
    //                 that.setData({
    //                     searchLoadingComplete: true, //把“没有数据”设为true，显示  
    //                     searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
    //                 });
    //             } else {
    //                 that.setData({
    //                     searchLoading: true  //把"上拉加载"的变量设为false，隐藏  
    //                 });
    //             }
    //         } else {
    //             that.setData({
    //                 imgParking: true,
    //                 searchLoadingComplete: false, //把“没有数据”设为true，显示  
    //                 searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
    //             });
    //         }
    //     })
    // },
    //滚动到底部触发事件  
    searchScrollLower: function () {
        let that = this;
        if (that.data.searchPageNum < parseInt(that.data.itemPage)) {
            if (that.data.searchLoading && !that.data.searchLoadingComplete) {
                that.setData({
                    searchPageNum: that.data.searchPageNum + 1,  //每次触发上拉事件，把searchPageNum+1  
                    isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
                });
                // that.fetchSearchList();
            }
        } else {
            that.setData({
                searchLoadingComplete: true, //把“没有数据”设为true，显示  
                searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
            });
        }
    }
})
