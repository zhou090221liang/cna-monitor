require('./proto/string');
require('./proto/date');
require('./proto/array');

/**
 * 是否JSON对象
 * @returns
 */
const isJson = (json) => {
    return typeof (json) == "object" && Object.prototype.toString.call(json).toLowerCase() == "[object object]" && !json.length;
};
exports.isJson = isJson;

/**
 * 是否数组对象
 * @returns
 */
const isArray = (obj) => {
    return obj instanceof Array;
};
exports.isArray = isArray;

/**
 * 是否JSON对象数组
 * @returns
 */
const isJsonArray = (obj) => {
    if (isArray(obj)) {
        for (let o of obj) {
            if (!isJson(o) && !isJsonArray(o)) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
};
exports.isJsonArray = isJsonArray;

/** 
 * 是否JSON对象或JSON对象数组
 * @returns
*/
const isJsonOrJsonArray = (obj) => {
    return isJson(obj) || isJsonArray(obj);
};
exports.isJsonOrJsonArray = isJsonOrJsonArray;

/**
 * 是否Object对象
 * @returns
 */
const isObject = (obj) => {
    return obj instanceof Object;
};
exports.isObject = isObject;

/**
 * 是否是Error对象
 * @returns
 */
const isError = (obj) => {
    return obj instanceof Error;
};
exports.isError = isError;

/**
 * 是否是字符串
 * @returns
 */
const isString = (obj) => {
    return typeof obj == 'string';
};
exports.isString = isString;

/**
 * 是否是数字
 * @returns
 */
const isNumber = (obj) => {
    return !isNaN(obj.toString());
};
exports.isNumber = isNumber;

/**
 * 是否Date类型
 * @returns
 */
const isDate = (obj) => {
    return obj instanceof Date;
};
exports.isDate = isDate;