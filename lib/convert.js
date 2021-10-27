const verify = require('./verify');

/**
 * 扩展toString
 * @param {*} obj
 * @returns
 */
 const toString = (obj) => {
    if (obj == void 0 || verify.isString(obj)) {
        return obj || '';
    } if (verify.isError(obj)) {
        return obj.stack || (obj.message || '');
    } else if (verify.isJsonOrJsonArray(obj)) {
        let r;
        try {
            r = JSON.stringify(obj);
        } catch (e) {
            r = obj.toString();
        }
        return r;
    }
    else if (verify.isArray(obj)) {
        return '[' + obj.join(',') + ']';
    }
    else if (verify.isDate(obj))
        return obj.format('yyyy-MM-dd hh:mm:ss');
    else {
        return obj.toString();
    }
}
exports.toString = toString;