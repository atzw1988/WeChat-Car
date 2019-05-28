// pages/myquery/myquery.js
var app = getApp();
var http = require('../../utils/http.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pay_date:'',
        jin_e: 0,
        pay_type: ['微信充值'],
        state: ['到账','未到账'],
        pay_id: '',
        queryList: [],
        userId:'',
        imgParking:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        wx.showLoading({
            title: '加载中',
        })
        var that = this;
        wx.getStorage({
            key: 'userID',
            success(res) {
                // console.log(res)
                that.setData({
                    userId: res.data + ""
                })
                wx.request({
                    url: http.reqUrl +'/query/Recharge',
                    data: {
                        id: that.data.userId
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'POST',
                    success: function (res) {
                        console.log(res.data.data)
                        let bill = res.data.data
                        bill.forEach(item => {
                            item.jin_e = (item.jin_e / 100).toFixed(2)
                        })
                        for(var i=0;i<bill.length;i++){
                            bill[i].pay_date = http.formatDatenew((bill[i].pay_date-0))
                        }
                        that.setData({
                            queryList:res.data.data
                        })
                        if (that.data.queryList.length!=0){
                            that.setData({
                                imgParking: true
                            })
                        }else{
                            that.setData({
                                imgParking: false
                            })
                        }
                        // console.log(that.data.imgParking)
                        wx.hideLoading();
                    }
                })
            }
        })
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
        var that = this;
        wx.getStorage({
            key: 'userID',
            success(res) {
                console.log(res)
                that.setData({
                    userId: res.data + ""
                })
                wx.request({
                    url: http.reqUrl +'/query/Recharge',
                    data: {
                        id: that.data.userId
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'POST',
                    success: function (res) {
                        console.log(res)
                        that.setData({
                            queryList: res.data.data
                        })
                        wx.hideLoading();
                    }
                })
            }
        })
    },
    goquery: function(){
        console.log(1)
        wx.navigateTo({
            url: '../mywallet/mywallet',
        })
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

    }
})