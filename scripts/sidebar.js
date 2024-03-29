const small = 300;
const big = 600;
const thresh = 700;
const bars = document.querySelectorAll(".sidebar");
const exes = document.querySelectorAll(".closebtn");
const openers = document.querySelectorAll(".opener");
const closeInfo = () => {for(let i = 0; i < bars.length; i++) bars[i].style.left = "100%";}
const openInfo = (id) => {
    if(id === undefined){
        for(let i = 0; i < bars.length; i++){
            if(bars[i].style.left !== "100%") bars[i].style.left = `calc(100% - ${window.innerWidth <= thresh ? small : big}px)`;
        }
    } else {
        closeInfo();
        document.getElementById(`sidebar-${id}`).style.left = `calc(100% - ${window.innerWidth <= thresh ? small : big}px)`;
    }
}
for(let i = 0; i < exes.length; i++) exes[i].onclick = () => closeInfo();
for(let i = 0; i < openers.length; i++) openers[i].onclick = () => openInfo(openers[i].id);
addEventListener("click", (e) => {
    if(e.target.classList.contains("noclose")) return;
    for(let i = 0; i < bars.length; i++){
        if(bars[i].contains(e.target)) return;
    }
    closeInfo();
})
addEventListener("resize", () => openInfo());
