// 命名函数
function add(x: number, y: number): number {
    return x + y;
}
// 匿名函数
let myAdd = function (x: number, y: number): number { return x + y; };

let myAdd2: (x: number, y: number) => number =
    function (x: number, y: number): number { return x + y; };

let myAdd3: (x: number, y: number) => number = function (x, y): number { return x + y; };