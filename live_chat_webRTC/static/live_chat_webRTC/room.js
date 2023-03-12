const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

const csrftoken = getCookie('csrftoken');
let peerConnection = new RTCPeerConnection(servers)
let localStream;
let remoteStream;
let sdpData;


let constraints = {
    video: true,
    audio: true
}

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    remoteStream = new MediaStream()
    document.getElementById('user-1').srcObject = localStream
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };
}

let createOffer = async () => {

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await waitForAllICE(peerConnection);        
    console.log(offer);
    await postSdp(peerConnection.localDescription);
}

let createAnswer = async () => {
    await retrieveSdp();
    await peerConnection.setRemoteDescription(sdpData.offer);
    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    await waitForAllICE(peerConnection);
    await postSdp(peerConnection.localDescription);
}

let addAnswer = async () => {
    await retrieveSdp();
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(sdpData.answer);
    }
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
    ).then((res) => res.json())
        .then((data) => console.log(data))
}

let retrieveSdp = async () => {
    await fetch(
        window.location + '/sdp',
        { method: 'GET' })
        .then((res) => res.json()).then((data) => { sdpData = data; })
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

document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
// document.getElementById('create-offer').addEventListener('click', createOffer)
// document.getElementById('create-answer').addEventListener('click', createAnswer)
// document.getElementById('add-answer').addEventListener('click', addAnswer)

init();