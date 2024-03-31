import * as module from "../../scripts/sort.js";
Object.entries(module).forEach(([name, exported]) => window[name] = exported);
const sort = (nums, steps) => {
    const split = (n, low, high) => {
        let pivot = n[low];
        let left = low - 1;
        let right = high + 1;
        while(1){
            let grabbed = [];
            do{
                left++;
                if(!grabbed.includes(nums[left])){
                    steps.push({f: grab, p: [nums[left]]});
                    grabbed.push(nums[left]);
                }
            } while(nums[left].number < pivot.number);
            do{
                right--;
                if(!grabbed.includes(nums[right])){
                    steps.push({f: grab, p: [nums[right]]});
                    grabbed.push(nums[right]);
                }
            } while(nums[right].number > pivot.number);

            if(left >= right){
                steps.push({f: release, p: grabbed});
                return right;
            }

            steps.push({f: swap, p:[nums[left], nums[right]]});
            steps.push({f: release, p: grabbed});
            let temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
        }
    }
    const quick = (n, low, high) => {
        if(low >= 0 && high >= 0 && low < high){
            let index = split(n, low, high);
            quick(n, low, index);
            quick(n, index + 1, high);
        }

    }
    quick(nums, 0, nums.length - 1);
}
start(sort);
