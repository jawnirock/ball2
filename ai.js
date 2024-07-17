// ai.js

// Function to initialize AI movements
function initializeAIMovements() {
    // Placeholder for future AI initialization logic
}

// Function to update AI movements based on the game state
function updateAIMovements(players, ball, currentPlayerIndex, startingPositions) {
    players.forEach((player, index) => {
        if (index !== currentPlayerIndex) { // Only apply AI behavior to unselected players
            const startingPos = startingPositions[index];
            if (ball.inControl && ball.inControl.team === player.team) {
                // Own team has the ball
                if (player.team === 'a') {
                    movePlayerToTarget(player, startingPos.x + 30, startingPos.y); // Team A moves right
                } else {
                    movePlayerToTarget(player, startingPos.x - 30, startingPos.y); // Team B moves left
                }
            } else if (ball.inControl && ball.inControl.team !== player.team) {
                // Other team has the ball
                if (player.team === 'a') {
                    movePlayerToTarget(player, startingPos.x - 30, startingPos.y); // Team A moves left
                } else {
                    movePlayerToTarget(player, startingPos.x + 30, startingPos.y); // Team B moves right
                }
            } else {
                // No one has the ball
                movePlayerToTarget(player, startingPos.x, startingPos.y); // Return to starting position
            }
        }
    });
}

// Helper function to move a player towards a target position
function movePlayerToTarget(player, targetX, targetY) {
    const dx = targetX - player.x;
    const dy = targetY - player.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 0) {
        const stepX = (dx / distance) * player.speed;
        const stepY = (dy / distance) * player.speed;
        player.x += stepX;
        player.y += stepY;

        // Ensure the player does not overshoot the target
        if (Math.abs(targetX - player.x) < Math.abs(stepX)) player.x = targetX;
        if (Math.abs(targetY - player.y) < Math.abs(stepY)) player.y = targetY;

        updatePlayerSize(player, canvas); // Update player size based on perspective
    }
}
