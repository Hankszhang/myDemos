"use strict";
exports.__esModule = true;
var Baby = /** @class */ (function () {
    function Baby(name) {
        this.name = name;
        console.log('baby is crying, wawawawwa~~~~~~~~~');
    }
    Baby.smile = function () {
        console.log('O(∩_∩)O！');
    };
    Baby.prototype.getBabyName = function () {
        return this.name;
    };
    return Baby;
}());
exports.Baby = Baby;
exports.baby = new Baby('Eleven');
