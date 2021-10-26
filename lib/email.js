const nodemailer = require('nodemailer');

module.exports = class {
    constructor(options) {
        options = options || {};
        //连接池
        options.pool = options.pool != undefined ? options.pool : false;
        //SMTP服务器
        options.host = options.host || "smtp.zhouxiaoyue.cn";
        //SMTP服务器端口
        options.port = options.port || 25;
        //是否SSL
        options.secure = options.secure != undefined ? options.secure : (options.secureConnection != undefined ? options.secureConnection : false);
        //认证
        options.auth = {
            //账号
            user: options.auth && options.auth.user ? options.auth.user : (options.user || "facomm@zhouxiaoyue.cn"),
            //授权码或者密码
            pass: options.auth && options.auth.pass ? options.auth.pass : (options.auth && options.auth.password ? options.auth.password : (options.pass ? options.pass : (options.password || "facomm@zhouxiaoyue.cn"))),
            //认证方式
            type: options.auth && options.auth.type && (options.auth.type == 'login' || options.auth.type == 'oauth2') ? options.auth.type : (options.type && (options.type == 'login' || options.type == 'oauth2') ? options.type : "login")
        };
        //配置
        this.options = options;
        //邮箱服务对象
        this.mailTransport = nodemailer.createTransport(options);
        /**
         * 发送邮件
         * @param {String} to 收件人，多个使用英文半角逗号隔开
         * @param {string} [subject=''] 主题
         * @param {string} [body=''] 正文，可以是HTML标签
         * @param {Array<JSON>} [attachments=null] 附件
         * @param {string} [from=''] 发件人,默认邮箱账号
         * @param {string} [cc=''] 抄送，多个使用英文半角逗号隔开
         * @param {string} [bcc=''] 密送，多个使用英文半角逗号隔开
         * @returns
         */
        this.send = async function (to, subject = '', body = '', attachments = [], from = '', cc = '', bcc = '') {
            from = from || this.options.auth.user;
            // if (attachments && verify.isArray(attachments) && attachments.length) {
            for (let i = 0; i < attachments.length; i++) {
                attachments[i].filename = attachments[i].filename || "";
                attachments[i].path = attachments[i].path || "";
                attachments[i].cid = attachments[i].cid || ('000000' + ((i + 1).toString()));
            }
            // }
            const result = await this.mailTransport.sendMail({
                from,
                to,
                cc,
                bcc,
                subject,
                html: body,
                attachments
            });
            return result;
        };
    }
};