class Dad {
    name? : string;
    protected familyName; // 姓氏
    private personalMoney; // 私房钱
    public house;
    car;
    constructor() { }
}

class Son extends Dad {
    constructor() {
        super()
    }
}

let d = new Dad()
d.house = 'Xuhui';
d.car = 'Jeep';

let s = new Son()
s.house = 'Minhang';
s.car = 'BMW';

// 实例化类的接口定义

// 定义类的构造函数的接口规范
interface ClockConstructor {
    new(hour: number, minute: number): ClockInterface;
}
// 定义类的接口规范
interface ClockInterface {
    tick();
}

function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
    return new ctor(hour, minute);
}

class DigitalClock implements ClockInterface {
    constructor(h: number, m: number) { }
    tick() {
        console.log("beep beep");
    }
}
class AnalogClock implements ClockInterface {
    constructor(h: number, m: number) { }
    tick() {
        console.log("tick tock");
    }
}

let digital = createClock(DigitalClock, 12, 17);
digital.tick();
let analog = createClock(AnalogClock, 7, 32);
analog.tick();