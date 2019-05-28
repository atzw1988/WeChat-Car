// pages/selpark/selpark.js
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var http = require('../../utils/http.js');
var app = getApp();
Page({
    data: {
        oLat: '',
        oLng: '',
        searchSongList: [], //放置返回数据的数组  
        isFromSearch: true, // 用于判断searchSongList数组是不是空数组，默认true，空的数组  
        searchPageNum: 1, // 设置加载的第几次，默认是第一次
        pagesSize: 10,
        itemPage: 0, //返回数据的页面数  
        imgParking: false, //无数据图片，默认false，隐藏  
        searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
        searchLoadingComplete: true, //“没有数据”的变量，默认false，隐藏
        parking_name:''  //搜索框输入的值
    },
    onShareAppMessage: function () {
        return {
            title: '华腾智能车位锁',
            path: '/pages/lockMap/lockMap',
        }
    },
    onLoad: function () {
        wx.showShareMenu({
            withShareTicket: true
        });
        let that = this;
    },
    onShow: function () {
        this.get_park_list()
    },
    get_park_list(){
        let that = this
        wx.request({
            url: 'http://192.168.0.121:13259/its/app/cards/parks',
            data: {
                pageNum: that.data.searchPageNum,
                pageSize: that.data.pagesSize,
            },
            method: 'GET',
            success:function(res){
                console.log(res)
                if (res.data.data.list.length > 0){
                    that.setData({
                        searchSongList:res.data.data.list
                    })
                }
            }
        })
    },
    search_park:function(e){
        console.log(e)
    },
    to_pay_card: function (e) {
        console.log(e)
        var that = this;
        let num = e.currentTarget.id;
        let park = this.data.searchSongList[num];
        console.log(park)
        wx.setStorage({
            key: 'card_park_name',
            data: park.parkName,
            complete: function () {
                wx.navigateTo({
                    url: '../cardpay/cardpay'
                })
            }
        })
        wx.setStorage({
            key: 'card_park_no',
            data: park.parkingWeiyiNo,
        })
    }
})