// globals.js

// Define global variables and objects

const canvas = document.getElementById('soccerField');
const ctx = canvas.getContext('2d');

// Field dimensions
const fieldWidth = canvas.width;
const fieldHeight = 500; // Updated field height
const canvasHeight = canvas.height;

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
const players = [
    // Team A
    {
        x: fieldWidth / 3,
        y: canvasHeight - 350,
        width: 0,
        height: 0,
        speed: 2,
        team: 'A',
        direction: { x: 0, y: -1 },
        cooldown: 0,
        canMove: true
    },
    {
        x: fieldWidth / 3 - 10,
        y: canvasHeight - 250,
        width: 0,
        height: 0,
        speed: 2,
        team: 'A',
        direction: { x: 0, y: -1 },
        cooldown: 0,
        canMove: true
    },
    {
        x: fieldWidth / 4 + 80,
        y: canvasHeight - 140,
        width: 0,
        height: 0,
        speed: 2,
        team: 'A',
        direction: { x: 0, y: -1 },
        cooldown: 0,
        canMove: true
    },
    {
        x: fieldWidth / 4 + 120,
        y: canvasHeight - 450,
        width: 0,
        height: 0,
        speed: 2,
        team: 'A',
        direction: { x: 0, y: -1 },
        cooldown: 0,
        canMove: true
    },
    {
        x: fieldWidth / 4 + 140,
        y: canvasHeight - 530,
        width: 0,
        height: 0,
        speed: 2,
        team: 'A',
        direction: { x: 0, y: -1 },
        cooldown: 0,
        canMove: true
    },
    // Team B
    {
        x: 2 * fieldWidth / 3,
        y: canvasHeight - 350,
        width: 0,
        height: 0,
        speed: 2,
        team: 'B',
        direction: { x: 0, y: -1 },
        cooldown: 0,
        canMove: true
    },
    {
        x: 2 * fieldWidth / 3 + 10,
        y: canvasHeight - 250,
        width: 0,
        height: 0,
        speed: 2,
        team: 'B',
        direction: { x: 0, y: -1 },
        cooldown: 0,
        canMove: true
    },
    {
        x: 3 * fieldWidth / 4 - 80,
        y: canvasHeight - 140,
        width: 0,
        height: 0,
        speed: 2,
        team: 'B',
        direction: { x: 0, y: -1 },
        cooldown: 0,
        canMove: true
    },
    {
        x: 3 * fieldWidth / 4 - 120,
        y: canvasHeight - 450,
        width: 0,
        height: 0,
        speed: 2,
        team: 'B',
        direction: { x: 0, y: -1 },
        cooldown: 0,
        canMove: true
    },
    {
        x: 3 * fieldWidth / 4 - 140,
        y: canvasHeight - 530,
        width: 0,
        height: 0,
        speed: 2,
        team: 'B',
        direction: { x: 0, y: -1 },
        cooldown: 0,
        canMove: true
    }
];


// Function to update player size based on y position for perspective effect
function updatePlayerSize(player, canvas) {
    const sizeFactor = 1 + (player.y / canvas.height);
    player.width = 15 * sizeFactor;
    player.height = 28 * sizeFactor;
}

// Initialize player sizes based on perspective
players.forEach(player => {
    updatePlayerSize(player, canvas);
});

// Ball object
const ball = {
    x: fieldWidth / 2,
    y: fieldHeight / 2 + 70,
    width: 7,
    height: 7,
    speed: 10,
    inControl: null,
    vx: 0,
    vy: 0,
    z: 0,   // Initial vertical position
    vz: 0   // Initial vertical velocity
};

// Function to update ball size based on y position for perspective effect
function updateBallSize(ball, canvas) {
    const sizeFactor = 1 + (ball.y / canvas.height);
    ball.width = 7 * sizeFactor;
    ball.height = 7 * sizeFactor;
}

// Initialize ball size based on perspective
updateBallSize(ball, canvas);

// Initialize current player index
let currentPlayerIndex = 0;
