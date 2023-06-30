# TDEngine

***
### TDEngine数据库 单机部署

 * 参考资料: 
   * [官方文档](https://docs.taosdata.com/deployment/deploy/)

1. 创建docker-compose.yml文件
    ```shell
    version: "3"
    services:
      tdengine:
        image: tdengine/tdengine:3.0.5.0
        container_name: tdengine
        hostname: tdengine
        restart: always
        ports:
          - "6030-6040:6030-6040/udp"
          - "6030:6030"
          - "6035:6035"
          - "6041:6041"
        environment:
          TZ: Asia/Shanghai
        volumes:
          - /iot/taosdata:/var/lib/taos/
          - /iot/taoslog:/var/log/taos/
    ```

### TDEngine数据库 集群部署

* 参考资料:
   * [官方文档](https://docs.taosdata.com/deployment/deploy/)
   * [集群部署](https://blog.csdn.net/firewater23/article/details/125793627)
   * [集群概念](https://blog.csdn.net/WhereIsHeroFrom/article/details/118160606)



1. 创建保存所有数据节点配置文件的目录,并编辑配置文件 taos.cfg
    ```shell
   #所有文件中都要编辑以下四项,以下示例3个数据节点的情况时分别如何设置
   
   firstEp                   td00:6030
   secondEp                  td00:6030
   fqdn                      td00
   serverPort                6030
   
   firstEp                    td00:6030
   secondEp                   td01:7030
   fqdn                       td01
   serverPort                 7030
    
   firstEp                    td00:6030
   secondEp                   td01:8030
   fqdn                       td02
   serverPort                 8030
    ```
2. 创建docker-compose.yml文件
   ```yaml
   version: "3"
   services:
     td00:
       image: tdengine/tdengine:3.0.5.0
       container_name: td00
       hostname: td00
       restart: always
       privileged: true
       ports:
           - 6020:6020
           - 6030-6042:6030-6042/tcp
           - 6030-6042:6030-6042/udp
       environment:
         TZ: Asia/Shanghai
       volumes:
         - /etc/localtime:/etc/localtime:ro
         - /iot/td00/taosdata:/var/lib/taos/
         - /iot/td00/taoslog:/var/log/taos/
         - ./etc00:/etc/taos
     
     td01:
       image: tdengine/tdengine:3.0.5.0
       container_name: td01
       hostname: td01
       restart: always
       privileged: true
       ports:
           - 7020:7020
           - 7030-7042:7030-7042/tcp
           - 7030-7042:7030-7042/udp
       environment:
         TZ: Asia/Shanghai
       volumes:
         - /etc/localtime:/etc/localtime:ro
         - /iot/td01/taosdata:/var/lib/taos/
         - /iot/td01/taoslog:/var/log/taos/
         - ./etc01:/etc/taos

     td02:
       image: tdengine/tdengine:3.0.5.0
       container_name: td02
       hostname: td02
       restart: always
       privileged: true
       ports:
           - 8020:8020
           - 8030-8042:8030-8042/tcp
           - 8030-8042:8030-8042/udp
       environment:
         TZ: Asia/Shanghai
       volumes:
         - /etc/localtime:/etc/localtime:ro
         - /iot/td02/taosdata:/var/lib/taos/
         - /iot/td02/taoslog:/var/log/taos/
         - ./etc02:/etc/taos
   ```
3. 启动docker
   ```shell
   docker-compose up -d
   ```

4. 配置集群
   ```shell
   # 进入master的docker容器
   docker exec -it td00 bash
   
   # 进入数据库命令行界面
   taos
   
   # 查看集群的数据节点
   show dnodes;
   
   # 将从节点加入集群
   create dnode "td01:7030";
   create dnode "td02:8030";
   
   # 创建数据库并设置分片数
   create database test replica 3;
   
   # 查看虚拟节点
   show vgroups;
   ```
   


    

