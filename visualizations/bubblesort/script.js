class Point { constructor(x_, y_){this.x = x_; this.y = y_;} }
class SortingNumber {
    constructor(index_, pos_, number_){
        this.index = index_;
        this.pos = pos_
        this.transform = new Point(0, 0);
        this.number = number_;
        this.movement = null;
    }
}

const bgdefault = getComputedStyle(document.body).getPropertyValue("--bg-default");
const fgdefault = getComputedStyle(document.body).getPropertyValue("--fg-default");

const container = document.getElementById("sorting-container");
const svgContainer = document.getElementById("svgContainer");
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");
const frameTime = 0.010;

const yshift = -0.15;
const transitionDuration = 0.1;
const MAX_NUMS = 60;
const MIN_NUMS = 2;
const SVG_PAUSE = '<polygon id="iconpause" points="25 15 40 15 40 85 25 85"/><polygon id="iconpause" points="60 15 75 15 75 85 60 85"/>'
const SVG_PLAY = '<polygon id="iconplay" points="25 15 25 85 85 50"/>'
let nums = [];
let steps = [];
let index = 0;
let playhead = 0;
let paused = true;
let stepping = false;
let issorted = false;
let timer = 0.0;
let oldsize = new Point(container.clientWidth, container.clientHeight);


const animationTimer = async () => {
    timer = transitionDuration;
    return new Promise(r => setTimeout(r, timer * 1000));
}
const add = (p1, p2) => new Point(p1.x + p2.x, p1.y + p2.y);
const ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const getRandomInt = (min, max) => {return Math.floor(Math.random() * (max - min) + min);}
const distance = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
const resize = () => { 
    canvas.width = container.clientWidth; 
    canvas.height = container.clientHeight; 
    fixAlignment(new Point(container.clientWidth, container.clientHeight));
    oldsize = new Point(container.clientWidth, container.clientHeight);
}
const lerp = (a, b, t) => new Point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
const remap = (val, inMin, inMax, outMin, outMax) => outMin + (val - inMin) * (outMax - outMin) / (inMax - inMin);
const clamp = (val, min, max) => val > max ? max : val < min ? min : val;
const grab = async (n1, n2) => {
    n1.movement = {t: 0, start: n1.transform, end: new Point(n1.transform.x, n1.transform.y - 100), d: transitionDuration};
    n2.movement = {t: 0, start: n2.transform, end: new Point(n2.transform.x, n2.transform.y - 100), d: transitionDuration};
}
const release = async (n1, n2) => {
    n1.movement = {t: 0, start: n1.transform, end: new Point(n1.transform.x, n1.transform.y + 100), d: transitionDuration};
    n2.movement = {t: 0, start: n2.transform, end: new Point(n2.transform.x, n2.transform.y + 100), d: transitionDuration};
}
const swap = async (n1, n2) => {
    const dx = (n2.pos.x + n2.transform.x) - (n1.pos.x + n1.transform.x);
    n1.movement = {t: 0, start: n1.transform, end: new Point(n1.transform.x + dx, n1.transform.y), d: transitionDuration};
    n2.movement = {t: 0, start: n2.transform, end: new Point(n2.transform.x - dx, n2.transform.y), d: transitionDuration};
}
const until = (condition) => {
    const poll = resolve => condition() ? resolve() : setTimeout(_ => poll(resolve), 16);
    return new Promise(poll);
}
const sort = () => {
    for(let i = 0; i < nums.length; i++){
        let found = false;
        for(let k = 1; k < nums.length; k++){
            steps.push({f: grab, p: [nums[k - 1], nums[k]]});
            if(nums[k - 1].number > nums[k].number){
                steps.push({f: swap, p: [nums[k - 1], nums[k]]});
                let temp = nums[k - 1];
                nums[k - 1] = nums[k];
                nums[k] = temp;
                found = true;
            }
            steps.push({f: release, p: [nums[k - 1], nums[k]]});
        }
        if(!found) break;
    }
}
const animate = async () => {
    if(paused || issorted) return;
    await until(_ => !stepping);
    stepping = true;
    for(let i = playhead; i < steps.length; i++){
        playhead = i;
        if(paused){
            stepping = false;
            return;
        }
        steps[i].f(steps[i].p[0], steps[i].p[1]);
        await until(_ => steps[i].p[0].movement === null);
        await until(_ => steps[i].p[1].movement === null);
    }
    playhead = steps.length;
    svgContainer.innerHTML = SVG_PLAY;
    issorted = true;
    stepping = false;
}
const stepForward = async () => {
    if(steps[playhead] === undefined || issorted) return;
    svgContainer.innerHTML = SVG_PLAY;
    paused = true;
    await until(_ => !stepping);
    stepping = true;
    steps[playhead].f(steps[playhead].p[0], steps[playhead].p[1]);
    await until(_ => steps[playhead].p[0].movement === null);
    await until(_ => steps[playhead].p[1].movement === null);
    playhead++;
    if(playhead >= steps.length) issorted = true;
    stepping = false;
}
const stepBack = async () => {
    let reversed = [...steps].reverse();
    let unwind = [];
    for(let i = 0; i < steps.length; i++){
        if(steps[i].f === grab) unwind.push({f: release, p: steps[i].p});
        if(steps[i].f === release) unwind.push({f: grab, p: steps[i].p});
        if(steps[i].f === swap) unwind.push(steps[i]);
    }
    unwind.push({f: grab, p: unwind[unwind.length - 1].p});
    console.log(playhead);
    console.log(unwind);
    if(unwind[playhead - 1] === undefined) return;
    svgContainer.innerHTML = SVG_PLAY;
    paused = true;
    issorted = false;
    await until(_ => !stepping);
    stepping = true;
    playhead--;
    unwind[playhead].f(unwind[playhead].p[0], unwind[playhead].p[1]);
    await until(_ => unwind[playhead].p[0].movement === null);
    await until(_ => unwind[playhead].p[1].movement === null);
    stepping = false;
}
const toggleButton = () => {
    if(issorted) return;
    svgContainer.innerHTML = paused ? SVG_PAUSE : SVG_PLAY;
    paused = !paused;
    animate();
}
const addNumber = (min = 0, max = 100) => {
    if(nums.length >= MAX_NUMS) return;
    nums.push(new SortingNumber(index, new Point(0, 0), getRandomInt(min, max))); 
    index++;
    fixAlignment(oldsize);
}
const removeNumber = () => {
    if(nums.length <= MIN_NUMS) return;
    nums.pop(); index--;
    fixAlignment(oldsize);
}
const fixAlignment = (newsize) => {
    let divx = canvas.width / (nums.length + 1);
    for(let i = 0; i < nums.length; i++){
        nums[i].pos.x = divx * (nums[i].index + 1);
        nums[i].pos.y = canvas.height / 2;
        nums[i].transform.x = remap(nums[i].transform.x, 0, oldsize.x, 0, newsize.x);
        nums[i].transform.y = remap(nums[i].transform.y, 0, oldsize.y, 0, newsize.y);
        if(nums[i].movement !== null){
            nums[i].movement.start.x = remap(nums[i].movement.start.x, 0, oldsize.x, 0, newsize.x);
            nums[i].movement.start.y = remap(nums[i].movement.start.y, 0, oldsize.y, 0, newsize.y);
            nums[i].movement.end.x = remap(nums[i].movement.end.x, 0, oldsize.x, 0, newsize.x);
            nums[i].movement.end.y = remap(nums[i].movement.end.y, 0, oldsize.y, 0, newsize.y);
        }
    }
}
const openSide = () => document.getElementById("sidebar").style.left = "calc(100% - 250px)";
const closeSide = () => document.getElementById("sidebar").style.left = "100%";
document.getElementById("sort").addEventListener("click", () => toggleButton());
document.getElementById("stepback").addEventListener("click", () => stepBack());
document.getElementById("stepforward").addEventListener("click", () => stepForward());
addEventListener("resize", resize);
const write = (text, p) => ctx.fillText(text, p.x - ctx.measureText(text).width / 2, p.y);
let previoustime = 0;
const update = (time) => {
    let step = time - previoustime;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "4vmin Noto Sans Mono";
    ctx.fillStyle = fgdefault;
    
    for(let i = 0; i < nums.length; i++) {
        if(nums[i].movement !== null){
            if(nums[i].movement.t >= nums[i].movement.d){
                nums[i].transform = nums[i].movement.end;
                nums[i].movement = null;
            } else {
                nums[i].transform = lerp(nums[i].movement.start, nums[i].movement.end, ease(remap(nums[i].movement.t, 0, nums[i].movement.d, 0, 1)));
                nums[i].movement.t += (step / 1000);
            }
        }
        write((nums[i].number < 10 ? '0' + nums[i].number : nums[i].number), add(nums[i].pos, nums[i].transform));
    }

    previoustime = time;
    requestAnimationFrame(update);
}

// Add 6 numbers as a default
for(let i = 0; i < 6; i++) addNumber();
resize();
sort();
animate();
update();
