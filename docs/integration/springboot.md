# springboot相关集成

### springboot集成log trace
1. maven引入
    ```xml
    <!-- aop -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-aop</artifactId>
    </dependency>
    ```
    
2. log日志配置的xml中,加入traceId属性进行打印

3. java类
    * LogInterceptor.java
    
        嵌入traceId的aop
    
    ```java
    import org.slf4j.MDC;
    import org.springframework.web.servlet.HandlerInterceptor;
    import org.springframework.web.servlet.ModelAndView;
    import javax.servlet.http.HttpServletRequest;
    import javax.servlet.http.HttpServletResponse;
    import java.util.UUID;
    
    public class LogInterceptor implements HandlerInterceptor {
      
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
          //如果有上层调用就用上层的ID
          String traceId = request.getHeader("traceId");
          if (traceId == null) {
          	traceId = LogInterceptor.genUUID16();
        	}
            MDC.put("traceId", traceId);
            return true;
        }
      
        public static String genUUID16 () {
            int hashCodeV = UUID.randomUUID().toString().hashCode();
            //有可能是负数
            if(hashCodeV < 0) {
                hashCodeV = - hashCodeV;
            }
            return hashCodeV + "";
        }
    
    
        @Override
        public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        }
    
        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
                throws Exception {
            //调用结束后删除
            MDC.remove("traceId");
       }
    }
    ```

    *  ResourcesConfig.java

        注册拦截器
    ```java
    import com.hk.config.logtrace.LogInterceptor;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
    import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

    @Configuration
    public class ResourcesConfig implements WebMvcConfigurer {


        @Override
        public void addInterceptors(InterceptorRegistry registry) {
            registry.addInterceptor(initLogInterceptor()).addPathPatterns("/**");
        }


        @Bean
        public LogInterceptor initLogInterceptor() {
            return new LogInterceptor();
        }
    }
    ```
    
    * ThreadMdcUtil.java
    
        生成traceId的工具类
    
    ```java
    import org.slf4j.MDC;
    import java.util.Map;
    import java.util.concurrent.Callable;
    
    public class ThreadMdcUtil {
      
        public static void setTraceIdIfAbsent() {
          if (MDC.get("traceId") == null) {
            MDC.put("traceId", LogInterceptor.genUUID16());
          }
        }
    
        public static <T> Callable<T> wrap(final Callable<T> callable, final Map<String, String> context) {
            return () -> {
                if (context == null) {
                    MDC.clear();
                } else {
                    MDC.setContextMap(context);
                }
                setTraceIdIfAbsent();
                try {
                    return callable.call();
                } finally {
                    MDC.clear();
                }
            };
        }
    
        public static Runnable wrap(final Runnable runnable, final Map<String, String> context) {
            return () -> {
                if (context == null) {
                    MDC.clear();
                } else {
                    MDC.setContextMap(context);
                }
                setTraceIdIfAbsent();
                try {
                    runnable.run();
               } finally {
                    MDC.clear();
                }
            };
        }
    }
    ```
    
    * ThreadPoolExecutorMdcWrapper.java
    
        改造线程池,使支持traceId
    
    ```java
    import org.slf4j.MDC;
    import java.util.concurrent.*;
    
    public class ThreadPoolExecutorMdcWrapper extends ThreadPoolExecutor {
      
    public ThreadPoolExecutorMdcWrapper(int corePoolSize, int maximumPoolSize, long keepAliveTime, TimeUnit unit,
    BlockingQueue<Runnable> workQueue) {
        super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue);
    }
    
        public ThreadPoolExecutorMdcWrapper(int corePoolSize, int maximumPoolSize, long keepAliveTime, TimeUnit unit,
                                            BlockingQueue<Runnable> workQueue, ThreadFactory threadFactory) {
            super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, threadFactory);
        }
    
        public ThreadPoolExecutorMdcWrapper(int corePoolSize, int maximumPoolSize, long keepAliveTime, TimeUnit unit,
                                            BlockingQueue<Runnable> workQueue, RejectedExecutionHandler handler) {
            super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, handler);
        }
    
        public ThreadPoolExecutorMdcWrapper(int corePoolSize, int maximumPoolSize, long keepAliveTime, TimeUnit unit,
                                            BlockingQueue<Runnable> workQueue, ThreadFactory threadFactory,
                                            RejectedExecutionHandler handler) {
            super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, threadFactory, handler);
        }
    
        /**
         * 创建"无限容量"的线程池,会根据需要创建新线程,一定程度上减少开销.
         */
        public ThreadPoolExecutorMdcWrapper() {
            super(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS, new SynchronousQueue<Runnable>());
        }
    
        @Override
        public void execute(Runnable task) {
            super.execute(ThreadMdcUtil.wrap(task, MDC.getCopyOfContextMap()));
        }
    
        @Override
        public <T> Future<T> submit(Runnable task, T result) {
            return super.submit(ThreadMdcUtil.wrap(task, MDC.getCopyOfContextMap()), result);
        }
    
        @Override
        public <T> Future<T> submit(Callable<T> task) {
            return super.submit(ThreadMdcUtil.wrap(task, MDC.getCopyOfContextMap()));
        }
    
        @Override
        public Future<?> submit(Runnable task) {
            return super.submit(ThreadMdcUtil.wrap(task, MDC.getCopyOfContextMap()));
        }
    }
    ```

### springboot集成websocket

1. maven引入jar包

    ```xml
    <dependency>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    ```

2. java类

    * SemaphoreUtils.java

    ```java
    import lombok.extern.slf4j.Slf4j;

    import java.util.concurrent.Semaphore;

    /**
    * 信号量相关处理
    */
    @Slf4j
    public class SemaphoreUtils
    {

       /**
        * 获取信号量
        */
       public static boolean tryAcquire(Semaphore semaphore) {
           boolean flag = false;
           try {
               flag = semaphore.tryAcquire();
           } catch (Exception e) {
               log.error("获取信号量异常", e);
           }
           return flag;
       }

       /**
        * 释放信号量
        */
       public static void release(Semaphore semaphore) {
           try {
               semaphore.release();
           } catch (Exception e) {
               log.error("释放信号量异常", e);
           }
       }
    }
    ```

    * WebSocketConfig.java
    ```java
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.web.socket.server.standard.ServerEndpointExporter;

    /**
    * websocket 配置
    */
    @Configuration
    public class WebSocketConfig {
       @Bean
       public ServerEndpointExporter serverEndpointExporter() {
           return new ServerEndpointExporter();
       }
    }
    ```

    * WebSocketServer.java
    ```java
    import lombok.extern.slf4j.Slf4j;
    import org.springframework.stereotype.Component;

    import javax.websocket.*;
    import javax.websocket.server.ServerEndpoint;
    import java.util.concurrent.Semaphore;

    /**
    * websocket 消息处理
    */
    @Slf4j
    @Component
    @ServerEndpoint("/websocket/message")
    public class WebSocketServer {
        /**
        * 默认最多允许同时在线人数100
        */
        public static int socketMaxOnlineCount = 100;

        private static Semaphore socketSemaphore = new Semaphore(socketMaxOnlineCount);

        /**
        * 连接建立成功调用的方法
        */
        @OnOpen
        public void onOpen(Session session) throws Exception {
           boolean semaphoreFlag = false;
           // 尝试获取信号量
           semaphoreFlag = SemaphoreUtils.tryAcquire(socketSemaphore);
           if (!semaphoreFlag) {
               // 未获取到信号量
               log.error("当前在线人数超过限制数- {}", socketMaxOnlineCount);
               WebSocketUsers.sendMessageToUserByText(session, "当前在线人数超过限制数：" + socketMaxOnlineCount);
               session.close();
           } else {
               // 添加用户
               WebSocketUsers.put(session.getId(), session);
               log.info("建立连接 - {}", session);
               log.info("当前人数 - {}", WebSocketUsers.getUsers().size());
               WebSocketUsers.sendMessageToUserByText(session, "连接成功");
           }
        }

        /**
        * 连接关闭时处理
        */
        @OnClose
        public void onClose(Session session) {
           log.info("关闭连接 - {}", session);
           // 移除用户
           WebSocketUsers.remove(session.getId());
           // 获取到信号量则需释放
           SemaphoreUtils.release(socketSemaphore);
        }

        /**
        * 抛出异常时处理
        */
        @OnError
        public void onError(Session session, Throwable exception) throws Exception {
           if (session.isOpen()) {
               // 关闭连接
               session.close();
           }
           String sessionId = session.getId();
           log.info("连接异常 - {}", sessionId);
           log.info("异常信息 - {}", exception);
           // 移出用户
           WebSocketUsers.remove(sessionId);
           // 获取到信号量则需释放
           SemaphoreUtils.release(socketSemaphore);
        }

        /**
        * 服务器接收到客户端消息时调用的方法
        */
        @OnMessage
        public void onMessage(String message, Session session) {
           WebSocketUsers.sendMessageToUserByText(session, message);
        }
    }
    ```

    * WebSocketUsers.java
    ```java
    import lombok.extern.slf4j.Slf4j;

    import javax.websocket.Session;
    import java.io.IOException;
    import java.util.Collection;
    import java.util.Map;
    import java.util.Set;
    import java.util.concurrent.ConcurrentHashMap;

    /**
     * websocket 客户端用户集
     */
    @Slf4j
    public class WebSocketUsers {
        /**
         * 用户集
         */
        private static Map<String, Session> USERS = new ConcurrentHashMap<>();

        /**
         * 存储用户
         *
         * @param key 唯一键
         * @param session 用户信息
         */
        public static void put(String key, Session session) {
            USERS.put(key, session);
        }

        /**
         * 移除用户
         *
         * @param session 用户信息
         * @return 移除结果
         */
        public static boolean remove(Session session) {
            String key = null;
            boolean flag = USERS.containsValue(session);
            if (flag) {
                Set<Map.Entry<String, Session>> entries = USERS.entrySet();
                for (Map.Entry<String, Session> entry : entries) {
                    Session value = entry.getValue();
                    if (value.equals(session)) {
                        key = entry.getKey();
                        break;
                    }
                }
            } else {
                return true;
            }
            return remove(key);
        }

        /**
         * 移出用户
         *
         * @param key 键
         */
        public static boolean remove(String key){
            log.info("\n 正在移出用户 - {}", key);
            Session remove = USERS.remove(key);
            if (remove != null) {
                boolean containsValue = USERS.containsValue(remove);
                log.info("\n 移出结果 - {}", containsValue ? "失败" : "成功");
                return containsValue;
            } else {
                return true;
            }
        }

        /**
         * 获取在线用户列表
         *
         * @return 返回用户集合
         */
        public static Map<String, Session> getUsers() {
            return USERS;
        }

        /**
         * 群发消息文本消息
         *
         * @param message 消息内容
         */
        public static void sendMessageToUsersByText(String message) {
            Collection<Session> values = USERS.values();
            for (Session value : values) {
                sendMessageToUserByText(value, message);
            }
        }

        /**
         * 发送文本消息
         *
         * @param session 自己的用户名
         * @param message 消息内容
         */
        public static void sendMessageToUserByText(Session session, String message) {
            if (session != null) {
                try {
                    session.getBasicRemote().sendText(message);
                } catch (IOException e) {
                    log.error("\n[发送消息异常]", e);
                }
            }
            else
            {
                log.info("\n[你已离线]");
            }
        }
    }
    ```


### springboot集成redis缓存自定义过期时间

1. RedisCacheConfig.java
    ```java
    import com.fasterxml.jackson.annotation.JsonInclude;
    import com.fasterxml.jackson.annotation.JsonTypeInfo;
    import com.fasterxml.jackson.databind.MapperFeature;
    import com.fasterxml.jackson.databind.ObjectMapper;
    import com.fasterxml.jackson.databind.SerializationFeature;
    import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
    import org.springframework.cache.annotation.EnableCaching;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.context.annotation.Primary;
    import org.springframework.data.redis.cache.RedisCacheConfiguration;
    import org.springframework.data.redis.cache.RedisCacheManager;
    import org.springframework.data.redis.connection.RedisConnectionFactory;
    import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
    import org.springframework.data.redis.serializer.RedisSerializationContext;

    import java.time.Duration;

    /**
     * redis缓存配置
     */
    @Configuration
    @EnableCaching
    public class RedisCacheConfig {


        @Bean
        public RedisCacheManager cacheManager1Minute(RedisConnectionFactory connectionFactory) {
            RedisCacheConfiguration config = instanceConfig(60 * 1 * 1L);
            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(config)
                    .transactionAware()
                    .build();
        }

        @Bean
        @Primary
        public RedisCacheManager cacheManager10Minute(RedisConnectionFactory connectionFactory) {
            RedisCacheConfiguration config = instanceConfig(60 * 10 * 1L);
            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(config)
                    .transactionAware()
                    .build();
        }

        @Bean
        public RedisCacheManager cacheManager1Hour(RedisConnectionFactory connectionFactory) {
            RedisCacheConfiguration config = instanceConfig(3600 * 1 * 1L);
            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(config)
                    .transactionAware()
                    .build();
        }

        @Bean
        public RedisCacheManager cacheManager1Day(RedisConnectionFactory connectionFactory) {
            RedisCacheConfiguration config = instanceConfig(3600 * 24 * 1L);
            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(config)
                    .transactionAware()
                    .build();
        }


        private RedisCacheConfiguration instanceConfig(Long ttl) {

            Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            objectMapper.registerModule(new JavaTimeModule());
            // 去掉各种@JsonSerialize注解的解析
            objectMapper.configure(MapperFeature.USE_ANNOTATIONS, false);
            // 只针对非空的值进行序列化
            objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
            // 将类型序列化到属性json字符串中
            objectMapper.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);

            jackson2JsonRedisSerializer.setObjectMapper(objectMapper);
            return RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofSeconds(ttl))
                    .disableCachingNullValues()
                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jackson2JsonRedisSerializer));

        }

    }
    ```    


