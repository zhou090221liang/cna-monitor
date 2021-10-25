/**
 * 在数组的指定位置插入元素
 * @param {*} index 指定位置下标，默认第一位
 * @param {*} item 要插入的元素
 */
 Array.prototype.insert = function (item = undefined, index = 0) {
    this.splice(index > -1 ? index : 0, 0, item);
};

/**
 * 移除数组的某个元素
 * @param {*} index 要移除元素的下标
 */
Array.prototype.remove = function (index) {
    this.splice(index > -1 ? index : 0, 1);
};

/**
 * 移除数组的第一个元素
 */
Array.prototype.removeFirst = function () {
    this.splice(0, 1);
};

/**
 * 移除数组的最后一个元素
 */
Array.prototype.removeLast = function () {
    let index = this.length - 1;
    this.splice(index > -1 ? index : 0, 1);
};

/**
 * 是否每个元素都一样
 */
Array.prototype.isAllEqual = function () {
    const self = this;
    return !self.some(function (value, index) {
        return value !== self[0];
    });
};