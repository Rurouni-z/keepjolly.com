---
title: PCA人脸识别+GUI+python
date: 2022-02-22 16:17:36.746
updated: 2022-02-22 16:26:12.724
url: /archives/pca人脸识别guipython
categories: 
- create
tags: 
- Python
- PCA
---

​
参考：[基于PCA的人脸识别方法——特征脸法](https://www.chimaoshu.top/%E5%9F%BA%E4%BA%8EPCA%E7%9A%84%E4%BA%BA%E8%84%B8%E8%AF%86%E5%88%AB%E6%96%B9%E6%B3%95%E2%80%94%E2%80%94%E7%89%B9%E5%BE%81%E8%84%B8%E6%B3%95/)

参考：[人脸识别之主成分分析（PCA）](https://zhuanlan.zhihu.com/p/26652435)

**简易** 系统展示
![](/upload/2022/02/Snipaste_2022-02-22_16-19-23-9bb0ff00b0b647bd9f78e7f0cc5f97e6.png)

```python
import sys
import os
import numpy as np
import cv2 as cv
from PyQt5 import QtCore, QtWidgets, QtGui
from PyQt5.QtWidgets import QApplication, QMainWindow, QFileDialog

root_dir = 'FaceDB_orl'

def createDataBase(path):
    print('--------正在获取数据--------')
    path1 = []
    X = []
    for dirpath, dirnames, filenames in os.walk(path):
        for file in filenames:
            temp_path = os.path.join(dirpath, file)
            path1.append(temp_path)
    for img_path in path1:
        img = cv.imread(img_path, cv.IMREAD_GRAYSCALE)
        # img = cv.resize(img, crop_size)
        temp = img.reshape(-1, 1)
        X.append(temp)
    X = np.array(X)

    # print(X.shape[0])  # m个数据
    print('--------获取数据结束--------')
    return X.reshape(X.shape[0], X.shape[1]).T  # (row*col, 400)


def eigenface(X, k1=0, k2=0):
    print('--------正在特征提取--------')
    m = X.shape[1]  # 400
    # 计算平均脸及中心化
    X_mean = np.mean(X, 1)  # (r*l, 1)
    X_mean = np.reshape(X_mean, (-1, 1))
    X = X - X_mean  # (r*l, 400)

    # 计算协方差矩阵的特征值、特征向量
    L_mat = np.dot(X.T, X) / (m - 1)  # (400, 400)
    [W, V] = np.linalg.eig(L_mat)  # 求取特征向量eiv以及特征值eic

    # 取出特征值大的特征向量 作为特征脸
    L_eig_vec = []
    if k1 != 0:  # 根据特征值的值来选取向量
        for i in range(len(V)):
            if W[i] > k1:
                L_eig_vec.append(V[:, i])
    if k2 != 0:  # 选取从大到小的k2个向量
        index = np.argsort(W)[::-1]
        L_eig_vec = V[index[:k2], :]  # (k2, 400)
    L_eig_vec = np.array(L_eig_vec)
    # print(L_eig_vec.shape)

    # 得到协方差矩阵的特征向量组成的投影子空间(脸空间)
    Ei_Face = np.dot(X, L_eig_vec.T)  # (r*l, 399)
    print('--------特征提取结束--------')
    return X_mean, X, Ei_Face


def recognition(TestImage, X_mean, X, Ei_Face):
    print('----------正在识别----------')
    # 将训练数据投影到脸空间内
    EI_Num = Ei_Face.shape[1]  # 合格个数 m
    ProjectImage = np.dot(Ei_Face.T, X[:, :EI_Num])  # (m, m) 每一列是一个特征脸

    # 读取输入图片 灰度读取
    input_image = cv.imread(TestImage, cv.IMREAD_GRAYSCALE)
    image = input_image.reshape(-1, 1)  # (row*col, 1)

    # 输入图片 中心化 同PCA的第一步
    difference = image - X_mean
    # print(difference)

    # 输入图片投影到脸空间中 同PCA的最后一步
    ProjectedTestImage = np.dot(difference.T, Ei_Face).T  # (399, 1) 变成列向量
    # print(ProjectedTestImage.shape)

    # 计算欧式距离 将每行数据(axis=0) - 输入图片 计算欧式距离
    Euclidean_dist = np.linalg.norm(ProjectedTestImage - ProjectImage, axis=0)

    # 识别图片 距离最相近
    Recognized_index = np.argmin(Euclidean_dist, axis=0)
    # print(Euclidean_dist[Recognized_index])
    OutputName = Recognized_index + 1
    print('----------识别结束----------')
    return OutputName


class PcaUI(object):
    img_path = ''
    k1 = 1
    k2 = 0

    def setUI(self, Form):
        Form.setObjectName("Form")
        Form.resize(1000, 600)
        # 选择特征获取方式：按值分类 [  ]  按序分类  [   ]
        self.label1_1 = QtWidgets.QLabel(Form)
        self.label1_1.setGeometry(QtCore.QRect(250, 50, 150, 40))
        self.label1_2 = QtWidgets.QLabel(Form)
        self.label1_2.setGeometry(QtCore.QRect(390, 50, 80, 40))
        self.label1_3 = QtWidgets.QLabel(Form)
        self.label1_3.setGeometry(QtCore.QRect(640, 50, 80, 40))
        self.textEdit1_1 = QtWidgets.QTextEdit(Form)
        self.textEdit1_1.setGeometry(QtCore.QRect(465, 58, 150, 28))
        self.textEdit1_2 = QtWidgets.QTextEdit(Form)
        self.textEdit1_2.setGeometry(QtCore.QRect(715, 58, 150, 28))
        # 选择测试图片： [   ]    浏览文件
        self.label2 = QtWidgets.QLabel(Form)
        self.label2.setGeometry(QtCore.QRect(250, 150, 150, 40))
        self.textEdit2 = QtWidgets.QTextEdit(Form)
        self.textEdit2.setGeometry(QtCore.QRect(390, 158, 280, 28))
        self.pushButton2 = QtWidgets.QPushButton(Form)
        self.pushButton2.setGeometry(QtCore.QRect(773, 154, 71, 31))
        # 测试图片   预测图片   开始识别
        self.label3_3 = QtWidgets.QLabel(Form)
        self.label3_3.setGeometry(QtCore.QRect(250, 230, 80, 40))
        self.label3_1 = QtWidgets.QLabel(Form)
        self.label3_1.setGeometry(QtCore.QRect(250, 260, 92, 112))
        self.label3_1.setStyleSheet("background-color: cyan;")
        self.label3_1.setAlignment(QtCore.Qt.AlignCenter)
        self.label3_4 = QtWidgets.QLabel(Form)
        self.label3_4.setGeometry(QtCore.QRect(460, 230, 80, 40))
        self.label3_2 = QtWidgets.QLabel(Form)
        self.label3_2.setGeometry(QtCore.QRect(460, 260, 92, 112))
        self.label3_2.setStyleSheet("background-color: cyan;")
        self.label3_2.setAlignment(QtCore.Qt.AlignCenter)
        self.pushButton3 = QtWidgets.QPushButton(Form)
        self.pushButton3.setGeometry(QtCore.QRect(773, 260, 71, 31))

        self.pushButton2.clicked.connect(self.openfile)
        self.pushButton3.clicked.connect(self.runPCA)

        self.reTranslateUI(Form)
        QtCore.QMetaObject.connectSlotsByName(Form)

    def openfile(self):
        fname = QFileDialog.getOpenFileName(None, "打开文件", "./", "*.png;;All Files(*)")
        self.img_path = fname[0]
        s = fname[0].find('pca')
        self.textEdit2.setText(fname[0][s:])

    def runPCA(self):
        if self.textEdit1_2.toPlainText() != '':
            self.k1 = int(self.textEdit1_1.toPlainText())
        if self.textEdit1_2.toPlainText() != '':
            self.k2 = int(self.textEdit1_2.toPlainText())
        png = QtGui.QPixmap(self.img_path).scaled(self.label3_1.width(), self.label3_1.height())
        self.label3_1.setPixmap(png)
        X = createDataBase(root_dir)
        X_mean, X_cen, Ei_Face = eigenface(X, 300)
        image_No = recognition(self.img_path, X_mean, X_cen, Ei_Face)
        print('识别的图片是：' + str(image_No) + '.png')
        img = X[:, image_No - 1].reshape(112, 92)

        cv.imwrite('./result.png', img, [int(cv.IMWRITE_JPEG_QUALITY), 95])
        png = QtGui.QPixmap('./result.png').scaled(self.label3_2.width(), self.label3_2.height())
        self.label3_2.setPixmap(png)

    def reTranslateUI(self, Form):
        """
        选择特征获取方式：按值分类 [  ]  按序分类  [   ]
        选择测试图片： [   ]    浏览文件
        测试图片   预测图片   开始识别
        """
        _translate = QtCore.QCoreApplication.translate
        Form.setWindowTitle(_translate("Form", "人脸识别--PCA"))
        self.label1_1.setText(_translate("Form", "选择特征获取方式："))
        self.label1_2.setText(_translate("Form", "按值分类"))
        self.label1_3.setText(_translate("Form", "按序分类"))
        self.textEdit1_1.setPlaceholderText('k1(默认为1)')
        self.textEdit1_2.setPlaceholderText('k2(≤400)')

        self.label2.setText(_translate("Form", "选择测试图片："))
        self.pushButton2.setText(_translate("Form", "浏览文件"))

        self.label3_3.setText(_translate("Form", "测试图片"))
        self.label3_1.setText(_translate("Form", "测试图片"))
        self.label3_4.setText(_translate("Form", "预测图片"))
        self.label3_2.setText(_translate("Form", "预测图片"))
        self.pushButton3.setText(_translate("Form", "开始识别"))


if __name__ == '__main__':
    app = QApplication(sys.argv)
    MainWindow = QMainWindow()
    ui = PcaUI()
    ui.setUI(MainWindow)
    MainWindow.show()
    sys.exit(app.exec_())

```

🐱‍🏍学有余力的话 **建议修改界面或添加一些新的功能哦~**
​
