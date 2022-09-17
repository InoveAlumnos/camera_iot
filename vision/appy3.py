'''
Inove Drone Mock Python IoT
---------------------------
Autor: Inove Coding School
Version: 1.0
 
Descripcion:
Se utiliza Flask para crear un generador de datos
de telemetría simulando un Drone:
- Motores
- Luz ON/OFF
- Acelerómetro
- Giróscopo
- GPS

Ejecución: Lanzar el programa y abrir en un navegador
la siguiente dirección URL

NOTA: No olvide usar HTTPS en la URL:

https://IP:5010/
'''

__author__ = "Inove Coding School"
__email__ = "alumnos@inove.com.ar"
__version__ = "1.0"

import traceback
import json
from PIL import Image
import base64
import io


import cv2
import numpy as np
from deteccion import Detector
yolo = Detector('yolov3.weights', 'yolov3.cfg')

# ---- MQTT ----
import paho.mqtt.client as mqtt


def on_connect(client, userdata, flags, rc):
    print("MQTT Conectado")
    client.subscribe("sensores/camara/raw")



def on_message(client, userdata, msg):
    topic = str(msg.topic)
    value = str(msg.payload.decode("utf-8"))

    if topic == "sensores/camara/raw":
        img = json.loads(value)['imageData']
        img = img.replace('data:image/jpeg;base64,', '')
        img = img.replace(' ', '+')
        base64_decoded = base64.b64decode(img)
        image = Image.open(io.BytesIO(base64_decoded))

        img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        detections = yolo(img).to_json()
        outimg = yolo.draw(img)
        cv2.imwrite("output.jpg", outimg)
        _, im_arr = cv2.imencode('.jpg', outimg)  # im_arr: image in Numpy one-dim array format.
        im_bytes = im_arr.tobytes()
        im_b64 = base64.b64encode(im_bytes).decode('ascii')
        im_toDataUrl = 'data:image/jpeg;base64,' + im_b64
        client.publish("sensores/camara/detecciones", json.dumps({"imageData": im_toDataUrl}))
    

if __name__ == "__main__":
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect("localhost", 1883, 10)
    print("Conectado al servidor MQTT")
    client.loop_start()

    while True:
        pass