import sqlite3

class SensorDatabase:
    def __init__(self, db_name="ultrasonic_sensors_database.db"):
        self.name = ""
        self.db_name = db_name

    def get_connection(self):
        return sqlite3.connect(self.db_name)
    
    def createTable(self):
        con = self.get_connection()
        cur = con.cursor()
        cur.execute("""
                    CREATE TABLE IF NOT EXISTS u_sensor (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        distance REAL,
                        timestamp DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, '+8 hours')),
                        sensor_count INTEGER NOT NULL
                    );                    
                    """)
        con.commit()
        con.close()

    #sensor count will only be one or two
    def insert_data_sensor(self, distance, sensor_count):
        con = self.get_connection()
        cur = con.cursor()
        cur.execute(
            "INSERT INTO u_sensor (distance, sensor_count) VALUES (?, ?)", (distance, sensor_count,)
        )
        con.commit()
        con.close

    def get_latest_distance(self):
        con = self.get_connection()
        cur = con.cursor()
        cur.execute(
            """
                SELECT *
                FROM u_sensor
                WHERE id IN (
                    SELECT MAX(id)
                    FROM u_sensor
                    GROUP BY sensor_count
                );            
            """
        )
        rows = cur.fetchall()        
        con.close()
        return rows

