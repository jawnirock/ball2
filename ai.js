// ai.js

const chasingPlayers = {
    a: [],
    b: []
};
// ai.js

// Function to initialize AI movements
function initializeAIMovements(players, fieldWidth) {
    players.forEach(player => {
        let targetX = player.x; // Default to the current position

        if (player.role === 'forward' || player.role === 'midfielder') {
            const additionalDistance = -100 + Math.random() * 200; // Random number from -100 to 100
            if (player.role === 'forward') {
                if (player.team === 'a') {
                    targetX += fieldWidth / 4 + additionalDistance; // Move right for Team A attackers
                } else if (player.team === 'b') {
                    targetX -= fieldWidth / 4 + additionalDistance; // Move left for Team B attackers
                }
            } else if (player.role === 'midfielder') {
                if (player.team === 'a') {
                    targetX += fieldWidth / 7 + additionalDistance; // Move right for Team A midfielders
                } else if (player.team === 'b') {
                    targetX -= fieldWidth / 7 + additionalDistance; // Move left for Team B midfielders
                }
            }
        }

        // Set initial target positions
        player.targetX = targetX;
        player.targetY = player.y;
        player.moving = true; // Enable movement towards the target
    });
}

// Function to update AI movements based on the game state
function updateAIMovements(players, currentPlayerIndex, ball) {
    players.forEach((player, index) => {
        if (index !== currentPlayerIndex) { // Only apply AI behavior to unselected players
            if (player.cooldown > 0) {
                player.cooldown--;
                return;
            }

            // Determine if the player should chase the ball
            const distanceToBall = Math.hypot(ball.x - player.x, ball.y - player.y);
            const chaseRadius = player.width * 4;

            if (distanceToBall <= chaseRadius && !player.chasing && player.team !== ball.inControl?.team) {
                if (chasingPlayers[player.team].length < 3) {
                    startChasing(player, ball);
                }
            }

            // Handle chasing logic
            if (player.chasing) {
                player.chaseTime++;
                if (player.chaseTime > 240 || distanceToBall > chaseRadius) { // 240 frames = 4 seconds
                    stopChasing(player);
                } else {
                    movePlayerToTarget(player, ball.x, ball.y);
                }
            } else {
                movePlayerToTarget(player, player.targetX, player.targetY);
            }
        }
    });
}

// Function to start chasing the ball
function startChasing(player, ball) {
    player.chasing = true;
    player.chaseTime = 0;
    chasingPlayers[player.team].push(player);
}

// Function to stop chasing the ball
function stopChasing(player) {
    player.chasing = false;
    player.chaseTime = 0;
    chasingPlayers[player.team] = chasingPlayers[player.team].filter(p => p !== player);
}

// Helper function to move a player towards a target position
function movePlayerToTarget(player, targetX, targetY) {
    const dx = targetX - player.x;
    const dy = targetY - player.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 0) {
        const stepX = (dx / distance) * (player.speed / 3);
        const stepY = (dy / distance) * (player.speed / 3);
        player.x += stepX;
        player.y += stepY;

        // Ensure the player does not overshoot the target
        if (Math.abs(targetX - player.x) < Math.abs(stepX)) player.x = targetX;
        if (Math.abs(targetY - player.y) < Math.abs(stepY)) player.y = targetY;

        updatePlayerSize(player, canvas); // Update player size based on perspective
    }
}

// Function to handle tackling
function tacklePlayer(tackler, targetPlayer) {
    if (Math.hypot(tackler.x - targetPlayer.x, tackler.y - targetPlayer.y) < 30) { // Check if close enough to tackle
        targetPlayer.cooldown = 120; // 2 seconds cooldown (assuming 60 frames per second)
        targetPlayer.moving = false; // Stop the player from moving
        stopChasing(targetPlayer); // Stop chasing if tackled
    }
}
