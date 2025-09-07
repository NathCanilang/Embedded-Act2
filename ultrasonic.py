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
        while True:
            # Send 10µs pulse
            gpio.output(self.trigger_pin, True)
            time.sleep(0.00001)
            gpio.output(self.trigger_pin, False)

            # Wait for echo start (with timeout)
            timeout = time.time() + 0.05  # 50ms
            while gpio.input(self.echo_pin) == 0 and time.time() < timeout:
                start_time = time.time()

            if time.time() >= timeout:
                self.curr_distance = None
                time.sleep(0.1)
                continue

            # Wait for echo end (with timeout)
            timeout = time.time() + 0.05
            while gpio.input(self.echo_pin) == 1 and time.time() < timeout:
                stop_time = time.time()

            if time.time() >= timeout:
                self.curr_distance = None
                time.sleep(0.1)
                continue

            # Calculate distance
            time_elapsed = stop_time - start_time
            self.curr_distance = (time_elapsed * 34300) / 2

            time.sleep(0.1)  # avoid flooding
