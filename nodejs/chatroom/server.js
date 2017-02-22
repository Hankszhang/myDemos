/**
 * Created by Hanks on 2016/1/8.
 */
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

// 请求文件不存在时处理404错误
function send404(response){
    response.writeHead(404, {'Content-Type':'text/plain'});
    response.write('Error 404: response not found');
    response.end();
}

// 提供文件数据服务
function sendFile(response, filePath, fileContents){
    response.writeHead(
        200,
        {'Content-Type': mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

// 检查文件是否缓存了，是则返回，不是则从硬盘读取并返回
// 因为访问内存比访问文件系统快得多
function serverStatic(response, cache, absPath){
    if(cache[absPath]){     //检查文件是否在缓存中
        sendFile(response, absPath, cache[absPath]);
    }else{
        fs.exists(absPath, function (exists) {      //检查文件是否存在
            if(exists){
                // 从硬盘读取文件并返回
                fs.readFile(absPath, function (err, data) {
                    if(err) {
                        send404(response);
                    }else{
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            }else{
                send404(response);
            }
        });
    }
}

// 创建HTTP服务器
var server = http.createServer(function(request, response){
    var filePath = false;
    if(request.url == '/'){
        filePath = 'public/index.html';
    }else{
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serverStatic(response, cache, absPath);
});

// 启动HTTP服务器
server.listen(3000, function() {
    console.log("Server listening on port 3000.");
});

//加载自定义的chat server模块,并搭载到HTTP服务器上
var chatServer = require('./lib/chat_server');
chatServer.listen(server);