var rootDocment = 'https://www.lcgxlm.com/its/wechat';
// var rootDocment = 'http://192.168.1.104:13259/its/wechat';
var rootDocment1 = 'https://www.lcgxlm.com/its/wechat';
// var rootDocment1 = 'http://192.168.1.104:13259/its/wechat';
function req(url, data, cb) {
    wx.request({
        url: 'https://www.lcgxlm.com/its/wechat' + url,
        // url: 'http://192.168.1.104:13259/its/wechat' + url,
        data: data,
        // method: 'POST',
        header: { 'content-type': 'application/json'},
            success: function (res) {
            return typeof cb == "function" && cb(res.data)
        },
            fail: function () {
            return typeof cb == "function" && cb(false)
        }
    })
}
function js_date_time(unixtime) {
    var dateTime = new Date(parseInt(unixtime) / 1000)
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth() + 1;
    var day = dateTime.getDate();
    var hour = dateTime.getHours();
    var minute = dateTime.getMinutes();
    var second = dateTime.getSeconds();
    var now = new Date();
    var now_new = Date.parse(now.toDateString());  //typescript转换写法
    var milliseconds = now_new - dateTime;
    var timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    return timeSpanStr;
}
function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}
function formatDate(inputTime) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    // return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    return {
        'year':y,
        'month':m,
        'day':d,
        'hours':h,
        'minutes': minute,
        'second': second
    }
}
function formatDatenew(inputTime) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
}
module.exports = {
    req: req,
    reqUrl: rootDocment,
    reqUrl1: rootDocment1,
    js_date_time: js_date_time,
    formatTime: formatTime,
    formatDate: formatDate,
    formatDatenew: formatDatenew
}
