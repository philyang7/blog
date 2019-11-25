# Redis



### springboot配置rediskey失效回调



redis的配置

> - 修改`redis.conf`文件
>
> - notify-keyspace-events "Ex"，该配置表示监听key的过期事件，默认未开启。
>
> - ```java
>   # K    键空间通知，以__keyspace@<db>__为前缀
>   # E    键事件通知，以__keysevent@<db>__为前缀
>   # g    del , expipre , rename 等类型无关的通用命令的通知, ...
>   # $    String命令
>   # l    List命令
>   # s    Set命令
>   # h    Hash命令
>   # z    有序集合命令
>   # x    过期事件（每次key过期时生成）
>   # e    驱逐事件（当key在内存满了被清除时生成）
>   # A    g$lshzxe的别名，因此”AKE”意味着所有的事件
>   ```



创建redis配置类，同时注册监听

```java
@Configuration
public class RedisConfiguration {

    @Autowired
    private RedisConnectionFactory redisConnectionFactory;

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer() {
        RedisMessageListenerContainer redisMessageListenerContainer = new RedisMessageListenerContainer();
        redisMessageListenerContainer.setConnectionFactory(redisConnectionFactory);
        return redisMessageListenerContainer;
    }

    @Bean
    public KeyExpiredListener keyExpiredListener() {
        return new KeyExpiredListener(this.redisMessageListenerContainer());
    }
}
```



创建监听类，此种方法是监听所有redis分片中的key过期事件，因为KeyExpirationEventMessageListener类中默认配置是全分片，如果需要自定义配置监听，可继承重写JedisPubSub类。[[参考资料](https://www.cnblogs.com/ruiati/p/6655949.html)]

```java
public class KeyExpiredListener extends KeyExpirationEventMessageListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(KeyExpiredListener.class);

    public KeyExpiredListener(RedisMessageListenerContainer listenerContainer) {
        super(listenerContainer);
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String channel = new String(message.getChannel(), StandardCharsets.UTF_8);
        //过期的key
        String key = new String(message.getBody(),StandardCharsets.UTF_8);
        LOGGER.info("redis key 过期：pattern={},channel={},key={}",new String(pattern),channel,key);
    }
}
```



### spring-data-redis 默认序列化方式导致key乱码

spring-data-redis的RedisTemplate<K, V>模板类在操作redis时默认使用JdkSerializationRedisSerializer来进行序列化，如下

```java
private boolean enableDefaultSerializer = true;
private RedisSerializer<?> defaultSerializer = new JdkSerializationRedisSerializer();
private RedisSerializer keySerializer = null;
private RedisSerializer valueSerializer = null;
private RedisSerializer hashKeySerializer = null;
private RedisSerializer hashValueSerializer = null;
```



解决办法：

```java
private RedisTemplate redisTemplate;

@Autowired(required = false)
public void setRedisTemplate(RedisTemplate redisTemplate) {
    RedisSerializer stringSerializer = new StringRedisSerializer();
    redisTemplate.setKeySerializer(stringSerializer);
    redisTemplate.setValueSerializer(stringSerializer);
    redisTemplate.setHashKeySerializer(stringSerializer);
    redisTemplate.setHashValueSerializer(stringSerializer);
    this.redisTemplate = redisTemplate;
}
```



也可使用其他序列化方式。[参考资料](https://blog.csdn.net/xiaolyuh123/article/details/78682200)

