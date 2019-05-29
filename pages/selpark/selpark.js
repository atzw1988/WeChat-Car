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
    //获取停车场列表
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
                if(res.data.success){
                    if (res.data.data.list.length > 0) {
                        that.setData({
                            searchSongList: res.data.data.list,
                            itemPage: res.data.data.pages
                        })
                    }
                    if (res.data.data.pages > that.data.searchPageNum) {
                        that.setData({
                            searchLoadingComplete: false,
                            searchLoading: true
                        })
                    } else {
                        that.setData({
                            searchLoadingComplete: true,
                            searchLoading: false
                        })
                    }
                    wx.hideNavigationBarLoading() //完成停止加载
                    wx.stopPullDownRefresh() //停止下拉刷新
                }else{
                    wx.showToast({
                        title: res.data.mesg,
                        duration: 2000
                    })
                }    
            }
        })
    },
    //上拉加载
    searchScrollLower() {
        let that = this;
        if (that.data.searchPageNum < that.data.itemPage) {
            if (that.data.searchLoading && !that.data.searchLoadingComplete) {
                that.setData({
                    // searchPageNum: that.data.searchPageNum + 1,  //每次触发上拉事件，把searchPageNum+1  
                    pagesSize: that.data.pagesSize*2,
                    isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
                });
                that.get_park_list();
            }
        } else {
            that.setData({
                searchLoadingComplete: true, //把“没有数据”设为true，显示  
                searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
            });
        }
    },
    //下拉刷新
    onPullDownRefresh(){
        this.setData({
            searchPageNum:1,
            pagesSize:10
        })
        this.get_park_list()
    },
    //停车场名字搜索
    search_park:function(e){
        let that = this
        wx.request({
            url: 'http://192.168.0.121:13259/its/app/cards/parks',
            data: {
                pageNum: that.data.searchPageNum,
                pageSize: that.data.pagesSize,
                name: e.detail.value
            },
            method: 'GET',
            success: function (res) {
                if (res.data.data.list.length > 0) {
                    that.setData({
                        searchSongList: res.data.data.list
                    })
                }
                if (res.data.data.pages > that.data.searchPageNum) {
                    that.setData({
                        searchLoadingComplete: false,
                        searchLoading: true
                    })
                } else {
                    that.setData({
                        searchLoadingComplete: true,
                        searchLoading: false
                    })
                }
            }
        })
    },
    //跳转付款页面
    to_pay_card: function (e) {
        var that = this;
        let num = e.currentTarget.id;
        let park = this.data.searchSongList[num];
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