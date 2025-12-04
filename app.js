const NUM_SQUARES = 25;
const SQUARES = document.querySelectorAll(".square")
const BLINK_RATE = 200; // Rate of blink in milliseconds
const ORIGINAL_COLOR = "#f3d2c1";
const BLINK_COLOR = "#8bd3dd";

function changeColor (square) {
    square.style.backgroundColor = BLINK_COLOR;
}
function revertColor (square) {
    square.style.backgroundColor = ORIGINAL_COLOR; 
}

function blinkSquare() {
    let prev_idx;
    setInterval(() => {
        if (prev_idx !== undefined) {
            revertColor(SQUARES[prev_idx])
        }
 
        let current_idx = Math.floor(Math.random() * NUM_SQUARES);
        while (current_idx === prev_idx) {
            current_idx = Math.floor(Math.random() * NUM_SQUARES);
        }
 
        changeColor(SQUARES[current_idx]);
        prev_idx = current_idx;
    }, BLINK_RATE);
}

blinkSquare()