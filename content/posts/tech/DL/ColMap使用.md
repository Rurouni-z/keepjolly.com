---
title: ColMap使用
date: 2023-03-11 20:17:43.837
updated: 2023-03-11 20:17:43.837
url: /archives/colmap-use
categories: 
- tech
tags: 
- ComputerVision
---

## 数据集下载
[密码：s2v2，文件路径mvsnet->preprocessed_inputs](https://pan.baidu.com/s/1Wb9E6BWCJu4wZfwxm_t4TQ#list/path=%2Fmvsnet%2Fpreprocessed_inputs)
## Tutorial
COLMAP 3.8-dev
### QuickStart

1. Reconstruction > Automatic Reconstruction
   1. ![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518.png?imageMogr2/format/webp%7C)
2. 分别填入workspace folder、Image folder
   1. 如果图片在dtu/scan4/images下，则workspace folder路径填dtu/scan4；image folder填dtu/scan4/images；mask folder作用不知
   2. ![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-1.png?imageMogr2/format/webp%7C)
   3. 点两次OK即可生成如下3D模型【滚轮放大缩小，ctrl+滚轮增加粒子】，2080ti耗时半小时可能
   4. ![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-2.png?imageMogr2/format/webp%7C)
3. 等待重建完成，生成大致路径如下
   1. ![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-3.png?imageMogr2/format/webp%7C)
   2. project/sparse 表示所有重建组件的稀疏模型；project/dense表示相对应的dense model；其中dense point cloud **fused.ply**能通过【File > Import model from ...】导入
4. 整个大致流程为
   1. ![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-4.png?imageMogr2/format/webp%7C)
### the picture capture process
注意事项：

- 拍摄的图片应具有丰富的纹理。最好避免纹理特别少的图片如一张白墙or空桌图片。通过加入一些物品来丰富纹理
- 具备相似的光照情况。避免high dynamic range scenes（如有太阳有影子，穿过门或窗拍摄）。避免镜面反射
- 具有高度视觉重叠的图片。确保一个物体至少有三张图片，尽量多一点
- 多视图拍摄。不要通过平移旋转相机来从同一个方向拍摄。但确保相似视角有少且精的图片，并不是越多越好。如果是视频，请减少帧率。
### Preface
新手参数用**默认的就好**。也可以给不同重建场景设置“optimal”选项，Extras > Set options for ... data（不知道干嘛用的，好像能修改图片质量，而不是生成的3D质量）。如需了解参数，查看源码
如果遇到非正常退出，介意用命令行运行可执行文件，以获取不同级别的日志记录详细程度。（命令不知）
### Data Structure
COLMAP 假定所有输入图像都在一个输入目录中，该目录具有可能嵌套的子目录。它将读取存储在该目录中的所有图像，并且它支持各种不同的图像格式（请参阅 [FreeImage](http://freeimage.sourceforge.net/documentation.html)）。其他文件将被自动忽略。如果需要高性能，那么您应该分离所有非图像文档。图像由它们的相对文档路径唯一标识。对于后期处理，例如图像去失真或密集重建，**应保留相关文档夹结构**。 COLMAP 不修改输入图像或目录，所有提取的数据都存储在一个独立的 SQLite 数据库文档中（请参阅[数据库格式](https://colmap.github.io/database.html)）。
第一步是通过运行预构建的二进制文件（Windows：COLMAP.bat，Mac：COLMAP.app）或通过从 CMake build 文档夹执行 ./src/exe/colmap gui 来启动 COLMAP 的图形用户界面。接下来，通过**File > New project**。在此对话框中，您**必须选择存储数据库的位置以及包含输入图像的文档夹**。为方便起见，您可以通过选择**File > Save project**将整个项目设置保存到配置文件中。除了任何其他参数设置外，项目配置还存储数据库和图像文档夹的绝对路径信息。如果您决定移动数据库或图像文档夹，则必须通过**创建新项目相应地更改路径**。或者，可以在您选择的文本编辑器中直接修改生成的 .ini 配置文档。要重新打开现有项目，只需选择**File > Open project**即可打开配置文档然后恢复所有参数设置。请注意，所有 COLMAP 可执行文件都可以通过将各个设置指定为命令行参数或通过提供项目配置文档的路径（see [Interface](https://colmap.github.io/tutorial.html#interface)）从命令行启动。
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-5.png?imageMogr2/format/webp%7C)
### Feature Detection and Extraction
选择Processing > feature extraction
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-6.png?imageMogr2/format/webp%7C)
在此对话框中，您必须首先决定使用的固有相机模型。您可以从嵌入的 EXIF 信息中自动提取焦距信息，也可以手动指定内部参数，例如在实验室校准中获得的参数（在custom parameters里？）。如果图像包含部分 EXIF 信息，COLMAP 会尝试在大型相机型号数据库中自动查找缺失的相机规格。如果您的所有图像都是由具有相同缩放系数的同一台物理相机拍摄的，建议**在所有图像之间共享内在函数**。请注意，如果所有图像共享相同的相机型号但并非所有图像都具有相同的尺寸或 EXIF 焦距，进程将**不正常地退出**。如果您有几组图像共享相同的内在相机参数，您也可以在以后轻松修改相机模型（see [Database Management](https://colmap.github.io/tutorial.html#database-management)）。如果不确定在此步骤中选择什幺，只需**坚持使用默认参数**即可。
您可以从图像中检测和提取新特征，也可以从文本中导入现有特征。 COLMAP 在 GPU 或 CPU 上提取 SIFT 特征。 GPU 版本需要连接显示器，而 CPU 版本建议在服务器上使用。一般来说，GPU 版本是有利的，因为它具有定制的特征检测模式，通常在高对比度图像的情况下产生更高质量的特征。如果**导入现有特征**，则每个图像旁边都必须有一个文本文档（例如 /path/to/image1.jpg 和 /path/to/image1.jpg.txt），格式如下：
> NUM_FEATURES 128 
> X Y SCALE ORIENTATION D_1 D_2 D_3 ... D_128 
> ... 
> X Y SCALE ORIENTATION D_1 D_2 D_3 ... D_128

其中 X、Y、SCALE、ORIENTATION 是浮点数，D_1…D_128 值在 0…255 范围内。该文档应包含 NUM_FEATURES 行，每个功能一行。例如，如果图像有 4 个特征，则文本文档应如下所示：
> 4 128 
> 1.2 2.3 0.1 0.3 1 2 3 4 ... 21 
> 2.2 3.3 1.1 0.3 3 2 3 2 ... 32 
> 0.2 1.3 1.1 0.3 3 2 3 2 ... 2 
> 1.2 2.3 1.1 0.3 3 2 3 2 ... 3

请注意，按照惯例，图像的左上角坐标为 (0, 0)，最左上角像素的中心坐标为 (0.5, 0.5)。如果您必须为大型图像集合导入特征，使用您喜欢的脚本语言直接访问数据库会更有效(see [Database Format](https://colmap.github.io/database.html#database-format))
如果您完成了所有选项的设置，请选择“Extract”并等待提取完成或取消。如果您在提取过程中取消，下次您开始为同一项目提取图像时，COLMAP 会**自动从中断处继续**。这也允许您将图像添加到现有项目/重建中。在这种情况下，请务必在使用共享内在函数时**验证相机参数**。
所有提取的数据将存储在数据库文档中，可以在数据库管理工具中查看/管理(see [Database Management](https://colmap.github.io/tutorial.html#database-management)) 或使用SQLite(see [Database Format](https://colmap.github.io/database.html#database-format)).
### Feature Matching and Geometric Verification
特征匹配和几何验证会找到不同图像中特征点之间的对应关系。
选择Processing > feature matching 并选择一种提供的匹配模式，用于不同的输入场景：
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-7.png?imageMogr2/format/webp%7C)
**Exhaustive Matching**：如果你的数据集中的**图片数量比较少**（最多几百张），这种匹配模式应该足够快，重建结果最好。在这里，每个图像都与其他图像匹配，而参数block_size决定了同时从磁盘加载到内存中的图像数量。
**Sequential Matching**: 如果图像是**按顺序获取**的（例如，通过摄像机），则此模式很有用。在这种情况下，连续的帧有视觉重叠，没有必要穷尽地匹配所有图像对。相反，连续捕获的图像相互匹配。这种匹配模式具有基于vocabulary tree的内置循环检测，其中每第 N 个图像 (loop_detection_period) 与其视觉上最相似的图像 (loop_detection_num_images) 进行匹配。请注意，图像文件名必须按顺序排列（例如，image0001.jpg、image0002.jpg 等）。数据库中的顺序无关紧要，因为图像是根据其文件名明确排序的。请注意，顺序检测需要一个预训练的vocabulary tree，可以从 [https://demuc.de/colmap/](https://demuc.de/colmap/) 下载。
**Vocabulary Tree Matching**：在这种匹配模式中，每个图像都使用a vocabulary tree with spatial re-ranking与其视觉上最近的邻居进行匹配。这是推荐的**大型图像集合**（数千个）的匹配模式。这需要一个预训练的词汇树，可以从 [https://demuc.de/colmap/](https://demuc.de/colmap/) 下载。
**Spatial Matching**：这种匹配模式将每个图像与其空间上最近的邻居进行匹配。空间位置可以在database management中手动设置。默认情况下，COLMAP 还从 EXIF 中提取 GPS 信息并将其用于空间最近邻搜索。如果有**准确的先验位置信息**，这是推荐的匹配方式。
**Transitive Matching**：这种匹配模式使用已经存在的特征匹配的传递关系来产生更完整的匹配图。如果图像 A 与图像 B 匹配并且 B 与 C 匹配，则此匹配器会尝试直接将 A 与 C 匹配。
**Custom Matching**：此模式允许指定单个图像对进行匹配或导入单个特征匹配。要指定图像对，您必须提供一个文本文档，每行包含一个图像对：
> image1.jpg image2.jpg 
> image1.jpg image3.jpg
> ...

其中 image1.jpg 是图像文档夹中的**相对路径**。您有两个选项来导入单个特征匹配项：未经geometrically verified的原始特征匹配或已经geometrically verified的特征匹配。在这两种情况下，预期格式为：
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-8.png?imageMogr2/format/webp%7C)
其中 image1.jpg 是图像文档夹中的相对路径，数字对是各个图像中从零开始的特征索引。如果您必须为大型图像集导入许多匹配项，使用您选择的脚本语言直接访问数据库会更有效。
如果您完成了所有选项的设置，请选择"Match"/"Run"并等待匹配完成或在期间取消。请注意，此步骤可能会花费大量时间，具体取决于图像数量、每张图像的特征数量以及所选的匹配模式。exhaustive matching的预期时间从几十张图像的几分钟到数百张图像的几小时到数千张图像的几天或几周不等。如果在匹配后取消匹配过程或导入新图像，COLMAP 只会匹配以前没有匹配过的图像对。跳过已经匹配的图像对的开销很低。这还可以匹配初始匹配后导入的其他图像，并且可以为同一数据集组合不同的匹配模式。
所有提取的数据将存储在数据库文档中，可以在数据库管理工具中查看/管理(see [Database Management](https://colmap.github.io/tutorial.html#database-management)) 或使用SQLite(see [Database Format](https://colmap.github.io/database.html#database-format)).
注意，特征匹配**需要 GPU**，并且在匹配过程中您的计算机的显示性能可能会显著下降。如果您的系统有多个支持 CUDA 的 GPU，您可以使用 **gpu_index **选项选择特定的 GPU。
### Sparse Reconstruction
Reconstruction > start/resume reconstruction进行 incremental reconstruction
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-9.png?imageMogr2/format/webp%7C)
COLMAP 首先将所有数据库中提取的数据加载到内存中，并从初始的image pair开始重建。然后，通过记录新图像和triangulating new points来逐步扩展场景。在此重建过程中，结果实时可视化。有关可用控件的更多详细信息，请参阅[Graphical User Interface](https://colmap.github.io/gui.html#gui)。如果不是所有图像都记录到同一模型中，COLMAP 会尝试重建多个模型。可以从工具栏的下拉菜单中选择不同的模型（应该如图所示的下拉栏）。
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-10.png?imageMogr2/format/webp%7C)
如果不同的模型有共同的记录过图像，您可以使用 model_converter executable将它们合并到一个重建中（有关详细信息，see [FAQ](https://colmap.github.io/faq.html#faq-merge-models)）。如果您的所有图像都使用没有共享内在函数的 SIMPLE_RADIAL 相机模型（默认），您可以使用 PBA而不是 Ceres Solver进行快速bundle调整，它可以在“reconstruction options”下的"Bundle"中激活（use_pba = true）。
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-11.png?imageMogr2/format/webp%7C)
理想情况下，重建工作正常并且所有图像都已记录。如果不是这种情况，建议：

- 执行额外的匹配。为获得最佳结果，请使用exhaustive matching、enable guided matching、增加词汇树匹配中的最近邻数量或增加sequential matching中的重叠等。
- 如果 COLMAP 初始化失败，请手动选择初始图像对。选择Reconstruction > Reconstruction options > Init并从数据库管理工具中设置从不同视点具有足够匹配度的图像。

并从数据库管理工具中设置从不同视点具有足够匹配度的图像。
### Importing and Exporting
COLMAP 为进一步处理提供了几个导出选项。为了充分的灵活性，建议导出以 COLMAP 的数据格式的reconstruction。通过选择 File > Export 导出当前查看的模型或 File > Export all 导出所有重建的模型。使用用于重建相机、图像和点的单独文本文件将模型导出到所选文件夹中。当以 COLMAP 的数据格式导出时，您可以重新导入重建以用于以后的可视化、图像去失真，或从中断的地方继续现有的重建（例如，在导入和匹配新图像之后）。要导入模型，请选择 File > Import 并选择导出文件夹路径。或者，您也可以通过 File > Export as... 选择以各种其他格式导出模型，例如 Bundler、VisualSfM 、PLY 或 VRML。COLMAP 可以通过 File > Import From... 可视化具有 RGB 信息的plain PLY 点云文件。有关导出模型格式的更多信息，请参见[此处](https://colmap.github.io/format.html#output-format)。
 ![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-12.png?imageMogr2/format/webp%7C)
### Dense Reconstruction
在重建场景的稀疏表示和输入图像的相机姿势后，MVS 现在可以恢复更密集的场景几何。 COLMAP 具有集成的密集重建流程，可以为所有配准图像生成深度图和法线图，将深度图和法线图融合成具有法线信息的密集点云，并最终使用Poisson或Delaunay重建从融合点云估计密集表面。
首先，导入你的稀疏 3D模型（或选择已重建的模型）。然后选择Reconstruction > Multi-view stereo并选择一个空的工作路径，用来存储所有稠密重建结果。然后 1. undistort 图片，2. 使用stereo计算深度图和法线图，3. fuse 深度图和法线图形成点云， 4. meshing 点云（可选选项）。
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-13.png?imageMogr2/format/webp%7C)
在stereo重建过程中，由于计算负载过重，显示器可能会冻结，如果您的 GPU 没有足够的内存，重建过程可能会意外崩溃。参考 the FAQ ([freeze](https://colmap.github.io/faq.html#faq-dense-timeout) and [memory](https://colmap.github.io/faq.html#faq-dense-memory))的解决方案。请注意，点云的重建法线无法在 COLMAP 中直接可视化，但在 Meshlab 中可以通过启用Render > Show Normal/Curvature。同样，重建的密集表面网格模型必须使用外部软件进行可视化。
除了内部密集重建功能外，COLMAP 还导出到其他几个密集重建库，例如 CMVS/PMVS或CMP-MVS。请选择Extras > Undistort images并选择合适的转换。
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-14.png?imageMogr2/format/webp%7C)
输出文件夹包含重建和未失真的图像。此外，这些文档夹还包含用于执行密集重建的 shell 示例脚本。要运行 PMVS2，请执行以下命令：./path/to/pmvs2 /path/to/undistortion/folder/pmvs/ option-all
其中 /path/to/undistortion/folder 是在undistortion 对话框中选择的文件夹。确保不要忘记上述命令行参数中 /path/to/undistortion/folder/pmvs/ 中的**尾部斜杠**。
对于大型数据集，您可能希望首先运行 CMVS 将场景聚类为更易于管理的部分，然后运行 COLMAP 或 PMVS2。请参阅 undistortion 输出文件夹中的 shell 示例脚本，了解如何结合 COLMAP 或 PMVS2 运行 CMVS。此外，还有许多支持 COLMAP 输出的外部库：

- [CMVS/PMVS](http://www.di.ens.fr/pmvs/) [[furukawa10]](https://colmap.github.io/bibliography.html#furukawa10)
- [CMP-MVS](http://ptak.felk.cvut.cz/sfmservice/websfm.pl) [[jancosek11]](https://colmap.github.io/bibliography.html#jancosek11)
- [Line3D++](https://github.com/manhofer/Line3Dpp) [[hofer16]](https://colmap.github.io/bibliography.html#hofer16).
### Database Management
您可以在数据库管理工具中查看和管理导入的摄像机、图像和特征匹配，选择Processing > Manage database。在打开的对话框中，您可以看到导入的图像和相机列表。您可以通过单击Show image 和 Overlapping images查看每个图像的特征和匹配项。可以通过双击特定单元格来修改数据库表中的各个条目。请注意，对数据库的任何更改只有在单击Save后才有效（现在关闭对话框就能直接生效）。
![image](https://pic.keepjolly.com/halo/blog/2023/03/20230311201518-15.png?imageMogr2/format/webp%7C)
要在任意图像组之间共享相机内在参数，请选择单个或多个图像，然后选择 Set camera 并设置 camera_id，它对应于 cameras 表中唯一的 camera_id 列。您还可以添加具有特定参数的新相机。通过将 prior_focal_length flag设置为 0 或 1，可以提示重建算法是否应该信任该焦距值。如果是先前的实验室校准，您希望将此值设置为 1。在事先不了解焦距的情况下，建议将此值设置为 1.25 * max(width_in_px, height_in_px)。
数据库管理工具只有有限的功能，要完全控制数据，您必须直接修改 SQLite 数据库（see [Database Format](https://colmap.github.io/database.html#database-format)）。通过直接访问数据库，您可以仅使用 COLMAP 进行特征提取和匹配，也可以导入自己的特征和匹配以仅使用 COLMAP 的增量重建算法。
### Graphical and Command-line Interface
COLMAP 的大部分功能都可以从图形界面和命令行界面访问，它们都嵌入在同一个可执行文件中。您可以直接将选项作为命令行参数提供，也可以使用 --project_path path/to/project.ini 参数提供包含选项的 .ini 项目配置文件。启动GUI界面可以在当前文件夹路径的cmd中输入colmap gui 或直接明确项目配置 colmap gui --project_path。使用colmap help来列举不同命令参数。[graphical user interface](https://colmap.github.io/gui.html#gui) 和 [command-line Interface](https://colmap.github.io/cli.html#cli)提供了有关可用命令的更多详细信息。
