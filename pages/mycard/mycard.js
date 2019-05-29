var app = getApp();
var http = require('../../utils/http.js');
Page({
    data: {
        cards_list: [
            { id: 1, name: '月卡', car_no: '粤B88888', park_no:'JOZ9Q93R', park_name: '无名路(龙盛路-双塔大桥)', time: '2019-08-08 12:00:00', overdue:true},
            { id: 2, name: '季卡', car_no: '粤B66666', park_no: 'JOZ9Q93R', park_name: '龙盛路（嵊州大道-无名路）', time: '2019-08-08 12:00:00', overdue: false },
            { id: 3, name: '半年卡', car_no: '粤B99999', park_no: 'JOZ9Q93R', park_name: '长宁路（长广路-长泰中路）', time: '2019-08-08 12:00:00', overdue: true },
            { id: 4, name: '年卡', car_no: '粤B11111', park_no: 'JOZ9Q93R', park_name: '鹿山路口（鹿山广场西侧）', time: '2019-08-08 12:00:00', overdue: false },
        ],     //月卡列表
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
        console.log(1)
        var that = this;
        wx.getStorage({
            key: 'userID',
            success: function (res) {
                wx.request({
                    url: http.reqUrl + '/query/carNo',
                    data: {
                        userId: res.data
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'GET',
                    success: function (res) {
                        console.log(res.data.data)
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
        wx.removeStorage({
            key: 'card_park_name',
            success: function(res) {},
        })
        wx.navigateTo({
            url: '../selcar/selcar'
        });
    },
    //续费
    to_renewal(e){
        let num = e.currentTarget.id
        let data = this.data.cards_list
        console.log(data[num].car_no)
        console.log(data[num].park_name)
        console.log(data[num].park_no)
        wx.setStorage({
            key: 'card_car_no',
            data: data[num].car_no
        })
        wx.setStorage({
            key: 'card_park_name',
            data: data[num].park_name,
        })
        wx.setStorage({
            key: 'card_park_no',
            data: data[num].park_no,
        })
    }
});