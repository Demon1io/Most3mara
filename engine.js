// --- DOM Elements ---
const stage = document.getElementById('stage');
const character = document.getElementById('character');
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

    // Very fast typewriter (15ms per character)
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

    // Update Background
    stage.className = '';
    if (scene.backgroundClass) {
        stage.classList.add(scene.backgroundClass);
    }

    // Update Character Animation
    character.className = '';
    if (scene.characterAnimation) {
        character.classList.add(`char-${scene.characterAnimation}`);
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
    // Show text briefly
    textContainer.innerHTML = scene.text[0];

    // Show minigame UI
    minigameContainer.classList.remove('hidden');
    camConfirmBtn.classList.add('hidden');

    // Reset camera pos
    camPosition = 80;
    cameraView.style.left = `${camPosition}%`;

    camLeftBtn.onclick = () => moveCam(-10);
    camRightBtn.onclick = () => moveCam(10);

    camConfirmBtn.onclick = () => {
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
