let data = {
state: "stopped",
timeArray: [],
startTime: null,
remaining: 0,
roundTime: 0,
elapsed: 0,
holdOverTime: 0,
roundIndex: 0,
timer: null
}

let action_images = [
  "url('https://media.giphy.com/media/14n5Zi31QTEsla/giphy.gif')",
  "url('https://media.giphy.com/media/eiYaX9CKUl5jW/giphy.gif')",
  "url('https://media.giphy.com/media/3oEduOnl5IHM5NRodO/giphy.gif')"
]


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
  if (data.state == "running") return;
  
  data.roundIndex = 0;

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

  data.timeArray = timeArray;
  data.remaining = timeArray[timeArrayLength-1];
  data.roundTime = timeArray[0];
  data.elapsed = 0;
  data.state = "stopped"
  data.holdOverTime = 0;
  data.roundIndex = 0;
  let msg = document.getElementById("message")
  msg.innerText = "Ready?";
  msg.style.display = "block";
  msg.style.backgroundColor = "yellow";
  updateProgress(0);
  updateClocks();

}

function updateClocks(){
  document.getElementById("remaining").innerText = formatTime(data.remaining);
  document.getElementById("round_timer").innerText = formatTime(data.roundTime);
  document.getElementById("elapsed").innerText = formatTime(Math.max(0,data.elapsed));
};

function formatTime(seconds) {
  let min = Math.floor(seconds/60);
  let sec = (seconds%60).toFixed(1);
  return `${(min<10 ? '0' : '') + min}:${(sec<10 ? '0' : '') + sec}`
}

function updateDocument(){
  let currentTime = new Date();
  data.elapsed = data.holdOverTime + (currentTime - data.startTime)/1000;
  data.roundTime = data.timeArray[data.roundIndex] - data.elapsed;
  data.remaining = data.timeArray[data.timeArray.length-1] - data.elapsed;
  let progress = data.elapsed / (data.elapsed + data.remaining);

  if (data.roundTime < 0){
    data.roundIndex++;
    data.bell.play();
    data.roundTime = data.timeArray[data.roundIndex] - data.elapsed;
    updateMessage();
  }
  
  if (data.remaining < 0){
    stop();
    return;
  }

  updateProgress(progress);
  updateClocks();
}

function playPause(){
  if (data.state === "running"){
    clearInterval(data.timer);
    data.state = "paused";
    document.getElementById("playPauseButton").firstChild.src=data.playImg;
    data.holdOverTime = data.elapsed;
    return;
  }

  if (data.state === "paused") {
    data.startTime = new Date();    
    data.timer = setInterval(updateDocument, 100);
    data.state = "running";
    document.getElementById("playPauseButton").firstChild.src=data.pauseImg;
    return;
  }

  if (data.state === "stopped"){
    data.startTime = new Date();
    data.timer = setInterval(updateDocument, 100);
    data.state = "running";
    document.getElementById("playPauseButton").firstChild.src=data.pauseImg;
    updateMessage();
    return;
  }
}

function stop(){
  clearInterval(data.timer);
  data.state = "stopped";
  createTimer();
  document.getElementById("playPauseButton").firstChild.src=data.playImg;
}

function updateProgress(progress){
  document.getElementById("progress").style.width = `${Math.floor(progress*100)}%`
}

function updateMessage(){
  let msg = document.getElementById("message");
  let warmup = data.roundIndex == 0;
  let cooldown = data.roundIndex == data.timeArray.length - 1;
  let hard = (data.roundIndex%2 != 0) && !(cooldown);
  let easy = (data.roundIndex%2 == 0) && !(warmup);
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