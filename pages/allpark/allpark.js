var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var http = require('../../utils/http.js');
var qqmapsdk;
var oAddress;
var parkingTime;
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activeIndex: 0,
        numArray:[200,300,500,'1k'],
        oLat:'',
        oLng: '',
        distance:'200',
        longitude: '',
        latitude: '',
        parkNumber:[],
        imgParking:true,
        neardis:'200',
        tolat:'',
        tolong:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function (e) {
        this.mapCtx = wx.createMapContext('map')
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;
        wx.getLocation({
            type: 'wgs84', //返回可以用于wx.openLocation的经纬度
            success: function (res) {
                // console.log(res)
                var latitude = res.latitude;
                var longitude = res.longitude;
                // 实例化API核心类
                var demo = new QQMapWX({
                    key: 'XKBBZ-5RKWS-4TQOB-6CMPO-U2ORF-V5BKW' // 必填
                });
                that.setData({
                    longitude: longitude,
                    latitude: latitude,
                });
                // 调用接口
                demo.reverseGeocoder({
                    location: {
                        latitude: latitude,
                        longitude: longitude
                    },
                    success: function (res) {
                        // console.log(res)
                        // var oLat = res.result.location.lat;
                        // var oLng = res.result.location.lng;
                        that.setData({
                            searchSongList: []
                        })
                        that.data.oLat = res.result.location.lat
                        that.data.oLng = res.result.location.lng
                        // 获取当前区域
                        oAddress = res.result.address_component.district;
                        app.func.req('/parking/parkInfo', {address: oAddress}, function (res) {
                            if (res.success){
                                if (res.data.length > 0) {
                                    var oArr = [];
                                    for (var i = 0; i < res.data.length; i++) {
                                        var oObj = {};
                                        if (res.data[i].SumPark == res.data[i].SumUsePark && res.data[i].SumPark == 0 && res.data[i].SumUsePark == 0) {
                                            continue
                                        } else {
                                            if (res.data[i].SumPark === res.data[i].SumUsePark) {
                                                oObj.iconPath = "../../img/parking-p_icon_choice_pressed@2x.png";
                                            } else {
                                                oObj.iconPath = "../../img/parking-p_icon_choice_default@2x.png";
                                            }
                                        }
                                        oObj.id = res.data[i].parkNo;
                                        oObj.latitude = res.data[i].latitude;
                                        oObj.longitude = res.data[i].longitude;
                                        oObj.width = 28;
                                        oObj.height = 31;
                                        oArr.push(oObj);
                                        oObj = {};
                                    }
                                    that.setData({
                                        markers: oArr
                                    })
                                }
                            }
                        });
                        var oData = {
                            pageIndex: 1,
                            lat: res.result.location.lat,
                            lng: res.result.location.lng,
                        }
                        app.func.req('/park/selectcountlcpark', oData, function (res) {
                            let searchList = [];
                            let mypark = []
                            searchList = res.data.map
                            if (res.data.map.length > 0) {
                                for (var i = 0; i < res.data.map.length; i++) {
                                    if (searchList[i].distance < that.data.distance) {
                                      mypark.push(searchList[i])
                                    }
                                }
                                that.setData({
                                  parkNumber: mypark
                                })
                                if(mypark.length>0){
                                    that.setData({
                                      imgParking: true
                                    })
                                }else{
                                    that.setData({
                                      imgParking: false,
                                    });
                                }
                            } else {
                                that.setData({
                                    imgParking: false,
                                });
                            }
                        });
                    }
                });
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
    
    markertap(e) {
        var oData = {
            address: oAddress,
            parkNo: e.markerId
        }
        app.func.req('/parking/iswhether', oData, function (res) {
            if (res.success) {//满
                wx.showModal({
                    title: '提示',
                    content: '这个车位已经被使用',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            console.log('用户点击确定')
                        }
                    }
                });
            } else {//不满
                wx.setStorage({
                    key: 'markerId',
                    data: e.markerId,
                    complete: function () {
                        console.log('markerId=' + e.markerId);
                    }
                });
                app.func.req('/parking/parkInfo', oData, function (res) {
                    wx.openLocation({
                        latitude: parseFloat(res.data[0].latitude),
                        longitude: parseFloat(res.data[0].longitude),
                        scale: 18,
                        name: res.data[0].parkName,
                        address: res.data[0].parkAddress
                    })
                });
            }
        })
    },
    //根据选定距离显示停车场
    activethis: function (event) {
        var numArray = [200, 300, 500, 1000];
        var thisindex = event.currentTarget.dataset.thisindex;//当前index
        this.setData({
            activeIndex: thisindex,
            neardis: numArray[thisindex],
            distance: numArray[thisindex]
        })
        let that = this;
        //获取附近停车场
        var oData = {
          pageIndex: 1,
          lat: that.data.oLat,
          lng: that.data.oLng
        }
        app.func.req('/park/selectcountlcpark', oData, function (res) {
            let searchList = [];
            let mypark = []
            searchList = res.data.map
            if (res.data.map.length > 0) {
                that.setData({
                    imgParking: true
                })
                for (var i = 0; i < res.data.map.length;i++){
                    if (searchList[i].distance < that.data.distance){
                        mypark.push(searchList[i])
                    }
                }
                that.setData({
                  parkNumber: mypark,
                })
                if (mypark.length > 0) {
                    that.setData({
                      imgParking: true
                    })
                } else {
                    that.setData({
                      imgParking: false,
                    });
                }  
            } else {
                that.setData({
                    imgParking: false,
                });
            }
        });
    },
    daohang: function(e){
        var that = this;
        let num = e.currentTarget.id;
        let topark = this.data.parkNumber[num]
        wx.getLocation({
            type: 'wgs84', //返回可以用于wx.openLocation的经纬度
            success:function(res){
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