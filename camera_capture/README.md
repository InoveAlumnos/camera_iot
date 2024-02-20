![logotipo](inove.jpg)
# Camara Streaming
### Simuladorde datos de una Camara basado en Flask

Este es un proyecto realizado por miembros de inove como un servicio para incorporar telemetría de una camara para el programa de ejemplos del curso de Python IoT.

![logotipo](sistema.jpg)

### Configuración de Mosquitto websockets
Debemos configurar el servidor de mosquitto para soportar el uso de websockets:
```sh
$ sudo touch /etc/mosquitto/conf.d/mosquitto.conf
$ echo -e "allow_anonymous true\nlistener 1883 0.0.0.0\nallow_anonymous true\nlistener 9001\nprotocol websockets" | sudo tee /etc/mosquitto/conf.d/mosquitto.conf
$ sudo service mosquitto restart
```

# Comenzando 🚀
El objetivo de este proyecto es dar un ejemplo de aplicación de Python en la generación de imagenes y videos utilizando el celular. Este proyecto se basa en tomar la telemetría generada y compartir dicha información por mqtt.

__IMPORTANTE__: La aplicación se desarrollo con certificados SSL no verificados, es por ello que cuando ingrese a la URL el explorador le consultará si "está seguro" que desea ingresar a la página "no segura". Su URL se verá como la siguiente:
```sh
https://<ip_host_flask>:5020
```

# Pre-requisitos 📋
Para poder ejecutar esta aplicación, será necesario tener instalada la versión 3.7 de Python o superior.\
Instale las librerias que se comentan en requirements.txt

# Tópicos de MQTT
Por defecto la aplicación busca conectarse a un broker MQTT local (localhost) en el puerto 1883. Los datos de telemetría de los sensores de la aplicación son:
```
sensores/camara/raw
```
Ejemplo usando mosquitto sub:
```sh
$ mosquitto_sub -t "sensores/camara/raw"
```

# Instalación y pruebas 🔧⚙️
Una vez levantado el server, deberá conocer la IP del servidor en su red local para poder ingresar:
```ssh
https://<ip_host_flask>:5020
```
Inmediatamente después podrá ver en su MQTT broker la telemetría que evoluciona a medida que interactua con el sistema.

# Autores ✒️
### Miembros de Inove (coding school)
:octocat: Hernán Contigiani\
:octocat: Hector Vergara\
:octocat: Javier Carguno

# Licencia 📄
Este proyecto está bajo la Licencia de Inove (coding school) para libre descarga y uso. Este proyecto tiene un propósito educativo y de muestra, por ello, no nos responsabilizaremos por su uso indebido. Así mismo, no existe garantía en su implementación debido a que se trata de una demostración de uso gratuito con propósitos educativos. 
### :copyright: Inove (coding school) 2022.
