// --- Game State ---
const gameState = {
    day: 1,
    maxDays: 30,
    population: 100,
    resources: {
        food: 50,
        water: 50,
        energy: 50,
        morale: 50
    },
    maxResource: 100
};

// --- Management Team ---
const team = [
    {
        id: 'resource_manager',
        name: 'مسؤول الموارد',
        emoji: '👨‍🌾',
        role: 'زيادة إنتاج الطعام والمياه بنسبة 10%',
        effect: (res) => {
            // This effect will be applied during production actions
        }
    },
    {
        id: 'security_officer',
        name: 'مسؤول الأمن',
        emoji: '👮',
        role: 'تقليل استهلاك الطاقة بنسبة 10%',
        effect: (res) => {
            // Effect applied during consumption
        }
    },
    {
        id: 'morale_officer',
        name: 'مسؤول المعنويات',
        emoji: '🎉',
        role: 'تقليل خسارة المعنويات بنسبة 20%',
        effect: (res) => {
            // Effect applied during morale loss
        }
    }
];

// --- Daily Events ---
const dailyEvents = [
    {
        title: 'عاصفة رملية',
        description: 'عاصفة رملية قوية تضرب المستعمرة. ماذا يجب أن نفعل؟',
        choices: [
            {
                text: 'تشغيل دروع الحماية (يستهلك طاقة)',
                action: () => {
                    updateResource('energy', -15);
                    updateResource('morale', 5);
                }
            },
            {
                text: 'توفير الطاقة وتحمل العاصفة (يؤثر على المعنويات)',
                action: () => {
                    updateResource('morale', -15);
                }
            }
        ]
    },
    {
        title: 'اكتشاف نبع مياه جوفي',
        description: 'فريق الاستكشاف وجد نبع مياه محتمل. هل نرسل معدات الحفر؟',
        choices: [
            {
                text: 'إرسال المعدات (يستهلك طاقة، فرصة لزيادة المياه)',
                action: () => {
                    updateResource('energy', -10);
                    // 70% chance of success
                    if (Math.random() > 0.3) {
                        updateResource('water', 25);
                    }
                }
            },
            {
                text: 'تجاهل الأمر',
                action: () => {
                    // No effect
                }
            }
        ]
    },
    {
        title: 'عطل في مولد الطعام',
        description: 'جزء من نظام الزراعة المائية تعطل.',
        choices: [
            {
                text: 'إصلاح سريع (يستهلك طاقة)',
                action: () => {
                    updateResource('energy', -5);
                    updateResource('food', -5); // Small loss still occurs
                }
            },
            {
                text: 'تجاهل العطل حالياً (خسارة طعام أكبر)',
                action: () => {
                    updateResource('food', -20);
                }
            }
        ]
    }
];

// Helper to update resources and clamp them
function updateResource(type, amount) {
    gameState.resources[type] += amount;

    // Apply bounds (0 to maxResource)
    if (gameState.resources[type] > gameState.maxResource) {
        gameState.resources[type] = gameState.maxResource;
    } else if (gameState.resources[type] < 0) {
        gameState.resources[type] = 0;
    }
}

// --- UI Rendering ---
function renderUI() {
    // Update top status
    document.getElementById('day-display').innerText = `اليوم: ${gameState.day} / ${gameState.maxDays}`;
    document.getElementById('population-display').innerText = `السكان: ${Math.floor(gameState.population)} 🧑‍🤝‍🧑`;

    // Update resources
    const resources = ['food', 'water', 'energy', 'morale'];
    resources.forEach(res => {
        const value = Math.floor(gameState.resources[res]);
        const progressEl = document.getElementById(`res-${res}`);
        const textEl = document.getElementById(`val-${res}`);

        progressEl.value = value;
        textEl.innerText = value;

        if (value < 20) {
            progressEl.classList.add('low');
        } else {
            progressEl.classList.remove('low');
        }
    });
}

function renderTeam() {
    const container = document.getElementById('team-container');
    container.innerHTML = ''; // Clear existing

    team.forEach(member => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${member.emoji} ${member.name}</h3>
            <p>${member.role}</p>
        `;
        container.appendChild(card);
    });
}

// --- Open Actions ---
const openActions = [
    {
        id: 'produce_water',
        name: 'إنتاج المياه 💧',
        desc: 'استهلاك 10 طاقة لإنتاج 15 مياه',
        cost: { energy: 10 },
        gain: { water: 15 },
        execute: () => {
            if (gameState.resources.energy >= 10) {
                updateResource('energy', -10);

                // Apply manager effect
                let gain = 15;
                gain = gain * 1.1; // Resource manager effect (+10%)

                updateResource('water', gain);
                logAction(`تم إنتاج ${Math.floor(gain)} مياه مقابل 10 طاقة.`);
                renderUI();
            } else {
                alert('طاقة غير كافية!');
            }
        }
    },
    {
        id: 'produce_food',
        name: 'زراعة طعام 🍔',
        desc: 'استهلاك 15 مياه لإنتاج 20 طعام',
        cost: { water: 15 },
        gain: { food: 20 },
        execute: () => {
            if (gameState.resources.water >= 15) {
                updateResource('water', -15);

                // Apply manager effect
                let gain = 20;
                gain = gain * 1.1; // Resource manager effect (+10%)

                updateResource('food', gain);
                logAction(`تم زراعة ${Math.floor(gain)} طعام مقابل 15 مياه.`);
                renderUI();
            } else {
                alert('مياه غير كافية!');
            }
        }
    },
    {
        id: 'scout',
        name: 'استكشاف 🗺️',
        desc: 'استهلاك 10 طعام و 10 مياه للبحث عن طاقة',
        cost: { food: 10, water: 10 },
        execute: () => {
            if (gameState.resources.food >= 10 && gameState.resources.water >= 10) {
                updateResource('food', -10);
                updateResource('water', -10);

                const found = Math.random() > 0.4;
                if (found) {
                    const energyFound = 20 + Math.floor(Math.random() * 10);
                    updateResource('energy', energyFound);
                    logAction(`نجح الاستكشاف! تم العثور على ${energyFound} طاقة.`);
                } else {
                    logAction('فشل الاستكشاف، لم يتم العثور على شيء.');
                }
                renderUI();
            } else {
                alert('موارد غير كافية للاستكشاف!');
            }
        }
    }
];

function renderActions() {
    const container = document.getElementById('actions-container');
    container.innerHTML = ''; // Clear existing

    openActions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerHTML = `<strong>${action.name}</strong><br><small>${action.desc}</small>`;
        btn.onclick = action.execute;
        container.appendChild(btn);
    });
}

function logAction(msg) {
    // Basic alert for now, could be replaced with a log UI element later
    console.log(msg);
    // Let's add a small log UI section in the DOM dynamically
    let logContainer = document.getElementById('action-logs');
    if (!logContainer) {
        logContainer = document.createElement('div');
        logContainer.id = 'action-logs';
        logContainer.className = 'log-section';
        document.querySelector('.actions-section').appendChild(logContainer);
    }

    const logEntry = document.createElement('p');
    logEntry.innerText = `[اليوم ${gameState.day}] ${msg}`;
    logContainer.prepend(logEntry); // Add to top
}

// Initial render
window.onload = () => {
    renderUI();
    renderTeam();
    renderActions();
};


// --- Core Loop (Day Progression) ---
function endDay() {
    // 1. Trigger random event for the day
    triggerRandomEvent();
    // (Note: The actual day progression logic is moved to continueNextDay,
    // which will be called after the user makes a choice in the event modal)
}

function triggerRandomEvent() {
    const eventIndex = Math.floor(Math.random() * dailyEvents.length);
    const event = dailyEvents[eventIndex];

    document.getElementById('event-title').innerText = event.title;
    document.getElementById('event-description').innerText = event.description;

    const choicesContainer = document.getElementById('event-choices');
    choicesContainer.innerHTML = '';

    event.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = choice.text;
        btn.onclick = () => {
            choice.action();
            logAction(`قرار الحدث: ${choice.text}`);
            closeEventModal();
            continueNextDay();
        };
        choicesContainer.appendChild(btn);
    });

    document.getElementById('event-modal').classList.remove('hidden');
    // Disable next day button while modal is open
    document.getElementById('next-day-btn').disabled = true;
}

function closeEventModal() {
    document.getElementById('event-modal').classList.add('hidden');
    document.getElementById('next-day-btn').disabled = false;
}

function continueNextDay() {
    // 2. Consume Resources based on population
    // Base consumption per 100 population
    let foodCons = 10 * (gameState.population / 100);
    let waterCons = 10 * (gameState.population / 100);
    let energyCons = 10 * (gameState.population / 100);

    // Apply security officer effect to energy consumption (-10%)
    energyCons = energyCons * 0.9;

    updateResource('food', -foodCons);
    updateResource('water', -waterCons);
    updateResource('energy', -energyCons);

    // 3. Handle Depletion Penalties
    let populationLoss = 0;
    let moraleLoss = 0;

    if (gameState.resources.food <= 0) {
        populationLoss += 5;
        moraleLoss += 10;
        logAction("المستعمرة تعاني من الجوع! فقدنا بعض السكان.");
    }
    if (gameState.resources.water <= 0) {
        populationLoss += 5;
        moraleLoss += 10;
        logAction("المستعمرة تعاني من العطش! فقدنا بعض السكان.");
    }
    if (gameState.resources.energy <= 0) {
        moraleLoss += 5;
        logAction("انقطاع تام للطاقة! المعنويات تنخفض.");
    }

    // Default daily morale drain
    moraleLoss += 2;

    // Apply morale officer effect (-20% morale loss)
    moraleLoss = moraleLoss * 0.8;
    updateResource('morale', -moraleLoss);

    if (gameState.resources.morale <= 0) {
        populationLoss += 2;
        logAction("المعنويات منهارة تماماً! بدأ الناس في مغادرة المستعمرة أو الاستسلام.");
    }

    gameState.population -= populationLoss;
    if (gameState.population < 0) gameState.population = 0;

    // 4. Advance Day
    gameState.day++;

    // 5. Check Win/Loss conditions
    if (gameState.population <= 0) {
        renderUI();
        alert("انتهت اللعبة! لم يتبق أحد في المستعمرة.");
        document.getElementById('next-day-btn').disabled = true;
        // Disable open actions
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => btn.disabled = true);
        return;
    }

    if (gameState.day > gameState.maxDays) {
        renderUI();
        alert("مبروك! لقد نجحت في النجاة لمدة 30 يوماً!");
        document.getElementById('next-day-btn').disabled = true;
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => btn.disabled = true);
        return;
    }

    logAction("بدأ يوم جديد.");
    renderUI();
}

// Bind End Day Button
document.getElementById('next-day-btn').addEventListener('click', endDay);
