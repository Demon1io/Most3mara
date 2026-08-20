// --- DOM Elements ---
const stage = document.getElementById('stage');
const characterContainer = document.getElementById('character-container');
const textContainer = document.getElementById('text-container');
const nextBtn = document.getElementById('next-btn');
const choicesContainer = document.getElementById('choices-container');
const inventoryBtn = document.getElementById('inventory-btn');
const inventoryModal = document.getElementById('inventory-modal');
const closeInventoryBtn = document.getElementById('close-inventory-btn');
const moneyDisplay = document.getElementById('money-display');
const minigameContainer = document.getElementById('minigame-container');
const cameraView = document.getElementById('camera-view');
const camLeftBtn = document.getElementById('cam-left');
const camRightBtn = document.getElementById('cam-right');
const camConfirmBtn = document.getElementById('cam-confirm');
const dialogueBox = document.getElementById('dialogue-box');

// --- SVG Character Template ---
const svgCharacter = `
<svg id="character-svg" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
    <!-- Legs -->
    <g id="left-leg" transform="translate(40, 100)">
        <rect x="-10" y="0" width="15" height="40" fill="#2c3e50" rx="3" />
        <rect x="-12" y="35" width="20" height="10" fill="#111" rx="2" />
    </g>
    <g id="right-leg" transform="translate(60, 100)">
        <rect x="-5" y="0" width="15" height="40" fill="#34495e" rx="3" />
        <rect x="-7" y="35" width="20" height="10" fill="#111" rx="2" />
    </g>

    <!-- Body -->
    <rect x="25" y="50" width="50" height="55" fill="#2980b9" rx="5" />
    <!-- Toolbelt -->
    <rect x="23" y="90" width="54" height="10" fill="#8e44ad" rx="2" />
    <rect x="30" y="85" width="10" height="15" fill="#f1c40f" rx="1" />

    <!-- Head -->
    <g id="head-group">
        <rect x="30" y="10" width="40" height="40" fill="#f1c27d" rx="8" />
        <!-- Eyes -->
        <circle cx="42" cy="25" r="4" fill="#000" />
        <circle cx="58" cy="25" r="4" fill="#000" />
        <!-- Hair/Cap -->
        <path d="M 28 20 C 30 5, 70 5, 72 20 Z" fill="#e74c3c" />
        <rect x="25" y="20" width="15" height="5" fill="#e74c3c" rx="2" />
    </g>

    <!-- Arms -->
    <rect x="15" y="55" width="12" height="35" fill="#3498db" rx="4" />
    <rect x="73" y="55" width="12" height="35" fill="#3498db" rx="4" />
</svg>
`;

characterContainer.innerHTML = svgCharacter;

// --- Engine State ---
let currentSceneId = 'scene_1';
let currentTextIndex = 0;
let isTyping = false;
let typewriterInterval = null;

// --- Inventory Logic ---
inventoryBtn.onclick = () => {
    moneyDisplay.innerText = `المال: ${gameState.money} جنيه`;
    inventoryModal.classList.remove('hidden');
};
closeInventoryBtn.onclick = () => {
    inventoryModal.classList.add('hidden');
};

// --- Typewriter Effect ---
function typeWriter(text, callback) {
    textContainer.innerHTML = '';
    isTyping = true;
    let i = 0;

    if (typewriterInterval) clearInterval(typewriterInterval);

    // Fast typewriter (15ms per character)
    typewriterInterval = setInterval(() => {
        textContainer.innerHTML += text.charAt(i);
        i++;
        if (i >= text.length) {
            clearInterval(typewriterInterval);
            isTyping = false;
            if (callback) callback();
        }
    }, 15);
}

// --- Scene Rendering ---
function renderScene(sceneId) {
    const scene = storyData[sceneId];
    if (!scene) {
        console.error("Scene not found:", sceneId);
        return;
    }

    currentSceneId = sceneId;
    currentTextIndex = 0;

    // Call onEnter hook if exists
    if (scene.onEnter) {
        scene.onEnter();
    }

    // Reset UI
    nextBtn.classList.add('hidden');
    choicesContainer.classList.add('hidden');
    choicesContainer.innerHTML = '';
    minigameContainer.classList.add('hidden');

    // Explicitly show character and dialog box by default for non-minigame scenes
    dialogueBox.classList.remove('hidden');
    characterContainer.classList.remove('hidden');

    // Update Background
    stage.className = '';
    if (scene.backgroundClass) {
        stage.classList.add(scene.backgroundClass);
    }

    // Update Character Animation
    characterContainer.className = '';
    if (scene.characterAnimation) {
        characterContainer.classList.add(`char-${scene.characterAnimation}`);
    }

    // Render based on type
    if (scene.type === 'dialogue') {
        renderDialogueText();
    } else if (scene.type === 'minigame') {
        renderMinigame(scene);
    }
}

function renderDialogueText() {
    const scene = storyData[currentSceneId];
    const textSegment = scene.text[currentTextIndex];

    typeWriter(textSegment, () => {
        // When typing finishes
        if (currentTextIndex < scene.text.length - 1) {
            // More text segments available
            nextBtn.classList.remove('hidden');
        } else {
            // End of text segments for this scene
            if (scene.choices) {
                renderChoices(scene.choices);
            } else if (scene.next) {
                nextBtn.classList.remove('hidden');
            }
        }
    });
}

// Next Button Logic
nextBtn.onclick = () => {
    const scene = storyData[currentSceneId];
    nextBtn.classList.add('hidden');

    if (currentTextIndex < scene.text.length - 1) {
        currentTextIndex++;
        renderDialogueText();
    } else if (scene.next) {
        renderScene(scene.next);
    }
};

// --- Choices Rendering ---
function renderChoices(choices) {
    choicesContainer.innerHTML = '';
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-card';
        btn.innerText = choice.text;
        btn.onclick = () => {
            if (choice.onSelect) choice.onSelect();
            renderScene(choice.nextScene);
        };
        choicesContainer.appendChild(btn);
    });
    choicesContainer.classList.remove('hidden');
}

// --- Minigame (Camera Adjust) ---
let camPosition = 80; // percentage
function renderMinigame(scene) {
    // Completely hide character and dialogue box
    characterContainer.classList.add('hidden');
    dialogueBox.classList.add('hidden');

    // Show minigame UI
    minigameContainer.classList.remove('hidden');
    camConfirmBtn.classList.add('hidden');

    // Reset camera pos
    camPosition = 80;
    cameraView.style.left = `${camPosition}%`;

    camLeftBtn.onclick = () => moveCam(-10);
    camRightBtn.onclick = () => moveCam(10);

    camConfirmBtn.onclick = () => {
        // Cleanup minigame state
        minigameContainer.classList.add('hidden');
        renderScene(scene.next);
    };
}

function moveCam(amount) {
    camPosition += amount;
    // Bounds
    if (camPosition < 0) camPosition = 0;
    if (camPosition > 100) camPosition = 100;

    cameraView.style.left = `${camPosition}%`;

    // Check if aligned with door target (which is at 20%)
    if (camPosition === 20) {
        camConfirmBtn.classList.remove('hidden');
    } else {
        camConfirmBtn.classList.add('hidden');
    }
}


// --- Start Game ---
window.onload = () => {
    renderScene('scene_1');
};
