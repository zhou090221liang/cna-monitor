(async function () {
    require('../proto/string');
    require('../proto/date');
    require('../proto/array');
    const _comm = require('../comm');
    const path = require('path');
    const fs = require('fs');
    const netping = require('net-ping');
    const netpingsession = netping.createSession({
        packetSize: 16,
        timeout: 3000,
    });
    const ping = _comm.promisify(netpingsession.pingHost, netpingsession);

    const configFile = path.join(__dirname, '../../config/config');
    const keysFile = path.join(__dirname, '../../config/keys');
    // const keys = JSON.parse(fs.readFileSync(keysFile).toString().decrypt());
    const outFile = path.join(__dirname, '../../out/result');
    let emailHelp;
    const emailFile = path.join(__dirname, '../../config/email');
    if (fs.existsSync(emailFile)) {
        const emailConfig = JSON.parse(fs.readFileSync(emailFile).toString().decrypt());
        const emailComm = require('../email');
        emailHelp = new emailComm(emailConfig);
    }
    const defaultConfig = require('../../default/config');
    let config;
    if (fs.existsSync(configFile)) {
        config = JSON.parse(fs.readFileSync(configFile).toString().decrypt());
    } else {
        config = defaultConfig;
    }
    let keys = [];
    if (fs.existsSync(keysFile)) {
        keys = JSON.parse(fs.readFileSync(keysFile).toString().decrypt());
    }

    if (keys && keys.length) {
        while (true) {
            let out = [];
            if (fs.existsSync(outFile)) {
                const stats = fs.statSync(outFile);
                if (stats.size >= (config.m || 1) * 1024 * 1024) {
                    fs.unlinkSync(outFile);
                } else {
                    // out = JSON.parse(fs.readFileSync(outFile).toString().decrypt());
                    const text = fs.readFileSync(outFile).toString().split('\r\n');
                    text.forEach(item => {
                        if (item) {
                            out.push(JSON.parse(item.decrypt()));
                        }
                    });
                }
            }
            for (const k of keys) {
                let result = {};
                try {
                    await ping(k.target);
                    result = {
                        time: new Date().format(),
                        target: k.target,
                        alias: k.alias || "",
                        status: '上线'
                    };
                } catch (e) {
                    result = {
                        time: new Date().format(),
                        target: k.target,
                        alias: k.alias || "",
                        status: '下线',
                        message: e.message
                    };
                }
                console.info("ping：", result);
                // let exists = out.find(item => item.target == k.target);
                // if (!exists) {
                out.insert(result);
                if (emailHelp && config.n) {
                    try {
                        let ip = _comm.getLocalIp();
                        await emailHelp.send(config.n, `监听到目标变化（来自：${ip || "未知地址"}）`, `时间：${result.time}<br>目标：${result.target}${result.alias ? `(${result.alias})` : ""}<br>状态：${result.status}<br>消息：${result.message || ""}`);
                    } catch (e) {
                        console.warn(`邮件发送失败：`, e);
                        log.error('邮件发送失败', e);
                    }
                }
                // }
                // else if (exists.status != result.status) {
                //     out.insert(result);
                //     if (emailHelp && config.n) {
                //         try {
                //             await emailHelp.send(config.n, "监听到目标变化", `时间：${result.time}<br>目标：${result.target}${result.alias ? `(${result.alias})` : ""}<br>状态：${result.status}<br>消息：${result.message}`);
                //         } catch (e) { }
                //     }
                // }
            }
            // fs.writeFileSync(outFile, JSON.stringify(out).encrypt());
            const r = [];
            out.forEach(item => {
                r.push(JSON.stringify(item).encrypt())
            });
            fs.writeFileSync(outFile, r.join('\r\n'));
            await _comm.sleep(1000);
        }
    }
})();