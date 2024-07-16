// game.js

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

// Key press states
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    s: false,
    d: false
};

// Player objects
const players = [
    {
        x: fieldWidth / 2,
        y: canvasHeight - 150,
        width: 0,
        height: 0,
        speed: 2,
        team: 'A',
        direction: { x: 0, y: -1 }, // Initial direction
        cooldown: 0
    },
    {
        x: fieldWidth / 2 + 100,
        y: canvasHeight - 200,
        width: 0,
        height: 0,
        speed: 2,
        team: 'A',
        direction: { x: 0, y: -1 }, // Initial direction
        cooldown: 0
    }
];

// Initialize player sizes based on perspective
players.forEach(player => {
    updatePlayerSize(player, canvas);
});

let currentPlayerIndex = 0;

// Ball object
const ball = {
    x: fieldWidth / 2,
    y: fieldHeight / 2,
    width: 10,
    height: 10,
    speed: 10,
    inControl: null,
    vx: 0,
    vy: 0,
    z: 0,   // Initial vertical position
    vz: 0   // Initial vertical velocity
};

// Initialize ball size based on perspective
updateBallSize(ball, canvas);

// Draw outer lines with perspective
function drawField() {
    const fieldYStart = (canvasHeight - fieldHeight) / 2;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    // Draw the perspective field
    ctx.beginPath();
    ctx.moveTo(bottomMargin, fieldYStart + fieldHeight); // Bottom left corner
    ctx.lineTo(fieldWidth - bottomMargin, fieldYStart + fieldHeight); // Bottom right corner
    ctx.lineTo(fieldWidth - topMargin, fieldYStart); // Top right corner
    ctx.lineTo(topMargin, fieldYStart); // Top left corner
    ctx.closePath();
    ctx.stroke();

    // Draw half line
    ctx.beginPath();
    ctx.moveTo((bottomMargin + fieldWidth - bottomMargin) / 2, fieldYStart + fieldHeight);
    ctx.lineTo((topMargin + fieldWidth - topMargin) / 2, fieldYStart);
    ctx.stroke();

    // Draw lines to split the field into four areas
    const quarterWidthBottom = (fieldWidth - 2 * bottomMargin) / 4;
    const quarterWidthTop = (fieldWidth - 2 * topMargin) / 4;

    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(bottomMargin + i * quarterWidthBottom, fieldYStart + fieldHeight);
        ctx.lineTo(topMargin + i * quarterWidthTop, fieldYStart);
        ctx.stroke();
    }
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawField();
    players.forEach((player, index) => {
        if (index === currentPlayerIndex) {
            updatePlayer(player, keys, canvas);
        }
        drawPlayer(ctx, player, index === currentPlayerIndex);
    });
    updateBall(ball, players, currentPlayerIndex, keys, canvas);
    drawBall(ctx, ball);
    requestAnimationFrame(gameLoop);
}

// Handle key down events
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
    if (e.key === 'w') {
        switchPlayer();
    }
});

// Handle key up events
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Switch to the next player
function switchPlayer(newIndex = null) {
    if (newIndex === null) {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    } else {
        currentPlayerIndex = newIndex;
    }
}

gameLoop();
