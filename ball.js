// ball.js

// Ball physics constants
const gravity = 0.2; // Gravity force
const bounceFactor = 0.7; // Energy retained after bounce

// Update ball position and handle player interaction
function updateBall(ball, players, currentPlayerIndex, keys, canvas) {
    if (ball.inControl) {
        // Ball is in control of a player
        ball.x = ball.inControl.x;
        ball.y = ball.inControl.y - ball.inControl.height / 2;
        ball.z = 0;
        ball.vz = 0;

        // Handle pass (throw)
        if (keys.s && ball.inControl.team === 'A') {
            console.log("Passing the ball");
            ball.vx = ball.speed * 0.7 * ball.inControl.direction.x; // Further reduced horizontal velocity
            ball.vy = ball.speed * 0.7 * ball.inControl.direction.y; // Further reduced horizontal velocity
            ball.vz = 3; // Initial upward velocity
            ball.inControl.cooldown = 120; // Set cooldown period to two seconds (120 frames)
            ball.inControl = null;
        }

        // Handle kick
        if (keys.d && ball.inControl.team === 'A') {
            console.log("Kicking the ball");
            ball.vx = ball.speed * 0.8 * ball.inControl.direction.x; // Further reduced horizontal velocity
            ball.vy = ball.speed * 0.8 * ball.inControl.direction.y; // Further reduced horizontal velocity
            ball.vz = 5; // Higher initial upward velocity
            ball.inControl.cooldown = 120; // Set cooldown period to two seconds (120 frames)
            ball.inControl = null;
        }
    } else {
        // Update ball position based on velocity
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.z += ball.vz;
        ball.vz -= gravity; // Apply gravity

        // Bounce off the ground
        if (ball.z < 0) {
            ball.z = 0;
            ball.vz *= -bounceFactor; // Reverse vertical velocity with bounce factor
        }

        // Bounce off the walls
        if (ball.x - ball.width / 2 < 0 || ball.x + ball.width / 2 > canvas.width) {
            ball.vx *= -1;
            ball.x = Math.max(ball.width / 2, Math.min(canvas.width - ball.width / 2, ball.x));
        }
        if (ball.y - ball.height / 2 < 0 || ball.y + ball.height / 2 > canvas.height) {
            ball.vy *= -1;
            ball.y = Math.max(ball.height / 2, Math.min(canvas.height - ball.height / 2, ball.y));
        }

        // Slow down the ball gradually
        ball.vx *= 0.98;
        ball.vy *= 0.98;

        // Ensure the ball stops completely
        if (Math.abs(ball.vx) < 0.1) ball.vx = 0;
        if (Math.abs(ball.vy) < 0.1) ball.vy = 0;

        // Check if any player reaches the ball
        players.forEach((player, index) => {
            if (player.cooldown > 0) {
                player.cooldown--;
            }

            const distance = Math.hypot(player.x - ball.x, player.y - ball.y);
            const playerLeft = player.x - player.width / 2;
            const playerRight = player.x + player.width / 2;
            const playerTop = player.y - player.height;
            const playerBottom = player.y;

            if ((distance < (player.width + ball.width) / 2 || (ball.x > playerLeft && ball.x < playerRight && ball.y > playerTop && ball.y < playerBottom)) && player.cooldown === 0) {
                if (ball.z < 10) { // Allow control if ball is close to the ground
                    ball.inControl = player;
                    if (player.team === 'A' && currentPlayerIndex !== index) {
                        switchPlayer(index);
                    }
                }
            }
        });
    }

    // Handle tackle
    if (keys.a && !players.some(player => player.team === 'A' && ball.inControl === player)) {
        console.log("Attempting tackle");
        const currentPlayer = players[currentPlayerIndex];

        // Freeze and rotate the current player
        if (!currentPlayer.rotated) {
            currentPlayer.rotated = true;
            currentPlayer.canMove = false;
            setTimeout(() => {
                currentPlayer.rotated = false;
                currentPlayer.canMove = true;
            }, 1000);
        }

        // Check if any B team player is within tackle range
        const bPlayerInRange = players.find(player => player.team === 'B' && Math.hypot(player.x - currentPlayer.x, player.y - currentPlayer.y) < 40);

        if (!bPlayerInRange) {
            console.log("No B player in range");
        } else {
            console.log("Tackle within range, rotating opposition player");
            bPlayerInRange.rotated = true;
            bPlayerInRange.canMove = false;
            bPlayerInRange.cooldown = 200; // Increased cooldown period to ensure the player loses control
            setTimeout(() => {
                bPlayerInRange.rotated = false;
                bPlayerInRange.canMove = true;
            }, 2000);

            if (ball.inControl === bPlayerInRange) {
                // Release the ball from the tackled player if they have it
                ball.inControl = null;
                ball.vx = currentPlayer.direction.x * 2;
                ball.vy = currentPlayer.direction.y * 2;
            }
        }
    }

    // Update ball size based on y position for perspective effect
    updateBallSize(ball, canvas);
}

// Draw ball
function drawBall(ctx, ball) {
    ctx.fillStyle = '#8B4513'; // Brown color for the ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y - ball.z, ball.width / 2, 0, Math.PI * 2);
    ctx.fill();
}
