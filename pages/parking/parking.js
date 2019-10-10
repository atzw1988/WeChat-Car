var app = getApp();
var http = require('../../utils/http.js');
Page({
  data: {
      searchSongList: [], //放置返回数据的数组   
      imgParking: false, //无数据图片，默认false，隐藏  
      searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
      searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
      pakingList: [],   //放置返回数据 
      mobile: '',    //用户ID
      parkNum:0,   //停车次数
      car_list:[],
      index:0,
      sel_num:0,
      pageIndex:1,
      ps:10,
      status:2,
      my_car:'',
      searchLoading:false,
      searchLoadingComplete:true
  },
  onShareAppMessage: function () {
      return {
      title: '华腾智能停车',
      path: '/pages/index/index',
      }
  },
  onLoad: function(){
      wx.showShareMenu({
          withShareTicket: true
      });   
  },
  onShow: function () {
      // wx.showLoading({
      //     title: '加载中',
      // })
    wx.getStorage({
      key: 'nopay_car',
      success: () => {
        this.setData({
          status: 0
        })
      },
      complete: () => {
        wx.getStorage({
          key: 'index_to_pay',
          success: () => {
            this.setData({
              status: 0
            })
            this.get_car_list()
          },
          fail: () => {
            this.get_car_list()
          },
          complete: () => {}
        })
      }
    })
  },
  //清除从首页进入
  onUnload(){
    wx.removeStorage({
      key: 'index_to_pay'
    })
    wx.removeStorage({
      key: 'nopay_car'
    })
  },
  //获取车牌列表
  get_car_list(){
    wx.getStorage({
      key: 'mobile',
      success: (res) => {
        this.data.mobile = res.data
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
              let car_list = res.data.data.map(item => {
                return item.car_no
              })
              wx.getStorage({
                key: 'nopay_car',
                success: (res) => {
                  console.log(res)
                  let num = car_list.indexOf(res.data)
                  this.setData({
                    car_list: car_list,
                    index:num
                  })
                  this.data.my_car = res.data
                },
                fail: () => {
                  this.setData({
                    car_list: car_list,
                  })
                  this.data.my_car = car_list[0]
                },
                complete: () => {
                  this.get_order_list()
                }
              })
            } else {
              this.setData({
                imgParking: true
              })
            }
          }
        })
      }
    });
  },
  //车牌选择
  car_sel(e){
    this.setData({
      index: e.detail.value,
      my_car: this.data.car_list[e.detail.value]
    })
    this.get_order_list()
  },
  //获取停车记录
  get_order_list() {
    let params = {
      mobile: this.data.mobile,
      pageIndex: this.data.pageIndex,
      ps: this.data.ps,
      status: this.data.status,
      carNo: this.data.my_car
    }
    wx.request({
      url: http.reqUrl + '/carNo/order',
      data: params,
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: 'POST',
      success: res => {
        console.log(res)
        if(res.data.code == 0){
          if (res.data.data.tp > res.data.data.pc) {
            this.setData({
              searchLoading: true,
              searchLoadingComplete: false
            })
          } else {
            this.setData({
              searchLoading: false,
              searchLoadingComplete: true
            })
          }
          let time = res.data.data.data
          time.forEach(item => {
            item.parkstart_time = http.formatDatenew(item.parkstart_time)
            item.parking_name = item.parking_name.substr(0, 1)
            item.park_no = item.park_no.substr(0, 4)
            if (item.parkend_time) {
              item.parkend_time = http.formatDatenew(item.parkend_time)
            } else {
              item.parkend_time = '还未结束'
            }
            if (item.buy_time < 60) {
              item.buy_time = item.buy_time + '分钟'
            } else if (item.buy_time == 60) {
              item.buy_time = '1小时'
            } else {
              item.buy_time = Math.floor(item.buy_time / 60) + '小时' + item.buy_time % 60 + '分钟'
            }
          })
          this.setData({
            pakingList: time,
            imgParking:false
          })
        }else if (res.data.code == 707){
          this.setData({
            imgParking: true
          })
        }
        // wx.hideLoading()
        wx.stopPullDownRefresh()
      }
    })
  },
  //账单类型选择
  sel_kind(e){
    this.setData({
      status: e.currentTarget.id
    })
    this.get_order_list()
  },
  //下拉刷新
  onPullDownRefresh(){
    this.setData({
      ps: 10
    })
    this.get_order_list()
  },
  //上拉加载
  searchScrollLower(){
    if (this.data.searchLoading && !this.data.searchLoadingComplete){
      this.setData({
        ps: this.data.ps + 10
      })
      this.get_order_list()
    }
  },
  //跳转支付
  to_pay(e){
    // console.log(params)
    let num = e.currentTarget.id
    let order = this.data.pakingList[num]
    wx.setStorage({
      key: 'sel_order',
      data: order,
      success: () => {
        wx.navigateTo({
          url: '../orderpay/orderpay',
          success: (result) => {
            
          },
          fail: () => {},
          complete: () => {}
        });
          
      },
      fail: () => {},
      complete: () => {}
    })        
  }
}) 