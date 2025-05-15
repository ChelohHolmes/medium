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
        // gameActionBtn will be our multi-purpose button: "Continue", "Choose Card"
        gameAction: document.getElementById('continue-turn-btn'), // Re-using existing button
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
    let players = [];
    let currentPlayerIndex = 0;
    let currentPartnerIndex = 0;
    let deck = [];
    let crystalBallsDrawn = 0;
    const MAX_CRYSTAL_BALLS = 3;
    const CARDS_PER_HAND = 6;
    let ALL_CARD_SETS = [];
    const CRYSTAL_BALL_CARDS = [
        { id: 'CB1', text: 'Crystal Ball', type: 'crystalBall' },
        { id: 'CB2', text: 'Crystal Ball', type: 'crystalBall' },
        { id: 'CB3', text: 'Crystal Ball', type: 'crystalBall' }
    ];

    // REVISED Game phases:
    // 'turnInterstitialP1', 'p1DisplayingHand', 'p1CardHighlighted',
    // 'turnInterstitialP2', 'p2DisplayingHand', 'p2CardHighlighted',
    // 'countdown', 'meldDecision', 'turnOver'
    let gamePhase = '';
    let tempSelectedCardForP1 = null; // Card P1 highlighted but not yet chosen
    let player1FinalSelectedCard = null; // Card P1 confirmed
    let tempSelectedCardForP2 = null; // Card P2 highlighted
    let player2FinalSelectedCard = null; // Card P2 confirmed
    let currentMeldAttempts = 0;
    const MAX_MELD_ATTEMPTS = 3;
    const MELD_POINTS = [5, 3, 1];

    // --- Utility Functions (shuffleArray, generateCardSets, switchScreen as before) ---
    function switchScreen(screenId) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        if (screens[screenId]) screens[screenId].classList.add('active');
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
                set.push({ id: `S${i}-C${j}`, text: `Word ${i}-${j}`, type: 'word' });
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

    // --- Player Setup (addPlayerHandler, removePlayer, renderPlayerList, updateStartGameButton as before) ---
    function addPlayerHandler() {
        const playerName = inputs.playerName.value.trim();
        if (playerName && players.length < 8) {
            players.push({ name: playerName, hand: [], scoreWithLeft: 0, scoreWithRight: 0, id: players.length });
            inputs.playerName.value = '';
            renderPlayerList();
            updateStartGameButton();
        } else if (players.length >= 8) {
            alert("Maximum of 8 players allowed.");
        } else if (!playerName) {
            alert("Please enter a player name.");
        }
    }

    function removePlayer(indexToRemove) {
        players.splice(indexToRemove, 1);
        players.forEach((player, i) => player.id = i);
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
            removeBtn.classList.add('remove-player-btn', 'btn', 'btn-danger');
            removeBtn.style.fontSize = '0.8em'; 
            removeBtn.style.padding = '4px 8px';
            removeBtn.onclick = () => removePlayer(index);
            li.appendChild(removeBtn);
            displays.playerList.appendChild(li);
        });
    }
    function updateStartGameButton() {
        buttons.startGame.disabled = players.length < 3 || players.length > 8;
    }

    // --- Game Setup (initializeGame, drawCardForPlayer as before, with minor tweaks) ---
    function initializeGame() {
        // ... (generation of deck, shuffling, dealing initial hands remains same) ...
        generateCardSets();
        deck = [];
        crystalBallsDrawn = 0;
        displays.crystalBallCount.textContent = crystalBallsDrawn;

        let numSetsToUse;
        const numPlayers = players.length;
        if (numPlayers <= 3) numSetsToUse = 3;
        else if (numPlayers <= 5) numSetsToUse = 6;
        else if (numPlayers <= 7) numSetsToUse = 9;
        else numSetsToUse = 12; 

        let wordCardsForGame = [];
        for (let i = 0; i < numSetsToUse; i++) {
            if (ALL_CARD_SETS[i]) {
                wordCardsForGame = wordCardsForGame.concat(ALL_CARD_SETS[i]);
            }
        }

        deck = [...wordCardsForGame, ...CRYSTAL_BALL_CARDS];
        shuffleArray(deck);

        players.forEach(player => {
            player.hand = [];
            player.scoreWithLeft = 0;
            player.scoreWithRight = 0;
            for (let i = 0; i < CARDS_PER_HAND; i++) {
                drawCardForPlayer(player, true); 
            }
        });
        
        if (checkGameOver(true)) return;

        currentPlayerIndex = 0;
        updateActivePlayerScoresDisplay(); // MODIFIED to show only active player's score
        switchScreen('game');
        setupTurnInterstitialP1(); // START with P1 interstitial
    }

    function drawCardForPlayer(player, isInitialDeal = false) {
        if (deck.length === 0) return null;
        const drawnCard = deck.pop();
        if (drawnCard.type === 'crystalBall') {
            crystalBallsDrawn++;
            displays.crystalBallCount.textContent = crystalBallsDrawn;
            if (checkGameOver(isInitialDeal)) return null;
            return drawCardForPlayer(player, isInitialDeal);
        } else {
            player.hand.push(drawnCard);
            return drawnCard;
        }
    }

    // --- REVISED Gameplay Flow ---

    function setupTurnInterstitialP1() {
        if (checkGameOver()) return;
        gamePhase = 'turnInterstitialP1';
        const currentPlayer = players[currentPlayerIndex];
        currentPartnerIndex = (currentPlayerIndex + 1) % players.length; // Determine partner now

        displays.playerActionPrompt.textContent = `${currentPlayer.name}'s Turn to Pick First Card`;
        displays.currentPlayerName.textContent = `${currentPlayer.name} (with ${players[currentPartnerIndex].name})`;
        
        displays.playerHandArea.innerHTML = ''; // Hide hand
        displays.selectedCardsArea.innerHTML = ''; // Hide selected cards
        displays.playerHandArea.classList.add('hidden-during-interstitial');
        displays.selectedCardsArea.classList.add('hidden-during-interstitial');

        buttons.gameAction.textContent = 'Continue';
        buttons.gameAction.disabled = false;
        buttons.gameAction.style.display = 'block';
        displays.meldControls.style.display = 'none';
        displays.countdown.style.display = 'none';

        updateActivePlayerScoresDisplay(); // Show scores for currentPlayerIndex
        tempSelectedCardForP1 = null; // Reset temp selections
        player1FinalSelectedCard = null;
        tempSelectedCardForP2 = null;
        player2FinalSelectedCard = null;
        currentMeldAttempts = 0; // Reset for new pair
    }
    
    function setupTurnInterstitialP2() {
        gamePhase = 'turnInterstitialP2';
        const partnerPlayer = players[currentPartnerIndex];
        displays.playerActionPrompt.textContent = `${partnerPlayer.name}'s Turn to Pick Second Card`;
        // currentPlayerName display already set to show both current and partner

        displays.playerHandArea.innerHTML = ''; // Hide hand
        displays.playerHandArea.classList.add('hidden-during-interstitial');
        // selectedCardsArea should show P1's card
        displays.selectedCardsArea.classList.remove('hidden-during-interstitial');
        renderPlayer1FinalSelectedCard();


        buttons.gameAction.textContent = 'Continue';
        buttons.gameAction.disabled = false;
        buttons.gameAction.style.display = 'block';
        displays.meldControls.style.display = 'none';
        displays.countdown.style.display = 'none';
    }

    function handleGameActionClick() { // Central handler for the main game button
        switch (gamePhase) {
            case 'turnInterstitialP1':
                setupPlayer1CardDisplay();
                break;
            case 'turnInterstitialP2':
                setupPlayer2CardDisplay();
                break;
            case 'p1CardHighlighted': // "Choose Card" for P1
                player1FinalSelectedCard = tempSelectedCardForP1;
                players[currentPlayerIndex].hand = players[currentPlayerIndex].hand.filter(card => card.id !== player1FinalSelectedCard.id);
                tempSelectedCardForP1 = null; 
                buttons.gameAction.disabled = true; // Disable until next phase sets it
                setupTurnInterstitialP2();
                break;
            case 'p2CardHighlighted': // "Choose Card" for P2
                player2FinalSelectedCard = tempSelectedCardForP2;
                players[currentPartnerIndex].hand = players[currentPartnerIndex].hand.filter(card => card.id !== player2FinalSelectedCard.id);
                tempSelectedCardForP2 = null;
                buttons.gameAction.style.display = 'none'; // Hide "Choose Card" button
                startMeldAttempt(); // Start with attempt 1
                break;
        }
    }
    buttons.gameAction.onclick = handleGameActionClick; // Assign central handler

    function setupPlayer1CardDisplay() {
        gamePhase = 'p1DisplayingHand';
        const currentPlayer = players[currentPlayerIndex];
        displays.playerActionPrompt.textContent = `${currentPlayer.name}, select a card.`;
        displays.playerHandArea.classList.remove('hidden-during-interstitial');
        displays.selectedCardsArea.classList.remove('hidden-during-interstitial'); // Keep it consistent, though empty for P1 initially
        displays.selectedCardsArea.innerHTML = ''; // Ensure it's clear

        renderPlayerHand(currentPlayer, true, 1); // Render for P1, pickable
        buttons.gameAction.textContent = 'Choose Card';
        buttons.gameAction.disabled = true; // Disabled until a card is highlighted
    }
    
    function setupPlayer2CardDisplay() {
        gamePhase = 'p2DisplayingHand';
        const partnerPlayer = players[currentPartnerIndex];
        displays.playerActionPrompt.textContent = `${partnerPlayer.name}, select your card.`;
        displays.playerHandArea.classList.remove('hidden-during-interstitial');
        renderPlayer1FinalSelectedCard(); // Make sure P1's card is still shown
        
        renderPlayerHand(partnerPlayer, true, 2); // Render for P2, pickable
        buttons.gameAction.textContent = 'Choose Card';
        buttons.gameAction.disabled = true;
    }

    function renderPlayerHand(player, isPickable, playerNumber) { // playerNumber 1 or 2
        displays.playerHandArea.innerHTML = '';
        if (!player || !player.hand) return;
        player.hand.forEach(card => {
            const cardDiv = createCardElement(card);
            // Check if this card is the currently tempSelected one for highlight
            if ((playerNumber === 1 && tempSelectedCardForP1 && card.id === tempSelectedCardForP1.id) ||
                (playerNumber === 2 && tempSelectedCardForP2 && card.id === tempSelectedCardForP2.id)) {
                cardDiv.classList.add('highlighted');
            }

            if (isPickable) {
                cardDiv.onclick = () => handleCardHighlight(card, playerNumber);
                cardDiv.setAttribute('aria-disabled', 'false');
                cardDiv.setAttribute('tabindex', '0');
                cardDiv.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleCardHighlight(card, playerNumber);
                });
            } else {
                cardDiv.setAttribute('aria-disabled', 'true');
            }
            displays.playerHandArea.appendChild(cardDiv);
        });
    }
    
    function createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.textContent = card.text;
        if (card.type === 'crystalBall') cardDiv.classList.add('crystal-ball');
        cardDiv.dataset.cardId = card.id;
        return cardDiv;
    }
    
    function handleCardHighlight(selectedCard, playerNumber) {
        let playerWhoseHandIsDisplayed;
        if (playerNumber === 1) {
            tempSelectedCardForP1 = selectedCard;
            gamePhase = 'p1CardHighlighted';
            playerWhoseHandIsDisplayed = players[currentPlayerIndex];
        } else { // playerNumber === 2
            tempSelectedCardForP2 = selectedCard;
            gamePhase = 'p2CardHighlighted';
            playerWhoseHandIsDisplayed = players[currentPartnerIndex];
        }
        
        // Re-render the current hand to show the highlight and unhighlight others
        renderPlayerHand(playerWhoseHandIsDisplayed, true, playerNumber);
        buttons.gameAction.disabled = false; // Enable "Choose Card"
    }

    function renderPlayer1FinalSelectedCard() {
        displays.selectedCardsArea.innerHTML = '';
        if (player1FinalSelectedCard) {
            const card1Div = createCardElement(player1FinalSelectedCard);
            card1Div.classList.add('selected-for-meld'); // A different class than 'highlighted'
            displays.selectedCardsArea.appendChild(card1Div);
        }
    }
    
    function renderBothFinalSelectedCards() {
        displays.selectedCardsArea.innerHTML = '';
        if (player1FinalSelectedCard) {
            const card1Div = createCardElement(player1FinalSelectedCard);
            card1Div.classList.add('selected-for-meld');
            displays.selectedCardsArea.appendChild(card1Div);
        }
        if (player2FinalSelectedCard) {
            const card2Div = createCardElement(player2FinalSelectedCard);
            card2Div.classList.add('selected-for-meld');
            displays.selectedCardsArea.appendChild(card2Div);
        }
    }

    function startMeldAttempt() { // Called after both players have CHOSEN cards
        currentMeldAttempts++; // This is now attempt 1, 2, or 3
        gamePhase = 'countdown';
        displays.playerHandArea.innerHTML = ''; // Clear hands from view
        renderBothFinalSelectedCards(); // Show both chosen cards

        let count = (currentMeldAttempts === 1) ? 5 : 3; // MODIFIED countdown time
        displays.countdown.textContent = count;
        displays.countdown.style.display = 'block';
        displays.playerActionPrompt.textContent = `Attempt ${currentMeldAttempts}: Get ready to say your word!`;

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                displays.countdown.textContent = count;
            } else {
                clearInterval(interval);
                displays.countdown.style.display = 'none';
                promptMeldDecision();
            }
        }, 1000);
    }

    function promptMeldDecision() {
        gamePhase = 'meldDecision';
        displays.playerActionPrompt.textContent = `Attempt ${currentMeldAttempts}: Did ${players[currentPlayerIndex].name} and ${players[currentPartnerIndex].name} say the same word?`;
        displays.meldControls.style.display = 'flex';
    }

    function handleMeldResult(wasCorrect) {
        displays.meldControls.style.display = 'none';

        if (wasCorrect) {
            const points = MELD_POINTS[currentMeldAttempts - 1];
            players[currentPlayerIndex].scoreWithRight += points;
            players[currentPartnerIndex].scoreWithLeft += points;
            displays.playerActionPrompt.textContent = `Correct! ${points} points awarded.`;
            updateActivePlayerScoresDisplay(); // Update scores
            finalizeTurnSegment();
        } else {
            if (currentMeldAttempts < MAX_MELD_ATTEMPTS) {
                displays.playerActionPrompt.textContent = `Incorrect. Prepare for attempt ${currentMeldAttempts + 1}.`;
                setTimeout(startMeldAttempt, 1500); // Calls startMeldAttempt, which will inc currentMeldAttempts
            } else {
                displays.playerActionPrompt.textContent = 'Incorrect. 0 points this round for this pair.';
                finalizeTurnSegment();
            }
        }
    }

    function finalizeTurnSegment() {
        gamePhase = 'turnOver';
        // Draw cards for P1 (currentPlayerIndex)
        while (players[currentPlayerIndex].hand.length < CARDS_PER_HAND && deck.length > 0) {
            if (drawCardForPlayer(players[currentPlayerIndex]) === null && checkGameOver()) return;
        }
        if (checkGameOver()) return;

        // Draw cards for P2 (currentPartnerIndex)
        while (players[currentPartnerIndex].hand.length < CARDS_PER_HAND && deck.length > 0) {
             if (drawCardForPlayer(players[currentPartnerIndex]) === null && checkGameOver()) return;
        }
        if (checkGameOver()) return;

        player1FinalSelectedCard = null; // Reset for next turn
        player2FinalSelectedCard = null;

        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        displays.playerActionPrompt.textContent = "Next turn...";
        setTimeout(setupTurnInterstitialP1, 2500); // Start next player's interstitial
    }

    function updateActivePlayerScoresDisplay() { // MODIFIED
        displays.playerScoresArea.innerHTML = ''; // Clear previous scores
        const activePlayer = players[currentPlayerIndex];
        if (!activePlayer) return;

        const leftPartnerIdx = (currentPlayerIndex - 1 + players.length) % players.length;
        const rightPartnerIdx = (currentPlayerIndex + 1) % players.length; // This is also currentPartnerIndex for meld
        
        const scoreDiv = document.createElement('div');
        scoreDiv.innerHTML = `<strong>${activePlayer.name}'s Scores</strong><br>
                              With ${players[leftPartnerIdx].name} (Left): ${activePlayer.scoreWithLeft}<br>
                              With ${players[rightPartnerIdx].name} (Right): ${activePlayer.scoreWithRight}`;
        displays.playerScoresArea.appendChild(scoreDiv);
    }


    // --- Game Over (checkGameOver, triggerEndGame, resetGameToStart as before) ---
    function checkGameOver(isInitialCheck = false) {
        if (crystalBallsDrawn >= MAX_CRYSTAL_BALLS) {
            if (!isInitialCheck) triggerEndGame();
            return true; 
        }
        return false; 
    }
    
    function triggerEndGame() {
        // ... (same as before: calculate total scores, sort, display on gameOver screen) ...
        gamePhase = 'gameOver';
        displays.playerActionPrompt.textContent = 'Game Over! Calculating final scores...';
        
        players.forEach(p => { p.totalScore = p.scoreWithLeft + p.scoreWithRight; });
        const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

        displays.finalScoresList.innerHTML = '';
        sortedPlayers.forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${p.name}: ${p.totalScore} points</strong> (L: ${p.scoreWithLeft} with ${players[(p.id - 1 + players.length) % players.length].name}, R: ${p.scoreWithRight} with ${players[(p.id + 1) % players.length].name})`;
            displays.finalScoresList.appendChild(li);
        });
        switchScreen('gameOver');
    }

    function resetGameToStart() {
        // ... (same as before: reset state, clear UI, switch to start screen) ...
        players = [];
        currentPlayerIndex = 0;
        deck = [];
        crystalBallsDrawn = 0;
        gamePhase = '';
        tempSelectedCardForP1 = null; player1FinalSelectedCard = null;
        tempSelectedCardForP2 = null; player2FinalSelectedCard = null;
        currentMeldAttempts = 0;

        displays.playerList.innerHTML = '';
        inputs.playerName.value = '';
        displays.crystalBallCount.textContent = '0';
        displays.playerHandArea.innerHTML = '';
        displays.selectedCardsArea.innerHTML = '';
        displays.finalScoresList.innerHTML = '';
        displays.playerActionPrompt.textContent = '';
        displays.countdown.style.display = 'none';
        displays.meldControls.style.display = 'none';
        buttons.gameAction.style.display = 'block'; // Ensure it's visible for new game
        buttons.startGame.disabled = true;
        
        switchScreen('start');
    }

    // --- Event Listeners (for start screen, player setup, modal as before) ---
    buttons.play.onclick = () => switchScreen('playerSetup');
    buttons.backToStart.onclick = () => {
        players = []; renderPlayerList(); updateStartGameButton();
        switchScreen('start');
    };
    buttons.darkModeToggle.onclick = toggleDarkMode;
    buttons.addPlayer.onclick = addPlayerHandler;
    inputs.playerName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addPlayerHandler(); }
    });
    buttons.startGame.onclick = () => {
        if (players.length >= 3 && players.length <= 8) initializeGame();
        else alert("Please add 3 to 8 players.");
    };
    // Main game action button is now handled by buttons.gameAction.onclick = handleGameActionClick above
    buttons.meldCorrect.onclick = () => handleMeldResult(true);
    buttons.meldIncorrect.onclick = () => handleMeldResult(false);
    buttons.playAgain.onclick = resetGameToStart;
    buttons.instructions.onclick = () => modals.instructions.classList.add('active');
    modals.closeInstructions.onclick = () => modals.instructions.classList.remove('active');
    window.onclick = (event) => { if (event.target === modals.instructions) modals.instructions.classList.remove('active'); };
    window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modals.instructions.classList.contains('active')) modals.instructions.classList.remove('active'); });

    // --- Initial Setup ---
    switchScreen('start');
    updateStartGameButton();
    generateCardSets();
});
