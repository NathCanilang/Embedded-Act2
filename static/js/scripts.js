document.addEventListener("DOMContentLoaded", function () {
  const timeText = document.getElementById("time-text");
  function displayCurrentTime() {
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString();
    timeText.textContent = formattedTime;
  }

  setInterval(displayCurrentTime, 1000);
});
