// Draw outer lines with perspective
function drawField() {
    const fieldYStart = (canvasHeight - fieldHeight) / 2;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    // Draw the perspective field
    ctx.beginPath();
    ctx.moveTo(bottomMargin, fieldYStart + fieldHeight); // Bottom left corner
    ctx.lineTo(fieldWidth - bottomMargin, fieldYStart + fieldHeight); // Bottom right corner
    ctx.lineTo(fieldWidth - topMargin, fieldYStart); // Top right corner
    ctx.lineTo(topMargin, fieldYStart); // Top left corner
    ctx.closePath();
    ctx.stroke();

    // Draw half line
    ctx.beginPath();
    ctx.moveTo((bottomMargin + fieldWidth - bottomMargin) / 2, fieldYStart + fieldHeight);
    ctx.lineTo((topMargin + fieldWidth - topMargin) / 2, fieldYStart);
    ctx.stroke();

    // Draw lines to split the field into four areas
    const quarterWidthBottom = (fieldWidth - 2 * bottomMargin) / 4;
    const quarterWidthTop = (fieldWidth - 2 * topMargin) / 4;

    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(bottomMargin + i * quarterWidthBottom, fieldYStart + fieldHeight);
        ctx.lineTo(topMargin + i * quarterWidthTop, fieldYStart);
        ctx.stroke();
    }

    // Draw goal lines
    drawGoalLines();

    // Draw scores
    drawScores();
}

function drawGoalLines() {
    ctx.strokeStyle = '#FF0000'; // Red color for goal lines
    ctx.lineWidth = goalLineWidth;

    const fieldYStart = (canvasHeight - fieldHeight) / 2;

    // Calculate positions for the goal lines based on the white lines
    const leftBottomX = bottomMargin + 80;
    const leftBottomY = fieldYStart + fieldHeight - 280;
    const leftTopX = topMargin;
    const leftTopY = fieldYStart;

    const rightBottomX = fieldWidth - bottomMargin - 80;
    const rightBottomY = fieldYStart + fieldHeight - 280;
    const rightTopX = fieldWidth - topMargin;
    const rightTopY = fieldYStart;

    // Angles for the left and right lines
    const leftLineAngle = Math.atan2(leftTopY - leftBottomY, leftTopX - leftBottomX);
    const rightLineAngle = Math.atan2(rightTopY - rightBottomY, rightTopX - rightBottomX);

    // Draw left goal line
    ctx.beginPath();
    ctx.moveTo(
        leftBottomX + goalLineLength * Math.cos(leftLineAngle),
        leftBottomY + goalLineLength * Math.sin(leftLineAngle)
    );
    ctx.lineTo(
        leftBottomX - goalLineLength * Math.cos(leftLineAngle),
        leftBottomY - goalLineLength * Math.sin(leftLineAngle)
    );
    ctx.stroke();

    // Draw right goal line
    ctx.beginPath();
    ctx.moveTo(
        rightBottomX + goalLineLength * Math.cos(rightLineAngle),
        rightBottomY + goalLineLength * Math.sin(rightLineAngle)
    );
    ctx.lineTo(
        rightBottomX - goalLineLength * Math.cos(rightLineAngle),
        rightBottomY - goalLineLength * Math.sin(rightLineAngle)
    );
    ctx.stroke();
}

function drawScores() {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(`Team A: ${scoreTeamA}`, 10, 30);
    ctx.fillText(`Team B: ${scoreTeamB}`, 10, 60);
}

function checkGoal() {
    if (goalScored) return; // Prevent multiple goals from being counted during the delay

    const fieldYStart = (canvasHeight - fieldHeight) / 2;

    // Calculate positions for the goal lines based on the white lines
    const leftGoalX = bottomMargin + 80;
    const leftGoalY = fieldYStart + fieldHeight - 280;

    const rightGoalX = fieldWidth - bottomMargin - 80;
    const rightGoalY = fieldYStart + fieldHeight - 280;

    if (ball.x > leftGoalX - goalLineWidth / 2 && ball.x < leftGoalX + goalLineWidth / 2 &&
        ball.y > leftGoalY - goalLineLength / 2 && ball.y < leftGoalY + goalLineLength / 2) {
        scoreTeamB++;
        console.log("Goal for Team B!");
        goalScored = true;
        setTimeout(resetBall, 1000); // 1-second delay before resetting
    } else if (ball.x > rightGoalX - goalLineWidth / 2 && ball.x < rightGoalX + goalLineWidth / 2 &&
        ball.y > rightGoalY - goalLineLength / 2 && ball.y < rightGoalY + goalLineLength / 2) {
        scoreTeamA++;
        console.log("Goal for Team A!");
        goalScored = true;
        setTimeout(resetBall, 1000); // 1-second delay before resetting
    }
}

function resetBall() {
    ball.x = fieldWidth / 2;
    ball.y = fieldHeight / 2 + 70;
    ball.vx = 0;
    ball.vy = 0;
    ball.z = 0;
    ball.vz = 0;
    ball.inControl = null; // Release control of the ball
    goalScored = false; // Allow goals to be counted again

    // Set the closest player to the ball as the current player
    currentPlayerIndex = getClosestPlayerToBallIndex();
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawField();
    players.forEach((player, index) => {
        if (index === currentPlayerIndex) {
            updatePlayer(player, keys, canvas);
        }
        drawPlayer(ctx, player, index === currentPlayerIndex);
    });
    updateBall(ball, players, currentPlayerIndex, keys, canvas);
    drawBall(ctx, ball);
    checkGoal();
    requestAnimationFrame(gameLoop);
}

// Handle key down events
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
    if (e.key === 'w' && (ball.inControl === null || ball.inControl.team === 'B')) { // Allow switching if the ball is not controlled or controlled by Team B
        switchPlayer();
    }
});

// Handle key up events
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Switch to the closest player
function switchPlayer() {
    const closestPlayers = getTwoClosestPlayersToBall();
    const closestPlayerIndex = closestPlayers[0] === currentPlayerIndex ? closestPlayers[1] : closestPlayers[0];
    if (closestPlayerIndex !== -1) {
        currentPlayerIndex = closestPlayerIndex;
    }
}

// Get the indices of the two closest Team A players to the ball
function getTwoClosestPlayersToBall() {
    let closestPlayers = [-1, -1];
    let closestDistances = [Infinity, Infinity];

    players.forEach((player, index) => {
        if (player.team === 'A') {
            const distance = Math.hypot(player.x - ball.x, player.y - ball.y);
            if (distance < closestDistances[0]) {
                closestDistances[1] = closestDistances[0];
                closestPlayers[1] = closestPlayers[0];
                closestDistances[0] = distance;
                closestPlayers[0] = index;
            } else if (distance < closestDistances[1]) {
                closestDistances[1] = distance;
                closestPlayers[1] = index;
            }
        }
    });

    return closestPlayers;
}

gameLoop();
