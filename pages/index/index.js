//index.js
//获取应用实例  
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var http = require('../../utils/http.js');
var qqmapsdk;
var oAddress;
var parkingTime;
var app = getApp();
Page({
    data: {
        // 页面配置
        winWidth: 0,
        winHeight: 0,
        // tab切换  
        swichNav: true,
        swichNav1: false,
        // 车位与锁图
        carImg:'../../img/parking-p_icon_choice_default@2x.png',
        lockImg:'../../img/parking-s_icon_choice_default@2x.png',
        // 地图
        markerWidth:28,
        markerHeight:31,
        longitude: '',
        latitude: '',
        markers: [],
        userInfo: {},
        hasUserInfo: false,
        bindPhone:'',
        searchSongList: [], //放置返回数据的数组  
        isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组  
        searchPageNum: 1,   // 设置加载的第几次，默认是第一次  
        itemPage: 0,      //返回数据的页面数  
        imgParking: false, //无数据图片，默认false，隐藏  
        parkShow: false,//是否显示下面的
        orderNo: '',//订单编号
        consumedMoney:'0',//已消费
        payTime:0,//购买时长
        parkTime:0,//停车时长
        parkNo:'',//车位编号
        timestamp: 0,//停车开始时间戳
        carFree: 0,
        carPrice: 0,
        startParkedTime: 0,
        userID:0,
        longTime:0,
        openPrompt: true,
        animationData: {},
        carNumber:'',
        starttime:'',
        first:false,     //判断是否位当天第一次停车
        time1:null,
        parknum:0 ,   //车位数量
        choose:false,
        showModalStatus:false,
        get_user_phone:false
    },
    //加载腾讯地图
    onReady: function (e) {
        this.mapCtx = wx.createMapContext('map')
    },
    onLoad: function(){
        var that = this;    
    },
    onUnload: function(){
        // wx.navigateTo({
        //     url: '../index/index',
        // })
    },  
    onShow: function(){
        // 转发
        var that = this;
        wx.showShareMenu({
            withShareTicket: true
        }); 
        var that = this;
        //查询用户是否有欠款
        wx.getStorage({
            key: 'userID',
            success(res) {
                that.setData({
                    userId: res.data + ""
                })
                wx.request({
                    url: http.reqUrl + '/query/parkOrde',
                    data: {
                        userId: that.data.userId
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'POST',
                    success: function (res) {
                        if (res.data.data != null) {
                            let length = res.data.data.length
                            let time = res.data.data
                            if (time.some(function (time) { return time.pay_type == 0 && time.parkend_time != undefined && time.charge_money > 0})) {
                                wx.showModal({
                                    title: '温馨提示',
                                    content: '您还有未付清的停车费用，需要付清后才能再次停车',
                                    success(res) {
                                        if (res.confirm) {
                                            wx.navigateTo({
                                                url: '../payfor/payfor',
                                            })
                                        } else if (res.cancel) {
                                            return;
                                        }
                                    }
                                })
                            }
                        }                        
                    }
                })
                //查询用户是否绑定车牌
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
                        if(!res.data.data){
                            wx.showModal({
                                title: '温馨提示',
                                content: '您尚未绑定车牌，请先绑定车牌！',
                                success(res) {
                                    if (res.confirm) {
                                        wx.navigateTo({
                                            url: '../plate1/plate1',
                                        })
                                    } else if (res.cancel) {
                                        return;
                                    }
                                }
                            })
                        }
                    }
                })
            }
        })
        app.getUserInfo(function (userInfo) {
        //更新数据
            // if (!userInfo.ofoInfo) {
            //     setTimeout(function () {
            //       wx.navigateTo({
            //         url: '../bindphone/bindphone'
            //       });
            //     }, 300);
            //     return;
            // }
            that.setData({
                userInfo: userInfo
            })
        });
        // 获取用户ID
        wx.getStorage({
            key: 'userID',
            success: function (res) {
                that.setData({
                    userID: res.data,
                });
                //查询是否有在停的订单
                wx.request({
                    url: http.reqUrl+'/query/userStop',
                    data: {
                        userId: res.data
                    },
                    method: 'GET',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    success:function(res){
                        console.log(res)
                        if(res.data.success){
                            if (res.data.data) {
                                that.setData({
                                    parkShow: true,
                                    parkNo: res.data.data.park_no,
                                    carNumber: res.data.data.car_no,
                                    starttime: http.formatDate(res.data.data.parkstart_time),
                                })
                                let start = res.data.data.parkstart_time
                                let timenow = Date.parse(new Date());
                                let timepoor = Math.ceil((timenow - start) / 60000)
                                console.log(timepoor)
                                that.setData({
                                    parkTime: timepoor
                                })
                                that.data.time1 = setInterval(function () {
                                    that.setData({
                                        parkTime: that.data.parkTime + 1,
                                        // consumedMoney: Math.ceil(that.data.parkTime / 30) * 2
                                    })
                                    console.log(that.data.parkTime)
                                }, 60000)
                            } else {
                                that.setData({
                                    parkShow: false
                                })
                            }
                        }
                        wx.getSystemInfo({
                            success: function (res) {
                                if (that.data.parkShow) {
                                    that.setData({
                                        winWidth: res.windowWidth,
                                        winHeight: res.windowHeight-180
                                    });
                                } else {
                                    that.setData({
                                        winWidth: res.windowWidth,
                                        winHeight: res.windowHeight - 120
                                    });
                                }
                            }
                        });    
                    }
                })
            }
        })
        wx.getSystemInfo({
            success: function (res) {
                if (that.data.parkShow) {
                    that.setData({
                        winWidth: res.windowWidth,
                        winHeight: res.windowHeight-180
                    });
                } else {
                    that.setData({
                        winWidth: res.windowWidth,
                        winHeight: res.windowHeight - 120
                    });
                }
            }
        });
        wx.getSystemInfo({
            success: function (res) {
                if (that.data.choose) {
                    that.setData({
                        winWidth: res.windowWidth,
                        winHeight: res.windowHeight-180
                    });
                } else {
                    that.setData({
                        winWidth: res.windowWidth,
                        winHeight: res.windowHeight - 120
                    });
                }
            }
        });
        wx.getLocation({
            type: 'wgs84', //返回可以用于wx.openLocation的经纬度
            success: function (res) {
                console.log(res)
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
                        that.setData({
                            searchSongList: []
                        })
                        // 获取最近三个停车场
                        app.func.req('/park/selectlcpark', { area_code: res.result.ad_info.adcode, lat: res.result.location.lat, lng: res.result.location.lng}, function (res) {
                        // console.log(res)
                            if(res.success){
                                let searchList = [];
                                if (res.data.map.length > 0) {
                                    res.data.map.map(function (item) {
                                        item.distance = that.longConversion(item.distance);
                                        return item;
                                    });
                                    searchList = res.data.map
                                    that.data.searchSongList.concat(searchList);
                                    that.setData({
                                        searchSongList: that.data.searchSongList.concat(searchList) //获取数据数组  
                                    });
                                    // console.log(that.data.searchSongList)
                                    let length = that.data.searchSongList.length
                                    let allnum = 0
                                    for (var i = 0; i < length; i++) {
                                        allnum += that.data.searchSongList[i].freepark
                                    }
                                    that.setData({
                                        parknum: allnum
                                    })
                                }        
                            }   
                        });
                        // 获取当前区域
                        oAddress = res.result.address_component.district;
                        app.func.req('/parking/parkInfo', { address: oAddress }, function (res) {
                            if(res.success){
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
                    }
                });
            }
        });        
    },
  // onShow: function(){
  //   wx.showShareMenu({
  //      withShareTicket: true
  //   });
  //   page.onLoad();
  // },
    getUserInfo: function (e) {
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
  // 监听markers
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
    // payPark: function(e){
    //     var that = this;
    //     wx.navigateTo({
    //         url: '../paytime/paytime'
    //     })
    // },
    //结束停车
    stopPark: function(e){
        var that = this
        console.log(e)
        let formid = e.detail.formId
        wx.showModal({
            title: '温馨提示',
            content: '您确定要停止停车吗，请确保及时驾离车位',
            success(res){
                if (res.confirm) {
                    wx.getStorage({
                        key: 'userID',
                        success: function (res) {
                            console.log(formid)
                            wx.request({
                                url: http.reqUrl + '/end/parking',
                                data: {
                                    userId: res.data,
                                    formId: formid
                                },
                                header: {
                                    'content-type': 'application/x-www-form-urlencoded' // 默认值
                                },
                                method: 'POST',
                                success: function (res) {
                                    console.log(res)
                                    if(res.data.success == true){
                                        clearInterval(that.data.time1)
                                        wx.setStorage({
                                            key: 'order_no',
                                            data: res.data.data.order_no,
                                        });
                                        wx.setStorage({
                                            key: 'buy_time',
                                            data: res.data.data.buy_time,
                                        });
                                        wx.setStorage({
                                            key: 'charge_money',
                                            data: res.data.data.charge_money,
                                        });
                                        wx.setStorage({
                                            key: 'parkNo',
                                            data: res.data.data.parkNo,
                                        });
                                        wx.setStorage({
                                            key: 'carNo',
                                            data: res.data.data.carNo,
                                        });
                                        wx.navigateTo({
                                            url: '../endbilling/endbilling'
                                        });
                                    }
                                    
                                }
                            })
                        },
                    })
                } else if (res.cancel) {
                    return;
                }
            }
        })
    },
    // 刷新页面，再次请求接口
    refreshtap:function(e){
        this.setData({
            carImg: '../../img/parking-p_icon_choice_default@2x.png',
            lockImg: '../../img/parking-s_icon_choice_default@2x.png',
        });
        var that = this;
    // map.clearOverlays();//清除覆盖物
        app.func.req('/parking/parkInfo', { address: oAddress }, function (res) {
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
        });
    },
    // 移动到定位点中心
    moveToLocation: function () {
        this.mapCtx.moveToLocation()
    },
    // 跳转帮助中心页面
    helpTocenter: function(){
        wx.navigateTo({
            url: '../help/help'
        })
    },
    // 跳转个人中心页面
    personalTocenter: function(){
        wx.navigateTo({
            url: '../person/person'
        })
    },
    //跳转附近停车场界面
    allpark: function(){
        wx.navigateTo({
            url: '../allpark/allpark'
        })
        // wx.navigateTo({
        //     url: '../cardpay/cardpay',
        // })
    },
    longConversion: function (long) {
        if (long > 1000) {
            long = (long / 1000).toFixed(2) + '公里'
        } else {
            long = long + '米'
        }
        return long;
    },
    //点击选择停车种类
    stopCar: function(){
        this.parkone()
        // var that = this;
        // this.setData({
        //     showModalStatus: true
        // })
    },
    // 我要停车
    parkone: function(){
        let that = this;
        wx.getStorage({
            key: 'userID',
            success(res) {
                that.setData({
                    userId: res.data
                })
                wx.request({
                    url: http.reqUrl + '/query/parkOrde',
                    data: {
                        userId: that.data.userId
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'POST',
                    success: function (res) {
                        if(res.data.success){
                            if (res.data.data != null) {
                                console.log(1)
                                let length = res.data.data.length
                                let time = res.data.data
                                if (time.some(function (time) { return time.pay_type == 0 && time.parkend_time != undefined && time.charge_money > 0 })) {
                                    wx.showModal({
                                        title: '温馨提示',
                                        content: '您还有未付清的停车费用，需要付清后才能再次停车',
                                        success(res) {
                                            if (res.confirm) {
                                                wx.navigateTo({
                                                    url: '../payfor/payfor',
                                                })
                                            } else if (res.cancel) {
                                                return;
                                            }
                                        }
                                    })
                                }
                                if (time.every(function (time) { return time.pay_type == 1 || time.charge_money == 0 })) {
                                    wx.navigateTo({
                                        url: '../carNumber/carNumber',
                                    })
                                }
                            } else {
                                wx.navigateTo({
                                    url: '../carNumber/carNumber',
                                })
                            }  
                        }
                        if(res.data.fail){
                            wx.navigateTo({
                                url: '../carNumber/carNumber',
                            })
                        }                         
                    }
                })
            }
        })   
    },
    parktwo: function(){
        wx.navigateTo({
            url: '../daozhapark/daozhapark',
        })
    },
    parkingS: function(){
        wx.reLaunch({
            url: '../lockMap/lockMap'
        })
    },
    moreBtn: function () {
        wx.navigateTo({
            url: "../parkingList/parkingList"
        });
    },
    bindParkingListItemTap: function(e){
        console.log(e.currentTarget.dataset.index);
        console.log(e.currentTarget.dataset.data);
        wx.setStorage({
            key: 'lockDetailList',
            data: e.currentTarget.dataset.index,
            success: function (res) {
                wx.navigateTo({
                    url: "../detailList/detailList"
                });
            },
            fail: function (res) { },
            complete: function (res) { },
        });
    },
    bindphone: function(){
        wx.navigateTo({
            // url: '../bindphone/bindphone',
            url: '../lockMap/lockMap'
        })
    },
    chakan: function(){
        wx.navigateTo({
            // url: '../bindphone/bindphone',
            url: '../endbilling/endbilling'
        })
    },
    daozhapark: function(){
        wx.navigateTo({
            url: '../daozhapark/daozhapark',
        })
    },
    powerDrawer: function(){
        let that = this
        /* 动画部分 */
        // 第1步：创建动画实例 
        var animation = wx.createAnimation({
            duration: 200,  //动画时长
            timingFunction: "linear", //线性
            delay: 0  //0则不延迟
        });

        // 第2步：这个动画实例赋给当前的动画实例
        this.animation = animation;

        // 第3步：执行第一组动画
        animation.opacity(0).rotateX(-100).step();

        // 第4步：导出动画对象赋给数据对象储存
        this.setData({
            animationData: animation.export()
        })

        // 第5步：设置定时器到指定时候后，执行第二组动画
        setTimeout(function () {
            // 执行第二组动画
            animation.opacity(1).rotateX(0).step();
            // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
            this.setData({
                animationData: animation
            })
            if (that.data.showModalStatus==true){
                this.setData({
                    showModalStatus: false
                })
            }
        }.bind(this), 400)       
    },
    getPhoneNumber: function (e) {
        console.log(1)
        console.log(e.detail.errMsg)
        console.log(e.detail.iv)
        console.log(e.detail.encryptedData)
    }
});

