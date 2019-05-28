var app = getApp();
var http = require('../../utils/http.js');
Page({
    data: {
        searchSongList: [], //放置返回数据的数组  
        isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组  
        searchPageNum: 1,   // 设置加载的第几次，默认是第一次  
        itemPage: 0,      //返回数据的页面数  
        imgParking: false, //无数据图片，默认false，隐藏  
        searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
        searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
        pakingList: [],   //放置返回数据 
        userId: '',    //用户ID
        parkNum:0   //停车次数
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
                    url: http.reqUrl+'/query/parkOrde',
                    data: {
                        userId: that.data.userId
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    method: 'POST',
                    success: function (res) {
                        console.log(res)
                        if(res.data.data!=null){
                            let length = res.data.data.length
                            let time = res.data.data
                            for (var i = 0; i < length; i++) {
                                time[i].parkstart_time = http.formatDatenew(time[i].parkstart_time)
                                if (time[i].parkend_time) {
                                    time[i].parkend_time = http.formatDatenew(time[i].parkend_time)
                                } else {
                                    time[i].parkend_time = '还未结束'
                                }
                                if (time[i].pay_type == 1) {
                                    time[i].pay_type = "已支付"
                                } else if (time[i].charge_money == 0){
                                    time[i].pay_type = "已支付"
                                } else {
                                    time[i].pay_type = "未支付"
                                }
                            }
                            that.setData({
                                pakingList: res.data.data
                            })
                        }                       
                        //根据返回的对象是否为空控制显示
                        // console.log(that.data.pakingList.length)
                        // console.log(that.data.pakingList==0)
                        if(that.data.pakingList==0){
                            that.setData({
                                imgParking:true
                            })
                            wx.setStorage({
                                key: 'parkNum',
                                data: that.data.parkNum,
                            })
                        }else{
                            that.setData({
                                imgParking: false
                            })
                            wx.setStorage({
                                key: 'parkNum',
                                data: that.data.pakingList.length,
                            })
                        }
                        wx.hideLoading();
                    }
                })
            }
        })
    },
    timeConversion: function(time){
        var today = new Date(parseInt(time));
        var year = today.getFullYear();
        var month = today.getMonth() + 1;
        var day = today.getDate();
        var hours = today.getHours();
        var minutes = today.getMinutes();
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        return year + '-' + month + '-' + day  + ' ' + hours + ':' + minutes;
    },
  timeLong: function (resultTime){
    var m = parseInt(resultTime / 60000);
    if (m <= 60) {
      return m
    }
    if (m > 60) {
      var h = parseInt(m / 60);
      var m1 = m - (h * 60);
      if(m1 == 0){
        var result = h + '小时';
      }else{
        var result = h + '小时' + m1 + '分';
      }
      return result;
    }
  },
  //访问网络  
  fetchSearchList: function () {
    let that = this;
    let searchPageNum = that.data.searchPageNum;//把第几次加载次数作为参数  
    //访问网络  

    var oData = {
      pageIndex: searchPageNum,
      id: that.data.userID,
      sign: 1
    }
    app.func.req('/appuser/parkrecord', oData, function (res) {
        console.log(res)
      let searchList = [];
      if (res.map.length > 0){
        res.map.map(function (item) { 
          var parkTime = item.park_time;
          var oLong = parseInt(item.park_end_time) - parseInt(parkTime)
          item.park_end_time = that.timeLong(oLong);
          item.park_time = that.timeConversion(item.park_time);
          item.orderMoney = parseInt(item.orderMoney) / 100
          return item; 
        });

        searchList = res.map
        that.data.searchSongList.concat(searchList);
        that.setData({
          itemPage: res.tp,
          searchSongList: that.data.searchSongList.concat(searchList) //获取数据数组  
        });
        if (res.tp == 1) {
          that.setData({
            searchLoadingComplete: true, //把“没有数据”设为true，显示  
            searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
          });
        }else {
          that.setData({
            searchLoading: true  //把"上拉加载"的变量设为false，隐藏  
          });
        }
      }else {
        that.setData({
          imgParking: true,
          searchLoadingComplete: false, //把“没有数据”设为true，显示  
          searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
        });
      }
    })
  },
  //滚动到底部触发事件  
  searchScrollLower: function () {
    let that = this;
    if (that.data.searchPageNum < parseInt(that.data.itemPage)){
      if (that.data.searchLoading && !that.data.searchLoadingComplete) {
        that.setData({
          searchPageNum: that.data.searchPageNum + 1,  //每次触发上拉事件，把searchPageNum+1  
          isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
        });
        that.fetchSearchList();
      }
    }else{
      that.setData({
        searchLoadingComplete: true, //把“没有数据”设为true，显示  
        searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
      });
    }
  }
}) 