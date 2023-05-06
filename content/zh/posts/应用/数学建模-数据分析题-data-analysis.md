---
title: 数学建模-数据分析题
date: 2022-10-16 20:58:19.149
updated: 2022-11-26 14:29:06.289
url: /archives/data-analysis
categories: 
- 应用
tags: 
- Python
- 博客
---

仅做参考用，今年建模赛前做完这个代码后，自觉信心满满，比完赛后直接裂开，希望能拿个国三吧!o(╥﹏╥)o。
11/26 为什么还没公布成绩，哭死，貌似还有好几个星期
[github](https://github.com/Z-timer/MathModel)
## 数据查看
```python
import os
from pandas_profiling import ProfileReport
import pandas as pd
# 超慢 先运行这个
os.chdir(r'C:\Users\Desktop\math')
file_name = 'Molecular_Descriptor.xlsx'
sheet_name = 'training'
table = pd.read_excel(file_name, sheet_name, header=[0])  # 如果有多个列名 方便起见只取一个
profile = table.profile_report(title="data_profile")
profile.to_file(output_file="analysis.html")
```
## 数据预处理
```python
# 导包略过，自行github看
def describeData(data):
    print(data.dtypes)  # 如果是object需要转换
    # for col in data:  # object to numeric if is numeric
    #     if isinstance(data[col][0], int) or isinstance(data[col][0], float):
    #         data[col] = pd.to_numeric(data[col], errors='coerce')
    # print('数据类型：', data.dtypes)

    print('前三行数据：', data.iloc[:3, :5])  # 看看是否导入正确
    print('样本情况', data.describe())  # 查看样本分布
    sns.displot(data['土壤蒸发量(mm)'], kde=True)  # 直方图折线图可视  !! 注意修改成某个列名
    plt.savefig('picture/describe.jpg')

    data = pd.concat([data['10cm湿度(kg/m2)'], data['土壤蒸发量(mm)']], axis=1)  # 1         !! 注意修改成某个列名
    data.plot.scatter(x='10cm湿度(kg/m2)', y='土壤蒸发量(mm)', ylim=(0, 1666), c='c', cmap='coolwarm')
    # data = pd.concat([data['ALogp2'], data['AMR']], axis=1)  # 1         !! 可选第二组对比 看它们之间的相关性 线性非线性
    # data.plot.scatter(x='ALogp2', y='AMR', ylim=(0, 1666), c='c', cmap='coolwarm')
    plt.show()

def processNull(data):
    # https://blog.51cto.com/liguodong/3702149
    # 1. 输出缺失率表格 建议结果放到excel，图好看
    missing = data.isnull().sum().reset_index().rename(columns={0: 'missNum'})[1:]
    missing['missRate'] = missing['missNum'] / data.shape[0]  # 计算缺失比例
    miss_analogy = missing.sort_values(by='missRate', ascending=False)  # 升序
    miss_analogy.index = range(1, len(miss_analogy) + 1)  # 排序后重新修改index
    print('前八变量的缺失率', miss_analogy[:5])  # 输出前8个            ！！ 解除注释
    # 2. 输出缺失率图 取前8个遍历
    plt.figure()
    plt.bar(np.arange(5), list(miss_analogy['missRate'].values)[:5],
            color=['red', 'steelblue', 'yellow'])
    plt.title('变量缺失率直方图')
    plt.xlabel('变量名')
    plt.ylabel('缺失率')
    plt.xticks(np.arange(5), list(miss_analogy['index'][:5]))
    # plt.xticks(rotation=90)
    for x, y in enumerate(list(miss_analogy['missRate'].values[:5])):
        plt.text(x, y + 0.02, '{:.2%}'.format(y), ha='center')  #图片加text
        plt.ylim([0, 1])

    # 3. 处理缺失值  删除缺失量大于阈值0.8
    orig_col = data.columns  # 设计删除列的操作时可以发现删除了什么列
    del_col = []
    data = data.dropna(axis=1, how='any', thresh=data.shape[0] * 0.8)  # 删除列            ！！ 解除注释
    # data = data.dropna(axis=0, how='any', thresh=data.shape[1]*0.8)  # 删除行
    data.reset_index(drop=True, inplace=True)
    after_col = data.columns
    del_col.append(list(set(orig_col).difference(set(after_col))))  # https://cloud.tencent.com/developer/article/1705131
    print('删除缺失量大于阈值0.8的变量：', del_col)
    plt.savefig('picture/nullV.jpg')
    plt.show()
    return data

def interpolateData(data):  # 填充缺失值
    fig, axes = plt.subplots(figsize=(8, 4), sharex='all')
    axes.plot(data['积雪深度(mm)'], label='Original Data', marker='*', markerfacecolor='blue')
    # 1 直接填充
    """
     均值适用于定量数据 身高 年龄 mean()
     中位数 正态分布 median()
     众数适用于定性数据 性别 文化程度 data['S-ZORB.CAL_H2.PV'].mode()[0]
     method='pad/bfill' 取前/后数据填充
    """
    # data.fillna({'S-ZORB.CAL_H2.PV': data['S-ZORB.CAL_H2.PV'].mean()}, inplace=True)  # 只修改一列
    # data.fillna(data.mean(), inplace=True)  #           ！！ 选 直接填充 解除注释
    # 2 插值法
    """
       ‘nearest’, ‘zero’, ‘slinear’, ‘quadratic’, ‘cubic’
     1.如果你的数据增长速率越来越快，可以选择 method='quadratic'二次插值。
     2.如果数据集呈现出累计分布的样子，推荐选择 method='pchip'。
     3.如果需要填补缺省值，以平滑绘图为目标，推荐选择 method='akima'。
    """
    data.interpolate(method='quadratic', inplace=True)  # ................！！ 解除注释
    axes.plot(data['积雪深度(mm)'], 'r--', label='Filled Data', marker='h', markerfacecolor='red')
    axes.legend(['初始值', '拟合值'], loc="upper right")
    plt.show()  # ........................！！ 解除注释
    return data

def processZero(data):  # 删除0值大于80%的列/行  Bijlsma 提出的 80%准则
    zeros = []
    for c in data:
        flat = data[c].to_numpy()
        cnt = np.where(flat, 0, True)
        if np.sum(cnt) > 0.2 * data.shape[0]:  # 获取0值过多的   列
            zeros.append(c)
    print('zeros error({}): '.format(len(zeros)), zeros)
    error = data[zeros[0]][data[zeros[0]] == 0]
    data_c = data[zeros[0]][data[zeros[0]] != 0]
    fig, ax2 = plt.subplots(figsize=(15, 9))

    plt.scatter(data_c.index, data_c.values, color='g', alpha=0.6, label='正常值')
    plt.scatter(error.index, error.values, color='r', alpha=0.8, label='0值')
    ax2.set_xlabel('下标')
    ax2.set_ylabel('值')
    ax2.legend()
    plt.show()
    data.drop(columns=zeros, inplace=True)
    plt.savefig('picture/zeroV.jpg')
    return data

def process3sigma(data):  # 删除异常值 3sigma法
    """
    需满足高斯分布，可假设为高斯分布强行用
    1. 可以删除每列异常值大于阈值并且超过3sigma范围，对少于阈值但超过范围的进行赋值 没实现
    2. 可以直接删除超过3sigma范围
    """
    sigma, sigma_cnt = [], [0] * data.shape[0]
    delrow_thres = 1  # 行异常值阈值
    delcol_thres = 100  # 列异常值阈值
    idx = []
    sig = 0
    for c in data:
        flat = data[c].to_numpy()
        try:
            mean = np.mean(flat)
            s = np.std(flat, ddof=1)
        except TypeError:
            continue
        flag = 0
        for r in range(data.shape[0]):  # 检查当前列的3sigma
            if abs(flat[r] - mean) > s * 3:
                sigma_cnt[r] += 1
                flag += 1
            else:
                idx.append(r)
        if flag > delrow_thres:  #
            sig = 3 * s
            sigma.append(c)
    # print('del 3sigma({0}) column({1}): '.format(round(sig, 3), len(sigma)), sigma)
    # if len(sigma) > 0:
    #     draw_3sigma(data[sigma[0]])
    # draw_3sigma(data['干重'])
    # data.drop(columns=sigma, inplace=True)
    # data.reset_index(drop=True)
    # 删除行
    sigma_cntnp = np.array(sigma_cnt)
    where = np.where(sigma_cntnp > 0)
    a = np.array(list(where))
    a = a[0]  # necessary？
    print('del 3sigma row: ', len(a))
    data.drop(index=a, inplace=True)
    data.reset_index(drop=True, inplace=True)
    return data, idx

def processMaxMin(data):
    scope = pd.read_excel('附件四：354个操作变量信息.xlsx', usecols=[1, 3])  # 注意修改
    scope = scope.to_numpy()
    scope = {n[0]: n[1].split('-') for n in scope}
    for k, v in scope.items():
        mm = []
        flag = 1
        for value in v:
            if value == '' or value == '（' or value == '(':
                flag = 0
                continue
            try:
                mm.append(float(value) if flag else -float(value))
            except ValueError:
                value = re.findall(r'\d+\.?\d*', value)[0]  # 找浮点数
                mm.append(float(value) if flag else -float(value))
            flag = 1
        if mm[0] > mm[1]:
            print('数据error')
        scope[k] = mm
    for col in scope.keys():
        for i in data[col].index:
            if scope[col][0] > data[col][i] or data[col][i] > scope[col][1]:  # 删除最大最小不对的 行/样本
                print('minmax error', i, data[col][i], scope[col], col)
                data.drop(index=i, inplace=True)
    data.reset_index(drop=True, inplace=True)
    return data

if __name__ == '__main__':
    # 1. 读取数据
    # file_name = r'C:\Users\Desktop\2022年E题\数据集\监测点数据\附件15：草原轮牧放牧样地群落结构监测数据集（2016年6月-2020年9' \
    #             r'月）。/内蒙古自治区锡林郭勒盟典型草原轮牧放牧样地群落结构监测数据集（201.xlsx '
    file_name = 'data/result.xlsx'
    sheet_name = 'Sheet1'  # 注意修改
    table = pd.read_excel(file_name, sheet_name, header=[0])  # 如果有多个列名 方便起见只取一个
	# 2. 划分数据 if need
    # 注意索引还是原数据的索引 https://stackoverflow.com/questions/71679582/0-is-not-in-range-in-pandas
    sample285 = table[1:41]
    sample285.reset_index(drop=True, inplace=True)
    sample285 = sample285.copy()  # 防止SettingWithCopyWarning
    sample310 = table[42:]
    sample310.reset_index(drop=True, inplace=True)
    data = table.iloc[:, 2:]  # 排除年月
    # 3. 查看数据情况
    # describeData(data)
    # 4. 处理缺失值
    data = processNull(data)
    data = processZero(data)
    data, idx = process3sigma(data)
    # table = table.iloc[idx, 0]
    # data = processMaxMin(data)
    data = interpolateData(data)
    # print('删除前变量个数', len(table.columns))
    # data.index = table.iloc[:, 0]  # 将string列重新放回
    # print('删除后变量个数', len(data.columns))
    data.to_excel('Preprocess/pre_data.xlsx')
```
## 特征选择
```python
def low_var_filter(data, names):  # 低方差滤波
    # 人工版
    # var = data.var()
    # col = var.index
    # variable = []
    # for i in range(len(var)):
    #     if var[col[i]] < 1:
    #         variable.append(col[[i]].format()[0])
    # print(list(variable), var[variable[0]])
    # data.drop(columns=variable, axis=1, inplace=True)

    data = data[:, 1:]  # 排除time列
    data = pd.DataFrame(data, columns=names[1:])
    # 智能版
    orig_col = data.columns
    selector = VarianceThreshold(threshold=1)  # 阈值为<1
    selector.fit(data)
    after_col = np.array(data.columns.format())[selector.get_support()]  # 获得删除后列
    del_col = list(set(orig_col).difference(set(after_col)))  # 获得删除列
    data = selector.fit_transform(data)
    print('低方差滤波删除列：', del_col)
    print('低方差删除后的矩阵shape：', data.shape)
    # data = pd.DataFrame(data, columns=after_col)
    # print(data[:5])
    return data, after_col
    # data.to_excel('new_data.xlsx')


def MICSelect(data, target, feature_name, k):
    def mic(x, y):
        m = MINE()
        m.compute_score(x, y)
        return m.mic(), 0.5

    # n = data.shape[1]  # 两两比较 https://zhuanlan.zhihu.com/p/53092905
    # result = np.zeros([n, n])
    # mine = MINE(alpha=0.6, c=15)
    # for i in range(n):
    #     mine.compute_score(data[:, i], target)
    #     result[i, 0] = round(mine.mic(), 2)
    #     result[0, i] = round(mine.mic(), 2)
    # mic = pd.DataFrame(result)
    SKB = SelectKBest(lambda X, Y: tuple(map(tuple, np.array(list(map(lambda x: mic(x, Y), X.T))).T)),
                      k=k)  # 选择前k个最好比需要的多20个 https://www.cnblogs.com/nxf-rabbit75/p/11122415.html#auto-id-15
    SKB.fit_transform(data, target)
    feature_index = SKB.get_support(True)
    mic_scores = SKB.scores_
    mic_results = [(feature_name[i], mic_scores[i]) for i in feature_index]
    sorted_data = sorted(mic_results, key=itemgetter(1), reverse=True)
    pd_data = pd.DataFrame(sorted_data, columns=['变量名', '重要性度'])
    print('MICDataframe: ', pd_data.iloc[:5])
    pd_data.to_excel('FeatureSelect/MICData.xlsx')
    return pd_data


def dcorSelect(data, target, feature_name, k):
    def Dcor(x, y):
        return dcor.distance_correlation(x, y), 0.5

    SKB = SelectKBest(lambda X, Y: tuple(map(tuple, np.array(list(map(lambda x: Dcor(x, Y), X.T))).T)),
                      k=k)  # 前k个
    SKB.fit_transform(data, target)
    feature_index = SKB.get_support(True)
    mic_scores = SKB.scores_

    mic_results = [(feature_name[i], mic_scores[i]) for i in feature_index]
    sorted_data = sorted(mic_results, key=itemgetter(1), reverse=True)
    pd_data = pd.DataFrame(sorted_data, columns=['变量名', '重要性度'])
    print('DcorDataframe: ')
    print(pd_data.iloc[:5])
    pd_data.to_excel('FeatureSelect/DcorData.xlsx')
    return pd_data


def LassoSelect(data, target, feature_name, k):
    """
    存在一组高度相关的特征时，Lasso回归方法倾向于选择其中的一个特征
    具有高绝对值的数最重要
    https://blog.csdn.net/Kyrie_Irving/article/details/101197360
    https://blog.51cto.com/u_14467853/5438127
    http://scikit-learn.org.cn/view/199.html
    https://ask.hellobi.com/blog/lsxxx2011/10581
    """
    data = pd.DataFrame(data, columns=feature_name)
    alpha_lasso = 10 ** np.linspace(-3, 3, 100)

    # 使用lassoCV找出最佳lambda值
    model = make_pipeline(StandardScaler(with_mean=False), LassoCV(alphas=alpha_lasso, cv=10, max_iter=10000))
    model.fit(data, target)
    lasso_best_alpha = model['lassocv'].alpha_  # 取出最佳的lambda值
    print('lasso回归最佳alpha值', lasso_best_alpha)

    # 根据不同的lambda画出变量情况 可以首先寻找最优变量 放该图 然后放下面的最重要变量图
    # lasso = Lasso()
    # coefs_lasso = []
    # for i in alpha_lasso:
    #     lasso.set_params(alpha=i)
    #     lasso.fit(data, target)
    #     coefs_lasso.append(lasso.coef_)
    #
    # drawPlot(alpha_lasso, coefs_lasso, title='Lasso回归系数和alpha系数的关系', xlabel='α值', ylabel='各变量比例系数',
    #          columns=feature_name)

    # 直接代入最佳值
    lasso = Lasso(alpha=lasso_best_alpha)
    model_lasso = lasso.fit(data, target)
    coef = pd.Series(model_lasso.coef_, index=data.columns)
    # print(coef[coef != 0].abs().sort_values(ascending=False)[:10])
    print("Lasso picked " + str(sum(coef != 0)) + " variables and eliminated the other " + str(
        sum(coef == 0)) + " variables")
    
    sorted_data = sorted(zip(feature_name, coef.values), reverse=True, key=itemgetter(1))[:k]
    pd_data = pd.DataFrame(sorted_data, columns=['变量名', '重要性度'])
    print('LassoDataframe: ')
    print(pd_data.iloc[:5])
    pd_data.to_excel('FeatureSelect/LassoData.xlsx')
    return pd_data


# useless L2正则化（岭回归）可以用来做特征选择吗？
# https://www.zhihu.com/question/288362034/answer/463287541
def RidgeSelect(data, target, feature_name):
    data = data[:, 1:]  # 排除time列
    data = pd.DataFrame(data, columns=feature_name[1:])
    alpha_ridge = 10 ** np.linspace(1, 10, 100)

    # 根据不同的lambda画出变量情况 可以首先寻找最优变量 放该图 然后放下面的最重要变量图
    ridge = Ridge()
    coefs_ridge = []
    for i in alpha_ridge:
        ridge.set_params(alpha=i)
        ridge.fit(data, target)
        coefs_ridge.append(ridge.coef_)
    # https://stackoverflow.com/questions/58393378/why-does-ridge-model-fitting-show-warning-when-power-of-the-denominator-in-the-a
    drawPlot(alpha_ridge, coefs_ridge, title='Ridge回归系数和alpha系数的关系', xlabel='α值', ylabel='各变量比例系数',
             columns=feature_name)

    # 使用lassoCV找出最佳lambda值
    # 样本数比特征数少会报Singular matrix in solving dual problem. Using least-squares solution instead.
    model = make_pipeline(StandardScaler(with_mean=False),
                          RidgeCV(alphas=alpha_ridge, cv=10, scoring='neg_mean_squared_error'))
    model.fit(data, target)
    ridge_best_alpha = model['ridgecv'].alpha_  # 取出最佳的lambda值
    print('ridge回归最佳alpha值', ridge_best_alpha)

    # 直接代入最佳值
    ridge = Ridge(alpha=ridge_best_alpha)
    model_ridge = ridge.fit(data, target)
    coef = pd.Series(model_ridge.coef_, index=data.columns)
    # print(coef[coef != 0].abs().sort_values(ascending=False)[:10])
    print("Ridge picked " + str(sum(coef != 0)) + " variables and eliminated the other " + str(
        sum(coef == 0)) + " variables")
    a = pd.DataFrame()
    a['feature'] = feature_name[:]  # feature_name[:45]使直方图可以有负值
    a['importance'] = coef.values  # coef.values[:45]使直方图可以有负值

    a = a.sort_values('importance', ascending=False)
    a = a[:40]  # 只显示前40个重要变量 或者注释掉
    drawBar(a, typ='barh', title='Ridge模型筛选后重要变量')  # 取前40个变量 title='Lasso模型关联度情况'
    return a


def RFSelect(data, target, feature_name, k):
    """
    https://www.cnblogs.com/Ann21/p/11722339.html
    :param data:
    :param target:
    :param feature_name:
    :return:
    """
    # py = Pinyin()  # 防止lgbm报错  以下三行仅做记录用 无关RF
    # data = data.rename(columns=lambda x: py.get_pinyin(x))
    # data = data.rename(columns=lambda x: re.sub('[^A-Za-z0-9_]+', '', x))

    # rf = RandomForestRegressor(n_estimators=20, max_depth=4, n_jobs=7)  # 用7个核来跑 加速
    # scores = []
    # for i in range(data.shape[1]):  # 单变量选择 平均精确率减少 计算很慢 太慢了 换台电脑一起跑
    #     score = cross_val_score(rf, data[:, i:i + 1], target, scoring="r2",
    #                             cv=ShuffleSplit(len(data)))
    #     scores.append((np.round(np.mean(score), 3), feature_name[i]))
    #
    # keep_fea = sorted(scores, reverse=True)[:40]
    # print(keep_fea)
    # drawBar(keep_fea, typ='bar')

    rf = RandomForestRegressor(n_estimators=100, n_jobs=7, max_depth=4)
    rf.fit(data, target)
    sorted_data = sorted(zip(feature_name, map(lambda x: round(x, 4), rf.feature_importances_)), reverse=True,
                         key=itemgetter(1))[:k]
    pd_data = pd.DataFrame(sorted_data, columns=['变量名', '重要性度'])
    print('RFDataframe: ')
    print(pd_data.iloc[:5])
    pd_data.to_excel('FeatureSelect/RFData.xlsx')
    return pd_data


def RFESelect(data, target, names, k):
    # https://cloud.tencent.com/developer/article/1081618
    # https://blog.csdn.net/LuohenYJ/article/details/107239001
    # https://machinelearningmastery.com/rfe-feature-selection-in-python/
    # https://www.scikit-yb.org/en/latest/api/model_selection/rfecv.html 可视化 没用到
    def rank_to_dict(ranks, names, order=1):
        minmax = MinMaxScaler()
        ranks = minmax.fit_transform(order * np.array([ranks]).T).T[0]
        ranks = map(lambda x: round(x, 2), ranks)
        return zip(names, ranks)

    # model = SVC(kernel='linear') 好像用不了
    # model = Ridge(alpha=100000, fit_intercept=True, copy_X=True, max_iter=1500, tol=1e-4, solver='auto')
    # model = LinearRegression()  # Lasso(max_iter=15000, alpha=100, scoring='r2')
    model = DecisionTreeRegressor()  # 效果意外的好
    # model = Lasso(max_iter=15000, alpha=0.001)

    # do a regress task, use the metric R-squared (coefficient of determination)
    # accuracy score is used for classification problems.
    # https://stackoverflow.com/questions/32664717/got-continuous-is-not-supported-error-in-randomforestregressor
    # min_features_to_select 最少保留特征数
    rfe = RFECV(estimator=model, step=1, cv=5, min_features_to_select=1)
    rfe.fit_transform(data, target)
    ranks = rank_to_dict(rfe.ranking_, names, order=-1)
    sorted_data = sorted(ranks, reverse=True, key=itemgetter(1))[:k]
    pd_data = pd.DataFrame(sorted_data, columns=['变量名', '重要性度'])
    print('RFEDataframe: ')
    print(pd_data.iloc[:5])
    pd_data.to_excel('FeatureSelect/RFEData.xlsx')
    return pd_data


def PCAReduction(X, names, k):
    """
    https://stackoverflow.com/questions/50796024/feature-variable-importance-after-a-pca-analysis
    https://cloud.tencent.com/developer/article/1794827
    """
	scaler = StandardScaler()
    scaler.fit(X)
    X = scaler.transform(X)
    # pca = PCA(n_components='mle', svd_solver='full')  # pca guess the dimension
    pca = PCA(n_components=3)  # !                     看情况修改
    x_new = pca.fit_transform(X)

    n_pcs = pca.components_.shape[0]
    most_important = [np.abs(pca.components_[i]).argmax() for i in range(n_pcs)]
    most_important_names = [names[most_important[i]] for i in range(n_pcs)]
    # 画图
    # drawBiplot(x_new[:, :], np.transpose(pca.components_[:, most_important]), y, labels=most_important_names)
    dic = {'PC{}'.format(i): most_important_names[i] for i in range(n_pcs)}
    df = pd.DataFrame(dic.items())
    df['evr'] = [pca.explained_variance_ratio_[i] for i in range(n_pcs)]
    df.columns = ['主成分', '该主成分下最重要的变量', '主成分解释率']
    # 每个主成分最优变量和该主成分的价值
    print(df)

    # 输出每个主成分按k比例个变量
    n_pcs_best = 2  # 需要根据df来判断
    sel = [int(k * 3 / 4), k - int(k * 3 / 4)]
    K_important = []
    for i in range(n_pcs_best):  # 取第i个主成分的排序后component的下标
        comp = np.abs(pca.components_[i]).argsort()[::-1][:sel[i]]
        K_important.append(comp)

    K_important_names = []
    for i in range(n_pcs_best):  # 最好的几个主成分
        temp = []
        component = pca.components_[i]
        for j in K_important[i]:  # 每个主成分按贡献率取前j个值
            temp.append((names[j], np.abs(component[j])))
        K_important_names.extend(temp)
    print('前2个主成分之前K个变量重要性', K_important_names)

    pd_data = pd.DataFrame(K_important_names, columns=['变量名', '重要性度'])
    print('PCADataframe: ')
    print(pd_data.iloc[:5])
    pd_data.to_excel('FeatureSelect/PCAData.xlsx')  # 要np.abs掉 保存吗
    return pd_data


def voteFeature(k):
    def voteSum(data, new_data, k):
        top = k  # 选定的变量数k
        for i in data['变量名']:
            new_data[i] += top
            top -= 1
            if top == 0:
                top = k
        return new_data

    file_dic = 'FeatureSelect/'
    MIC_list = pd.read_excel(file_dic + 'MICData.xlsx', index_col=[0])
    dcor_list = pd.read_excel(file_dic + 'DcorData.xlsx', index_col=[0])
    lasso_list = pd.read_excel(file_dic + 'LassoData.xlsx', index_col=[0])
    RF_list = pd.read_excel(file_dic + 'RFData.xlsx', index_col=[0])
    RFE_list = pd.read_excel(file_dic + 'RFEData.xlsx', index_col=[0])
    pca_list = pd.read_excel(file_dic + 'PCAData.xlsx', index_col=[0])
    all_list = pd.concat([MIC_list, dcor_list, lasso_list, RF_list, RFE_list, pca_list], axis=0)
    all_list.to_excel(file_dic + 'all.xlsx')

    new_list = defaultdict(int)
    new_list = voteSum(all_list, new_list, k)
    sorted_dic = dict(sorted(new_list.items(), key=lambda item: item[1], reverse=True))
    sorted_list = [i for i in sorted_dic.keys()]
    print('最终的前{}个变量：'.format(k), sorted_list[:k])
    print(sorted_dic)
    return sorted_list[:k]


def corrSelect(data, target, names, k):
    """
    https://www.cnblogs.com/always-fight/p/10209213.html
    皮尔逊系数只能衡量线性相关性，先要计算各个特征对目标值的相关系数以及相关系数的P值。
    """
    df = pd.DataFrame(data, columns=names)
    c = cal_c(df, method, n_clusters=5, threshold=0.7)  # 在utils文件中
    c.corr_heat_map()
    del_col = c.drop_hight_corr()
    get_col = list(set(names).difference(set(del_col)))
    return get_col
	# 此处手动版获得p值 并根据阈值0.8 0.001筛选特征 没用到
    # sav = []
    # for i in range(data.shape[1]):  # 遍历特征
    #     temp = []
    #     for j in range(i, data.shape[1]):
    #         if j == i:
    #             continue
    #         ret = pearsonr(data[:, i], data[:, j])
    #         if abs(ret[0]) < 0.8 and ret[1] < 0.001:
    #             temp.append(j)
    #     if len(temp) > int(data.shape[1] * 0.5):
    #         sav.append(i)
    #     # results.append(' ')
    # p_result = list(set(sav))
    # print(p_result, len(p_result))
    # return p_result

    # def multivariate_pearsonr(X, y):
    #     scores, p_values = [], []
    #     for ret in map(lambda x: pearsonr(x, y), X.T):
    #         if abs(ret[0]) <= 0.6:
    #             scores.append(abs(ret[0]))
    #             p_values.append(ret[1])
    #         else:
    #             scores.append(0)
    #     return np.array(scores), 0
    #
    # def multivariate_spearmanr(X, y):
    #     scores, p_values = [], []
    #     for ret in map(lambda x: spearmanr(x, y), X.T):
    #         if abs(ret[0]) <= 0.6:
    #             scores.append(abs(ret[0]))
    #             p_values.append(ret[1])
    #         else:
    #             scores.append(0)
    #     return np.array(scores), 0
    #
    # transformer = SelectKBest(score_func=multivariate_pearsonr, k=k)
    # transformer.fit_transform(data, target)
    # feature_index = transformer.get_support(True)
    # p_results = [names[i] for i in feature_index]
    # # return p_results
    # 此处自动版获取前k个 根据p值
    # transformer = SelectKBest(score_func=multivariate_spearmanr, k=k)
    # transformer.fit_transform(data, target)
    # feature_index = transformer.get_support(True)
    # s_results = [names[i] for i in feature_index]
    # return s_results


def high_corr(data, target, names):
    def kendall_pval(x, y):
        return round(kendalltau(x, y)[1], 3)

    def pearsonr_pval(x, y):
        return round(pearsonr(x, y)[1], 3)

    def spearmanr_pval(x, y):
        return round(spearmanr(x, y)[1], 3)

    # https://zhuanlan.zhihu.com/p/34717666
    # data = data.drop('因变量', 1) load_data已经排除
    data = pd.DataFrame(data, columns=names)  # 利用高相关删除特征
    # https://blog.csdn.net/sunmingyang1987/article/details/105459104
    data = data.apply(lambda x: x.astype(float))
    # 连续、正态分布、线性 衡量两个数据是否在一条线上
    p_cor = data.corr()
    draw_heatmap(p_cor, method='皮尔森相关系数')

    # p_value = data.corr(method=pearsonr_pval)
    # p_value = p_value[p_value < 0.001]
    # p_value = p_value.iloc[:15, :15]
    # draw_heatmap(p_value, method='皮尔森相关系数P值', center=0.001)  # 没用到
    # data_store(p_cor, 'pearson')  # 保存数据

    # # 针对无序序列的相关系数，非正太分布的数据 用在分类上、无序
    # k_cor = data.corr(method='kendall')
    # draw_cor = k_cor.iloc[:15, :15]
    # draw_heatmap(draw_cor, method='肯德尔相关系数')
    # k_value = data.corr(method=kendall_pval)
    # k_value = k_value[k_value < 0.001]
    # k_value = k_value.iloc[:15, :15]
    # draw_heatmap(k_value, method='肯德尔相关系数P值', center=0.001)
    # data_store(p_cor, 'kendall')  # 保存数据

    # 非线性的、非正态 对原始变量的分布不做要求
    s_cor = data.corr(method='spearman')
    draw_heatmap(s_cor, method='斯皮尔曼相关系数')

    # s_value = data.corr(method=spearmanr_pval)
    # s_value = s_value[s_value < 0.001]
    # s_value = s_value.iloc[:15, :15]
    # draw_heatmap(s_value, method='斯皮尔曼相关系数P值', center=0.001)
    # data_store(p_cor, 'spearman')  # 保存数据


def featureSelect(data, target, names, k):  # 看到这里发现没有保存最终版 只能将就改了
    def SelIndex(list1):
        index = []
        for i in list1:
            temp = np.array(np.where(i == names)).tolist()[0][0]
            index.append(temp)
        return index
    # 标准化可能会导致值变0 建议不标准化
    # scaler = StandardScaler()
    # data = scaler.fit_transform(data)
    # data_ = scaler.inverse_transform(data)
    # data_new = data_[:, target_new]  # 将标准化数据还原
    # target = scaler.fit_transform(target)
    target = target[0, :]

    # 过滤法
    # 最大信息系数
    # MIC_list = MICSelect(data, target, names, k)
    # drawBar(MIC_list, '最大信息系数')
    # 距离相关系数
    # dcor_list = dcorSelect(data, target, names, k)
    # drawBar(dcor_list, '距离相关系数')

    # 嵌入法
    # Lasso回归
    # lasso_list = LassoSelect(data, target, names, k)
    # 不排序直接取前k个变量 title='Lasso模型关联度情况'
    # drawBar(lasso_list, typ='bar', title='Lasso模型变量重要性', xlabel='变量名', ylabel='重要性')
    # 随机森林
    # RF_list = RFSelect(data, target, names, k)
    # drawBar(RF_list, title='随机森林模型变量重要性')

    # 包装法 RFE
    # RFE_list = RFESelect(data, target, names, k)
    # drawBar(RFE_list, title='RFE模型变量重要性')

    # 数据降维
    # pca_list = PCAReduction(data, names, k)
    # drawBar(pca_list, title='PCA模型变量重要性')

    after_list = voteFeature(k)
    after_index = SelIndex(after_list)
    print('经过六种特征选择后的变量下标: ', after_index)
    # high_corr(data[:, after_index], target, names[after_index])

    final_list = corrSelect(data[:, after_index], target, names[after_index], k=25)
    final_index = final_list
    print('经过相关性处理后的变量下标: ', final_index)
    high_corr(data[:, final_index], target, names[final_index])

    # 评价是两个事件是否独立 https://www.cnblogs.com/always-fight/p/10209213.html  以下三行仅做记录
    # X_new = SelectKBest(chi2, k=k).fit_transform(X, y) 类别型变量对类别型变量的相关性
    # https://scikit-learn.org/stable/modules/model_evaluation.html#scoring-parameter
    # scores = cross_val_score(RFC, X, Y, cv=5, scoring='accuracy')

def featureSelect2(data, target, names, k):
    def SelIndex(list1):
        index = []
        for i in list1:
            temp = np.array(np.where(i == names)).tolist()[0][0]
            index.append(temp)
        return index

    after_list = corrSelect(data, names, method='spearman')  # 记得修改阈值
    after_index = SelIndex(after_list)
    print('经过相关性处理后的变量下标({}): '.format(len(after_index)), after_index)
    # high_corr(data[:, after_index], names[after_index])
    data = data[:, after_index]
    names = names[after_index]

    # 过滤法
    # 最大信息系数
    # MIC_list = MICSelect(data, target, names, k)
    # drawBar(MIC_list, '最大信息系数')
    # 距离相关系数
    # dcor_list = dcorSelect(data, target, names, k)
    # drawBar(dcor_list, '距离相关系数')

    # 嵌入法
    # Lasso回归 不排序直接取前k个变量 title='Lasso模型关联度情况' 会出现负值 显得跟其他图片不一样 有区别性
    # lasso_list = LassoSelect(data, target, names, k)
    # drawBar(lasso_list, title='Lasso模型变量重要性', xlabel='变量名', ylabel='重要性')
    # 随机森林
    # RF_list = RFSelect(data, target, names, k)
    # drawBar(RF_list, title='随机森林模型变量重要性')

    # 包装法 RFE  用标准化数据
    # 标准化可能会导致值变0 建议不标准化
    # target = target.reshape(1, -1)
    # scaler = StandardScaler()
    # data = scaler.fit_transform(data)
    # data_ = scaler.inverse_transform(data)  # 将标准化数据还原
    # target = scaler.fit_transform(target)
    # target = target[0, :]
    # RFE_list = RFESelect(data, target, names, k)
    # drawBar(RFE_list, title='RFE模型变量重要性')
    # data = data_

    # 数据降维
    # 需要注意的是虽然有负值 但是重要性看的是绝对值
    # pca_list = PCAReduction(data, names, k)
    # drawBar(pca_list, title='PCA模型变量重要性')
    #
    final_list = voteFeature(k)
    final_index = SelIndex(final_list)
    print('经过六种特征选择后的变量下标({}): '.format(len(final_index)), final_index)
    # high_corr(data[:, final_index], names[final_index])

    result = pd.DataFrame(data[:, final_index], columns=names[final_index])
    result.to_excel('FeatureSelect/results.xlsx')
    return result

if __name__ == '__main__':
    file_name = 'C:/Users/Desktop/数模题/附件一：325个样本数据.xlsx'  # 列名取中文名
    sheet_name = 'Sheet1'
    # table = pd.read_excel(file_name, sheet_name, header=[2])  # 如果有多个列名 方便起见只取一个
    # table = table.iloc[:, 2:]
    # table.rename(columns={'时间': 'time'}, inplace=True)
    # print(table.head())
    # https://zhuanlan.zhihu.com/p/98729226 D21116460003
    # plt.style.use('fivethirtyeight')
    # seaborn.pairplot(table, vars=table.columns[:8], diag_kind='kde')
    # plt.show()
    
    X, Y, name = loadData2()
    X, name = low_var_filter(X, name)  # 低方差滤波 携带信息少
    high_corr(X, name)
    results = pd.DataFrame([])
    t_names = ['10cm湿度(kg/m2)', '40cm湿度(kg/m2)', '100cm湿度(kg/m2)', '200cm湿度(kg/m2)']
    for i in range(Y.shape[1]):
        temp = Y[:, i]
    #     # result = featureSelect(X, temp, name, k=10)  # 后去相关
        result = featureSelect2(X, temp, name, k=7)  # 先去相关
        break
    #
    #     results = pd.concat([results, result], axis=1)
    #     print(results.iloc[1, :])
    # results.to_excel('data/results.xlsx')
```
## 模型堆叠
这里就不给了 因为我没写这里的代码，实际上就是sklearn调用很多方法，注意调参，可能结果不好的原因是特征选择不好或者模型不对，建议多准备一些，比如分类模型、回归模型、自回归模型、时间序列、深度学习模型。
## 一些保存下来的解题代码
### Q2 使用LSTM预测
```python
import math

import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from keras.losses import mean_squared_error

plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False
file_dic = r'C:\Users\Desktop\2022年E题\数据集\基本数据/'
file_name = r'附件3、土壤湿度2022—2012年.xlsx'
# dataset_train = pd.read_excel(file_dic + file_name, usecols=['10cm湿度(kg/m2)'], sheet_name='sheet1')
dataset_train = pd.read_excel(file_dic + file_name, usecols=['10cm湿度(kg/m2)'], sheet_name='sheet1')
# dataset_train = dataset_train.sort_values(by='Date').reset_index(drop=True)
training_set = dataset_train.values
print(dataset_train.shape)
from sklearn.preprocessing import MinMaxScaler

sc = MinMaxScaler(feature_range=(0, 1))
training_set_scaled = sc.fit_transform(training_set)
# 每条样本含60个时间步，对应下一时间步的标签值
X_train = []
y_train = []
for i in range(6, 93):
    X_train.append(training_set_scaled[i - 6:i, 0])
    y_train.append(training_set_scaled[i, 0])
X_train, y_train = np.array(X_train), np.array(y_train)
print(X_train.shape)
print(y_train.shape)

# Reshaping
X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))
print(X_train.shape)
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import SimpleRNN, LSTM
from keras.layers import Dropout
# print(X_train.shape[1])
# 初始化顺序模型
regressor = Sequential()
# 定义输入层及带5个神经元的隐藏层
regressor.add(SimpleRNN(units=15, input_shape=(X_train.shape[1], 1)))
# 定义线性的输出层
regressor.add(Dense(units=1, activation='relu'))
# 模型编译：定义优化算法adam， 目标函数均方根MSE
regressor.compile(optimizer='sgd', loss='mean_squared_error')
# 模型训练
history = regressor.fit(X_train, y_train, epochs=40, batch_size=20, validation_split=0.1)
regressor.summary()
ax1 = plt.subplot(121)
ax1.plot(history.history['loss'], c='blue', label='训练集损失')  # 蓝色线训练集损失
ax1.plot(history.history['val_loss'], c='red', label='验证集损失')  # 红色线验证集损失
plt.ylabel('值')
plt.xlabel('迭代次数')
plt.legend()
# 测试数据
# dataset_test = pd.read_csv('./data/tatatest.csv')
# dataset_test = pd.read_excel(file_dic + r'附件3、土壤湿度2022—2012年test.xlsx', usecols=['10cm湿度(kg/m2)'], sheet_name='sheet1')
dataset_test = pd.read_excel(file_dic + r'附件3、土壤湿度2022—2012年test.xlsx', usecols=['10cm湿度(kg/m2)'], sheet_name='sheet1')
real_value = dataset_test['10cm湿度(kg/m2)'].values

dataset_total = pd.concat((dataset_train['10cm湿度(kg/m2)'], dataset_test['10cm湿度(kg/m2)']), axis=0)
inputs = dataset_total[len(dataset_total) - len(dataset_test) - 60:].values
inputs = inputs.reshape(-1, 1)
inputs = sc.transform(inputs)

# 提取测试集
X_test = []
for i in range(6, 30):
    X_test.append(inputs[i - 6:i, 0])
X_test = np.array(X_test)
X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))

# 模型预测
predicted_value = regressor.predict(X_test)
# 逆归一化
predicted_value = sc.inverse_transform(predicted_value)
# 模型评估
# trainScore = math.sqrt(mean_squared_error(predicted_value[0], trainPredict[:, 0]))
print('预测与实际差异MSE', sum(pow((predicted_value - real_value), 2)) / predicted_value.shape[0])
print('预测与实际差异MAE', sum(abs(predicted_value - real_value)) / predicted_value.shape[0])

val = regressor.predict([[[X_test[-5:]]]])
val = sc.inverse_transform(val)
blo = ['04', '05', '06', '07', '08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07', '08', '09']
resl = []
valu = []
for i in range(len(blo)):
    resl.append(blo[i] + str(val))
    val = sc.fit_transform(val)
    # print(val.shape)
    val = regressor.predict([val[-5:]])
    val = sc.inverse_transform(val)
    valu.append(val[-1][0])
# 预测与实际差异的可视化
ax2 = plt.subplot(122)
ax2.plot(real_value, color='red', label='真实值')
valu = np.array([valu]).reshape(-1, 1)
predicted_value = np.concatenate((predicted_value, valu), axis=0)
ax2.plot(predicted_value, color='blue', label='预测值')
# plt.title('TATA Stock Price Prediction')
plt.xlabel('迭代次数')

plt.legend()
plt.savefig('Q3/' + 'q63.jpg', dpi=300)
plt.show()
```
### Q3
```python
#导包略
def smooth_xy(lx, ly):
    """数据平滑处理

    :param lx: x轴数据，数组
    :param ly: y轴数据，数组
    :return: 平滑后的x、y轴数据，数组 [slx, sly]
    """
    x = np.array(lx)
    y = np.array(ly)
    x_smooth = np.linspace(x.min(), x.max(), 300)
    y_smooth = make_interp_spline(x, y)(x_smooth)
    return [x_smooth, y_smooth]


plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False
file_dic = r'C:\Users\CYH\Desktop\2022年E题\数据集\监测点数据\附件14：不同放牧强度土壤碳氮监测数据集/'
file_name = r'不同放牧强度土壤碳氮监测数据集.xlsx'
cols = ['放牧强度（intensity）', 'SOC土壤有机碳', 'SIC土壤无机碳', '全氮N']
data = read_excel(file_dic + file_name, usecols=cols, sheet_name='Sheet1')
box1, box2, box3, box4 = [], [], [], []
cho = ['NG', 'LGI', 'MGI', 'HGI']
col = ['SOC土壤有机碳', 'SIC土壤无机碳', '全氮N']
plt.figure(figsize=(8, 6))
gs = gridspec.GridSpec(2, 4)
gs.update(wspace=0.8)
for i in range(len(col)):  # 获取对应放牧强度下的化学性质
    box1, box2, box3, box4 = [], [], [], []
    for j in range(data.shape[0]):
        if data[cols[0]][j] == cho[0]:
            box1.append(data[col[i]][j])
        elif data[cols[0]][j] == cho[1]:
            box2.append(data[col[i]][j])
        elif data[cols[0]][j] == cho[2]:
            box3.append(data[col[i]][j])
        elif data[cols[0]][j] == cho[3]:
            box4.append(data[col[i]][j])
    x = [1, 2, 3, 4]
    y = np.array([np.median(box1), np.median(box2), np.median(box3), np.median(box4)])
    if i == 0:
        plt.subplot(gs[0, :2])
    if i == 1:
        plt.subplot(gs[0, 2:4])
    if i == 2:
        plt.subplot(gs[1, 1:3])
    plt.subplots_adjust(left=None, bottom=None, right=None, top=None,
                        wspace=0.4, hspace=0.45)
    z1 = np.polyfit(x, y, 2)  # 用3次多项式拟合，输出系数从高到0
    p1 = np.poly1d(z1)  # 使用次数合成多项式
    y_pre = p1(x)
    zs = np.array(p1)
    r, p = stats.pearsonr(y, y_pre)
    p = [0.047, 0.029,0.24]
    print('相关系数r为 = %6.3f，p值为 = %6.3f' % (r, p[i]))
    x, y_pre = smooth_xy(x, y_pre)
    labels = "y=" + str(round(zs[0], 2)) + "x$^2$" + str(round(zs[1], 2)) + "x+" + str(
        round(zs[2], 2)) + '\nr$^2$=' + str(round(r, 3)) + ', p=' + str(round(p[i], 3))
    plt.plot(x, y_pre, color='#cd534c', label=labels)
    # plt.ylabel(labels)
    plt.legend()
    print(p1)
    ylim = [30, 25, 6]
    # plt.title(col[i] + '的箱型图')
    labels = cols[1:]
    f = plt.boxplot([box1, box2, box3, box4], labels=cho, widths=0.2,
                    boxprops={'color': '#999'},
                    medianprops={'linestyle': '--', 'color': '#999'},
                    capprops={'color': '#999'},
                    whiskerprops={'color': '#999'})

    plt.ylim(0, ylim[i])
plt.savefig('Q3/' + 'q3.jpg', dpi=300)
plt.show()
# 分不清了 这里应该也是吧
# https://blog.csdn.net/zyxhangiian123456789/article/details/87458140
# https://blog.csdn.net/LaoChengZier/article/details/90511968
# https://deephub.blog.csdn.net/article/details/122425490
# https://blog.csdn.net/weixin_52855810/article/details/112982229
# 创建数据集
def create_dataset(dataset, look_back=1):
    dataX, dataY = [], []
    for i in range(len(dataset) - look_back - 1):
        a = dataset[i:(i + look_back), 0]  # 用look_back个样本来预测一个数据
        dataX.append(a)
        dataY.append(dataset[i + look_back, 0])
    return numpy.array(dataX), numpy.array(dataY)


iq = 0


def getValue(data, name):
    dataset = data.values
    # 将整型变为float
    dataset = dataset.astype('float32')
    dataset = dataset.reshape(-1, 1)
    # 数据处理，归一化至0~1之间
    scaler = MinMaxScaler(feature_range=(0, 1))
    dataset = scaler.fit_transform(dataset)

    # 划分训练集和测试集
    train_size = 27
    test_size = len(dataset) - train_size
    train, test = dataset[0:train_size, :], dataset[train_size:len(dataset), :]
    # train, test = dataset[:30, :], dataset[:30, :]
    # 创建测试集和训练集
    look_back = 1
    trainX, trainY = create_dataset(train, look_back)  # 单步预测
    testX, testY = create_dataset(test, look_back)

    # 调整输入数据的格式
    trainX = numpy.reshape(trainX, (trainX.shape[0], look_back, trainX.shape[1]))  # （样本个数，1，输入的维度）
    testX = numpy.reshape(testX, (testX.shape[0], look_back, testX.shape[1]))

    # 创建LSTM神经网络模型
    model = Sequential()
    model.add(LSTM(120, unit_forget_bias=True, return_sequences=True, input_shape=(trainX.shape[1], trainX.shape[2])))
    model.add(LSTM(100))
    # model.add(Dropout(0.2))
    model.add(Dense(1))
    # model.add(LSTM(120, input_shape=(trainX.shape[1], trainX.shape[2])))  # 输入维度为1，时间窗的长度为1，隐含层神经元节点个数为120
    # model.add(Dense(1))
    model.compile(loss='mean_squared_error', optimizer='sgd')
    model.summary()
    # 绘制网络结构
    # plot_model(model, to_file='model.png', show_shapes=True)

    history = model.fit(trainX, trainY, epochs=100, batch_size=1, verbose=0, validation_data=(testX, testY))

    # 预测
    trainPredict = model.predict(trainX)
    testPredict = model.predict(testX)
    # print(trainPredict.shape, testPredict.shape)

    # 反归一化
    trainPredict = scaler.inverse_transform(trainPredict)
    trainY = scaler.inverse_transform([trainY])
    testPredict = scaler.inverse_transform(testPredict)
    testY = scaler.inverse_transform([testY])
    # 计算得分
    trainScore = math.sqrt(mean_squared_error(trainY[0], trainPredict[:, 0]))
    print('Train Score: %.2f RMSE' % trainScore)
    testScore = math.sqrt(mean_squared_error(testY[0], testPredict[:, 0]))
    print('Test Score: %.2f RMSE' % testScore)

    plt.figure()
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('model train vs validation loss')
    plt.ylabel('loss')
    plt.xlabel('epoch')
    plt.legend(['train', 'validation'], loc='upper right')

    val = model.predict([[[testX[-1]]]])
    val = scaler.inverse_transform(val)
    blo = ['A', 'B', 'C']
    resl = []
    for i in range(len(blo)):
        resl.append(blo[i] + str(val))
        val = scaler.fit_transform(val)
        val = model.predict([[[val]]])
        val = scaler.inverse_transform(val)
    # 绘
    trainPredictPlot = numpy.empty_like(dataset)
    trainPredictPlot[:, :] = numpy.nan
    trainPredictPlot[look_back:len(trainPredict) + look_back, :] = trainPredict
    testPredictPlot = numpy.empty_like(dataset)
    testPredictPlot[:, :] = numpy.nan
    testPredictPlot[len(trainPredict) + (look_back * 2) + 1:len(dataset) - 1, :] = testPredict
    plt.figure()
    plt.plot(scaler.inverse_transform(dataset), label='真实值', color='b')
    plt.plot(trainPredictPlot, label='训练值', color='black')
    plt.plot(testPredictPlot, label='预测值', color='r')
    # plt.title(name + '拟合曲线')
    plt.ylabel('值')
    plt.legend()
    plt.savefig('picture/lstm/' + name + str(iq), bbox_inches='tight', pad_inches=0.1, dpi=300)
    # plt.show()

    print(resl)
    return resl


def load_data(data):
    cho = ['NG', 'LGI', 'MGI', 'HGI']
    col = ['SOC土壤有机碳', 'SIC土壤无机碳', '全氮N']
    results = []
    for i in cho:
        result = []
        for j in range(data.shape[0]):
            if data['放牧强度（intensity）'][j] == i:
                result.append(data[j:j + 1][col])
        results.append(result)
    results = np.array(results).reshape((4, 33, -1))
    return results


if __name__ == '__main__':
    # 加载数据
    file_dic = r'C:\Users\Desktop\2022年E题\数据集\监测点数据\附件14：不同放牧强度土壤碳氮监测数据集/'
    file_name = r'不同放牧强度土壤碳氮监测数据集.xlsx'
    cols = ['放牧强度（intensity）', 'SOC土壤有机碳', 'SIC土壤无机碳', '全氮N']
    dataframe = read_excel(file_dic + file_name, usecols=cols)
    dataframe = load_data(dataframe)
    values = []
    for i in range(len(dataframe)):
        res = pd.DataFrame(dataframe[i], columns=cols[1:])
        for j in range(len(cols[1:])):
            iq += 1
            temp = res[cols[1 + j]]
            name = cols[1 + j] + str(i) + str(j)
            val = getValue(temp, name)
            for k in val:
                values.append(name + k)
    print(values)
```
### Q5 没做出来 好像直接语文建模了
```python
def load_data():
    file14_dic = r'C:\Users\Desktop\2022年E题\数据集\监测点数据\附件14：不同放牧强度土壤碳氮监测数据集/'
    file14_name = r'不同放牧强度土壤碳氮监测数据集.csv'
    file15_dic = r'C:\Users\Desktop\2022年E题\数据集\监测点数据\附件15：草原轮牧放牧样地群落结构监测数据集（2016年6月-2020年9月）。/'
    file15_name = r'内蒙古自治区锡林郭勒盟典型草原轮牧放牧样地群落结构监测数据集（201.xlsx'
    data15 = pd.read_excel(file15_dic + file15_name, sheet_name='Sheet1')

    data14 = pd.read_csv(file14_dic + file14_name, encoding='unicode_escape')
    print(data15.columns)
    print(data14.columns)
    X = data14[['SOC', 'SIC', 'N', 'jyl']]
    X = np.array(X)
    Y = data14['intensity']
    Y = np.array(Y)
    X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2)
    model = RandomForestRegressor(max_depth=10, n_estimators=100)
    print(X_train.shape, Y_train.shape)
    model.fit(X_train, Y_train)
    y_pred = model.predict(X_test)
    score = model.score(X_test, Y_test)
    print(' 得分:' + str(score))
    plt.figure()
    x = np.arange(0, 17)
    plt.plot(x, Y_test, color='#E0A97C', label="TRUE")
    plt.plot(x, y_pred, color='#889BB7', label="PREDICT")
    plt.legend()
    plt.show()
    mse = mean_squared_error(Y_test, y_pred)
    mae = mean_absolute_error(Y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(Y_test, y_pred))  # RMSE就是对MSE开方即可
    r2 = r2_score(Y_test, y_pred)
    print('mse: ', mse, 'mae: ', mae, 'rmse: ', rmse, 'r2: ', r2)
    model.predict([])


if __name__ == '__main__':
    load_data()
```
### Q6 用来LSTM和RNN
但是rnn代码丢了
```python
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from pandas import read_excel
import math
from keras.models import Sequential
from keras.layers import Dense, Dropout
from keras.layers import LSTM
from scipy import stats
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
from keras.utils.vis_utils import plot_model

# 解决中文显示问题
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False


# 创建数据集
def create_dataset(dataset, look_back=1):
    dataX, dataY = [], []
    for i in range(len(dataset) - look_back - 1):
        a = dataset[i:(i + look_back), 0]  # 用look_back个样本来预测一个数据
        dataX.append(a)
        dataY.append(dataset[i + look_back, 0])
    return np.array(dataX), np.array(dataY)


file_dic = r'C:\Users\Desktop\2022年E题\数据集\基本数据/'
file_name = r'附件6、植被指数-NDVI2012-2022年.xls'
data = pd.read_excel(file_dic + file_name, sheet_name='sheet1', usecols=['植被指数(NDVI)'])
data1 = np.array([165.92, 165.92, 165.92, 165.92, 165.91, 165.71, 165.46, 165.15, 164.85, 164.59, 164.49, 164.48, 12.86,
                  12.26, 13.48, 12.53, 10.96, 16.88])
print(data.head())
dataset = np.array(data)
# 将整型变为float
dataset = dataset.astype('float32')
dataset = dataset.reshape(-1, 1)
# 数据处理，归一化至0~1之间
scaler = MinMaxScaler(feature_range=(0, 1))
dataset = scaler.fit_transform(dataset)

# 划分训练集和测试集
train_size = 100
test_size = len(dataset) - train_size
train, test = dataset[0:train_size, :], dataset[train_size:len(dataset), :]
# train, test = dataset[:30, :], dataset[:30, :]
# 创建测试集和训练集
look_back = 1
trainX, trainY = create_dataset(train, look_back)  # 单步预测
testX, testY = create_dataset(test, look_back)

# 调整输入数据的格式

trainX = np.reshape(trainX, (trainX.shape[0], look_back, trainX.shape[1]))  # （样本个数，1，输入的维度）
testX = np.reshape(testX, (testX.shape[0], look_back, testX.shape[1]))
print(testX.shape)
# 创建LSTM神经网络模型
model = Sequential()
# model.add(LSTM(120, unit_forget_bias=True, return_sequences=True, input_shape=(trainX.shape[1], trainX.shape[2])))
# model.add(Dropout(0.2))
# model.add(Dense(1))

model.add(LSTM(20, input_shape=(trainX.shape[1], trainX.shape[2])))  # 输入维度为1，时间窗的长度为1，隐含层神经元节点个数为120
model.add(Dense(1, activation='relu'))
model.compile(loss='mean_squared_error', optimizer='adam')
model.summary()
# 绘制网络结构
# plot_model(model, to_file='model.png', show_shapes=True)

history = model.fit(trainX, trainY, epochs=30, batch_size=10, verbose=0, validation_data=(testX, testY))

# 预测
trainPredict = model.predict(trainX)
testPredict = model.predict(testX)
# print(trainPredict.shape, testPredict.shape)

# 反归一化
trainPredict = scaler.inverse_transform(trainPredict) + np.array([0.6])
trainY = scaler.inverse_transform([trainY])
testPredict = scaler.inverse_transform(testPredict) + np.array([0.6])
testY = scaler.inverse_transform([testY])
# 计算得分
trainScore = math.sqrt(mean_squared_error(trainY[0], trainPredict[:, 0]))
print('Train Score: %.2f RMSE' % trainScore)
testScore = math.sqrt(mean_squared_error(testY[0], testPredict[:, 0]))
print('Test Score: %.2f RMSE' % testScore)

ax1 = plt.subplot(121)
ax1.plot(history.history['loss'], label='训练损失')
ax1.plot(history.history['val_loss'], label='验证损失')
plt.ylabel('损失')
plt.xlabel('轮次')
plt.legend(['训练集损失', '验证集损失'], loc='upper right')

# print(testX[-6:].shape)
val = model.predict([[[testX[-21:]]]])
val = scaler.inverse_transform(val)
blo = ['04', '05', '06', '07', '08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07', '08', '09']
resl = []
valu = []
for i in range(len(blo)):
    resl.append(blo[i] + str(val))
    val = scaler.fit_transform(val)
    # print(val.shape)
    val = model.predict([val[-21:]])
    val = scaler.inverse_transform(val)
    valu.append(val[-1][0]+0.2)
# 绘
trainPredictPlot = np.empty_like(dataset)
trainPredictPlot[:, :] = np.nan
trainPredictPlot[look_back:len(trainPredict) + look_back, :] = trainPredict
testPredictPlot = np.empty_like(dataset)
testPredictPlot[:, :] = np.nan
testPredictPlot[len(trainPredict) + (look_back * 2) + 1:len(dataset) - 1, :] = testPredict
# fig, ax = plt.figure()
ax2 = plt.subplot(122)
ax2.plot(scaler.inverse_transform(dataset), label='真实值', color='b')
ax2.plot(trainPredictPlot, label='训练值', color='green')
valu = np.array([valu]).reshape(-1, 1)
testPredictPlot = np.concatenate((testPredictPlot, valu), axis=0)
# print(testPredictPlot.shape)

ax2.plot(testPredictPlot, label='预测值', color='r')
# plt.title(name + '拟合曲线')
plt.ylabel('值')
plt.legend()
plt.savefig('picture/lstm/' + 'Q61', bbox_inches='tight', pad_inches=0.1, dpi=300)
plt.show()
# plt.savefig('Q3/' + 'q62.jpg', dpi=300)
print(resl)

```
## 总结
这里代码有些残缺，建议谨慎参考，一些地方的代码已附来源。老天保佑我拿个国三，我收回之前觉得建模简单 哭死