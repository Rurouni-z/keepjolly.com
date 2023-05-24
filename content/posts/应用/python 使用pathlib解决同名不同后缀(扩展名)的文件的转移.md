---
title: python 使用pathlib解决同名不同后缀(扩展名)的文件的转移
date: 2022-03-11 17:11:49.912
updated: 2022-03-11 17:11:49.912
url: /archives/pythontransferfileswiththesamename
categories: 
- 技巧
tags: 
- Python
---

```python
from pathlib import Path
import shutil
# 需求：将old_dir里面的json文件与pic_dir里的同名不同后缀进行复制到另一个文件夹里

# 文件路径
old_dir = Path('待复制的文件先放到一个文件夹里')  # 如存放{‘picture1.json’, ‘picture2.json’,...}的文件夹
pic_dir = Path('同名不同后缀的文件夹')  # 如存放{‘picture1.jpg’, ‘picture2.jpg’,...}的文件夹
save_path = Path('将同名不同后缀的文件放到新的文件夹里')  # 最终的{‘picture1.jpg’, ‘picture2.jpg’,...}文件夹

# 只剩下文件名 如{‘picture1’, ‘picture2’,...}   ['.jpg']可放多个后缀['.jpg', '.gz']
json_names = {f.stem for f in old_dir.iterdir() if f.suffix == '.json'}
nii_names = {Path(f).name for f in pic_dir.iterdir() if f.suffixes == ['.jpg']}

for file_name in json_names & nii_names:  # 同名文件
    # json_path = old_dir / (file_name + '.json')  # 重新拼接成picture1.json格式
    # nii_path = pic_dir / (file_name + '.jpg')  # (file_name + '.jpg.gz')
    # with open(json_path) as json_file, open(nii_path) as nii_file:
    #  ... 对同名文件进行操作
    # 另一种思路
    if not save_path.exists():  # 文件夹不存在，则新建文件夹
        print('create a new Dir!')
        Path.mkdir(save_path)
    move_file = pic_dir / Path(file_name + '.jpg')  # 重新拼接成picture1.jpg格式
    print(move_file)
    shutil.copy(move_file, save_path)  # 将源文件夹的文件复制到save_path中
    # https://segmentfault.com/a/1190000020239664

# 如果遇到PermissionError: [Errno 13]之类的问题
# 可能是 文件找不到，或者被占用，或者无权限访问，或者打开的不是文件，而是一个目录。
# 参考博客
# https://www.cnblogs.com/lincappu/p/13496306.html
# https://zhuanlan.zhihu.com/p/70127659
# https://www.pythonheidong.com/blog/article/469303/424bc6bd1880effd30ba/




```
