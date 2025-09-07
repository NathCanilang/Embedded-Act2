document.addEventListener("DOMContentLoaded", function () {
  const timeText = document.getElementById("time-text");
  const distanceText = document.getElementById("sensor-distance");
  const sensor_canvas1 = document
    .getElementById("sensor_chart1")
    .getContext("2d");
  const sensor_canvas2 = document
    .getElementById("sensor_chart2")
    .getContext("2d");

  const chart1 = new SensorChart(
    sensor_canvas1,
    "red",
    "Sensor 1 Distance (cm)"
  );
  const chart2 = new SensorChart(
    sensor_canvas2,
    "blue",
    "Sensor 2 Distance (cm)"
  );

  function displayCurrentTime() {
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString();
    timeText.textContent = formattedTime;
  }

  function displayDistance() {
    fetch("/get_distance")
      .then((response) => response.json())
      .then((data) => {
        distanceText.textContent = `Distance = ${data.distance1} cm`;
        displayChartData();
      })
      .catch((error) => console.log(`Error fetching data: ${error}`));
  }

  function displayChartData() {
    fetch("/get_data_from_db")
      .then((response) => response.json())
      .then((data) => {
        if (!data) return;

        const sensor1 = data.find((row) => row.sensor_count === 1);
        const sensor2 = data.find((row) => row.sensor_count === 2);

        if (!sensor1) {
          console.log("No data in sensor1");
        } else {
          const s1_distance = sensor1.distance;
          const s1_timestamp = sensor1.timestamp;

          const s2_distance = sensor2.distance;
          const s2_timestamp = sensor2.timestamp;

          chart1.addData(s1_timestamp, s1_distance);
          chart2.addData(s2_timestamp, s2_distance);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  setInterval(displayCurrentTime, 1000);
  setInterval(displayDistance, 2000); //sinabi ito sa libro
});

class SensorChart {
  constructor(canvas, color, sensorLabel) {
    this.canvas = canvas;
    this.color = color;
    this.sensorLabel = sensorLabel;

    this.sensorLineChart = new Chart(this.canvas, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: this.sensorLabel,
            data: [],
            borderColor: this.color,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Date and Time",
            },
          },
          y: {
            type: "linear",
            min: 12,
            max: 800,
            title: {
              display: true,
              text: "Distance (cm)",
            },
          },
        },
      },
    });
  }
  addData(label, value) {
    this.sensorLineChart.data.labels.push(label);
    this.sensorLineChart.data.datasets[0].data.push(value);
    if (this.sensorLineChart.data.labels.length > 8) {
      this.sensorLineChart.data.labels.shift();
      this.sensorLineChart.data.datasets[0].data.shift();
    }
    this.sensorLineChart.update();
  }
}
