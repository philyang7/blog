# Java代码块
这里记录一些简便有趣的Java代码段。

***
### 产生两个数之间的随机数
```
int pow = (int) Math.pow(10, 3); // 用于提取指定小数位
dateTrue = Math.floor((Math.random() * (max - min) + min) * pow) / pow;
```

***
### 数字格式化
```
NumberFormat nf = NumberFormat.getPercentInstance();//百分比格式
nf.setMinimumFractionDigits(0);//保留n位小数
nf.format(2.22);
```

***
### 删除重复数据且只留一条
```
delete from t_reception_visit_a16_copy1 
where  (visit_time,resident_id) in (select visit_time,resident_id  from t_reception_visit_a16_copy1 group by visit_time,resident_id  having count(1) > 1) 
and  id not in (select min(id) from t_reception_visit_a16_copy1 group by visit_time,resident_id having count(1)>1)
```

***
### 查询锁表进程
```
select concat('KILL ',id,';') from information_schema.processlist p inner
join information_schema.INNODB_TRX x on p.id=x.trx_mysql_thread_id where db='shequyun-sharding';
```

***
### esdump备份和恢复到文件
```
#备份
elasticdump  --input http://localhost:9200/syslog --output /home/syslog.json --type=data
#恢复
elasticdump --input /opt/shihuc/robotkdb.json --output "http://10.90.7.10:9200/robotkdb”
```

***
### es index相关
```
#创建一个index
curl -H “Content-Type:application/json” -XPUT http://localhost:9200/syslog
#查询所有index
GET：http://172.31.27.170:9200/_cat/indices?v
#删除指定index中所有数据
curl --location --request POST 'http://172.31.27.170:9200/t_person_wide_wgs/_delete_by_query' --header 'Content-Type: application/json' --data-raw '{
  "query": {
    "match_all": {}
  }
}'
```

***
### 批量执行sh命令
```
for file in ls /data/misc/scripttest/*.sh
do
nohup sh $file > $file.log &
done
```

***
### mat分析headdump
```
#m.hprof就是jvm的dump文件，在mat目录下会生成3份.zip结尾的报告和一些m.相关的文件，将生成的m.hprof相关的文件都下载到windows本地磁盘
./ParseHeapDump.sh m.hprof  org.eclipse.mat.api:suspects org.eclipse.mat.api:overview org.eclipse.mat.api:top_components
```

***
### logstash配置文件示例
```
input {
        stdin {}


        jdbc {
                type => "shequyun-sharding_t_community_org_a03"
                jdbc_connection_string => "jdbc:mysql://172.31.27.178:3306/shequyun-sharding?characterEncoding=UTF-8&autoReconnect=true&serverTimezone=GMT%2B8"
                jdbc_user => "root"
                jdbc_password => "communitycloud"
                jdbc_driver_library => "/home/logstash-7.10.0/mysql/mysql-connector-java-8.0.22.jar"
                jdbc_driver_class => "com.mysql.jdbc.Driver"
                connection_retry_attempts => "3"
                jdbc_validate_connection => "true"
                jdbc_validation_timeout => "3600"
                jdbc_paging_enabled => "true"
                jdbc_page_size => "500"
                statement => "SELECT id,cid,corg_name,pid,level,create_user,create_time,update_user,update_time,sys_org_code,del_flag,corg_order,icon,is_doorplate_node,node_typename,house_address,landlord_name,landlord_tel,remark,is_rent_out,org_code,is_keep_a_dog,dog_count,is_empty_close,person_count,house_count,zone_code,upper_cloud,tag_infos,car_info FROM `t_community_org_a03` WHERE update_time > :sql_last_value order by update_time asc"
                lowercase_column_names => false
                sql_log_level => warn
                record_last_run => true
                use_column_value => true
                tracking_column => "update_time"
                tracking_column_type => timestamp
                last_run_metadata_path => "mysql/last_id_community_org_a03.txt"
                clean_run => false
                schedule => "*/10 * * * * *"
                #设置默认时区，:sql_last_value的值就会从UTC转为设置的时区时间
                jdbc_default_timezone => "Asia/Shanghai"
        }

        jdbc {
                type => "shequyun-sharding_t_community_org_a16"
                jdbc_connection_string => "jdbc:mysql://172.31.27.178:3306/shequyun-sharding?characterEncoding=UTF-8&autoReconnect=true&serverTimezone=GMT%2B8"
                jdbc_user => "root"
                jdbc_password => "communitycloud"
                jdbc_driver_library => "/home/logstash-7.10.0/mysql/mysql-connector-java-8.0.22.jar"
                jdbc_driver_class => "com.mysql.jdbc.Driver"
                connection_retry_attempts => "3"
                jdbc_validate_connection => "true"
                jdbc_validation_timeout => "3600"
                jdbc_paging_enabled => "true"
                jdbc_page_size => "500"
                statement => "SELECT id,cid,corg_name,pid,level,create_user,create_time,update_user,update_time,sys_org_code,del_flag,corg_order,icon,is_doorplate_node,node_typename,house_address,landlord_name,landlord_tel,remark,is_rent_out,org_code,is_keep_a_dog,dog_count,is_empty_close,person_count,house_count,zone_code,upper_cloud,tag_infos,car_info FROM `t_community_org_a16` WHERE update_time > :sql_last_value order by update_time asc"
                lowercase_column_names => false
                sql_log_level => warn
                record_last_run => true
                use_column_value => true
                tracking_column => "update_time"
                tracking_column_type => timestamp
                last_run_metadata_path => "mysql/last_id_community_org_a16.txt"
                clean_run => false
                schedule => "*/10 * * * * *"
                #设置默认时区，:sql_last_value的值就会从UTC转为设置的时区时间
                jdbc_default_timezone => "Asia/Shanghai"
        }
}



output {

        if [type] == "shequyun-sharding_t_community_org_a03" {
                elasticsearch {
                        hosts => ["172.31.27.170:9200"]
                        index => "community_org_a03"
                        document_id => "%{id}"
                }
        }

        if [type] == "shequyun-sharding_t_community_org_a16" {
                elasticsearch {
                        hosts => ["172.31.27.170:9200"]
                        index => "community_org_a16"
                        document_id => "%{id}"
                }
        }

        stdout {
                codec => json_lines
        }
}
```
