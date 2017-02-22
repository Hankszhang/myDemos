var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//设置router的路径
var routes = require('./routes/index');
var users = require('./routes/users');
// settings for mongoldb
var settings = require('./settings');
// 引入 flash 模块来实现页面通知（即成功与错误信息的显示）的功能。
var flash = require('connect-flash'); 

var session = require('express-session');
var MongoStore =require('connect-mongo')(session);
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: "a"});
var errorLog = fs.createWriteStream('error.log', {flags: "a"});

//通过express创建一个app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(logger({stream: accessLog}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//自定义记录错误日志的中间件
app.use(function(err, req, res, next) {
    var meta = '[' + new Date() + ']' + req.url +'\n';
    errorLog.write(meta + err.stack + '\n');
    next();
});

// 使用 express-session 和 connect-mongo 模块实现了将会化信息存储到mongoldb中
// session的机制是什么？ --操作cookies
app.use(session({
    secret: settings.cookieSecret, //防止篡改cookie
    key: settings.db, //cookie name
    cookie: {maxAge: 1000*60*60*24*30}, // 30 days
    store: new MongoStore({
        db: settings.db,
        host: settings.host,
        port: settings.port
    })
}));

// falsh 必须放在session后面，但是必须在routes之前
app.use(flash());

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
