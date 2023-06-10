const SPACE_SIZE = 44;
const PUZZLE_SIZE = SPACE_SIZE * 9;
const DIGIT_SIZE = 20;
const MAX_PUZZLES = 100;

let FPS = 10;
let videoIn = document.getElementById("videoIn");
let videoDisplay = document.getElementById("videoDisplay");

videoIn.addEventListener('loadedmetadata', function () {
    videoDisplay.width = videoIn.videoWidth;
    videoDisplay.height = videoIn.videoHeight;
});

window.addEventListener('beforeunload',quit)

let canvasPuzzle = document.getElementById("canvasPuzzle");
canvasPuzzle.width = PUZZLE_SIZE;
canvasPuzzle.height = PUZZLE_SIZE;
canvasPuzzle.addEventListener('click', finalizeInputPuzzle);

let confidenceSpan = document.getElementById("confidence");

let running = false;
let onnxNet;

let sudokuTemplate;

let cap;
let videoFrame;
let hiddenView;
let puzzleView;

let contours;
let hierarchy;
let color;
let tempPolygon;
let polygon;

let mask;
let horizontalMask;
let verticalMask;
let horizontalStructuralElement;
let verticalStructuralElement;
let squareStructuralElement;

let digits = [];
let labels;
let stats;
let centroids;
let digitRoi;

let puzzle;
let puzzles = [];
let confidence;
let minConfidence;



async function ready() {
    try {        

        await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(function (stream) {
                videoIn.srcObject = stream;
                videoIn.width = stream.getVideoTracks()[0].getSettings().width;
                videoIn.height = stream.getVideoTracks()[0].getSettings().height;
                videoIn.play();
            })
            .catch(function (err) {
                console.log("An error occurred! " + err);
            });
        
        await fetch('./static/DaveIsTheBest_base/digit_recognizer_1.onnx')
            .then(response => response.arrayBuffer())
            .then(buffer => {
                model = new Uint8Array(buffer)
                onnxNet = cv.readNetFromONNX1(model)
                console.log('digit_recognizer loaded')
            }).catch(e => {
                console.log(e);
            });
        
        cap = new cv.VideoCapture(videoIn);
        videoFrame = new cv.Mat(videoIn.videoHeight, videoIn.videoWidth, cv.CV_8UC4);
        hiddenView = new cv.Mat(videoIn.clientHeight, videoIn.clientWidth, cv.CV_8UC1);
        puzzleView = new cv.Mat(PUZZLE_SIZE, PUZZLE_SIZE, cv.CV_8UC4);

        contours = new cv.MatVector();
        hierarchy = new cv.Mat();
        color = new cv.Scalar(255, 0, 0, 255);
        tempPolygon = new cv.Mat();
        polygon = new cv.MatVector();
        polygon.push_back(tempPolygon);

        mask = new cv.Mat.zeros(PUZZLE_SIZE, PUZZLE_SIZE, cv.CV_8UC1);
        horizontalMask = mask.clone();
        verticalMask = mask.clone();
        horizontalStructuralElement = cv.getStructuringElement(cv.MORPH_RECT, { width: PUZZLE_SIZE / 20, height: 1 });
        verticalStructuralElement = cv.getStructuringElement(cv.MORPH_RECT, { width: 1, height: PUZZLE_SIZE / 20 });
        squareStructuralElement = cv.getStructuringElement(cv.MORPH_RECT, { width: 5, height: 5 });

        labels = mask.clone();
        stats = new cv.Mat();
        centroids = new cv.Mat();

        running = true;
        setTimeout(processVideo, 0);

    } catch (err) {
        console.log(err.message);
        setTimeout(ready, 500);
    }
} 

function quit() {
    try {
        videoFrame.delete();
        hiddenView.delete();
        puzzleView.delete();
    
        contours.delete();
        hierarchy.delete();
        tempPolygon.delete();
        polygon.delete();
    
        mask.delete();
        horizontalMask.delete();
        verticalMask.delete();
        horizontalStructuralElement.delete();
        verticalStructuralElement.delete();
        squareStructuralElement.delete();
    
        labels.delete();
        stats.delete();
        centroids.delete();
        digitRoi.delete();
    } catch (err) {
        console.log(err);
    }    
}

function processVideo() {
    try {
        if (!running) return;

        let begin = Date.now();

        cap.read(videoFrame);
        cv.cvtColor(videoFrame, hiddenView, cv.COLOR_RGBA2GRAY);
        cv.adaptiveThreshold(hiddenView, hiddenView, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 11, 10);

        cv.findContours(hiddenView, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        let indexOfLargestContour = findLargestContour();
        cv.approxPolyDP(contours.get(indexOfLargestContour), tempPolygon, 100, true);
        polygon.set(0, tempPolygon);

        if (tempPolygon.rows == 4) {
            isolatePuzzleImage();
            [puzzle, confidence] = extractPuzzle();
            cv.imshow('canvasPuzzle', puzzleView);
            //cv.imshow('canvasPuzzle', hiddenView);
            drawPuzzle(puzzle);
            [undefined, minConfidence] = indexOfMax(confidence.flat().map((x) => -x));
            confidenceSpan.innerText = -Math.round(minConfidence*100);
        }
        
        cv.drawContours(videoFrame, polygon, 0, color, 3, cv.LINE_8, hierarchy, 0);
        cv.imshow('videoDisplay', videoFrame);

        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);

    }catch (err) {
        console.log(err);
    }
}

function finalizeInputPuzzle() {
    running = !running;
    if (!running) {
        let confirmCorrectPuzzle = document.getElementById("confirmCorrectPuzzle");
        confirmCorrectPuzzle.showModal();    
    }
}

function isolatePuzzleImage() {    
    let cornerPositions = [0, 0, 0, PUZZLE_SIZE, PUZZLE_SIZE, PUZZLE_SIZE, PUZZLE_SIZE, 0];
    let corners = tempPolygon.data32S;
    let dx12 = corners[2] - corners[0];
    let dy12 = corners[3] - corners[1];
    if (Math.abs(dx12) > Math.abs(dy12)) {
        cornerPositions = [PUZZLE_SIZE, 0, 0, 0, 0, PUZZLE_SIZE, PUZZLE_SIZE, PUZZLE_SIZE];
    }

    let a = cv.matFromArray(4, 1, cv.CV_32FC2, tempPolygon.data32S);
    let b = cv.matFromArray(4, 1, cv.CV_32FC2, cornerPositions);
    let M = cv.getPerspectiveTransform(a, b);
    cv.warpPerspective(videoFrame, puzzleView, M, new cv.Size(PUZZLE_SIZE, PUZZLE_SIZE), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    cv.warpPerspective(hiddenView, hiddenView, M, new cv.Size(PUZZLE_SIZE, PUZZLE_SIZE), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());    
    a.delete(); b.delete(); M.delete();    
}

function findLargestContour() {
    let n = contours.size();
    let indexOfLargestContour = 0;
    let largestArea = 0;
    for (let i = 0; i < n; i++){
        let area = cv.contourArea(contours.get(i));
        if (area > largestArea) {
            largestArea = area;
            indexOfLargestContour = i;            
        }
    }
    return indexOfLargestContour
}

function extractPuzzle() {
    cv.threshold(hiddenView, hiddenView, 10, 255, cv.THRESH_BINARY);

    cv.erode(hiddenView, horizontalMask, horizontalStructuralElement, new cv.Point(-1, -1), 2);
    cv.dilate(horizontalMask, horizontalMask, horizontalStructuralElement, new cv.Point(-1, -1), 2);

    cv.erode(hiddenView, verticalMask, verticalStructuralElement, new cv.Point(-1, -1), 2);
    cv.dilate(verticalMask, verticalMask, verticalStructuralElement, new cv.Point(-1, -1), 2);

    cv.add(horizontalMask, verticalMask, mask);
    cv.dilate(mask, mask, squareStructuralElement, new cv.Point(-1, -1), 1);
    cv.bitwise_not(mask, mask);

    cv.bitwise_and(hiddenView, mask, hiddenView);
    cv.dilate(hiddenView, hiddenView, new cv.Mat.ones(3,3,cv.CV_8UC1), new cv.Point(-1, -1), 1);
    cv.erode(hiddenView, hiddenView, new cv.Mat.ones(3, 3, cv.CV_8UC1), new cv.Point(-1, -1), 1);

    let nblobs = cv.connectedComponentsWithStats(hiddenView, labels, stats, centroids, 8, cv.CV_16U);

    var puzzle = new Array(9);
    var confidence = new Array(9);
    var mostProbablePuzzle = new Array(9);
    for (let i = 0; i < 9; i++){
        puzzle[i] = new Array(9).fill(0);
        confidence[i] = new Array(9).fill(0);
        mostProbablePuzzle[i] = new Array(9).fill(0);
    }

    digits = [];
    for (let i = 1; i < nblobs; i++) {
        let blobStats = stats.data32S.slice(5 * i, 5 * i + 5);
                
        if (blobIsDigit(blobStats)) {
            let digit = { value: 0, position: [0, 0], pixelData: {}, probabilities: [] }
            let digitRect = { x: blobStats[0], y: blobStats[1], width: blobStats[2], height: blobStats[3] }
            let digitCenter = { x: digitRect.x + digitRect.width / 2, y: digitRect.y + digitRect.height / 2 };
            digitRoi = hiddenView.roi(digitRect).clone();
            cv.resize(digitRoi, digitRoi, {width: DIGIT_SIZE, height: DIGIT_SIZE})
            digit.pixelData = digitRoi.clone();
            [digit.value, digit.maxProbability, digit.probabilities] = recognize_digit(digit);
            digit.position = [Math.round(digitCenter.y / SPACE_SIZE - .5), Math.round(digitCenter.x / SPACE_SIZE - .5)];
            puzzle[digit.position[0]][digit.position[1]] = digit.value;
            digits.push(digit);
        }
    }

    puzzles.push(puzzle);
    if (puzzles.length > MAX_PUZZLES) puzzles.shift();

    for (let i = 0; i < 9; i++){
        for (let j = 0; j < 9; j++){
            let pos_array = [];
            puzzles.forEach((puzzle) => pos_array.push(puzzle[i][j]));
            [mostProbableDigit, count] = getMode(pos_array);
            mostProbablePuzzle[i][j] = mostProbableDigit;
            confidence[i][j] = count / puzzles.length;
        }
    }

    return [mostProbablePuzzle, confidence]
    
}

function blobIsDigit(blobStats) {
    if (blobStats[4] > 50) {
        let blobCenter = [blobStats[0] + blobStats[2] / 2, blobStats[1] + blobStats[3] / 2];
        let centerDistance = Math.sqrt(blobCenter.map(x => x % SPACE_SIZE - 22).reduce((s, val) => s + val * val,0));
        return centerDistance < 10;        
    }
    return false;
}

function recognize_digit(digit) {
    try {        
        let net_input = cv.matFromArray(1, 400, cv.CV_32FC1, digit.pixelData.data);
        let probabilities = new cv.Mat.zeros(1,9,cv.CV_32FC1)
        onnxNet.setInput(net_input);
        probabilities = onnxNet.forward();
        let [index, max] = indexOfMax(probabilities.data32F);
        return [index + 1, max, Array.from(probabilities.data32F)];
    } catch (e) {
        console.log(`digit recognition failed: ${e}.`);
    }
}

function solveSudoku(board) {
    const emptySpot = findEmptySpot(board);

    if (!emptySpot) {
        // Base case: All spots filled, puzzle solved
        return true;
    }

    const [row, col] = emptySpot;

    for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
            // Place the number in the empty spot
            board[row][col] = num;

            // Recursively solve the updated board
            if (solveSudoku(board)) {
                return true;
            }

            // Undo the placement and try the next number
            board[row][col] = 0;
        }
    }

    // No valid number found, backtrack
    return false;
}

function findEmptySpot(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null; // All spots filled
}

function isValid(board, row, col, num) {
    // Check if the number already exists in the same row
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) {
            return false;
        }
    }

    // Check if the number already exists in the same column
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) {
            return false;
        }
    }

    // Check if the number already exists in the same 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[boxRow + i][boxCol + j] === num) {
                return false;
            }
        }
    }

    return true; // Number is valid at this spot
}

function drawPuzzle(puzzle) {
    ctx = canvasPuzzle.getContext('2d');
    ctx.font = '20px Arial';
    ctx.fillStyle = '#0000ff';

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++){
            if (puzzle[j][i] > 0) ctx.fillText(puzzle[j][i], (i+1) * SPACE_SIZE - 15, j * SPACE_SIZE + 40);
        }
    }
}

function indexOfMax(arr) {
    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return [maxIndex, max];
}

function getMode(arr) {
    let counts = new Array(10).fill(0);
    arr.forEach((value) => counts[value] += 1 );
    [mode, count] = indexOfMax(counts);
    return [mode, count];    
}

function solveAndShowPuzzle() {
    let solved = solveSudoku(puzzle);
    if (solved) {
        cv.imshow('canvasPuzzle', puzzleView);
        drawPuzzle(puzzle);        
    } else {
        alert('No solution found.  Check the input puzzle.')
    }
}

function resumePuzzleExtraction() {
    running = true;
    processVideo();
}