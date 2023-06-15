document.addEventListener('DOMContentLoaded', function () {
  var map = L.map('map').setView([17.385044, 78.486671], 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(map)

  fetch('dataset.txt')
    .then((response) => response.text())
    .then((data) => {
      var dataset = data.trim().split('\n')

      var regions = []

      dataset.forEach(function (coord) {
        var parts = coord.split(',')
        var latitude = parseFloat(parts[0])
        var longitude = parseFloat(parts[1])
        var airIndex = parseFloat(parts[2])

        var textBoxClass
        if (airIndex >= 0 && airIndex <= 80) {
          textBoxClass = 'custom-text-box'
        } else if (airIndex > 80 && airIndex <= 93) {
          textBoxClass = 'custom-yellow-text-box'
        } else {
          textBoxClass = 'custom-red-text-box'
        }

        var textBox = L.divIcon({
          className: textBoxClass,
          html: '<div class="air-index-text">' + airIndex + '</div>',
          iconSize: [60, 60],
        })

        var marker = L.marker([latitude, longitude], { icon: textBox }).addTo(
          map,
        )
        //-------------------------------------------------------------------------------------
        var mylocation = "";
        var geocodingUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&key=AIzaSyBTPMPmJOvV-HxCvOwlSpxz_lMFPugWtPw';        fetch(geocodingUrl)
          .then((response) => response.json())
          .then((data) => {
            if (data.status === 'OK') {
              var results = data.results;
              if (results.length > 0) {
                var locationName = results[0].formatted_address;
                var addressParts = locationName.split(',');
               var size=addressParts.length
                var secondToken = addressParts[size-4].trim();
                marker.bindPopup("Location: " + secondToken + "<br>Air Index: " + airIndex);
                // console.log('Location: ' + locationName);
                mylocation = secondToken;
                // Use the location name as needed
              }
            } else {
              console.log('Geocoding request failed. Status: ' + data.status);
            }
          })
          .catch((error) => {
            console.log('Error fetching geocoding data:', error);
          });
          //------------------------------------------------------------------------
        // marker.bindPopup(
        //   'City: ' + parts[9] + '<br>Average Air Index: ' + airIndex,
        // )

        marker.on('click', function () {
          map.setView(marker.getLatLng(), 12) // Zoom in to level 14 when marker is clicked
          var pollutantData = {
            labels: [
              'PM2.5 (µg/m³)',
              'PM10 (µg/m³)',
              'SO2 (µg/m³)',
              'O3 (µg/m³)',
              'CO (µg/m³)',
              'NO2 (µg/m³)',
              'City',
            ],
            datasets: [
              {
                data: [
                  parseFloat(parts[3]),
                  parseFloat(parts[4]),
                  parseFloat(parts[5]),
                  parseFloat(parts[6]),
                  parseFloat(parts[7]),
                  parseFloat(parts[8]),
                  parseFloat(parts[9]),
                ],
                backgroundColor: [
                  'rgba(255, 0, 0, 0.8)',
                  'rgba(54, 0, 255, 0.8)',
                  'rgba(255, 0, 255, 0.8)',
                  'rgba(99, 255, 0, 0.8)',
                  'rgba(10, 100, 100, 0.8)',
                  'rgba(255, 255, 255, 0.8)',
                  'rgba(255, 0, 0, 0.5)'
                ],
                borderColor: [
                  'rgba(255, 0, 0, 0.8)',
                  'rgba(54, 0, 255, 0.8)',
                  'rgba(255, 0, 255, 0.8)',
                  'rgba(99, 255, 0, 0.8)',
                  'rgba(10, 100, 100, 0.8)',
                  'rgba(255, 255, 255, 0.8)',
                  'rgba(255, 0, 0, 0.5)'
                ],
                borderWidth: 0,
              },
            ],
          }

          var chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
              position: 'right',
            },
          }

          var chartContainer = document.getElementById('pollutant-chart')

          if (chartContainer) {
            chartContainer.remove()
          }

          var newChartContainer = document.createElement('canvas')
          newChartContainer.id = 'pollutant-chart'
          newChartContainer.width = 200
          newChartContainer.height = 200
          newChartContainer.style.width = '400px'
          newChartContainer.style.height = '400px'
          document
            .getElementById('popout-container')
            .appendChild(newChartContainer)

          var chartContext = newChartContainer.getContext('2d')
          var pollutantChart = new Chart(chartContext, {
            type: 'pie',
            data: pollutantData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                position: 'right',
              },
              plugins: {
                chartjsPluginChartjs3d: {
                  enabled: true,
                  alphaAngle: 60,
                  betaAngle: 30,
                },
              },
            },
          })
// ----------------------------------------------------------------------------------------------


        // -------------------------------------------------------------------------------
          document.getElementById('popout-container').style.display = 'block'
          if(mylocation == ''){
            document.querySelector('#region-name').innerHTML = "Region";
          }
          else{
            document.querySelector('#region-name').innerHTML = mylocation;

          }
          document.querySelector('#region-name').style.color = "#00FF00";
          var myloc = '';
          if(mylocation == ""){
            myloc = 'Region';
          }
          else{
            myloc = mylocation;
          }
          var pollutantLevels = `
          <h3 style="position: relative; left: 360px;color: black">Pollutant Levels for ${myloc}</h3>
          <div class="chart-container" style="margin-left: 50px">
            <div class="chart-item">
              <p>PM2.5 Levels: ${calculateFirstElement(parts[3])}</p>
              <svg class="circle-chart" id="pm25-chart">
                <circle class="circle-chart-background" r="30" cx="50" cy="50"></circle>
                <circle class="circle-chart-circle" r="30" cx="50" cy="50"></circle>
              </svg>
            </div>
            <div class="chart-item">
              <p>PM10 Levels: ${calculateFirstElement(parts[4])}</p>
              <svg class="circle-chart" id="pm10-chart">
                <circle class="circle-chart-background" r="30" cx="50" cy="50"></circle>
                <circle class="circle-chart-circle" r="30" cx="50" cy="50"></circle>
              </svg>
            </div>
            <div class="chart-item">
              <p>SO2 Levels: ${calculateFirstElement(parts[5])}</p>
              <svg class="circle-chart" id="so2-chart">
                <circle class="circle-chart-background" r="30" cx="50" cy="50"></circle>
                <circle class="circle-chart-circle" r="30" cx="50" cy="50"></circle>
              </svg>
            </div>
            <div class="chart-item">
              <p>O3 Levels: ${calculateFirstElement(parts[6])}</p>
              <svg class="circle-chart" id="o3-chart">
                <circle class="circle-chart-background" r="30" cx="50" cy="50"></circle>
                <circle class="circle-chart-circle" r="30" cx="50" cy="50"></circle>
              </svg>
            </div>
            <div class="chart-item">
              <p>CO Levels: ${calculateFirstElement(parts[7])}</p>
              <svg class="circle-chart" id="co-chart">
                <circle class="circle-chart-background" r="30" cx="50" cy="50"></circle>
                <circle class="circle-chart-circle" r="30" cx="50" cy="50"></circle>
              </svg>
            </div>
            <div class="chart-item">
              <p>NO2 Levels: ${calculateFirstElement(parts[8])}</p>
              <svg class="circle-chart" id="no2-chart">
                <circle class="circle-chart-background" r="30" cx="50" cy="50"></circle>
                <circle class="circle-chart-circle" r="30" cx="50" cy="50"></circle>
              </svg>
            </div>
          </div>
        `

          document.getElementById(
            'pollutant-levels2',
          ).innerHTML = pollutantLevels
          document.getElementById('popout-container2').style.display = 'block'

          animateCircularGraph('pm25-chart', calculateFirstElement(parts[3]))
          animateCircularGraph('pm10-chart', calculateFirstElement(parts[4]))
          animateCircularGraph('so2-chart', calculateFirstElement(parts[5]))
          animateCircularGraph('o3-chart', calculateFirstElement(parts[6]))
          animateCircularGraph('co-chart', calculateFirstElement(parts[7]))
          animateCircularGraph('no2-chart', calculateFirstElement(parts[8]))

          // Call the animateCircularGraph function
        })

        regions.push({
          marker: marker,
          airIndex: airIndex,
          no2Levels: [parseFloat(parts[8])],
        })
      })

      regions.forEach(function (region) {
        if (region.airIndex.length > 0) {
          var number = calculateAverage(region.airIndex)
          var textBoxClass

          if (number >= 0 && number <= 80) {
            textBoxClass = 'custom-text-box'
          } else if (number >= 80 && number <= 93) {
            textBoxClass = 'custom-yellow-text-box'
          } else {
            textBoxClass = 'custom-red-text-box'
          }

          var textBox = L.divIcon({
            className: textBoxClass,
            html: '<div class="air-index-text">' + number + '</div>',
            iconSize: [60, 60],
          })

          region.marker.setIcon(textBox)
        }
      })
      var hyderabadLink = document.getElementById('hyderabad-link')
      hyderabadLink.addEventListener('click', function () {
        map.setView([17.385044, 78.486671], 11) // Set the view to Hyderabad when clicked
      })
      var mumbaiLink = document.getElementById('mumbai-link')
      mumbaiLink.addEventListener('click', function () {
        map.setView([19.076, 72.8777], 11) // Set the view to Mumbai when clicked
      })
      var ahmedabadLink = document.getElementById('ahmedabad-link')
      ahmedabadLink.addEventListener('click', function () {
        map.setView([23.0225, 72.5714], 11) // Set the view to Ahmedabad when clicked
      })

      var delhiLink = document.getElementById('delhi-link')
      delhiLink.addEventListener('click', function () {
        map.setView([28.6139, 77.209], 10) // Set the view to Delhi when clicked
      })
    })

  // Function to animate circular graph using anime.js
  function animateCircularGraph(chartId, level) {
    var chart = document.getElementById(chartId)
    var radius = 30 // Adjust the radius size as desired
    var circumference = 2 * Math.PI * radius
    var percentage = (level / 100) * circumference

    chart.innerHTML = `
      <svg class="circle-chart" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle class="circle-chart__background" stroke="#eee" stroke-width="8" fill="none" cx="50" cy="50" r="${radius}"></circle>
        <circle class="circle-chart__circle" stroke-width="8" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" transform="rotate(-90 50 50)" fill="none" cx="50" cy="50" r="${radius}" style="stroke: ${getColor(
      level,
      chartId,
    )};"></circle>
        <text class="circle-chart__percentage" x="50" y="50" alignment-baseline="central" text-anchor="middle" font-size="20px" font-weight="bold">${level}</text>
      </svg>
    `
    var circle = chart.querySelector('.circle-chart__circle')

    anime({
      targets: circle,
      strokeDashoffset: {
        value: circumference - percentage,
        duration: 2000,
        easing: 'easeInOutCirc',
      },
    })
  }

  // Function to calculate the average of an array
  function calculateAverage(arr) {
    var sum = arr.reduce(function (a, b) {
      return a + b
    }, 0)
    return (sum / arr.length).toFixed(2)
  }

  // Function to get color based on level
  function getColor(level, pollutant) {
    switch (pollutant) {
      case 'pm25-chart':
        if (level <= 12) return 'green'
        if (level <= 35.4) return 'yellow'
        return 'red'
      case 'pm10-chart':
        if (level <= 54) return 'green'
        if (level <= 154) return 'yellow'
        return 'red'
      case 'so2-chart':
        if (level <= 35) return 'green'
        if (level <= 75) return 'yellow'
        return 'red'
      case 'o3-chart':
        if (level <= 54) return 'green'
        if (level <= 70) return 'yellow'
        return 'red'
      case 'co-chart':
        if (level <= 4.4) return 'green'
        if (level <= 9.4) return 'yellow'
        return 'red'
      case 'no2-chart':
        if (level <= 53) return 'green'
        if (level <= 100) return 'yellow'
        return 'red'
      default:
        return 'black'
    }
  }

  // Function to get the first element from a string of comma-separated values
  function calculateFirstElement(data) {
    return parseFloat(data.split(',')[0])
  }
})
