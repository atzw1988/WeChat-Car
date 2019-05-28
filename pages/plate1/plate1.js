var app = getApp();
var http = require('../../utils/http.js');
Page({
    data: {
        plateNo: '',
        plateLength: false,
        plateAreaCharset: ['京', '津', '沪', '渝', '冀', '豫', '云', '辽', '黑', '湘', '皖', '鲁', '新', '苏', '浙', '赣', '鄂', '桂', '甘', '晋', '蒙', '陕', '吉', '闽', '贵', '粤', '青', '藏', '川', '宁', '琼'],
        plateDigitCharset: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        inputBoxData: [{ char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }],
        inputBoxData1: [{ char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }, { char: '', hover: '' }],
        currentPos: null,
        animationData: {},
        carnumber:[],      //车牌数组
        userId:'',         //用户ID
        showplate: false,  //控制新能源车牌和普通车牌输入框的显示
        carkind:'0'        //车辆类型
    },
    onShareAppMessage: function () {
        return {
            title: '华腾智能停车',
            path: '/pages/index/index',
        }
    },
    onLoad: function () {
        wx.showShareMenu({
            withShareTicket: true
        });
    },
    onShow: function () {
        // 页面显示车牌输入框动画
        var animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
        })
        animation.top('20rpx').step()
        this.setData({
            animationData: animation.export()
        })
    },
    //拍照识别车牌
    camera:function(){   
        var that = this;
        wx.chooseImage({
            sourceType:['camera'],
            success: function(res) {
                wx.showLoading({
                    title: '识别中...'
                });
                wx.getFileSystemManager().readFile({//读取本地文件
                        filePath:res.tempFilePaths[0],//选择图片返回的相对路径
                        encoding: 'base64',//编码格式
                        success:function(res) {//成功回调
                            console.log(res)                            
                            wx.request({
                                url: 'https://ocrcp.market.alicloudapi.com/rest/160601/ocr/ocr_vehicle_plate.json',//阿里API
                                data: {
                                    "image":res.data,//获取图片64位base编码
                                    "configure": "{\"multi_crop\":true}"
                                },
                                header:{
                                    'Authorization':'APPCODE 019744defeb841dd9cb88f1e33c8a1a1'  //阿里云识别服务code
                                },
                                method:'POST',
                                // dataType:'json',
                                // responseType:'text',
                                success:function(res){
                                    console.log(1)
                                    console.log(res)
                                    let prob = res.data.plates[0].prob   
                                    if (prob>0.8){            //判断识别车牌的可信度
                                        that.setData({
                                            carnumber: res.data.plates[0].txt.split(""),
                                            plateNo: res.data.plates[0].txt
                                        })
                                        if (that.data.carkind == 0) {
                                            that.data.inputBoxData[0].char = that.data.carnumber[0]
                                            that.data.inputBoxData[1].char = that.data.carnumber[1]
                                            that.data.inputBoxData[2].char = that.data.carnumber[2]
                                            that.data.inputBoxData[3].char = that.data.carnumber[3]
                                            that.data.inputBoxData[4].char = that.data.carnumber[4]
                                            that.data.inputBoxData[5].char = that.data.carnumber[5]
                                            that.data.inputBoxData[6].char = that.data.carnumber[6]
                                            that.setData({
                                                inputBoxData: that.data.inputBoxData
                                            })
                                        }
                                        if (that.data.carkind == 1) {
                                            that.data.inputBoxData1[0].char = that.data.carnumber[0]
                                            that.data.inputBoxData1[1].char = that.data.carnumber[1]
                                            that.data.inputBoxData1[2].char = that.data.carnumber[2]
                                            that.data.inputBoxData1[3].char = that.data.carnumber[3]
                                            that.data.inputBoxData1[4].char = that.data.carnumber[4]
                                            that.data.inputBoxData1[5].char = that.data.carnumber[5]
                                            that.data.inputBoxData1[6].char = that.data.carnumber[6]
                                            that.data.inputBoxData1[7].char = that.data.carnumber[7]
                                            that.setData({
                                                inputBoxData1: that.data.inputBoxData1
                                            })
                                        }
                                        wx.hideLoading();
                                    }else{
                                        wx.hideLoading();
                                        wx.showModal({
                                            title: '温馨提示',
                                            content: '车牌识别失败，麻烦请您重新拍照',
                                            success(res){
                                                if (res.confirm) {
                                                    that.camera()
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
                },
                fail: function (error) {
                    //   console.error("调用本地相册文件时出错")
                    //   console.warn(error)
                },
            complete: function () {
            }
        })
    },
    //普通车牌输入函数
    bindDigitTap: function (res) {
        let inputBoxData = this.data.inputBoxData  //获取输入框
        let id = res.currentTarget.id  //获取输入框的位置
        let currentPos = id

        if (currentPos  > 6 ){
        var oArr = [];
        for (var i = 0; i < this.data.inputBoxData.length; i++){        
            oArr.push(this.data.inputBoxData[i].char);
        }
        var oString = oArr.join("")
        this.setData({
            plateLength: true,
            plateNo: oString
        })
        }else{
            this.setData({
                plateLength: false,
            })
        }
        if (id > 6) {
            id = 6
            currentPos = null;
        } else {
            inputBoxData[id].hover = 'plate-input-digit-hover'
        }
        if (this.data.currentPos != null) inputBoxData[this.data.currentPos].hover = ''
        this.setData({
            inputBoxData: inputBoxData,
            currentPos: currentPos
        })
    },
    //新能源车牌输入函数
    bindDigitTap1:function(res){
        let inputBoxData1 = this.data.inputBoxData1  //获取输入框
        let id = res.currentTarget.id  //获取输入框的位置
        let currentPos = id
        if (currentPos > 7) {
            var oArr = [];
            for (var i = 0; i < this.data.inputBoxData1.length; i++) {
                oArr.push(this.data.inputBoxData1[i].char);
            }
            var oString = oArr.join("")
            this.setData({
                plateLength: true,
                plateNo: oString
            })
        } else {
            this.setData({
                plateLength: false,
            })
        }
        if (id > 7) {
            id = 7
            currentPos = null;
        } else {
            inputBoxData1[id].hover = 'plate-input-digit-hover'
        }
        if (this.data.currentPos != null) inputBoxData1[this.data.currentPos].hover = ''
        this.setData({
            inputBoxData1: inputBoxData1,
            currentPos: currentPos
        })
    },
    //普通车牌焦点输入框自动移入下一个函数
    bindKeyTap: function (res) {
        //   console.log(res)
        let char = res.currentTarget.dataset.char
        let inputBoxData = this.data.inputBoxData
        inputBoxData[this.data.currentPos].char = char
        let passOnData = {
            currentTarget: {
                id: parseInt(this.data.currentPos) + 1
            }
        }
        this.bindDigitTap(passOnData)
    },
    //新能源车牌焦点输入框自动移入下一个函数
    bindKeyTap1: function (res) {
        let char = res.currentTarget.dataset.char
        let inputBoxData1 = this.data.inputBoxData1
        inputBoxData1[this.data.currentPos].char = char
        let passOnData = {
            currentTarget: {
                id: parseInt(this.data.currentPos) + 1
            }
        }
        this.bindDigitTap1(passOnData)
    },
    //新能源车牌选择框触发函数
    checkboxChange(e) {
        var that = this
        let length = e.detail.value.length
        if (length == 0){
            that.setData({
                carkind:'0',
                showplate:false
            })
        }
        if(length == 1){
            that.setData({
                carkind:"1",
                showplate:true
            })
        }
    },
    //确认添加车牌函数
    plateOn: function(){  
        var that = this;
        if (!this.data.plateNo){
            return;
        }else{
            wx.getStorage({
                key: 'userID',
                success(res) {
                    that.setData({
                        userId: res.data + ""
                    })
                    wx.request({
                        url: http.reqUrl +'/add/carNo',
                        data: {
                            userId: that.data.userId,
                            carNo: that.data.plateNo,
                            carType: that.data.carkind
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded' // 默认值
                        },
                        method: 'GET',
                        success: function (res) {
                            wx.navigateBack({     //跳转车辆管理页面并刷新
                                url: '../mycar/mycar',
                                success:function(e){
                                    var page = getCurrentPages().pop();
                                    if (page == undefined || page == null) return;
                                    page.onLoad(); 
                                }
                            })
                        }
                    })
                }
            })
        }
    }
})