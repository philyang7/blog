# Java进阶


一些面试可能需要了解的知识.


***
### HashMap里的hashcode方法和equal方法重写

***使用HashMap，如果key是自定义的类，就必须重写hashcode()和equals()。***

HashMap中的比较key是先求出key的hashcode(),比较其值是否相等，若相等再比较equals(),若相等则认为他们是相等的。因为自定义的类的hashcode()方法继承于Object类，其hashcode码为默认的内存地址，则即便有相同含义的两个对象，比较也是不相等的。

例如，生成了两个“羊”对象，正常理解这两个对象应该是相等的，但如果你不重写 hashcode（）方法的话，比较是不相等的！HashMap用来判断key是否相等的方法，其实是调用了HashSet判断加入元素是否相等。




