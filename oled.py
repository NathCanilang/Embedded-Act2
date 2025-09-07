import board
import busio
import threading
import time
from adafruit_ssd1306  import SSD1306_I2C
from PIL import Image, ImageDraw, ImageFont

class OLEDDisplay:
    def __init__(self):
        self.i2c = busio.I2C(board.SCL, board.SDA)
        self.display = SSD1306_I2C(128, 64, self.i2c, addr=0x3C)
        self.display.fill(0)
        self.display.show()

        self.display_value_1 = 0
        self.display_value_2 = 0
        self.thread = threading.Thread(target=self.run_display, daemon=True)
        self.thread.start()

    def run_display(self):
        while True:
            self.display_distance(self.display_value_1, self.display_value_2)
            time.sleep(0.5)  # update every half-second


    def display_distance(self, display_value_1, display_value_2):
        image = Image.new("1", (self.display.width, self.display.height))
        draw = ImageDraw.Draw(image)

        font = ImageFont.load_default()

        draw.text((0, 0), f"Sensor 1 Value: {display_value_1}", font=font, fill=255)
        draw.text((0, 16), f"Sensor 2 Value: {display_value_2}", font=font, fill=255)

        self.display.image(image)
        self.display.show()