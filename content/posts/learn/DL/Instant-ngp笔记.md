---
title: Instant-ngp笔记
date: 2023-06-09 22:28:26 +0800
lastmod: 
summary: 
url: 
slug: ngp_note
toc: true
rightToc: false
categories: 
- learn
tags: 
- ComputerVision
original: true
author: Rurouni
website: www.keepjolly.com
---
[翻译](https://blog.csdn.net/qq_43620967/article/details/124382650)、[思维导图（good）](https://blog.csdn.net/qq_32981275/article/details/125888274)
## Instant-ngp 是做什么的
Given a fully connected neural network$m(\mathbf{y} ; \Phi)$ we are interested in **an encoding** of its inputs ${y}=\operatorname{enc}(\mathbf{x} ; \theta)$ that **improves the approximation quality and training speed** **across a wide range of applications** without incurring a notable performance overhead.  
## Instant-ngp 是怎么做的
![image](https://pic.keepjolly.com/halo/blog/2023/06/20230609222700.png?imageMogr2/format/webp%7C)
### Pipeline
> 定义一个$L\  resolution\  levels$ 的d维网格。其中红色框处在$1/ N_1$分辨率下，同理蓝色框处在$1/N_0$。以下都为2维网格，每个网格四个顶点。
> 每个$l\  resolution\  level$关联T个F维特征向量。(F是entry维数，d是图片的维数)

1. 对于给定的**输入坐标x**，我们在$level \ l$上找到周围的**体素**(d维网格)。即x落在$l_0$上的右下网格，落在$l_1$上的中间网格 。
2. 将$level \ l$上的体素的**整数**顶点映射成哈希表$\theta_{l}$的索引值。
> 给定$level \ l$的顶点数是$V=(N_l+1)^d$，例如对于level 1，有 (3 + 1)² = 16 个顶点。如果 V ≤ T，对应level的顶点和特征向量之间是 1:1 的映射。在更精细的level，其中 V > T，使用哈希函数将每个d维顶点映射到对应level的 T 个特征向量中。其中的特征向量就是网络要更新的参数。

3. 从哈希表$\theta_{l}$中查找四个索引值对应的**F维**特征向量，进行d-linearly interpolate。
4. 将**每个 level **插值后的特征向量以及辅助向量$\xi \in \mathbb{R}^{E}$**concat**，产生编码的MLP输入$y \in \mathbb{R}^{L F+E}$。（那么一张图片提取到的所有x，pipeline后都作为一个y样本送入网络中）
5. 输入后进入全连接神经网络。之后就跟[Nerf](https://keepjolly.com/posts/learn/nerf_note/#pipeline)差不多
### 哈希表
详细介绍参考[视频](https://www.bilibili.com/video/BV11e4y1V77L)，以及[补充视频](https://www.bilibili.com/video/BV1GD4y1Y754)

- 速度 vs 质量。随着哈希表大小 T 增大会带来高质量低速度，但是到一定瓶颈后，T带来的质量就没那么明显了，在文中 $T=2^{19}$效果最好。另外分辨率等级 L 和 特征维度 F 也有影响，文中$F=2,L=16$效果最好。
- 隐式哈希碰撞。重建效果这么好的关键是不同分辨率下带来不同的效果，可以互相弥补。在coarser下，哈希映射是一对一的，不会遇到哈希碰撞；但是在finer下，会经常造成哈希碰撞。文中作者指出越重要的区域对梯度的影响越大，越稀疏的区域对梯度影响较小，互相影响下梯度会趋于平均。在网络学习中自动从密集的区域内提取样本，而不是从更大范围内提取样本，从而避免哈希碰撞。
- 训练适应性。多分辨率哈希编码可以自动适应样本数据分布。
- d-linear interpolation。确保编码 enc(x; 𝜃) 以及通过链式法则后它与神经网络 𝑚(enc(x; 𝜃); Φ) 的组合是连续的。
## Instant-ngp 做的结果怎么样
### 优势

- 提高效率
- 范用性强，适合多个任务
- 适合现代GPU并行计算
- 减少control flow 和 pointer chasing
### 不足

- 无法避免的哈希碰撞会导致表面产生大量颗粒
- 适用于高几何细节场景，在复杂的、依赖于反射的场景下需要更大的MLP，带来速度上的降低
## Instant-ngp 讨论与展望

- concat and reduct. concat适合并行处理，而reduct适合神经网络更大，比编码还要expensive。
- 由哈希碰撞引起的微观变化。通过我们的编码在sdf上实现最先进的质量的关键将是找到一种克服这种微观结构的方法，例如通过过滤哈希表查找或通过在损失之前施加额外的平滑性。
- 优化哈希函数。两种途径是开发解析微分的连续哈希函数，或者有效探索离散函数空间的进化优化算法。
- 生成网络。因为特征与规则的点网格不是互相映射，无法进行生成式网络。
- 外部的空白空间、内部的固体空间以及其表面的稀疏细节，非常适合我们的编码。
