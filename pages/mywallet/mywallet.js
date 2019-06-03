var app = getApp();
var http = require('../../utils/http.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activeIndex: 0,//默认选中第一个
        numArray: [10, 20, 30, 50, 100, 200],
        carNum: '',
        address: '',
        plate: '编辑',
        timeInput: 0,
        money: '10',
        moneyAll: '0.00',
        token: '',
        mobile:'',
        mobile:'',
        hiddenmodalput: true,
        token:'',
        paymentType: '2'
    },
    onShareAppMessage: function () {
        return {
            title: '华腾智能停车',
            path: '/pages/index/index',
        }
    },
    
    onload:function(){
    },
    onShow(){
        var that = this;
        // console.log(that)
        wx.getStorage({
            key: 'mobile',
            success(res) {
                // console.log(res)
                that.setData({
                    mobile:res.data+""
                })
                wx.request({
                    url: http.reqUrl+'/query/userMoney',
                    data: {
                        mobile: that.data.mobile
                    },
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    method: 'GET',
                    success: function (res) {
                        // console.log(res.data.data)
                        if (res.data.data) {
                            that.setData({
                                moneyAll: res.data.data
                            })
                        }
                    }
                })
            }
        })
        
    },
    activethis: function (event) {//点击选中事件
        var numArray= [10,20,30,50,100,200];
        var thisindex = event.currentTarget.dataset.thisindex;//当前index
        this.setData({
            activeIndex: thisindex
        })
        console.log(numArray[thisindex]);
        this.setData({
            money: numArray[thisindex]
        })
    },
    subRecharge: function () {
        var that = this
        wx.getStorage({
            key: 'token',
            success: function(res) {
                wx.request({
                    url: http.reqUrl +'/wx/paypay',
                    data: {
                        mobile: that.data.mobile,
                        amount: that.data.money,
                        paymentType: that.data.paymentType
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded', // 默认值
                        'token': res.data
                    },
                    method: 'POST',
                    success: function (res) {
                        console.log(res)
                        wx.requestPayment({
                            timeStamp: res.data.data.timeStamp,
                            nonceStr: res.data.data.nonceStr,
                            package: res.data.data.package,
                            signType: res.data.data.signType,
                            paySign: res.data.data.paySign,
                            success: function(res){
                                that.onShow()
                                wx.showToast({
                                    title: '支付成功',
                                    image: '../../img/chenggong.png'
                                })
                            },
                            fail: function(res){
                                wx.showToast({
                                    title: '支付失败',
                                    image: '../../img/shibai.png'
                                })
                            },
                            complete: function(res){

                            }
                        })
                    }
                })
            },
        })
    },
    userquery:function(){
        wx.navigateTo({
            url: '../myquery/myquery',
        })
    },
    //充值其他金额
    othermoney:function(){
        var that = this
        this.setData({
            hiddenmodalput: false
        })
    },
    //获取用户输入的金额
    mymoney:function(res){
        this.setData({
            money:res.detail.value
        })
    },
    //取消按钮  
    cancel: function () {
        this.setData({
            hiddenmodalput: true
        });
    },
    //确认  
    confirm: function (res) {
        var that = this
        console.log(this.data.money)
        this.setData({
            hiddenmodalput: true
        })
        var that = this
        wx.getStorage({
            key: 'token',
            success: function (res) {
                wx.request({
                    url: http.reqUrl +'/wx/paypay',
                    data: {
                        mobile: that.data.mobile,
                        amount: that.data.money,
                        paymentType: that.data.paymentType
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded', // 默认值
                        'token': res.data
                    },
                    method: 'POST',
                    success: function (res) {
                        console.log(res)
                        wx.requestPayment({
                            timeStamp: res.data.data.timeStamp,
                            nonceStr: res.data.data.nonceStr,
                            package: res.data.data.package,
                            signType: res.data.data.signType,
                            paySign: res.data.data.paySign,
                            success: function (res) {
                                console.log(res)
                                that.onload()
                            },
                            fail: function (res) {

                            },
                            complete: function (res) {

                            }
                        })
                    }
                })
            },
        })
    }
})