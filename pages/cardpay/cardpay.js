// pages/cardpay/cardpay.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        car_no:'',
        park_name:'',
        park_no:'',
        card_kind:[],
        sel_card_kind:{},
        pay_checked:true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        wx.getStorage({
            key: 'card_car_no',
            success: res => {
                this.setData({
                    car_no:res.data
                })
            }
        })
        wx.getStorage({
            key: 'card_park_name',
            success: res => {
                this.setData({
                    park_name: res.data
                })
            }
        })
        wx.getStorage({
            key: 'card_park_no',
            success: res => {
                this.setData({
                    park_no: res.data
                })
                wx.request({
                    url: 'http://192.168.0.121:13259/its/app/cards/types/' + res.data,
                    data:{
                        parkNo:res.data
                    },
                    method:'GET',
                    success: res => {
                        if (res.data.success){
                            res.data.data.forEach(item => {
                                item.checked = false
                            })
                            if(res.data.data.length > 1){
                                res.data.data[1].checked = true
                                this.data.sel_card_kind = res.data.data[1]
                            }else{
                                res.data.data[0].checked = true
                                this.data.sel_card_kind = res.data.data[0]
                            }
                            this.setData({
                                card_kind: res.data.data
                            }) 
                        }
                    }
                })
            }
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    use_money(){
        this.setData({
            pay_checked:false
        })
    },
    use_wx(){
        this.setData({
            pay_checked:true
        })
    },
    sel_card(e){
        let num = e.currentTarget.id
        this.data.card_kind.forEach(element => {
            element.checked = false
        })
        this.data.card_kind[num].checked = true
        let data = this.data.card_kind
        this.setData({
            card_kind:data,
            sel_card_kind:data[num]
        })
    },
    gopay(){
        if (this.data.pay_checked){
            console.log('微信支付')
        }else{
            console.log('余额支付')
        }
    },
    to_sel_car(){
        wx.redirectTo({
            url: '../selcar/selcar',
        })       
    },
    to_sel_park(){
        wx.redirectTo({
            url: '../selpark/selpark',
        })
    }
})