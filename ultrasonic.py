import time
import threading
import RPi.GPIO as gpio

class UltrasonicSensor:
    def __init__(self, trigger_pin, echo_pin):
        self.trigger_pin = trigger_pin
        self.echo_pin = echo_pin
        self.curr_distance = 0
        
        gpio.setmode(gpio.BCM)
        gpio.setup(self.trigger_pin, gpio.OUT)
        gpio.setup(self.echo_pin, gpio.IN)
        self.thread = threading.Thread(target=self.read_loop, daemon=True)    
        self.thread.start()

    def read_loop(self):
        print("ultrasonic sensor has started")

        while True:
            gpio.output(self.trigger_pin, True)
            time.sleep(0.00001)
            gpio.output(self.trigger_pin, False)

            start_time = time.time()
            stop_time = time.time()

            while gpio.input(self.echo_pin) == 0:
                start_time = time.time()

            while gpio.input(self.echo_pin) == 1:
                stop_time = time.time()

            time_elapsed = stop_time - start_time 
            self.curr_distance = (time_elapsed *34300) / 2
            time.sleep(0.1)
            
    def get_current_distance(self):
        return round(self.curr_distance, 2)