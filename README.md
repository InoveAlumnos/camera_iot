# Camera IoT

En este repositorio encontrará dos carpetas:
- camera_stream --> programa para capturar la cámara del dispositivo (PC o celular) y transmitir cada los datos por MQTT (stream de video)
- camera_capture --> programa que captura los datos provenientes de MQTT (stream de video) y los renderiza en el explorador

### Lanazar docker con ambos sistemas
Para lenvatar ambos sistemas ejecutar:
```sh
$ docker-compose up
```
Para lenvatar ambos sistemas y que no le quede tomada la consola ejecutar:
```sh
$ docker-compose start
```
Para detener los procesos ejecutar:
```sh
$ docker-compose down
$ docker-compose stop
```

### Visualizar los sistemas
Ingresar a la siguiente URL en el dispositivo que desea utilizar la cámara
```
https://127.0.0.1:5020/
```

__IMPORTANTE__: Como este sistema toma la cámara del dispositivo que ingrese a la URL, no debe olvidarse de AGREGAR el "https" en la URL.

Ingresar a la siguiente URL en la PC donde desea ver el video transmitido:
```
http://127.0.0.1:5021/
```