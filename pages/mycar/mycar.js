var app = getApp();
var http = require('../../utils/http.js');
Page({
    data: {
        carNumber: [], //汽车牌照
        carkind:'普通汽车',
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
    onShow: function(){
        var that = this;
        wx.getStorage({
            key: 'mobile',
            success: function (res) {
                wx.request({
                    url: http.reqUrl+'/query/carNo',
                    data: {
                        mobile: res.data
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'GET',
                    success: function (res) {
                        if (res.data.success){
                            that.setData({
                                carNumber: res.data.data
                            })
                        }else{
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
    //删除车牌
    delmycar: function(res){
        var that = this
        let num = res.target.id
        let carno = that.data.carNumber
        let id = that.data
        wx.getStorage({
            key: 'mobile',
            success: (res) => {
                let mobile = res.data
                wx.showModal({
                    title: '温馨提示',
                    content: '车辆信息删除后将不能找回，您是否确定要删除该车辆信息',
                    success(res) {
                        if (res.confirm) {
                            wx.request({
                                url: http.reqUrl + '/delete/carNo',
                                data: {
                                    mobile: mobile,
                                    id: carno[num].id,
                                    carNo: carno[num].car_no
                                },
                                header: {
                                    'content-type': 'application/x-www-form-urlencoded' // 默认值
                                },
                                method: 'GET',
                                success: function (res) {
                                    console.log(res)
                                    if(res.data.code == 813){
                                        wx.showModal({
                                            title: '删除失败',
                                            content: '该车牌还有未缴车费，是否前去付款',
                                            success(res) {
                                                if (res.confirm) {
                                                    wx.redirectTo({
                                                        url:'../payfor/payfor'
                                                    })
                                                } else if (res.cancel) {
                                                }
                                            }
                                        })
                                    }else if(res.data.code == 0){
                                        wx.showToast({
                                            title: '删除成功',
                                        })
                                        that.onShow()
                                    }  
                                }
                            })
                        } else if (res.cancel) {
                            return;
                        }
                    }
                }) 
            }
        })       
    }
});