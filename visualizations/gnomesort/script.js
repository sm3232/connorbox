import * as module from "../../scripts/sort.js";
Object.entries(module).forEach(([name, exported]) => window[name] = exported);
const sort = () => {
    let pos = 0;
    while(pos < nums.length){
        steps.push({f: grab, p: [nums[pos]]});
        if(pos === 0 || nums[pos].number >= nums[pos - 1].number){
            steps.push({f: release, p: [nums[pos]]});
            pos++;
        } else {
            steps.push({f: grab, p: [nums[pos - 1]]});
            steps.push({f: swap, p: [nums[pos], nums[pos - 1]]});
            steps.push({f: release, p: [nums[pos], nums[pos - 1]]});
            let temp = nums[pos];
            nums[pos] = nums[pos - 1];
            nums[pos - 1] = temp;
            pos--;
        }
    }
}
generateHTML(); start(); resize(); sort(); animate(); update();
