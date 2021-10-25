目前支持2种方式安装：
1、在安装有docker环境的机器下（进阶用户推荐）：
    docker run -d --restart always --user $(id -u):$(id -g) --cap-add=SYS_ADMIN --name cna-monitor zhou090221liang/cna-monitor cna-monitor start && docker logs -f cna-monitor
2、在没有安装有docker环境的机器下（普通用户推荐）：
    1）安装node.js环境，
        下载地址：https://nodejs.org/dist/v14.9.0/，
        找到自己对应的环境下载即可。
        （注意：请勿下载其他版本的环境，否则可能导致运行异常）
        windows下载exe或msi安装即可；
        Mac下载pkg安装即可；
        Linux需要下载源代码进行编译或下载对应架构的二进制文件后做软连接（具体请自行百度）
    2）npm install --unsafe-perm=true --allow-rootcd cna-monitor -g