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

        // Handle pass (throw) - for Team A
        if (keys.s && ball.inControl.team === 'a') {
            ball.inControl.state = "a_passing";
            ball.vx = ball.speed * 0.7 * ball.inControl.direction.x;
            ball.vy = ball.speed * 0.7 * ball.inControl.direction.y;
            ball.vz = 3;
            ball.inControl.cooldown = 120;
            ball.inControl = null;
            lastSwitchedPlayerIndex = 0; // Reset the switch index when possession is lost
        }

        // Handle kick - for Team A
        if (keys.d && ball.inControl.team === 'a') {
            ball.inControl.state = "a_kicking";
            ball.vx = ball.speed * 0.8 * ball.inControl.direction.x;
            ball.vy = ball.speed * 0.8 * ball.inControl.direction.y;
            ball.vz = 5;
            ball.inControl.cooldown = 120;
            ball.inControl = null;
            lastSwitchedPlayerIndex = 0; // Reset the switch index when possession is lost
        }

        // Handle tackle
        if (keys.a && !players.some(player => player.team === 'a' && ball.inControl === player)) {
            handleTackle(players, currentPlayerIndex, ball);
        }

    } else {
        // Update ball position based on velocity
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.z += ball.vz;
        ball.vz -= gravity;

        // Bounce off the ground
        if (ball.z < 0) {
            ball.z = 0;
            ball.vz *= -bounceFactor;
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
                    if (player.team === 'a' && currentPlayerIndex !== index) {
                        switchPlayer(index);
                    }
                }
            }
        });
    }

    // Handle tackle
    if (keys.a && !players.some(player => player.team === 'a' && ball.inControl === player)) {
        handleTackle(players, currentPlayerIndex, ball);
    }
}

// Handle tackling logic
function handleTackle(players, currentPlayerIndex, ball) {
    const currentPlayer = players[currentPlayerIndex];

    // Freeze and rotate the current player
    if (!currentPlayer.rotated) {
        currentPlayer.state = currentPlayer.team === 'a' ? "a_tackling" : "b_tackling";
        currentPlayer.rotated = true;
        currentPlayer.canMove = false;
        setTimeout(() => {
            currentPlayer.rotated = false;
            currentPlayer.canMove = true;
        }, 1000);
    }

    // Check if any B team player is within tackle range
    const bPlayerInRange = players.find(player => player.team === 'b' && Math.hypot(player.x - currentPlayer.x, player.y - currentPlayer.y) < 40);

    if (bPlayerInRange) {
        bPlayerInRange.state = "b_tackled";
        bPlayerInRange.rotated = true;
        bPlayerInRange.canMove = false;
        bPlayerInRange.cooldown = 200;
        setTimeout(() => {
            bPlayerInRange.rotated = false;
            bPlayerInRange.canMove = true;
        }, 2000);

        if (ball.inControl === bPlayerInRange) {
            // Release the ball from the tackled player
            ball.inControl = null;
            ball.vx = currentPlayer.direction.x * 2;
            ball.vy = currentPlayer.direction.y * 2;
        }
    }
}

// Draw ball
function drawBall(ctx, ball) {
    ctx.fillStyle = '#8B4513'; // Brown color for the ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y - ball.z, ball.width / 2, 0, Math.PI * 2);
    ctx.fill();
}
