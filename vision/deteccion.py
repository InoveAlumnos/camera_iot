import cv2
import numpy as np
import time
from PIL import Image

class Detection():
    def __init__(self, boxes, confidences, classIDs, classes):
        self.boxes = boxes
        self.confidences = confidences
        self.classIDs = classIDs
        self.classes = classes
    
    def to_list(self):
        return list(zip(self.boxes, self.confidences, self.classIDs))

    def to_json(self):
        json_data = []
        for i in range(len(self.boxes)):
            (x, y) = (self.boxes[i][0], self.boxes[i][1])
            (w, h) = (self.boxes[i][2], self.boxes[i][3])
            confidence = int(self.confidences[i]*100)
            label = self.classes[self.classIDs[i]]
            json_data.append({
                "x": x,
                "y": y,
                "w": w,
                "h": h,
                "confidence": confidence,
                "label": label
            })
        return json_data


class Detector():
    def __init__(self, model_weights, model_config, img_size=416):
        # Load names of classes and get random colors
        self.classes = open('coco.names').read().strip().split('\n')

        np.random.seed(42)
        self.colors = np.random.randint(0, 255, size=(len(self.classes), 3), dtype='uint8')

        self.net = cv2.dnn.readNetFromDarknet(model_config, model_weights)
        self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
        self.IMG_SIZE = img_size

        # determine the output layer
        ln = self.net.getLayerNames()
        self.ln = [ln[i[0] - 1] for i in self.net.getUnconnectedOutLayers()]

    def __model_inference(self, img):
        # construct a blob from the image
        blob = cv2.dnn.blobFromImage(img, 1/255.0, (self.IMG_SIZE, self.IMG_SIZE), swapRB=True, crop=False)

        #img = cv2.resize(img, (300,300)) # resize frame for prediction
        #blob = cv2.dnn.blobFromImage(img, 0.007843, (300, 300), (127.5, 127.5, 127.5), False)
        r = blob[0, 0, :, :]

        self.net.setInput(blob)
        t0 = time.time()
        outputs = self.net.forward(self.ln)
        t = time.time()
        print('time=', t-t0)
        return outputs


    def __post_process(self, img, outputs):
        boxes = []
        confidences = []
        classIDs = []
        h, w = img.shape[:2]

        threshold = 0.5
        nms_threshold = 0.4

        for output in outputs:
            for detection in output:
                scores = detection[5:]
                classID = np.argmax(scores)
                confidence = scores[classID]
                if confidence > threshold:
                    box = detection[:4] * np.array([w, h, w, h])
                    (centerX, centerY, width, height) = box.astype("int")
                    x = int(centerX - (width / 2))
                    y = int(centerY - (height / 2))
                    box = [x, y, int(width), int(height)]
                    boxes.append(box)
                    confidences.append(float(confidence))
                    classIDs.append(classID)

        indices = cv2.dnn.NMSBoxes(boxes, confidences, threshold, nms_threshold)
        filter_boxes = []
        filter_confidences = []
        filter_classIDs = []
        if len(indices) > 0:
            for i in indices.flatten():
                filter_boxes.append(boxes[i])
                filter_confidences.append(confidences[i])
                filter_classIDs.append(classIDs[i])

        return filter_boxes, filter_confidences, filter_classIDs
                

    def draw(self, img):
        for i in range(len(self.boxes)):
            (x, y) = (self.boxes[i][0], self.boxes[i][1])
            (w, h) = (self.boxes[i][2], self.boxes[i][3])
            color = [int(c) for c in self.colors[self.classIDs[i]]]
            cv2.rectangle(img, (x, y), (x + w, y + h), color, 2)
            text = "{}: {:.4f}".format(self.classes[self.classIDs[i]], self.confidences[i])
            cv2.putText(img, text, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

        return img



    def __call__(self, img):
        outputs = self.__model_inference(img)
        self.boxes, self.confidences, self.classIDs = self.__post_process(img, outputs)
        return Detection(self.boxes, self.confidences, self.classIDs, self.classes)


if __name__ == "__main__":

    img_size = 416
    tiny_yolo = Detector('yolov3-tiny.weights', 'yolov3-tiny.cfg', img_size=img_size)
    #tiny_yolo = Detector('yolov3.weights', 'yolov3.cfg')
    #img = Image.open('catdog.jpg').convert('RGB')
    #img = Image.open('people.jpg').convert('RGB')
    img = Image.open(f'prueba_{img_size}.jpg').convert('RGB')
    img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    detections = tiny_yolo(img).to_json()
    print(detections)
    tiny_yolo.draw(img)
    cv2.imwrite("detection_output.jpg", img)