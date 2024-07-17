// player.js

// Update player position
function updatePlayer(player, keys, canvas) {
    if (!player.canMove) return; // Prevent movement if the player is frozen

    const prevX = player.x;
    const prevY = player.y;

    // Attempt to update player position based on key inputs
    let nextX = player.x;
    let nextY = player.y;

    if (keys.ArrowUp && player.y > 0) nextY -= player.speed;
    if (keys.ArrowDown && player.y < canvas.height) nextY += player.speed;
    if (keys.ArrowLeft && player.x > 0) nextX -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width) nextX += player.speed;

    // Comment out the collision detection and resolution
    /*
    const collision = checkPlayerCollision(player, nextX, nextY);

    if (!collision) {
        player.x = nextX;
        player.y = nextY;
    } else {
        // Apply dragging effect
        const dragSpeed = 0.05; // Reduced dragging speed for smoother effect
        player.x += collision.dx * dragSpeed;
        player.y += collision.dy * dragSpeed;

        // Apply dragging effect to the collided player
        collision.player.x -= collision.dx * dragSpeed;
        collision.player.y -= collision.dy * dragSpeed;
    }
    */

    // Temporarily set the position without checking for collisions
    player.x = nextX;
    player.y = nextY;

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

// Update player size based on y position for perspective effect
function updatePlayerSize(player, canvas) {
    const sizeFactor = 1 + (player.y / canvas.height);
    player.width = 15 * sizeFactor;
    player.height = 28 * sizeFactor;
}

// Draw player
function drawPlayer(ctx, player, isCurrentPlayer) {
    ctx.fillStyle = player.team === 'a' ? '#00008B' : '#8B0000'; // Dark blue for Team A, dark red for Team B

    if (player.rotated) {
        ctx.save();
        ctx.translate(player.x, player.y - player.height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
        ctx.restore();
    } else {
        ctx.fillRect(player.x - player.width / 2, player.y - player.height, player.width, player.height);
    }

    if (isCurrentPlayer) {
        drawArrow(ctx, player);
        drawDirectionArrow(ctx, player);
    }
}

// Check for player collision
// Commenting out the collision detection function as well
/*
function checkPlayerCollision(currentPlayer, nextX, nextY) {
    const playerLeft = nextX - currentPlayer.width / 2;
    const playerRight = nextX + currentPlayer.width / 2;
    const playerTop = nextY - currentPlayer.height;
    const playerBottom = nextY;

    for (let i = 0; i < players.length; i++) {
        const otherPlayer = players[i];
        if (otherPlayer !== currentPlayer) {
            const otherLeft = otherPlayer.x - otherPlayer.width / 2;
            const otherRight = otherPlayer.x + otherPlayer.width / 2;
            const otherTop = otherPlayer.y - otherPlayer.height;
            const otherBottom = otherPlayer.y;

            if (
                playerRight > otherLeft &&
                playerLeft < otherRight &&
                playerBottom > otherTop &&
                playerTop < otherBottom
            ) {
                const dx = nextX - otherPlayer.x;
                const dy = nextY - otherPlayer.y;
                return { player: otherPlayer, dx, dy }; // Collision detected, return the other player and direction
            }
        }
    }

    return null; // No collision
}
*/

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
