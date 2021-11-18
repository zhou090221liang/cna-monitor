一、安装方式

1、在安装有docker环境的机器下（进阶用户推荐）：
    docker run -d --restart always --cap-add=SYS_ADMIN --name cna-monitor -v /:/host zhou090221liang/cna-monitor sh -c "cna-monitor start & cna-monitor docker"

2、在没有安装有docker环境的机器下（普通用户推荐）：
    1）安装node.js环境，
        下载地址：https://nodejs.org/dist/v14.9.0/，
        找到自己对应的环境下载即可。
        （注意：请勿下载其他版本的环境，否则可能导致运行异常）
        windows下载exe或msi安装即可；
        Mac下载pkg安装即可；
        Linux需要下载源代码进行编译或下载对应架构的二进制文件后做软连接（具体请自行百度）
    2）npm install --unsafe-perm=true --allow-rootcd cna-monitor -g


=======================================================================================================================================


二、现有安装升级方式：
注意：升级会清空现有监控信息及配置信息，如升级后，需要使用原始配置继续监控，升级之前请自行备份当前配置信息，具体可执行命令“cna-monitor -h”查看备份及还原。

1、在安装有docker环境的机器下：
    1）docker stop cna-monitor && docker rm cna-monitor
    2）
    docker run -d --restart always --cap-add=SYS_ADMIN --name cna-monitor-update zhou090221liang/cna-monitor &&
    docker exec -it cna-monitor-update sh -c "npm install --unsafe-perm=true --allow-rootcd cna-monitor -g && cna-monitor -v"  && \
    docker commit cna-monitor-update zhou090221liang/cna-monitor && \
    docker stop cna-monitor-update && docker rm cna-monitor-update
    3）docker run -d --restart always --cap-add=SYS_ADMIN --name cna-monitor -v /:/host zhou090221liang/cna-monitor sh -c "cna-monitor start & cna-monitor docker"

2、在没有安装有docker环境的机器下：
    npm uninstall cna-monitor -g && npm install --unsafe-perm=true --allow-rootcd cna-monitor -g


=======================================================================================================================================


Docker升级提交命令（作者推送新版本用，普通用户不需要使用，否则会导致升级失败）：
docker run -d --restart always --cap-add=SYS_ADMIN --name cna-monitor-update zhou090221liang/cna-monitor &&
docker exec -it cna-monitor-update sh -c "npm install --unsafe-perm=true --allow-rootcd cna-monitor -g && cna-monitor -v"  && \
docker commit cna-monitor-update zhou090221liang/cna-monitor && \
docker push zhou090221liang/cna-monitor && \
docker stop cna-monitor-update && docker rm cna-monitor-update