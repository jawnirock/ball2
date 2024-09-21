// player.js

// Update player position and state
function updatePlayer(player, keys, canvas) {
    // If the player is tackling or has been tackled, do not change state to idle or update position
    if (player.tackleInProgress || player.state === "a_tackled" || player.state === "b_tackled") {
        return; // Skip further updates if the player is in the middle of tackling or being tackled
    }

    if (!player.canMove) {
        // Do NOT change to idle if player is in the middle of tackling
        if (player.state !== "a_tackling" && player.state !== "b_tackling") {
            player.state = player.team === "a" ? "a_idle" : "b_idle"; // Set to idle only if not tackling
        }
        return;
    }

    const prevX = player.x;
    const prevY = player.y;
    let nextX = player.x;
    let nextY = player.y;

    // Update position based on key input
    if (keys.ArrowUp && player.y > 0) nextY -= player.speed;
    if (keys.ArrowDown && player.y < canvas.height) nextY += player.speed;
    if (keys.ArrowLeft && player.x > 0) nextX -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width) nextX += player.speed;

    // Update position
    player.x = nextX;
    player.y = nextY;

    // Set running state based on direction (left or right)
    if (nextX < prevX) {
        player.state = player.team === "a" ? "a_running_left" : "b_running_left";
    } else if (nextX > prevX) {
        player.state = player.team === "a" ? "a_running_right" : "b_running_right";
    }

    // If player isn't moving, set to idle (but only if not tackling or tackled)
    if (nextX === prevX && nextY === prevY) {
        player.state = player.team === "a" ? "a_idle" : "b_idle";
    }

    // Update player size based on y position for perspective effect
    updatePlayerSize(player, canvas);

    // Update player direction
    if (player.x !== prevX || player.y !== prevY) {
        const dx = player.x - prevX;
        const dy = player.y - prevY;
        const length = Math.hypot(dx, dy);
        player.direction = { x: dx / length, y: dy / length };
    }
}

// Handle tackling logic for user-controlled players
function handleTackle(player, otherPlayers, ball, keys) {
    if (keys.a && player.canMove) {
        // Set state to "tackling" when user presses 'a'
        player.state = player.team === 'a' ? "a_tackling" : "b_tackling";
        player.tackleInProgress = true; // Mark tackle as in progress
        player.canMove = false; // Prevent further movement while tackling

        let opponentTackled = false; // Track whether an opponent is tackled

        // Check if user tackles an opponent
        otherPlayers.forEach(opponent => {
            if (opponent.team !== player.team) {
                const distance = Math.hypot(opponent.x - player.x, opponent.y - player.y);
                if (distance < 30) {  // Tackle range
                    opponentTackled = true;

                    // Set opponent state to "tackled"
                    opponent.state = opponent.team === 'a' ? "a_tackled" : "b_tackled";

                    // Freeze both players temporarily, maintaining their states during the freeze
                    freezePlayer(opponent, 2000, opponent.state); // Opponent stays in tackled state
                    freezePlayer(player, 1000, player.state);     // Tackling player stays in tackling state

                    // Release ball only if the opponent has possession
                    if (ball.inControl === opponent) {
                        ball.inControl = null;
                        ball.vx = player.direction.x * 2;
                        ball.vy = player.direction.y * 2;
                    }
                }
            }
        });

        // If no opponent was tackled, the player still stays in "tackling" state until the duration ends
        setTimeout(() => {
            player.tackleInProgress = false; // End tackle state
            player.canMove = true;
            player.state = player.team === 'a' ? "a_idle" : "b_idle"; // Reset to idle after tackle attempt
        }, 1000); // Reset after 1 second (tackle duration)
    }
}

// Freeze a player temporarily and maintain their current state during the freeze
function freezePlayer(player, duration, freezeState) {
    player.canMove = false;
    setTimeout(() => {
        player.canMove = true;
        // Maintain state during freeze and only switch after freeze duration
        player.state = freezeState === "a_tackling" || freezeState === "b_tackling" ? freezeState : player.team === 'a' ? "a_idle" : "b_idle";
    }, duration);
}




// Draw player using sprite images based on state
function drawPlayer(ctx, player, isCurrentPlayer) {
    const sprite = spriteImages[player.state];  // Get the appropriate sprite for the player's state

    ctx.save();  // Save the current drawing state before rotating

    // Check if player is in "tackling" or "tackled" state, and apply 90-degree rotation
    if (player.state === "a_tackling" || player.state === "b_tackling" ||
        player.state === "a_tackled" || player.state === "b_tackled") {
        
        // Rotate the canvas around the player's center (90 degrees = π/2 radians)
        ctx.translate(player.x, player.y - player.height / 2);  // Move origin to player's center
        ctx.rotate(Math.PI / 2);  // Rotate by 90 degrees (clockwise)
        ctx.translate(-player.x, -(player.y - player.height / 2));  // Move origin back to original position
    }

    if (sprite && sprite.complete) {  // Check if the sprite is loaded
        ctx.drawImage(sprite, player.x - player.width / 2, player.y - player.height, player.width, player.height);
    } else {
        // Fallback in case sprite hasn't loaded yet, using a simple rectangle
        ctx.fillStyle = player.team === 'a' ? '#00008B' : '#8B0000'; // Team colors
        ctx.fillRect(player.x - player.width / 2, player.y - player.height, player.width, player.height);
    }

    if (isCurrentPlayer) {
        drawArrow(ctx, player);
        drawDirectionArrow(ctx, player);
    }

    ctx.restore();  // Restore the previous drawing state to avoid rotating other elements
}


// Draw an arrow above the current player
function drawArrow(ctx, player) {
    const arrowWidth = 10;
    const arrowHeight = 15;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.height - 5);
    ctx.lineTo(player.x - arrowWidth / 2, player.y - player.height - 5 - arrowHeight);
    ctx.lineTo(player.x + arrowWidth / 2, player.y - player.height - 5 - arrowHeight);
    ctx.closePath();
    ctx.fill();
}

// Draw a direction arrow to indicate the direction the player is moving
function drawDirectionArrow(ctx, player) {
    const arrowLength = 20;
    const arrowWidth = 5;
    const arrowX = player.x + player.direction.x * arrowLength;
    const arrowY = player.y - player.height / 2 + player.direction.y * arrowLength;

    ctx.fillStyle = '#FFD700'; // Gold color for the direction arrow
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - arrowWidth, arrowY - arrowWidth);
    ctx.lineTo(arrowX + arrowWidth, arrowY - arrowWidth);
    ctx.closePath();
    ctx.fill();
}
