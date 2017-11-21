var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Dad = /** @class */ (function () {
    function Dad() {
    }
    return Dad;
}());
var Son = /** @class */ (function (_super) {
    __extends(Son, _super);
    function Son() {
        return _super.call(this) || this;
    }
    return Son;
}(Dad));
var d = new Dad();
d.house = 'Xuhui';
d.car = 'Jeep';
var s = new Son();
s.house = 'Minhang';
s.car = 'BMW';
function createClock(ctor, hour, minute) {
    return new ctor(hour, minute);
}
var DigitalClock = /** @class */ (function () {
    function DigitalClock(h, m) {
    }
    DigitalClock.prototype.tick = function () {
        console.log("beep beep");
    };
    return DigitalClock;
}());
var AnalogClock = /** @class */ (function () {
    function AnalogClock(h, m) {
    }
    AnalogClock.prototype.tick = function () {
        console.log("tick tock");
    };
    return AnalogClock;
}());
var digital = createClock(DigitalClock, 12, 17);
digital.tick();
var analog = createClock(AnalogClock, 7, 32);
analog.tick();
