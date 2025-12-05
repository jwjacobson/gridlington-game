const NUM_SQUARES = 25;
const SQUARES = document.querySelectorAll(".square")
const BLINK_RATE = 200; // Rate of blink in milliseconds

// Set colors from styles.css
const root = document.documentElement;
const PRIMARY_COLOR = getComputedStyle(root).getPropertyValue('--color-primary').trim();
const SECONDARY_COLOR = getComputedStyle(root).getPropertyValue('--color-secondary').trim();
const TERTIARY_COLOR = getComputedStyle(root).getPropertyValue('--color-tertiary').trim();
const BACKGROUND_COLOR = getComputedStyle(root).getPropertyValue('--color-background').trim();

function changeColor (square) {
    square.style.backgroundColor = TERTIARY_COLOR;
}
function revertColor (square) {
    square.style.backgroundColor = BACKGROUND_COLOR; 
}

function makeTarget (square) {
    square.id = "target"
}

function removeTarget (square) {
    square.id = ""
}

function blinkSquare() {
    let prev_square;
    setInterval(() => {
        if (prev_square !== undefined) {
            revertColor(prev_square)
        }
 
        let current_square = SQUARES[Math.floor(Math.random() * NUM_SQUARES)];
        changeColor(current_square);
        
        prev_square = current_square;
    }, BLINK_RATE);
}

blinkSquare()