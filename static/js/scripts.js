document.addEventListener("DOMContentLoaded", function () {
  const timeText = document.getElementById("time-text");
  const distanceText = document.getElementById("sensor-distance");

  function displayCurrentTime() {
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString();
    timeText.textContent = formattedTime;
  }

  function displayDistance() {
    fetch("/get_distance")
      .then((response) => response.json())
      .then((data) => {
        distanceText.textContent = `Distance = ${data.distance} cm`;
        displayChartData();
      })
      .catch((error) => console.log(`Error fetching data: ${error}`));
  }

  const canvas = document.getElementById("ultrasonic-chart").getContext("2d");
  const sensorLineChart = new Chart(canvas, {
    type: "line",
    labels: [],
    data: {
      datasets: [
        {
          label: "Sensor 1 Distance (cm)",
          data: [],
          borderColor: "blue",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: false,
          tension: 0.1,
          yAxisID: "yLeft",
        },
        {
          label: "Sensor 2 Distance (cm)",
          data: [],
          borderColor: "red",
          fill: false,
          tension: 0.1,
          yAxisID: "yRight",
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
        yLeft: {
          type: "linear",
          min: 12,
          max: 800,
          title: {
            display: true,
            text: "Distance (cm)",
          },
          beginAtZero: true,
        },

        yRight: {
          type: "linear",
          position: "right",
          min: 12,
          max: 800,
          title: {
            display: true,
            text: "Distance (cm)",
          },
          beginAtZero: true,
        },
      },
    },
  });

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

          sensorLineChart.data.datasets[0].data.push({
            x: s1_timestamp,
            y: s1_distance,
          });

          sensorLineChart.data.datasets[1].data.push({
            x: s2_timestamp,
            y: s2_distance,
          });

          if (sensorLineChart.data.labels.length > 8) {
            sensorLineChart.data.datasets[0].data.shift();
            sensorLineChart.data.datasets[1].data.shift();
          }

          sensorLineChart.update();
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  setInterval(displayCurrentTime, 1000);
  setInterval(displayDistance, 2000); //sinabi ito sa libro
});
