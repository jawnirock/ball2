// ai.js

// Define player roles
const playerRoles = {
    defenders: [],
    midfielders: [],
    attackers: []
};

// Assign roles to players
players.forEach((player, index) => {
    if (index < 5) {
        playerRoles.defenders.push(player);
    } else if (index < 10) {
        playerRoles.midfielders.push(player);
    } else if (index < 15) {
        playerRoles.attackers.push(player);
    }
});

console.log('Player roles:', playerRoles);

// Function to initialize AI movements
function initializeAIMovements() {
    // Move midfielders and attackers of Team B 30 units to the left
    playerRoles.midfielders.concat(playerRoles.attackers).forEach(player => {
        if (player.team === 'B') {
            player.x -= 30;
            console.log(`Moved player ${player.team} to (${player.x}, ${player.y})`);
        }
    });
}

// Initialize AI movements immediately
initializeAIMovements();
