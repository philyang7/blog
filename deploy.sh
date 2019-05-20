#!/usr/bin/env sh

# 终止一个错误
set -e

# 构建
npm run docs:build

# 进入生成的构建文件夹
cd docs/.vuepress/dist

# 如果你是要部署到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/YvanYangi/YvanYangi.github.io.git master

cd -