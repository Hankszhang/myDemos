var Db = require('./db');
var crypto = require('crypto');
var markdown = require('markdown').markdown;
var ObjectID = require('mongodb').ObjectID;
var poolModule = require('generic-pool');
var pool = poolModule.Pool({
    name     : 'mongoPool',
    create   : function(callback) {
        var mongodb = Db();
        mongodb.open(function (err, db) {
            callback(err, db);
        })
    },
    destroy  : function(mongodb) {
        mongodb.close();
    },
    max      : 100,
    min      : 5,
    idleTimeoutMillis : 30000,
});

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};

module.exports = User;

//通过 User.prototype.save 实现了用户信息的存储，通过 User.get 实现了用户信息的读取

//存储用户信息,save函数是定义在原型上的函数，通过实例调用
User.prototype.save = function(callback) {
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
        //要存入数据库的用户文档
    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        head: head
    };
    //打开数据库
    pool.acquire(function (err, mongodb) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        mongodb.collection('users', function (err, collection) {
            if (err) {
                pool.release(mongodb);
                return callback(err);//错误，返回 err 信息
            }
            //将用户数据插入 users 集合
            collection.insert(user, {
                safe: true,
            }, function (err, item) {
                pool.release(mongodb);
                if (err) {
                    return callback(err);//错误，返回 err 信息
                }
                callback(null, item.ops[0]);
            });
        });
    });
};

//读取用户信息
User.get = function(name, callback) {
    //打开数据库
    pool.acquire(function (err, mongodb) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        mongodb.collection('users', function (err, collection) {
            if (err) {
                pool.release(mongodb);
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, user) {
                pool.release(mongodb);
                if (err) {
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, user);//成功！返回查询的用户信息
            });
        });
    });
};

