function initMap() {
    var uluru = {
      lat: -25.363,
      lng: 131.044,
    };
    var grayStyles = [
      {
        featureType: "all",
        stylers: [
          {
            saturation: -90,
          },
          {
            lightness: 50,
          },
        ],
      },
      {
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#ccdee9",
          },
        ],
      },
    ];
    var map = new google.maps.Map(document.getElementById("map"), {
      center: {
        lat: -31.197,
        lng: 150.744,
      },
      zoom: 9,
      styles: grayStyles,
      scrollwheel: false,
    });
  }