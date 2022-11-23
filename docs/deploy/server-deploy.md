# 服务器端部署

***
### centos7.3安装jdk1.8

1. 如果有openjdk先卸载
    ```bash
    $ java -version
    ```
    
    1.1 查看已有openjdk文件
    ```bash
    $ rpm -qa | grep java
    ```
    
    1.2 删除相关openjdk文件
    ```bash
    $ rpm -e --nodeps
    ```
    eg:
    ```bash
    $ rpm -e --nodeps java-1.7.0-openjdk-1.7.0.111-2.6.7.8.el7.x86_64
    $ rpm -e --nodeps java-1.8.0-openjdk-1.8.0.102-4.b14.el7.x86_64
    $ rpm -e --nodeps java-1.8.0-openjdk-headless-1.8.0.102-4.b14.el7.x86_64
    $ rpm -e --nodeps java-1.7.0-openjdk-headless-1.7.0.111-2.6.7.8.el7.x86_64
    ```

2. 下载jdk  
  
    [官网下载地址](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)  
    
3. 解压
    ```bash
    $ tar -zxvf xxx.tar.gz
    ```
    
4. 配置环境变量
    ```bash
    $ vim /etc/profile
    ```
    在末尾加入
    ```bash
    #set java env
    export JAVA_HOME=/home/jdk1.8.0_221
    export CLASSPATH=.:$JAVA_HOME/jre/lib/rt.jar:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
    export PATH=$JAVA_HOME/bin:$PATH
    ```
    修改完profile文件，执行生效命令
    ```bash
    $ source /ect/profile
    ```
    
5. 验证安装成功
    ```bash
    $ java -version
    java version "1.8.0_221"
    Java(TM) SE Runtime Environment (build 1.8.0_221-b11)
    Java HotSpot(TM) 64-Bit Server VM (build 25.221-b11, mixed mode)
    ```

***
### centos7安装mysql

1. 获取官方yum源

    [官网yum源地址](https://dev.mysql.com/downloads/repo/yum/)
    
2. 下载
    ```bash
    ## mysql5.7
    $ wget https://dev.mysql.com/get/mysql57-community-release-el7-11.noarch.rpm
    ## mysql8
    $ wget https://repo.mysql.com//mysql80-community-release-el7-1.noarch.rpm
    ```
    
3. 安装源
    ```bash
    $ yum -y localinstall mysql80-community-release-el7-1.noarch.rpm
    ```
    
4. 在线安装Mysql
    ```bash
    $ yum -y install mysql-community-server
    ```
    
5. 启动mysql
    ```bash
    $ systemctl start mysqld
    ```

***
### mysql配置相关

#### 设置开机启动

1. centos :
    ```bash
    $ systemctl enable mysqld
    $ systemctl daemon-reload
    ```

#### 查看mysql root初始密码并修改

1. mysql安装完成后,在`/var/log/mysqld.log`文件中生成了临时密码
    ```bash
    $ cat /var/log/mysqld.log
    ```

2. 进入mysql命令行
    ```bash
    $ mysql -u root -p
    ```

3. 修改密码
    ```bash
    mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
    Query OK, 0 rows affected (0.00 sec)
    ```
    ps: mysql5.7默认密码策略要求密码必须是大小写字母数字特殊字母的组合，至少8位

#### 设置mysql允许远程登录

1. 进入mysql命令行
    ```bash
    mysql> GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'password' WITH GRANT OPTION;
    Query OK, 0 rows affected, 1 warning (0.01 sec)
    ```
    ps: 防火墙开放3306端口
    ```bash
    $ firewall-cmd --zone=public --add-port=3306/tcp --permanent
    $ firewall-cmd --reload
    ```

#### 设置mysql默认编码为utf8

1. 修改`/etc/my.cnf`配置文件，在[mysqld]下添加编码配置
    ```bash
    $ vi /etc/my.cnf
    
    [mysqld]
    character_set_server=utf8
    init_connect='SET NAMES utf8'
    ```

2. 重启mysql服务
    ```bash
    $ systemctl restart mysqld
    ```

3. 查看编码是否修改成功
    ```bash
    mysql> show variables like '%character%';
    ```

#### 设置mysql忽略表名大小写

1. 修改`/etc/my.cnf`配置文件，在[mysqld]下添加配置

    ```bash
    $ vi /etc/my.cnf
    
    [mysqld]
    lower_case_table_names=1
    ```

2. 如果不清楚my.cnf配置文件位置,可以如下操作：

    ```bash
    //查看mysql的命令路径
    $ which mysqld 	
    /usr/sbin/mysqld
    
    //查看mysql读取的默认配置文件位置
    $ /usr/sbin/mysqld --verbose --help | grep -A 1 'Default options' 
    Default options are read from the following files in the given order:
    /etc/my.cnf /etc/mysql/my.cnf /usr/etc/my.cnf ~/.my.cnf
    ```
    ps: 多个配置文件，前面的文件不存在才会读取后面的，编辑文件，如果发现是新文件，则编辑后面的文件

3. 重启mysql服务
  
    ```bash
    $ service mysqld restart
    ```

#### 修改mysql group by限制

1. 临时解决办法：

   * 进入mysql命令行

     ```bash
     $ mysql -uroot -p
     
     set session sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
     
     SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
     ```

2. 永久解决办法：

   * 修改`/etc/my.cnf`配置文件，在[mysqld]下添加配置

     ```bash
     $ vi /etc/my.cnf
     
     [mysqld]
     sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
     ```

   * 重启mysql服务

     ```bash
     $ service mysqld restart
     ```

***

### centos7.3安装tomcat8

1. 下载tomcat [官方下载地址](http://tomcat.apache.org/download-80.cgi)
    ```bash
    $ wget http://mirrors.tuna.tsinghua.edu.cn/apache/tomcat/tomcat-8/v8.5.47/bin/apache-tomcat-8.5.47.tar.gz
    ```

2. 解压
    ```bash
    $ tar -zxvf apache-tomcat-8.5.47.tar.gz 
    ```
    ps：防火墙开放端口
    ```bash
    $ firewall-cmd --zone=public --add-port=80/tcp --permanent
    $ firewall-cmd --reload
    ```

***

### centos7.3安装redis4

1. 下载redis安装包
    ```bash
    $ wget http://download.redis.io/releases/redis-4.0.6.tar.gz
    ```

2. 解压
    ```bash
    $ tar -zxvf redis-4.0.6.tar.gz
    ```

3. yum安装gcc依赖
    ```bash
    $ yum install gcc
    ```

4. 跳转到redis解压目录下编译安装
    ```bash
    $ cd redis-4.0.6
    $ make MALLOC=libc
    
    #将redis-4.0.6/src目录下的文件加到/usr/local/bin目录
    $ cd src && make install
    ```

5. 启动redis

    * 按需修改redis.conf文件  
        是否开启保护模式	`protected-mode no/yes` 
        
        是否指定ip可访问	`bind 127.0.0.1/0.0.0.0` 
        	ps: 防火墙开放端口 
        
        ```bash
        $ firewall-cmd --zone=public --add-port=6379/tcp --permanent
        $ firewall-cmd --reload
        ```
        
    * 切换到redis的src目录下直接启动
        ```bash
        $ cd src
        $ ./redis-server
        ```

    * 后台进程启动

    * 修改redis.conf文件
     ​	`daemonize no ` 改为 `daemonize yes`

    * 指定redis.conf文件启动
        ```bash
        $ ./redis-server /home/redis-4.0.6/redis.conf
        ```

6. 设置redis开机自启动  [参考资料](https://www.cnblogs.com/zuidongfeng/p/8032505.html)

    * 在/etc目录下新建redis目录
        ```bash
        $ mkdir /etc/redis
        ```
        
    * 将`redis.conf `文件复制一份到`/etc/redis`目录下，并命名为`6379.conf`　
        ```bash
        $ cp /home/redis-4.0.6/redis.conf /etc/redis/6379.conf
        ```
        
    * 将redis的启动脚本复制一份放到`/etc/init.d`目录下，命名为`redisd`
        ```bash
        $ cp /home/redis-4.0.6/utils/redis_init_script /etc/init.d/redisd
        ```
    
    * 设置redis开机自启动
        ```bash
        $ cd /etc/init.d
        $ chkconfig redisd on
        service redisd does not support chkconfig
        ```
    
    * 如果如上提示不支持chkconfig
        使用vim编辑redisd文件，在第一行`#!/bin/sh`之后加入如下两行注释，保存退出
        ```bash
        $ vim /etc/init.d/redisd
        
        #!/bin/sh
        #chkconfig:   2345 90 10
        #description:  Redis is a persistent key-value database
        ```
        ps: 注释的意思是，redis服务必须在运行级2，3，4，5下被启动或关闭，启动的优先级是90，关闭的优先级是10。
    
    * 再次执行开机自启命令即可
        ```bash
        $ chkconfig redisd on
        ```
    
        ps: 现在可以直接已服务的形式启动和关闭redis了  
        启动：`service redisd start`  
        停止：`service redisd stop`

***

### centos7.3安装nginx [离线安装]

[参考资料](https://blog.csdn.net/qq_38591756/article/details/82829902)

1. 下载安装包和依赖  

    SSL功能需要openssl库，下载地址：http://www.openssl.org/  
    gzip模块需要zlib库，下载地址：http://www.zlib.net/  
    rewrite模块需要pcre库，下载地址：http://www.pcre.org/  
    Nginx的安装包：下载地址为：http://nginx.org/en/download.html  
    ```bash
    $ wget https://www.openssl.org/source/openssl-1.1.1.tar.gz
    $ wget http://www.zlib.net/zlib-1.2.11.tar.gz
    $ wget https://ftp.pcre.org/pub/pcre/pcre-8.33.tar.gz
    $ wget http://nginx.org/download/nginx-1.14.0.tar.gz
    ```

2. 解压
    ```bash
    $ tar zxvf openssl-1.1.1.tar.gz
    $ tar zxvf zlib-1.2.11.tar.gz
    $ tar zxvf pcre-8.33.tar.gz
    $ tar zxvf nginx-1.14.0.tar.gz
    ```

3. 安装依赖
    ```bash
    #新环境需要安装gcc gcc-c++ make
    $ yum install -y gcc gcc-c++ make
    
    #安装PCRE库
    $ cd pcre-8.33
    $ ./configure
    $ make && make install
    #安装SSL库
    $ cd openssl-1.1.1
    $ ./config
    $ make && make install
    #安装zlib库
    $ cd zlib-1.2.11
    $ ./configure
    $ make && make install
    ```

4. 安装nginx
    ```bash
    $ cd nginx-1.14.0
    
    $ ./configure --user=nobody --group=nobody --prefix=/usr/local/nginx --with-http_stub_status_module --with-http_gzip_static_module --with-http_realip_module --with-http_sub_module --with-http_ssl_module --with-pcre=/home/nginx/pcre-8.33 --with-zlib=/home/nginx/zlib-1.2.11 --with-openssl=/home/nginx/openssl-1.1.1
    
    $ make && make install
    ```
    ps: 如果默认没有创建logs目录，则需要手动创建，否则会报错
    ```bash
    $ mkdir /usr/local/nginx/logs
    ```

5. 配置开机启动

    * 切换到`/lib/systemd/system`目录,创建`nginx.service`文件，内容如下：
        ```bash
        $ cd /lib/systemd/system
        
        $ vim nginx.service
        
        [Unit]
        Description=nginx
        After=network.target
        
        [Service]
        Type=forking
        ExecStart=/usr/local/nginx/sbin/nginx
        ExecReload=/usr/local/nginx/sbin/nginx reload
        ExecStop=/usr/local/nginx/sbin/nginx quit
        PrivateTmp=true
         
        [Install]
        WantedBy=multi-user.target
        ```

    * 保存并退出，使用下面命令设置开机启动

        ```bash
        $ systemctl enable nginx.service
        ```

        ps: `/usr/local/nginx/conf/nginx.conf`文件是nginx默认的配置文件，对其修改即可

        ```bash
        $ systemctl start nginx.service  #启动，也可以使用sbin/nginx启动
        $ systemctl stop nginx.service  #结束nginx 
        $ systemctl restart nginx.service  #重启，可使用sbin/nginx -s reload
        ```

***

### centos7.3安装nginx [在线安装]

1. 添加rpm源

   ```bash
   $ sudo rpm -Uvh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm
   ```

2. 通过yum search nginx看看是否已经添加源成功。如果成功则执行命令安装Nginx

   ```bash
   $ sudo yum install -y nginx
   ```

3. 启动Nginx并设置开机自动运行

   ```bash
   $ sudo systemctl start nginx.service
   $ sudo systemctl enable nginx.service
   ```

***

### linux安装配置frp
* 安装包下载：
    [linux版本下载](https://file.philyang.site/blog/frp_0.44.0_linux_amd64.tar.gz)
    [win版本下载](https://file.philyang.site/blog/frp_0.44.0_windows_amd64.zip)
1. 解析文件
```shell
tar -zxvf xxx.tar.gz
```

2. 服务端相关配置
   * [官方中文文档](https://gofrp.org/docs/)
```properties
$ vim frps.ini

[common]
# 服务端开放的供客户端建立连接的端口
bind_port = 7000
# 用户访问HTTP类型的服务端口,可自定义
vhost_http_port = 80
# 用户访问HTTP类型的服务端口
vhost_https_port = 443

# 如需自定义多级域名访问,将主域名配置在这里
subdomain_host = philyang.site


# 启动服务
$ ./frps -c frps.ini    # 控制台启动服务端
$ nohup ./frps -c frps.ini > frps.log 2>&1 &   #后台启动服务端
```

3. 客户端配置
```properties
$ vim frpc.ini

[common]
# 服务端frps的ip地址,一般为服务端的公网IP
server_addr = 127.0.0.1
# 服务端开放建立连接的端口,对应服务端配置文件中的 bind_port
server_port = 7000

# 穿透http服务
[http]
type = http
# 需要本地的哪个端口穿透出去
local_port = 1001
# 如使用指定域名访问,则在下面配置,最终访问域名则为下值
custom_domains = daijiashan.servasoft.com
# 如需自定义多级域名访问,将子域名配置在这里,最终访问域名则为下值和frps.ini中的subdomain_host拼接后的域名,本文则为 mac.philyang.site
subdomain = mac

# 穿透ssh服务
[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
# 用户访问服务端的端口
remote_port = 6000

# 穿透windows远程桌面
[rdp]
type = tcp
local_ip = 127.0.0.1
#远程桌面的默认端口
local_port = 3389
# 服务端开启的端口，外网访问
remote_port = 7001


# https相关配置
[https-www.sample.cn]
type = https
# 填写实际域名
custom_domains = www.philyang.site
plugin = https2http
plugin_local_addr = 127.0.0.1:80
# HTTPS 证书相关的配置
plugin_crt_path = /Users/philyang/work/frp_0.37.0_darwin_amd64/ssl/philyang.site_bundle.pem
plugin_key_path = /Users/philyang/work/frp_0.37.0_darwin_amd64/ssl/philyang.site.key
plugin_host_header_rewrite = 127.0.0.1
plugin_header_X-From-Where = frp

[https-@.sample.cn]
type = https
# 填写实际域名
custom_domains = sample.cn
plugin = https2http
plugin_local_addr = 127.0.0.1:80
# HTTPS 证书相关的配置
plugin_crt_path = /Users/philyang/work/frp_0.37.0_darwin_amd64/ssl/philyang.site_bundle.pem
plugin_key_path = /Users/philyang/work/frp_0.37.0_darwin_amd64/ssl/philyang.site.key
plugin_host_header_rewrite = 127.0.0.1
plugin_header_X-From-Where = frp

[http-@.sample.cn]
type = http
local_port = 80
# 填写实际域名
custom_domains = sample.cn

[http-www.sample.cn]
type = http
local_port = 80
# 填写实际域名
custom_domains = www.sample.cn


# 启动服务
$ ./frps -c frps.ini    # 控制台启动服务端
$ nohup ./frps -c frps.ini > frps.log 2>&1 &   #后台启动服务端
```


***

### windows开机自启
1. win+R 输入 shell::startup

2. 创建vbs文件并输入以下内容
    * frp服务
    ```bash
    Set ws = CreateObject("Wscript.Shell")
    ws.run "cmd /c D:\work\frp_0.44.0_windows_amd64\frpc.exe -c D:\word\frp_0.44.0_windows_amd64\frpc.ini",,True    
    ```
    * jar服务
    ```bash
    Set ws = CreateObject("Wscript.Shell")
    ws.run "cmd /c java -jar D:\daijiwordashan\hk-security-api-0.0.1-SNAPSHOT.jar",,True
    ```
    * ws.run 的第二个参数 0=隐藏后台运行 6=最小化运行

***

### linux开机自启

ubantu18系统见此：[外部链接](https://blog.51cto.com/u_12218973/5106174)

1. 新建需要执行的sh文件,如start-jar.sh
```shell
vim start-jar.sh

nohup java -jar XXX.jar >/dev/null 2>&1 &
```

2. 编辑`rc.local`文件 
```shell
cd /etc/rc.d

cat rc.local

#!/bin/bash
# THIS FILE IS ADDED FOR COMPATIBILITY PURPOSES
#
# It is highly advisable to create own systemd services or udev rules
# to run scripts during boot instead of using this file.
#
# In contrast to previous versions due to parallel execution during boot
# this script will NOT be run after all other services.
#
# Please note that you must run 'chmod +x /etc/rc.d/rc.local' to ensure
# that this script will be executed during boot.
 
touch /var/lock/subsys/local
 
###上述代码为rc.local文件中自有内容，不需要改动
```

3. 追加内容到rc.local
```shell
# 进入你项目所在的目录
cd /myApp/test
# 执行该目录下的sh文件
sh /myApp/test/startup.sh
 
# 如果不提前进入所在目录，直接执行第二句，也会开机自启动，但是日志文件会在根目录下的log文件中。只有先进入，再执行，项目的日志文件才会在目标文件夹下
```

***

### https certbot

使用`Let's Encrypt`部署免费的https泛域名

1. 检查是否安装过certbot相关服务，如果有需删除
```shell
sudo apt-get remove certbot
sudo dnf remove certbot
sudo yum remove certbot
```

2. [安装snapd](https://snapcraft.io/docs/installing-snapd)
```shell
# debain 9和10
sudo apt update
sudo apt install snapd

# centos
sudo yum install snapd
sudo systemctl enable --now snapd.socket

# ubantu 16.04+ 已自动安装
```

3. 准备certbot命令
```shell
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

4. 生成证书
```shell
# 注意替换域名，这里将泛域和订域均生成了
sudo certbot certonly  --preferred-challenges dns -d "*.philyang.site" -d philyang.site --manual

# 1.输入邮箱号，用于接受ssl过期提醒
# 2.记录IP，输入Y
# 3.是否接受订阅推送，可输入 N
# 4.输入域名
# 会生成域名TXT记录值，加入到域名解析中
# 生成的证书文件在 /etc/letsencrypt/live/ 下
```

5. 配置nginx
```nginx
# 在 nginx.conf 中 server里加入以下内容
ssl_certificate /etc/letsencrypt/live/philyang.site/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/philyang.site/privkey.pem;
```

6. 设置定时续期脚本文件
    * 因为ssl证书默认有效期为90天，所以需要配置自动续期，也可手动执行
    * 续签命令：`sudo certbot renew`
    * 强制续签：`sudo certbot renew --force-renewal`
```shell
vim /etc/letsencrypt/sslrenew.sh

sudo certbot renew
# 最好在这加入重启ngin的命令
service restart nginx
```

7. 给予脚本文件权限
    * chmod -x /etc/letsencrypt/sslrenew.sh

8. 设置定时执行
```shell
crontab -e

# 加入定时执行的脚本内容，下文示例为：每隔两个月的，凌晨1点0分，执行
0 1 * */2 * /etc/letsencrypt/sslrenew.sh
```