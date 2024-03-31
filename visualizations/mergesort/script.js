import * as module from "../../scripts/sort.js";
Object.entries(module).forEach(([name, exported]) => window[name] = exported);
const sort = (nums, steps) => {
    const merge = (n, start, mid, end) => {
        let midstart = mid + 1;
        if(n[mid].number > n[midstart].number){
            while(mid >= start && end >= midstart){
                if(n[start].number > n[midstart].number){
                    console.log(n[start].number + " > " + n[midstart].number + ". Swap.");
                    let val = n[midstart];
                    let at = midstart;
                    let shifted = [];
                    while(at != start){
                        n[at] = n[at - 1];
                        shifted.push(n[at]);
                        at--;
                    }
                    shifted.push(val);
                    steps.push({f: grab, p: [val]});
                    steps.push({f: highlight, p: shifted.slice(0, shifted.length - 1)});
                    steps.push({f: shift, p: shifted});
                    steps.push({f: unhighlight, p: shifted});
                    steps.push({f: release, p: [val]});
                    n[start] = val;
                    mid++;
                    midstart++;
                }
                start++;
            }
        }

    }
    const mergesort = (n, start, end) => {
        if(start < end) {
            let mid = start + parseInt((end - start) / 2);
            mergesort(n, start, mid);
            mergesort(n, mid + 1, end);
            merge(n, start, mid, end);
        }

    }
    mergesort(nums, 0, nums.length - 1);
    console.log(nums);
}
start(sort);
