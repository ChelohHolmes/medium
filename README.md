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

## How to Host on GitHub Pages

1.  **Create a GitHub Repository:**
    * Go to [GitHub](https://github.com/) and create a new public repository (e.g., `medium-card-game`). Do *not* initialize it with a README, .gitignore, or license if you plan to push an existing local folder. If you do, you'll need to pull first.

2.  **Add Files to the Repository:**
    * **Using Git (Recommended):**
        1.  Open a terminal or Git Bash in your `medium-game` project folder.
        2.  Initialize a Git repository: `git init`
        3.  Add all your files: `git add index.html style.css script.js README.md`
        4.  Commit the files: `git commit -m "Initial commit of Medium game"`
        5.  Add the remote repository: `git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git` (Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME`)
        6.  Push the files to GitHub: `git push -u origin main` (or `master` if that's your default branch name)
    * **Using GitHub Website Upload:**
        1.  Go to your newly created repository on GitHub.
        2.  Click on "Add file" -> "Upload files".
        3.  Drag and drop `index.html`, `style.css`, `script.js`, and `README.md` into the upload area.
        4.  Commit the changes.

3.  **Enable GitHub Pages:**
    * In your repository on GitHub, go to "Settings".
    * In the left sidebar, click on "Pages".
    * Under "Build and deployment", for the "Source" option, select "Deploy from a branch".
    * Under "Branch", select your main branch (usually `main` or `master`) and `/ (root)` for the folder. Click "Save".

4.  **Access Your Game:**
    * GitHub Pages will build your site. It might take a minute or two.
    * Your game will be live at `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`.
    * (e.g., `https://johndoe.github.io/medium-card-game/`)

## Future Development Notes (from prompt)

* Actual words for cards need to be provided and implemented.
* Two-player variation.
* Functional "Play in Teams" option.
* Functional "Use ESP Cards" option.

---
This is a fairly comprehensive starting point based on your detailed request! Save these files in your `medium-game` folder, and you should be able to open `index.html` in a browser to test it locally before deploying to GitHub Pages. Let me know if you have the list of words or want to proceed with further features!
