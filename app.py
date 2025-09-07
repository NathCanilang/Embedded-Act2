from flask import Flask, render_template, request, jsonify
from database import SensorDatabase 
import random

#comment this imports to run the website without sensors
from ultrasonic import UltrasonicSensor
from oled import OLEDDisplay
from buzzer import BuzzerController

app = Flask(__name__)
db = SensorDatabase()
db.createTable()

#GPIO pin settings ito
s1_trig_pin = 17
s1_echo_pin = 27

s2_trig_pin = 5
s2_echo_pin = 6
#comment this code to run the website without sensors
#also comment the display_sensor_values_oled code to run the site without sensors
u_sensor1 = UltrasonicSensor(s1_trig_pin, s1_echo_pin)
u_sensor2 = UltrasonicSensor(s2_trig_pin, s2_echo_pin)
oled = OLEDDisplay()
buzzer = BuzzerController()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_distance')
def get_distance():
    #data1 = random.randint(2, 400)
    #data2 = random.randint(2, 400)

    data1 = u_sensor1.get_current_distance()
    data2 = u_sensor2.get_current_distance()

    if data1 and data2:
        db.insert_data_sensor(data1, 1)
        db.insert_data_sensor(data2, 2)

        return jsonify({
            "distance1" : data1,
            "distance2" : data2
        }), 200
    
    else:
        return jsonify({
            "Error" : "Error reading distance from sensor" 
        }), 500
    
@app.route('/get_data_from_db')
def get_data_from_db():
    sensor_data = db.get_latest_distance()
    data = []
    if sensor_data:
        for row in sensor_data:
                row_dict = {
                    "id": row[0],
                    "distance": row[1],
                    "timestamp": row[2],
                    "sensor_count": row[3]
                }
                data.append(row_dict)
        return jsonify(data)
    else:
        return jsonify({"error": "Data Error"}), 405
    
@app.route('/display_sensor_values_oled', methods = ["POST"])
def display_sensor_values_oled():
    data = request.get_json()

    if not data:
        return jsonify({"Error": "No values received" }), 400
    else:
        s1_distance = data.get("distance1")
        s2_distance = data.get("distance2")
        oled.display_distance(s1_distance, s2_distance)
        return jsonify({"Success":"Values Received"}), 201

@app.route('/start_buzzer', methods=["POST"])
def start_buzzer():
    buzzer.start()
    return jsonify({"status": "buzzer started"})

@app.route('/stop_buzzer', methods=["POST"])
def stop_buzzer():
    buzzer.stop()
    return jsonify({"status": "buzzer stopped"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)