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
  /*ctx.save();
  if(facingMode == "environment") {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height );
  } else {
    // flip image before draw
    ctx.scale(-1, 1);
    ctx.drawImage(video, canvas.width * -1, 0, canvas.width, canvas.height );
  }
  imageData = canvas.toDataURL('image/jpeg');
  ctx.restore();*/

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
