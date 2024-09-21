// globals.js

// Define global variables and objects

const canvas = document.getElementById('soccerField');
const ctx = canvas.getContext('2d');

// Field dimensions
const fieldWidth = canvas.width * 0.9;  // 90% of the canvas width
const fieldHeight = 500; // Keep field height the same
const canvasHeight = canvas.height;
const canvasWidth = canvas.width; // Added canvasWidth to reference the full canvas width


// Increased Perspective effect settings
const topMargin = 200;
const bottomMargin = 50;
const fieldTopWidth = fieldWidth - 2 * topMargin;
const fieldBottomWidth = fieldWidth - 2 * bottomMargin;

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
    canMove: true
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
