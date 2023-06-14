#include <WiFi.h>
#include <ESP32Servo.h>
#include "ESPAsyncWebServer.h"
#include <DHT.h>
#include <HTTPClient.h>

#define ALARM 2
#define FAN_PIN 4
#define GARAGE_SERVO_PIN 12
#define LED_PIN 15  
#define PUMP_PIN 16
#define trigPin 25
#define FLAME 27
#define DHT_SENSOR_PIN 32 
#define echoPin 33
#define LIGHT_SENSOR_PIN 34
#define SOIL_SENSOR_PIN 39
#define DHT_SENSOR_TYPE DHT11


unsigned long start_time;
Servo garageServo;
int servoInFirstTime = 0;
const int LDR_ANALOG_THRESHOLD = 150;
float defaultGreenhouseTemp = 20;
DHT dht_sensor(DHT_SENSOR_PIN, DHT_SENSOR_TYPE);
AsyncWebServer server(80);
const char *ssid = "Yousief";
const char *password = "yousief11";
const char *serverUrl = "http://192.168.146.198:5000";

void sendUltrasonicDataToServer(float distance) {
  HTTPClient http;
  http.begin(String(serverUrl) + "/ultrasonic");
  http.addHeader("Content-Type", "application/json");
  String json = "{\"distance\": " + String(distance) + "}";
  int httpResponseCode = http.POST(json);
  if (httpResponseCode > 0) {
    if (distance <= 25) {
      garageServo.write(180);
      start_time = millis();
    }
    if (start_time != 0 && (millis() - start_time) >= 10000) {
      garageServo.write(0);
      start_time = 0;
    }
  } else {
    Serial.printf("[HTTP] POST to server failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}

void sendLdrDataToServer(int ldrValue) {
  HTTPClient http;
  http.begin(String(serverUrl) + "/ldr");
  bool isLighting = false;
  if (ldrValue < LDR_ANALOG_THRESHOLD)
    isLighting = true;
  http.addHeader("Content-Type", "application/json");
  String json = "{\"lighting\": " + String(isLighting) + "}";
  int httpResponseCode = http.POST(json);
  if (httpResponseCode > 0) {
    if (ldrValue < LDR_ANALOG_THRESHOLD)
      digitalWrite(LED_PIN, HIGH);
    else
      digitalWrite(LED_PIN, LOW);

    // Serial.printf("[HTTP] POST to server success, response code: %d\n", httpResponseCode);
  } else {
    Serial.printf("[HTTP] POST to server failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}

void sendTempDataToServer(int tempC, float humidity) {
  HTTPClient http;
  http.begin(String(serverUrl) + "/dht");
  bool fanStatus = false;
  if (tempC > defaultGreenhouseTemp)
    fanStatus = true;
  http.addHeader("Content-Type", "application/json");
  String json = "{\"fanStatus\": " + String(fanStatus) + ", \"temp\": " + String(tempC) + " , \"humidity\": " + String(humidity) + "}";
  int httpResponseCode = http.POST(json);
  if (httpResponseCode > 0) {
    if (tempC < defaultGreenhouseTemp)
      digitalWrite(FAN_PIN, 0);
    else
      digitalWrite(FAN_PIN, 1);

    // Serial.printf("[HTTP] POST to server success, response code: %d\n", httpResponseCode);
  } else {
    Serial.printf("[HTTP] POST to server failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}

void sendPUMPDataToServer(int soilSensorValue) {
  HTTPClient http;
  http.begin(String(serverUrl) + "/pump");
  bool pumpStatus = true;
  http.addHeader("Content-Type", "application/json");
  if (soilSensorValue > 20)
    pumpStatus = false;
  String json = "{\"pump\": " + String(pumpStatus) + ", \"soilValue\": " + String(soilSensorValue) + "}";
  int httpResponseCode = http.POST(json);
  Serial.println("Soil: " + String(soilSensorValue));
  if (httpResponseCode > 0) {
    if (soilSensorValue > 20)
      digitalWrite(PUMP_PIN, 0);  // turn on pump
    else
      digitalWrite(PUMP_PIN, 1);  // turn off pump

    Serial.printf("[HTTP] POST to server success, response code: %d\n", httpResponseCode);
  } else {
    Serial.printf("[HTTP] POST to server failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}


float getUrltraSonicRead() {
  // Trigger the ultrasonic sensor
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Measure the distance
  long duration = pulseIn(echoPin, HIGH);
  float distance = duration * 0.034 / 2;
  return distance;
}

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(FLAME, INPUT);
  pinMode(ALARM, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  // pinMode(WATER_LEVEL_PIN, INPUT);
  pinMode(SOIL_SENSOR_PIN, INPUT);
  pinMode(PUMP_PIN, OUTPUT);
  garageServo.attach(GARAGE_SERVO_PIN);
  dht_sensor.begin();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi.");

  Serial.println(WiFi.localIP());


  server.on("/turn-on-garage-servo", HTTP_GET, [](AsyncWebServerRequest *request) {
    int garageServoDegree = garageServo.read();
    Serial.println("garage servo" + String(garageServoDegree));
    if (garageServoDegree == -1) {
      garageServo.write(180);
      request->send(200, "application/json", "{\"status\": 200, \"garage_servo\": true, \"message\": \"garage opened successfully\"}");
    } else {
      request->send(200, "application/json", "{\"status\": 400, \"garage_servo\": true, \"message\": \"garage servo already opened\"}");
    }
  });

  server.on("/turn-off-garage-servo", HTTP_GET, [](AsyncWebServerRequest *request) {
    int garageServoDegree = garageServo.read();
    Serial.println("Garage" + String(garageServoDegree));
    if (garageServoDegree == 178) {
      garageServo.write(0);
      request->send(200, "application/json", "{\"status\": 200, \"garage_servo\": false, \"message\": \"garage closed successfully\"}");
    } else {
      request->send(200, "application/json", "{\"status\": 400, \"garage_servo\": true, \"message\": \"garage servo already closed\"}");
    }
  });

  server.on("/dht", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (request->hasParam("temp")) {
      defaultGreenhouseTemp = atof(request->getParam("temp")->value().c_str());
      request->send(200, "application/json", "{\"status\": 200, \"message\": \"The temperature you sent was recorded successfully\"}");
    } else {
      request->send(200, "application/json", "{\"status\": 400, \"message\": \"you must send temperature\"}");
    }
  });



  // Start server
  server.begin();
}



void loop() {

  // servo in first time return random value so i create this varaible to disable random value
  if (servoInFirstTime == 0) {
    garageServo.write(180);
    servoInFirstTime = 1;
  }

  // ultrasonic read and send data to server
  const float distance = getUrltraSonicRead();
  sendUltrasonicDataToServer(distance);

  //ldr read and send data to server
  const int readLDR = analogRead(LIGHT_SENSOR_PIN);  // read the value on ldr analog pin
  Serial.println("ldr: " + String(readLDR));
  sendLdrDataToServer(readLDR);

  //dht read and send data to server
  float tempC = dht_sensor.readTemperature();
  float humidity = dht_sensor.readHumidity();
  Serial.println("temp: " + String(tempC));
  sendTempDataToServer(tempC, humidity);

  // flame sensor
  int fire = digitalRead(FLAME);
  if (fire == HIGH) {
    digitalWrite(ALARM, HIGH);
  } else {
    digitalWrite(ALARM, LOW);
  }

  int soilValue = analogRead(SOIL_SENSOR_PIN);             // read the analog value from soil sensor
  int moisturePercent = map(soilValue, 4095, 10, 0, 100);  // convert the analog value to percentage
  sendPUMPDataToServer(moisturePercent);


  delay(200);
}
