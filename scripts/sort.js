class Point { constructor(x_, y_){this.x = x_; this.y = y_;} }
export class SortingNumber {
    constructor(index_, pos_, number_){
        this.index = index_;
        this.pos = pos_
        this.transform = new Point(0, 0);
        this.number = number_;
        this.movement = null;
        this.color = fgdefault;
        this.radius = 10;
    }
}
let transitionDuration = 0.1;
const SVG_PAUSE = '<path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/>'
const SVG_PLAY = '<path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>'
const bgdefault = getComputedStyle(document.body).getPropertyValue("--bg-default");
const fgdefault = getComputedStyle(document.body).getPropertyValue("--fg-default");
const highlightdefault = getComputedStyle(document.body).getPropertyValue("--highlight");
const grabdefault = getComputedStyle(document.body).getPropertyValue("--grab");
const padding = 60;
const DEFAULT_N_SIZE = 8;
const DEFAULT_C_SIZE = 100;
let nums = [];
let steps = [];
let sortfunc;
let unwind = [];
let index = 0;
let playhead = 0;
let paused = true;
let stepping = false;
let issorted = false;
let oldsize;
let container;
let svgContainer;
let canvas;
let ctx;
let mode = false;
let fakedelay = false;
const reset = () => {
    index = 0;
    playhead = 0;
    paused = true;
    stepping = false;
    issorted = false;
    nums = [];
    steps = [];
    unwind = [];
}
const add = (p1, p2) => new Point(p1.x + p2.x, p1.y + p2.y);
const ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const getRandomInt = (min, max) => {return Math.floor(Math.random() * (max - min) + min);}
export const resize = () => { 
    canvas.width = container.clientWidth; 
    canvas.height = container.clientHeight; 
    fixAlignment(new Point(container.clientWidth, container.clientHeight));
    oldsize = new Point(container.clientWidth, container.clientHeight);
}
const lerp = (a, b, t) => new Point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
const remap = (val, inMin, inMax, outMin, outMax) => outMin + (val - inMin) * (outMax - outMin) / (inMax - inMin);
const clamp = (val, min, max) => val > max ? max : val < min ? min : val;
export const grab = (ns) => {
    for(let i = 0; i < ns.length; i++){
        if(mode){
            ns[i].movement = {t: 0, start: ns[i].transform, end: new Point(ns[i].transform.x, ns[i].transform.y - 100), d: transitionDuration};
        } else {
            ns[i].color = grabdefault;
        }
    }
}
export const release = (ns) => {
    for(let i = 0; i < ns.length; i++){
        if(mode){
            ns[i].movement = {t: 0, start: ns[i].transform, end: new Point(ns[i].transform.x, ns[i].transform.y + 100), d: transitionDuration};
        } else {
            ns[i].color = fgdefault;
        }
    }
}
export const swap = (ns) => {
    for(let i = 0; i < ns.length; i += 2){
        const dx = (ns[i + 1].pos.x + ns[i + 1].transform.x) - (ns[i].pos.x + ns[i].transform.x);
        let td = transitionDuration;
        if(fakedelay){
            if(dx > canvas.width / nums.length){
                td = 0.1;
            }
        }
        ns[i].movement = {t: 0, start: ns[i].transform, end: new Point(ns[i].transform.x + dx, ns[i].transform.y), d: td};
        ns[i + 1].movement = {t: 0, start: ns[i + 1].transform, end: new Point(ns[i + 1].transform.x - dx, ns[i + 1].transform.y), d: td};

    }
}
export const shift = (ns) => {
    let dx = Math.abs((ns[1].pos.x + ns[1].transform.x) - (ns[0].pos.x + ns[0].transform.x));
    for(let i = ns.length - 1; i >= 0; i--) ns[i].movement = {t: 0, start: ns[i].transform, end: new Point(ns[i].transform.x + dx, ns[i].transform.y), d: transitionDuration};        
    dx = (ns[ns.length - 2].pos.x + ns[ns.length - 2].transform.x) - (ns[ns.length - 1].pos.x + ns[ns.length - 1].transform.x);
    ns[ns.length - 1].movement = {t: 0, start: ns[ns.length - 1].transform, end: new Point(ns[ns.length - 1].transform.x + dx, ns[ns.length - 1].transform.y), d: transitionDuration};
}
export const unshift = (ns) => {
    let dx = (ns[0].pos.x + ns[0].transform.x) - (ns[ns.length - 1].pos.x + ns[ns.length - 1].transform.x);
    ns[ns.length - 1].movement = {t: 0, start: ns[ns.length - 1].transform, end: new Point(ns[ns.length - 1].transform.x + dx, ns[ns.length - 1].transform.y), d: transitionDuration};
    dx = -Math.abs((ns[1].pos.x + ns[1].transform.x) - (ns[0].pos.x + ns[0].transform.x));
    for(let i = ns.length - 2; i >= 0; i--) ns[i].movement = {t: 0, start: ns[i].transform, end: new Point(ns[i].transform.x + dx, ns[i].transform.y), d: transitionDuration};
}
export const highlight = (ns) => {
    if(mode) return;
    for(let i = 0; i < ns.length; i++) ns[i].color = highlightdefault;
}
export const unhighlight = (ns) => {
    if(mode) return;
    for(let i = 0; i < ns.length; i++) ns[i].color = fgdefault;
}
const until = (condition) => {
    const poll = resolve => condition() ? resolve() : setTimeout(_ => poll(resolve), 16);
    return new Promise(poll);
}
export const animate = async () => {
    if(unwind.length === 0 && steps.length > 0){
        for(let i = 0; i < steps.length; i++){
            if(steps[i].f === grab) unwind.push({f: release, p: steps[i].p});
            if(steps[i].f === release) unwind.push({f: grab, p: steps[i].p});
            if(steps[i].f === swap) unwind.push(steps[i]);
            if(steps[i].f === shift) unwind.push({f: unshift, p: steps[i].p});
            if(steps[i].f === highlight) unwind.push({f: unhighlight, p: steps[i].p});
            if(steps[i].f === unhighlight) unwind.push({f: highlight, p: steps[i].p});
        }
        unwind.push({f: grab, p: unwind[unwind.length - 1].p});
    }
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
    svgContainer.setAttribute("viewBox", "0 0 384 512");
    svgContainer.innerHTML = SVG_PLAY;
    issorted = true;
    stepping = false;
}
const stepForward = async () => {
    if(steps[playhead] === undefined || issorted) return;
    svgContainer.setAttribute("viewBox", "0 0 384 512");
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
const stepBack = async () => {
    if(unwind[playhead - 1] === undefined) return;
    svgContainer.setAttribute("viewBox", "0 0 384 512");
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
const toggleMode = async () => {
    const svg = document.getElementById("sortmode");
    svg.setAttribute("viewBox", `0 0 ${mode ? "512" : "448"} 512`);
    svg.innerHTML = mode ? `<path d="M32 32c17.7 0 32 14.3 32 32V400c0 8.8 7.2 16 16 16H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H80c-44.2 0-80-35.8-80-80V64C0 46.3 14.3 32 32 32zM160 224c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32s-32-14.3-32-32V256c0-17.7 14.3-32 32-32zm128-64V320c0 17.7-14.3 32-32 32s-32-14.3-32-32V160c0-17.7 14.3-32 32-32s32 14.3 32 32zm64 32c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V224c0-17.7 14.3-32 32-32zM480 96V320c0 17.7-14.3 32-32 32s-32-14.3-32-32V96c0-17.7 14.3-32 32-32s32 14.3 32 32z"/>` : `<path d="M181.3 32.4c17.4 2.9 29.2 19.4 26.3 36.8L197.8 128h95.1l11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3s29.2 19.4 26.3 36.8L357.8 128H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H347.1L325.8 320H384c17.7 0 32 14.3 32 32s-14.3 32-32 32H315.1l-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8l9.8-58.7H155.1l-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8L90.2 384H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h68.9l21.3-128H64c-17.7 0-32-14.3-32-32s14.3-32 32-32h68.9l11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3zM187.1 192L165.8 320h95.1l21.3-128H187.1z"/>`;
    mode = !mode;
    paused = true;
    svgContainer.setAttribute("viewBox", "0 0 384 512");
    svgContainer.innerHTML = SVG_PLAY;
    await until(_ => !stepping);
    reset();
    if(mode){
        for(let i = 0; i < DEFAULT_N_SIZE; i++) addNumber();
        transitionDuration = 0.1;
    } else {
        for(let i = 0; i < DEFAULT_C_SIZE; i++) addNumber();
        transitionDuration = 0;
    }
    resize();
    sortfunc(nums, steps);
}
const toggleButton = () => {
    if(issorted) return;
    svgContainer.setAttribute("viewBox", paused ? "0 0 320 512" : "0 0 384 512");
    svgContainer.innerHTML = paused ? SVG_PAUSE : SVG_PLAY;
    paused = !paused;
    animate();
}
const addNumber = (min = 0, max = 100) => {
    nums.push(new SortingNumber(index, new Point(0, 0), getRandomInt(min, max))); 
    index++;
}
const fixAlignment = (newsize) => {
    let divx = canvas.width / (nums.length + 1);
    let highest = nums[0].number, lowest = nums[0].number;
    if(!mode){
        for(let i = 0; i < nums.length; i++){
            if(nums[i].number < lowest) lowest = nums[i].number;
            if(nums[i].number > highest) highest = nums[i].number;
        }
    }

    for(let i = 0; i < nums.length; i++){
        nums[i].pos.x = divx * (nums[i].index + 1);
        if(mode){
            nums[i].pos.y = canvas.height / 2;
        } else {
            nums[i].pos.y = canvas.height - remap(nums[i].number, lowest, highest, 0 + padding, canvas.height - padding);
        }
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
const write = (text, p) => ctx.fillText(text, p.x - ctx.measureText(text).width / 2, p.y);
const dot = (p, r) => ctx.arc(p.x, p.y, r, 0, Math.PI * 2, true);
let previoustime = 0;
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
                if(mode){
                    nums[i].transform = lerp(nums[i].movement.start, nums[i].movement.end, ease(remap(nums[i].movement.t, 0, nums[i].movement.d, 0, 1)));
                } else {
                    nums[i].transform = lerp(nums[i].movement.start, nums[i].movement.end, remap(nums[i].movement.t, 0, nums[i].movement.d, 0, 1));
                }
                nums[i].movement.t += (step / 1000);
            }
        }
        if(mode){
            write((nums[i].number < 10 ? '0' + nums[i].number : nums[i].number), add(nums[i].pos, nums[i].transform));
        } else {
            ctx.beginPath();
            dot(add(nums[i].pos, nums[i].transform), Math.min(window.innerWidth, window.innerHeight) * 0.01);
            ctx.closePath();
            ctx.moveTo(nums[i].pos.x + nums[i].transform.x, nums[i].pos.y + nums[i].transform.y);
            ctx.lineTo(nums[i].pos.x + nums[i].transform.x, canvas.height);
            ctx.fillStyle = nums[i].color;
            ctx.fill();
            ctx.strokeStyle = nums[i].color;
            ctx.stroke();
        }
    }

    previoustime = time;
    requestAnimationFrame(update);
}
const generateHTML = () => {
    let title = document.title.slice(0, document.title.length - (document.title.indexOf(' ') === -1 ? 4 : 5));
    let tc, link = "https://en.wikipedia.org/wiki/";
    let oofn = "<td><var>n</var></td>";
    let oofn2 = "<td><var>n</var><sup><var>2</var></sup></td>";
    let oofnlogn = "<td><var>nlogn</var></td>";
    if(title === "Bubble" || title === "Gnome" || title === "Insertion" || title === "Cocktail"){
        tc = [oofn, oofn2, oofn2];
        link += title === "Cocktail" ? title + "_shaker_sort" : title + "_sort";
    }
    if(title === "Selection"){
        tc = [oofn2, oofn2, oofn2];
        link += "Selection_sort";
        fakedelay = true;
    }
    if(title === "Quick"){
        tc = [oofnlogn, oofnlogn, oofn2];
        link += "Quicksort";
        fakedelay = true;
    }
    if(title === "Merge"){
        tc = [oofnlogn, oofnlogn, oofnlogn];
        link += "Merge_sort";
    }
    if(title === "Heap"){
        tc = [oofnlogn, oofnlogn, oofnlogn];
        link += "Heapsort";
    }
    document.body.innerHTML = 
        `
            <div id="sidebar-info" class="sidebar" style="left: 100%">
                <span class="closebtn">&times;</span>
                <div><h1>Made by Connor Hill</h1></div>
                <div id="table-container">
                    <table>
                        <caption>Time complexity</caption>
                        <thead>
                            <tr>
                                <th>Best</th>
                                <th>Average</th>
                                <th>Worst</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                ${tc[0]}
                                ${tc[1]}
                                ${tc[2]}
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <a href="https://www.github.com/sm3232/">
                        <svg xmlns="http://www.w3.org/2000/svg" id="gh" aria-hidden="true" focusable="false" viewBox="0 0 512 512">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>
                        </svg>
                    </a>
                    <a href="https://www.linkedin.com/in/connor-hill-7936652b9/">
                        <svg xmlns="http://www.w3.org/2000/svg" id="ln" aria-hidden="true" focusable="false" viewBox="0 0 512 512">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>
                        </svg>
                    </a>
                </div>
            </div>
            <div id="header">
                <a href="https://connorbox.com/" id="back">back</a>
                <a href=${link}>${title} Sort</a>
                <span id="info" class="noclose opener">info</span>
            </div>
            <div id="content">
                <div id="sorting-container">
                    <canvas id="canvas"></canvas>
                </div>
            </div>
            <div id="footer">
                <div id="fanner">
                    <button>
                        <svg id="stepback" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z"/>
                        </svg>
                    </button>
                    <button >
                        <svg id="sort" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
                        </svg>
                    </button>
                    <button>
                        <svg id="stepforward" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"/>
                        </svg>
                    </button>
                    <button>
                        <svg id="sortmode" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path d="M32 32c17.7 0 32 14.3 32 32V400c0 8.8 7.2 16 16 16H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H80c-44.2 0-80-35.8-80-80V64C0 46.3 14.3 32 32 32zM160 224c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32s-32-14.3-32-32V256c0-17.7 14.3-32 32-32zm128-64V320c0 17.7-14.3 32-32 32s-32-14.3-32-32V160c0-17.7 14.3-32 32-32s32 14.3 32 32zm64 32c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V224c0-17.7 14.3-32 32-32zM480 96V320c0 17.7-14.3 32-32 32s-32-14.3-32-32V96c0-17.7 14.3-32 32-32s32 14.3 32 32z"/> 
                        </svg>
                    </button>
                </div>
            </div>
        `;
}
export const start = (sf) => {
    generateHTML();
    container = document.getElementById("sorting-container");
    svgContainer = document.getElementById("sort");
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    oldsize = new Point(container.clientWidth, container.clientHeight);
    document.getElementById("sort").parentElement.addEventListener("click", () => toggleButton());
    document.getElementById("stepback").parentElement.addEventListener("click", () => stepBack());
    document.getElementById("stepforward").parentElement.addEventListener("click", () => stepForward());
    document.getElementById("sortmode").parentElement.addEventListener("click", () => toggleMode());
    addEventListener("resize", resize);
    if(mode){
        for(let i = 0; i < DEFAULT_N_SIZE; i++) addNumber();
        transitionDuration = 0.1;
    } else {
        for(let i = 0; i < DEFAULT_C_SIZE; i++) addNumber();
        transitionDuration = 0;
    }
    resize();
    sortfunc = sf;
    sortfunc(nums, steps);
    animate();
    update();
}
