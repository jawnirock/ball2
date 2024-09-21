// game.js

// Draw outer lines with perspective
function drawField() {
    const fieldYStart = (canvasHeight - fieldHeight) / 2;
    const fieldXStart = (canvasWidth - fieldWidth) / 2;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    // Draw the field rectangle
    ctx.strokeRect(fieldXStart, fieldYStart, fieldWidth, fieldHeight);

    // Draw half line
    ctx.beginPath();
    ctx.moveTo(fieldXStart + fieldWidth / 2, fieldYStart);
    ctx.lineTo(fieldXStart + fieldWidth / 2, fieldYStart + fieldHeight);
    ctx.stroke();

    // Draw lines to split the field into four areas
    for (let i = 1; i < 4; i++) {
        const xPos = fieldXStart + (i * fieldWidth) / 4;
        ctx.beginPath();
        ctx.moveTo(xPos, fieldYStart);
        ctx.lineTo(xPos, fieldYStart + fieldHeight);
        ctx.stroke();
    }

    // Draw goal lines
    drawGoalLines(fieldXStart, fieldYStart);

    // Draw scores
    drawScores();
}
// Draw goal lines
function drawGoalLines(fieldXStart, fieldYStart) {
    ctx.strokeStyle = '#FF0000'; // Red color for goal lines
    ctx.lineWidth = goalLineWidth; // Goal line width (modify this if needed)

    // Set goal positions at the center of each end line
    const goalHeight = 100; // Keep the current height of the goal
    const goalWidth = 5;    // Set goal width to 5 units

    const goalStartY = fieldYStart + (fieldHeight - goalHeight) / 2;

    // Left goal (adjust the width here)
    ctx.beginPath();
    ctx.moveTo(fieldXStart - 5, goalStartY);  // Start at the left goal line
    ctx.lineTo(fieldXStart - 5, goalStartY + goalHeight);  // Vertical line for the left goal
    ctx.lineTo(fieldXStart - 5 + goalWidth, goalStartY + goalHeight);  // Extend horizontally 5 units
    ctx.lineTo(fieldXStart - 5 + goalWidth, goalStartY);  // Complete the rectangle
    ctx.closePath();
    ctx.stroke();

    // Right goal (adjust the width here)
    ctx.beginPath();
    ctx.moveTo(fieldXStart + 5 + fieldWidth, goalStartY);  // Start at the right goal line
    ctx.lineTo(fieldXStart + 5 + fieldWidth, goalStartY + goalHeight);  // Vertical line for the right goal
    ctx.lineTo(fieldXStart + 5 + fieldWidth - goalWidth, goalStartY + goalHeight);  // Extend horizontally 5 units
    ctx.lineTo(fieldXStart + 5 + fieldWidth - goalWidth, goalStartY);  // Complete the rectangle
    ctx.closePath();
    ctx.stroke();
}


function drawScores() {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(`Team A: ${scoreTeamA}`, 10, 30);
    ctx.fillText(`Team B: ${scoreTeamB}`, 10, 60);
}

// Updated goal detection logic
function checkGoal() {
    if (goalScored) return; // Prevent multiple goals from being counted during the delay

    const fieldYStart = (canvasHeight - fieldHeight) / 2;
    const fieldXStart = (canvasWidth - fieldWidth) / 2;

    // Set goal positions
    const goalHeight = 100; // Example height for the goal
    const goalStartY = fieldYStart + (fieldHeight - goalHeight) / 2;

    // Check if the ball is in the left goal (Team B scores)
    if (ball.x < fieldXStart - ball.width / 2 && ball.y > goalStartY && ball.y < goalStartY + goalHeight) {
        scoreTeamB++;
        console.log("Goal for Team B!");
        goalScored = true;
        setTimeout(resetBall, 1000); // 1-second delay before resetting
    }

    // Check if the ball is in the right goal (Team A scores)
    else if (ball.x > fieldXStart + fieldWidth + ball.width / 2 && ball.y > goalStartY && ball.y < goalStartY + goalHeight) {
        scoreTeamA++;
        console.log("Goal for Team A!");
        goalScored = true;
        setTimeout(resetBall, 1000); // 1-second delay before resetting
    }
}

// Function to reset players to their starting positions
function resetPlayers() {
    players.forEach((player, index) => {
        player.x = startingPositions[index].x;
        player.y = startingPositions[index].y;
        player.canMove = true;
        player.cooldown = 0;
        player.direction = { x: 0, y: -1 };
        updatePlayerSize(player, canvas); // Update player size based on perspective
    });
    currentPlayerIndex = getClosestPlayerToBall(); // Select closest player to the ball
}

// Function to get the closest player to the ball
function getClosestPlayerToBall() {
    const teamAPlayers = players.filter(player => player.team === 'a');
    let closestPlayerIndex = null;
    let closestDistance = Infinity;

    teamAPlayers.forEach((player, index) => {
        const distance = Math.hypot(player.x - ball.x, player.y - ball.y);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPlayerIndex = players.indexOf(player);
        }
    });

    return closestPlayerIndex;
}
// game.js

// Function to reset players to their starting positions
function resetPlayers() {
    players.forEach((player, index) => {
        player.x = startingPositions[index].x;
        player.y = startingPositions[index].y;
        player.canMove = true;
        player.cooldown = 0;
        player.moving = false; // Ensure players are not moving initially
        player.chasing = false;
        player.chaseTime = 0;
        player.direction = { x: 0, y: -1 };
        updatePlayerSize(player, canvas); // Update player size based on perspective
    });
    currentPlayerIndex = getClosestPlayerToBall(); // Select closest player to the ball
    chasingPlayers.a = [];
    chasingPlayers.b = [];
}

// Function to reset the ball to its starting position
function resetBall() {
    ball.x = fieldWidth / 2;
    ball.y = fieldHeight / 2 + 70;
    ball.vx = 0;
    ball.vy = 0;
    ball.z = 0;
    ball.vz = 0;
    ball.inControl = null; // Release control of the ball
    goalScored = false; // Allow goals to be counted again
    resetPlayers(); // Reset players to starting positions
    initializeAIMovements(players, fieldWidth); // Reinitialize AI movements
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawField();

    if (firstMoveMade) {
        updateAIMovements(players, currentPlayerIndex, ball); // Call AI update only if the first move has been made
    }

    players.forEach((player, index) => {
        if (index === currentPlayerIndex) {
            updatePlayer(player, keys, canvas);
        }
        drawPlayer(ctx, player, index === currentPlayerIndex);
    });
    updateBall(ball, players, currentPlayerIndex, keys, canvas);
    drawBall(ctx, ball);
    checkGoal();
    requestAnimationFrame(gameLoop);
}

// Function to switch between the two closest players to the ball
function switchPlayer(newIndex = null) {
    if (ball.inControl && ball.inControl.team === 'a') {
        // If the ball is controlled by a Team A player, select that player
        currentPlayerIndex = players.indexOf(ball.inControl);
    } else {
        const closestPlayers = getTwoClosestPlayersToBall();
        if (closestPlayers.length < 2) return; // Ensure there are at least two players to switch between

        if (newIndex === null) {
            // If newIndex is not provided, check and switch to the closest player first
            if (lastSwitchedPlayerIndex >= 2 || lastSwitchedPlayerIndex < 0) {
                lastSwitchedPlayerIndex = 0;
            }
        } else {
            // If newIndex is provided, reset the lastSwitchedPlayerIndex
            lastSwitchedPlayerIndex = 0;
        }

        const closestPlayerIndex = closestPlayers[lastSwitchedPlayerIndex];

        lastSwitchedPlayerIndex = (lastSwitchedPlayerIndex + 1) % 2; // Toggle between 0 and 1

        if (closestPlayerIndex !== -1) {
            currentPlayerIndex = closestPlayerIndex;
        }
    }
}

// Get the indices of the two closest Team A players to the ball
function getTwoClosestPlayersToBall() {
    let closestPlayers = [-1, -1];
    let closestDistances = [Infinity, Infinity];

    players.forEach((player, index) => {
        if (player.team === 'a') {
            const distance = Math.hypot(player.x - ball.x, player.y - ball.y);
            if (distance < closestDistances[0]) {
                closestDistances[1] = closestDistances[0];
                closestPlayers[1] = closestPlayers[0];
                closestDistances[0] = distance;
                closestPlayers[0] = index;
            } else if (distance < closestDistances[1]) {
                closestDistances[1] = distance;
                closestPlayers[1] = index;
            }
        }
    });

    return closestPlayers;
}

// Handle key down events
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;

        // Set firstMoveMade to true on the first move
        if (!firstMoveMade) {
            firstMoveMade = true;
            initializeAIMovements(players, fieldWidth);
        }
    }
    if (e.key === 'w' && (ball.inControl === null || ball.inControl.team !== 'a')) {
        switchPlayer();
    }
    // Handle tackle action
    if (e.key === 'a') { // Assuming 'a' is the tackle key
        const currentPlayer = players[currentPlayerIndex];
        players.forEach(player => {
            if (player.team !== currentPlayer.team) {
                tacklePlayer(currentPlayer, player);
            }
        });
    }
});

// Handle key up events
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Initial setup: Reset players and select the closest player to the ball
resetPlayers();

// Start the game loop
gameLoop();
