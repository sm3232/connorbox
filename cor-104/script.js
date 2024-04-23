const container = document.getElementById("content");

let progress = false;

// const ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const remap = (val, inMin, inMax, outMin, outMax) => outMin + (val - inMin) * (outMax - outMin) / (inMax - inMin);
const clamp = (val, min, max) => val > max ? max : val < min ? min : val;
const TextType = Object.freeze({
    Prompt:     Symbol(0),
    Exposition: Symbol(1),
    Title:      Symbol(2),
    Choice:     Symbol(3),
});
const wifeAwaken = [
    "Wake up already, Rip!",
    "Quit with the lazing around!",
    "I\'m getting sick of this laziness!",
    "Please Rip, wake up!",
    "Wake up!!!",
];
const wifeEncourage = [
    "\"Finally! You\'re getting something done!\"",
    "\"I\'m so proud of you, good job!\"",
    "\"Keep up the good work, Rip!\"",
    "\"Thanks, Rip!\"",
    "\"You\'re doing so good, Rip!\"",
    "\"Thanks, Dear!\"",
];
const defaultMAD = [0, -200, 242, 197, 124, 92, 92, 92];


addEventListener("click", () => progress = true);

const until = (element, condition) => {
    if(condition != undefined && element != undefined){
        let wait = true;
        element.length === undefined ? element.addEventListener(condition, () => wait = false) : element[0].addEventListener(condition, () => wait = false);
        const poll = resolve => (wait == false) ? resolve() : setTimeout(_ => poll(resolve), 16);
        return new Promise(poll);
    } else {
        progress = false;
        const poll = resolve => (progress == true) ? resolve() : setTimeout(_ => poll(resolve), 16);
        return new Promise(poll);
    }
}
const addChoices = async (c1, c2) => {
    container.innerHTML += `
        <div class="choice choiceContainer">
            <p class="choice choiceText fancyFont">${c1}</p>
            <p class="choice choiceText fancyFont">${c2}</p>
        </div>
    `;
    const choiceElements = document.querySelectorAll(".choice");
    await new Promise(r => setTimeout(r, 100));
    choiceElements.forEach((e) => e.classList.add("fadeIn"));
    return [...document.querySelectorAll(".choiceText"), document.querySelector(".choiceContainer")];
}
const fadeIn = async (type, text) => {
    let element;
    if(type == TextType.Prompt || type == TextType.Title){
        container.innerHTML += `
            <h1 class="${type == TextType.Prompt ? "prompt promptFont" : "fancyFont titleCard"}">${text}</h1>
        `;
        element = document.querySelector(`#content > ${type == TextType.Prompt ? ".prompt" : ".titleCard"}`);
    } else if(type == TextType.Exposition){
        container.innerHTML += `
            <p class="paraPart defaultFont">${text}</p>
        `;
        element = document.querySelector("#content > .paraPart")
    } else if(type == TextType.Choice){
    }
    await new Promise(r => setTimeout(r, 100));
    element.classList.add("fadeIn");
    return element;
}
const _for = (ms, msors = 0) => {
    return msors === 1 ? new Promise(r => setTimeout(r, ms * 1000)) : new Promise(r => setTimeout(r, ms));
}
const fadeOut = (elements) => elements.length === undefined ? elements.classList.remove("fadeIn") : elements.forEach((e) => e.classList.remove("fadeIn"));

const moveAndDarken = async (element, x, y, cr, cg, cb, tr, tg, tb) => {
    let cc = { r: cr, g: cg, b: cb };
    let cp = {x: 0, y: 0};
    let time = 0;
    let dur = 1;
    const step = () => {
        cp.x = lerp(0, x, ease(remap(time, 0, dur, 0, 1)));
        cp.y = lerp(0, y, ease(remap(time, 0, dur, 0, 1)));
        cc.r = lerp(cr, tr, ease(remap(time, 0, dur, 0, 1)));
        cc.g = lerp(cg, tg, ease(remap(time, 0, dur, 0, 1)));
        cc.b = lerp(cb, tb, ease(remap(time, 0, dur, 0, 1)));
        element.style.transform = `translate(${cp.x}px, ${cp.y}px)`;
        element.style.color = `rgb(${cc.r}, ${cc.g}, ${cc.b})`;
        time += 0.016;
        if(time < 1) requestAnimationFrame(step);
    }
    step();
    await _for(1, 1);
}
const darken = async (element, cr, cg, cb, tr, tg, tb) => {
    let current = { r: cr, g: cg, b: cb };
    let time = 0;
    let dur = 1;
    const step = () => {
        current.r = lerp(cr, tr, ease(remap(time, 0, dur, 0, 1)));
        current.g = lerp(cg, tg, ease(remap(time, 0, dur, 0, 1)));
        current.b = lerp(cb, tb, ease(remap(time, 0, dur, 0, 1)));
        element.style.color = `rgb(${current.r}, ${current.g}, ${current.b})`;
        time += 0.016;
        if(time < 1) requestAnimationFrame(step);
    }
    step();
    await _for(1, 1);
}
const move = async (element, x, y) => {
    let current = { x: 0, y: 0};
    let time = 0;
    let dur = 1;
    const step = () => {
        current.x = lerp(0, x, ease(remap(time, 0, dur, 0, 1)));
        current.y = lerp(0, y, ease(remap(time, 0, dur, 0, 1)));
        element.style.transform = `translate(${current.x}px, ${current.y}px)`;
        time += 0.016;
        if(time < 1) requestAnimationFrame(step);
    }
    step();
    await _for(1, 1);
}
let earlyExit = false;

const start = async (skipIndex = 0) => {
    let skipToStep = skipIndex;
    let wifeAnnoy = 0, wifeProud = 0;
    let karma = 0;
    let choices = {
        wolf: false,
        stick: false,
        grass: false,
        weeds: false,
        work: false,
        nap: false,
        persist: false,
    };

    const doChoice = async (c1, c2, f1, f2) => {
        const cs = await addChoices(c1, c2);
        let clicked;
        for(let i = 0; i < 2; i++) cs[i].onclick = () => clicked = i;
        await until(progress);
        const p = document.querySelector(".prompt");
        fadeOut([...cs, p]);
        await until([...cs, p], "transitionend");
        for(let i = 0; i < 2; i++) cs[2].removeChild(cs[i]);
        container.removeChild(cs[2]); container.removeChild(p);
        clicked === 0 ? f1() : f2();
        await _for(500, 0);
    }
    const doExposition = async (text) => {
        const p = await fadeIn(TextType.Exposition, text);
        await until(progress);
        fadeOut(p);
        await until(p, "transitionend");
        container.removeChild(p);
    }
    const doPrompt = async (text) => {
        const q = await fadeIn(TextType.Prompt, text);
        await _for(2, 1);
        await moveAndDarken(q, 0, -200, 242, 197, 124, 92, 92, 92);
    }
    const doTitle = async (text) => {
        const t = await fadeIn(TextType.Title, text);
        await until(progress);
        fadeOut(t);
        await until(t, "transitionend");
        container.removeChild(t);
    }
    const steps = [
        async () => doTitle("Rip Van Winkle"),
        async () => await doExposition("All who’ve journeyed to the maw of the Hudson remember the Kaatskill mountains. The reef of stone erupts from the ground, burning itself into the eyes of travelers and the minds of locals."),
        async () => await doExposition("Nested at the base of these mountains, hidden and small in the green of the living world, there lies a village of yore."),        
        async () => await doExposition("In this village, for many years since, lives a plain and good-natured character by the name of Rip Van Winkle."),
        async () => await doPrompt(`Your wife is calling for you. \"${wifeAwaken[wifeAnnoy % wifeAwaken.length]}\"`),
        async () => await doChoice("Stay asleep", "Wake up", () => {skipToStep -= 2; karma -= 10; wifeAnnoy++;}, () => {}),
        async () => await doExposition("You open your eyes, stretch out your arms, and swing your legs out of bed."),
        async () => await doPrompt("What are you going to get done today?"),
        async () => await doChoice("Play with your dog", "Tend to your farm", () => choices.wolf = true, () => choices.wolf = false),
        async () => {
            await (choices.wolf ? doExposition("You bring Wolf outside with you.") : doExposition("You walk out into the weed-filled field, thinking about where to start working."));
        },
        async () => {
            await doPrompt("What do you want to do?");
            if(choices.wolf){
                await doChoice("Throw a stick", "Lay in the grass", () => {choices.stick = true; karma += 10;}, () => choices.grass = true);
            } else {
                await doChoice("Pull some weeds", "Lay in the grass", () => {choices.weeds = true; karma += 10;}, () => choices.grass = true);
            }
        },
        async () => {
            if(choices.stick){
                await doExposition("You throw a stick for Wolf to fetch. While you wait for him to return, you take a seat in the grass");
            }
            if(choices.weeds){
                await doExposition("You yank some weeds from the ground, tiring yourself in the process.");
                await doPrompt(`Your wife calls from inside, ${wifeEncourage[wifeProud % wifeEncourage.length]}`);
                wifeProud++;
                await doChoice("Keep working", "Lay in the grass", () => {skipToStep--; karma += 10;}, () => choices.grass = true);
            }
        },
        async () => {
            if(choices.grass){
                await doExposition("You lay in the grass.");
            }
            await doExposition("Wolf runs up to you and begins to lick your face.");
        },
        async () => await doExposition("Almost as if she smelled the happiness, your wife yells from inside to ruin it. \"Maybe you should go hunting today, Rip.\""),
        async () => await doExposition("Reluctantly, you grab your gun and call Wolf to your side."),
        async () => await doPrompt("As you\'re passing the outskirts of the village, you consider sitting on a fallen log and taking a nap."),
        async () => await doChoice("Take a nap", "Continue hunting", () => {choices.nap = true; karma -= 10;}, () => {choices.nap = false; karma += 10;}),
        async () => {
            if(choices.nap){
                await doTitle("Game Over");
                await doExposition("Dame Van Winkle caught you sleeping and it seems like that was the last straw for her.");
                await doExposition("She\'s leaving, and she\'s taking the kids with her.");
                await doPrompt(`Score: ${karma}`);

                container.innerHTML += `
                    <div class="choice choiceContainer">
                        <p class="choice choiceText fancyFont">Play Again?</p>
                    </div>
                `;
                const e = document.querySelectorAll(".choice");
                await new Promise(r => setTimeout(r, 100));
                e.forEach((e) => e.classList.add("fadeIn"));
                await until(progress);
                const pr = document.querySelector(".prompt");
                fadeOut([pr, ...e]);
                await until([pr, ...e], "transitionend");
                document.querySelector(".choiceContainer").removeChild(document.querySelector(".choiceText"));
                container.removeChild(pr);
                container.removeChild(document.querySelector(".choiceContainer"));
                earlyExit = true;
                await _for(500, 0);
            } else {
                await doExposition("Despite the urge to sleep, you decide to keep hunting.");
            }
        },
        async () => await doExposition("You and Wolf venture to one of the highest points on the mountains."),
        async () => await doExposition("Fatigued from your journey so far, you decide to rest on a nearby rock."),
        async () => await doExposition("Through a split in the dense trees, you can see what seemed like all of the great American land in front of you."), 
        async () => await doExposition("A part of the vast Hudson runs below you, extending into the distance and giving the illusion that it goes on forever."),
        async () => await doExposition("The golden leaves rustle in the wind, almost like a lullaby, begging for a lazy man to hear it."),
        async () => {
            if(choices.persist) await doExposition("Are you sure?");
            await doPrompt("Take a nap?");
            await doChoice("Yes", "No", () => {choices.nap = true; karma -= 10;}, () => {choices.persist = true; skipToStep--; karma += 10;});
        },
        async () => await doExposition("..."),
        async () => await doExposition("..."),
        async () => await doExposition("The sound of chirping birds brings you out of your slumber."),
        async () => await doExposition("The same view that you enjoyed while you were drifting off greets you to a new morning. Wolf was just now waking up as well, yawning and stretching his limbs."),
        async () => await doExposition("You gather your possessions and start to walk down the mountain."),
        async () => await doExposition("..."),
        async () => await doExposition("You arrive at your old home to discover that there is nothing recognizable awaiting you."),
        async () => await doExposition(`Your daughter, now twenty years older than when you had last seen her, started ${karma < 20 ? "to berate you." : karma > 40 ? "to cry tears of joy at the return of her father." : "to ask you where you had been."}`),
        async () => await doTitle("End of game."),
        async () => {
            await doPrompt(`Score: ${karma}`);
            
            container.innerHTML += `
                <div class="choice choiceContainer">
                    <p class="choice choiceText fancyFont">Play Again?</p>
                </div>
            `;
            const e = document.querySelectorAll(".choice");
            await new Promise(r => setTimeout(r, 100));
            e.forEach((e) => e.classList.add("fadeIn"));
            await until(progress);
            const pr = document.querySelector(".prompt");
            fadeOut([pr, ...e]);
            await until([pr, ...e], "transitionend");
            document.querySelector(".choiceContainer").removeChild(document.querySelector(".choiceText"));
            container.removeChild(pr);
            container.removeChild(document.querySelector(".choiceContainer"));
            await _for(500, 0);
        }
    ];

    while(1){
        for(; skipToStep < steps.length; skipToStep++) {
            await steps[skipToStep]();
            if(earlyExit) break;
        }
        earlyExit = false;
        skipToStep = 0;
    }
}



start(0)
