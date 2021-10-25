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
                    out = JSON.parse(fs.readFileSync(outFile).toString().decrypt());
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
                let exists = out.find(item => item.target == k.target);
                if (!exists) {
                    out.insert(result);
                }
                else if (exists.status != result.status) {
                    out.insert(result);
                }
            }
            fs.writeFileSync(outFile, JSON.stringify(out).encrypt());
            await _comm.sleep(config.t ? parseInt(config.t) * 60 * 1000 : 1 * 60 * 1000);
        }
    }
})();