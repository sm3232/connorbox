import * as module from "../../scripts/sort.js";
Object.entries(module).forEach(([name, exported]) => window[name] = exported);
const sort = (nums, steps) => {
    for(let i = 0; i < nums.length; i++){
        let found = false;
        for(let k = 1; k < nums.length - i; k++){
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
start(sort);
