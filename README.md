# Medium - The Psychic Card Game (Web App)

This is a web-based implementation of the card game "Medium".

## How to Play (In-App Summary)

1.  **Start:** Open `index.html` in your browser.
2.  **Player Setup:**
    * Click "Play".
    * Enter names for 3 to 8 players. Click "Add Player" for each.
    * The "Start Game" button enables when at least 3 players are added.
    * Options for "Team Play" and "ESP Cards" are placeholders for now.
3.  **Gameplay:**
    * The game will guide players through turns.
    * **Player 1 (Current Player):** Clicks "Continue", then selects a card from their hand.
    * **Player 2 (Partner to the Right):** Is then prompted to select a card from their hand.
    * **Meld Attempt:** Both cards are shown. A 5-second countdown starts. Players A and B should simultaneously say a word they think connects the two cards.
    * After the countdown, click "Correct Meld" if they said the same word, or "Incorrect Meld".
    * **Scoring:**
        * 1st attempt correct: 5 points.
        * 2nd attempt correct: 3 points.
        * 3rd attempt correct: 1 point.
    * Players draw back to 6 cards. If a Crystal Ball card is drawn, it's revealed, and the counter increments.
    * The turn passes to the next player.
4.  **Game End:**
    * The game ends when 3 Crystal Ball cards are revealed.
    * Final scores are displayed. Each player's score is the sum of points earned with their left partner and their right partner.

## Future Development Notes

* Actual words for cards need to be provided and implemented.
* Two-player variation.
* Functional "Play in Teams" option.
* Functional "Use ESP Cards" option.
