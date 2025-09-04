import time
import threading
import RPi.GPIO as GPIO

class BuzzerController:
    def __init__(self,):
        self.pin = 24
        self.interval = 0.5  # seconds (toggle interval)
        self.active = False
        self.thread = None
        self.stop_event = threading.Event()

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.pin, GPIO.OUT)
        GPIO.output(self.pin, GPIO.LOW)

    def _buzz_loop(self):
        print("Buzzer loop started")
        while not self.stop_event.is_set():
            GPIO.output(self.pin, GPIO.HIGH)
            time.sleep(self.interval)
            GPIO.output(self.pin, GPIO.LOW)
            time.sleep(self.interval)
        GPIO.output(self.pin, GPIO.LOW) 
        print("Buzzer loop stopped")

    def start(self):
        if not self.active:
            self.active = True
            self.stop_event.clear()
            self.thread = threading.Thread(target=self._buzz_loop, daemon=True)
            self.thread.start()

    def stop(self):
        if self.active:
            self.stop_event.set()
            self.active = False

    def cleanup(self):
        self.stop()
        GPIO.cleanup(self.pin)