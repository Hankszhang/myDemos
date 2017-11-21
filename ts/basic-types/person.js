// enum 
var Choice;
(function (Choice) {
    Choice[Choice["Wife"] = 1] = "Wife";
    Choice[Choice["Mother"] = 2] = "Mother";
})(Choice || (Choice = {}));
;
function question(choice) {
    console.log('Save your wife or your mother?');
    console.log('Your choice: ' + choice);
}
question(Choice.Mother);
var Person = /** @class */ (function () {
    function Person() {
        this.saveMother = true; // 是否救落水的妈妈
    }
    Person.prototype.answer = function () {
        if (this.saveMother === false) {
            return Choice.Wife;
        }
        return Choice.Mother;
    };
    Person.prototype.hello = function () {
        console.log('hello~ i\'m ' + this.name);
        // return undefined;
        // return null;
    };
    Person.prototype.empty = function () { };
    Person.prototype.down = function () {
        while (true) { }
        // throw new Error('error')
    };
    return Person;
}());
var zhangsan = new Person();
zhangsan.name = "张三";
zhangsan.age = 28;
zhangsan.labels = ["颜值逆天", "年轻多金"];
zhangsan.wives = ["一号", "二号", "三号"];
zhangsan.contact = ["北京xxxxxxx别墅", 2];
zhangsan.saveMother = false;
zhangsan.other = '不好不坏的人';
var len = zhangsan.other.length;
console.log(len);
question(zhangsan.answer());
zhangsan.hello();
console.log(zhangsan.empty());
// 变量解构
var _a = [2, 8, 16], a = _a[0], b = _a[1], c = _a[2];
console.log(a, b, c);
var _b = [5, 7, 12, 18], Alex = _b[0], X = _b.slice(1);
console.log(Alex);
console.log(X);
