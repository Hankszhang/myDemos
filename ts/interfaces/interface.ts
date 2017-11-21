interface Db {
    host: string;
    port: number;
}

class MySQL implements Db {
    host: string;
    port: number;

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port;
        console.log('Connecting to ' + this.host + ':' + this.port + '......');
    }
}

let mySql = new MySQL('localhost', 8965);

// 可以添加s属性的interface

interface Person {
    readonly idCard: string;
    name?: string;
    [propName: string]: any;
}

let person: Person = {idCard: '360311xxxxxxxxxxx4444'};

function getPerson (p: Person) {
    console.log(p);
}

getPerson({idCard: '3243445567566', address: 'xuhui'});

// function 类型接口

interface SearchFunc {
    (source: string, subString: string): boolean;
}
let mySearch: SearchFunc = function (src: string, sub: string) {
    let result = src.search(sub);
    return result > -1;
}