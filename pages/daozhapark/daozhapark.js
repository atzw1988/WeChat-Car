// pages/daozhapark/daozhapark.js
var app = getApp();
var http = require('../../utils/http.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        carNumber:'',
        sltcarNumber:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
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
                        if(res.data.data == null){
                            wx.showModal({
                                title: '温馨提示',
                                content: '暂时没有您的车辆信息，请您先添加我的车牌',
                                success(res){
                                    if(res.confirm){
                                        wx.navigateTo({
                                            url: '../plate1/plate1',
                                        })
                                    }else{
                                        wx.navigateTo({
                                            url: '../index/index',
                                        })
                                    }
                                }
                            })
                        }
                        that.setData({
                            carNumber: res.data.data
                        })
                    }
                })
            }
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    addmycar: function () {
        wx.navigateTo({
            url: '../plate1/plate1'
        });
    },
    delmycar: function (res) {
        var that = this
        let num = res.target.id
        wx.showModal({
            title: '温馨提示',
            content: '车辆信息删除后将不能找回，您是否确定要删除该车辆信息',
            success(res) {
                if (res.confirm) {
                    wx.request({
                        url: http.reqUrl + '/delete/carNo',
                        data: {
                            id: that.data.carNumber[num].id
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded' // 默认值
                        },
                        method: 'GET',
                        success: function (res) {
                            // console.log(res)
                            that.onShow()
                        }
                    })
                } else if (res.cancel) {
                    return;
                }
            }
        })

    },
    changecheck: function (res) {
        var that = this;
        let num = res.detail.value
        that.setData({
            sltcarNumber: that.data.carNumber[num].car_no
        })
    },
    settlement: function (){
        var that = this;
        if(that.data.sltcarNumber == ''){
            wx.showModal({
                title: '温馨提示',
                content: '请选择车牌或者添加新的车牌',
            })
        }else{
            wx.request({
                url: 'http://192.168.1.104:13259/its/the/parking/fee',
                data: {
                    carNo: that.data.sltcarNumber
                },
                header: {
                    'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                method: 'POST',
                success: function (res) {
                    console.log(res)
                    if (res.errMsg == 'request:ok') {
                        wx.setStorage({
                            key: 'charge_money',
                            data: res.data.data.data.payCharge,
                        });
                        wx.setStorage({
                            key: 'order_no',
                            data: res.data.data.data.tradeNo,
                        });
                        wx.setStorage({
                            key: 'buy_time',
                            data: res.data.data.data.parkTime,
                        });
                        wx.setStorage({
                            key: 'carNo',
                            data: that.data.sltcarNumber,
                        });
                        wx.setStorage({
                            key: 'parkNo',
                            data: '道闸停车',
                        });
                        wx.navigateTo({
                            url: '../daozhapay/daozhapay',
                        })
                    }
                    if (res.fail) {

                    }
                }
            })
        }
    }
})