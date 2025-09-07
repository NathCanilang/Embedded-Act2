from flask import Flask, render_template, request, jsonify
from database import SensorDatabase 
import random

app = Flask(__name__)
db = SensorDatabase()
db.createTable()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_distance')
def get_distance():
    data1 = random.randint(2, 400)
    data2 = random.randint(2, 400)

    if data1 and data2:
        db.insert_data_sensor(data1, 1)
        db.insert_data_sensor(data2, 2)

        return jsonify({
            "distance" : data1
        }), 200
    
    else:
        return jsonify({
            "Error" : "Error reading distance from sensor" 
        }), 500
    
    '''
@app.route('/save_distance', methods=['POST'])
def save_distance():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400
    else:
        distance = data.get("distance")
        db.insert_data_sensor(distance)
        return jsonify({"status": "success", "received": distance}), 200
        '''
    
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



        
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)