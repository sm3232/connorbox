import * as module from "../../scripts/sort.js";
Object.entries(module).forEach(([name, exported]) => window[name] = exported);
const sort = () => {
    for(let i = 1; i < nums.length; i++){
        let item = nums[i];
        steps.push({f: grab, p: [item]});
        let k;
        for(k = i - 1; k >= 0; k--){
            if(nums[k].number > item.number){
                steps.push({f: swap, p: [item, nums[k]]});
                nums[k + 1] = nums[k];
            } else {
                break;
            }
        }
        steps.push({f: release, p: [item]});
        nums[k + 1] = item;
    }
}
generateHTML(); start(); resize(); sort(); animate(); update();
