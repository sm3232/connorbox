import * as module from "../../scripts/sort.js";
Object.entries(module).forEach(([name, exported]) => window[name] = exported);
const sort = (nums, steps) => {
    const heapify = (n, size, i) => {
        let big = i;
        let left = i * 2 + 1;
        let right = i * 2 + 2;
        if(left < size && n[left].number > n[big].number) big = left;
        if(right < size && n[right].number > n[big].number) big = right;
        if(big != i){
            steps.push({f: grab, p: [n[i]]});
            steps.push({f: swap, p: [n[i], n[big]]});
            steps.push({f: release, p: [n[i]]});
            let temp = n[i];
            n[i] = n[big];
            n[big] = temp;
            heapify(n, size, big);
        }
    }
    const heapsort = (n) => {
        for(let i = parseInt(n.length / 2 - 1); i >= 0; i--) heapify(n, n.length, i);
        for(let i = n.length - 1; i >= 0; i--){
            steps.push({f: grab, p: [n[0], n[i]]});
            steps.push({f: swap, p: [n[0], n[i]]});
            steps.push({f: release, p: [n[0], n[i]]});
            let temp = n[0];
            n[0] = n[i];
            n[i] = temp;
            heapify(n, i, 0);
        }
    } 
    heapsort(nums);
}
start(sort);
