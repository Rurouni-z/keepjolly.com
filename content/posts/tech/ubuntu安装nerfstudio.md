博主配置：

- ubuntu18.04
- gcc11 （[需要](https://github.com/NVlabs/tiny-cuda-nn#requirements)$\geq$8）
- conda
- cuda11.8
- [安装教程](https://docs.nerf.studio/en/latest/quickstart/installation.html)（基本来源于此，除了Dependencies加入额外内容）
## Create environment
> conda create --name nerfstudio -y python=3.8
> conda activate nerfstudio
> python -m pip install --upgrade pip

## Dependencies
> pip uninstall torch torchvision functorch tinycudann
> pip install ninja git+[https://github.com/NVlabs/tiny-cuda-nn/#subdirectory=bindings/torch](https://github.com/NVlabs/tiny-cuda-nn/#subdirectory=bindings/torch)


注意此处可能无法安装tiny-cuda-nn，可以先进行
> git clone --recursive https://github.com/nvlabs/tiny-cuda-nn

应该就可以了
> pip install ninja /home/ubuntu/tiny-cuda-nn-master/bindings/torch #下载路径

但是我这样子虽然成功安装，仍会报错：'MLP' object has no attribute 'layers'<br />最后还是被迫用git+方式来安装（翻墙下载），后续更新，可以尝试（我还没试过）：
> git clone --recursive https://github.com/nvlabs/tiny-cuda-nn
> cd bindings/torch 

> conda activate nerfstudio
> python setup.py install
> 来源：[https://github.com/NVlabs/tiny-cuda-nn#pytorch-extension](https://github.com/NVlabs/tiny-cuda-nn#pytorch-extension)

## Installing nerfstudio
> git clone git@github.com:nerfstudio-project/nerfstudio.git
> cd nerfstudio
> pip install --upgrade pip setuptools
> pip install -e .
> ns-install-cli           （可选安装）

## Train and run viewer
# Download some test data: 
> ns-download-data nerfstudio --capture-name=poster 

# Train model 
> ns-train nerfacto --data data/nerfstudio/poster


