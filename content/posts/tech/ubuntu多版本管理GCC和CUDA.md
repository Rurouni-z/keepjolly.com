# 管理GCC
1. 前提是安装了多个gcc版本，可采取如下命令
> sudo apt-get install gcc-11 g++-11

2. 然后选择要使用的gcc版本
> update-alternatives _--config gcc_

3. 输入你想使用的版本的序号，如1
4. 查看当前版本
> gcc -v

[参考链接](https://lantern.cool/tool-linux-muti-gcc/index.html)
# 管理cuda

1. 删除原软链接
> cd /usr/local
> sudo unlink cuda

2. 建立新链接
> sudo ln -snf /usr/local/`..cuda-xx..` /usr/local/cuda
> cuda-xx是文件夹名

3. 查看当前版本
> nvcc -V

[参考链接](https://zhuanlan.zhihu.com/p/410764884)

