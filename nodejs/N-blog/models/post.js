var Db = require('./db');
// var markdown = require('markdown').markdown;
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

function Post(name, head, title, tags, post){
    this.name = name;
    this.head = head;
    this.title = title;
    this.tags = tags;
    this.post = post;
};

module.exports = Post;

//存储一篇文章及相关信息
Post.prototype.save = function(callback){
    var date = new Date();
    //保存各种时间格式，以便以后扩展
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear()+"-"+(date.getMonth()+1),
        day: date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),
        minute: date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+ date.getHours()+"："+(date.getMinutes()<10 ? '0'+date.getMinutes() : date.getMinutes())
    };
    //保存要存入数据库的文章的文档
    var post = {
        name : this.name,
        head: this.head,
        title : this.title,
        tags: this.tags,
        post : this.post,
        time : time,
        comments: [],
        reprint_info: {}, //保存文章的转载信息，形式为：
                          //{
                          //    reprint_from: {},  表示转载来的原文章的信息
                          //    reprint_to:[]      表示该文章被转载的信息
                          //}  对于每一篇文章，这两者不是必须的
        pv: 0
    }
    //打开数据库
    pool.acquire(function(err,mongodb){
        if(err){
            return callback(err);
        }
        //读取posts集合
        mongodb.collection('posts', function(err, collection){
            if(err){
                pool.release(mongodb);
                return callback(err);
            }
            //将文档插入posts集合
            collection.insert(post,{
                safe:true
            }, function(err){
                pool.release(mongodb);
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

//从数据库中读取文章信息
Post.getTen = function(name, page, callback){
    //打开数据库
    pool.acquire(function(err,mongodb){
        if(err){
            return callback(err);
        }
        //读取posts集合
        mongodb.collection('posts', function(err, collection){
            if(err){
                pool.release(mongodb);
                return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
			//使用count返回特定查询的文档数total
			collection.count(query, function(err, total){
				//根据query对象查询文章,并跳过前(page-1)*10个结果，返回之后的10个结果
				collection.find(query, {
					skip: (page-1)*10,
					limit: 10
				}).sort({
					time:-1
				}).toArray(function(err, docs){
					pool.release(mongodb);
					if(err){
						return callback(err);
					}
					//解析markdown为html
					//docs.forEach(function(doc){
					//	doc.post = markdown.toHTML(doc.post);
					//});
					callback(null, docs, total);
				});
			});
        });
    });
};

Post.getOne = function(_id, callback){
	pool.acquire(function(err, mongodb){
		if(err) {
			return callback(err);
		}
		mongodb.collection('posts', function(err, collection){
			if(err){
				pool.release(mongodb);
				return callback(err);
			}
			//根据_id进行查询
			collection.findOne({
                "_id": new ObjectID(_id)
			}, function(err, doc){
				if(err){
                    pool.release(mongodb);
					return callback(err);
				}
                if(doc){
                    //每访问一次，pv 值加1
                    collection.update({
                        "_id": new ObjectID(_id)
                    }, {
                        $inc: {"pv": 1}
                    }, function(err){
                        pool.release(mongodb);
                        if(err){
                            return callback(err);
                        }
                    });
                    //doc.post = markdown.toHTML(doc.post);
                    //doc.comments.forEach(function(comment){
                    //    comment.content = markdown.toHTML(comment.content);
                    //});
                    callback(null, doc);
                }
			});
		});
	});
};

Post.edit = function(_id, callback){
	pool.acquire(function(err, mongodb){
		if(err) {
			return callback(err);
		}
		mongodb.collection('posts', function(err, collection){
			if(err){
				pool.release(mongodb);
				return callback(err);
			}
			//根据_id进行查询
			collection.findOne({
                "_id": new ObjectID(_id)
			}, function(err, doc){
				pool.release(mongodb);
				if(err){
					return callback(err);
				}
				callback(null, doc);
			});
		});
	});
};

Post.update = function(_id, post, callback){
	pool.acquire(function(err, mongodb){
		if(err) {
			return callback(err);
		}
		mongodb.collection('posts', function(err, collection){
			if(err){
				pool.release(mongodb);
				return callback(err);
			}
			//更新文章内容
			collection.update({
                "_id": new ObjectID(_id)
			}, {
                $set: {post: post}
            }, function(err){
				pool.release(mongodb);
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

Post.remove = function(_id, callback){
	pool.acquire(function(err, mongodb){
		if(err) {
			return callback(err);
		}
		mongodb.collection('posts', function(err, collection){
			if(err){
				pool.release(mongodb);
				return callback(err);
			}
			//根据_id查找要被删除的文章
			collection.findOne({
                "_id": new ObjectID(_id)
			}, function(err, doc){
				if(err){
                    pool.release(mongodb);
					return callback(err);
				}
                //如果该文章时转载来的，先保存下来reprint_from
                var reprint_from = "";
                if(doc.reprint_info.reprint_from){
                    reprint_from = doc.reprint_info.reprint_from;
                }
                if(reprint_from != ""){
                    //更新原文章所在文档的reprint_to
                    collection.update({
                        "_id":new ObjectID(reprint_from._id)
                    }, { //用$pull来删除数组中的特定项
                        $pull: {
                            "reprint_info.reprint_to": {
                                "_id": new ObjectID(_id)
                            }
                        }
                    }, function(err){
                        if(err){
                            pool.release(mongodb);
                            return callback(err);
                        }
                    });
                }
                //删除转载来的文章所在文档
                collection.remove({
                    "_id": new ObjectID(_id)
                }, {
                    w: 1
                }, function (err) {
                    pool.release(mongodb);
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
			});
		});
	});
};

Post.getArchive = function(callback){
	pool.acquire(function(err, mongodb){
		if(err) {
			return callback(err);
		}
		mongodb.collection('posts', function(err, collection){
			if(err){
				pool.release(mongodb);
				return callback(err);
			}
			//返回只包含name,time，title属性的文档组成的存档数组
			collection.find({}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function(err, docs){
				pool.release(mongodb);
				if(err){
					return callback(err);
				}
                callback(null, docs);
			});
		});
	});
};

//返回所有标签
Post.getTags = function(callback){
	pool.acquire(function(err, mongodb){
		if(err) {
			return callback(err);
		}
		mongodb.collection('posts', function(err, collection){
			if(err){
				pool.release(mongodb);
				return callback(err);
			}
            //distinct用来找出给定键的所有不同值
			collection.distinct("tags", function(err, docs){
				pool.release(mongodb);
				if(err){
					return callback(err);
				}
                callback(null, docs);
			});
		});
	});
};

//返回含有特定标签的所有文章
Post.getTag = function(tag, callback){
	pool.acquire(function(err, mongodb){
		if(err) {
			return callback(err);
		}
		mongodb.collection('posts', function(err, collection){
			if(err){
				pool.release(mongodb);
				return callback(err);
			}
			//查询所有tags数组内包含tag的文档
            //并返回只含有name，time，title属性的文档组成的文档数组
			collection.find({
                "tags": tag
            }, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function(err, docs){
				pool.release(mongodb);
				if(err){
					return callback(err);
				}
                callback(null, docs);
			});
		});
	});
};

//通过标题关键字查询所有文章的信息
Post.search = function(keyword, callback){
    pool.acquire(function(err, mongodb){
        if(err){
            return callback(err);
        }
        mongodb.collection('posts', function(err, collection){
            if(err){
                pool.release(mongodb);
                return callback(err);
            }
            var pattern = new RegExp(keyword, "i"); //创建RegExp对象，并对大小写不敏感
            collection.find({
                "title": pattern
            }, {
                "name": 1,
                "time": 1,
                "title":1
            }).sort({
                time: -1
            }).toArray(function(err, docs){
                pool.release(mongodb);
                if(err){
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

Post.reprint = function(reprint_from, reprint_to, callback){
    pool.acquire(function(err, mongodb){
        if(err){
            return callback(err);
        }
        mongodb.collection('posts', function(err, collection){
            if(err){
                pool.release(mongodb);
                return callback(err);
            }
            //找到被转载的文章的原文档
            collection.findOne({
                "_id": new ObjectID(reprint_from._id)
            }, function(err, doc){
                if(err){
                    pool.release(mongodb);
                    return callback(err);
                }
                
                var date = new Date();
                var time = {
                    date: date,
                    year : date.getFullYear(),
                    month : date.getFullYear() + "-" + (date.getMonth() + 1),
                    day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                    minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
                }
                delete doc._id; //删除原文档的id

                doc._id = new ObjectID();
                doc.name = reprint_to.name;
                doc.head = reprint_to.head;
                doc.time = time;
                doc.title = (doc.title.search(/[转载]/) > -1) ? doc.title : "[转载]" + doc.title;
                doc.comments = [];
                doc.reprint_info = {"reprint_from": reprint_from};
                doc.pv = 0;

                //更新被转载的原文档的reprint_info内的repint_to信息
                collection.update({
                    "_id": new ObjectID(reprint_from._id)
                }, {
                    $push: {
                        "reprint_info.reprint_to": {
                            "_id": doc._id,
                            "name": doc.name
                        }
                    }
                }, function(err){
                    if(err){
                        pool.release(mongodb);
                        return callback(err);
                    }
                });

                //将转载生成的副本修改后存入数据库，并返回存储后的文档
                //注意这里回调函数嵌套的传参问题：最后的返回值参数名:doc必须与insert的参数doc一致
                collection.insert(doc, {
                    safe: true
                }, function(err, post){
					pool.release(mongodb);
                    if(err){
                        return callback(err);
                    }
					callback(null, post.ops[0]);
                });
            });
        });
    });
};
