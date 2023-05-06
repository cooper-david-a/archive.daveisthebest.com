
function addRow() {
    let grid = document.getElementsByClassName("grid-container")[0];
    let firstOfRow = grid.childElementCount;
    let names = ["hard_time", "easy_time", "rounds"];
    for (input_name of names){
        item = document.createElement("div");
        item.classList.add("grid-item");
        input = document.createElement("input");
        input.type = "number";
        input.name = input_name;        
        item.appendChild(input);
        grid.appendChild(item);
    };
    grid.children[firstOfRow].children[0].focus();
}

function deleteRow() {
    let grid = document.getElementsByClassName("grid-container")[0];
    rowCount = grid.children.length / 3;
    if (rowCount>2){
        for (let i=0; i<3; i++){
            grid.removeChild(grid.lastElementChild);
        };
    };
}

function createTimer() {
  if (timerData.state == "running") return;
  
  timerData.roundIndex = 0;

  let hard = document.getElementsByName("hard_time");
  let easy = document.getElementsByName("easy_time");
  let rounds = document.getElementsByName("rounds");
  let numberOfRows = hard.length;
  
  let timeArrayLength = 2;
  for (let n of rounds.values()){
    if (n.value){
      timeArrayLength += parseInt(n.value) * 2;
    }
  }

  let timeArray = new Array(timeArrayLength);
  timeArray[0] = parseInt(document.getElementById("warmup").value);
  let k = 1;

  for (let i = 0; i<numberOfRows; i++){
    let hardTime = parseInt(hard[i].value);
    let easyTime = parseInt(easy[i].value);
    let numberOfRounds = parseInt(rounds[i].value);

    for (let j = 0; j<numberOfRounds; j++){
      timeArray[k] = timeArray[k-1] + hardTime;
      timeArray[k+1] = timeArray[k] + easyTime;
      k+=2;
    }    
  }

  timeArray[timeArrayLength-1] = 
    timeArray[timeArrayLength-2] + parseInt(document.getElementById("cooldown").value);

  timerData.timeArray = timeArray;
  timerData.remaining = timeArray[timeArrayLength-1];
  timerData.roundTime = timeArray[0];
  timerData.elapsed = 0;
  timerData.state = "stopped"
  timerData.holdOverTime = 0;
  timerData.roundIndex = 0;
  let msg = document.getElementById("message")
  msg.innerText = "Ready?";
  msg.style.display = "block";
  msg.style.backgroundColor = "yellow";
  updateProgress(0);
  updateClocks();

}

function updateClocks(){
  document.getElementById("remaining").innerText = formatTime(timerData.remaining);
  document.getElementById("round_timer").innerText = formatTime(timerData.roundTime);
  document.getElementById("elapsed").innerText = formatTime(Math.max(0,timerData.elapsed));
};

function formatTime(seconds) {
  let min = Math.floor(seconds/60);
  let sec = (seconds%60).toFixed(1);
  return `${(min<10 ? '0' : '') + min}:${(sec<10 ? '0' : '') + sec}`
}

function updateDocument(){
  let currentTime = new Date();
  timerData.elapsed = timerData.holdOverTime + (currentTime - timerData.startTime)/1000;
  timerData.roundTime = timerData.timeArray[timerData.roundIndex] - timerData.elapsed;
  timerData.remaining = timerData.timeArray[timerData.timeArray.length-1] - timerData.elapsed;
  let progress = timerData.elapsed / (timerData.elapsed + timerData.remaining);

  if (timerData.roundTime < 0){
    timerData.roundIndex++;
    timerData.bell.play();
    timerData.roundTime = timerData.timeArray[timerData.roundIndex] - timerData.elapsed;
    updateMessage();
  }
  
  if (timerData.remaining < 0){
    stop();
    return;
  }

  updateProgress(progress);
  updateClocks();
}

function playPause(){
  if (timerData.state === "running"){
    clearInterval(timerData.timer);
    timerData.state = "paused";
    document.getElementById("playPauseButton").firstChild.src=timerData.playImg;
    timerData.holdOverTime = timerData.elapsed;
    return;
  }

  if (timerData.state === "paused") {
    timerData.startTime = new Date();    
    timerData.timer = setInterval(updateDocument, 100);
    timerData.state = "running";
    document.getElementById("playPauseButton").firstChild.src=timerData.pauseImg;
    return;
  }

  if (timerData.state === "stopped"){
    timerData.startTime = new Date();
    timerData.timer = setInterval(updateDocument, 100);
    timerData.state = "running";
    document.getElementById("playPauseButton").firstChild.src=timerData.pauseImg;
    updateMessage();
    return;
  }
}

function stop(){
  clearInterval(timerData.timer);
  timerData.state = "stopped";
  createTimer();
  document.getElementById("playPauseButton").firstChild.src=timerData.playImg;
}

function updateProgress(progress){
  document.getElementById("progress").style.width = `${Math.floor(progress*100)}%`
}

function updateMessage(){
  let msg = document.getElementById("message");
  let warmup = timerData.roundIndex == 0;
  let cooldown = timerData.roundIndex == timerData.timeArray.length - 1;
  let hard = (timerData.roundIndex%2 != 0) && !(cooldown);
  let easy = (timerData.roundIndex%2 == 0) && !(warmup);
  let actionImage = document.getElementsByClassName('action_img')
  
  if (warmup) {
    msg.style.display = "block";
    msg.innerText = "Warmup";
    msg.style.backgroundColor = "pink";
    return;
  }
  
  if (hard){
    let pic = action_images[Math.floor(Math.random() * action_images.length)];
    try {
      actionImage[0].style.backgroundImage = pic;
      msg.style.display = "none";  
      return;
    } catch (ReferenceError) {
      msg.style.display = "block";
      msg.innerText = "Go Hard!";
      msg.style.backgroundColor = "Red";
      return;
    }
  }
  
  if (easy){
    msg.style.display = "block";
    msg.innerText = "Go Easy";
    msg.style.backgroundColor = "lightyellow";
    return;
  }
  
  if (cooldown){
    msg.style.display = "block";
    msg.innerText = "cooldown";
    msg.style.backgroundColor = "lightblue";
    return;
  }
}