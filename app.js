const SPEED = 1000; // Time each square stays colored, in milliseconds
const SQUARES = document.querySelectorAll(".square")

// Set colors from styles.css
const root = document.documentElement;
const PRIMARY_COLOR = getComputedStyle(root).getPropertyValue('--color-primary').trim();
const SECONDARY_COLOR = getComputedStyle(root).getPropertyValue('--color-secondary').trim();
const TERTIARY_COLOR = getComputedStyle(root).getPropertyValue('--color-tertiary').trim();
const BACKGROUND_COLOR = getComputedStyle(root).getPropertyValue('--color-background').trim();

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
        flash();
    } 
}

function flash () {
    document.documentElement.style.filter = 'brightness(1.01)';
    setTimeout(() => document.documentElement.style.filter = '', 25);
}

function runGame() {
    let prev_square;
    setInterval(() => {
        if (prev_square !== undefined) {
            removeTarget(prev_square);
            revertColor(prev_square);
        }
 
        let current_square = SQUARES[Math.floor(Math.random() * SQUARES.length)];
 
        changeColor(current_square, TERTIARY_COLOR);
        makeTarget(current_square);

        prev_square = current_square;
    }, SPEED);
}

SQUARES.forEach(square => {
    square.addEventListener('click', handleClick);
});

runGame();