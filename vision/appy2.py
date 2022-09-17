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

from flask import Flask, request, jsonify, render_template, Response, make_response
from flask_cors import CORS # https://stackoverflow.com/questions/26980713/solve-cross-origin-resource-sharing-with-flask

app = Flask(__name__)
CORS(app)

import cv2
import numpy as np
from deteccion import Detector
yolo = Detector('yolov3.weights', 'yolov3.cfg')

# ---- Endpoints ----
@app.route('/')
def home():
    return "Holis"


@app.route('/inference', methods=['POST'])
def inference():
    print("hola")
    img = request.json['imageData']
    img = img.replace('data:image/jpeg;base64,', '')
    img = img.replace(' ', '+')
    base64_decoded = base64.b64decode(img)
    image = Image.open(io.BytesIO(base64_decoded))
    image.save("prueba.jpg")

    img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    detections = yolo(img).to_json()
    return make_response(jsonify(detections), 200)



if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5021)
