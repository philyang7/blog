# docker-compose

[docker相关目录下载](https://file.philyang.site/blog/docker.zip)

***

### docker-compose命令
```shell
# 编译启动
docker-compose up -d xxx

# 停止所有mysql 容器
docker-compose stop mysql

# 清理缓存配置
docker-compose build --no-cache mysql

# 重启docker在操作
docker-compose build mysql

# 加载容器
docker-compose up  mysql

```

***

### docker-compose安装mysql
1. 编写docker-compose文件
```yaml
version : '3'
services:

  mysql:
    container_name: mysql
    image: mysql:8.0
    ports:
      - "3306:3306"
    volumes:
      - ./mysql/conf:/etc/mysql/conf.d
      - ./mysql/logs:/logs
      - ./mysql/data:/var/lib/mysql
    command: [
          'mysqld',
          '--innodb-buffer-pool-size=80M',
          '--character-set-server=utf8mb4',
          '--collation-server=utf8mb4_unicode_ci',
          '--default-time-zone=+8:00',
          '--lower-case-table-names=1'
        ]
    environment:
      # root密码
      MYSQL_ROOT_PASSWORD: 123456
      # mysql库名
      MYSQL_DATABASE: 'app-db'
      # 时区上海
      TZ: Asia/Shanghai
```

***

### docker-compose安装redis
1. 编写docker-compose文件
```yaml
version : '3'
services:

  redis:
    container_name: redis
    image: redis
    ports:
      - "6379:6379"
    volumes:
      - ./redis/data:/data
      - ./redis/logs:/logs
      - ./redis/conf/redis.conf:/docker/redis/redis.conf
    command: redis-server /docker/redis/redis.conf
    environment:
      # 时区上海
      TZ: Asia/Shanghai
```

***

### docker-compose运行jar
1. 编写server-dockerfile文件
```dockerfile
# 基础镜像
FROM java:8
# author
MAINTAINER philyang

# 创建目录
RUN mkdir -p /home/docker/server
# 指定路径
WORKDIR /home/docker/server
# 复制jar文件到路径
COPY ./server/jar/*.jar /home/docker/server/app.jar
# 启动应用
ENTRYPOINT ["java","-jar","app.jar"]
```

2. 编写docker-compose文件
```yaml
version : '3'
services:

  server:
    container_name: app-server
    build:
      context: .
      dockerfile: server-dockerfile
    ports:
      - "8080:8080"
    volumes:
      - ./server/logs:/home/docker/server/logs
      - ./server/db:/home/docker/server/db
      - ./server/uploadPath:/home/docker/server/uploadPath
    depends_on:
      # 此服务依赖的其他服务
      - app-mysql
      - app-redis
    links:
      # 扩展网络
      - app-mysql
      - app-redis
    environment:
      # 时区上海
      TZ: Asia/Shanghai
    # 开机自启
    restart: always
```

***

### docker-compose安装nginx
1. 编写nginx-compose文件
```yaml
version : '3'
services:

  nginx:
    container_name: nginx
    image: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/html:/docker/nginx/html
      - ./nginx/logs:/var/log/nginx
      - ./nginx/conf/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/docker/nginx/ssl
      - /etc/letsencrypt:/etc/letsencrypt
    privileged: true
    environment:
      # 时区上海
      TZ: Asia/Shanghai
```

***

### docker-compose安装minio
1. 编写minio-compose文件
```yaml
version : '3'
services:

   minio:
    container_name: minio
    image: minio/minio
    ports:
      - "9000:9000"
      - "9090:9090"
    volumes:
      - ./minio/data:/data
      - .minio/config:/root/.minio
    environment:
      MINIO_ACCESS_KEY: "minioadmin"
      MINIO_SECRET_KEY: "YANGfei666!"
      TZ: Asia/Shanghai
    command: server /data --console-address ":9090"

```

***

### docker-compose安装nexus
```yaml
version : '3'
services:

   nexus:
    #restart: always
    container_name: nexus
    image: sonatype/nexus3:3.29.0
    ports:
      - "8081:8081"
    volumes:
      - ./nexus/data:/nexus-data

```