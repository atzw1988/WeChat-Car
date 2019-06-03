var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var http = require('../../utils/http.js');
var app = getApp();
Page({
    data: {
        oLat:'',
        oLng:'',
        searchSongList: [], //放置返回数据的数组  
        isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组  
        searchPageNum: 1,   // 设置加载的第几次，默认是第一次  
        itemPage: 0,      //返回数据的页面数  
        imgParking: false, //无数据图片，默认false，隐藏  
        searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
        searchLoadingComplete: true  //“没有数据”的变量，默认false，隐藏  
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
    onShow: function(){
        var that = this;
        wx.getLocation({
        type: 'wgs84', //返回可以用于wx.openLocation的经纬度
        success: function (res) {
            var latitude = res.latitude;
            var longitude = res.longitude;
            // 实例化API核心类
            var demo = new QQMapWX({
                key: 'XKBBZ-5RKWS-4TQOB-6CMPO-U2ORF-V5BKW' // 必填
            });
            demo.reverseGeocoder({
            location: {
                latitude: latitude,
                longitude: longitude
            },
            success: function (res) {
                // 获取当前区域
                var oLat = res.result.location.lat;
                var oLng = res.result.location.lng;
                that.setData({
                oLat: res.result.location.lat,
                oLng: res.result.location.lng,
                searchPageNum: 1,   //第一次加载，设置1  
                searchSongList: [],  //放置返回数据的数组,设为空  
                isFromSearch: true,  //第一次加载，设置true  
                searchLoading: true,  //把"上拉加载"的变量设为true，显示  
                searchLoadingComplete: false //把“没有数据”设为false，隐藏  
                });
                that.fetchSearchList();
            }
            });
        }
        });
    },
    longConversion: function (long) {
        if (long > 1000){
        long = (long / 1000).toFixed(2) + '公里'
        }else{
        long = long + '米'
        }
        return long;
    },

  //访问网络  
    fetchSearchList: function () {
        let that = this;
        let searchPageNum = that.data.searchPageNum;//把第几次加载次数作为参数  
        //访问网络  
        var oData = {
            pageIndex: searchPageNum,
            lat: that.data.oLat,
            lng: that.data.oLng
        }
        
        app.func.req('/park/selectcountlcpark', oData, function (res) {
            console.log(res)
            let searchList = [];
            if (res.data.map.length > 0) {
            res.data.map.map(function (item) {
                item.distance = that.longConversion(item.distance);
                return item;
            });
            searchList = res.data.map
            that.data.searchSongList.concat(searchList);
            that.setData({
                itemPage: res.data.tp,
                searchSongList: that.data.searchSongList.concat(searchList) //获取数据数组  
            });
            if (res.data.tp == 1) {
                that.setData({
                searchLoadingComplete: true, //把“没有数据”设为true，显示  
                searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
                });
            } else {
                that.setData({
                searchLoading: true  //把"上拉加载"的变量设为false，隐藏  
                });
            }
            } else {
                that.setData({
                    imgParking: true,
                    searchLoadingComplete: false, //把“没有数据”设为true，显示  
                    searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
                });
            }
        });
    },
  //滚动到底部触发事件  
    searchScrollLower: function () {
        let that = this;
        if (that.data.searchPageNum < parseInt(that.data.itemPage)) {
        if (that.data.searchLoading && !that.data.searchLoadingComplete) {
            that.setData({
                searchPageNum: that.data.searchPageNum + 1,  //每次触发上拉事件，把searchPageNum+1  
                isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
            });
            that.fetchSearchList();
        }
        } else {
            that.setData({
                searchLoadingComplete: true, //把“没有数据”设为true，显示  
                searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
            });
        }
    },
    lockDetail: function(e){
        var that = this;
        let num = e.currentTarget.id;
        console.log(this.data.searchSongList[num])
        let topark = this.data.searchSongList[num];
        wx.getLocation({
            type: 'wgs84', //返回可以用于wx.openLocation的经纬度
            success: function (res) {
                wx.openLocation({
                    latitude: parseFloat(topark.latitude),  // 要去的地址经度，浮点数
                    longitude: parseFloat(topark.longitude),  // 要去的地址纬度，浮点数
                    name: topark.parking_name,
                    address: that.data.location,  // 要去的地址详情说明
                    scale: 18,   // 地图缩放级别,整形值,范围从1~28。默认为最大
                })
            },
            cancel: function (res) {
                console.log('地图定位失败');
            }
        })
    }
}) 