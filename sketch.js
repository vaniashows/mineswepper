let field;

let cellSize;
let cols;
let rows;

let w;
let h;

let win;
let isGameOver;
let gameStarted;

let minesCount;

let minesChecked = 0;

let stopWatch;

class Score {
    constructor(date, time) {
        this.date = date;
        this.time = time;
    }
}

let scoreTable = [];
if (localStorage.getItem("scores")) {
    scoreTable = JSON.parse(localStorage.getItem("scores"));
}

load = () => {
    cols = 20;
    rows = 10;
    minesCount = 16;

    let difficulty = document.getElementById("levels").value;
    switch (difficulty) {
        case '1':
            cols = 30;
            rows = 15;
            minesCount = 50;
            break;
        case '2':
            cols = 40;
            rows = 20;
            minesCount = 100;
            break;
        case '3':
            cols = 40;
            rows = 20;
            minesCount = 150;
    }

    cellSize = 600 / rows;
    w = cols * cellSize;
    h = rows * cellSize;
};

createMatrix = (cols, rows) => {
    let matrix = [];
    for (let i = 0; i < cols; i++) {
        matrix[i] = [rows];
    }
    return matrix;
};

createField = () => {
    field = createMatrix(cols, rows);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            field[i][j] = new Cell(i, j);
        }
    }

    let mines = 0;
    while (mines !== minesCount) {
        let i = floor(random(cols));
        let j = floor(random(rows));
        if (field[i][j].value !== -1) {
            field[i][j].value = -1;
            mines++;
        }
    }
};

drawField = () => {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            field[i][j].draw();
        }
    }
};

setup = () => {
    //load user mode from html form
    load();

    let cnv = createCanvas(w, h);
    cnv.parent("canvas");

    win = false;
    isGameOver = false;
    gameStarted = false;

    field = [];
    createField();

    //limit frame rate to increase performance
    frameRate(30);

    stopWatch = new Stopwatch();

    loop();

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            field[i][j].setNeighbours();
            field[i][j].calculateValues();
        }
    }
};

draw = () => {
    background(150);

    drawField();
    countChecked();
    checkForWin();

    if (mouseIsPressed) {
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (mouseX > i * cellSize && mouseX < i * cellSize + cellSize &&
                    mouseY > j * cellSize && mouseY < j * cellSize + cellSize) {
                    if (mouseButton === LEFT && !field[i][j].isHidden) {
                        for (let neighbour of field[i][j].neighbours) {
                            neighbour.highlighted = true;
                        }
                    }
                }
            }
        }

    }

    if (stopWatch.getSeconds()) {
        document.getElementById("time").innerText = stopWatch.getSeconds();
    } else {
        document.getElementById("time").innerText = 0;
    }

    document.getElementById("minesLeft").innerText = "" + (minesCount - minesChecked);
};

mouseClicked = () => {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (mouseX > i * cellSize && mouseX < i * cellSize + cellSize &&
                mouseY > j * cellSize && mouseY < j * cellSize + cellSize) {
                //first click is always lose-free
                if (!gameStarted) {
                    while (field[i][j].value === -1) {
                        setup();
                    }

                    gameStarted = true;
                    stopWatch.start();

                }
                field[i][j].leftClick();
                return false;
            }
        }
    }
};

mousePressed = () => {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (mouseX > i * cellSize && mouseX < i * cellSize + cellSize &&
                mouseY > j * cellSize && mouseY < j * cellSize + cellSize) {
                if (mouseButton === RIGHT) {
                    field[i][j].rightClick();
                }
            }
        }
    }
};

mouseReleased = () => {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            field[i][j].highlighted = false;
        }
    }
};

keyPressed = () => {
    if (keyCode === 82) {
        setup();
    }
};

gameOver = () => {
    isGameOver = true;
    stopWatch.stop();

    showAllCells();
};

checkForWin = () => {
    if (!win) {
        for (let col of field) {
            for (let cell of col) {
                if ((cell.value === -1 && !cell.checked) || (cell.value !== -1 && cell.isHidden)) {
                    return;
                }
            }
        }

        win = true;
        stopWatch.stop();
        recalculateHighScores();
    } else {
        minesChecked = minesCount;
    }

    showAllCells();
};

showAllCells = () => {
    for (let col of field) {
        for (let cell of col) {
            cell.isHidden = false;
        }
    }
};

countChecked = () => {
    //after game over there's no mines left
    if (isGameOver || win) {
        minesChecked = minesCount;
        return;
    }

    let count = 0;
    for (let col of field) {
        for (let cell of col) {
            if (cell.checked && cell.isHidden) {
                count++;
            }
        }
    }

    //easter egg
    if (count === cols * rows) {
        window.open("https://www.urbandictionary.com/define.php?term=lol");
        win = true;
        noLoop();
    }

    minesChecked = count;
};

//TODO: interface for highscores
recalculateHighScores = () => {
    let score = new Score(new Date().toJSON().slice(0, 10), stopWatch.getSeconds());
    scoreTable.push(score);

    scoreTable.sort((a, b) => {
        if (a.time < b.time)
            return -1;
        if (a.time > b.time)
            return 1;
        return 0;
    });

    localStorage.setItem("scores", JSON.stringify(scoreTable));
};