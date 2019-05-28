const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function objKeySort(obj) {//排序的函数
    var newkey = Object.keys(obj).sort();
    //先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
    var newObj = {};//创建一个新的对象，用于存放排好序的键值对
    for (var i = 0; i < newkey.length; i++) {//遍历newkey数组
        newObj[newkey[i]] = obj[newkey[i]];//向新创建的对象中按照排好的顺序依次增加键值对
    }
    return newObj;//返回排好序的新对象
}
function splicingString(obj) { //封装全局拼接微信支付验签字符串
    var str = '';
    var arr = Object.keys(obj);
    var j = arr.length;
    var k = 0;
    for (var i in obj) {
        k++;
        // console.log("aa.length::", j, k)
        if (j == k) {
            str += i + "=" + obj[i]
        } else {
            str += i + "=" + obj[i] + "&"
        }
        // console.log(i,'--',aa[i]);
    }
    return str;
    // console.log(str)
}
function getNum() { //随机生成32位随机数
    var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    var nums = "";
    for (var i = 0; i < 32; i++) {
        var id = parseInt(Math.random() * 61);
        nums += chars[id];
    }
    return nums;
}
module.exports = {
    formatTime: formatTime,
    // Bytes2Str: Bytes2Str,
    // Str2Bytes: Str2Bytes,
    encryption: encryption,
    getNum: getNum,
    objKeySort: objKeySort,
    sort_ASCII: sort_ASCII,
    splicingString: splicingString,
}