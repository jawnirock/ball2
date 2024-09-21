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

        if (keys.s && ball.inControl.team === 'a') {
            ball.inControl.state = "a_passing";  // Set state to passing
            ball.vx = ball.speed * 0.7 * ball.inControl.direction.x;
            ball.vy = ball.speed * 0.7 * ball.inControl.direction.y;
            ball.vz = 3;
            ball.inControl.cooldown = 120;
            
            // Return to idle after passing
            const passedPlayer = ball.inControl;  // Keep a reference to the player
            setTimeout(() => {
                passedPlayer.state = passedPlayer.team === 'a' ? "a_idle" : "b_idle";  // Reset state after passing
                passedPlayer.canMove = true;  // Allow movement after pass
            }, 500);  // Set the duration for passing animation
            ball.inControl = null;  // Release ball control
        }

        // Handle kick - for Team A
        if (keys.d && ball.inControl.team === 'a') {
            ball.inControl.state = "a_kicking";  // Set state to kicking
            ball.vx = ball.speed * 0.8 * ball.inControl.direction.x;
            ball.vy = ball.speed * 0.8 * ball.inControl.direction.y;
            ball.vz = 5;
            ball.inControl.cooldown = 120;
            
            // Return to idle after kicking
            const kickedPlayer = ball.inControl;  // Keep a reference to the player
            setTimeout(() => {
                kickedPlayer.state = kickedPlayer.team === 'a' ? "a_idle" : "b_idle";  // Reset state after kicking
                kickedPlayer.canMove = true;  // Allow movement after kick
            }, 500);  // Set the duration for kicking animation
            ball.inControl = null;  // Release ball control
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

    // Check if the current player is already tackling, if so, skip further actions
    if (currentPlayer.state === 'a_tackling' || currentPlayer.state === 'b_tackling') {
        return; // Player is already tackling, so skip further updates
    }

    // Set the current player to the "tackling" state and freeze for 1 second
    currentPlayer.state = currentPlayer.team === 'a' ? "a_tackling" : "b_tackling"; // Set state to tackling
    currentPlayer.canMove = false; // Freeze the player from moving
    setTimeout(() => {
        currentPlayer.canMove = true; // Allow movement after the tackle freeze
        currentPlayer.state = currentPlayer.team === 'a' ? "a_idle" : "b_idle"; // Return to idle after tackle
    }, 1000); // Freeze for 1 second

    // Check if any B team player is within tackle range
    const bPlayerInRange = players.find(player => player.team === 'b' && Math.hypot(player.x - currentPlayer.x, player.y - currentPlayer.y) < 40);

    if (bPlayerInRange) {
        bPlayerInRange.state = "b_tackled"; // Set tackled state for the tackled player
        bPlayerInRange.canMove = false; // Freeze the tackled player
        setTimeout(() => {
            bPlayerInRange.canMove = true; // Unfreeze the tackled player after 2 seconds
            bPlayerInRange.state = "b_idle"; // Return tackled player to idle after being tackled
        }, 2000); // Tackled player is frozen for 2 seconds

        // Release the ball if the tackled player had possession
        if (ball.inControl === bPlayerInRange) {
            ball.inControl = null; // Ball is released
            ball.vx = currentPlayer.direction.x * 2; // Ball velocity is set in the tackler's direction
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
