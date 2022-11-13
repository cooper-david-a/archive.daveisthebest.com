const FPS = 5;
const DIGIT_THRESHOLD = 50;
const PUZZLE_SIZE = 396;
let videoIn = document.getElementById("videoIn");
let canvasOverlay = document.getElementById("canvasOverlay");
let canvasPuzzle = document.getElementById("canvasPuzzle");
let streaming = false;
let puzzle = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
]

navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function (stream) {
        videoIn.srcObject = stream;
        videoIn.play();
    })
    .catch(function (err) {
        console.log("An error occurred! " + err);
    });

function ready() {
    document.getElementById('go_btn').disabled = false;
}

function go() {
    try {     
        streaming = true;
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
        digitView = new cv.Mat(44, 44, cv.CV_8UC1);

        labels = mask.clone();
        stats = new cv.Mat();
        centroids = new cv.Mat();

        setTimeout(processVideo, 0);
        return
    } catch (err){
        console.log(err.message);
        setTimeout(go, 100);
        return
    }
    
}

function stop() {
    streaming = false;

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
    digitView.delete();

    labels.delete();
    stats.delete();
    centroids.delete();
}

function processVideo() {
    try {
        if (!streaming) return;

        let begin = Date.now();

        cap.read(videoFrame);
        cv.cvtColor(videoFrame, hiddenView, cv.COLOR_RGBA2GRAY);
        cv.adaptiveThreshold(hiddenView, hiddenView, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 11, 10);

        cv.findContours(hiddenView, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        let indexOfLargestContour = findLargestContour();
        cv.approxPolyDP(contours.get(indexOfLargestContour), tempPolygon, 100, true);
        polygon.set(0, tempPolygon);
        cv.drawContours(videoFrame, polygon, 0, color, 3, cv.LINE_8, hierarchy, 0);

        if (tempPolygon.rows == 4) {
            isolatePuzzle();
            extractDigits();
        }

        cv.imshow('videoDisplay', videoFrame);
        cv.imshow('canvasPuzzle', hiddenView);

        let delay = 1000 / FPS - (Date.now() - begin);
        console.log(delay);
        setTimeout(processVideo, delay);

    }catch (err) {
        console.log(err);
    }
};

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

function isolatePuzzle() {    
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

function extractDigits() {
    cv.threshold(hiddenView, hiddenView, 10, 255, cv.THRESH_BINARY);

    cv.erode(hiddenView, horizontalMask, horizontalStructuralElement, new cv.Point(-1, -1), 2);
    cv.dilate(horizontalMask, horizontalMask, horizontalStructuralElement, new cv.Point(-1, -1), 2);

    cv.erode(hiddenView, verticalMask, verticalStructuralElement, new cv.Point(-1, -1), 2);
    cv.dilate(verticalMask, verticalMask, verticalStructuralElement, new cv.Point(-1, -1), 2);

    cv.add(horizontalMask, verticalMask, mask);
    cv.dilate(mask, mask, squareStructuralElement, new cv.Point(-1, -1), 2);
    cv.bitwise_not(mask, mask)

    cv.bitwise_and(hiddenView, mask, hiddenView);

    let nblobs = cv.connectedComponentsWithStats(hiddenView, labels, stats, centroids, 8, cv.CV_16U);
}