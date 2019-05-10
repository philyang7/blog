# Java基础


这里记录一些平时看到的java基础。


***
### 散列 HashCode

线性查询是最慢的查询方式，所以，将键值按照一定的顺序排序，并且使用二分查找能够有效的提升速度。散列将键保存在数组中(数组的查询速度最快)，用数组来表示键的信息，但是由于Map的容量是可变的，而数组的容量是不变的。所以数组中存的并不是键本身，而是键对象生成的一个数字，将其作为数组的下标，这个数字就是散列码，配合equals来确定键值。查询的过程首先就是计算散列码，然后用散列码来查询函数(下标)，通常，我们的数组中保存的是值的list，因此，我们计算出散列码之后，通过下标取到的对应部分的list，然后通过equals就可以快速找到键值。


***
### 8种基本数据类型

+ 浮点型（有符号类型）：float(4 byte), double(8 byte)
+ 整型（有符号类型）：byte(1 byte), short(2 byte), int(4 byte) , long(8 byte)
+ 字符型（无符号类型）: char(2 byte)，取值范围为0~2^16-1
+ 布尔型: boolean(JVM规范没有明确规定其所占的空间大小，仅规定其只能够取字面值"true"和"false")

对于这8种基本数据类型的变量，变量直接存储的是“值”，因此在用关系操作符==来进行比较时，比较的就是 “值” 本身。
1. 对于==，如果作用于基本数据类型的变量，则直接比较其存储的 “值”是否相等；
如果作用于引用类型的变量，则比较的是所指向的对象的地址
2. 对于equals方法，注意：equals方法不能作用于基本数据类型的变量
如果没有对equals方法进行重写，则比较的是引用类型的变量所指向的对象的地址；
诸如String、Date等类对equals方法进行了重写的话，比较的是所指向的对象的内容。


***
### Map、List、Set

> Map

1. Map是一种保存key-value形式对象的集合，实现类：HashMap，HashTable，TreeMap，LinkedHashMap
2. HashMap：Java 1.2引进的Hashtable的升级版，线程不安全，允许一个 null 键和多个 null 值
3. Hashtable：线程安全的，不允许 null 键和 null 值
4. LinkedHashMap：类似于HashMap，但是在迭代访问时更快，因为它使用链表维护内部次序，取得“键值对”的顺序是其插入次序
5. TreeMap：基于红黑树数据结构的实现，可以自定义排序

> List

1. List继承自Collection接口，实现类：LinkedList，ArrayList，Vector
2. 元素有放入顺序，元素可重复。
3. ArrayList：由数组实现的List，允许对元素进行快速随机访问，但是向List中间插入与删除元素的速度很慢。ListIterator只应该用来由后向前遍历 ArrayList,而不是用来插入和移除元素。因为那比LinkedList开销要大很多。 
4. LinkedList ：对顺序访问进行了优化，向List中间插入与删除的开销并不大。随机访问则相对较慢。还具有下列方 法：addFirst(), addLast(), getFirst(), getLast(), removeFirst() 和 removeLast(), 这些方法使得LinkedList可以当作堆栈、队列和双向队列使用。
5. Vector：非常类似ArrayList，但是Vector是同步的

> Set

1. Set继承自Collection接口，实现类：HashSet(底层由HashMap实现)，LinkedHashSet，TreeSet
2. 元素无放入顺序，元素不可重复（注意：元素虽然无放入顺序，但是元素在set中的位置是有该元素的HashCode决定的，其位置其实是固定的） 。
3. HashSet：为快速查找设计的Set。存入HashSet的对象必须定义hashCode()。
4. TreeSet： 保存有次序的Set, 底层为树结构。使用它可以从Set中提取有序的序列。
5. LinkedHashSet：具有HashSet的查询速度，且内部使用链表维护元素的顺序(插入的次序)。于是在使用迭代器遍历Set时，结果会按元素插入的次序显示。


***
### 红黑树（红黑二叉树）

TreeSet是依靠TreeMap实现的，TreeMap的实现是红黑树（红黑二叉树）算法的实现。规则：
1. 值大于节点往右找，反之亦然
2. 每个节点都只能是红色或者黑色
3. 根节点是黑色
4. 每个叶节点（NIL节点，空节点）是黑色的。
5. 如果一个结点是红的，则它两个子节点都是黑的。也就是说在一条路径上不能出现相邻的两个红色结点。
6. 从任一节点到其每个叶子的所有路径都包含相同数目的黑色节点。

![avatar](/img/java/1.png)
