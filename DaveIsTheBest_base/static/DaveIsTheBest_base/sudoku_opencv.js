const FPS = 2;
const PUZZLE_SIZE = 396;
const DIGIT_SIZE = 20;
let videoIn = document.getElementById("videoIn");
let videoDisplay = document.getElementById("videoDisplay");
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
        videoIn.width = stream.getVideoTracks()[0].getSettings().width;
        videoIn.height = stream.getVideoTracks()[0].getSettings().height;
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

        labels = mask.clone();
        stats = new cv.Mat();
        centroids = new cv.Mat();
        digitRoi = new cv.Mat(44, 44, cv.CV_8UC1);

        videoIn.style.display = 'none';
        videoDisplay.style.display = 'inline';
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

    labels.delete();
    stats.delete();
    centroids.delete();
    digitRoi.delete();

    videoIn.style.display = 'inline';
    videoDisplay.style.display = 'none';
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
            recognize_digits().then((digits) => drawDigits(digits)).finally(x => {
                let delay = 1000 / FPS - (Date.now() - begin);
                setTimeout(processVideo, delay);
            })
        } else {
            let delay = 1000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }
            

        cv.imshow('videoDisplay', videoFrame);
        cv.imshow('canvasPuzzle', puzzleView);

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
    cv.dilate(mask, mask, squareStructuralElement, new cv.Point(-1, -1), 1);
    cv.bitwise_not(mask, mask);

    cv.bitwise_and(hiddenView, mask, hiddenView);
    cv.dilate(hiddenView, hiddenView, new cv.Mat.ones(3,3,cv.CV_8UC1), new cv.Point(-1, -1), 1);
    cv.erode(hiddenView, hiddenView, new cv.Mat.ones(3, 3, cv.CV_8UC1), new cv.Point(-1, -1), 1);

    let nblobs = cv.connectedComponentsWithStats(hiddenView, labels, stats, centroids, 8, cv.CV_16U);

    digitsPixelData = [];
    digitsPositions = [];
    
    for (let i = 1; i < nblobs; i++) {
        let blobStats = stats.data32S.slice(5 * i, 5 * i + 5);
                
        if (blobIsDigit(blobStats)) {
            let digitRect = { x: blobStats[0], y: blobStats[1], width: blobStats[2], height: blobStats[3] }
            let digitCenter = { x: digitRect.x + digitRect.width / 2, y: digitRect.y + digitRect.height / 2 };
            digitRoi = hiddenView.roi(digitRect).clone();
            cv.resize(digitRoi, digitRoi, {width: DIGIT_SIZE, height: DIGIT_SIZE})
            digitsPixelData = digitsPixelData.concat(Array.from(digitRoi.data));
            digitsPositions.push([Math.round(digitCenter.x/44-.5), Math.round(digitCenter.y/44-.5)]);            
        }
    }
}

function blobIsDigit(blobStats) {
    if (blobStats[4] > 80) {
        let blobCenter = [blobStats[0] + blobStats[2] / 2, blobStats[1] + blobStats[3] / 2];
        let centerDistance = Math.sqrt(blobCenter.map(x => x % 44 - 22).reduce((s, val) => s + val * val,0));
        return centerDistance < 10;        
    }
    return false;
}

async function recognize_digits() {
    let session = await ort.InferenceSession.create('./static/DaveIsTheBest_base/digit_recognizer.onnx');

    try {
        let tensorX = new ort.Tensor('float32', Float32Array.from(digitsPixelData), [digitsPositions.length, DIGIT_SIZE * DIGIT_SIZE])
        let results = await session.run({ X: tensorX })
        return results.label.data

    } catch (e) {
        console.log(`failed to inference ONNX model: ${e}.`);
    }
}

function drawDigits(digits) {
    ctx = canvasPuzzle.getContext('2d');
    ctx.font = '20px Arial';
    ctx.fillStyle = '#0000ff';
    
    for (let i = 0; i < digits.length; i++){
        ctx.fillText(digits[i],digitsPositions[i][0]*44+30,(digitsPositions[i][1]+1)*44-10)        
    }
    
}