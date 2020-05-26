const MAIN_GRID_DEPTH = 20;
const MAIN_GRID_WIDTH = 10;
const MINI_GRID_DEPTH = 2;
const MINI_GRID_WIDTH = 4;
const LEVELS = {
    1: {
        speed: 800,
        nextLevelScore: 500,
        lineScore: 10
    },
    2: {
        speed: 600,
        nextLevelScore: 1500,
        lineScore: 15
    },
    3: {
        speed: 400,
        nextLevelScore: 2000,
        lineScore: 20
    },
    4: {
        speed: 200,
        nextLevelScore: 3000,
        lineScore: 30
    },
    5: {
        speed: 100,
        nextLevelScore: Infinity,
        lineScore: 50
    },
};
const SHAPES = [
    [[1,1,0],
        [0,1,1]],
    [[0,1,0],
        [1,1,1]],
    [[1,1,1,1]],
    [[1,1,1],
        [0,0,1]],
    [[1,1,1],
        [1,0,0]],
    [[1,1],
        [1,1]]
];

let grid = Array(MAIN_GRID_DEPTH * MAIN_GRID_WIDTH);
grid.fill(0);
let finished = false;
let miniGrid = Array(MINI_GRID_DEPTH * MINI_GRID_WIDTH);
miniGrid.fill(0);
let score = 0;
let currentLevel = 1;
let currentShape = newShape();
let nextShape = newShape();
let interval = null;

function main() {
    writeShape(currentShape, 1);
    writeNextShape(nextShape, 1);
    draw();
    interval = setTimeout(() => {
        dropShape();
    }, LEVELS[currentLevel].speed);
}
function newShape() {
    return {
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        y: 0,
        x: 4
    }
}
function drawGrid(grid, element) {
    let doc = "";
    for (let i = 0; i < grid.length; i++) {
        if (grid[i] === 0) {
            doc += '<div class="cell"></div>';
        } else if (grid[i] === 1) {
            doc += '<div class="cell-moving"></div>';
        } else if (grid[i] === 2) {
            doc += '<div class="cell-static"></div>';
        }
    }
    element.innerHTML = doc;
}
function draw() {
    drawGrid(grid, document.getElementById('main'));
    drawGrid(miniGrid, document.getElementById('miniGrid'));
    document.getElementById('score').innerHTML = score.toString();;
    document.getElementById('level').innerHTML = currentLevel.toString();
}

function isCollision(shape) {
    if (shape.x < 0) { return true; }
    if (shape.x > MAIN_GRID_WIDTH - shape.shape[0].length) { return true; }
    if (shape.y > MAIN_GRID_DEPTH - shape.shape.length) { return true; }
    for (let y = 0; y<shape.shape.length; y++) {
        let row = shape.shape[y];
        for (let x = 0; x<row.length; x++) {
            if ((row[x] === 1) && (grid[(y + shape.y) * MAIN_GRID_WIDTH + (x + shape.x)] === 2)) {
                return true;
            }
        }
    }
    return false;
}

function writeShape(shapeRef, val) {
    for (let y = 0; y<shapeRef.shape.length; y++) {
        let row = shapeRef.shape[y];
        for (let x = 0; x<row.length; x++) {
            if (row[x] === 1) {
                grid[(y + shapeRef.y) * MAIN_GRID_WIDTH + (x + shapeRef.x)] = val;
            }
        }
    }
}
function writeNextShape(shapeRef, val) {
    miniGrid.fill(0);
    for (let y = 0; y<shapeRef.shape.length; y++) {
        let row = shapeRef.shape[y];
        for (let x = 0; x<row.length; x++) {
            if (row[x] === 1) {
                miniGrid[y * MINI_GRID_WIDTH + x] = val;
            }
        }
    }
}

function rotateShape(shape) {
    let copyShape = Object.assign({}, shape);
    let newShape = Array(shape.shape[0].length);
    for (let x = 0; x < shape.shape[0].length; x++) {
        newShape[x] = Array(shape.shape.length);
        for (let y = 0; y < shape.shape.length; y++) {
            newShape[x][y] = shape.shape[shape.shape.length - y - 1][x];
        }
    }
    copyShape.shape = newShape;
    return copyShape;
}

function keystroke(e) {
    if (finished) { return; }
    if (e.code === "ArrowLeft") {
        let copyShape = Object.assign({}, currentShape);
        copyShape.x--;
        if (!isCollision(copyShape)) {
            writeShape(currentShape, 0);
            currentShape = Object.assign({},copyShape);
            writeShape(currentShape, 1);
            draw();
        }
    }
    else if (e.code === "ArrowRight") {
        let copyShape = Object.assign({}, currentShape);
        copyShape.x++;
        if (!isCollision(copyShape)) {
            writeShape(currentShape, 0);
            currentShape = Object.assign({},copyShape);
            writeShape(currentShape, 1);
            draw();
        }
    }
    else if (e.code === "ArrowDown") {
        dropShape();
    }
    else if (e.code === "ArrowUp") {
        let copyShape = rotateShape(currentShape);
        if (!isCollision(copyShape)) {
            writeShape(currentShape, 0);
            currentShape = Object.assign({},copyShape);
            writeShape(currentShape, 1);
            draw();
        }
    }
}

function rowComplete(rowNo) {
    let row = grid.slice(rowNo*MAIN_GRID_WIDTH, (rowNo+1)*MAIN_GRID_WIDTH);
    if (row.reduce( (a,b) => a + b,0) === MAIN_GRID_WIDTH*2) {
        return true;
    }
}

function dropShape() {
    let copyShape = Object.assign({}, currentShape);
    copyShape.y++;
    if (!isCollision(copyShape)) {
        writeShape(currentShape, 0);
        currentShape = Object.assign({},copyShape);
        writeShape(currentShape, 1);
        draw();
    } else {
        writeShape(currentShape, 2);
        let removed = 0;
        for (let i = 0; i < currentShape.shape.length; i++) {
            let rowNo = currentShape.y + i;
            if (rowComplete(rowNo)) {
                let newGrid = Array(MAIN_GRID_WIDTH);
                newGrid.fill(0);
                newGrid = newGrid.concat(grid.slice(0, rowNo * MAIN_GRID_WIDTH));
                grid = newGrid.concat(grid.slice((rowNo + 1) * MAIN_GRID_WIDTH, MAIN_GRID_WIDTH * MAIN_GRID_DEPTH));
                removed++;
            }
        }
        score += (removed*LEVELS[currentLevel].lineScore) * removed;
        if (score > LEVELS[currentLevel].nextLevelScore) { currentLevel++; }
        draw();
        let tempShape = Object.assign({},nextShape);
        nextShape = newShape();
        writeNextShape(nextShape, 1);
        if (isCollision(tempShape)) {
            let gameOverEl = document.getElementById('gameover');
            gameOverEl.style.display = 'block';
            finished = true;
            return;
        } else {
            currentShape = Object.assign({},tempShape);
            writeShape(currentShape, 1);
            draw();
        }
    }
    clearInterval(interval);
    interval = setTimeout(() => {
        dropShape();
    }, LEVELS[currentLevel].speed);

}

document.addEventListener('keydown', keystroke);
window.addEventListener('load', () => {
    main();
});
