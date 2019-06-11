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
                this.setData({
                    carNumber:res.data,
                    mycar:true
                })
            },
            fail:(res) => {
                this.get_user_car()
            }
        })
    },
    //获取用户最近所泊车辆
    get_user_car(){
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
                            this.setData({
                                carNumber: res.data.data,
                            })
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
                wx.navigateTo({
                    url: '../selcar/selcar',
                })
            }
        })
    },
    //提交开车停车
    sub:function(){                  
        var that = this
        var oData = {};
        var carNumber = this.data.val
        oData.parkingNo = carNumber;
        wx.getStorage({
            key: 'mobile',
            success(res) {
                that.setData({
                    mobile: res.data
                })
                wx.request({
                    url: http.reqUrl + '/query/parkOrde',
                    data: {
                        mobile: that.data.mobile
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'POST',
                    success: function (res) {
                        if (res.data.data != null) {
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
                            if (time.every(function (time) { return time.pay_type == 1 || time.charge_money == 0})) {
                                wx.getStorage({
                                    key: 'mobile',
                                    success: function (res) {
                                        console.log(that.data.carNumber)
                                        if (that.data.carNumber && that.data.parkNo) {          //判断用户是否需选择车牌和输入车位编号
                                            wx.request({
                                                url: http.reqUrl + '/start/parking',
                                                data: {
                                                    mobile: res.data,
                                                    carNo: that.data.carNumber.car_no,
                                                    parkNo: that.data.parkNo
                                                },
                                                header: {
                                                    'content-type': 'application/x-www-form-urlencoded' // 默认值
                                                },
                                                method: 'GET',
                                                success: function (res) {
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
                                                        return
                                                    }
                                                    if(res.data.code == 702){
                                                        wx.showModal({
                                                            title: '温馨提示',
                                                            content: '输入的车位不存在',
                                                            showCancel: false,
                                                            success: function (res) {
                                                                if (res.confirm) {
                                                                    console.log('用户点击确定')
                                                                }
                                                            }
                                                        });
                                                        return
                                                    }
                                                    if (res.data.success) {
                                                        wx.navigateTo({     //跳转主页面并刷新
                                                            url: '../index/index',
                                                            success: function (e) {
                                                                var page = getCurrentPages().pop();
                                                                if (page == undefined || page == null) return;
                                                                page.onShow();
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        } else if (!that.data.carNumber && that.data.parkNo) {
                                            wx.showModal({
                                                title: '温馨提示',
                                                content: '请选择所泊车辆',
                                                showCancel: false,
                                                success: function (res) {
                                                    if (res.confirm) {
                                                        console.log('用户点击确定')
                                                    }
                                                }
                                            });
                                            return
                                        } else if (that.data.carNumber && !that.data.parkNo) {
                                            wx.showModal({
                                                title: '温馨提示',
                                                content: '请输入车位编号',
                                                showCancel: false,
                                                success: function (res) {
                                                    if (res.confirm) {
                                                        console.log('用户点击确定')
                                                    }
                                                }
                                            });
                                            return
                                        } else {
                                            wx.showModal({
                                                title: '温馨提示',
                                                content: '请添加所泊车辆和车位编号',
                                                showCancel: false,
                                                success: function (res) {
                                                    if (res.confirm) {
                                                        console.log('用户点击确定')
                                                    }
                                                }
                                            });
                                            return
                                        }
                                    },
                                })
                            }
                        }else{
                            wx.getStorage({
                                key: 'mobile',
                                success: function (res) {
                                    console.log(that.data.parkNo)
                                    if (that.data.carNumber && that.data.parkNo) {          //判断用户是否需选择车牌和输入车位编号
                                        wx.request({
                                            url: http.reqUrl + '/start/parking',
                                            data: {
                                                mobile: res.data,
                                                carNo: that.data.sltcarNumber,
                                                parkNo: that.data.parkNo
                                            },
                                            header: {
                                                'content-type': 'application/x-www-form-urlencoded' // 默认值
                                            },
                                            method: 'GET',
                                            success: function (res) {
                                                console.log(res)
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
                                                    return
                                                }
                                                if (res.data.code == 702) {
                                                    wx.showModal({
                                                        title: '温馨提示',
                                                        content: '输入的车位不存在',
                                                        showCancel: false,
                                                        success: function (res) {
                                                            if (res.confirm) {
                                                                console.log('用户点击确定')
                                                            }
                                                        }
                                                    });
                                                    return
                                                }
                                                if (res.data.success) {
                                                    wx.navigateTo({     //跳转主页面并刷新
                                                        url: '../index/index',
                                                        success: function (e) {
                                                            var page = getCurrentPages().pop();
                                                            if (page == undefined || page == null) return;
                                                            page.onShow();
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    } else if (!that.data.carNumber && that.data.parkNo) {
                                        wx.showModal({
                                            title: '温馨提示',
                                            content: '请添加所泊车辆',
                                            showCancel: false,
                                            success: function (res) {
                                                if (res.confirm) {
                                                    console.log('用户点击确定')
                                                }
                                            }
                                        });
                                        return
                                    } else if (that.data.carNumber && !that.data.parkNo) {
                                        wx.showModal({
                                            title: '温馨提示',
                                            content: '请输入车位编号',
                                            showCancel: false,
                                            success: function (res) {
                                                if (res.confirm) {
                                                    console.log('用户点击确定')
                                                }
                                            }
                                        });
                                        return
                                    } else {
                                        wx.showModal({
                                            title: '温馨提示',
                                            content: '请添加所泊车辆和车位编号',
                                            showCancel: false,
                                            success: function (res) {
                                                if (res.confirm) {
                                                    console.log('用户点击确定')
                                                }
                                            }
                                        });
                                        return
                                    }
                                },
                            })
                        }
                    }
                })
            }
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