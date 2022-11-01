const cameraOptions = document.querySelector('.video-options>select');
const canvas = document.querySelector('canvas');
let mqtt_connected = false;

const videoWidth = 416;
const videoHeight = 416;

const consoleOutput = document.getElementById("console");
const log = function (msg) {
    if(consoleOutput != null) {
        consoleOutput.innerText = `${consoleOutput.innerText}\n${msg}`;
    }
    console.log(msg);
}

canvas.width = videoWidth;
canvas.height = videoHeight;
let ctx = canvas.getContext('2d');


// ---- MQTT Websockets ----

const client = new Paho.MQTT.Client(document.location.hostname, 9001, "iotcameracapture");

// set callback handlers
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    mqtt_connected = true;
    client.subscribe(`sensores/camara/#`);
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
  if(message.destinationName.includes('sensores/camara')) {
    const tipoDato = message.destinationName.split("/")[2]
    if(cameraOptions.value == tipoDato) {
      const data = JSON.parse(msg);
      const imageData = data["imageData"];
      const image = new Image();
      image.src = imageData;
      image.onload = function() {
        ctx.drawImage(image, 0, 0);
      };
    }
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
