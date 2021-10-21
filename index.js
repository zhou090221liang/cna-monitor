#!/usr/bin/env node

const comm = require('fa-comm');
const args = comm.bash.getArgs();
const readlineSync = require('readline-sync');
const fs = require('fs');
const _comm = require('./lib/comm');
const path = require('path');
const configFile = path.join(__dirname, './config/config');
let config;
if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile).toString().decrypt());
} else {
    config = {
        t: 1,
        p: 10,
        m: 1
    };
}

args.debug && console.log("目前的启动参数：", args);

if (args.help) {
    _comm.help();
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
        _comm.add(args.add || "", args.name || "");
        const answer = readlineSync.question(`添加【目标：${args.add || ""}${args.name ? `(别名：${args.name})` : ""}】成功,是否重启监控程序(y/n)？`);
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
        _comm.delete(args.delete || "");
        const answer = readlineSync.question(`删除成功，是否重启监控程序(y/n)？`);
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
    if (comm.typeof(args.t) == 'string') {
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
    console.warn('请使用"cna-monitor -help"查看启动帮助');
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