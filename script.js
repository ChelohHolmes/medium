document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const screens = {
        start: document.getElementById('start-screen'),
        playerSetup: document.getElementById('player-setup-screen'),
        game: document.getElementById('game-screen'),
        gameOver: document.getElementById('game-over-screen'),
    };
    const buttons = {
        play: document.getElementById('play-btn'),
        instructions: document.getElementById('instructions-btn'),
        darkModeToggle: document.getElementById('dark-mode-toggle'),
        addPlayer: document.getElementById('add-player-btn'),
        startGame: document.getElementById('start-game-btn'),
        backToStart: document.getElementById('back-to-start-btn'),
        continueTurn: document.getElementById('continue-turn-btn'),
        meldCorrect: document.getElementById('meld-correct-btn'),
        meldIncorrect: document.getElementById('meld-incorrect-btn'),
        playAgain: document.getElementById('play-again-btn'),
    };
    const inputs = {
        playerName: document.getElementById('player-name-input'),
    };
    const displays = {
        playerList: document.getElementById('player-list'),
        currentPlayerName: document.getElementById('current-player-name-display'),
        crystalBallCount: document.getElementById('crystal-ball-count'),
        playerActionPrompt: document.getElementById('player-action-prompt'),
        playerHandArea: document.getElementById('player-hand-area'),
        selectedCardsArea: document.getElementById('selected-cards-area'),
        countdown: document.getElementById('countdown-display'),
        meldControls: document.getElementById('meld-controls'),
        finalScoresList: document.getElementById('final-scores-list'),
        playerScoresArea: document.getElementById('player-scores-area'),
    };
    const modals = {
        instructions: document.getElementById('instructions-modal'),
        closeInstructions: document.querySelector('#instructions-modal .close-button'),
    };

    // --- Game State Variables ---
    let players = []; // { name: "P1", hand: [], scoreWithLeft: 0, scoreWithRight: 0, totalScore: 0, id: 0 }
    let currentPlayerIndex = 0;
    let currentPartnerIndex = 0;
    let deck = [];
    let crystalBallsDrawn = 0;
    const MAX_CRYSTAL_BALLS = 3;
    const CARDS_PER_HAND = 6;
    let ALL_CARD_SETS = [];
    const CRYSTAL_BALL_PLACEHOLDERS = [
        { id: 'CB1', text: 'Crystal Ball', type: 'crystalBall' },
        { id: 'CB2', text: 'Crystal Ball', type: 'crystalBall' },
        { id: 'CB3', text: 'Crystal Ball', type: 'crystalBall' }
    ];

    let gamePhase = ''; // 'player1Picking', 'player2Picking', 'revealing', 'scoring', 'waitingForContinue'
    let player1SelectedCard = null;
    let player2SelectedCard = null;
    let currentMeldAttempts = 0;
    const MAX_MELD_ATTEMPTS = 3;

    // --- Utility Functions ---
    function switchScreen(screenId) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenId].classList.add('active');
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function generateCardSets() {
        ALL_CARD_SETS = [];
        for (let i = 1; i <= 15; i++) {
            const set = [];
            for (let j = 1; j <= 18; j++) {
                set.push({ id: `S${i}-C${j}`, text: `Set ${i} Card ${j}`, type: 'word' });
            }
            ALL_CARD_SETS.push(set);
        }
    }

    // --- Dark Mode ---
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // --- Player Setup ---
    function addPlayer() {
        const playerName = inputs.playerName.value.trim();
        if (playerName && players.length < 8) { // Max 8 players for card set logic for now
            players.push({ name: playerName, hand: [], scoreWithLeft: 0, scoreWithRight: 0, totalScore: 0, id: players.length });
            inputs.playerName.value = '';
            renderPlayerList();
            updateStartGameButton();
        } else if (players.length >= 8) {
            alert("Maximum of 8 players.");
        }
    }

    function removePlayer(index) {
        players.splice(index, 1);
        // Re-assign IDs if necessary, though for this game it might not be critical if using index
        players.forEach((p, i) => p.id = i);
        renderPlayerList();
        updateStartGameButton();
    }

    function renderPlayerList() {
        displays.playerList.innerHTML = '';
        players.forEach((player, index) => {
            const li = document.createElement('li');
            li.textContent = player.name;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.classList.add('remove-player-btn');
            removeBtn.onclick = () => removePlayer(index);
            li.appendChild(removeBtn);
            displays.playerList.appendChild(li);
        });
    }

    function updateStartGameButton() {
        buttons.startGame.disabled = players.length < 3;
    }

    // --- Game Setup ---
    function setupGame() {
        generateCardSets(); // Ensure cards are generated
        deck = [];
        crystalBallsDrawn = 0;
        displays.crystalBallCount.textContent = crystalBallsDrawn;

        // Determine number of sets based on player count
        let numSetsToUse;
        if (players.length <= 3) numSetsToUse = 3;
        else if (players.length <= 5) numSetsToUse = 6;
        else if (players.length <= 7) numSetsToUse = 9;
        else numSetsToUse = 12; // 8+ players

        let wordCards = [];
        for (let i = 0; i < numSetsToUse; i++) {
            if (ALL_CARD_SETS[i]) { // Check if set exists
                 wordCards = wordCards.concat(ALL_CARD_SETS[i]);
            }
        }

        deck = [...wordCards, ...CRYSTAL_BALL_PLACEHOLDERS];
        shuffleArray(deck);

        players.forEach(player => {
            player.hand = [];
            player.scoreWithLeft = 0;
            player.scoreWithRight = 0;
            player.totalScore = 0;
            for (let i = 0; i < CARDS_PER_HAND; i++) {
                drawCardForPlayer(player);
            }
        });

        currentPlayerIndex = 0;
        currentPartnerIndex = (currentPlayerIndex + 1) % players.length;
        updatePlayerScoresDisplay();
        startTurn();
    }

    function drawCardForPlayer(player) {
        if (deck.length === 0) return null; // No cards left

        const card = deck.pop();
        if (card.type === 'crystalBall') {
            crystalBallsDrawn++;
            displays.crystalBallCount.textContent = crystalBallsDrawn;
            // Player immediately draws another card (if available)
            if (crystalBallsDrawn >= MAX_CRYSTAL_BALLS) {
                // Game end condition met during draw
                // This card is effectively set aside.
                // No need to add to hand, just check for game over.
                return null; // Don't add to hand, will trigger game end check
            }
            // If game not over, draw replacement
            return drawCardForPlayer(player); // Recursive call to get a non-CB card or exhaust deck
        } else {
            player.hand.push(card);
            return card;
        }
    }


    // --- Gameplay ---
    function startTurn() {
        if (checkGameOver()) return;

        currentMeldAttempts = 0;
        player1SelectedCard = null;
        player2SelectedCard = null;
        displays.selectedCardsArea.innerHTML = '';
        displays.meldControls.style.display = 'none';
        buttons.continueTurn.style.display = 'block';
        buttons.continueTurn.textContent = 'Continue';

        const currentPlayer = players[currentPlayerIndex];
        displays.currentPlayerName.textContent = `${currentPlayer.name}`;
        displays.playerActionPrompt.textContent = `${currentPlayer.name}, it's your turn to pick a card. Click "Continue".`;
        gamePhase = 'waitingForContinue';
        renderPlayerHand(currentPlayer, false); // Show current player's hand but not pickable yet
        updatePlayerScoresDisplay();
    }

    function handleContinueTurn() {
        buttons.continueTurn.style.display = 'none';
        const currentPlayer = players[currentPlayerIndex];
        displays.playerActionPrompt.textContent = `${currentPlayer.name}, select a card from your hand.`;
        gamePhase = 'player1Picking';
        renderPlayerHand(currentPlayer, true); // Make cards pickable
    }

    function renderPlayerHand(player, pickable) {
        displays.playerHandArea.innerHTML = '';
        player.hand.forEach(card => {
            const cardDiv = createCardElement(card);
            if (pickable) {
                cardDiv.onclick = () => handleCardSelection(card, player);
            }
            displays.playerHandArea.appendChild(cardDiv);
        });
    }
    
    function createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.textContent = card.text; // Show card text (placeholder for now)
        if (card.type === 'crystalBall') {
            cardDiv.classList.add('crystal-ball');
        }
        cardDiv.dataset.cardId = card.id;
        return cardDiv;
    }

    function handleCardSelection(selectedCard, player) {
        if (gamePhase === 'player1Picking' && player === players[currentPlayerIndex]) {
            player1SelectedCard = selectedCard;
            // Remove from hand visually or mark as selected
            player.hand = player.hand.filter(card => card.id !== selectedCard.id);
            renderPlayerHand(player, false); // Re-render hand without selected card
            
            // Display selected card
            displays.selectedCardsArea.innerHTML = ''; // Clear previous if any
            const card1Div = createCardElement(player1SelectedCard);
            card1Div.classList.add('selected-for-meld');
            displays.selectedCardsArea.appendChild(card1Div);

            // Move to partner's turn
            currentPartnerIndex = (currentPlayerIndex + 1) % players.length;
            const partner = players[currentPartnerIndex];
            displays.currentPlayerName.textContent = `${partner.name}`; // Update display
            displays.playerActionPrompt.textContent = `${partner.name}, select a card to meld with ${players[currentPlayerIndex].name}'s card.`;
            gamePhase = 'player2Picking';
            renderPlayerHand(partner, true);

        } else if (gamePhase === 'player2Picking' && player === players[currentPartnerIndex]) {
            player2SelectedCard = selectedCard;
            player.hand = player.hand.filter(card => card.id !== selectedCard.id);
            renderPlayerHand(player, false);

            // Display second selected card
            const card2Div = createCardElement(player2SelectedCard);
            card2Div.classList.add('selected-for-meld');
            displays.selectedCardsArea.appendChild(card2Div);
            
            displays.playerActionPrompt.textContent = 'Get ready to meld!';
            displays.playerHandArea.innerHTML = ''; // Clear hands from view
            startMeldCountdown();
        }
    }

    function startMeldCountdown() {
        gamePhase = 'revealing';
        let countdown = 5;
        displays.countdown.textContent = countdown;
        displays.countdown.style.display = 'block';

        const interval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                displays.countdown.textContent = countdown;
            } else {
                clearInterval(interval);
                displays.countdown.style.display = 'none';
                displays.playerActionPrompt.textContent = `Did ${players[currentPlayerIndex].name} and ${players[currentPartnerIndex].name} say the same word? (Attempt ${currentMeldAttempts + 1})`;
                displays.meldControls.style.display = 'flex';
                gamePhase = 'scoring';
            }
        }, 1000);
    }

    function handleMeldResult(correct) {
        displays.meldControls.style.display = 'none';
        currentMeldAttempts++;

        if (correct) {
            let pointsAwarded = 0;
            if (currentMeldAttempts === 1) pointsAwarded = 5;
            else if (currentMeldAttempts === 2) pointsAwarded = 3;
            else if (currentMeldAttempts === 3) pointsAwarded = 1;

            players[currentPlayerIndex].scoreWithRight += pointsAwarded;
            players[currentPartnerIndex].scoreWithLeft += pointsAwarded;
            
            displays.playerActionPrompt.textContent = `Correct! ${pointsAwarded} points awarded.`;
            finalizeTurn();
        } else {
            if (currentMeldAttempts < MAX_MELD_ATTEMPTS) {
                displays.playerActionPrompt.textContent = `Incorrect. Try again for attempt ${currentMeldAttempts + 1}! Prepare to say new words for the same cards.`;
                // Re-show selected cards if needed, they are already there
                // No countdown for subsequent attempts as per simplified flow, straight to buttons
                startMeldCountdown(); // Or go straight to buttons:
                // displays.playerActionPrompt.textContent = `Did ${players[currentPlayerIndex].name} and ${players[currentPartnerIndex].name} say the same word? (Attempt ${currentMeldAttempts + 1})`;
                // displays.meldControls.style.display = 'flex';
                // gamePhase = 'scoring';
            } else {
                displays.playerActionPrompt.textContent = 'Incorrect. No points this round.';
                finalizeTurn();
            }
        }
        updatePlayerScoresDisplay();
    }

    function finalizeTurn() {
        // Players draw back up to CARDS_PER_HAND
        drawCardForPlayer(players[currentPlayerIndex]); // Will handle CBs
        while (players[currentPlayerIndex].hand.length < CARDS_PER_HAND && deck.length > 0) {
             if (drawCardForPlayer(players[currentPlayerIndex]) === null && crystalBallsDrawn >= MAX_CRYSTAL_BALLS) break;
        }

        drawCardForPlayer(players[currentPartnerIndex]); // Will handle CBs
        while (players[currentPartnerIndex].hand.length < CARDS_PER_HAND && deck.length > 0) {
            if (drawCardForPlayer(players[currentPartnerIndex]) === null && crystalBallsDrawn >= MAX_CRYSTAL_BALLS) break;
        }

        // Discard played cards (conceptually, they are gone from hands)
        player1SelectedCard = null;
        player2SelectedCard = null;
        displays.selectedCardsArea.innerHTML = '';


        if (checkGameOver()) return;

        // Move to next player
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        setTimeout(startTurn, 2000); // Brief delay before next turn
    }

    function updatePlayerScoresDisplay() {
        displays.playerScoresArea.innerHTML = '';
        players.forEach((p, idx) => {
            const leftPartnerIdx = (idx - 1 + players.length) % players.length;
            const rightPartnerIdx = (idx + 1) % players.length;
            const scoreText = `<strong>${p.name}</strong>: Score with ${players[leftPartnerIdx].name} (Left): ${p.scoreWithLeft}, Score with ${players[rightPartnerIdx].name} (Right): ${p.scoreWithRight}`;
            const div = document.createElement('div');
            div.innerHTML = scoreText;
            displays.playerScoresArea.appendChild(div);
        });
    }


    // --- Game Over ---
    function checkGameOver() {
        if (crystalBallsDrawn >= MAX_CRYSTAL_BALLS) {
            endGame();
            return true;
        }
        // Optional: Check if deck runs out and players can't make pairs (more complex)
        return false;
    }

    function endGame() {
        gamePhase = 'gameOver';
        displays.playerActionPrompt.textContent = 'Game Over!';
        players.forEach(p => {
            p.totalScore = p.scoreWithLeft + p.scoreWithRight;
        });

        // Sort players by total score descending
        const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

        displays.finalScoresList.innerHTML = '';
        sortedPlayers.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `${p.name}: ${p.totalScore} points (Left: ${p.scoreWithLeft}, Right: ${p.scoreWithRight})`;
            displays.finalScoresList.appendChild(li);
        });
        switchScreen('gameOver');
    }

    function resetGame() {
        players = [];
        deck = [];
        crystalBallsDrawn = 0;
        currentPlayerIndex = 0;
        gamePhase = '';
        player1SelectedCard = null;
        player2SelectedCard = null;
        currentMeldAttempts = 0;

        displays.playerList.innerHTML = '';
        displays.crystalBallCount.textContent = '0';
        displays.playerHandArea.innerHTML = '';
        displays.selectedCardsArea.innerHTML = '';
        displays.finalScoresList.innerHTML = '';
        displays.playerActionPrompt.textContent = '';
        displays.countdown.style.display = 'none';
        displays.meldControls.style.display = 'none';
        buttons.startGame.disabled = true;
        switchScreen('start');
    }

    // --- Event Listeners ---
    buttons.play.onclick = () => switchScreen('playerSetup');
    buttons.backToStart.onclick = () => {
        // Optionally clear player setup state if desired
        // players = []; renderPlayerList(); updateStartGameButton();
        switchScreen('start');
    };
    buttons.darkModeToggle.onclick = toggleDarkMode;

    buttons.addPlayer.onclick = addPlayer;
    inputs.playerName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer();
    });

    buttons.startGame.onclick = () => {
        switchScreen('game');
        setupGame();
    };

    buttons.continueTurn.onclick = handleContinueTurn;
    buttons.meldCorrect.onclick = () => handleMeldResult(true);
    buttons.meldIncorrect.onclick = () => handleMeldResult(false);

    buttons.playAgain.onclick = resetGame;

    // Instructions Modal
    buttons.instructions.onclick = () => modals.instructions.classList.add('active');
    modals.closeInstructions.onclick = () => modals.instructions.classList.remove('active');
    window.onclick = (event) => { // Close if click outside
        if (event.target == modals.instructions) {
            modals.instructions.classList.remove('active');
        }
    };

    // --- Initial Setup ---
    switchScreen('start'); // Show start screen initially
    updateStartGameButton();
});
