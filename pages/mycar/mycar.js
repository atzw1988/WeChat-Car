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
        console.log(1)
        var that = this;
        wx.getStorage({
            key: 'userID',
            success: function (res) {
                wx.request({
                    url: http.reqUrl+'/query/carNo',
                    data: {
                        userId: res.data
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'GET',
                    success: function (res) {
                        console.log(res.data.data)
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
        console.log(res.target.id)
        let carno = that.data.carNumber
        wx.showModal({
            title: '温馨提示',
            content: '车辆信息删除后将不能找回，您是否确定要删除该车辆信息',
            success(res) {
                if (res.confirm) {
                    wx.request({
                        url: http.reqUrl+'/delete/carNo',
                        data: {
                            id: that.data.carNumber[num].id
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded' // 默认值
                        },
                        method: 'GET',
                        success: function (res) {
                            that.onShow()     
                        }
                    })
                } else if (res.cancel) {
                    return;
                }
            }
        })    
        
    }
});