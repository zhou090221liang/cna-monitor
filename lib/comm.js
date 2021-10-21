const comm = require('fa-comm');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const configFile = path.join(__dirname, '../config/config');
const keysFile = path.join(__dirname, '../config/keys');
const outFile = path.join(__dirname, '../out/result');
const cwd = path.join(__dirname, '../lib/main/');
const packageFile = path.join(__dirname, '../package.json');

function init(args) {
    fs.writeFileSync(configFile, JSON.stringify({ t: args.t || 1, p: args.p || 10, m: args.m || 1 }).encrypt());
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
    const cnam = comm.process.getProcessPid('cnam.js');
    const cna = comm.process.getProcessPid('cna.js');
    if (cnam && cnam.length) {
        cnam && cnam.length && pids.push(...cnam);
    }
    if (cna && cna.length) {
        cna && cna.length && pids.push(...cna);
    }
    return pids.length ? pids : null;
}
exports.checkProcess = checkProcess;

function help() {
    const packageJson = JSON.parse(fs.readFileSync(packageFile));
    console.group(`-------------- 网络可达性监控程序(V${packageJson.version}) -----------------`);

    console.info(`-help\t显示帮助`);
    console.info('');

    console.info(`-init\t初始化服务(停止并清空所有监控信息)`);
    console.info(`\t支持的参数：`);
    console.info(`\t\t-t 监控频率，单位分钟，默认1，如：cna-monitor -init -t 1`);
    console.info(`\t\t-p 监控列表每次显示的数量，单位行，默认10，如：cna-monitor -init -p 10`);
    console.info(`\t\t-m 监控结果保存的历史记录大小，不建议设置太大，单位MB，默认1，如：cna-monitor -init -m 1`);
    console.info('');

    console.info(`-add\t添加一个监听地址(可以是一个域名也可以是一个IP地址)，如：cna-monitor -add 10.0.0.1`);
    console.info(`\t支持的参数：`);
    console.info(`\t\t-name\t监听别名，如：cna-monitor -add 10.0.0.1 -name myName`);
    console.info('');

    console.info(`-delete\t删除一个监听地址(可以是之前添加的域名或IP地址或别名)，如：cna-monitor -delete 10.0.0.1`);
    console.info('');

    console.info(`-keys\t显示目前监控的所有地址`);
    console.info(`\t支持的参数：`);
    console.info(`\t\t-p 显示的数量，单位行，默认10，如：cna-monitor -keys -p 10`);
    console.info('');

    console.info(`-list\t从近到远显示监控情况`);
    console.info(`\t支持的参数：`);
    console.info(`\t\t-p 显示的数量，单位行，默认10，如：cna-monitor -list -p 10`);
    console.info(`\t\t-t 筛选某一个域名或IP地址或别名，如：cna-monitor -list -t 10.0.0.1`);
    console.info('');

    console.info(`-restart\t重启监控程序`);
    console.info('');

    console.info(`-start\t启动监控程序`);
    console.info('');

    console.info(`-stop\t停止监控程序`);
    console.info('');

    console.info(`-status\t显示监控程序目前的状态`);

    console.groupEnd();
    console.info(`-------------- 网络可达性监控程序(V${packageJson.version}) -----------------`);
}
exports.help = help;

function start() {
    const pid = checkProcess();
    if (pid) {
        console.warn('监控程序已经在运行！');
        return;
    }
    child_process.exec("nohup node cnam.js &", {
        cwd
    });
    console.info('监控程序开始运行！');
}
exports.start = start;

function stop() {
    const pid = checkProcess();
    if (!pid) {
        console.warn('监控程序未在运行！');
        return;
    }
    pid.forEach(item => child_process.exec(`kill -9 ${item}`));
    console.info('监控程序已经停止！');
}
exports.stop = stop;

function status() {
    const pid = checkProcess();
    if (pid) {
        console.warn('监控程序正在运行！');
    } else {
        console.warn('监控程序未运行！');
    }
}
exports.status = status;

function keys() {
    let keys = ["目标\t别名"];
    if (fs.existsSync(keysFile)) {
        const _keys = JSON.parse(fs.readFileSync(keysFile).toString().decrypt());
        _keys.forEach(item => keys.push(`${item.target}\t${item.alias}`));
    }
    return keys;
}
exports.keys = keys;

/**
 * 添加一个监控
 * @param {*} target 需要监控的域名或IP
 * @param {string} [alias=""] 别名
 * @returns
 */
function add(target, alias = "") {
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
}
exports.add = add;

/**
 * 删除一个监控
 * @param {*} targetOrAlias 需要监控的域名或IP或别名
 * @returns
 */
function _delete(targetOrAlias = "") {
    if (comm.typeof(targetOrAlias) == 'boolean' && targetOrAlias == true || !targetOrAlias) {
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
}
exports.delete = _delete;

function list() {
    let output = [];
    if (fs.existsSync(outFile)) {
        output = JSON.parse(fs.readFileSync(outFile).toString().decrypt());
    }
    return output;
}
exports.list = list