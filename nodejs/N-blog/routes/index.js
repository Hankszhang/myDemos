var express = require('express');
var router = express.Router();
//crypto 是 Node.js 的一个核心模块，用它生成散列值来加密密码
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');
var multer = require('multer'); //引入multer，并设置上传的文件保存路径
var upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb){
            cb(null, './public/uploads') //注意此处路径的书写方式,最后没有斜杠
        },
        filename: function(req, file, cb){
            cb(null, file.originalname)
        }
    })
});

/* GET home page. */
router.get('/', function(req, res, next) {
    //判断是否是第一页， 并把请求的页数转换成number类型
    //通过req.query.p获取页数
    var page = req.query.p ? parseInt(req.query.p) : 1;
    //查询并返回第page页的10篇文章
    Post.getTen(null, page, function(err, posts, total){
        if(err){
            posts = [];
        }
        res.render('index', { 
            title: '主页',
            posts : posts,
            page: page,
            isFirstPage: (page-1) == 0,
            isLastPage: ((page-1)*10 + posts.length) == total,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res, next) {
    res.render('reg', {
        title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res, next) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    //检验用户两次输入的密码是否一致
    if (password_re != password){
        req.flash('error','两次输入的密码不一致！');
        return res.redirect('/reg'); //返回注册页
    }
    //生成密码的md5值
    var md5 = crypto.createHash('md5'),
    	password = md5.update(req.body.password).digest('hex'),
        newUser = new User({
        name: name,
        password: password,
        email: req.body.email
    });
    //检查用户名是否已经存在
    User.get(newUser.name, function(err, user){
        if(err){
            req.flash('error', err);
            return res.redirect('/');
        }
        if(user){
            req.flash('error', '用户已经存在!');
            return res.redirect('/reg');
        }
        //如果不存在则新增用户
        newUser.save(function(err, user){
            if(err){
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = user; //将新用户信息存入session
            req.flash('success', '注册成功!');
            res.redirect('/'); //注册成功后返回主页
        });
    });
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res, next) {
    res.render('login', {
        title: '登陆',
        user: req.session.user,
        success:req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res, next) {
    //生成密码的md5值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name, function(err, user){
        if(!user){
            req.flash('error', '用户不存在！');
            return res.redirect('/login');
        }
        //检查密码是否一致
        if(user.password != password){
            req.flash('error', '密码不一致！');
            return res.redirect('/login');
        }
        //验证通过，登陆成功,将用户信息存入session
        req.session.user = user;
        req.flash('success', '登陆成功！');
        res.redirect('/');
    });
});

router.get('/post', checkLogin);
router.get('/post', function(req, res, next) {
    res.render('post', {
        title: '发表',
        user: req.session.user,
        success:req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/post', checkLogin);
router.post('/post', function(req, res, next) {
    var currentUser = req.session.user,
        tags = [req.body.tag1, req.body.tag2, req.body.tag3],
            //获取文章信息，并保存到数据库
        post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post);
    post.save(function(err){
        if(err){
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发布成功！');
        res.redirect('/');
    });
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res, next) {
    req.session.user = null;
    req.flash('success', '登出成功！');
    res.redirect('/');
});

router.get('/upload', checkLogin);
router.get('/upload', function(req, res, next){
    res.render('upload', {
        title: '文件上传',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/upload', checkLogin);
router.post('/upload',upload.fields([
    {name: 'file1'},
    {name: 'file2'},
    {name: 'file3'}
]), function(req, res, next){
    for(var i in req.files){
        console.log(req.files[i]);
    }
    req.flash('success', '文件上传成功!');
    res.redirect('/upload');
});

router.get('/archive', function(req, res, next){
    Post.getArchive(function(err, posts){
        if(err){
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('archive', {
            title: '存档',
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.get('/tags', function(req, res, next){
    Post.getTags(function(err, posts){
        if(err){
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('tags', {
            title: '标签',
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.get('/tags/:tag', function(req, res, next){
    Post.getTag(req.params.tag, function(err, posts){
        if(err){
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('tag', {
            title: 'TAG:' + req.params.tag,
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.get('/search', function(req, res, next){
    Post.search(req.query.keyword, function(err, posts){
        if(err){
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('search', {
            title: 'SEARCH: ' + req.query.keyword,
            posts: posts,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.get('/links', function(req, res, next){
    res.render('links', {
        title: '友情链接',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.get('/u/:name', function(req, res, next){
    //检查用户是否存在
    User.get(req.params.name, function(err, user){
        if(!user){
            req.flash('error', '用户不存在！');
            return res.redirect('/');
        }
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回该用户的所有文章
        Post.getTen(user.name, page, function(err, posts, total){
            if(err){
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('user', {
                title: user.name,
                posts: posts,
                page: page,
                isFirstPage: (page-1) == 0,
                isLastPage: ((page-1)*10 + posts.length) == total,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
});

router.get('/p/:_id', function(req, res, next){
    Post.getOne(req.params._id, function(err, post) {
        if(err){
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('article', {
            title: post.title,
            post: post,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.get('/edit/:_id', checkLogin);
router.get('/edit/:_id', function(req, res, next){
    Post.edit(req.params._id, function(err, post) {
        if(err){
            req.flash('error', err);
            return res.redirect('back');
        }
        res.render('edit', {
            title: '编辑', 
            post: post,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.post('/edit/:_id', checkLogin);
router.post('/edit/:_id', function(req, res, next){
    Post.update(req.params._id, req.body.post, function(err){
        var url = encodeURI('/p/' + req.params._id);
        if(err){
            req.flash('error', err);
            return res.redirect(url);// 出错则返回文章页
        }
        req.flash('success', '修改成功！');
        res.redirect(url);// 成功返回文章页
    });
});

router.get('/remove/:_id', checkLogin);
router.get('/remove/:_id', function(req, res, next){
    Post.remove(req.params._id, function(err){
        if(err){
            req.flash('error', err);
            return res.redirect('back');// 出错则返回
        }
        req.flash('success', '删除成功！');
        res.redirect('/');// 成功返回首页
    });
});

router.get('/reprint/:_id', checkLogin);
router.get('/reprint/:_id', function(req, res, next){
    Post.edit(req.params._id, function(err, post){
        if(err){
            req.flash('error', err);
            return res.redirect(back);
        }
        var currentUser = req.session.user,
            reprint_from = {
                _id: post._id,
                name: post.name
            },
            reprint_to = {
                name: currentUser.name,
                head: currentUser.head
            };
        Post.reprint(reprint_from, reprint_to, function(err, post){
            if(err){
                req.flash('error', err);
                return res.redirect('back');// 出错则返回
            }
            req.flash('success', '转载成功！');
            var url = encodeURI('/p/' + post._id);
            res.redirect(url); 
        });
    });
});

router.post('/p/:_id', function(req, res, next){
    var date = new Date(),
        time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48"; 
    var comment = {
        name: req.body.name,
        head: head,
        email: req.body.email,
        website: req.body.website,
        time: time,
        content: req.body.content
    };
    var newComment = new Comment(req.params._id, comment);
    newComment.save(function (err) {
        if (err) {
            req.flash('error', err); 
            return res.redirect('back');
        }
        req.flash('success', '留言成功!');
        res.redirect('back');
    });
});

// Control the permession of webs.
function checkLogin(req, res, next){
    if(!req.session.user){
        req.flash('error', '未登录！');
        return res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next){
    if(req.session.user){
        req.flash('error', '已登录！');
        return res.redirect('back');
    }
    next();
}

module.exports = router;
