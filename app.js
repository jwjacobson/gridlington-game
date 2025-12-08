const DIFFICULTIES = {
// Time each square stays colored, in milliseconds
  easy: 1000,
  medium: 750,
  hard: 500
};
const SQUARES = document.querySelectorAll(".square");
const TOTAL_TURNS = 30; // How many times a square lights up, and therefore the maximum possible score

let DIFFICULTY;
let PLAYER_SCORE = 0;

// Set colors from styles.css
const root = document.documentElement;
const PRIMARY_COLOR = getComputedStyle(root).getPropertyValue('--color-primary').trim();
const SECONDARY_COLOR = getComputedStyle(root).getPropertyValue('--color-secondary').trim();
const TERTIARY_COLOR = getComputedStyle(root).getPropertyValue('--color-tertiary').trim();
const BACKGROUND_COLOR = getComputedStyle(root).getPropertyValue('--color-background').trim();

function selectDifficulty() {
// Display the welcome and difficulty selection modal; assign difficulty based on the user's choice
  return new Promise((resolve) => {
    const modal = document.getElementById('difficultyModal');
    const buttons = modal.querySelectorAll('button');
    
    buttons.forEach(button => {
      button.onclick = () => {
        const difficulty = button.dataset.difficulty;
        resolve(DIFFICULTIES[difficulty]); 
        modal.close();
      };
    });
    
    modal.showModal();
  });
}

function playAgain() {
// Display the game over modal; launch the game again or display the closing animation, based on the user's choice
  const modal = document.getElementById('replayModal');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const quitBtn = document.getElementById('quitBtn');
  const finalScoreSpan = document.getElementById('finalScore');
  
  finalScoreSpan.textContent = PLAYER_SCORE;

  playAgainBtn.onclick = () => {
    modal.close();
    PLAYER_SCORE = 0;
    runGame();
  };
  
  quitBtn.onclick = () => {
    modal.close();

    const thanksSquare = document.getElementById('thanksSquare');
    const forSquare = document.getElementById('forSquare');
    const playingSquare = document.getElementById('playingSquare');
  
    const thanksText = thanksSquare.querySelector('h1');
    const forText = forSquare.querySelector('h1');
    const playingText = playingSquare.querySelector('h1');
    
    setTimeout(() => {
      changeColor(thanksSquare, TERTIARY_COLOR);
      thanksText.textContent = 'Thanks';
    }, 400);
  
    setTimeout(() => {
      changeColor(forSquare, TERTIARY_COLOR);
      forText.textContent = 'for';
    }, 1000);

    setTimeout(() => {
      changeColor(playingSquare, SECONDARY_COLOR);
      playingText.textContent = 'playing!';
    }, 1600);
  };
  
  modal.showModal();
}

function changeColor (square, color) {
    square.style.backgroundColor = color;
}

function revertColor (square) {
    square.style.backgroundColor = BACKGROUND_COLOR; 
}

function makeTarget (square) {
    square.dataset.target = "true";
}

function removeTarget (square) {
    delete square.dataset.target;
}

function handleClick (event) {
    const clickedSquare = event.target;

    if (clickedSquare.dataset.target === "true") {
        removeTarget(clickedSquare);
        changeColor(clickedSquare, SECONDARY_COLOR);
        PLAYER_SCORE += 1 
        flash();
    } 
}

function flash () {
// Very slightly increase the brightness of the whole page for a subtle flash effect.
    document.documentElement.style.filter = 'brightness(1.01)';
    setTimeout(() => document.documentElement.style.filter = '', 25);
}

function runGame() {
    let prev_square;
    let turn = 0;

    const intervalId = setInterval(() => {
        if (prev_square !== undefined) {
            removeTarget(prev_square);
            revertColor(prev_square);
        }

        if (turn  > TOTAL_TURNS) {
            clearInterval(intervalId);
            playAgain(PLAYER_SCORE);
            return;
        }
 
        let current_square = SQUARES[Math.floor(Math.random() * SQUARES.length)];
 
        changeColor(current_square, TERTIARY_COLOR);
        makeTarget(current_square);

        prev_square = current_square;
        turn++;
    }, DIFFICULTY);
}

SQUARES.forEach(square => {
    square.addEventListener('click', handleClick);
});

selectDifficulty().then(difficulty => {
  DIFFICULTY = difficulty;
  runGame();
});