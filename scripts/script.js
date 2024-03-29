export const bgdefault = getComputedStyle(document.body).getPropertyValue("--bg-default");
export const fgdefault = getComputedStyle(document.body).getPropertyValue("--fg-default");
export class Point { constructor(x_, y_){this.x = x_; this.y = y_;} }
export class SortingNumber {
    constructor(index_, pos_, number_){
        this.index = index_;
        this.pos = pos_
        this.transform = new Point(0, 0);
        this.number = number_;
        this.movement = null;
    }
}
export const container = document.getElementById("sorting-container");
export const svgContainer = document.getElementById("svgContainer");
export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");
export const frameTime = 0.010;
export const yshift = -0.15;
export const transitionDuration = 0.1;
export const MAX_NUMS = 60;
export const MIN_NUMS = 2;
export const SVG_PAUSE = '<polygon id="iconpause" points="25 15 40 15 40 85 25 85"/><polygon id="iconpause" points="60 15 75 15 75 85 60 85"/>'
export const SVG_PLAY = '<polygon id="iconplay" points="25 15 25 85 85 50"/>'
export let oldsize = new Point(container.clientWidth, container.clientHeight);
export let nums = [];
export let steps = [];
export let index = 0;
export let playhead = 0;
export let paused = true;
export let stepping = false;
export let issorted = false;
export const add = (p1, p2) => new Point(p1.x + p2.x, p1.y + p2.y);
export const ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const getRandomInt = (min, max) => {return Math.floor(Math.random() * (max - min) + min);}
export const resize = () => { 
    canvas.width = container.clientWidth; 
    canvas.height = container.clientHeight; 
    fixAlignment(new Point(container.clientWidth, container.clientHeight));
    oldsize = new Point(container.clientWidth, container.clientHeight);
}
export const lerp = (a, b, t) => new Point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
export const remap = (val, inMin, inMax, outMin, outMax) => outMin + (val - inMin) * (outMax - outMin) / (inMax - inMin);
export const clamp = (val, min, max) => val > max ? max : val < min ? min : val;
export const grab = (ns) => {
    for(let i = 0; i < ns.length; i++){
        ns[i].movement = {t: 0, start: ns[i].transform, end: new Point(ns[i].transform.x, ns[i].transform.y - 100), d: transitionDuration};
    }
}
export const release = (ns) => {
    for(let i = 0; i < ns.length; i++){
        ns[i].movement = {t: 0, start: ns[i].transform, end: new Point(ns[i].transform.x, ns[i].transform.y + 100), d: transitionDuration};
    }
}
export const swap = (ns) => {
    const dx = (ns[1].pos.x + ns[1].transform.x) - (ns[0].pos.x + ns[0].transform.x);
    ns[0].movement = {t: 0, start: ns[0].transform, end: new Point(ns[0].transform.x + dx, ns[0].transform.y), d: transitionDuration};
    ns[1].movement = {t: 0, start: ns[1].transform, end: new Point(ns[1].transform.x - dx, ns[1].transform.y), d: transitionDuration};
}
export const until = (condition) => {
    const poll = resolve => condition() ? resolve() : setTimeout(_ => poll(resolve), 16);
    return new Promise(poll);
}
export const animate = async () => {
    if(paused || issorted) return;
    await until(_ => !stepping);
    stepping = true;
    for(let i = playhead; i < steps.length; i++){
        playhead = i;
        if(paused){
            stepping = false;
            return;
        }
        steps[i].f(steps[i].p);
        for(let k = 0; k < steps[i].p.length; k++) await until(_ => steps[i].p[k].movement === null);
    }
    playhead = steps.length;
    svgContainer.innerHTML = SVG_PLAY;
    issorted = true;
    stepping = false;
}
export const stepForward = async () => {
    if(steps[playhead] === undefined || issorted) return;
    svgContainer.innerHTML = SVG_PLAY;
    paused = true;
    await until(_ => !stepping);
    stepping = true;
    steps[playhead].f(steps[playhead].p);
    for(let k = 0; k < steps[playhead].p.length; k++) await until(_ => steps[playhead].p[k].movement === null);
    playhead++;
    if(playhead >= steps.length) issorted = true;
    stepping = false;
}
export const stepBack = async () => {
    let unwind = [];
    for(let i = 0; i < steps.length; i++){
        if(steps[i].f === grab) unwind.push({f: release, p: steps[i].p});
        if(steps[i].f === release) unwind.push({f: grab, p: steps[i].p});
        if(steps[i].f === swap) unwind.push(steps[i]);
    }
    unwind.push({f: grab, p: unwind[unwind.length - 1].p});
    if(unwind[playhead - 1] === undefined) return;
    svgContainer.innerHTML = SVG_PLAY;
    paused = true;
    issorted = false;
    await until(_ => !stepping);
    stepping = true;
    playhead--;
    unwind[playhead].f(unwind[playhead].p);
    for(let k = 0; k < unwind[playhead].p.length; k++) await until(_ => unwind[playhead].p[k].movement === null);
    stepping = false;
}
export const toggleButton = () => {
    if(issorted) return;
    svgContainer.innerHTML = paused ? SVG_PAUSE : SVG_PLAY;
    paused = !paused;
    animate();
}
export const addNumber = (min = 0, max = 100) => {
    if(nums.length >= MAX_NUMS) return;
    nums.push(new SortingNumber(index, new Point(0, 0), getRandomInt(min, max))); 
    index++;
    fixAlignment(oldsize);
}
export const fixAlignment = (newsize) => {
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
export const write = (text, p) => ctx.fillText(text, p.x - ctx.measureText(text).width / 2, p.y);
export let previoustime = 0;
export const update = (time) => {
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
export const start = () => {
    document.getElementById("sort").addEventListener("click", () => toggleButton());
    document.getElementById("stepback").addEventListener("click", () => stepBack());
    document.getElementById("stepforward").addEventListener("click", () => stepForward());
    addEventListener("resize", resize);
    
    for(let i = 0; i < 6; i++) addNumber();
}
