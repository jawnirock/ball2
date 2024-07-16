// player.js

// Update player position
function updatePlayer(player, keys, canvas) {
    const prevX = player.x;
    const prevY = player.y;

    if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
    if (keys.ArrowDown && player.y < canvas.height) player.y += player.speed;
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width) player.x += player.speed;

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
    ctx.fillStyle = player.team === 'A' ? '#00008B' : '#8B0000'; // Dark blue for Team A, Dark red for Team B
    ctx.fillRect(player.x - player.width / 2, player.y - player.height, player.width, player.height);

    if (isCurrentPlayer) {
        drawArrow(ctx, player, 'head');
        drawDirectionArrow(ctx, player);
    }
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
