// enum 

enum Choice {Wife = 1, Mother};

function question(choice: Choice) : void {
    console.log('Save your wife or your mother?');
    console.log('Your choice: ' + choice);
}

question(Choice.Mother);

class Person {
    name: string; // 名字
    age: number; // 年龄
    labels: Array<string>; // 标签组
    wives: string[]; // 妻子们
    contact: [string, number]; // 元组 联系[联系地址，联系电话]
    other: any; // 备注
    saveMother: boolean = true; // 是否救落水的妈妈
    constructor() { }
    answer(): Choice {
        if (this.saveMother === false) {
            return Choice.Wife;
        }
        return Choice.Mother;
    }
    hello(): void {
        console.log('hello~ i\'m ' + this.name);
        // return undefined;
        // return null;
    }
    empty() { }
    down(): never {
        while (true) { }
        // throw new Error('error')
    }
}

let zhangsan = new Person();

zhangsan.name = "张三";
zhangsan.age = 28;
zhangsan.labels = ["颜值逆天", "年轻多金"];
zhangsan.wives = ["一号", "二号", "三号"];
zhangsan.contact = ["北京xxxxxxx别墅", 2];
zhangsan.saveMother = false;
zhangsan.other = '不好不坏的人';

let len = (<string>zhangsan.other).length;

console.log(len);
question(zhangsan.answer());

zhangsan.hello();

console.log(zhangsan.empty());

// 变量解构

let [a, b, c] = [2, 8, 16]
console.log(a, b, c);

let [Alex, ...X] = [5, 7, 12, 18];
console.log(Alex);
console.log(X);
