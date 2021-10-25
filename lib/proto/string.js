const _crypto = require('crypto');
const _random = require('../random');

/**
 * 格式化字符串
 * 例:var str = "您的订单{0}已经提交成功，预计{1}送达";str = str.format("20150616001","06月20日");
 * @param {*} args 多个需要格式化的参数值
 * @returns
 */
String.prototype.format = String.prototype.Format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

/**
 * 原型函数 获取字符串字节长度
 * @returns
 */
String.prototype.getByteLength = function (version = 1) {
    return version === 1 ? this.replace(/[^\x00-\xff]/g, "**").length : Buffer.from(this).length;
}

/**
 * 原型函数 去除前后空格
 * @returns
 */
String.prototype.trim = String.prototype.Trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

/**
 * 原型函数 去除前面的空格
 * @returns
 */
String.prototype.ltrim = String.prototype.Ltrim = String.prototype.LTrim = function () {
    return this.replace(/(^\s*)/g, "");
}

/**
 * 原型函数 去除后面的空格
 * @returns
 */
String.prototype.rtrim = String.prototype.Rtrim = String.prototype.RTrim = function () {
    return this.replace(/(\s*$)/g, "");
}

/**
 * 原型函数 字符串结尾是否包含指定字符串
 * @param {*} str
 * @returns
 */
String.prototype.endWith = String.prototype.EndWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substring(this.length - str.length) == str)
        return true;
    else
        return false;
}

/**
 * 原型函数 字符串开头是否包含指定字符串
 * @param {*} str
 * @returns
 */
String.prototype.startWith = String.prototype.StartWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substr(0, str.length) == str)
        return true;
    else
        return false;
}

/**
 * 是否中国手机号码
 * @returns
 */
String.prototype.isChineseCellphone = function () {
    var reg = /^0?1[3|4|5|7|8|9][0-9]\d{8}$/;
    if (reg.test(this)) {
        return true;
    } else {
        return false;
    }
}

/**
 * 是否邮箱地址
 * @returns
 */
String.prototype.isEmailAddress = function () {
    let pattern = /^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
    if (!pattern.test(this)) {
        return false;
    }
    return true;
}

/**
 * 是否QQ号码
 * @returns
 */
String.prototype.isQqNumber = function () {
    let pattern = /^[0-9]{5,10}$/;
    if (!pattern.test(this)) {
        return false;
    }
    return true;
}

/**
 * 是否MD5
 * @returns
 */
String.prototype.isMd5 = function () {
    let pattern1 = /^([a-fA-F0-9]{32})$/;
    let pattern2 = /^([a-fA-F0-9]{16})$/;
    if (!pattern1.test(this) && !pattern2.test(this)) {
        return false;
    }
    return true;
}

/**
 * 是否URL
 * @returns
 */
String.prototype.isUrl = function () {
    let reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
    if (reg.test(this))
        return true;
    return false;
}

/**
 * 是否Guid
 * @returns
 */
String.prototype.isGuid = function () {
    let reg = /^[0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}$/;
    if (reg.test(this))
        return true;
    reg = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    if (reg.test(this))
        return true;
    reg = /^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/;
    if (reg.test(this))
        return true;
    return false;
};

/**
 * 转Base64
 * @returns
 */
String.prototype.toBase64 = function () {
    // return new Buffer(this).toString('base64');
    return Buffer.from(this.toString()).toString('base64');
};

/**
 * 解Base64
 * @returns
 */
String.prototype.fromBase64 = function () {
    // return new Buffer(this, 'base64').toString();
    return new Buffer.from(this.toString(), 'base64').toString();
};

/**
 * GBK转UTF8
 * @returns
 */
String.prototype.fromGbk = function () {
    return unescape(this.replace(/&#x/g, '%u').replace(/;/g, ''));
};

/**
 * 标准日志输出
 * @param {*} pid
 * @returns
 */
String.prototype.toLog = function (pid) {
    pid = pid || process.pid;
    pid = '0x000' + (pid * pid).toString(16).toUpperCase();
    return `[LOG]\t${new Date().format('yyyy-MM-dd hh:mm:ss')}\t${pid}\t${this.toString()}`;
};

/**
 * 标准消息输出
 * @param {*} pid
 * @returns
 */
String.prototype.toInfo = function (pid) {
    pid = pid || process.pid;
    pid = '0x000' + (pid * pid).toString(16).toUpperCase();
    return `[INFO]\t${new Date().format('yyyy-MM-dd hh:mm:ss')}\t${pid}\t${this.toString()}`;
};

/**
 * 标准警告输出
 * @param {*} pid
 * @returns
 */
String.prototype.toWarn = function (pid) {
    pid = pid || process.pid;
    pid = '0x000' + (pid * pid).toString(16).toUpperCase();
    return `[WARN]\t${new Date().format('yyyy-MM-dd hh:mm:ss')}\t${pid}\t${this.toString()}`;
};

/**
 * 标准错误输出
 * @param {*} pid
 * @returns
 */
String.prototype.toError = function (pid) {
    pid = pid || process.pid;
    pid = '0x000' + (pid * pid).toString(16).toUpperCase();
    return `[ERROR]\t${new Date().format('yyyy-MM-dd hh:mm:ss')}\t${pid}\t${this.toString()}`;
};

/**
 * 下划线转换驼峰
 * @returns
 */
String.prototype.toHump = function () {
    return this.replace(/\_(\w)/g, function (all, letter) {
        return letter.toUpperCase();
    });
};

/**
 * 驼峰转换下划线
 * @returns
 */
String.prototype.toLine = function () {
    return this.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**
 * SHA1加密
 * @returns
 */
String.prototype.sha1 = String.prototype.toSha1 = function () {
    let msg = this.toString();
    var md5sum = _crypto.createHash('sha1');
    md5sum.update(msg);
    msg = md5sum.digest('hex');
    return msg;
}

/**
 * MD5加密
 * @param {String} str 要加密的数据
 */
String.prototype.md5 = String.prototype.toMd5 = function () {
    str = this.toString();
    var md5sum = _crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}

/**
 * AES加密
 * @param {String} password 8位小写英文字母密钥
 */
String.prototype.aes = String.prototype.toAes = function (password = "aespasswd") {
    data = this.toString();
    //防止中文加密后解密乱码 先将中文编码后进行加密
    //data = encodeURIComponent(encodeURIComponent(encodeURIComponent(data)));
    data = encodeURIComponent(data);
    //md5加密Password，生成key
    var m = _crypto.createHash('md5');
    m.update(password)
    var key = m.digest('hex');
    //生成iv
    m = _crypto.createHash('md5');
    m.update(password + key)
    var iv = m.digest('hex').slice(0, 16);
    //utf8格式化需要加密的明文
    // data = new Buffer(data, 'utf8').toString('binary');
    data = Buffer.from(data, 'utf8').toString('binary');
    //生成aes-256-cbc模式
    var cipher = _crypto.createCipheriv('aes-256-cbc', key, iv);
    var encrypted;
    encrypted = cipher.update(data, 'utf8', 'binary') + cipher.final('binary');
    //Base64编码
    // var encoded = new Buffer(encrypted, 'binary').toString('base64');
    var encoded = Buffer.from(encrypted, 'binary').toString('base64');
    return encoded;
}

/**
 * AES解密
 * @param {String} password 8位小写英文字母密钥
 */
String.prototype.fromAes = function (password = "aespasswd") {
    try {
        data = this.toString().replace(/\-/g, '+').replace(/_/g, '/');
        var edata = Buffer.from(data, 'base64').toString('binary');
        // Create key from password
        var m = _crypto.createHash('md5');
        m.update(password)
        var key = m.digest('hex');
        m = _crypto.createHash('md5');
        m.update(password + key);
        var iv = m.digest('hex');
        var decipher = _crypto.createDecipheriv('aes-256-cbc', key, iv.slice(0, 16));
        var decrypted, plaintext;
        plaintext = (decipher.update(edata, 'binary', 'utf8') + decipher.final('utf8'));
        //解码返回
        //plaintext = decodeURIComponent(decodeURIComponent(decodeURIComponent(plaintext)));
        plaintext = decodeURIComponent(plaintext);
        return plaintext;
    } catch (ex) {
        return "";
    }
}

/**
 * 字符串加密（加密后的结果集只能用String原型函数decrypt进行解密）
 * @returns
 */
String.prototype.encrypt = function () {
    //获得随机8位密码
    const password = _random.getRandomStr(8, 'qwertyuiopasdfghjklzxcvbnm');
    //用这个随机密码加密
    let encoded = this.toString().aes(password);
    //进行encodeURIComponent
    encoded = encodeURIComponent(encoded);
    //将密码拼接在结果前面
    encoded = password + encoded;
    //用encryptp这个固定密码再次加密
    encoded = encoded.aes('encryptp');
    //进行encodeURIComponent
    encoded = encodeURIComponent(encoded);
    //返回加密结果
    return encoded;
}

/**
 * 字符串解密（只能解通过String原型函数encrypt生成的结果集）
 * @returns
 */
String.prototype.decrypt = function () {
    //进行decodeURIComponent
    let decoded = decodeURIComponent(this.toString());
    //用encryptp这个固定密码解密
    decoded = decoded.fromAes('encryptp');
    //解析前面的8位随机密码
    const password = decoded.substr(0, 8);
    //得到真正的加密字符串
    decoded = decoded.substr(8);
    //进行decodeURIComponent
    decoded = decodeURIComponent(decoded);
    //用随机密码进行解密
    decoded = decoded.fromAes(password);
    //返回结果
    return decoded;
}