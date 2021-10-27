require('./proto/string');
require('./proto/date');
require('./proto/array');
const verify = require('./verify');

function _typeof(obj, detailed = false) {
    let class2type = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regexp',
        '[object Object]': 'object',
        '[object Error]': 'error'
    };
    let toString = class2type.toString;
    // 若传入的是null或undefined，则直接返回这个对象的字符串
    // 即若传入的对象obj是undefined，则返回"undefined"
    if (obj == null) {
        return obj + "";
    }
    // Support: Android<4.0, iOS<6 (functionish RegExp)
    // 低版本regExp返回function类型；高版本已修正，返回object类型
    // 若使用typeof检测出的obj类型是object或function，则返回class2type的值，否则返回typeof检测的类型
    if (typeof obj == 'number') {
        /**
         * 关于JavaScript如何判断数字是float还是integer
         * 方法1：使用parseInt后判断，或者使用Math.ceil  Math.floot
         *      var a = 1.3; alert(a != parseInt(a));
         * 方法2：使用了~运算符，这个运算符作用就是 把后面是数字 取反减一并忽略小数部分
         *      var a =3.2; console.log(~3.2);//输出-4复制代码
         *      console.log(~~a==a);//两个就是运算两次，输出如果是int类型 肯定不受影响
         * 方法3：用%1，任何int%1 都是0，而float%1 就不等于0；
         *      var a = 3.2;consol.log(a%1 !=0)//返回true 说明是float类型复制代码
         * 方法4：利用隐式转换 如果int加 string类型的小数 依然会隐式转换成number类型。
         * 而由于小数自身有一个点，再加一个string类型的小数，则会返回一个真正的string。
         *      var a = 2;console.log(a+".3");//返回2.3  number
         *      var a = 2.3;console.log(a+".3");//返回2.3.3  string
         */
        return detailed ? `number<${(obj % 1 != 0) ? "float" : "integer"}>` : "number";
    }
    if (typeof obj === "object") {
        const type = (class2type[toString.call(obj)] || "object");
        if (type == 'array') {
            if (!detailed) {
                return 'array';
            }
            if (verify.isJsonArray(obj)) {
                return 'array<json>';
            }
            let T = [];
            for (const arr of obj) {
                const _t = _typeof(arr);
                T.push(_t.indexOf('number<') == 0 ? 'number' : _t);
            }
            return T.isAllEqual() ? `array<${T[0]}>` : 'array';
        }
        if (verify.isJson(obj)) {
            return 'json';
        }
        return type;
    }
    return typeof obj;
}

module.exports = _typeof;