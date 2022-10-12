const FPS = 10;
let videoIn = document.getElementById("videoIn");
let canvasMid = document.getElementById("canvasMid");
let canvasOut = document.getElementById("canvasOut");
let overlayView;
let puzzleView;
let videoCapture;
let contours;
let contoursHierarchy;
let polygon;
let tmpPolygon;
let perspectiveTransform;
let color;
let streaming = false;

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
        overlayView = new cv.Mat(canvasMid.height, canvasMid.width, cv.CV_8UC4);
        puzzleView = new cv.Mat(canvasOut.height, canvasOut.width, cv.CV_8UC1);
        videoCapture = new cv.VideoCapture(videoIn);
        contours = new cv.MatVector();
        contoursHierarchy = new cv.Mat();
        tmpPolygon = new cv.Mat();
        polygon = new cv.MatVector();
        polygon.push_back(tmpPolygon);
        color = new cv.Scalar(255, 0, 0, 255);
        streaming = true;
        setTimeout(processVideo, 0);
    } catch (err){
        console.log(err);
        setTimeout(go, 100);
    }
    
}

function stop() {
    streaming = false;
}

function sortBoxPoints(points) {
    
}

function processVideo() {
    try {
        if (!streaming) {
            overlayView.delete();
            puzzleView.delete();
            contours.delete();
            contoursHierarchy.delete();
            tmpPolygon.delete();
            polygon.delete();
            perspectiveTransform.delete();
            return;
        }
        let begin = Date.now();
        // start processing.
        videoCapture.read(overlayView);
        cv.cvtColor(overlayView, puzzleView, cv.COLOR_RGBA2GRAY);
        cv.adaptiveThreshold(puzzleView, puzzleView, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 11, 11)
        cv.bitwise_not(puzzleView, puzzleView);
        cv.findContours(puzzleView, contours, contoursHierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
        let maxArea = 0;
        let indexOfMaxArea = 0;
        for (let i = 0; i < contours.size(); i++) {
            let area = cv.contourArea(contours.get(i), false);
            if (area > maxArea) {
                maxArea = area;
                indexOfMaxArea = i;
            }
        }
        
        cv.approxPolyDP(contours.get(indexOfMaxArea), tmpPolygon, 100, true);
        polygon.set(0,tmpPolygon);
        cv.drawContours(overlayView, polygon, 0, color, 3, cv.LINE_4, contoursHierarchy, 0);
        if (tmpPolygon.rows == 4) {
            let a = cv.matFromArray(4, 1, cv.CV_32FC2, tmpPolygon.data32S)
            let b = cv.matFromArray(4, 1, cv.CV_32FC2, [0,600,600,600,600,0,0,0])
            let M = cv.getPerspectiveTransform(a, b);
            let dsize = new cv.Size(puzzleView.rows, puzzleView.cols);
            cv.warpPerspective(puzzleView, puzzleView, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());            
        }

        cv.imshow('canvasMid', overlayView);
        cv.imshow('canvasOut', puzzleView);
        // schedule the next one.
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    } catch (err) {
        console.log(err);
    }
};
