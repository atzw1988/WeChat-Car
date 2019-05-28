// pages/cardpay/cardpay.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        car_no:'',
        park_name:'',
        park_no:'',
        card_kind:[
            {id:1,name:'月卡',price:100,num:1,checked:false},
            {id:3,name:'季卡',price:100,num: 3,checked: true},
            {id:6,name:'半年卡',price:100,num: 6,checked: false},
            {id:12,name:'年卡',price:100,num: 12,checked: false},
            {id:24,name:'两年卡',price:100,num:24,checked:false} 
        ],
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
                        console.log(res)
                        if (res.data.success){
                            
                            res.data.data.forEach(item => {
                                item.checked = false
                            })
                            res.data.data[1].checked = true
                            this.setData({
                                card_kind: res.data.data
                            }) 
                            this.data.sel_card_kind = this.data.card_kind[1]
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
        wx.navigateTo({
            url: '../selcar/selcar',
        })       
    },
    to_sel_park(){
        wx.navigateTo({
            url: '../selpark/selpark',
        })
    }
})