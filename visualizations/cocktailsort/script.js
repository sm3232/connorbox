import * as module from "../script.js";
Object.entries(module).forEach(([name, exported]) => window[name] = exported);
const sort = () => {
    let swapped = true;
    while(swapped){
        swapped = false;
        for(let i = 0; i < nums.length - 1; i++){
            steps.push({f: grab, p: [nums[i]]});
            if(nums[i].number > nums[i + 1].number){
                steps.push({f: grab, p: [nums[i + 1]]});
                steps.push({f: swap, p: [nums[i], nums[i + 1]]});
                steps.push({f: release, p: [nums[i], nums[i + 1]]});
                let temp = nums[i];
                nums[i] = nums[i + 1];
                nums[i + 1] = temp;
                swapped = true;
            } else {
                steps.push({f: release, p: [nums[i]]});
            }
        }
        if(!swapped) break;
        swapped = false;
        for(let i = nums.length - 3; i > 0; i--){
            steps.push({f: grab, p: [nums[i]]});
            if(nums[i].number > nums[i + 1].number){
                steps.push({f: grab, p: [nums[i + 1]]});
                steps.push({f: swap, p: [nums[i], nums[i + 1]]});
                steps.push({f: release, p: [nums[i], nums[i + 1]]});
                let temp = nums[i];
                nums[i] = nums[i + 1];
                nums[i + 1] = temp;
                swapped = true;
            } else {
                steps.push({f: release, p: [nums[i]]});
            }
        }

    }
}
start(); resize(); sort(); animate(); update();
