from flask import Flask, render_template, Response, redirect, url_for, request, jsonify
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_distance')
def get_distance():
    data = random.randint(2, 400)
    if data:
        return jsonify({
            "distance" : data
        }), 200
    else:
        return jsonify({
            "Error" : "Error reading distance from sensor" 
        }), 500

if __name__ == '__main__':
    app.run()