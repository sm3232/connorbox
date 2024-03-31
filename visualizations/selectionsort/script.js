import * as module from "../../scripts/sort.js";
Object.entries(module).forEach(([name, exported]) => window[name] = exported);
const sort = (nums, steps) => {
    for(let i = 0; i < nums.length - 1; i++){
        let min = i;
        steps.push({f: grab, p:[nums[min]]});
        for(let k = i + 1; k < nums.length; k++){
            steps.push({f: grab, p:[nums[k]]});
            if(nums[k].number < nums[min].number) {
                if(min !== i) steps.push({f: release, p:[nums[min]]});
                min = k;
            } else {
                steps.push({f: release, p:[nums[k]]});
            }
        }
        if(i === min){
            steps.push({f: release, p:[nums[i]]});
        } else {
            steps.push({f: swap, p:[nums[i], nums[min]]});
            steps.push({f: release, p:[nums[i], nums[min]]});
        }
        let temp = nums[i];
        nums[i] = nums[min];
        nums[min] = temp;
    }
}
start(sort);
