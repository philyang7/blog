# 分布式事务解决数据一致性



#### 示例解决方案1

```java
try{
	conn = DriveManager.getConnection(jdbc:mysqlxxxxxxxx);
  stmt = conn.createStatement();
  
  //数据库生成订单操作
  stmt.executeUpdate("insert xx values xx");
  //生成发送的消息内容
  MsgObject MsgContent(orderID);
  //发送消息
  MQClient.sendMsg(MsgContent);
  //事务提交
  conn.commit();
} catch (Exception e) {
  log.error(e);
  try{
    //操作不成功则回退
    conn.rollback();
  } catch (Exception e1) {
    log.error(e1);
  }
}
```

#### 存在的问题：

- 当发送MQ时，超时或者无法判断MQ是否发送成功时，则无法保证一致性。
- 如果MQ发送成功，但是DB提交失败，则消息已经发送出去了，无法保证一致性。



### 分布式事务分类

- 刚性分布式事务

  - 强一致性

    ACID=原子性（Atomicity）、一致性（Consistency）、**隔离性**（Lsolation）、持久性（Durability）

  - XA模型

- 柔性分布式事务

  - 最终一致性

  - CAP、BASE理论

    CAP：分布式环境下P一定需要，CA权衡折中。

    BASE：

    	- Basically Available 基本可用
    	- Soft state 柔性状态
    	- Eventual consistency 最终一致性

  - TCC模型

  - Sage模型

### XA模型

- XA模型由AP、RM、TM组成
  - 应用程序（Application Program）：定义事务边界(定义事务开始和结束)并访问事务边界内的资源。
  - 资源管理器（Resouce Manager）：管理计算机共享的资源（数据库等）
  - 事务管理器（Transaction Manager）：负责管理全局事务，分配事务唯一标识，监控事务的执行进度，负责事务的提交，回滚，失败恢复等。

- 二阶段提交，是XA规范标准实现。

- 过程：
  - TM发起prepare投票。
  - RM都同意后，TM再发起commit。
  - commit过程出现宕机等异常，节点服务重启后，根据XA recover再次进行commit补偿。
- 缺点：
  - 同步阻塞模型
  - 数据库资源锁定时间很长
  - 全局锁（隔离级别串行化），并发低
  - 不适合长事务场景



### TCC模型

- Try-Confirm-Cancel
- TCC模型完全交友业务实现，每个子业务都需要实现TCC接口。**对业务侵入大；资源锁定交由业务方**
- Try：尝试执行业务，完成所有业务检查，预留必要的业务资源
- Confirm：真正执行业务，不再做业务检查
- Cancel：释放Try阶段预留的业务资源



### Saga模型

- 把一个分布式事务拆分为多个本地事务，每个本地事务都有相应的执行模块和补偿模块(对应TCC中的Confirm和Cancel)。
- 当Saga事务中任意一个本地事务出错时，可以通过调用相关的补偿方法恢复之前的事务，达到事务最终一致性。
- 当每个子事务T1,T2…Tn都有对应的补偿定义C1,C2…**Cn-1**
  - 最佳情况T1,T2…Tn成功完成
  - 或者T1,T2…Tj，Cj-1…C2,c1，0<j<n得以完成。意思就是一旦有事务执行失败，就依次执行反向补偿。
- 隔离性
  - 业务层控制并发
    - 在应用层加锁
    - 应用层预先冻结资源
- 恢复方式
  - 向后恢复
  - 向前恢复

### 特性比较

|          |    刚性事务    |     柔性事务     |
| :------: | :------------: | :--------------: |
| 业务改造 |       无       |        有        |
|   回滚   |      支持      |   实现补偿接口   |
|  一致性  |     强一致     |     最终一致     |
|  隔离性  |    原生支持    | 实现资源锁定接口 |
| 并发性能 |    严重衰退    |     略微衰退     |
| 适合场景 | 短事务并发较低 |   长事务高并发   |



### 异步场景分布式事务设计

#### 方案一：业务方提供本地操作成功回查功能

- MQ分布式事务消息设计
  - MQ事务消息设计事务消息作为一种异步确保性事务，将两个事务分支通过MQ进行异步解耦，MQ事务消息的设计流程同样借鉴了两段提交理论
  - 1.事务发起方首先发送prepare消息到MQ
  - 2.在发送prepare消息成功后执行本地事务
  - 3.根据本地事务执行结果返回commit或者rollback
  - 4.如果消息是rollback，MQ将删除该prepare消息不进行下发，如果是commit消息，MQ将会消息发送给consumer段
  - 5.如果执行本地事务过程中，执行端挂掉，或者超时，MQ服务器端将不停的询问producer来获取事务状态（**半消息状态**）
  - 6.Consumer端的消费成功机制有MQ保证

![1](/img/distributed/2.png)

- 优点：

  - 通用

- 缺点

  - 业务方需要提供回查接口，业务侵入较大

  - 发送消息非幂等

  - 消费端需要处理幂等

    

#### 方案二：本地事务消息表

- ​	本地操作和发送消息通过本地事务强一致性

  - 本地事务操作表

  - 本地事务消息表

    - mqMessages(msgid，content，topic，status)

    

![3](/img/distributed/3.png)



- 发送端消息不幂等
  - At least once
  - Only once
  - At more once
- 消费端处理消息幂等
  - 分布式锁
- T1->T2->T3
  - T1、T2成功，T3失败
    - 记录错误日志
    - 报警
    - 人工介入
- 优点
  - 业务侵入小



