// Ball physics constants
const gravity = 0.2; // Gravity force
const bounceFactor = 0.7; // Energy retained after bounce
// Assuming these are global variables
let fieldBounds = { left: 0, right: 0, top: 0, bottom: 0 };
let ballOutOfBounds = false; // Keeps track of whether the ball is out of bounds
let ballImmunity = false;  // Tracks if the ball has goal immunity (during throw-in)

// Call this function whenever you need to update field boundaries (e.g., after drawing the field)
function updateFieldBounds(fieldXStart, fieldYStart, fieldWidth, fieldHeight) {
    fieldBounds.left = fieldXStart;
    fieldBounds.right = fieldXStart + fieldWidth;
    fieldBounds.top = fieldYStart;
    fieldBounds.bottom = fieldYStart + fieldHeight;
}
// Update ball position and handle player interaction
function updateBall(ball, players, currentPlayerIndex, keys, canvas) {
    if (ball.inControl) {
        // Ball is in control of a player
        ball.x = ball.inControl.x;
        ball.y = ball.inControl.y - ball.inControl.height / 2;
        ball.z = 0;
        ball.vz = 0;

         // Check if the player in control is out of bounds
        checkPlayerOutOfBounds(ball, players);


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

         // Check if the ball is out of bounds
        if (isBallOutOfBounds(ball)) {
            if (!ballOutOfBounds) {
                ballOutOfBounds = true;
                handleBallOutOfBounds(ball, players);
            }
        } else {
            ballOutOfBounds = false;
        }

        // Bounce off the ground
        if (ball.z < 0) {
            ball.z = 0;
            
            // If the ball is moving vertically fast enough, it should bounce
            if (Math.abs(ball.vz) > 0.5) {
                ball.vz *= -bounceFactor; // Invert velocity for bounce and reduce it by the bounceFactor
            } else {
                // If the vertical velocity is too small, stop the bounce completely
                ball.vz = 0;
            }
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

        // Slow down the ball gradually for both horizontal velocities
        ball.vx *= 0.98;
        ball.vy *= 0.98;

        // Ensure the ball stops completely when the velocity is small enough
        if (Math.abs(ball.vx) < 0.1) ball.vx = 0;
        if (Math.abs(ball.vy) < 0.1) ball.vy = 0;

        // Fully stop the ball if all velocities are nearly zero
        if (ball.vx === 0 && ball.vy === 0 && ball.vz === 0) {
            // The ball is at rest, so stop applying any physics or updates to it
            ball.vx = 0;
            ball.vy = 0;
            ball.vz = 0;
        }

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


// Function to check if the ball is out of bounds
function isBallOutOfBounds(ball) {
    const fieldYStart = (canvasHeight - fieldHeight) / 2;
    const fieldXStart = (canvasWidth - fieldWidth) / 2;

    const ballOutLeft = ball.x < fieldXStart;
    const ballOutRight = ball.x > fieldXStart + fieldWidth;
    const ballOutTop = ball.y < fieldYStart;
    const ballOutBottom = ball.y > fieldYStart + fieldHeight;

    return ballOutLeft || ballOutRight || ballOutTop || ballOutBottom;
}



// Handle ball going out of bounds and throw it back in
function handleBallOutOfBounds(ball, players) {
    const fieldCenterX = fieldBounds.left + fieldWidth / 2;
    const fieldCenterY = fieldBounds.top + fieldHeight / 2;

    // If the ball is in control of a player, they lose possession
    if (ball.inControl) {
        const playerInControl = ball.inControl;
        ball.inControl = null;  // Player loses possession
        playerInControl.cooldown = 120;  // Prevent the player from immediately regaining control
        playerInControl.state = playerInControl.team === 'a' ? 'a_idle' : 'b_idle';
        playerInControl.canMove = false;  // Freeze the player for 1.5 seconds
        setTimeout(() => {
            playerInControl.canMove = true;  // Unfreeze the player after 1.5 seconds
        }, 1500);
    }

    // Throw the ball back after 1.5 seconds
    setTimeout(() => {
        ballImmunity = true;  // Activate goal immunity for the ball
        const directionX = fieldCenterX - ball.x;
        const directionY = fieldCenterY - ball.y;
        const distance = Math.hypot(directionX, directionY);
        const normalizedDirectionX = directionX / distance;
        const normalizedDirectionY = directionY / distance;

        // Apply throw-in physics like a pass
        ball.vx = ball.speed * 0.8 * normalizedDirectionX;
        ball.vy = ball.speed * 0.8 * normalizedDirectionY;
        ball.vz = 3;  // Add some vertical velocity for realism
        ball.inControl = null;

        // Deactivate goal immunity after 2 seconds
        setTimeout(() => {
            ballImmunity = false;  // Ball can trigger goals again
        }, 2000);
    }, 1500);
}




function freezeAllPlayers(players, duration) {
    // Freeze all players
    players.forEach(player => {
        player.state = player.team === 'a' ? 'a_idle' : 'b_idle';
        player.canMove = false;  // Freeze player
    });

    setTimeout(() => {
        players.forEach(player => {
            player.canMove = true;  // Unfreeze player after the duration
        });
    }, duration);
}





function checkPlayerOutOfBounds(ball, players) {
    const fieldYStart = (canvasHeight - fieldHeight) / 2;
    const fieldXStart = (canvasWidth - fieldWidth) / 2;
    const fieldYEnd = fieldYStart + fieldHeight;
    const fieldXEnd = fieldXStart + fieldWidth;


    // If the ball is in control of a player, check if that player is out of bounds
    if (ball.inControl) {
        const player = ball.inControl;


        // Check if the player is out of bounds
        if (player.x < fieldXStart || player.x > fieldXEnd || player.y < fieldYStart || player.y > fieldYEnd) {
            // Call handleBallOutOfBounds to handle losing possession and throwing the ball back in
            handleBallOutOfBounds(ball, players);
        }
    } else {
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

    // Check if any opposing player is within tackle range
    const bPlayerInRange = players.find(player => player.team !== currentPlayer.team && Math.hypot(player.x - currentPlayer.x, player.y - currentPlayer.y) < 40);

    if (bPlayerInRange) {
        bPlayerInRange.state = bPlayerInRange.team === 'a' ? "a_tackled" : "b_tackled"; // Set tackled state for the tackled player
        bPlayerInRange.canMove = false; // Freeze the tackled player
        setTimeout(() => {
            bPlayerInRange.canMove = true; // Unfreeze the tackled player after 2 seconds
            bPlayerInRange.state = bPlayerInRange.team === 'a' ? "a_idle" : "b_idle"; // Return tackled player to idle after being tackled
        }, 2000); // Tackled player is frozen for 2 seconds

        // Only release and move the ball if the tackled player had possession
        if (ball.inControl === bPlayerInRange) {
            ball.inControl = null; // Release the ball
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
