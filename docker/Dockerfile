# 编译命令：docker build -t zhou090221liang/cna-monitor .
# 启动命令：docker run -d --restart always --cap-add=SYS_ADMIN --name cna-monitor -v /:/host zhou090221liang/cna-monitor sh -c "cna-monitor start & cna-monitor docker"
# 进入命令：docker exec -it cna-monitor bash
# 停止并删除命令：docker stop cna-monitor && docker rm cna-monitor
# 升级命令：
#   $ docker run -d --restart always --cap-add=SYS_ADMIN --name cna-monitor zhou090221liang/cna-monitor
#   $ docker exec -it cna-monitor sh -c "npm install --unsafe-perm=true --allow-rootcd cna-monitor -g && cna-monitor -v"
#   $ docker commit cna-monitor zhou090221liang/cna-monitor 
#   $ docker push zhou090221liang/cna-monitor 
#   $ docker stop cna-monitor && docker rm cna-monitor

# 升级命令（没有镜像和容器）：重新编译本文件

# 升级之后的导入配置：cna-monitor import /host/cna-backup/backup_20211026140149211.cna

# 下载依赖镜像（耗时较长）
FROM raspbian/stretch

# 定义一些变量
ENV nodeVersion 14.9.0

# 修改国内清华大学源1
RUN echo 'deb http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ stretch main contrib non-free rpi \n deb-src http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ stretch main contrib non-free rpi' >/etc/apt/sources.list
# 修改国内清华大学源2
RUN echo 'deb http://mirrors.tuna.tsinghua.edu.cn/raspberrypi/ stretch main ui' >/etc/apt/sources.list.d/raspberrypi.list

# 设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

# 更新系统，安装依赖（耗时较长）
RUN apt update && apt upgrade -y \
    && apt install -y lsb-release vim ca-certificates fonts-liberation libappindicator3-1 \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
    libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 \
    libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
    libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release \
    wget xdg-utils build-essential libsqlite3-dev sqlite3 bzip2 libbz2-dev gcc libatomic1 \
    zlibc zlib1g zlib1g.dev zlib1g-dev libffi-dev libssl-dev libreadline-dev \
    python3

# 复制nodejs依赖文件
# COPY libatomic.so.1 /usr/lib/arm-linux-gnueabihf/libatomic.so.1
RUN cd /usr/lib/arm-linux-gnueabihf/ && wget https://zhouxiaoyue.gitee.io/tools/downloads/libatomic.so.1

# 下载nodejs二进制文件（耗时一般）
RUN cd /usr/local/src \
    && wget https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-linux-armv7l.tar.xz

# 解压nodejs二进制文件（耗时一般）
RUN cd /usr/local/src \
    && xz -d node-v$nodeVersion-linux-armv7l.tar.xz \
    && tar xvf node-v$nodeVersion-linux-armv7l.tar \
    && rm node-v$nodeVersion-linux-armv7l.tar

# 创建软链接
RUN cd /usr/local/src/node-v$nodeVersion-linux-armv7l \
    && ln -s /usr/local/src/node-v$nodeVersion-linux-armv7l/bin/node /usr/bin/node \
    && ln -s /usr/local/src/node-v$nodeVersion-linux-armv7l/bin/npm /usr/bin/npm \
    && ln -s /usr/local/src/node-v$nodeVersion-linux-armv7l/bin/npx /usr/bin/npx

# 检测版本
RUN node -v && npm -v && npx -v

# 安装监控程序（耗时稍长）
RUN npm install --unsafe-perm=true --allow-rootcd cna-monitor -g

# 创建软连接
RUN ln -s /usr/local/src/node-v14.9.0-linux-armv7l/bin/cna-monitor /usr/bin/cna-monitor