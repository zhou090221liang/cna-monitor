require('../lib/proto/string');
const path = require('path');
const fs = require('fs');
const emailFile = path.join(__dirname, '../config/email');
const configFile = path.join(__dirname, '../config/config');
if (!fs.existsSync(emailFile)) {
    console.log("没有SMTP配置信息");
    return;
}
if (!fs.existsSync(configFile)) {
    console.log("没有配置文件");
    return;
}
const emailConfig = JSON.parse(fs.readFileSync(emailFile).toString().decrypt());
console.log("邮箱配置信息：", emailConfig);
const config = JSON.parse(fs.readFileSync(configFile).toString().decrypt());
if (!config.n) {
    console.log("没有配置收件人");
    return;
}
let mail = require('../lib/email');
mail = new mail(emailConfig);
mail.send(config.n, "测试邮件发送", "测试邮件发送").then(function (result) {
    console.log("邮件发送成功", result);
}).catch(function (err) {
    console.error("邮件发送失败", err);
});