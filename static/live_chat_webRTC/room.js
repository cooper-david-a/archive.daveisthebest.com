const configuration = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

const csrftoken = getCookie('csrftoken');
let peerConnection = new RTCPeerConnection(configuration);
let dataChannel;
let localStream;
let remoteStream;
let sdpData;
let connected = false;
const user1 = document.getElementById('user-1');
const user2 = document.getElementById('user-2');

let constraints = {
    video: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
    },
    audio: true
}

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    remoteStream = new MediaStream()
    user1.srcObject = localStream
    user2.srcObject = remoteStream
    
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => { remoteStream.addTrack(track); });
        user1.classList.add('small-frame');
        user2.style.display = 'block';
    };

    peerConnection.ondatachannel = function (e) {
        dataChannel = e.channel;
        addDataChannelEvents(dataChannel);
    }
    
    if (isRoomCreator) {
        createOffer();        
    } else {
        createAnswer();        
    }
            
}

let createOffer = async () => {
    dataChannel = peerConnection.createDataChannel('dataChannel');
    addDataChannelEvents(dataChannel);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await waitForAllICE(peerConnection);
    await postSdp(peerConnection.localDescription);
    setTimeout(addAnswer, 5000);
}

let createAnswer = async () => {
    await retrieveSdp();
    await peerConnection.setRemoteDescription(sdpData.offer);
    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    await waitForAllICE(peerConnection);
    await postSdp(peerConnection.localDescription);
}

let postSdp = async (localDescription) => {
    await fetch(
        window.location + '/sdp',
        {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(localDescription)
        }
    )
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((error) => console.log(error))
}

let retrieveSdp = async () => {
    await fetch(window.location + '/sdp', { method: 'GET' })
        .then((res) => res.json())
        .then((data) => { sdpData = data; })
}

function waitForAllICE(peerConnection) {
    return waitForEvent(
        (fulfill) => {
            peerConnection.onicecandidate = (iceEvent) => {
                if (!iceEvent.candidate) {
                    fulfill()
            }
        }
    })
}

function waitForEvent(user_function, delay = 30000) {
    return new Promise((fulfill, reject) => {
        user_function(fulfill);
        setTimeout(() => reject("Waited too long"), delay);
    })
}

let toggleCamera = async () => {
    let videoTrack = localStream.getTracks().find(track => track.kind === 'video');

    if (videoTrack.enabled) {
        videoTrack.enabled = false;
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(255,80,80)';
    } else {
        videoTrack.enabled = true;
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(179,102,249, .9)';
    }
}

let toggleMic = async () => {
    let audioTrack = localStream.getTracks().find(track => track.kind === 'audio');

    if (audioTrack.enabled) {
        audioTrack.enabled = false;
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(255,80,80)';
    } else {
        audioTrack.enabled = true;
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(179,102,249, .9)';
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

let handleUserLeft = () => {
    document.getElementById('user-2').style.display = 'none'
    document.getElementById('user-1').classList.remove('smallFrame')
}

async function addAnswer() {
    await retrieveSdp();
    if (sdpData.answer) {
        if (!peerConnection.currentRemoteDescription) {
            peerConnection.setRemoteDescription(sdpData.answer);
        }
        return;
    } else setTimeout(addAnswer, 2000)
}

function addDataChannelEvents(dataChannel) {
    dataChannel.onopen = function (e) { console.log(e) };
    dataChannel.onclose = function (e) { console.log(e) };
    dataChannel.onmessage = handleIncomingMsg;
}
        
function postChatMsg() {
    let chatInput = document.getElementById('chat-input');
    let msg = chatInput.value;
    msg = urlify(msg);
    let chatEntry = document.createElement('p');
    chatEntry.innerHTML = msg;
    chatEntry.classList.add('me');
    document.getElementById('chat-text').appendChild(chatEntry);
    dataChannel.send(JSON.stringify({ type: 'chat', data: msg }));
    chatInput.value = '';
}

function handleIncomingMsg(e) {
    msg = JSON.parse(e.data);

    switch (msg.type) {
        case 'chat':
            let chatEntry = document.createElement('p');
            chatEntry.innerHTML = msg.data;
            chatEntry.classList.add('you');
            document.getElementById('chat-text').appendChild(chatEntry);            
            break;
    
        default:
            console.log(msg);
    }
}


function urlify(text) {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '">' + url + '</a>';
    })
}

document.getElementById('camera-btn').addEventListener('click', toggleCamera);
document.getElementById('mic-btn').addEventListener('click', toggleMic);
document.getElementById('post-chat-btn').addEventListener('click', postChatMsg);
// document.getElementById('add-answer').addEventListener('click', addAnswer)

window.addEventListener('load', init);