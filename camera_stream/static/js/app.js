const controls = document.querySelector('.controls');
const cameraOptions = document.querySelector('.video-options>select');
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const buttons = [...controls.querySelectorAll('button')];
let cameraReady = false;
let streamStarted = false;
let streamRunning = false;
let facingMode = "user";
let socket_connected = false;
let mqtt_connected = false;

const [play, pause, envMode, userMode] = buttons;

const videoWidth = 416;
const videoHeight = 416;

const consoleOutput = document.getElementById("console");
const log = function (msg) {
    if(consoleOutput != null) {
        consoleOutput.innerText = `${consoleOutput.innerText}\n${msg}`;
    }
    console.log(msg);
}

canvas.hidden = true;
canvas.width = videoWidth;
canvas.height = videoHeight;
let ctx = canvas.getContext('2d');
ctx.fillStyle = "gray";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.closePath();


const constraints = {
  video: {
    width: {
      ideal: videoWidth,
    },
    height: {
      ideal: videoHeight,
    },
    facingMode: facingMode
    // width: {
    //   min: 1024,
    //   ideal: 1280,
    //   max: 1920,
    // },
    // height: {
    //   min: 576,
    //   ideal: 720,
    //   max: 1080
    // },
  },
  audio: false,
};

play.onclick = () => {
  if (streamStarted) {
    video.play();
  } else {
    if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {   
      const updatedConstraints = {
        ...constraints,
        deviceId: {
          exact: cameraOptions.value
        },
      };
      updatedConstraints.video.facingMode = facingMode;
      startStream(updatedConstraints);
    }
  }
  streamRunning = true;
};

const pauseStream = () => {
  video.pause();
  streamRunning = false;
};

const setEnvMode = async () => {
  facingMode = "environment";
  envMode.style.display = "none";
  userMode.style.display = "block";
};
const setUserMode = async () => {
  facingMode = "user";
  userMode.style.display = "none";
  envMode.style.display = "block";
};


const doScreenshot = () => { 
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height );
  
  imageData = canvas.toDataURL('image/jpeg');

  /*message = new Paho.MQTT.Message(JSON.stringify({imageData: imageData}));
  message.destinationName = `sensores/camara/raw`;
  client.send(message);*/
  socket.emit("camera_event", JSON.stringify({imageData: imageData}));
  
};


(function my_func() {
  if (streamRunning == true && socket_connected == true){
    doScreenshot();
  }
  setTimeout( my_func, 2000 );
})();

pause.onclick = pauseStream;
envMode.onclick = setEnvMode;
userMode.onclick = setUserMode;

const startStream = async (constraints) => {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  handleStream(stream);
};


const handleStream = (stream) => {
  video.srcObject = stream;

  streamStarted = true;
  userMode.style.display = "none";
  envMode.style.display = "none";
  cameraOptions.style.display = 'none';
};


const getCameraSelection = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  if (videoDevices.length === 0) {
    return;
  }
  const options = videoDevices.map(videoDevice => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });
  cameraOptions.innerHTML = options.join('');
  cameraReady = true;
};

(function waitCamera() {
  getCameraSelection();
  if(cameraReady == false) {
    setTimeout(waitCamera, 500 );
  }
})();

// ---- Web sockets contra el backend ----
let socket = io();
socket.on("connect", function() {
    socket_connected = true;
});

// ---- MQTT Websockets ----
/*
const client = new Paho.MQTT.Client("localhost", 9001, "iotcamera");

// set callback handlers
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    mqtt_connected = true;
    client.subscribe(`sensores/camara/detecciones`);
}

function doFail(e) {
    log(e.errorCode);
    console.log(e);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  mqtt_connected = false;
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost: " + responseObject.errorMessage);
    }
  }

// called when a message arrives
function onMessageArrived(message) {
  //console.log("onMessageArrived: " + message.destinationName + "  "+ message.payloadString);
  const msg = message.payloadString;
  if(message.destinationName == `sensores/camara/detecciones`) {
      const data = JSON.parse(msg);
      const imageData = data["imageData"];
      const image = new Image();
      image.src = imageData;
      image.onload = function() {
        ctx.drawImage(image, 0, 0);
      };
  }
  else {
      console.log("Tópico no soportado: "+ message.destinationName);
  }
}

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
const options = {
  onSuccess: onConnect,
  onFailure: doFail,
}
// connect the client
client.connect(options);
*/

  // const url = `http://127.0.0.1:5021/inference`;
  // const resp = await fetch(url, {
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json'
  //         },
  //         body: JSON.stringify({imageData: imageData})
  //     });
  // if(resp.ok) {
  //   const detections = await resp.json();
  //   console.log(detections);
    
  //   detections.forEach(d => {
  //     ctx.beginPath();
  //     ctx.strokeStyle = '#00FF00';
  //     ctx.rect(d["x"], d["y"], d["w"], d["h"]);
  //     ctx.lineWidth = 4;
  //     ctx.stroke();
  //     font_size = 20
  //     ctx.font = `${font_size}pt sans-serif`;
  //     //ctx.textAlign="center"; 
  //     ctx.textBaseline = "middle";
  //     ctx.fillStyle = '#00FF00';
  //     ctx.fillText(`${d["label"]} ${d["confidence"]}`,d["x"],d["y"]-font_size);
  //     ctx.closePath();  
  //   });
  // } else {
  //     console.log("Falló la petición");
  // }