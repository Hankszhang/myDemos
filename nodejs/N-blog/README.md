# blog
This is a instance for learning Node.js
Node.js + Express + mongodb = Multi-people-blog

搭建多人博客

## 安装部署
1. 安装nodejs和 mongodb
2. 安装express框架： npm install -g express
3. 安装依赖包： npm install
4. 运行: node ./bin/www
5. 浏览器访问： localhost:3000

##功能分析

搭建一个简单的具有多人注册、登录登出、发表文章、转载、评论等功能的博客。

##设计目标

1. 未登录：主页左侧导航显示 home、login、register，右侧显示已发表的文章、发表日期及作者。

2. 登陆后：主页左侧导航显示 home、post、logout，右侧显示已发表的文章、发表日期及作者。

3. 用户登录、注册、发表成功以及登出后都返回到主页。

##实现方法
1. 路由规划：

	/ ：首页
	/login ：用户登录
	/reg ：用户注册
	/post ：发表文章
	/logout ：登出

2. 引入会话（session）机制记录用户登录状态，还要访问数据库来保存和读取用户信息

3. 设置页面权限：注册和登录页面阻止已登录的用户访问，登出及发表页只对已登录的用户开放。在每个路径前增加“用户登录状态检测”的路由中间件来实现此功能。

4. 创建文章模型Post，拥有于User相似的接口：Post.get和	Post.prototype.save，分别用来获取文章和保存文章到数据库。

5. **使用Markdown**
添加markdown模块来使博客添加支持markdown发表文章的功能。

6. 文件上传功能
通过第三方中间件multer实现文件上传功能，使得可以用markdown来链接图片。

7. 添加用户页面和文章页面
用户页面就是当点击某个用户名链接时，跳转到：域名/u/用户名 ，并列出该用户的所有文章。 同理，文章页面就是当点击某篇文章标题时，跳转到：域名/u/用户名/时间/文章名 ，进入到该文章的页面（也许还有该文章的评论等）。

8.  增加编辑与删除功能
用户在线时，只允许他在自己发表的文章页进行编辑活删除；编辑时，只能编辑文章内容，不能编辑标题。

9. 实现留言功能
只有在文章页才能显示留言

10. 实现分页功能
用mongodb的skip和limit操作实现主页和用户页面每页最多显示十篇文章。

11. 增加存档页面
进入存档页后，按年份和日期降序列出所有的文章。

12. 增加标签和标签页面
每篇文章最多有三个标签（少于三个也可以），当点击主页左侧标签页链接时，跳转到标签页并列出所有已存在标签；当点击任意一个标签链接时，跳转到该标签页并列出所有含有该标签的文章。

13. 增加pv统计和留言统计
在主页、用户页和文章页均显示 pv 统计和留言统计
	- posts增加pv键，每调用getOne函数一次，pv值加一。
	- 留言统计就简单多了，直接取 comments.length 即可

14. 增加文章检索功能
根据关键字模糊查询文章标题(不区分大小写)。

15. 增加友情链接和头像
头像使用www.gravatar.com的头像

16. 增加转载功能和转载统计
当在线用户满足特定条件时，文章页面才会显示 转载 链接字样，当用户点击 转载 后，复制一份存储当前文章的文档，修改后以新文档的形式存入数据库，而不是单纯的添加一条指向被转载的文档的 "引用" ，这种设计是合理的，因为这样我们也可以将转载来的文章进行修改。

##增强实现
1. 使用mongodb的_id来查询数据库的数据
2. 使用数据库连接池
- 一开始就创建一沓数据库连接，并保持长连不断开。当我们需要访问数据库的时候，就去那一沓连接（俗称连接池）中拿来一个用，用完（对数据库增删改查完）后再把这条连接释放到连接池中（依然不断开）。这样我们只在一开始创建一沓数据库连接时会有一些开销，而这种开销总比频繁的创建和销毁连接小得多。
- 使用generic-pool模块来创建和管理数据库连接池

3. 使用 KindEditor
KindEditor 是一套开源的在线 HTML 编辑器，主要用于让用户在网站上获得所见即所得编辑效果，开发人员可以用 KindEditor 把传统的多行文本输入框（textarea）替换为可视化的富文本输入框。