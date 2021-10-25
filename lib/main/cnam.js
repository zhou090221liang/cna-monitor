const events = require('events');
const path = require('path');

function daemons(jscript, args = []) {
    const self = this;
    if (!self._EventEmitter) {
        self._EventEmitter = new events.EventEmitter();
    }
    let _jscript = path.basename(jscript);
    const { spawn } = require('child_process');
    let node = spawn(process.execPath, [_jscript, ...args], {
        cwd: path.dirname(jscript),
        windowsHide: true
    });
    self._EventEmitter._process = node;
    node.on('close', (err) => {
        console.error("进程出现异常，5秒后自动启用守护，自动启动", err);
        setTimeout(() => {
            daemons(jscript, args);
        }, 5000);
    });
    node.stdout.on('data', (data) => {
        // console.log(data.toString());
        self._EventEmitter.emit("stdout", data);
    });
    node.stderr.on('data', (data) => {
        // console.error(data.toString());
        self._EventEmitter.emit("stderr", data);
    });
    return self._EventEmitter;
}
daemons(path.join(__dirname,'./cna.js'));