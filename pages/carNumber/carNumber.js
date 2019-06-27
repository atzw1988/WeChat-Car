var http = require('../../utils/http.js');
var app = getApp();

var markerId;
Page({
    data: {
        oneNum: '',
        twoNum: '',
        threeNum: '',
        fourNum: '',
        fiveNum: '',
        sixNum: '',
        len: 0,
        val: '',
        pay: false,
        focus: false,
        carNumber: {},  
        carkind:'',
        showimg: true,
        sltcarNumber:'',
        parkNo:'',
        mycar:false
    },
    //用户分享
    onShareAppMessage: function () {
        return {
            title: '华腾智能停车',
            path: '/pages/index/index',
        }
    },
    onLoad: function(){              //用户分享
        wx.showShareMenu({
            withShareTicket: true
        });
        wx.getStorage({
            key: 'markerId',
            success: function (res) {
                console.log(res)
                if (res.data) {
                markerId = res.data;
                }
            }
        })
    },
    onUnload(){
        console.log('卸载')
        wx.removeStorage({
            key: 'sel_car',
        });        
    },
    onShow: function () {            
        wx.showShareMenu({
            withShareTicket: true
        });
        this.user_car_sel()
        this.get_car_list()
    },
    changeshow: function(){
        this.setData({
            showimg: !this.data.showimg
        })
    },
    //判断是否更换车辆
    user_car_sel(){
        wx.getStorage({
            key: 'sel_car',
            success: (res) => {
                console.log(res)
                this.setData({
                    carNumber:res.data,
                    mycar:true
                })
            },
            fail:(res) => {
                // this.get_user_car()
            }
        })
    },
    //获取用户最近所泊车辆
    get_user_car(data){
        let data_list = data.map(item => {
            return item.car_no
        })
        wx.getStorage({
            key: 'mobile',
            success: (res) => {
                wx.request({
                    url: http.reqUrl + '/recently/carNo',
                    data: {
                        mobile: res.data
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'GET',
                    success: (res) => {
                        console.log(res)
                        if (res.data.code == 0) {
                            if (data_list.indexOf(res.data.data.car_no) != -1) {
                                this.setData({
                                    carNumber: res.data.data,
                                })
                            }else{
                                this.setData({
                                    carNumber:data[0]
                                })
                            }
                        }
                    }
                })
            },
        }) 
    },
    //获取用户车辆列表
    get_car_list(){
        wx.getStorage({
            key: 'mobile',
            success: (res) => {
                wx.request({
                    url: http.reqUrl + '/query/carNo',
                    data: {
                        mobile: res.data
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'GET',
                    success: (res) => {
                        console.log(res)
                        if (res.data.success) {
                            this.setData({
                                mycar: true
                            })
                            let car_list = res.data.data
                            this.get_user_car(car_list)
                        }else{
                            this.setData({
                                mycar: false
                            })
                        }
                    }
                })
            },
        })
    },
    //更换车牌
    sel_car(){
        wx.setStorage({
            key: 'to_sel_car',
            data: true,
            success: () => {
                wx.redirectTo({
                    url: '../selcar/selcar',
                })
            }
        })
    },
    //提交开车停车
    sub:function(){
        wx.getStorage({
            key: 'mobile',
            success: (result) => {
                if (this.data.carNumber.car_no && this.data.parkNo) {
                    wx.request({
                        url: http.reqUrl + '/start/parking',
                        data: {
                            mobile: result.data,
                            carNo: this.data.carNumber.car_no,
                            parkNo: this.data.parkNo
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        method: 'GET',
                        success: (res) => {
                            console.log(res)
                            if(res.data.code == 0){
                                wx.redirectTo({ //跳转主页面并刷新
                                    url: '../index/index',
                                    success: function (e) {
                                        var page = getCurrentPages().pop();
                                        if (page == undefined || page == null) return;
                                        page.onShow();
                                    }
                                })
                            }else{
                                wx.showModal({
                                    title: '温馨提示',
                                    content: res.data.mesg,
                                    showCancel: false,
                                    success: function (res) {
                                        if (res.confirm) {
                                            console.log('用户点击确定')
                                        }
                                    }
                                })
                            }
                        }
                    })        
                } else if (!this.data.carNumber.car_no && this.data.parkNo) {
                    wx.showModal({
                        title: '温馨提示',
                        content: '请选择所泊车辆',
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                            }
                        }
                    })
                    return
                } else if (this.data.carNumber.car_no && !this.data.parkNo) {
                    wx.showModal({
                        title: '温馨提示',
                        content: '请输入车位编号',
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                            }
                        }
                    })
                    return
                }else{
                    wx.showModal({
                        title: '温馨提示',
                        content: '请选择所泊车辆和车位编号',
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                            }
                        }
                    })
                    return
                }
            },
            fail: () => {
                wx.showModal({
                    title: '温馨提示',
                    content: '获取用户信息出错，请重新进入小程序',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            console.log('用户点击确定')
                        }
                    }
                })
                return
            },
            complete: () => {}
        })        
    },
    //二维码识别车位编号
    getparking: function(){          
        var that = this
        wx.scanCode({
            scanType: ['barCode', 'qrCode'],
            success:function(res){
                let result = res.result.split('')
                that.setData({
                    len: 6,
                    oneNum: result[0],
                    twoNum: result[1],
                    threeNum: result[2],
                    fourNum: result[3],
                    fiveNum: result[4],
                    sixNum: result[5],
                    parkNo: res.result
                })
                wx.request({
                    url: http.reqUrl + '/check/spaces',
                    data: {
                        parkNo: that.data.parkNo
                    },
                    method: 'GET',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    success: function (res) {
                        console.log(res)
                        if (res.data.code == 702) {
                            wx.showModal({
                                title: '温馨提示',
                                content: '所选的车位不存在',
                                showCancel: false,
                                success: function (res) {
                                    if (res.confirm) {
                                        console.log('用户点击确定')
                                    }
                                }
                            });
                        }
                        if (res.data.code == 701) {
                            wx.showModal({
                                title: '温馨提示',
                                content: '所选的车位已经被占用',
                                showCancel: false,
                                success: function (res) {
                                    if (res.confirm) {
                                        console.log('用户点击确定')
                                    }
                                }
                            });
                        }
                    }
                })
            }
        })
    },
     //跳转添加车牌页面
    addmycar: function () {         
        wx.navigateTo({
            url: '../plate1/plate1'
        });
    },
    bindHideKeyboard: function (e) {   
        var vals = e.detail.value;
        var lens = e.detail.value.length;
        this.setData({
            len: lens,
            val: vals
        })
        // console.log(e)
        if (e.detail.cursor == 1){
            var str = e.detail.value;
            var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
            this.setData({
                oneNum: oNum
            })
        }
        if (e.detail.cursor == 2) {
            var str = e.detail.value;
            var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
            this.setData({
                twoNum: oNum
            })
        }
        if (e.detail.cursor == 3) {
            var str = e.detail.value;
            var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
            this.setData({
                threeNum: oNum
            })
        }
        if (e.detail.cursor == 4) {
            var str = e.detail.value;
            var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
            this.setData({
                fourNum: oNum
            })
        }
        if (e.detail.cursor == 5) {
            var str = e.detail.value;
            var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
            this.setData({
                fiveNum: oNum
            })
        }
        if (e.detail.cursor == 6) {
            var str = e.detail.value;
            var oNum = str.replace(/^(.*[n])*.*(.|n)$/g, "$2");
            wx.hideKeyboard();
            this.setData({
                sixNum: oNum,
                focus: false,
                pay: false,
                parkNo: e.detail.value
            })
            console.log(this.data.parkNo)
            wx.request({
                url: http.reqUrl +'/check/spaces',
                data: {
                    parkNo: this.data.parkNo
                },
                method: 'GET',
                header: {
                    'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                success: function(res){
                    console.log(res)
                    if(res.data.code == 702){
                        wx.showModal({
                            title: '温馨提示',
                            content: '所选的车位不存在',
                            showCancel: false,
                            success: function (res) {
                                if (res.confirm) {
                                    console.log('用户点击确定')
                                }
                            }
                        });
                    }
                    if (res.data.code == 701){
                        wx.showModal({
                            title: '温馨提示',
                            content: '所选的车位已经被占用',
                            showCancel: false,
                            success: function (res) {
                                if (res.confirm) {
                                    console.log('用户点击确定')
                                }
                            }
                        });
                    }
                }
            })
        }
    },
    confirmTobtn: function () {
        var that = this
        if (this.data.len == 6) {
            var oData = {};
            var carNumber = this.data.val
            oData.parkingNo = carNumber;
            wx.getStorage({
                key: 'mobile',
                success: function (res) {
                    console.log(res.data)
                    console.log(that.data.sltcarNumber)
                    wx.request({
                        url: 'http://192.168.1.104:8080/start/parking',
                        data: {
                            mobile: res.data,
                            carNo: that.data.sltcarNumber,
                            parkNo: '065502'
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded' // 默认值
                        },
                        method: 'GET',
                        success: function (res) {
                            console.log(res)
                            // console.log(that.data.queryList)
                        }
                    })
                },
            })
            //   app.func.req('/pkmg/qparkingno', oData, function (res) {
            //     if (res.success) {
            //       wx.setStorage({
            //         key: 'carNumber',
            //         data: carNumber,
            //         complete: function () {
            //           // 跳转
            //           wx.navigateTo({
            //             url: '../order/order'
            //           })
            //         }
            //       });
            //     } else {
            //       wx.showModal({
            //         title: '提示',
            //         content: '您输入的停车场车位编号已经被占用，请重新选择',
            //         showCancel: false,
            //         success: function (res) {
            //           if (res.confirm) {
            //             console.log('用户点击确定')
            //           }
            //         }
            //       });

            //     }
            //   });  
        }
    }
});