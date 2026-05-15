gsap.registerPlugin(ScrollTrigger);

// --- PRELOADER & CURSOR LOGIC ---
const totalImages = 240 + 101;
let loadedImages = 0;
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');

function onImageLoad() {
    loadedImages++;
    const percent = Math.floor((loadedImages / totalImages) * 100);
    progressText.innerText = percent;
    progressBar.style.width = percent + "%";

    if (loadedImages === totalImages) {
        // Hide preloader when done
        gsap.to("#preloader", {
            opacity: 0,
            duration: 1,
            delay: 0.5,
            onComplete: () => document.getElementById("preloader").style.display = "none"
        });
        render1();
        render2();
    }
}

// Custom Cursor
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
document.addEventListener('mousemove', e => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 });
    gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.1 });
});
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('expand');
        follower.classList.add('expand');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('expand');
        follower.classList.remove('expand');
    });
});


// --- SETUP FOR CANVAS 1 (Showcase / img folder) ---
const canvas1 = document.getElementById("animationCanvas");
const context1 = canvas1.getContext("2d");
const frameCount1 = 240;
const currentFrame1 = index => `img/ezgif-frame-${(index).toString().padStart(3, '0')}.jpg`;
const images1 = [];
const frameInfo1 = { frame: 1 };

for (let i = 1; i <= frameCount1; i++) {
    const img = new Image();
    img.onload = onImageLoad;
    img.src = currentFrame1(i);
    images1.push(img);
}

// --- SETUP FOR CANVAS 2 (Order / img2 folder) ---
const canvas2 = document.getElementById("animationCanvas2");
const context2 = canvas2.getContext("2d");
const frameCount2 = 101;
const currentFrame2 = index => `img2/ezgif-frame-${(index).toString().padStart(3, '0')}.jpg`;
const images2 = [];
const frameInfo2 = { frame: 1 };

for (let i = 1; i <= frameCount2; i++) {
    const img = new Image();
    img.onload = onImageLoad;
    img.src = currentFrame2(i);
    images2.push(img);
}

// Resize logic for both canvases and footer
function resizeElements() {
    canvas1.width = window.innerWidth;
    canvas1.height = window.innerHeight;
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    render1();
    render2();

    // Parallax Footer Spacer Resize
    const footerHeight = document.querySelector('.footer').offsetHeight;
    document.querySelector('.footer-spacer').style.height = footerHeight + "px";
}
window.addEventListener("resize", resizeElements);
resizeElements(); // Initial call

// Render Canvas 1
function render1() {
    let frameIndex = Math.round(frameInfo1.frame) - 1;
    frameIndex = Math.max(0, Math.min(frameCount1 - 1, frameIndex)); // Clamp to valid array bounds
    const img = images1[frameIndex];
    if (!img || !img.complete) return;
    const ratio = Math.max(canvas1.width / img.width, canvas1.height / img.height);
    const centerShift_x = (canvas1.width - img.width * ratio) / 2;
    const centerShift_y = (canvas1.height - img.height * ratio) / 2;
    context1.clearRect(0, 0, canvas1.width, canvas1.height);
    context1.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

// Render Canvas 2
function render2() {
    let frameIndex = Math.round(frameInfo2.frame) - 1;
    frameIndex = Math.max(0, Math.min(frameCount2 - 1, frameIndex)); // Clamp to valid array bounds
    const img = images2[frameIndex];
    if (!img || !img.complete) return;
    const ratio = Math.max(canvas2.width / img.width, canvas2.height / img.height);
    const centerShift_x = (canvas2.width - img.width * ratio) / 2;
    const centerShift_y = (canvas2.height - img.height * ratio) / 2;
    context2.clearRect(0, 0, canvas2.width, canvas2.height);
    context2.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}


// --- TIMELINES ---

// 1. Canvas 1 Animation
gsap.to(frameInfo1, {
    frame: frameCount1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
        trigger: "#showcase",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: render1
    }
});

// Dynamic Canvas Blur: blur when text is on screen (roughly 15% to 75% of scroll)
gsap.to(canvas1, {
    scrollTrigger: {
        trigger: "#showcase",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    },
    keyframes: {
        "0%": { filter: "blur(0px)" },
        "15%": { filter: "blur(8px)" },  // Text 1 starts
        "75%": { filter: "blur(8px)" },  // Text 3 ends
        "90%": { filter: "blur(0px)" },  // End of showcase
        "100%": { filter: "blur(0px)" }
    }
});

// 2. Scrolling Text Animations for Canvas 1
const textItems = gsap.utils.toArray('.scroll-text-item');
textItems.forEach((item, i) => {
    const tlText = gsap.timeline({
        scrollTrigger: {
            trigger: "#showcase",
            start: `top+=${i * 20}% top`,
            end: `top+=${(i + 2) * 20}% top`,
            scrub: 1
        }
    });

    const isLeft = i % 2 === 0;
    const startX = isLeft ? -150 : 150;

    tlText.fromTo(item,
        { opacity: 0, x: startX, yPercent: -50 },
        { opacity: 1, x: 0, yPercent: -50, duration: 1, ease: "power2.out" }
    ).to(item,
        { opacity: 0, x: startX * -1, yPercent: -50, duration: 1, ease: "power2.in" },
        "+=0.5"
    );
});

// 3. Canvas 2 Animation & Button Logic
const placeOrderBtn = document.getElementById("placeOrderBtn");

gsap.to(frameInfo2, {
    frame: frameCount2,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
        trigger: "#order",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
        onUpdate: () => {
            render2();

            // Button Logic
            const frame = frameInfo2.frame;
            if (frame > 20 && frame < 85) {
                placeOrderBtn.classList.add("visible");
                placeOrderBtn.classList.remove("blur-out");
            } else if (frame >= 85) {
                placeOrderBtn.classList.add("blur-out");
                placeOrderBtn.classList.remove("visible");
            } else {
                placeOrderBtn.classList.remove("visible");
                placeOrderBtn.classList.remove("blur-out");
            }
        }
    }
});
