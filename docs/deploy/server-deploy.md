# 服务器端部署

***
### centos7.3安装jdk1.8

1. 如果有openjdk先卸载
    ```bash
    # java -version
    ```
    
    1.1 查看已有openjdk文件
    ```bash
    # rpm -qa | grep java
    ```
    
    1.2 删除相关openjdk文件
    ```bash
    # rpm -e --nodeps
    ```
    eg:
    ```bash
    # rpm -e --nodeps java-1.7.0-openjdk-1.7.0.111-2.6.7.8.el7.x86_64
    # rpm -e --nodeps java-1.8.0-openjdk-1.8.0.102-4.b14.el7.x86_64
    # rpm -e --nodeps java-1.8.0-openjdk-headless-1.8.0.102-4.b14.el7.x86_64
    # rpm -e --nodeps java-1.7.0-openjdk-headless-1.7.0.111-2.6.7.8.el7.x86_64
    ```

2. 下载jdk  
  
    [官网下载地址](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)  
    
3. 解压
    ```bash
    # tar -zxvf xxx.tar.gz
    ```
    
4. 配置环境变量
    ```bash
    # vim /etc/profile
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
    # source /ect/profile
    ```
    
5. 验证安装成功
    ```bash
    # java -version
    java version "1.8.0_221"
    Java(TM) SE Runtime Environment (build 1.8.0_221-b11)
    Java HotSpot(TM) 64-Bit Server VM (build 25.221-b11, mixed mode)
    ```

***
### centos7.3安装mysql

1. 获取官方yum源

    [官网yum源地址](https://dev.mysql.com/downloads/repo/yum/)
    
2. 下载
    ```bash
    # wget https://dev.mysql.com/get/mysql57-community-release-el7-11.noarch.rpm
    ```
    
3. 安装源
    ```bash
    # yum -y localinstall mysql57-community-release-el7-11.noarch.rpm
    ```
    
4. 在线安装Mysql
    ```bash
    # yum -y install mysql-community-server
    ```
    
5. 启动mysql
    ```bash
    # systemctl start mysqld
    ```  

***
### mysql配置相关

#### 设置开机启动

1. centos :
    ```bash
        # systemctl enable mysqld
        # systemctl daemon-reload
    ```

#### 查看mysql root初始密码并修改

1. mysql安装完成后,在`/var/log/mysqld.log`文件中生成了临时密码
    ```bash
    # cat /var/log/mysqld.log
    ```

2. 进入mysql命令行
    ```bash
    #  mysql -u root -p
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
    # firewall-cmd --zone=public --add-port=3306/tcp --permanent
    # firewall-cmd --reload
    ```

#### 设置mysql默认编码为utf8

1. 修改`/etc/my.cnf`配置文件，在[mysqld]下添加编码配置
    ```bash
    # vi /etc/my.cnf
    
    [mysqld]
    character_set_server=utf8
    init_connect='SET NAMES utf8'
    ```

2. 重启mysql服务
    ```bash
    # systemctl restart mysqld
    ```

3. 查看编码是否修改成功
    ```bash
    mysql> show variables like '%character%';
    ```

#### 设置mysql忽略表名大小写

1. 修改`/etc/my.cnf`配置文件，在[mysqld]下添加配置

    ```bash
    # vi /etc/my.cnf
    
    [mysqld]
    lower_case_table_names=1
    ```

2. 如果不清楚my.cnf配置文件位置,可以如下操作：

    ```bash
    //查看mysql的命令路径
    # which mysqld 	
    /usr/sbin/mysqld
    
    //查看mysql读取的默认配置文件位置
    # /usr/sbin/mysqld --verbose --help | grep -A 1 'Default options' 
    Default options are read from the following files in the given order:
    /etc/my.cnf /etc/mysql/my.cnf /usr/etc/my.cnf ~/.my.cnf
    ```
    ps: 多个配置文件，前面的文件不存在才会读取后面的，编辑文件，如果发现是新文件，则编辑后面的文件

3. 重启mysql服务
    
    ```bash
    # service mysqld restart
    ```

#### 修改mysql group by限制

1. 临时解决办法：

   * 进入mysql命令行

     ```bash
     # mysql -uroot -p
     
     set session sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
     
     SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
     ```

2. 永久解决办法：

   * 修改`/etc/my.cnf`配置文件，在[mysqld]下添加配置

     ```bash
     # vi /etc/my.cnf
     
     [mysqld]
     sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
     ```

   * 重启mysql服务

     ```bash
     # service mysqld restart
     ```

### centos7.3安装tomcat8

1. 下载tomcat [官方下载地址](http://tomcat.apache.org/download-80.cgi)
    ```bash
    # wget http://mirrors.tuna.tsinghua.edu.cn/apache/tomcat/tomcat-8/v8.5.47/bin/apache-tomcat-8.5.47.tar.gz
    ```

2. 解压
    ```bash
    # tar -zxvf apache-tomcat-8.5.47.tar.gz 
    ```
    ps：防火墙开放端口
    ```bash
    # firewall-cmd --zone=public --add-port=80/tcp --permanent
    # firewall-cmd --reload
    ```

### centos7.3安装redis4

1. 下载redis安装包
    ```bash
    # wget http://download.redis.io/releases/redis-4.0.6.tar.gz
    ```

2. 解压
    ```bash
    # tar -zxvf redis-4.0.6.tar.gz
    ```

3. yum安装gcc依赖
    ```bash
    # yum install gcc
    ```

4. 跳转到redis解压目录下编译安装
    ```bash
    # cd redis-4.0.6
    # make MALLOC=libc　
  
    //将redis-4.0.6/src目录下的文件加到/usr/local/bin目录
    # cd src && make install
    ```

5. 启动redis

    * 按需修改redis.conf文件  
        `protected-mode no` 改为 `protected-mode yes`  
        `bind 127.0.0.1` 注释掉，或者改为`bind 0.0.0.0`  
    ​	ps: 防火墙开放端口 
        ```bash
        # firewall-cmd --zone=public --add-port=6379/tcp --permanent
        # firewall-cmd --reload
        ``` 
    
    * 切换到redis的src目录下直接启动
        ```bash
        # cd src
        # ./redis-server
        ```

    * 后台进程启动

    * 修改redis.conf文件
     ​	`daemonize no `改为 `daemonize yes

    * 指定redis.conf文件启动
        ```bash
        # ./redis-server /home/redis-4.0.6/redis.conf
        ```

6. 设置redis开机自启动  [参考资料](https://www.cnblogs.com/zuidongfeng/p/8032505.html)

    * 在/etc目录下新建redis目录
        ```bash
        # mkdir /etc/redis
        ```
        
    * 将`redis.conf `文件复制一份到`/etc/redis`目录下，并命名为`6379.conf`　
        ```bash
        # cp /home/redis-4.0.6/redis.conf /etc/redis/6379.conf
        ```
        
    * 将redis的启动脚本复制一份放到`/etc/init.d`目录下，命名为`redisd`
        ```bash
        # cp /home/redis-4.0.6/utils/redis_init_script /etc/init.d/redisd
        ```
    
    * 设置redis开机自启动
        ```bash
        # cd /etc/init.d
        # chkconfig redisd on
        service redisd does not support chkconfig　
        ```
    
    * 如果如上提示不支持chkconfig
        使用vim编辑redisd文件，在第一行`#!/bin/sh`之后加入如下两行注释，保存退出
        ```bash
        # vim /etc/init.d/redisd
        
        #!/bin/sh
        #chkconfig:   2345 90 10
        #description:  Redis is a persistent key-value database
        ```
        ps: 注释的意思是，redis服务必须在运行级2，3，4，5下被启动或关闭，启动的优先级是90，关闭的优先级是10。
    
    * 再次执行开机自启命令即可
        ```bash
        # chkconfig redisd on
        ```
    
        ps: 现在可以直接已服务的形式启动和关闭redis了  
    ​	启动：`service redisd start`  
    ​    停止：`service redisd stop`

### centos7.3安装nginx

​	[参考资料](https://blog.csdn.net/qq_38591756/article/details/82829902)

1. 下载安装包和依赖  

    SSL功能需要openssl库，下载地址：http://www.openssl.org/  
    gzip模块需要zlib库，下载地址：http://www.zlib.net/  
    rewrite模块需要pcre库，下载地址：http://www.pcre.org/  
    Nginx的安装包：下载地址为：http://nginx.org/en/download.html  
    ```bash
    # wget https://www.openssl.org/source/openssl-1.1.1.tar.gz
    # wget http://www.zlib.net/zlib-1.2.11.tar.gz
    # wget https://ftp.pcre.org/pub/pcre/pcre-8.33.tar.gz
    # wget http://nginx.org/download/nginx-1.14.0.tar.gz
    ```

2. 解压
    ```bash
    # tar zxvf openssl-1.1.1.tar.gz
    # tar zxvf zlib-1.2.11.tar.gz
    # tar zxvf pcre-8.33.tar.gz
    # tar zxvf nginx-1.14.0.tar.gz
    ```

3. 安装依赖
    ```bash
    //新环境需要安装gcc gcc-c++ make
    # yum install -y gcc gcc-c++ make
    
    //安装PCRE库
    # cd pcre-8.33
    # ./configure
    # make && make install
    //安装SSL库
    # cd openssl-1.1.1
    # ./config
    # make && make install
    //安装zlib库
    # cd zlib-1.2.11
    # ./configure
    # make && make install
    ```

4. 安装nginx
    ```bash
    # cd nginx-1.14.0
    
    # ./configure --user=nobody --group=nobody --prefix=/usr/local/nginx --with-http_stub_status_module --with-http_gzip_static_module --with-http_realip_module --with-http_sub_module --with-http_ssl_module --with-pcre=/home/nginx/pcre-8.33 --with-zlib=/home/nginx/zlib-1.2.11 --with-openssl=/home/nginx/openssl-1.1.1
    
    # make && make install
    ```
    ps: 如果默认没有创建logs目录，则需要手动创建，否则会报错
    ```bash
    # mkdir /usr/local/nginx/logs
    ```

5. 配置开机启动

    * 切换到`/lib/systemd/system`目录,创建`nginx.service`文件，内容如下：
        ```bash
        # cd /lib/systemd/system
        
        # vim nginx.service
        
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
        # systemctl enable nginx.service
        ```

        ps: `/usr/local/nginx/conf/nginx.conf`文件是nginx默认的配置文件，对其修改即可

        ```bash
        # systemctl start nginx.service  //启动，也可以使用sbin/nginx启动
        # systemctl stop nginx.service  //结束nginx 
        # systemctl restart nginx.service  //重启，可使用sbin/nginx -s reload
        ```

