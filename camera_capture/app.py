'''
Inove Camera
---------------------------
Autor: Inove Coding School
Version: 1.0
 
Descripcion:
Se utiliza Flask para crear un capturador de datos
de telemetría de una cámara.

Ejecución: Lanzar el programa y abrir en un navegador
la siguiente dirección URL

NOTA: No olvide usar HTTPS en la URL:

http://IP:5021/
'''

__author__ = "Inove Coding School"
__email__ = "alumnos@inove.com.ar"
__version__ = "1.0"

import traceback
import json

from flask import Flask, request, jsonify, render_template, redirect

app = Flask(__name__)
app.secret_key = 'ptSecret'
app.config['SECRET_KEY'] = 'ptSecret'


# ---- Endpoints ----
@app.route('/')
def home():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5021)
