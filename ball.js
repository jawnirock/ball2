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

        // Check if any B team player is in possession
        const bPlayerInPossession = players.find(player => player.team === 'B' && ball.inControl === player);

        if (!bPlayerInPossession) {
            console.log("No B player in possession");
        } else {
            const distance = Math.hypot(bPlayerInPossession.x - currentPlayer.x, bPlayerInPossession.y - currentPlayer.y);
            console.log("B player in possession, distance: " + distance);

            if (distance < 40) {
                console.log("Tackle within range, rotating opposition player");
                bPlayerInPossession.rotated = true;
                bPlayerInPossession.canMove = false;
                setTimeout(() => {
                    bPlayerInPossession.rotated = false;
                    bPlayerInPossession.canMove = true;
                }, 2000);

                // Release the ball from the tackled player
                ball.inControl = null;
                ball.vx = currentPlayer.direction.x * 2;
                ball.vy = currentPlayer.direction.y * 2;
            }
        }
    }

    // Update ball size based on y position for perspective effect
    updateBallSize(ball, canvas);
}

// Update ball size based on y position for perspective effect
function updateBallSize(ball, canvas) {
    const sizeFactor = 1 + (ball.y / canvas.height);
    ball.width = 7 * sizeFactor;
    ball.height = 7 * sizeFactor;
}

// Draw ball
function drawBall(ctx, ball) {
    ctx.fillStyle = '#8B4513'; // Brown color for the ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y - ball.z, ball.width / 2, 0, Math.PI * 2);
    ctx.fill();
}
