# Debug

***
### 排查OOM

OOM，最常见的原因为:
- 内存分配确实过小，而正常业务使用了大量内存
- 某一个对象被频繁申请，却没有释放，内存不断泄漏，导致内存耗尽
- 某一个资源被频繁申请，系统资源耗尽，例如：不断创建线程，不断发起网络连接  

`ps: 无非“本身资源不够”,“申请资源太多”,“资源耗尽”几个原因`

1. 确认是不是内存本身就分配过小
    ```bash
    $ jmap -heap 11897
    
    Attaching to process ID 11897, please wait...
    Debugger attached successfully.
    Server compiler detected.
    JVM version is 25.201-b09
    
    using thread-local object allocation.
    Parallel GC with 2 thread(s)
    
    Heap Configuration:
       MinHeapFreeRatio         = 0
       MaxHeapFreeRatio         = 100
       MaxHeapSize              = 994050048 (948.0MB)
       NewSize                  = 20971520 (20.0MB)
       MaxNewSize               = 331350016 (316.0MB)
       OldSize                  = 41943040 (40.0MB)
       NewRatio                 = 2
       SurvivorRatio            = 8
       MetaspaceSize            = 21807104 (20.796875MB)
       CompressedClassSpaceSize = 1073741824 (1024.0MB)
       MaxMetaspaceSize         = 17592186044415 MB
       G1HeapRegionSize         = 0 (0.0MB)
    
    Heap Usage:
    PS Young Generation
    Eden Space:
       capacity = 138412032 (132.0MB)
       used     = 124075208 (118.32733917236328MB)
       free     = 14336824 (13.672660827636719MB)
       89.64192361542673% used
    From Space:
       capacity = 1048576 (1.0MB)
       used     = 737840 (0.7036590576171875MB)
       free     = 310736 (0.2963409423828125MB)
       70.36590576171875% used
    To Space:
       capacity = 6815744 (6.5MB)
       used     = 0 (0.0MB)
       free     = 6815744 (6.5MB)
       0.0% used
    PS Old Generation
       capacity = 662700032 (632.0MB)
       used     = 647653448 (617.6504592895508MB)
       free     = 15046584 (14.349540710449219MB)
       97.72950305214411% used
    ```
   
2. 找到最耗内存的对象
    ```bash
    $ jmap -histo:live 11897 | more
             
     num     #instances         #bytes  class name
    ----------------------------------------------
       1:       1494121      134108856  [C
       2:        603943       53146984  java.lang.reflect.Method
       3:       1167591       37362912  java.util.concurrent.ConcurrentHashMap$Node
       4:       1488224       35717376  java.lang.String
       5:        542736       35549048  [Ljava.lang.Object;
       6:        835229       33409160  java.util.LinkedHashMap$Entry
       7:        206555       23429528  java.lang.Class
       8:        267657       19133392  [Ljava.util.HashMap$Node;
       9:        278592       15601152  java.util.LinkedHashMap
      10:         68071       14952936  [B
      11:        503312       12079488  java.util.ArrayList
      12:          5931       11884192  [Ljava.util.concurrent.ConcurrentHashMap$Node;
      13:        237493        7599776  java.util.HashMap$Node
      14:        264970        5859048  [Ljava.lang.Class;
      15:        283757        4540112  java.lang.Object
      16:         82139        4525200  [I
      17:         74989        3599472  java.util.HashMap
      18:        123002        3291616  [Ljava.lang.String;
      19:         38106        2743632  java.lang.reflect.Field
      20:         63147        2525880  java.lang.ref.SoftReference
      21:         92884        2229216  sun.reflect.generics.tree.SimpleClassTypeSignature
      22:         26064        2085120  java.lang.reflect.Constructor
      23:         64346        2059072  java.util.LinkedList
      24:         64061        2049952  java.lang.ref.WeakReference
      25:         77475        1859400  java.util.LinkedList$Node
      26:         92884        1749976  [Lsun.reflect.generics.tree.TypeArgument;
      27:         69959        1679016  sun.reflect.annotation.AnnotationInvocationHandler
      28:        101073        1617168  java.util.LinkedHashMap$LinkedEntrySet
    ```
    * 如果发现某类对象占用内存很大（例如几个G），很可能是类对象创建太多，且一直未释放。例如：
        * 申请完资源后，未调用close()或dispose()释放资源
        * 消费者消费速度慢（或停止消费了），而生产者不断往队列中投递任务，导致队列中任务累积过多  
        
    `ps：线上执行该命令会强制执行一次fgc。另外还可以dump内存进行分析。`
    
3. 确认是否是资源耗尽  
工具：
    - pstree
    - netstat  
    
- 查看进程创建的线程数，以及网络连接数，如果资源耗尽，也可能出现OOM
    ```bash
    $ ll /proc/${PID}/fd        #查看句柄详情 or pstree -p ${PID} | wc -l
    $ ll /proc/${PID}/task      #查看线程数
    ```
- 例如，某一台线上服务器的sshd进程PID是4943
    ```bash
    $ ll /proc/4943/fd
    总用量 0
    lr-x------ 1 root root 64 11月 27 15:24 0 -> /dev/null
    lrwx------ 1 root root 64 11月 27 15:24 1 -> /dev/null
    lrwx------ 1 root root 64 11月 27 15:24 2 -> /dev/null
    lrwx------ 1 root root 64 11月 27 15:24 3 -> socket:[21019]
  
    $ ll /proc/4943/task
    总用量 0
    dr-xr-xr-x 7 root root 0 11月 21 15:08 4943 
    ```
- 如上，sshd共占用了四个句柄  
    - 0 -> 标准输入
    - 1 -> 标准输出
    - 2 -> 标准错误输出
    - 3 -> socket（容易想到是监听端口） 
     
    且sshd只有一个主线程PID为4943，并没有多线程。