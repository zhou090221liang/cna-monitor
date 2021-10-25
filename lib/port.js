const http = require('http');
const net = require('net');

/**
 * 获取一个随机的未使用的端口号
 * @returns
 */
const getRandomUnUsePort = function () {
    return new Promise(function (resolve, reject) {
        const server = http.createServer();
        server.listen(0);
        server.on('listening', function () {
            var port = server.address().port;
            server.close(function () {
                resolve(port);
            });
        });
    });
}
exports.getRandomUnUsePort = getRandomUnUsePort;

/**
 * 检查端口是否已经被占用
 * @param {*} port
 * @returns
 */
 const checkPortIsUsed = function (port) {
    return new Promise(function (resolve, reject) {
        var server = net.createServer().listen(port)
        server.on('listening', function () { // 执行这块代码说明端口未被占用
            server.close() // 关闭服务
            resolve(false);
        });
        server.on('error', function (err) {
            if (err.code === 'EADDRINUSE') { // 端口已经被使用
                resolve(true);
            }
        })
    });
}
exports.checkPortIsUsed = checkPortIsUsed;