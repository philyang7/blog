# jenkins持续集成

***
### 部署java项目
1. shell1
```bash
mvn clean package -DskipTests -U
```
2. shell2
```bash
echo 'stop app...'
ssh root@192.168.0.204 '/app/zx-open-platform/script/stop-app.sh'
```
```bash
#! /usr/bin/bash

app_name=zx-open-platform
app_version=1.0.0

str=$(ps -ef|grep $app_name-$app_version.jar|grep -v 'grep'|awk '{print $2}')

echo kill -9 $str
kill -9 $str

if [ '$?' -eq 0 ];then
  echo kill $app_name Success,pid=$str
else
  echo kill $app_name Failed,pid=$str
fi
```

3. shell3
```bash
echo 'copy jar...'
scp ./target/zx-open-platform-1.0.0.jar root@192.168.0.204:/app/zx-open-platform
```

4.shell4
```bash
echo 'start app...'
ssh root@192.168.0.204 '/app/zx-open-platform/script/start-app.sh'
```
```bash
#! /usr/bin/bash 

export JAVA_HOME=/usr/local/java/jdk-11.0.2
export PATH=$JAVA_HOME/bin:$PATH

app_name=zx-open-platform
app_version=1.0.0

JMX_PORT=9081
JMX_OPS=-javaagent:/app/jmx-reporter/jmx_prometheus_javaagent-0.16.1.jar=$JMX_PORT:/app/jmx-reporter/jmx_exporter_config.yml

SW_OPS=-javaagent:/app/skywalking/agent/skywalking-agent.jar=agent.service_name=$app_name,collector.backend_service=192.168.0.203:11800

cd /app/$app_name
nohup java $JMX_OPS $SW_OPS -jar /app/$app_name/$app_name-$app_version.jar --spring.profiles.active=sit -Djava.awt.headless=true > /app/$app_name/run.$app_name.log 2>&1 &
```


***
### 生成jar包到maven私服
1. shell1
```bash
mvn clean package -DskipTests -U
```

2. shell3
```bash
jar_version=1.0.3
mvn deploy:deploy-file -Dfile=./target/zx-bank-front-api-$jar_version.jar -DgroupId=com.zxjztech.bank -DartifactId=zx-bank-front-api -Dversion=$jar_version -Dpackaging=jar  -Durl=http://192.168.0.12:8081/repository/maven-zxtech/ -DrepositoryId=maven-zxtech

```


***
### 
