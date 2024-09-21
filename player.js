// player.js

// player.js

// Update player position and state
function updatePlayer(player, keys, canvas, ball) {
    // If the player is tackling or has been tackled, do not change state to idle or update position
    if (player.tackleInProgress || player.state === "a_tackled" || player.state === "b_tackled") {
        return; // Skip further updates if the player is in the middle of tackling or being tackled
    }

    // Ensure player is not switching to idle/running if kicking, passing, or tackling
    if (player.state === "a_kicking" || player.state === "b_kicking" ||
        player.state === "a_passing" || player.state === "b_passing" ||
        player.state === "a_tackling" || player.state === "b_tackling") {
        return;  // Prevent changing state while these actions are in progress
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

    // Set running state based on direction (left or right), only if not in kicking, passing, or tackling state
    if (nextX < prevX) {
        player.state = player.team === "a" ? "a_running_left" : "b_running_left";
    } else if (nextX > prevX) {
        player.state = player.team === "a" ? "a_running_right" : "b_running_right";
    }

    // If player isn't moving, set to idle (but only if not tackling or tackled)
    if (nextX === prevX && nextY === prevY && player.state !== "a_tackling" && player.state !== "b_tackling") {
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
