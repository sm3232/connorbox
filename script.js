const visualizations = document.getElementById("visualizations");
const puzzles = document.getElementById("puzzles");
const about = document.getElementById("about");
let menustatus = 0;
const small = 300;
const big = 600;
const thresh = 700;

about.onclick = () => {
    if(menustatus === 1){
        closeAbout();
        return;
    }
    if(menustatus === 2) closeVis();
    if(menustatus === 3) closePuz();
    openAbout();
    menustatus = 1;
}
const openAbout = () => document.getElementById("sidebar-about").style.left = `calc(100% - ${window.innerWidth < thresh ? small : big}px)`;
const closeAbout = () => {
    document.getElementById("sidebar-about").style.left = "100%";
    menustatus = 0;
}
visualizations.onclick = () => {
    if(menustatus === 1) closeAbout();
    if(menustatus === 2) {
        closeVis();
        return;
    }
    if(menustatus === 3) closePuz();
    openVis();
    menustatus = 2;
}
const openVis = () => document.getElementById("sidebar-vis").style.left = `calc(100% - ${window.innerWidth < thresh ? small : big}px)`;
const closeVis = () => {
    document.getElementById("sidebar-vis").style.left = "100%";
    menustatus = 0;
}
puzzles.onclick = () => {
    if(menustatus === 1) closeAbout();
    if(menustatus === 2) closeVis();
    if(menustatus === 3) {
        closePuz();
        return;
    }
    openPuz();
    menustatus = 3;
}
const openPuz = () => document.getElementById("sidebar-puz").style.left = `calc(100% - ${window.innerWidth < thresh ? small : big}px)`;
const closePuz = () => {
    document.getElementById("sidebar-puz").style.left = "100%";
    menustatus = 0;
}
addEventListener("resize", () => {
    if(menustatus === 0) return;
    if(menustatus === 1){
        openAbout();
    } else if(menustatus === 2){
        openVis();
    } else {
        openPuz();
    }
})
addEventListener("click", (e) => {
    if(menustatus === 0) return;
    if(e.target.classList.contains("close")){
        if(menustatus === 1) closeAbout();
        if(menustatus === 2) closeVis();
        if(menustatus === 3) closePuz();
    }
})
