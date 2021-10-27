// const comm = require('fa-comm');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const configFile = path.join(__dirname, '../config/config');
const emailFile = path.join(__dirname, '../config/email');
const keysFile = path.join(__dirname, '../config/keys');
const outFile = path.join(__dirname, '../out/result');
const cwd = path.join(__dirname, '../lib/main/');
const packageFile = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageFile));
const iconv = require('iconv-lite');
require('../lib/proto/string');
require('../lib/proto/array');
require('../lib/proto/date');
const readlineSync = require('readline-sync');
const defaultConfig = require('../default/config');
const log = require('./log');
const archiver = require('archiver');

/**
 * 将文件夹打包压缩成zip
 * @param {Array<String>} files 被打包的文件全路径
 * @param {String} filepath 被打包的文件夹
 * @param {String} filename 打包压缩后的文件名全路径,如:/xxx.zip
 * @returns
 */
function zip(filepath, filename) {
    return new Promise(function (resolve, reject) {
        let output = fs.createWriteStream(filename);
        let archive = archiver('zip', {
            zlib: { level: 9 }
        });
        output.on('close', function () {
            resolve();
        });
        archive.on('warning', function (err) {
            reject(err);
        });
        archive.on('error', function (err) {
            reject(err);
        });
        archive.pipe(output);
        archive.directory(filepath, false);
        archive.finalize();
    });
}
exports.zip = zip;

/** 
 * 获取本机IP(内网)地址
*/
function getLocalIp() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}
exports.getLocalIp = getLocalIp;

/** 
 * 递归删除文件夹
*/
var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse 
                deleteFolderRecursive(curPath);
            } else { // delete file 
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
exports.unlinkSync = exports.deleteFolderRecursive = deleteFolderRecursive;

/** 
 * 将字节大小转换成直观的单位显示
*/
const sizeFormat = (bytes, minKB = true) => {
    if (isNaN(bytes)) {
        return '';
    }
    var symbols = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var exp = Math.floor(Math.log(bytes) / Math.log(2));
    if (exp < 1) {
        exp = 0;
    }
    var i = Math.floor(exp / 10);
    if (i < symbols.length) {
        bytes = bytes / Math.pow(2, 10 * i);
        if (bytes.toString().length > bytes.toFixed(2).toString().length) {
            bytes = bytes.toFixed(2);
        }
        if (bytes >= 1000) {
            bytes = parseFloat(bytes / 1024).toFixed(2);
            i += 1;
        }
        if (i == 0 && minKB) {
            i += 1;
            bytes = parseFloat(bytes / 1024).toFixed(2);
            bytes = bytes != '0.00' ? bytes : '0.01';
        }
        return bytes + symbols[i];
    } else {
        i = symbols.length - 1;
        bytes = bytes / Math.pow(2, 10 * i);
        if (bytes.toString().length > bytes.toFixed(2).toString().length) {
            bytes = bytes.toFixed(2);
        }
        return bytes + symbols[i];
    }
}
exports.sizeFormat = sizeFormat;

const promisify = (fn, receiver) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn.apply(receiver, [...args, (err, res) => {
                return err ? reject(err) : resolve(res);
            }]);
        });
    };
};
exports.promisify = promisify;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
exports.sleep = sleep;

function getProcessPid(command) {
    const cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux'
    let tasklist = child_process.execSync(cmd);
    tasklist = iconv.decode(tasklist, "GBK").split('\n');
    let pids = [];
    for (let i = 0; i < tasklist.length; i++) {
        const p = tasklist[i].trim().split(/\s+/);
        const pname = p[process.platform == 'win32' ? 0 : p.length - 1];
        const pid = p[1];
        if (pname.toLowerCase().indexOf(command) >= 0 && parseInt(pid)) {
            pids.push(pid);
        }
    }
    return pids;
}
exports.getProcessPid = getProcessPid;

function convertArgs() {
    function getArgs(argArray) {
        const args = {};
        let lastKey = null;
        argArray.forEach(item => {
            if (/^-\w/g.test(item)) {
                lastKey = item.replace(/^-/g, '')
                args[lastKey] = true;
            } else if (lastKey) {
                args[lastKey] = item;
            }
        });
        return args;
    }
    const args = process.argv.splice(2);
    const debug = args.find(item => item === "-debug") ? true : false;
    if (args[0] == "help" || args[0] == "-h") {
        return { help: true, debug };
    } else if (args[0] == "version" || args[0] == "-v") {
        return { version: true, debug };
    } else if (args[0] == "logs") {
        return { logs: true, debug, ...getArgs(args) };
    } else if (args[0] == 'docker') {
        return { docker: true, debug };
    } else if (args[0] == "backup") {
        return { backup: true, debug, path: args[1], ...getArgs(args) };
    } else if (args[0] == "import") {
        return { import: true, debug, path: args[1], ...getArgs(args) };
    } else if (args[0] == 'config') {
        return { config: true, debug, ...getArgs(args) };
    } else if (args[0] == 'remove') {
        return { remove: true, debug };
    } else if (args[0] == 'email') {
        return { email: true, debug, ...getArgs(args) };
    } else if (args[0] == "init") {
        return { init: true, debug, ...getArgs(args) };
    } else if (args[0] == "keys") {
        return { keys: true, debug, ...getArgs(args) };
    } else if (args[0] == "restart") {
        return { restart: true, debug };
    } else if (args[0] == "start") {
        return { start: true, debug };
    } else if (args[0] == "stop") {
        return { stop: true, debug };
    } else if (args[0] == "status") {
        return { status: true, debug };
    } else if (args[0] == "add") {
        return { add: true, ip: args[1], debug, ...getArgs(args) };
    } else if (args[0] == "delete") {
        return { delete: true, ip: args[1], debug, ...getArgs(args) };
    } else if (args[0] == "list" || args[0] == "-l") {
        return { list: true, debug, ...getArgs(args) };
    } else {
        return { debug, ...getArgs(args) };
    }
} exports.convertArgs = convertArgs;

function init(args) {
    fs.writeFileSync(configFile, JSON.stringify({ t: args.t > 0 ? args.t : 1, p: args.p || 10, m: args.m || 1, n: args.n || "" }).encrypt());
    if (fs.existsSync(keysFile)) {
        fs.unlinkSync(keysFile);
    }
    if (fs.existsSync(outFile)) {
        fs.unlinkSync(outFile);
    }
}
exports.init = init;

/**
 * 检测是否有进程在运行
 * @returns
 */
function checkProcess() {
    let pids = [];
    const cnam = getProcessPid('cnam.js');
    const cna = getProcessPid('cna.js');
    if (cnam && cnam.length) {
        cnam && cnam.length && pids.push(...cnam);
    }
    if (cna && cna.length) {
        cna && cna.length && pids.push(...cna);
    }
    return pids.length ? pids : null;
}
exports.checkProcess = checkProcess;

function help(args) {
    console.group(`-------------- 网络可达性监控程序(V${packageJson.version}) -----------------`);

    console.info(`help\t显示帮助`);
    console.info(`-h\t显示帮助`);
    console.info('');

    console.info(`init\t初始化服务(停止并清空所有监控信息)`);
    console.info(`\t支持的参数：`);
    console.info(`\t\t-t 监控频率，单位分钟，默认1，如：cna-monitor init -t 1`);
    console.info(`\t\t-p 监控列表每次显示的数量，单位行，默认10，如：cna-monitor init -p 10`);
    console.info(`\t\t-m 监控结果保存的历史记录大小，不建议设置太大，单位MB，默认1，如：cna-monitor init -m 1`);
    console.info(`\t\t-n 监听到目标变化后，被通知的邮件地址，如果不需要通知请不要配置或配置为空`);
    console.info('');

    console.info(`add\t添加一个监听地址(可以是一个域名也可以是一个IP地址)，如：cna-monitor add 10.0.0.1`);
    console.info(`\t支持的参数：`);
    console.info(`\t\t-name\t监听别名，如：cna-monitor add 10.0.0.1 -name myName`);
    console.info('');

    console.info(`delete\t删除一个监听地址(可以是之前添加的域名或IP地址或别名)，如：cna-monitor delete 10.0.0.1`);
    console.info('');

    console.info(`keys\t显示目前监控的所有地址`);
    console.info(`\t支持的参数：`);
    console.info(`\t\t-p 显示的数量，单位行，默认10，如：cna-monitor keys -p 10`);
    console.info('');

    console.info(`list\t从近到远显示监控情况`);
    console.info(`\t支持的参数：`);
    console.info(`\t\t-p 显示的数量，单位行，默认10，如：cna-monitor list -p 10`);
    console.info(`\t\t-t 筛选某一个域名或IP地址或别名，如：cna-monitor list -t 10.0.0.1`);
    console.info(`\t\t-f 监控监听目标的状态变化且实时响应输出，目前使用-f参数不支持其他参数，如：cna-monitor list -f`);
    console.info('');

    console.info(`restart\t重启监控程序`);
    console.info('');

    console.info(`start\t启动监控程序`);
    console.info('');

    console.info(`stop\t停止监控程序`);
    console.info('');

    console.info(`status\t显示监控程序目前的状态`);
    console.info('');

    console.info(`version\t显示监控程序目前的状态`);
    console.info(`-v\t显示监控程序目前的状态`);
    console.info('');

    console.info(`backup\t备份当前配置，如：cna-monitor backup /cna/backup/`);
    console.info('');

    console.info(`import\t导入配置，如：cna-monitor import /cna/backup/backup_20211025.cna`);
    console.info('');

    console.info(`config\t更改配置信息`);
    console.info(`\t支持的参数：`);
    console.info(`\t\t-t 监控频率，单位分钟，默认1，如：cna-monitor config -t 1`);
    console.info(`\t\t-p 监控列表每次显示的数量，单位行，默认10，如：cna-monitor config -p 10`);
    console.info(`\t\t-m 监控结果保存的历史记录大小，不建议设置太大，单位MB，默认1，如：cna-monitor config -m 1`);
    console.info(`\t\t-n 监听到目标变化后，被通知的邮件地址，如果不需要通知请不要配置或配置为空`);
    console.info(`\t\t-l 显示目前的配置信息，如：cna-monitor config -l`);
    console.info('');

    console.info(`remove\t移除所有监听目标并停止服务，如：cna-monitor remove`);
    console.info('');

    console.info(`email\更改邮件服务器配置`);
    console.info(`\t支持的参数：`);
    console.info(`\t\t-l 显示当前配置信息`);
    console.info(`\t\t-clear 清空邮件服务器配置`);
    console.info(`\t\t-host 设定SMTP服务器`);
    console.info(`\t\t-port 设定SMTP服务器端口`);
    console.info(`\t\t-secure 设定是否SSL，true或者false`);
    console.info(`\t\t-user 设定账号`);
    console.info(`\t\t-pass 设定密码`);
    console.info('');

    if (args.debug) {
        console.info(`logs\查看日志信息`);
        console.info(`\t支持的参数：`);
        console.info(`\t\t-l 显示当前所有的日志文件`);
        console.info(`\t\t-clear 清空日志`);
        console.info(`\t\t-f 实时显示日志输出`);
        console.info(`\t\t-export 导出日志文件到指定的文件夹`);
        console.info(`\t\t-s 显示某个日志文件的内容`);
        console.info('');
    }

    console.groupEnd();
    console.info(`-------------- 网络可达性监控程序(V${packageJson.version}) -----------------`);
}
exports.help = help;

function version() {
    console.info(`当前版本：V${packageJson.version}`);
}
exports.version = version;

function start() {
    try {
        const pid = checkProcess();
        if (pid) {
            console.warn('监控程序已经在运行！');
            return;
        }
        child_process.exec("nohup node cnam.js &", {
            cwd
        });
        console.info('监控程序开始运行！');
    } catch (e) {
        log.error("启动失败", e);
    }
}
exports.start = start;

function stop() {
    try {
        const pid = checkProcess();
        if (!pid) {
            console.warn('监控程序未在运行！');
            return;
        }
        pid.forEach(item => child_process.exec(`kill -9 ${item}`));
        console.info('监控程序已经停止！');
    } catch (e) {
        log.error("停止失败", e);
    }
}
exports.stop = stop;

function status() {
    try {
        const pid = checkProcess();
        if (pid) {
            console.warn('监控程序正在运行！');
        } else {
            console.warn('监控程序未运行！');
        }
    } catch (e) {
        log.error("查看运行状态失败", e);
    }
}
exports.status = status;

function keys() {
    try {
        let keys = ["目标\t别名"];
        if (fs.existsSync(keysFile)) {
            const _keys = JSON.parse(fs.readFileSync(keysFile).toString().decrypt());
            _keys.forEach(item => keys.push(`${item.target}\t${item.alias}`));
        }
        return keys;
    } catch (e) {
        log.error("查看监听目标失败", e);
    }
}
exports.keys = keys;

/**
 * 添加一个监控
 * @param {*} target 需要监控的域名或IP
 * @param {string} [alias=""] 别名
 * @returns
 */
function add(target, alias = "") {
    try {
        if (!target || target == true) {
            throw new Error(`需要添加的地址不能未空`);
        }
        let keys = [];
        if (fs.existsSync(keysFile)) {
            keys = JSON.parse(fs.readFileSync(keysFile).toString().decrypt());
        }
        const k = keys.find(item => item.target == target);
        if (k) {
            throw new Error(`${target}已经存在${k.alias ? `(${k.alias})` : ""}`);
        }
        keys.push({
            target,
            alias
        });
        fs.writeFileSync(keysFile, JSON.stringify(keys).encrypt());
        return true;
    } catch (e) {
        log.error("添加监听目标失败", e);
        throw e;
    }
}
exports.add = add;

/**
 * 删除一个监控
 * @param {*} targetOrAlias 需要监控的域名或IP或别名
 * @returns
 */
function _delete(targetOrAlias = "") {
    try {
        // if (comm.typeof(targetOrAlias) == 'boolean' && targetOrAlias == true || !targetOrAlias) {
        if (!targetOrAlias) {
            throw new Error(`请输入需要移除的目标`);
        }
        if (fs.existsSync(keysFile)) {
            const keys = JSON.parse(fs.readFileSync(keysFile).toString().decrypt());
            if (keys && keys.length == 0) {
                throw new Error(`当前目标列表为空`);
            }
            let exists = false;
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].target == targetOrAlias || keys[i].alias == targetOrAlias) {
                    keys.remove(i);
                    exists = true;
                    break;
                }
            }
            if (exists) {
                fs.writeFileSync(keysFile, JSON.stringify(keys).encrypt());
                return true;
            }
            throw new Error(`需要移除的目标不存在`);
        } else {
            throw new Error(`当前目标列表为空`);
        }
    } catch (e) {
        log.error("删除监听目标失败", e);
        throw e;
    }
}
exports.delete = _delete;

function list() {
    try {
        let output = [];
        if (fs.existsSync(outFile)) {
            // output = JSON.parse(fs.readFileSync(outFile).toString().decrypt());
            let test = fs.readFileSync(outFile).toString().split('\r\n');
            test.forEach(item => {
                output.push(JSON.parse(item.decrypt()));
            });
        }
        return output;
    } catch (e) {
        log.error("查看目标状态列表失败", e);
    }
}
exports.list = list

function backup(args) {
    try {
        if (args.path == void 0) {
            console.info('请设定备份目录');
            return;
        }
        if (!fs.existsSync(args.path)) {
            mkdirSync(args.path);
            args.debug && console.info('备份目录不存在，创建目录：', args.path);
        }
        const _path = path.join(args.path, `./backup_${new Date().format('yyyyMMddhhmmssS')}.cna`);
        args.debug && console.info('备份文件保存位置：', _path);
        const bak = {
            backupid: 'cna-monitor',
            date: new Date().format('yyyy/MM/dd hh:mm:ss.S'),
            version: packageJson.version
        };
        args.debug && console.info('组装备份信息');
        if (fs.existsSync(keysFile)) {
            bak.keys = JSON.parse(fs.readFileSync(keysFile).toString().decrypt());
        }
        args.debug && console.info('组装备份信息:监控信息完成');
        if (fs.existsSync(configFile)) {
            bak.config = JSON.parse(fs.readFileSync(configFile).toString().decrypt());
        }
        args.debug && console.info('组装备份信息:配置信息完成');
        if (fs.existsSync(emailFile)) {
            bak.email = JSON.parse(fs.readFileSync(emailFile).toString().decrypt());
        }
        args.debug && console.info('组装备份信息:邮箱信息完成');
        fs.writeFileSync(_path, JSON.stringify(bak).encrypt());
        console.info('配置备份完成');
    } catch (e) {
        console.error(`配置备份失败`);
        args.debug && console.error(e);
        log.error("备份失败", e);
    }
}
exports.backup = backup;

function _import(args) {
    try {
        if (!fs.existsSync(args.path)) {
            console.error('备份文件不存在');
            return;
        }
        let text = fs.readFileSync(args.path).toString();
        text = text.decrypt();
        text = JSON.parse(text);
        if (!text.backupid) {
            console.error('备份文件错误');
            return;
        }
        // console.info(`该备份文件备份于：${text.date}`);
        let answer = readlineSync.question(`该备份文件备份于：${text.date}，继续将覆盖现有配置及监控目标等信息，请确认是否继续(y/n)？`);
        if (answer.toLowerCase() != 'y') {
            return;
        }
        if (packageJson.version != text.version) {
            answer = readlineSync.question(`备份文件版本(V${text.version})和当前版本不匹配，导入可能导致功能异常，请确认是否继续(y/n)？`);
            if (answer.toLowerCase() != 'y') {
                return;
            }
        }
        if (text.config) {
            console.info('还原配置信息');
            fs.writeFileSync(configFile, JSON.stringify(text.config).encrypt());
        }
        if (text.keys) {
            console.info('还原监控目标信息');
            fs.writeFileSync(keysFile, JSON.stringify(text.keys).encrypt());
        }
        if (text.email) {
            console.info('还原邮件服务器信息');
            fs.writeFileSync(emailFile, JSON.stringify(text.email).encrypt());
        }
        console.info('配置导入完成');
    } catch (e) {
        console.error(`配置导入失败`);
        args.debug && console.error(e);
        log.error('导入失败', e);
    }
}
exports.import = _import;

/**
 * 同步创建文件夹，可递归创建
 * @param {String} dir 需要创建的文件夹路径
 * @returns
 */
const mkdirSync = (dir) => {
    if (fs.existsSync(dir)) {
        return true;
    } else {
        if (mkdirSync(path.dirname(dir))) {
            fs.mkdirSync(dir);
            return true;
        }
    }
};
exports.mkdirSync = mkdirSync;

function config(args) {
    try {
        let _config;
        if (fs.existsSync(configFile)) {
            _config = JSON.parse(fs.readFileSync(configFile).toString().decrypt());
        } else {
            _config = defaultConfig;
        }
        if (args.l) {
            console.info(`监控频率：${_config.t}分钟`);
            console.info(`监控列表数量：${_config.p}行`);
            console.info(`监控保存容量：${_config.m}兆字节`);
            console.info(`监听变化后的通知邮箱：${_config.n}`);
        } else {
            if (args.t || args.p || args.m || args.n) {
                if (args.t && args.t > 0) {
                    _config.t = args.t;
                }
                if (args.p) {
                    _config.p = args.p;
                }
                if (args.m) {
                    _config.m = args.m;
                }
                if (args.n) {
                    _config.n = args.n;
                }
                fs.writeFileSync(configFile, JSON.stringify(_config).encrypt());
                console.info(`设置成功`);
            }
        }
    } catch (e) {
        log.error("配置失败", e);
    }
}
exports.config = config;

function email(args) {
    try {
        let emailConfig = {};
        if (fs.existsSync(emailFile)) {
            emailConfig = JSON.parse(fs.readFileSync(emailFile).toString().decrypt());
        }
        emailConfig.host = args.host || emailConfig.host || "";
        emailConfig.port = args.port || emailConfig.port || "25";
        emailConfig.secure = args.secure || emailConfig.secure || "false";
        emailConfig.user = args.user || emailConfig.user || "";
        emailConfig.pass = args.pass || emailConfig.pass || "";
        fs.writeFileSync(emailFile, JSON.stringify(emailConfig).encrypt());
    } catch (e) {
        log.error("设定邮箱SMTP失败", e);
    }
}
exports.email = email;