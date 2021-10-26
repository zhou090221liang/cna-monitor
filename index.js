#!/usr/bin/env node

const readlineSync = require('readline-sync');
const fs = require('fs');
const _comm = require('./lib/comm');
const path = require('path');
const configFile = path.join(__dirname, './config/config');
const portFile = path.join(__dirname, './config/port');
const args = _comm.convertArgs();
const defaultConfig = require('./default/config');
args.debug && console.log("目前运行目录：", path.join(__dirname, './'));
args.debug && console.log("输入参数：", args);
require('./lib/proto/string');
let config;
if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile).toString().decrypt());
} else {
    config = defaultConfig;
}
args.debug && console.log("配置信息：", config);


if (args.help) {
    _comm.help();
}

else if (args.version) {
    _comm.version();
}

else if (args.docker) {
    const portHelp = require('./lib/port');
    if (!fs.existsSync(portFile)) {
        portHelp.getRandomUnUsePort().then(function (port) {
            fs.writeFileSync(portFile, port.toString().encrypt());
            createListen(port);
        });
    } else {
        const port = parseInt(fs.readFileSync(portFile).toString().decrypt());
        portHelp.checkPortIsUsed(port).then(function (isUsed) {
            if (!isUsed) {
                createListen(port);
            }
        });
    }
}

else if (args.backup) {
    _comm.backup(args);
}

else if (args.import) {
    _comm.import(args);
}

else if (args.config) {
    _comm.config(args);
}

else if (args.init) {
    const pid = _comm.checkProcess();
    let answer;
    if (pid) {
        answer = readlineSync.question(`监控程序正在运行，初始化会停止并清空所有记录，是否继续(y/n)？`);
    } else {
        answer = readlineSync.question(`初始化会清空所有记录，是否继续(y/n)？`);
    }
    if (answer.toLowerCase() == 'y') {
        console.info("开始执行初始化...");
        _comm.init(args);
        console.info("初始化完成");
    }
}

else if (args.keys) {
    const keys = _comm.keys();
    for (const k of keys) {
        console.info(k);
    }
}

else if (args.restart) {
    _comm.stop();
    _comm.start();
    console.info(`监控程序重启完成！`);
    process.exit(1);
}

else if (args.start) {
    _comm.start();
    process.exit(1);
}

else if (args.stop) {
    _comm.stop();
}

else if (args.status) {
    _comm.status();
}

else if (args.add) {
    try {
        _comm.add(args.ip || "", args.name || "");
        const answer = readlineSync.question(`添加【目标：${args.ip || ""}${args.name ? `(别名：${args.name})` : ""}】成功,是否重启监控程序(y/n)？`);
        if (answer.toLowerCase() == 'y') {
            _comm.stop();
            _comm.start();
            console.info(`监控程序重启完成！`);
            process.exit(1);
        }
    } catch (e) {
        console.warn('添加失败：', e.message);
    }
}

else if (args.delete) {
    try {
        _comm.delete(args.ip || "");
        const answer = readlineSync.question(`删除【目标：${args.ip || ""}】成功，是否重启监控程序(y/n)？`);
        if (answer.toLowerCase() == 'y') {
            _comm.stop();
            _comm.start();
            console.info(`监控程序重启完成！`);
            process.exit(1);
        }
    } catch (e) {
        console.warn('删除失败：', e.message);
    }
}

else if (args.list) {
    console.info("时间\t目标\t别名\t状态\t输出");
    let result = _comm.list();
    if (args.t) {
        result = result.filter(item => item.target == args.t || item.alias == args.t);
    }
    let pageIndex = 1, startIndex = 0, endIndex = 0;
    let pageSize = args.p || config.p || 10;
    if (result.length <= pageSize) {
        for (const r of result) {
            console.info(`${r.time}\t${r.target}\t${r.alias}\t${r.status}\t${r.message || ""}`);
        }
    } else {
        let totalPage = parseInt(result.length / pageSize);
        if (result.length % pageSize) {
            totalPage++;
        }
        let isEnd = show(result, pageIndex, pageSize);
        while (!isEnd) {
            readlineSync.question(` ---------- MORE (${pageIndex}/${totalPage}) ----------`);
            pageIndex++;
            isEnd = show(result, pageIndex, pageSize);
        }
        process.exit();
    }
}

else {
    console.warn('请使用"cna-monitor help"查看启动帮助');
    process.exit();
}

function show(result, pageIndex, pageSize) {
    let isEnd = false;
    startIndex = (pageIndex - 1) * pageSize;
    endIndex = pageIndex * pageSize - 1;
    if (endIndex >= result.length) {
        endIndex = result.length - 1;
        isEnd = true;
    }
    for (let i = startIndex; i <= endIndex; i++) {
        console.info(`${result[i].time}\t${result[i].target}\t${result[i].alias}\t${result[i].status}\t${result[i].message || ""}`);
    }
    return isEnd;
}

function createListen(port) {
    const server = require('http').createServer();
    if (args.debug) {
        server.on('listening', function () {
            console.info(`docker环境为了防止自动停止，需要一直监听(${server.address().port})`);
        });
    }
    server.listen(port);
}