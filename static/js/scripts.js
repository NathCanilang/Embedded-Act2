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
      })
      .catch((error) => console.log(`Error fetching data: ${error}`));
  }

  const canvas = document.getElementById("ultrasonic-chart").getContext("2d");
  const sensorScatterChart = new Chart(canvas, {
    type: "scatter",
    data: {
      labels: [],
      datasets: [
        {
          label: "Distance (cm)",
          data: [],
          backgroundColor: "rgb(255, 99, 132)",
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
      },
    },
  });

  setInterval(displayCurrentTime, 1000);
  setInterval(displayDistance, 2000); //sinabi ito sa libro
});
