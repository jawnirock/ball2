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


            // If the player has control of the ball (Team B)
            if (ball.inControl === player && player.team === 'b') {
                // Ensure the cooldown only gets initialized once when the player first gains control
                if (player.actionCooldown === null || player.actionCooldown === undefined) {
                    console.log("Player has control, starting to move left.");  // Log when the player gets the ball
                    player.actionCooldown = Math.floor(Math.random() * 30 + 30);  // Set a random cooldown for movement (0.5 to 1.5 seconds)
                }

                // Move left while the cooldown is active
                if (player.actionCooldown > 0) {
                    player.x -= 0.7;  // Move the player left with speed 0.7
                    console.log("Moving player left, remaining cooldown:", player.actionCooldown);  // Log movement
                    player.actionCooldown--;  // Decrement the cooldown
                    return;  // Exit until the cooldown finishes
                }

                // Once the cooldown expires, decide to pass or kick the ball
                if (player.actionCooldown === 0) {
                    console.log("Cooldown expired, deciding to pass or kick.");

                    let closestTeammate, closestDistance;

                    // If the player is a defender, look for the closest midfielder
                    if (player.role === 'defender') {
                        ({ closestMidfielder: closestTeammate, closestDistance } = getClosestMidfielder(player, players));
                    }
                    // If the player is a midfielder, look for the closest forward
                    else if (player.role === 'midfielder') {
                        ({ closestForward: closestTeammate, closestDistance } = getClosestForward(player, players));
                    }

                    const maxPassDistance = player.role === 'defender' ? 150 : 200;  // Set pass radius based on role

                    // If there's a valid teammate nearby, attempt a pass
                    if (closestTeammate) {
                        const dx = closestTeammate.x - player.x;
                        const dy = closestTeammate.y - player.y;
                        const distance = Math.hypot(dx, dy);

                        // If the teammate is close enough, pass the ball
                        if (closestDistance <= maxPassDistance) {
                            console.log(`Passing to closest ${player.role === 'defender' ? 'midfielder' : 'forward'}.`);
                            ball.vx = ball.speed * 0.7 * (dx / distance);  // Pass based on direction to teammate
                            ball.vy = ball.speed * 0.7 * (dy / distance);
                            ball.vz = 3;  // Give some vertical height to the pass
                            player.cooldown = 120;  // Apply cooldown to the player after the pass
                        } else {
                            // If the teammate is too far, kick the ball forward
                            console.log("Teammate too far, kicking the ball.");
                            ball.vx = -ball.speed * 1.0;  // Kick forward in the correct direction (toward the opponent's goal)
                            ball.vy = 0;
                            ball.vz = 5;  // Higher vertical height for a kick
                            player.cooldown = 120;  // Apply cooldown after the kick
                        }
                    } else {
                        // Default kick if no teammate is found
                        console.log("No teammate found, kicking the ball.");
                        ball.vx = -ball.speed * 1.0;
                        ball.vy = 0;
                        ball.vz = 5;
                        player.cooldown = 120;  // Apply cooldown
                    }

                    // Release ball control after the action
                    ball.inControl = null;  // Remove ball control from the player
                    player.actionCooldown = null;  // Reset action cooldown for the next time the player gets the ball
                    console.log("Action complete, resetting player state.");
                }

                return;  // Prevent further actions for this player until the action completes
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

function getClosestForward(player, players) {
    let closestForward = null;
    let closestDistance = Infinity;

    players.forEach(p => {
        if (p.team === player.team && p.role === 'forward') {
            const distance = Math.hypot(p.x - player.x, p.y - player.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestForward = p;
            }
        }
    });

    return { closestForward, closestDistance };
}


