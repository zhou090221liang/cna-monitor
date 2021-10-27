require('../lib/proto/date');
const path = require('path');
const fs = require('fs');
const os = require('os');
const processId = '0x000' + (process.pid * process.pid || 0).toString(16).toUpperCase();
const logFile = path.join(__dirname, '../logs/');
const convert = require('./convert');

module.exports = {
    log: (...message) => {
        const dir = path.join(logFile, './' + new Date().format('yyyyMMdd') + '.log');
        let _message = ['[LOG]\t' + new Date().format('yyyy-MM-dd hh:mm:ss') + '\t' + processId + '\t'];
        for (const msg of message) {
            _message.push(convert.toString(msg));
        }
        // console.log(_message.join(' '));
        fs.writeFileSync(dir, _message.join('') + os.EOL, { flag: 'a' });
    },
    info: (...message) => {
        const dir = path.join(logFile, './' + new Date().format('yyyyMMdd') + '.log');
        let _message = ['[INFO]\t' + new Date().format('yyyy-MM-dd hh:mm:ss') + '\t' + processId + '\t'];
        for (const msg of message) {
            _message.push(convert.toString(msg));
        }
        // console.info(_message.join(' '));
        fs.writeFileSync(dir, _message.join('') + os.EOL, { flag: 'a' });
    },
    warn: (...message) => {
        const dir = path.join(logFile, './' + new Date().format('yyyyMMdd') + '.log');
        let _message = ['[WARN]\t' + new Date().format('yyyy-MM-dd hh:mm:ss') + '\t' + processId + '\t'];
        for (const msg of message) {
            _message.push(convert.toString(msg));
        }
        // console.warn(_message.join(' '));
        fs.writeFileSync(dir, _message.join('') + os.EOL, { flag: 'a' });
    },
    error: (...message) => {
        const dir = path.join(logFile, './' + new Date().format('yyyyMMdd') + '.log');
        let _message = ['[ERROR]\t' + new Date().format('yyyy-MM-dd hh:mm:ss') + '\t' + processId + '\t'];
        for (const msg of message) {
            _message.push(convert.toString(msg));
        }
        // console.error(_message.join(' '));
        fs.writeFileSync(dir, _message.join('') + os.EOL, { flag: 'a' });
    }
};