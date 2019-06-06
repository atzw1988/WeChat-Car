// pages/pdaorder/pdaorder.js
var app = getApp();
var http = require('../../utils/http.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order_list:[
            {site:'龙盛路',start_time:'2019-06-04 15:22:48',end_time:'2019-06-05 10:54:13',pay_time:'19小时31分钟',money:22.00},
            {
                site: '龙盛路',
                start_time: '2019-06-04 15:22:48',
                end_time: '2019-06-05 10:54:13',
                pay_time: '19小时31分钟',
                money: 22.00
            },
            {
                site: '龙盛路',
                start_time: '2019-06-04 15:22:48',
                end_time: '2019-06-05 10:54:13',
                pay_time: '19小时31分钟',
                money: 22.00
            },
            {
                site: '龙盛路',
                start_time: '2019-06-04 15:22:48',
                end_time: '2019-06-05 10:54:13',
                pay_time: '19小时31分钟',
                money: 22.00
            },
            {
                site: '龙盛路',
                start_time: '2019-06-04 15:22:48',
                end_time: '2019-06-05 10:54:13',
                pay_time: '19小时31分钟',
                money: 22.00
            },
            {
                site: '龙盛路',
                start_time: '2019-06-04 15:22:48',
                end_time: '2019-06-05 10:54:13',
                pay_time: '19小时31分钟',
                money: 22.00
            },
            {
                site: '龙盛路',
                start_time: '2019-06-04 15:22:48',
                end_time: '2019-06-05 10:54:13',
                pay_time: '19小时31分钟',
                money: 22.00
            },
        ],
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
    get_pda_order(res){
        wx.request({
            url: http.reqUrl + '',
            data: {
                car_no:res
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'GET',
            success: (res) => {
                console.log(res)
            },
            fail: () => {},
            complete: () => {}
        });
          
    }
})