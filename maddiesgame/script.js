class Point { constructor(x_, y_){this.x = x_; this.y = y_;} }
class Triangle {
    constructor(center_, length_){
        this.points = [];
        this.center = center_;
        this.length = length_;
        this.recalc();
    }
    recalc(){
        this.points = [];
        this.points.push(new Point(this.center.x, this.center.y + this.length));
        this.points.push(new Point(this.center.x - this.length, this.center.y - this.length));
        this.points.push(new Point(this.center.x + this.length, this.center.y - this.length));
    }
    draw(){
        let path = new Path2D();
        path.moveTo(this.points[0].x, this.points[0].y);
        for(let k = 0; k < this.points.length; k++){
            path.lineTo(this.points[k].x, this.points[k].y);
        }
        path.lineTo(this.points[0].x, this.points[0].y);
        return path;
    }
}
class Square {
    constructor(center_, length_){
        this.points = [];
        this.center = center_;
        this.length = length_;
        this.recalc();
    }
    recalc(){
        this.points = [];
        this.points.push(new Point(this.center.x - this.length, this.center.y - this.length));
        this.points.push(new Point(this.center.x + this.length, this.center.y - this.length));
        this.points.push(new Point(this.center.x + this.length, this.center.y + this.length));
        this.points.push(new Point(this.center.x - this.length, this.center.y + this.length));
    }
    draw(){
        let path = new Path2D();
        path.moveTo(this.points[0].x, this.points[0].y);
        for(let k = 0; k < this.points.length; k++){
            path.lineTo(this.points[k].x, this.points[k].y);
        }
        path.lineTo(this.points[0].x, this.points[0].y);
        return path;
    }
}
class Circle {
    constructor(center_, radius_){
        this.center = center_;
        this.radius = radius_;
        this.recalc();
    }
    recalc(){}
    draw(){
        let path = new Path2D();
        path.moveTo(this.center.x + this.radius, this.center.y);
        path.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true);
        return path;
    }
}
class Rhombus {
    constructor(center_, length_){
        this.center = center_;
        this.length = length_;
        this.points = [];
        this.recalc();
    }
    recalc(){
        this.points = [];
        this.points.push(new Point(this.center.x, this.center.y - this.length));
        this.points.push(new Point(this.center.x + this.length / 1.5, this.center.y));
        this.points.push(new Point(this.center.x, this.center.y + this.length));
        this.points.push(new Point(this.center.x - this.length / 1.5, this.center.y));
    }
    draw(){
        let path = new Path2D();
        path.moveTo(this.points[0].x, this.points[0].y);
        for(let k = 0; k < this.points.length; k++){
            path.lineTo(this.points[k].x, this.points[k].y);
        }
        path.lineTo(this.points[0].x, this.points[0].y);
        return path;
    }
}
class Pentagon {
    constructor(center_, length_){
        this.points = [];
        this.center = center_;
        this.length = length_;
        this.recalc();
    }
    recalc(){
        this.points = [];
        this.points.push(new Point(this.center.x, this.center.y - this.length));
        this.points.push(new Point(this.center.x + this.length * Math.cos(18 * Math.PI / 180), this.center.y - this.length * Math.sin(18 * Math.PI / 180)));
        this.points.push(new Point(this.center.x + this.length * Math.cos(-54 * Math.PI / 180), this.center.y - this.length * Math.sin(-54 * Math.PI / 180)));
        this.points.push(new Point(this.center.x - this.length * Math.cos(-54 * Math.PI / 180), this.center.y - this.length * Math.sin(-54 * Math.PI / 180)));
        this.points.push(new Point(this.center.x - this.length * Math.cos(18 * Math.PI / 180), this.center.y - this.length * Math.sin(18 * Math.PI / 180)));
    }
    draw(){
        let path = new Path2D();
        path.moveTo(this.points[0].x, this.points[0].y);
        for(let k = 0; k < this.points.length; k++){
            path.lineTo(this.points[k].x, this.points[k].y);
        }
        path.lineTo(this.points[0].x, this.points[0].y);
        return path;
    }
}
class Hexagon {
    constructor(center_, length_){
        this.points = [];
        this.center = center_;
        this.length = length_;
        this.recalc();
    }
    recalc(){
        this.points = [];
        let frac = 1 - (1 / 6);
        this.points.push(new Point(this.center.x - this.length, this.center.y));
        this.points.push(new Point(this.center.x - this.length / 2, this.center.y - this.length * frac)) ;
        this.points.push(new Point(this.center.x + this.length / 2, this.center.y - this.length * frac)) ;
        this.points.push(new Point(this.center.x + this.length, this.center.y));
        this.points.push(new Point(this.center.x + this.length / 2, this.center.y + this.length * frac)) ;
        this.points.push(new Point(this.center.x - this.length / 2, this.center.y + this.length * frac)) ;
    }
    draw(){
        let path = new Path2D();
        path.moveTo(this.points[0].x, this.points[0].y);
        for(let k = 0; k < this.points.length; k++){
            path.lineTo(this.points[k].x, this.points[k].y);
        }
        path.lineTo(this.points[0].x, this.points[0].y);
        return path;
    }
}
const bgdefault = getComputedStyle(document.body).getPropertyValue("--bg-default");
const fgdefault = getComputedStyle(document.body).getPropertyValue("--fg-default");
const canvas = document.getElementById("canvas");
const container = document.getElementById("sorting-container");
const ctx = canvas.getContext("2d");
let oldsize = new Point(container.clientWidth, container.clientHeight);
let outlines = [];
let shapes = [];
let levelNumber = 1;
let mousePosition = new Point(0, 0);
let grabbedShape = null;
const remap = (val, inMin, inMax, outMin, outMax) => outMin + (val - inMin) * (outMax - outMin) / (inMax - inMin);
const getRandomInt = (min, max) => {return Math.floor(Math.random() * (max - min) + min);}
const resize = () => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    align(new Point(container.clientWidth, container.clientHeight));
    oldsize = new Point(container.clientWidth, container.clientHeight);
}
const until = (condition) => {
    const poll = resolve => condition() ? resolve() : setTimeout(_ => poll(resolve), 16);
    return new Promise(poll);
}
const align = (newsize) => {
    let divx = canvas.width / ((outlines.length / 2) + 1)
    let divy = canvas.height / Math.floor(outlines.length / 2);
    for(let i = 0; i < outlines.length; i++){
        outlines[i].center.x = divx * ((i % 3) + 1);
        outlines[i].center.y = divy * ((i % 2) + 1);
        outlines[i].length === undefined ? outlines[i].radius = divx / (outlines.length) : outlines[i].length = divx / outlines.length;
        outlines[i].recalc();
    }
    for(let i = 0; i < shapes.length; i++){
        shapes[i].center.x = remap(shapes[i].center.x, 0, oldsize.x, 0, newsize.x);
        shapes[i].center.y = remap(shapes[i].center.y, 0, oldsize.y, 0, newsize.y);
        shapes[i].length === undefined ? shapes[i].radius = divx / (shapes.length) : shapes[i].length = divx / shapes.length;
        shapes[i].recalc();
    }
}

const generateLevel = () => {
    outlines = [];
    shapes = [];
    let sc = 0, tc = 0, cc = 0, rc = 0, hc = 0, pc = 0;
    while(outlines.length < 6){
        let rand = getRandomInt(0, 6);
        if(rand === 0 && tc < 1){
            outlines.push(new Triangle(new Point(canvas.width / 2, canvas.height / 2), 50))
            shapes.push(new Triangle(new Point(getRandomInt(50, canvas.width - 50), getRandomInt(50, canvas.height - 50)), 50));
            tc++;
        } else if(rand === 1 && sc < 1){
            outlines.push(new Square(new Point(canvas.width / 2, canvas.height / 2), 50))
            shapes.push(new Square(new Point(getRandomInt(50, canvas.width - 50), getRandomInt(50, canvas.height - 50)), 50));
            sc++;
        } else if (rand === 3 && cc < 1){
            outlines.push(new Circle(new Point(canvas.width / 2, canvas.height / 2), 50))
            shapes.push(new Circle(new Point(getRandomInt(50, canvas.width - 50), getRandomInt(50, canvas.height - 50)), 50));
            cc++;
        } else if(rand === 4 && rc < 1){
            outlines.push(new Rhombus(new Point(canvas.width / 2, canvas.height / 2), 50));
            shapes.push(new Rhombus(new Point(getRandomInt(50, canvas.width - 50), getRandomInt(50, canvas.height - 50)), 50));
            rc++;
        } else if(rand === 5 && hc < 1){
            outlines.push(new Hexagon(new Point(canvas.width / 2, canvas.height / 2), 50));
            shapes.push(new Hexagon(new Point(getRandomInt(50, canvas.width - 50), getRandomInt(50, canvas.height - 50)), 50));
            hc++;
        } else if(pc < 1){
            outlines.push(new Pentagon(new Point(canvas.width / 2, canvas.height / 2), 50));
            shapes.push(new Pentagon(new Point(getRandomInt(50, canvas.width - 50), getRandomInt(50, canvas.height - 50)), 50));
            pc++;
        }
        align(new Point(container.clientWidth, container.clientHeight));
        outlines[outlines.length - 1].recalc();
        shapes[shapes.length - 1].recalc();
    }
}

let celebrating = false;


const calcScore = async () => {
    if(celebrating) return;
    let score = 0;
    for(let i = 0; i < shapes.length; i++){
        if(shapes[i].center.x === outlines[i].center.x && shapes[i].center.y === outlines[i].center.y){
            score++;
        }
    }
    if(score === 6){
        celebrating = true;
        await new Promise((r) => setTimeout(r, 1000));
        levelNumber++;
        generateLevel();
        celebrating = false;
    }
}
const shapeContains = (p, s) => {
    if(s.length !== undefined){
        if(p.x > (s.center.x - (s.length)) && p.x < (s.center.x + (s.length))){
            if(p.y > (s.center.y - (s.length)) && p.y < (s.center.y + s.length)){
                return true;
            }
        }
    } else {
        if(p.x > (s.center.x - s.radius) && p.x < (s.center.x + s.radius)){
            if(p.y > (s.center.y - (s.radius)) && p.y < (s.center.y + s.radius)){
                return true;
            }
        }

    }
    return false;
}
const grab = () => {
    for(let i = 0; i < shapes.length; i++){
        if(shapeContains(mousePosition, shapes[i])){
            grabbedShape = i;
            return;
        }
    }
}
const release = () => {
    if(shapes[grabbedShape] === undefined) return;
    let th = 50;
    if(Math.abs(shapes[grabbedShape].center.x - outlines[grabbedShape].center.x) < th && Math.abs(shapes[grabbedShape].center.y - outlines[grabbedShape].center.y < th)){
        shapes[grabbedShape].center = outlines[grabbedShape].center;
        shapes[grabbedShape].recalc();
    }
    grabbedShape = -1;
    calcScore();
}

const write = (text, p) => ctx.fillText(text, p.x - ctx.measureText(text).width / 2, p.y);
const update = (time) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "4vmin Noto Sans Mono";
    ctx.fillStyle = fgdefault;
    ctx.strokeStyle = fgdefault;
    for(let i = 0; i < shapes.length; i++){
        ctx.fill(shapes[i].draw());
    }
    for(let i = 0; i < outlines.length; i++){
        ctx.stroke(outlines[i].draw());
    }
    write(`Level ${levelNumber}`, new Point(canvas.width / 2, 100));
    if(celebrating){
        write("Yay! You did it!", new Point(canvas.width / 2, canvas.height / 2));
    }

    requestAnimationFrame(update);
}





addEventListener("resize", resize);
addEventListener("touchstart", () => grab());
addEventListener("touchend", () => release());
addEventListener("mousedown", () => grab());
addEventListener("mouseup", () => release());
addEventListener("mousemove", (e) => {
    mousePosition = new Point(e.layerX, e.layerY);
    if(shapes[grabbedShape] !== undefined){
        shapes[grabbedShape].center = mousePosition;
        shapes[grabbedShape].recalc();
    }
    calcScore();
});
addEventListener("touchmove", (e) => {
    mousePosition = new Point(e.touches[0].clientX - e.target.getBoundingClientRect().left, e.touches[0].clientY - e.target.getBoundingClientRect().top);
    console.log(mousePosition);
    if(shapes[grabbedShape] !== undefined){
        shapes[grabbedShape].center = mousePosition;
        shapes[grabbedShape].recalc();
    }
    calcScore();
});
resize();
generateLevel();
update();
