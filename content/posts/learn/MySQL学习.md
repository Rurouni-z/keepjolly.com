---
title: MySQL学习
date: 2023-08-10 23:13:48 +0800
lastmod: 
summary: 
url: 
slug: mysql-tutorial
toc: true
rightToc: false
categories: 
- learn
tags: 
- MySQL
original: true
author: Rurouni
website: www.keepjolly.com
---
## 数据库概述
[资料](https://pan.baidu.com/s/18W0ZRYaCR60mQWFP92CJsg?pwd=2you)+[视频](https://www.bilibili.com/video/BV1Vy4y1z7EX)
### MySQL常用命令
| 退出 | exit |
| --- | --- |
| 查看数据库 | show databases; |
| 使用某数据库 | use xxx; |
| 创建数据库 | create databse xxx; |
| 查看数据库中的表 | show tables; |
| 导入表 | source path/xxx.sql |
| 查看当前使用的数据库 | select database() |
| 批量执行sql脚本 | source xxx.sql(或者windows直接sql文件拖进来) |
| [建议都小写](https://www.cnblogs.com/kevingrace/p/6150748.html)，不同操作系统处理方式不一致 | 以;结尾才会执行 |

### 表的理解

- 数据库中最基本的单位是表
- 数据库中以表格的形式表示数据
- 任何一张表都有行和列：
   - 行：数据/记录
   - 列：字段（包含字段名、数据类型、约束等属性）
- 数据库中的有一条命名规范：所有的标识符都是全部小写，单词和单词之间使用下划线进行衔接。
### SQL语句的分类

- DQL：数据查询语言（有select关键字）
- DML：数据**操作**语言（增删改表中的数据（insert into、delete、update））
- DDL：数据**定义**语言（增删改表（create、drop、alter））
- TCL：事务控制语言（事务提交commit、事务回滚rollback）
- DCL：数据控制语言（授权grant、撤权revoke）
### 查看表信息

- select * from table_name 查看表内数据
- desc table_name  查看表结构
## SQL查询
### 简单查询
查询一个字段：

- select 字段名 from 表名;
   - select/from是关键字
   - 字段名和表名是标识符
   - 字段名处也可以为字面量/字面值，此时输出 值为一样的所有行
      - select 1000 as num from EMP;

查询多个字段：

- select 字段名1,字段名2 from 表名

查询全部字段：

- select 全部字段 from 表名
- or
- select * from 表名 
   - 效率比较低，可读性差
   - 不建议写到程序里

起别名：

- select 字段名 as 别名 from 表名
   - 只是将查询结果的列表显示为别名，不会修改表字段名

例：

- -- mysql注释
- select deptno, dname deptname from dept;  -- 去除as
- select deptno, dname 'dept name' from dept  -- 别名加空格/中文用单引号;
   - 注意数据库中使用单引号，双引号不标准
- select ename, sal*10 as '年薪' from EMP -- 使用数学表达式 ;
### 条件查询
语法格式：<br />select 字段1, 字段2<br />from 表名<br />where 条件;<br />比较符号：

- = 、<>或!= 、< 、<= 、> 、>=、between…and … （闭区间，左小右大）
- select empno, enmae, sal from EMP where sal < 1000;

判断符号：

- is null 为空（ is not null 不为空）<br />and 、or <br />in 包含，相当于多个 or （ not in 不在这个范围中）<br />not 可以取非，主要用在 is 或 in 中
- select empno,ename,sal,comm from emp where comm **is null**;
- select * from emp where (job='MANAGER' **or** job = 'SALESMAN') **and** sal > 3000;
   - and 优先级高
- select empno,ename,job from emp where job **in** ('MANAGER', 'SALESMAN');

模糊查询：

- like 称为模糊查询，支持%或下划线匹配
- 特殊符号：% 匹配任意个字符、_ 只匹配一个字符
- select ename from emp where ename like '%T' -- 最后一个是T 
- select ename from emp where ename like '__R%'   -- 第三个字母是R
- select name from t_student where name like '%\_%' -- \转义字符
### 排序
语法格式：<br />select * from tablename <br />order by sal  -- 默认升序;<br />order by sal desc -- 降序 或者-sal;<br />order by sal asc -- 升序 或者+sal;<br />语句顺序为 from -> where -> order by<br />多字段排序：

- select ename,sal from emp<br />order by <br />	sal asc, ename asc; // sal在前，起主导，只有sal相等的时候，才会考虑启用ename排序。
### 数据处理函数
又称为单行处理函数。特点：一个输入对应一个输出。<br />常见函数：

- Lower 转换小写、upper 转换大写
   - select lower(ename) as ename from EMP;
- substr 取子串 (substr(被截取的字符串,起始下标,截取的长度))
   - select ename from EMP where substr(ename, 1, 1) = 'A' -- 下标从1开始
   - select concat(lower(substr(ename,1,1)), substr(ename, 2)) as result from EMP  -- 首字母小写
- length 取长度
   - select length(ename) enamelength from EMP;
- trim 去空格
   - select * from EMP where ename = trim('   KING');
- str_to_date 将字符串转换成日期
   - str_to_date('字符串日期', '日期格式')
   - %Y	年  %m 月  %d 日  %h  时  %i   分   %s   秒
   - %Y-%m-%d 不需要写日期格式
   - 通常使用在插入insert方面，因为插入的时候需要一个日期类型的数据
   - insert into t_user(id,name,birth) values(1, 'zhangsan', str_to_date('01-10-1990','%d-%m-%Y'));
   - 默认格式  %Y-%m-%d
- date_format 格式化日期
   - date_format(birth, '%m/%d/%Y')
   - 通常使用在查询日期方面。设置展示的日期格式。
   - select id,name,date_format(birth,'%Y/%m/%d') as birth from t_user;
   - 默认的日期格式：'%Y-%m-%d'
- format 设置千分位
   - select ename, format(sal, '$999,9999') as sal from EMP;  // 不写999没事
- round 四舍五入
   - select round(1236.5567, -1) as res from EMP;   // 个位数四舍五入
- rand() 生成随机数
   - select round(rand()*100,0) from emp; // 100以内的随机数
- Ifnull 可以将 null 转换成一个具体值
   - ifnull是空处理函数。专门处理NULL的。<br />在所有数据库当中，只要有NULL参与的数学运算，最终结果就是NULL。
   - select ename, (sal + ifnull(comm, 0)) * 12 as yearsal from emp;
- case ... when ... then ... when ... then ... else ... end
   - select ename,  job, sal as oldsal,<br />(case job when 'MANAGER' then sal * 1.1 when 'SALESMAN' then sal * 1.5 else sal end) as newsal <br />from emp;
### 分组函数
又名多行处理函数，特点：输入多行，输出一行。<br />分组函数在使用的时候先分组，再使用，默认一张表为一组。

- count 计数
   - select count(ename) from EMP;
- sum 求和
- avg 平均值
- max 最大值
- min 最小值

注意事项：

- 分组函数自动忽略NULL，不需要提前处理NULL
- 分组函数中count(*)和count(具体字段)的区别
   - 具体字段：统计该字段下所有不为NULL的元素的总数
   -  *：统计表中所有行。一行不可能全为NULL
- 分组函数不能直接用在where子句中
   - select ename,sal from emp where sal > min(sal);  // error
- 所有分组函数可以组合起来使用，不能嵌套使用
#### 分组查询
select ... from ... **group by** ...
##### 执行顺序

- from -> where -> group by -> having -> select -> order by

为什么分组函数不能直接使用在where后面？<br />select ename,sal from emp where sal > min(sal);  //报错。<br />因为分组函数在使用的时候必须**先分组之后才能使用**。<br />where执行的时候，还没有分组。所以where后面不能出现分组函数。<br />select sum(sal) from emp; 这个没有分组，为啥sum()函数可以用呢？<br />因为select在group by之后执行。不分组默认一张表一组<br />例：

- select job,sum(sal) from emp group by job;
   - 先从emp表中查询数据。根据job字段进行分组。然后对每一组的数据进行sum(sal)
   - 在一条select语句当中，如果有group by语句的话，select后面只能跟：**参加分组的字段，以及分组函数**。其它的一律不能跟，sql旧版本不会报错。
- select deptno, job, max(sal) from emp group by deptno, job;
   - 联合分组查询，每个部门，不同工作岗位的最高薪资

使用**having**  <br />进一步过滤 （不能单独使用，只能配套group by）<br />where和having，优先选择where，where实在完成不了，再选择having。<br />例：

- select job, avg(sal) avgsal from EMP where job <> 'MANAGER' group by job having avg(sal) > 1500 order by avgsal desc;
   - 最好使用desc而不是-avgsal 会报错
### 连接查询

- 去除重复记录 distinct
   - // distinct出现在job,deptno两个字段之前，表示两个字段联合起来去重。
   - select distinct job,deptno from emp;
   - select count(distinct job) from emp;  // 得到工作种类数

概念：多张表联合查询。<br />连接查询的分类：

- 语法的年代
   - sql92
   - sql99 （本文使用）
- 连接的方式
   - 内连接
      - 等值连接
      - 非等值连接
      - 自连接
   - 外连接
      - 左外连接（左连接）
      - 右外连接（右连接）
#### 笛卡尔积
当两张表进行连接查询，没有任何条件限制的时候，最终查询结果条数，是两张表行数的乘积，这种现象被称为：笛卡尔积现象。<br />加入条件限制：select ename, dname from EMP, DEPT where EMP.ename = DEPT.dname<br />匹配次数没减少，显示条数减少，添加筛选<br />优化（表起别名）：
> select e.ename, d.dname from EMP e, DEPT  d where e.deptno = d.deptno; //92语法

注意：通过笛卡尔积现象得出，**表的连接次数越多效率越低**，尽量避免表的连接次数。
#### 内连接
sql92的缺点：结构不清晰，表的连接条件，和后期进一步筛选的条件，都放到了where后面。<br />sql99的优点：表连接的条件是独立的，连接之后，如果还需要进一步筛选，再往后继续添加where。<br />sql99的语法：select ... from a **join** b **on** a和b的连接条件 where 筛选条件 （默认内连接 inner join）

内连接特点：A和B连接，AB两张表没有主次关系。平等的。

- 等值连接
   - 条件是等量关系，所以被称为等值连接。
   - select e.ename,d.dname from emp e inner join dept d on **e.deptno = d.deptno**;
- 非等值连接
   - 条件不是一个等量关系，称为非等值连接。
   - select e.ename, e.sal, s.grade from emp e inner join salgrade s on **e.sal between s.losal and s.hisal;**
- 自连接
   - 一张表看做两张表。
   - select a.ename, b.ename from EMP a join EMP b on a.mgr = b.empno;
   - 注意 null不显示
#### 外连接

- 右连接
   - select e.ename,d.dname from emp e  **right outer join** dept d on e.deptno = d.deptno;
   - right表示将join关键字**右边的这张表看成主表**，主要是为了将这张表的数据全部查询出来，捎带着关联查询左边的表。在外连接当中，两张表连接，产生了主次关系。
- 左连接
   - select a.ename as '员工名', b.ename as '领导名' from emp a **left join** emp b on a.mgr = b.empno;
   - 内连接不显示null
- 外连接的查询结果条数一定是 >= 内连接的查询结果条数
#### 多表连接
 语法：
```sql
select ... from a
join
    b
on
    a和b的连接条件
join
    c
on
    a和c的连接条件
right join
    d
on
    a和d的连接条件

每个员工的部门名称以及工资等级，还有上级领导，员工信息
select 
  e.ename,e.sal,d.dname,s.grade,l.ename
from
  emp e
join
  dept d
on 
  e.deptno = d.deptno
join
  salgrade s
on
  e.sal between s.losal and s.hisal
left join
  emp l
on
  e.mgr = l.empno;
```
### 子查询
定义：select语句中嵌套select语句，被嵌套的语句称为子查询<br />子查询可以出现在select ...(select) from ... (select) where ... (select)

- where中的子查询
   - select ename,sal from emp where sal > (select min(sal) from emp);
- from中的子查询
   - 可以将子查询的结果作为临时表
   - select  t.*, s.grade from<br />(select job,avg(sal) as avgsal from emp group by job) t <br />join salgrade s on t.avgsal between s.losal and s.hisal;
      - 子查询中avg要起别名
- select中的子查询 （了解即可）
   - select子查询必须返回一条结果
   - select e.ename,e.deptno,(select d.dname from dept d where e.deptno = d.deptno) as dname from emp e;
### union
union的效率要高一些。对于表连接来说，每连接一次新表，则匹配的次数满足笛卡尔积，成倍的翻。。<br />但是union可以减少匹配的次数。在减少匹配次数的情况下，还可以完成两个结果集的拼接。<br />a 连接 b 连接 c<br />a 10条记录<br />b 10条记录<br />c 10条记录<br />匹配次数是：1000

a 连接 b一个结果：10 * 10 --> 100次<br />a 连接 c一个结果：10 * 10 --> 100次<br />使用union的话是：100次 + 100次 = 200次。（union把乘法变成了加法运算）
```sql
select ename,job from EMP where job = 'MANAGER'
union
select ename from EMP where job = 'SALESMAN';   -- 需要加上job  
-- 否则oracle,mysql8报错，要求：结果集合并时列和列的数据类型也要一致。
```
### limit (!important)
limit作用：将查询结果集的一部分取出来。通常使用在分页查询当中。<br />完整用法：limit startIndex, length<br />只能加[数字](https://stackoverflow.com/questions/53234654/how-to-set-the-value-of-limit-using-select-countid-from-another-table-mysql)
> The LIMIT clause can be used to constrain the number of rows returned by the [SELECT](https://dev.mysql.com/doc/refman/8.0/en/select.html) statement. LIMIT takes one or two numeric arguments, which must both be nonnegative integer constants, with these exceptions: 
> - Within prepared statements, LIMIT parameters can be specified using ? placeholder markers. 
> - Within stored programs, LIMIT parameters can be specified using integer-valued routine parameters or local variables. 

startIndex是起始下标从0开始，length是长度。<br />缺省用法：limit 5; 这是取前5.

- 执行顺序在order by 之后
- select ename, sal from EMP order by sal limit 2, 3;
#### 分页
每页显示pageSize条记录<br />	第pageNo页：limit (pageNo - 1) * pageSize  , pageSize
### DQL总结
```sql
select 
  ...
from
  ...
where
  ...
group by
  ...
having
  ...
order by
  ...
limit
  ...

执行顺序：
  1.from
  2.where
  3.group by
  4.having
  5.select
  6.order by
  7.limit..

```
## SQL增删改
### mysql中的数据类型

- varchar(最长255)	可变长度的字符串
   - 比较智能，节省空间。会根据实际的数据长度动态分配空间。
   - 优点：节省空间。缺点：需要动态分配空间，速度慢。
- char(最长255)	定长字符串
   - 不管实际的数据长度是多少。分配固定长度的空间去存储数据。使用不恰当的时候，可能会导致空间的浪费。
   - 优点：不需要动态分配空间，速度快。缺点：使用不当可能会导致空间的浪费。
   - varchar和char我们应该怎么选择？
   - 性别字段你选什么？因为性别是固定长度的字符串，所以选择char。<br />姓名字段你选什么？每一个人的名字长度不同，所以选择varchar。
- int	整数型。(最长11)。
- bigint	长整型。
- float	单精度浮点型数据
- double	双精度浮点型数据
- date	短日期类型
   - 默认格式：%Y-%m-%d
- datetime	长日期类型
   - 默认格式：%Y-%m-%d %h:%i:%s
   - 获取当前时间 now()函数
- clob	字符大对象	Character Large OBject
   - 最多可以存储4G的字符串。超过255个字符的都要采用CLOB字符大对象来存储。
- blob	二进制大对象	Binary Large Object
   - 专门用来存储**图片、声音、视频**等流媒体数据。
   - 往BLOB类型的字段上插入数据的时候，例如插入一个图片、视频等，需要使用IO流。
### 增删改表（DDL）

- create table 表名(字段名1 数据类型, 字段名2 数据类型, ...);
   - 表名：建议以t_ 或者 tbl_开始，可读性强。见名知意。
   - 字段名：见名知意。
   - 表名和字段名都属于**标识符**。
   - 快速建表：create table emp as select * from EMP;  //了解
      - 将查询结果当做一个表新建，完成快速复制
```sql
  create table t_student(
		no int,
		name varchar(32),
		sex char(1) default 'm',
		age int(3),
		email varchar(255)
	);
```

- drop table 表名;   // 不存在则删除报错
   - drop table if exists 表名;  // 不报错 
- truncate table 表名 
   - 比delete 快，但是不支持回滚，是物理删除，需要仔细确认。
   - 删除表数据，不是删除表
### 增删改数据（DML）

- insert into 表名(字段名1,字段名2,字段名3...) values(值1,值2,值3), (值1, 值2, 值3), (...);
   - 注意：字段名和值要一一对应。数量要对应。数据类型要对应。
   - insert语句执行成功了，必然会多一条记录。没有给其它字段指定值的话，默认值是NULL。
   - insert into t_student values(2, 'lisi', 'f', 20, 'lisi@123.com');   // 不写字段名，需要跟表字段名一一对应
   - 快速复制：insert into emp_bak select  * from emp;   //了解
- update 表名 set 字段名1=值1, 字段名2=值2,...** where 条件**;
   - 不加条件限制会更新所有数据
- delete from 表名** where 条件**;
   - 不加条件限制会删除所有数据
   - 删除数据的原理：表中的数据被删除了，但是保存在硬盘内的数据不会被释放；因此效率较低，但是可以回滚，恢复数据
### 增删改表结构

- 开发中很少进行表结构的修改。
- alter关键字
### 约束
保证数据有效性、完整性<br />约束包括：<br />create table中指定

- 非空约束 not null
   - 列级约束：id int **not null**
- 唯一性约束 unique
   - null可以重复
   - 列级约束：name varchar(23) **unique**
   - 表级约束（多字段联合约束）：**unique(**name, email**)**
- **主键约束 primary key**
   - 主键约束、主键字段、主键值
   - 一个字段同时非空又不能重复自动为主键，oracle不行，主键约束特征是not null + unique
   - 每个表都应有主键，是每一行记录的唯一标识
   - 可以单一主键或复合主键（不建议使用复合）
      - int id primary key,
      - primary key(id, name),
   - 又分为自然主键和业务主键，通常自然主键
   - 主键约束只能有一个
   - 建议使用int、bigint、char，等定长类型
   - 自动维护主键值：id int primary key **auto_increment**,
- **外键约束 foreign key**
   - 减少表冗余，防止出现无效数据
   - 外界约束、外键字段、外键值
   - 格式： foreign key(子表字段) references (父表唯一性约束字段，可以为NULL)
- 检查约束 check （mysql 不支持，oracle支持）
### 存储引擎
存储引擎是MySQL中特有的一个术语，其它数据库中没有。（Oracle中有，但是不叫这个名字）<br />存储引擎是一个表**存储/组织数据的方式**。<br />不同的存储引擎，表存储数据的方式不同。<br />给表指定存储引擎

- 显示存储引擎：show create table 表名
- mysql默认引擎是InnoDB，字符集utf8
- 格式：create table 表名() engine=InnoDB default charset=gbk;

查看mysql支持存储引擎：show engines \G

- MyISAM存储引擎
   - 它管理的表具有以下特征：
      - 使用三个文件表示每个表：
         - 格式文件 — 存储表结构的定义（mytable.frm / framework）
         - 数据文件 — 存储表行的内容（mytable.MYD/ mydata）
         - 索引文件 — 存储表上索引（mytable.MYI / myindex）：索引是一本书的目录，缩小扫描范围，提高查询效率的一种机制。
      - 可被转换为压缩（只读）表来节省空间
      - 对于一张表来说，只要是主键，或者加有unique约束的字段上会自动创建索引。
   - MyISAM存储引擎特点：
      - 可被转换为压缩（只读）表来**节省空间**
      - 这是这种存储引擎的优势！
   - MyISAM不支持事务机制，安全性低。
- InnoDB存储引擎
   - 这是mysql默认的存储引擎，同时也是一个重量级的存储引擎。
   - InnoDB支持事务，支持数据库崩溃后自动恢复机制。
   - InnoDB存储引擎最主要的特点是：非常安全。
   - 它管理的表具有下列主要特征：
      - 每个 InnoDB 表在数据库目录中以.frm 格式文件表示
      - InnoDB 表空间 tablespace 被用于存储表的内容（表空间是一个逻辑名称。表空间：存储数据+索引。）
      - 提供一组用来记录事务性活动的日志文件
      - 用 COMMIT(提交)、SAVEPOINT 及ROLLBACK(回滚)支持**事务**处理
      - 提供全 ACID 兼容
      - 在 MySQL 服务器崩溃后提供自动恢复
      - 多版本（MVCC）和行级锁定
      - 支持外键及引用的完整性，包括级联删除和更新
   - InnoDB最大的特点就是支持事务：
      - 保证数据的安全。效率不是很高，不能压缩，不能转换为只读，不能很好的节省存储空间。
- MEMORY存储引擎
   - 用 MEMORY 存储引擎的表，其数据存储在内存中，且行的长度固定，这两个特点使得 MEMORY 存储引擎非常快。
   - MEMORY 存储引擎管理的表具有下列特征：
      - 在数据库目录内，每个表均以.frm 格式的文件表示。
      - 表数据及索引被存储在内存中。（目的就是快，查询快！）
      - 表级锁机制。
      - 不能包含 TEXT 或 BLOB 字段。
   - MEMORY 存储引擎以前被称为HEAP 引擎。
   - MEMORY引擎优点：查询效率是最高的。不需要和硬盘交互。
   - MEMORY引擎缺点：不安全，关机之后数据消失。因为数据和索引都是在内存当中。
### 事务
一个事务是一个完整的业务逻辑。是一个最小的工作单元。不可再分，同生同死。<br />事务：就是批量的DML语句同时成功，或者同时失败！<br />一个完整的业务逻辑：

1. 假设转账，从A账户向B账户中转账10000.
2. 将A账户的钱减去10000（update语句）
3. 将B账户的钱加上10000（update语句）
4. 这就是一个完整的业务逻辑。

只有DML语句有事务一说，因为它们涉及数据的增删改，insert/update/delete

InnoDB存储引擎：提供一组用来记录事务性活动的日志文件。<br />在事务的执行过程中，每一条DML的操作都会记录到“事务性活动的日志文件”中。<br />在事务的执行过程中，可以提交事务，也可以回滚事务。

- 提交事务
   - commit;
   - 清空事务性活动的日志文件，将数据全部彻底持久化到数据库表中。提交事务标志着，事务的结束。并且是一种全部成功的结束。
   - 默认执行一条提交一次。
- 回滚事务
   - rollback;
   - 将之前所有的DML操作全部撤销，并且清空事务性活动的日志文件。回滚事务标志着，事务的结束。并且是一种全部失败的结束。

使用start transaction; 关闭提交事务（默认）<br />commit;/rollback; 后结束该次事务。

事务四个特性：

- A：原子性 atomicity
   - 说明事务是最小的工作单元。不可再分。
- C：一致性 consistency
   - 所有事务要求，在同一个事务当中，所有操作必须同时成功，或者同时失败，以保证数据的一致性。
- I：隔离性 isolation
   - 隔离两种事务。
- D：持久性 durability
   - 事务最终结束的一个保障。事务提交，就相当于将没有保存到硬盘上的数据保存到硬盘上！

隔离性：

- 读未提交：read uncommitted（最低的隔离级别）《没有提交就读到了》
   - 事务A可以读取到事务B未提交的数据。
   - 这种隔离级别存在的问题就是：**脏读现象**！(Dirty Read)
   - 这种隔离级别一般都是理论上的，大多数的数据库隔离级别都是二档起步！
- 读已提交：read committed《提交之后才能读到》
   - 事务A只能读取到事务B提交之后的数据。
   - 解决了脏读的现象。
   - 这种隔离级别存在的问题：**不可重复读取数据**。
      - 什么是不可重复读取数据呢？
      - 在事务开启之后，第一次读到的数据是3条，当前事务还没有结束，可能第二次再读取的时候，读到的数据是4条，3不等于4称为不可重复读取。
   - 这种隔离级别是比较真实的数据，每一次读到的数据是绝对的真实。
   - oracle数据库默认的隔离级别是：read committed
- 可重复读：repeatable read《提交之后也读不到，永远读取的都是刚开启事务时的数据》
   - 事务A开启之后，不管是多久，每一次在事务A中读取到的数据都是一致的。即使事务B将数据已经修改，并且提交了，事务A读取到的数据还是没有发生改变，这就是可重复读。
   - 解决了不可重复读取数据。
   - 可重复读存在的问题：会出现**幻影读**。每一次读取到的数据都是幻象。
      - 不够真实。早晨9点开始开启了事务，只要事务不结束，到晚上9点，读到的数据还是那样！

			读到的是假象。不够绝对的真实。

   - mysql中默认的事务隔离级别就是这个！
- 序列化/串行化：serializable（最高的隔离级别）
   - 这是最高隔离级别，效率最低。解决了所有的问题。
   - 这种隔离级别表示事务排队，不能并发！
   - 每一次读取到的数据都是最真实的，并且效率是最低的。

查看隔离级别：select @@tx_isolation;<br />设置隔离级别：set global transaction isolation level xxxx; exit;
### 索引

- 索引是在数据库表的字段上添加的，是为了提高查询效率存在的一种机制。
- 一张表的一个字段可以添加一个索引，多个字段联合起来叫复合索引。
- MySQL在查询方面主要就是两种方式：
   - 第一种方式：全表扫描
   - 第二种方式：根据索引检索。
- mysql索引是一个B-Tree数据结构。遵循左小右大原则存放。采用中序遍历方式遍历取数据。
- 提醒
   - 提醒1：在任何数据库当中**主键**上都会自动添加索引对象，mysql中一个字段上如果有**unique约束**的话，也会自动创建索引对象。
   - 提醒2：在任何数据库当中，任何一张表的任何一条记录在硬盘存储上**都有一个硬盘的物理存储编号**。
   - 提醒3：在mysql当中，**索引是一个单独的对象**，不同的存储引擎以不同的形式存在，在MyISAM存储引擎中，索引存储在一个.MYI文件中。在InnoDB存储引擎中索引存储在一个逻辑名称叫做tablespace的当中。在MEMORY存储引擎当中索引被存储在内存当中。不管索引存储在哪里，索引在mysql当中都是一个树的形式存在。（自平衡二叉树：B-Tree）
- 什么时候添加字段
   - 数据量庞大（视物理设备决定）
   - 经常出现在where后面，经常会被扫描到
   - 很少DML操作，否则需要重新排序
   - 太多索引会降低性能 
- 添加索引
   - create index emp_ename_index on emp(ename);
- 删除索引
   - drop index emp_ename_index on emp;
- 查看索引
   - explain select * from emp where ename='KING';
   - 看row列的扫描次数
- 索引失效
   - 目前版本不会失效，当使用模糊查询以'%'开头
   - 使用or（union能恢复索引，存疑）
   - 使用复合索引后，没有用最左侧的字段查找
   - where中字段参加了数学运算，字段使用函数

索引是各种数据库进行优化的重要手段。优化的时候优先考虑的因素就是`..索引..`。<br />索引在数据库的分类<br />	单一索引：一个字段上添加索引。<br />	复合索引：两个字段或者更多的字段上添加索引。<br />	主键索引：主键上添加索引。<br />	唯一性索引：具有unique约束的字段上添加索引。<br />	.....<br />	注意：唯一性比较弱的字段上添加索引用处不大。
## 视图
创建视图对象

- create view 视图名 as DQL语句;

删除视图对象

- drop view 视图名

可以面向视图对象进行增删改查，对视图对象的增删改查，会导致原表被操作！（视图的特点：通过对视图的操作，会影响到原表数据。）<br />视图的作用：方便，简化开发，利于维护<br />假设有一条非常复杂的SQL语句，而这条SQL语句需要在不同的位置上反复使用。每一次使用这个sql语句的时候都需要重新编写，很长，很麻烦，怎么办？

- 可以把这条复杂的SQL语句以视图对象的形式新建。
- 在需要编写这条SQL语句的位置直接使用视图对象，可以大大简化开发。
- 并且利于后期的维护，因为修改的时候也只需要修改一个位置就行，只需要修改视图对象所映射的SQL语句。
- 我们以后面向视图开发的时候，使用视图的时候可以像使用table一样。可以对视图进行增删改查等操作。视图不是在内存当中，视图对象也是**存储在硬盘**上的，不会消失。

C:Create（增）<br />R:Retrieve（查）<br />U:Update（改）<br />D:Delete（删）
## DBA命令
重点掌握：<br />	数据的导入和导出（数据的备份）<br />	其它命令了解一下即可<br />数据导出<br />	终端窗口：mysqldump bjpowernode>D:\bjpowernode.sql -uroot -p123456<br />	导出指定的表：mysqldump bjpowernode **emp**>D:\bjpowernode.sql -uroot -p123456<br />数据导入<br />	先登录到mysql数据库服务器上：mysql -uroot -p123456；<br />	然后创建数据库：create database bjpowernode;<br />	使用数据库：use bjpowernode<br />	然后初始化数据库：source D:\bjpowernode.sql
## 数据库三范式
数据库设计依据：数据库表的设计依据。教你怎么进行数据库表的设计。

- **第一范式**：要求任何一张表必须有主键，每一个字段原子性不可再分。
- **第二范式**：建立在第一范式的基础之上，要求所有非主键字段完全依赖主键，不要产生部分依赖。
   - 多对多，三张表，关系表两个主键 （复合主键容易出现部分依赖）
- **第三范式**：建立在第二范式的基础之上，要求所有非主键字段直接依赖主键，不要产生传递依赖。
   - 一对'多'，两张表，'多'的表加外键
- 一对一，外键唯一 （如果一个表内容过多）
- 可以避免数据冗余，空间浪费。
- 实际开发中拿冗余换执行速度，为了客户需求，减少笛卡尔积。
## 34课后题

1. select ename,sal,deptno from emp where sal in (select max(sal) from emp group by deptno);
   - select e.ename, t.* from emp e join (select deptno,max(sal) as maxsal from emp group by deptno) t on t.deptno = e.deptno and t.maxsal = e.sal;
   - 解二效率低
2. select t.*, e.ename, e.sal from emp e join (select deptno,avg(sal) as avgsal from emp group by deptno) t on e.deptno = t.deptno and e.sal > t.avgsal;
3. select deptno, avg(grade) from EMP join SALGRADE on sal between LOSAL and HISAL group by deptno;
4. select sal from EMP group by sal desc limit 1;
   - select sal from emp where sal not in(select distinct a.sal from emp a join emp b on a.sal < b.sal);
   - 解二看看就好，强行用自连接
5.  select deptno, avg(sal) from emp group by deptno order by avg(sal) desc limit 1;
   - select deptno from emp group by deptno having avg(sal) = (select max(asal) from (select deptno, avg(sal) asal from emp group by deptno) t);
   - 解二看看就行
6. select dname from dept where deptno = (select deptno from emp group by deptno order by avg(sal) desc limit 1);
   - select d.dname,avg(e.sal) as avgsal from emp e join dept d on e.deptno = d.deptno group by d.dname order by avgsal desc limit 1;
7.  select dname from dept d join emp e on d.deptno = e.deptno group by dname order by avg(sal) limit 1; 
   - create view temp as select deptno, t.asal, grade from salgrade sg join (select deptno, avg(sal) asal from emp group by deptno) t on t.asal between losal and hisal;
   - select dname,grade from dept d join temp t on d.deptno = t.deptno where grade=(select min(grade) from temp);
   - drop view temp;
      - 将具有**相同**最小值查出来
      - 时间复杂度较高
   - select grade from salgrade where (select avg(sal) as avgsal from emp group by deptno order by avgsal asc limit 1) between losal and hisal;
      - 稍微没我的快 explain
8. select ename, sal from EMP where sal < (select max(sal) from EMP where empno not in (select distinct mgr from EMP where mgr is not null)) and empno in (select distinct mgr from EMP where mgr is not null);
   - 稍微增加难度，寻找比最高工资小的领导（修改了表数据）
   - 题目答案：select ename, sal from EMP where sal > (select max(sal) from EMP where empno not in (select distinct mgr from EMP where mgr is not null)) and empno in (select distinct mgr from EMP where mgr is not null);
9. select ename,sal from EMP order by sal desc limit 5;
10. select ename,sal from EMP order by sal desc,ename limit 5,5;
11. select ename,hiredate from EMP order by hiredate desc,ename limit 5;
12. select grade,count(*) from EMP join SALGRADE on sal between losal and hisal group by grade;
13. select sname,sc.cno from S s join SC sc on s.sno=sc.sno where cno!=(select cno from C where cteacher='LM');
   1. 先建表
   2. select sname from S where sno not in (select distinct sno from SC sc join C c on sc.cno = (select cno from C where cteacher='LM'));  // 先找出学了LM的学生再排除掉
   3. select sname, avg(scgrade) from S s join SC sc on s.sno=sc.sno where s.sno in (select sno from SC where scgrade < 60 group by sno having count(scgrade) >=2) group by sname;  //先找到不及格的学生，再联合表查询这两个学生
   4. select distinct sname from S join SC on S.sno=SC.sno where S.sno in (select sno from SC where cno in (1,2) group by sno having count(sno)=2);
      1. 优化：select distinct sname from S join (select sno from SC where cno in (1,2) group by sno having count(sno)=2) t on S.sno=t.sno;
   5. 应该还有其他解法
14.  select a.ename, ifnull(b.ename, 'no leader') from emp a left join emp b on a.mgr=b.empno;
15.  select a.empno, a.ename,c.dname from emp a left join emp b on a.mgr=b.empno join dept c on a.deptno=c.deptno where a.hiredate < b.hiredate;  // 先员工再领导的主次关系
16.  select dname, e.* from dept d left join emp e on e.deptno=d.deptno order by d.deptno,empno;  // 先部门再员工的主次关系
17. select dname, count(*) from DEPT d join EMP e on d.deptno=e.deptno group by dname having count(*) > 4;
18. select * from EMP where sal > (select sal from EMP where ename='SMITH');
19. select ename, dname, cc from EMP e join DEPT d on e.deptno=d.deptno join (select deptno, count(deptno) cc from EMP group by deptno) t on t.deptno = e.deptno where job='CLERK';
20. select job,count(*) from EMP group by job having min(sal) > 1500;
21. select ename from EMP e join DEPT d on e.deptno=d.deptno where d.dname='SALES';
22. select a.ename, dname, grade, b.ename from EMP a join DEPT d on a.deptno=d.deptno join SALGRADE sg on a.sal between losal and hisal left join EMP b on a.mgr=b.empno where a.sal > (select avg(sal) from EMP);
23. select ename, dname from EMP e join DEPT d on e.deptno=d.deptno where job=(select job from EMP where ename='SCOTT') and ename!='SCOTT';
   1. 还有种麻烦的方法，不写了
24. select ename, sal from EMP where sal in (select distinct sal from EMP where deptno=30) and deptno<>30;
25. select ename, sal, dname from EMP e join DEPT d on e.deptno=d.deptno where sal > (select max(sal) from EMP where deptno=30);
26. select dname, count(ename) sum, ifnull(avg(sal),0) avg, ifnull(avg(**timestampdiff**(YEAR, hiredate, now())), 0) time from EMP e right join DEPT d on e.deptno=d.deptno group by dname;
   - TimeStampDiff(间隔类型, 前一个日期, 后一个日期)
   - timestampdiff(YEAR, hiredate, now())
   - 间隔类型：SECOND   秒，MINUTE   分钟，HOUR   小时，DAY   天，WEEK   星期，MONTH   月，QUARTER   季度，YEAR   年
27. select ename, dname, sal from EMP join DEPT on EMP.deptno = DEPT.deptno order by dname;
28. select d.*, count(e.deptno) from DEPT d left join EMP e on d.deptno=e.deptno group by d.deptno;
   1. group by并不是只能跟deptno
29. select * from EMP where sal in (select min(sal) from EMP group by job);
   1. join 会造成不必要的数据，where可以在单表中筛选
30. select deptno, min(sal) from (select distinct a.mgr, a.deptno, a.sal from EMP a join EMP b on a.empno=b.mgr) t group by deptno;
   1. select deptno, min(sal) from emp where job = 'MANAGER' group by deptno;   // 额
31. select ename, (sal + ifnull(comm,0)) * 12 income from EMP order by income;
32. select a.ename, b.ename, b.sal from EMP a join EMP b on a.mgr=b.empno where b.sal > 3000;
33. select dname, ifnull(sum(sal),0) sum, count(e.deptno) num from EMP e right join DEPT d on e.deptno=d.deptno where dname like 'S%' or dname like '%S%' or dname like '%S' group by d.deptno;
34. update EMP set sal=sal*1.1 where timestampdiff(year, hiredate, now()) > 30;
