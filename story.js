// --- Player State ---
let gameState = {
    money: 0,
    inventory: []
};

// --- Story Data ---
// This is decoupled from the engine.
// Each key is a scene ID.
// Properties:
// - type: 'dialogue', 'minigame', 'animation'
// - text: Array of text segments for typewriter effect
// - characterAnimation: 'idle', 'walk', 'shock'
// - backgroundClass: CSS class to change the placeholder background
// - choices: Array of choice objects { text, nextScene, onSelect: function (optional) }
// - minigame: object describing minigame config if type is 'minigame'
// - next: Next scene ID if there are no choices.

const storyData = {
    "scene_1": {
        type: "dialogue",
        text: ["أنا فني تركيب كاميرات مراقبة.", "حياتي كانت عادية جداً... لحد اليوم ده."],
        characterAnimation: "idle",
        backgroundClass: "bg-street",
        next: "scene_2"
    },
    "scene_2": {
        type: "dialogue",
        text: ["رحت أركب كاميرا عادية في محل كالمعتاد.", "خلصت الشغل، ورجعت المكتب."],
        characterAnimation: "walk",
        backgroundClass: "bg-office",
        next: "scene_3"
    },
    "scene_3": {
        type: "dialogue",
        text: ["في المكتب، استلمت أوردر جديد.", "تركيب كاميرا في شركة لسه تحت الإنشاء... الشروط: لازم الكاميرا تجيب الباب."],
        characterAnimation: "idle",
        backgroundClass: "bg-office",
        next: "scene_4"
    },
    "scene_4": {
        type: "minigame",
        minigameType: "camera_adjust",
        text: ["وجه الكاميرا ناحية الباب واضغط تأكيد."],
        backgroundClass: "bg-company",
        next: "scene_5"
    },
    "scene_5": {
        type: "dialogue",
        text: [
            "شغل ممتاز.",
            "استلمت الأجرة بتاعتي (250 جنيه).",
            "لكن صاحب الشركة وقفني وعرض عليا عرض غريب...",
            '"إيه رأيك تاخد 1000 جنيه كمان، وتركبلي كاميرا في بيتي الشخصي؟"'
        ],
        characterAnimation: "idle",
        backgroundClass: "bg-company",
        onEnter: () => { gameState.money += 250; },
        choices: [
            {
                text: "قبول العرض (الذهاب للبيت)",
                nextScene: "scene_6"
            },
            {
                text: "رفض (الرفض مؤقت، سأذهب على أي حال)",
                nextScene: "scene_6"
            }
        ]
    },
    "scene_6": {
        type: "dialogue",
        text: [
            "وصلت البيت المتفق عليه...",
            "دخلت... بس اللي لقيته جوه مكنش مجرد بيت.",
            "كان في ناس غريبة... شكلهم مش طبيعي... بيسموا نفسهم 'مكتب الرصد'."
        ],
        characterAnimation: "shock", // Visual shock animation
        backgroundClass: "bg-house",
        next: "scene_7"
    },
    "scene_7": {
        type: "dialogue",
        text: [
            "قعدوا معايا وعرضوا العرض الحقيقي.",
            '"عايزينك تجيب لنا تسجيلات الكاميرات اللي بتركبها في الشركات."',
            '"هندفعلك كويس... ده بس عشان نراقب السرقات، متقلقش."',
            "المقابل: 1000 جنيه."
        ],
        characterAnimation: "idle",
        backgroundClass: "bg-house",
        choices: [
            {
                text: "قبول (أخذ 1000 جنيه)",
                nextScene: "scene_end",
                onSelect: () => { gameState.money += 1000; }
            },
            {
                text: "رفض العرض",
                nextScene: "scene_7_convince"
            }
        ]
    },
    "scene_7_convince": {
        type: "dialogue",
        text: [
            "حاولوا يقنعوني أكتر...",
            '"فكر كويس، مفيش خطر عليك، والمبلغ ممكن يزيد..."',
            '"هنديك 1500 جنيه. إيه رأيك؟"'
        ],
        characterAnimation: "idle",
        backgroundClass: "bg-house",
        choices: [
            {
                text: "الموافقة أخيرًا (أخذ 1500 جنيه)",
                nextScene: "scene_end",
                onSelect: () => { gameState.money += 1500; }
            }
        ]
    },
    "scene_end": {
        type: "dialogue",
        text: [
            "وافقت...",
            "ودي كانت بداية دخولي لعالم 'مكتب الرصد'."
        ],
        characterAnimation: "idle",
        backgroundClass: "bg-house",
        next: null // End of current chapter
    }
};
