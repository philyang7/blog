# Git进阶

[参考资料](https://morvanzhou.github.io/tutorials/others/git/)

***
### 删除本地目录下所有git控制文件(.git)
```bash
$ find . -name ".git" | xargs rm -Rf
```

***
### 分支管理 branch
* 建立分支: 
    ```bash
    $ git branch dev    # 建立 dev 分支
    $ git branch        # 查看当前分支
    
    # 输出
    dev       
    * master    # * 代表了当前的 HEAD 所在的分支  
    ```
* 切换分支
    ```bash
    $ git checkout dev
    
    # 输出
    Switched to branch 'dev'
    --------------------------
    $ git branch
    
    # 输出
    * dev       # 这时 HEAD 已经被切换至 dev 分支
      master
    ```