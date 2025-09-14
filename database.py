import sqlite3

class SensorDatabase:
    def __init__(self, db_name="sensors_database.db"):
        self.name = ""
        self.db_name = db_name

    def get_connection(self):
        return sqlite3.connect(self.db_name)
    
    def createTable(self):
        con = self.get_connection()
        cur = con.cursor()
        cur.execute("""
                    CREATE TABLE IF NOT EXISTS ultrasonic_sensor (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        distance REAL,
                        timestamp DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, '+8 hours')),
                        sensor_count INTEGER NOT NULL
                    )  
                    """)
        cur.execute("""
                    CREATE TABLE IF NOT EXISTS dht11_sensor (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        temperature REAL,
                        humidity REAL,
                        timestamp DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, '+8 hours'))
                    )   """)
        con.commit()
        con.close()

    #sensor count will only be one or two
    def insert_data_sensor(self, distance, sensor_count):
        con = self.get_connection()
        cur = con.cursor()
        cur.execute(
            "INSERT INTO ultrasonic_sensor (distance, sensor_count) VALUES (?, ?)", (distance, sensor_count,)
        )
        
        con.commit()
        con.close

    def get_latest_distance(self):
        con = self.get_connection()
        cur = con.cursor()
        cur.execute(
            """
                SELECT *
                FROM ultrasonic_sensor
                WHERE id IN (
                    SELECT MAX(id)
                    FROM ultrasonic_sensor
                    GROUP BY sensor_count
                );            
            """
        )
        rows = cur.fetchall()        
        con.close()
        return rows

    def insert_data_dht11(self, temperature, humidity):
        con = self.get_connection()
        cur = con.cursor()
        cur.execute(
            "INSERT INTO dht11_sensor (temperature, humidity) VALUES (?, ?)", (temperature, humidity)
        )
        con.commit()
        con.close()

    def get_latest_dht11(self):
        con = self.get_connection()
        cur = con.cursor()
        cur.execute(
            """
                SELECT *
                FROM dht11_sensor
                ORDER BY id DESC
                LIMIT 1;
            """
        )
        row = cur.fetchone()
        con.close()
        return row

