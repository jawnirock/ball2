// globals.js

// Define global variables and objects

const canvas = document.getElementById('soccerField');
const ctx = canvas.getContext('2d');

// Field dimensions
const fieldWidth = canvas.width * 0.7;  // 70% of the canvas width
const fieldHeight = 500; // Keep field height the same
const canvasHeight = canvas.height;
const canvasWidth = canvas.width; // Added canvasWidth to reference the full canvas width

// Goal line dimensions
const goalLineWidth = 2; // 20% of the white line width
const goalLineLength = 50; // Length of the goal line

// Scores
let scoreTeamA = 0;
let scoreTeamB = 0;
let goalScored = false; // Flag to prevent multiple goals from being counted during the delay

// Key press states
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    s: false,
    d: false,
    a: false,
    w: false
};


// Player objects

// globals.js

const spriteImages = {
    // Team A sprites
    a_idle: new Image(),
    a_running_left: new Image(),
    a_running_right: new Image(),
    a_kicking: new Image(),
    a_passing: new Image(),
    a_tackling: new Image(),
    a_tackled: new Image(),
    
    // Team B sprites
    b_idle: new Image(),
    b_running_left: new Image(),
    b_running_right: new Image(),
    b_kicking: new Image(),
    b_passing: new Image(),
    b_tackling: new Image(),
    b_tackled: new Image()
};

// Load images for Team A
spriteImages.a_idle.src = 'images/a_idle.png';
spriteImages.a_running_left.src = 'images/a_running_left.png';
spriteImages.a_running_right.src = 'images/a_running_right.png';
spriteImages.a_kicking.src = 'images/a_kicking.png';
spriteImages.a_passing.src = 'images/a_passing.png';
spriteImages.a_tackling.src = 'images/a_tackling.png';
spriteImages.a_tackled.src = 'images/a_tackled.png';

// Load images for Team B
spriteImages.b_idle.src = 'images/b_idle.png';
spriteImages.b_running_left.src = 'images/b_running_left.png';
spriteImages.b_running_right.src = 'images/b_running_right.png';
spriteImages.b_kicking.src = 'images/b_kicking.png';
spriteImages.b_passing.src = 'images/b_passing.png';
spriteImages.b_tackling.src = 'images/b_tackling.png';
spriteImages.b_tackled.src = 'images/b_tackled.png';



// Player objects
const startingPositions = [
    // Team A starting positions (on the left side of the field)
    // Defenders
    { team: "a", role: "defender", x: fieldWidth * 0.153 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.25 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "defender", x: fieldWidth * 0.152 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.4 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "defender", x: fieldWidth * 0.153 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.55 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "defender", x: fieldWidth * 0.155 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.7 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "defender", x: fieldWidth * 0.151 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.85 + (canvasHeight - fieldHeight) / 2 },

    // Midfielders
    { team: "a", role: "midfielder", x: fieldWidth * 0.32 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.25 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "midfielder", x: fieldWidth * 0.31 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.4 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "midfielder", x: fieldWidth * 0.32 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.55 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "midfielder", x: fieldWidth * 0.33 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.7 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "midfielder", x: fieldWidth * 0.32 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.85 + (canvasHeight - fieldHeight) / 2 },

    // Attackers
    { team: "a", role: "forward", x: fieldWidth * 0.453 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.25 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "forward", x: fieldWidth * 0.452 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.4 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "forward", x: fieldWidth * 0.453 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.55 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "forward", x: fieldWidth * 0.452 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.7 + (canvasHeight - fieldHeight) / 2 },
    { team: "a", role: "forward", x: fieldWidth * 0.451 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.85 + (canvasHeight - fieldHeight) / 2 },

    // Team B starting positions (on the right side of the field, mirrored)
    // Defenders
    { team: "b", role: "defender", x: fieldWidth * 0.852 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.25 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "defender", x: fieldWidth * 0.853 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.4 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "defender", x: fieldWidth * 0.855 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.55 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "defender", x: fieldWidth * 0.854 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.7 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "defender", x: fieldWidth * 0.851 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.85 + (canvasHeight - fieldHeight) / 2 },

    // Midfielders
    { team: "b", role: "midfielder", x: fieldWidth * 0.71 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.25 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "midfielder", x: fieldWidth * 0.72 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.4 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "midfielder", x: fieldWidth * 0.73 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.55 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "midfielder", x: fieldWidth * 0.71 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.7 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "midfielder", x: fieldWidth * 0.72 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.85 + (canvasHeight - fieldHeight) / 2 },

    // Attackers
    { team: "b", role: "forward", x: fieldWidth * 0.553 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.25 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "forward", x: fieldWidth * 0.555 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.4 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "forward", x: fieldWidth * 0.553 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.55 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "forward", x: fieldWidth * 0.552 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.7 + (canvasHeight - fieldHeight) / 2 },
    { team: "b", role: "forward", x: fieldWidth * 0.555 + (canvasWidth - fieldWidth) / 2, y: fieldHeight * 0.85 + (canvasHeight - fieldHeight) / 2 }
];



// Extend the players with a 'state' property
const players = startingPositions.map((pos, index) => ({
    x: pos.x,
    y: pos.y,
    width: 0,
    height: 0,
    speed: 2,
    team: pos.team,
    role: pos.role,
    direction: { x: 0, y: -1 },
    cooldown: 0,
    canMove: true,
    state: pos.team === "a" ? "a_idle" : "b_idle"  // Initial state is idle
}));


let lastSwitchedPlayerIndex = 0;

// Flag to track if the first move has been made
let firstMoveMade = false;

// Function to update player size based on y position for perspective effect
function updatePlayerSize(player, canvas) {
    player.width = 15;
    player.height = 28;
}

// Initialize player sizes based on perspective
players.forEach(player => {
    updatePlayerSize(player, canvas);
});

// Ball object
const ball = {
    x: fieldWidth / 2 + (canvasWidth - fieldWidth) / 2,  // Center of the field horizontally
    y: fieldHeight / 2 + (canvasHeight - fieldHeight) / 2,  // Center of the field vertically
    width: 7,
    height: 7,
    speed: 10,
    inControl: null,
    vx: 0,
    vy: 0,
    z: 0,   // Initial vertical position
    vz: 0   // Initial vertical velocity
};



// Initialize current player index
let currentPlayerIndex = 0;
