# Java代码块


这里记录一些简便有趣的Java代码段。


***
### 产生两个数之间的随机数

```
int pow = (int) Math.pow(10, 3); // 用于提取指定小数位
dateTrue = Math.floor((Math.random() * (max - min) + min) * pow) / pow;
```

### 数字格式化
```
NumberFormat nf = NumberFormat.getPercentInstance();//百分比格式
nf.setMinimumFractionDigits(0);//保留n位小数
nf.format(2.22);
```
