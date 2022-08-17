# docker

### debain11创建用户
```shell
groupadd $USER
useradd -m $USER -g $USER -s /bin/bash -d /home/$USER
passwd $USER
```

### 安装docker
centos8安装docker：https://blog.csdn.net/m0_67403073/article/details/124504302

1. 如果更换过或者添加过软件源相关操作，一定要执行sudo apt-get update刷新存储库，没有的话就不用了

```shell
sudo apt-get update
```

2. 添加使用 HTTPS 传输的软件包以及 CA 证书

```shell
sudo apt-get install \
   apt-transport-https \
   ca-certificates \
   curl \
   gnupg \
   lsb-release
```

3. 添加软件源的 GPG 密钥
```shell
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```
4. 添加 Docker 软件源
```shell
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
5. 安装Docker
```shell
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```
6. 启动Docker
```shell
# 开机自启
sudo systemctl enable docker
# 启动Docker服务
sudo systemctl start docker
```
7. 添加用户到docker群组，避免非root用户需使用sudo才能执行docker
```shell
sudo usermod -aG docker $USER
```

8. 镜像加速/更换软件源
```shell
sudo nano /etc/docker/daemon.json
```

* 文件是json格式，如果是空白文件则输入完整的json格式

    ```json
    {
        "registry-mirrors": [
            "https://hub-mirror.c.163.com",
            "https://mirror.baidubce.com"
        ]
    }
    ```
    
* 如果是文件中有内容，则追加添加registry-mirrors节点进去
  
    ```json
    "registry-mirrors": [
        "https://hub-mirror.c.163.com",
        "https://mirror.baidubce.com"
    ]
    ```
9. 重启docker
```shell
# 重新加载某个服务的配置文件
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 卸载Docker
1. 卸载依赖
```shell
sudo apt-get purge docker-ce docker-ce-cli containerd.io docker-compose-plugin
```
2. 卸载资源
```shell
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

### 安装docker-compose
1. 可根据想要的版本，修改以下语句版本号
```shell
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

2. 授权
```shell
chmod +x /usr/local/bin/docker-compose
```

3. 链接到/usr/bin
```shell
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

4. 检查版本
```shell
# 1.27.4
docker-compose -version
# 2.2.2
docker-compose version
```



### docker部署jar

1. build镜像

    ```bash
    docker build -t bimface-api:v1.0 .
    ```

2. run

    ```bash
    docker run -d -it --name=bimface-api -p 8989:8989 -v /Users/philyang/docker/app/bimface-api/:/app/ bimface-api:v1.0
    ```

    

### docker安装mysql8

1. 创建挂在数据目录和配置文件
```shell
mkdir -p /mnt/mysql/data /etc/mysql/conf
touch /etc/mysql/conf/my.cnf
```

2. 拉取镜像
```bash
docker pull mysql
```

3. 启动容器
```shell
docker run --restart=always --name=mysql -p 3306:3306 \
-v /etc/mysql/conf/my.cnf:/etc/my.cnf \
-v /mnt/mysql/data:/var/lib/mysql \
-e MYSQL_ROOT_PASSWORD=123456 \
-d mysql
```

4. 配置远程访问
```shell
docker exec -it mysql /bin/bash
mysql -uroot -p123456
alter user 'root'@'%' identified by '123456' password expire never;
alter user 'root'@'%' identified with mysql_native_password by '123456';
flush privileges;
```

### docker安装nginx

1. 拉取镜像

    ```bash
    docker pull nginx:latest
    ```

2. 启动nginx容器

    ```bash
    # 需要提前创建这些目录
    docker run --detach \
            --name nginx \
            -p 443:443\
            -p 80:80 \
            -v /app/nginx/html:/usr/share/nginx/html:rw\
            -v /app/nginx/nginx.conf:/etc/nginx/nginx.conf/:rw\
            -v /app/nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf:rw\
            -v /app/nginx/logs:/var/log/nginx/:rw\
            -v /app/nginx/ssl:/ssl/:rw\
            -d nginx
    ```

    nginx.config文件，内容示例如下

    ```nginx
    #运行nginx的用户
    user  nginx;
    #启动进程设置成和CPU数量相等
    worker_processes  1;
    
    #全局错误日志及PID文件的位置
    error_log  /var/log/nginx/error.log warn;
    pid        /var/run/nginx.pid;
    
    #工作模式及连接数上限
    events {
            #单个后台work进程最大并发数设置为1024
        worker_connections  1024;
    }
    
    
    http {
        #设定mime类型
        include       /etc/nginx/mime.types;
        default_type  application/octet-stream;
    
        #设定日志格式
        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                          '$status $body_bytes_sent "$http_referer" '
                          '"$http_user_agent" "$http_x_forwarded_for"';
    
        access_log  /var/log/nginx/access.log  main;
    
        sendfile        on;
        #tcp_nopush     on;
    
        #设置连接超时的事件
        keepalive_timeout  65;
    
        #开启GZIP压缩
        #gzip  on;
    
        include /etc/nginx/conf.d/*.conf;
    }
    ```

    conf.d文件夹中，需要配置conf.d/default.conf文件，仅http请求，内容示例如下

    ```nginx
    server {
        listen    80;       #侦听80端口，如果强制所有的访问都必须是HTTPs的，这行需要注销掉
        server_name  www.buagengen.com;             #域名
    
        #charset koi8-r;
        #access_log  /var/log/nginx/host.access.log  main;
    
            # 定义首页索引目录和名称
        location / {
            root   /usr/share/nginx/html/blog;
            index  index.html index.htm;
        }
    
        #定义错误提示页面
        #error_page  404              /404.html;
    
        #重定向错误页面到 /50x.html
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
    ```

    conf.d文件夹中，需要配置conf.d/default.conf文件，支持https请求，内容示例如下

    ```nginx
    server {
        listen    80;       #侦听80端口，如果强制所有的访问都必须是HTTPs的，这行需要注销掉
        listen    443 ssl;
        server_name  www.buagengen.com;             #域名
    
        # 增加ssl
        #ssl on;        #如果强制HTTPs访问，这行要打开
        ssl_certificate /ssl/server.crt;
        ssl_certificate_key /ssl/server.key;
    
        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;
    
         # 指定密码为openssl支持的格式
         ssl_protocols  SSLv2 SSLv3 TLSv1.2;
    
         ssl_ciphers  HIGH:!aNULL:!MD5;  # 密码加密方式
         ssl_prefer_server_ciphers  on;   # 依赖SSLv3和TLSv1协议的服务器密码将优先于客户端密码
    
         # 定义首页索引目录和名称
         location / {
            root   /usr/share/nginx/html/blog;
            index  index.html index.htm;
         }
    
        #重定向错误页面到 /50x.html
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
    ```



### docker安装minio

1. 拉取镜像

    ```bash
    docker pull minio/minio
    ```

2. 启动容器

    ```bash
    docker run -d \
      -p 9000:9000 \
      -p 9090:9090 \
      --name minio \
      -v /app/minio/data:/data \
      -e "MINIO_ROOT_USER=username" \
      -e "MINIO_ROOT_PASSWORD=password" \
      minio/minio server /data --console-address ":9090"
    ```

    