var app = getApp();
var http = require('../../utils/http.js');
Page({
    data: {
        cards_list: [],     //月卡列表
        carkind: '普通汽车',
        user_no: 1,
        coupons: '无',
        parkNum: 0,
        pageIndex:1,
        ps:5,
        all_ps:1,
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
    onShow: function () {
        this.get_user_list()
    },
    //获取月卡列表
    get_user_list(){
        wx.request({
            url: 'http://192.168.0.121:13259/its/user-card/records',
            data: {
                pageNum: this.data.pageIndex,
                pageSize: this.data.ps
            },
            method: 'GET',
            success: res => {
                console.log(res)
                if (res.data.mesg == 'OK'){
                    this.setData({
                        cards_list:res.data.data.list,
                        all_ps: res.data.data.pages
                    })
                }
            }
        })
    },
    //下拉刷新
    get_more(){
        console.log('上拉')
    },
    //办理月卡
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