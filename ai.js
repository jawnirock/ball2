// ai.js

const chasingPlayers = {
    a: [],
    b: []
};

// Function to initialize AI movements
function initializeAIMovements(players, fieldWidth) {
    players.forEach(player => {
        let targetX = player.x; // Default to the current position

        if (player.role === 'forward' || player.role === 'midfielder') {
            const additionalDistance = -50 + Math.random() * 300; // Random number from -100 to 100
            if (player.role === 'forward') {
                if (player.team === 'a') {
                    targetX += fieldWidth / 4 + additionalDistance; // Move right for Team A attackers
                } else if (player.team === 'b') {
                    targetX -= fieldWidth / 4 + additionalDistance; // Move left for Team B attackers
                }
            } else if (player.role === 'midfielder') {
                if (player.team === 'a') {
                    targetX += fieldWidth / 8 + additionalDistance; // Move right for Team A midfielders
                } else if (player.team === 'b') {
                    targetX -= fieldWidth / 8 + additionalDistance; // Move left for Team B midfielders
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
        if (index !== currentPlayerIndex && player.canMove) { // Only apply AI behavior to unselected players who can move
            if (player.cooldown > 0) {
                player.cooldown--;
                return;
            }

            // Logic for Team B defenders in control of the ball
            if (ball.inControl === player && player.team === 'b' && player.role === 'defender') {
                const { closestMidfielder, closestDistance } = getClosestMidfielder(player, players);
                const maxPassDistance = 150;  // Define the max distance for a pass
                
                if (closestMidfielder) {
                    // Calculate the direction towards the closest midfielder
                    const dx = closestMidfielder.x - player.x;
                    const dy = closestMidfielder.y - player.y;

                    // If the closest midfielder is within passing distance
                    if (closestDistance <= maxPassDistance) {
                        // Normalize the direction and use the pass speed
                        const distance = Math.hypot(dx, dy);
                        ball.vx = ball.speed * 0.7 * (dx / distance);  // Mostly in X-axis but considers diagonal
                        ball.vy = ball.speed * 0.7 * (dy / distance);  // Allows for vertical movement if needed
                        ball.vz = 3;  // Pass has a moderate vertical arc
                        ball.inControl = null;
                        player.cooldown = 120;  // Prevent immediate actions after passing
                    } else {
                        // If no midfielder is close enough, defender kicks the ball along the X-axis
                        ball.vx = ball.speed * 1.0 * Math.sign(dx);  // Kick in the X direction towards midfield
                        ball.vy = 0;  // No vertical movement for the kick
                        ball.vz = 5;  // Kick has a higher arc
                        ball.inControl = null;
                        player.cooldown = 120;  // Prevent immediate actions after kicking
                    }
                }
                return;  // End movement updates once the defender has acted
            }

            // Determine the chase radius based on the player role
            let chaseRadius = player.width * 6;
            if (player.role === 'midfielder') {
                chaseRadius = player.width * 8;
            }

            // Determine if the player should chase the ball
            const distanceToBall = Math.hypot(ball.x - player.x, ball.y - player.y);
            if (!ball.inControl || ball.inControl.team !== player.team) {
                if (distanceToBall <= chaseRadius && !player.chasing && player.team !== ball.inControl?.team) {
                    if (chasingPlayers[player.team].length < 3) {
                        startChasing(player, ball);
                    }
                }
            } else {
                stopChasing(player);
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

            // Attempt to tackle if close enough to an opposition player with the ball
            if (ball.inControl && ball.inControl.team !== player.team) {
                const ballController = players.find(p => p === ball.inControl);
                if (ballController && Math.hypot(player.x - ballController.x, player.y - ballController.y) < 30) {
                    tacklePlayer(player, ballController);
                }
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
        const stepX = (dx / distance) * (player.speed / 2);
        const stepY = (dy / distance) * (player.speed / 2);
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
        tackler.cooldown = 60; // 1 second cooldown (assuming 60 frames per second)
        targetPlayer.moving = false; // Stop the tackled player from moving
        tackler.moving = false; // Stop the tackler from moving
        stopChasing(targetPlayer); // Stop the tackled player from chasing
        stopChasing(tackler); // Stop the tackler from chasing

        // Rotate and freeze both players
        rotateAndFreezePlayer(targetPlayer, 2000); // 2 seconds
        rotateAndFreezePlayer(tackler, 1000); // 1 second

        ball.inControl = null; // Ball gets loose
        ball.vx = tackler.direction.x * 2;
        ball.vy = tackler.direction.y * 2;
    }
}

// Helper function to rotate and freeze a player
function rotateAndFreezePlayer(player, duration) {
    player.rotated = true;
    player.canMove = false;
    setTimeout(() => {
        player.rotated = false;
        player.canMove = true;
    }, duration);
}

function getClosestMidfielder(player, players) {
    let closestMidfielder = null;
    let closestDistance = Infinity;

    players.forEach(p => {
        if (p.team === player.team && p.role === 'midfielder') {
            const distance = Math.hypot(p.x - player.x, p.y - player.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestMidfielder = p;
            }
        }
    });

    return { closestMidfielder, closestDistance };
}

