var MySQL = /** @class */ (function () {
    function MySQL(host, port) {
        this.host = host;
        this.port = port;
        console.log('Connecting to ' + this.host + ':' + this.port + '......');
    }
    return MySQL;
}());
var mySql = new MySQL('localhost', 8965);
var person = { idCard: '360311xxxxxxxxxxx4444' };
function getPerson(p) {
    console.log(p);
}
getPerson({ idCard: '3243445567566', address: 'xuhui' });
var mySearch = function (src, sub) {
    var result = src.search(sub);
    return result > -1;
};
