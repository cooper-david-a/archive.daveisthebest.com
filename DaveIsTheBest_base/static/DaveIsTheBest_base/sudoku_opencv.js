const FPS = 1;
let videoIn = document.getElementById("videoIn");
let canvasOut = document.getElementById("canvasOut");
let context = canvasOut.getContext('2d');
let src
let dst
let cap
let contours
let hierarchy
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
        src = new cv.Mat(videoIn.height, videoIn.width, cv.CV_8UC4);
        dst = new cv.Mat(videoIn.height, videoIn.width, cv.CV_8UC1);
        cap = new cv.VideoCapture(videoIn);
        contours = new cv.MatVector();
        hierarchy = new cv.Mat();
        setTimeout(processVideo, 0);
        streaming = true;
    } catch (err){
        console.log(err);
        setTimeout(go, 50);
    }
    
}

function stop() {
    streaming = false;
}

function processVideo() {
    try {
        if (!streaming) {
            src.delete();
            dst.delete();
            contours.delete();
            hierarchy.delete();
            context.clearRect(0, 0, canvasOut.width, canvasOut.height);
            return;
        }
        let begin = Date.now();
        // start processing.
        cap.read(src);
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 11, 11)
        cv.bitwise_not(dst, dst);
        cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
        let maxArea = 0;
        let indexOfMaxArea = 0;
        for (let i = 0; i < contours.size(); i++) {
            let area = cv.contourArea(contours.get(i), false);
            if (area > maxArea) {
                maxArea = area;
                indexOfMaxArea = i;
            }
        }
        
        let color = new cv.Scalar(128, 128, 128);
        cv.drawContours(dst, contours, indexOfMaxArea, color, 10, cv.LINE_8, hierarchy, 500);
        cv.imshow('canvasOut', dst);
        // schedule the next one.
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    } catch (err) {
        console.log(err);
    }
};
