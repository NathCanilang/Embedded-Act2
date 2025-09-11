document.addEventListener("DOMContentLoaded", function () {
  const timeText = document.getElementById("time-text");
  const distanceText1 = document.getElementById("sensor1-distance");
  const distanceText2 = document.getElementById("sensor2-distance");
  const notif_bell = document.getElementById("buzzer-icon");

  const temp_canvas = document.getElementById("temp_chart").getContext("2d");
  const humidity_canvas = document
    .getElementById("humidity_chart")
    .getContext("2d");

  const sensor_canvas = document
    .getElementById("sensor_chart1")
    .getContext("2d");

  // Create one combined chart with 2 datasets
  const chart = new SensorChart(sensor_canvas);
  const tempChart = new TemperatureChart(temp_canvas);
  const humidityChart = new HumidityChart(humidity_canvas);

  function displayCurrentTime() {
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString();
    timeText.textContent = formattedTime;
  }

  function displayDistance() {
    fetch("/get_distance")
      .then((response) => response.json())
      .then((data) => {
        distanceText1.textContent = `Sensor 1 Distance Reading = ${data.distance1} cm`;
        distanceText2.textContent = `Sensor 2 Distance Reading = ${data.distance2} cm`;

        if (data.distance1 > 100 || data.distance2 > 100) {
          notif_bell.classList.add("shake");
        } else {
          notif_bell.classList.remove("shake");
        }

        displayChartData();
        displayDistanceToOLED(data.distance1, data.distance2);
      })
      .catch((error) => console.log(`Error fetching data: ${error}`));
  }

  function displayTempAndHumidity() {
    fetch("/get_tempandhumid")
      .then((response) => response.json())
      .then((data) => {
        // Update text elements
        document.getElementById(
          "temperature-text"
        ).textContent = `Temperature = ${data.temperature} °C`;
        document.getElementById(
          "humidity-text"
        ).textContent = `Humidity = ${data.humidity} %`;

        // Add data to charts
        const now = new Date().toLocaleTimeString();
        tempChart.addData(now, data.temperature);
        humidityChart.addData(now, data.humidity);
      })
      .catch((error) =>
        console.error(`Error fetching temp/humidity: ${error}`)
      );
  }

  function displayChartData() {
    fetch("/get_data_from_db")
      .then((response) => response.json())
      .then((data) => {
        if (!data) return;

        const sensor1 = data.find((row) => row.sensor_count === 1);
        const sensor2 = data.find((row) => row.sensor_count === 2);

        if (sensor1 && sensor2) {
          chart.addData(sensor1.timestamp, sensor1.distance, sensor2.distance);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  function displayDistanceToOLED(distance1, distance2) {
    fetch("/display_sensor_values_oled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ distance1, distance2 }),
    });
  }

  function displayTempAndHumidity() {
    fetch("/get_tempandhumid")
      .then((response) => response.json())
      .then((data) => {
        // ✅ Update text elements
        document.getElementById(
          "temperature-text"
        ).textContent = `Temperature = ${data.temperature} °C`;
        document.getElementById(
          "humidity-text"
        ).textContent = `Humidity = ${data.humidity} %`;

        // ✅ Add data to charts
        const now = new Date().toLocaleTimeString();
        tempChart.addData(now, data.temperature);
        humidityChart.addData(now, data.humidity);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  setInterval(displayCurrentTime, 1000);
  setInterval(displayDistance, 2000);
  setInterval(displayTempAndHumidity, 3000);
});

class SensorChart {
  constructor(canvas) {
    this.sensorLineChart = new Chart(canvas, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Sensor 1 Readings",
            data: [],
            borderColor: "red",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
            tension: 0.1,
          },
          {
            label: "Sensor 2 Readings",
            data: [],
            borderColor: "blue",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: false,
        scales: {
          x: { title: { display: true, text: "Date and Time" } },
          y: {
            min: 0,
            max: 800,
            title: { display: true, text: "Distance (cm)" },
          },
        },
      },
    });
  }

  addData(label, value1, value2) {
    this.sensorLineChart.data.labels.push(label);
    this.sensorLineChart.data.datasets[0].data.push(value1);
    this.sensorLineChart.data.datasets[1].data.push(value2);

    if (this.sensorLineChart.data.labels.length > 8) {
      this.sensorLineChart.data.labels.shift();
      this.sensorLineChart.data.datasets[0].data.shift();
      this.sensorLineChart.data.datasets[1].data.shift();
    }

    this.sensorLineChart.update();
  }
}

class TemperatureChart {
  constructor(canvas) {
    this.chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Temperature (°C)",
            data: [],
            borderColor: "orange",
            backgroundColor: "rgba(255, 165, 0, 0.2)",
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: false,
        scales: {
          x: { title: { display: true, text: "Date and Time" } },
          y: {
            min: 0,
            max: 50,
            title: { display: true, text: "Temperature (°C)" },
          },
        },
      },
    });
  }

  addData(label, value) {
    this.chart.data.labels.push(label);
    this.chart.data.datasets[0].data.push(value);

    if (this.chart.data.labels.length > 8) {
      this.chart.data.labels.shift();
      this.chart.data.datasets[0].data.shift();
    }

    this.chart.update();
  }
}

class HumidityChart {
  constructor(canvas) {
    this.chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Humidity (%)",
            data: [],
            borderColor: "green",
            backgroundColor: "rgba(0, 255, 0, 0.2)",
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: false,
        scales: {
          x: { title: { display: true, text: "Date and Time" } },
          y: {
            startatzero: true,
            max: 90,
            title: { display: true, text: "Humidity (%)" },
          },
        },
      },
    });
  }

  addData(label, value) {
    this.chart.data.labels.push(label);
    this.chart.data.datasets[0].data.push(value);

    if (this.chart.data.labels.length > 8) {
      this.chart.data.labels.shift();
      this.chart.data.datasets[0].data.shift();
    }

    this.chart.update();
  }
}
