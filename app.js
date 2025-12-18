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
let lastSavedTimestamp = null; // Track the timestamp of the most recently saved highscore

// Set colors from styles.css
const root = document.documentElement;
const PRIMARY_COLOR = getComputedStyle(root).getPropertyValue('--color-primary').trim();
const SECONDARY_COLOR = getComputedStyle(root).getPropertyValue('--color-secondary').trim();
const TERTIARY_COLOR = getComputedStyle(root).getPropertyValue('--color-tertiary').trim();
const BACKGROUND_COLOR = getComputedStyle(root).getPropertyValue('--color-background').trim();

function selectDifficulty() {
// Display the welcome and difficulty selection modal; assign difficulty based on the user's choice
  return new Promise((resolve) => {
    const modal = document.getElementById('welcomeModal');
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

async function checkHighscore(score) {
// Check if the score qualifies for the top 10
  try {
    const { db, collection, query, orderBy, getDocs } = window.gameDB;
    const q = query(
      collection(db, 'highscores'),
      orderBy('score', 'desc'),
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.size < 10) {
      return true;
    }
    
    const lowestHighscore = snapshot.docs[snapshot.size - 1].data().score;
    return score > lowestHighscore;
  } catch (error) {
    console.error('Error checking highscores:', error);
    return false;
  }
}

async function saveHighscore(initials, score) {
// Save the highscore to Firebase and manage the top 10 limit
  try {
    const { db, collection, addDoc, query, orderBy, getDocs, deleteDoc, doc } = window.gameDB;
    
    const timestamp = Date.now();
    await addDoc(collection(db, 'highscores'), {
      initials: initials.toUpperCase().substring(0, 3),
      score: score,
      timestamp: timestamp
    });
    
    const q = query(
      collection(db, 'highscores'),
      orderBy('score', 'desc'),
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.size > 10) {
      const docsToDelete = snapshot.docs.slice(10);
      for (const docToDelete of docsToDelete) {
        await deleteDoc(doc(db, 'highscores', docToDelete.id));
      }
    }
    
    lastSavedTimestamp = timestamp;
    return true;
  } catch (error) {
    console.error('Error saving highscore:', error);
    return false;
  }
}

async function loadHighscores() {
// Load and display the top 10 highscores
  try {
    const { db, collection, query, orderBy, getDocs } = window.gameDB;
    const q = query(
      collection(db, 'highscores'),
      orderBy('score', 'desc'),
    );
    const snapshot = await getDocs(q);
    
    const highscoresList = document.getElementById('highscoresList');
    highscoresList.innerHTML = '';
    
    const scores = snapshot.docs.map(doc => doc.data());
    
    // Always display 10 ranks
    for (let i = 0; i < 10; i++) {
      const entry = document.createElement('div');
      entry.className = 'highscore-entry';
      
      if (scores[i]) {
        // Highlight if this is the newly saved score (match by timestamp)
        const isNewScore = lastSavedTimestamp && 
                          scores[i].timestamp === lastSavedTimestamp;
        
        if (isNewScore) {
          entry.classList.add('highlight');
        }
        
        entry.innerHTML = `
          <span class="rank">${i + 1}.</span>
          <span class="initials">${scores[i].initials}</span>
          <span class="score">${scores[i].score}</span>
        `;
      } else {
        entry.innerHTML = `
          <span class="rank">${i + 1}.</span>
          <span class="initials">---</span>
          <span class="score">---</span>
        `;
      }
      
      highscoresList.appendChild(entry);
    }
  } catch (error) {
    console.error('Error loading highscores:', error);
    const highscoresList = document.getElementById('highscoresList');
    highscoresList.innerHTML = '<p class="error">Error loading highscores</p>';
  }
}

function showHighscoreEntry() {
// Display the modal for entering initials
  return new Promise((resolve) => {
    const modal = document.getElementById('highscoreEntryModal');
    const scoreSpan = document.getElementById('highscoreEntryScore');
    const input = document.getElementById('initialsInput');
    const submitBtn = document.getElementById('submitHighscoreBtn');
    const skipBtn = document.getElementById('skipHighscoreBtn');
    
    scoreSpan.textContent = PLAYER_SCORE;
    input.value = '';
    input.focus();
    
    const handleSubmit = async () => {
      const initials = input.value.trim();
      if (initials.length > 0) {
        await saveHighscore(initials, PLAYER_SCORE);
      }
      modal.close();
      resolve();
    };
    
    const handleSkip = () => {
      lastSavedTimestamp = null; // Don't highlight anything if skipped
      modal.close();
      resolve();
    };
    
    submitBtn.onclick = handleSubmit;
    skipBtn.onclick = handleSkip;
    
    input.onkeypress = (e) => {
      if (e.key === 'Enter' && input.value.trim().length > 0) {
        handleSubmit();
      }
    };
    
    modal.showModal();
  });
}

async function showReplayModal() {
// Display the combined replay/highscores modal
  await loadHighscores();
  
  const modal = document.getElementById('replayModal');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const quitBtn = document.getElementById('quitBtn');
  const finalScoreSpan = document.getElementById('finalScore');
  
  finalScoreSpan.textContent = PLAYER_SCORE;

  playAgainBtn.onclick = () => {
    modal.close();
    lastSavedTimestamp = null; // Reset for next round
    PLAYER_SCORE = 0;
    runGame();
  };
  
  quitBtn.onclick = () => {
    modal.close();
    lastSavedTimestamp = null; // Reset

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

async function playAgain() {
// Check for highscore and display the appropriate modals
  const isHighscore = await checkHighscore(PLAYER_SCORE);
  
  if (isHighscore && PLAYER_SCORE > 0) {
    await showHighscoreEntry();
  } else {
    lastSavedTimestamp = null; // No new highscore to highlight
  }
  
  await showReplayModal();
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
