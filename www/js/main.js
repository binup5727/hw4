'use strict';

document.addEventListener("DOMContentLoaded", function () {

    //Add event listeners for buttons
    document.getElementById("gobutton").onclick = onGoButtonClick;
    document.getElementById("locbutton").onclick = onLocationClick;
    $('#textbox').keypress(function (e) {
        if (e.which == 13) {
            onGoButtonClick();
        }
    });
});

//Weather API KEY
const WEATHER_API_KEY = "fe009205a0853e0137148bfffee0bcb9"

//reads input from input box, called when the go button is pushed.
function onGoButtonClick() {
    //from results screen
    if ($('#gobutton').text() === "Search Again") {

        resetWeatherContent();
        resetMapContent();
        screenchg();
        $('#gobutton').text('Search');


    } else {
        //find the element
        var val = document.getElementById("textbox").value
        if (val === "") { //Check for empty string, if empty provide error message
            var e = document.createElement('p');
            e.innerHTML = "Can't search for empty string";
            resetMapContent();
            addMapContent(e);
            return;

        }
        if (isNaN(val)) { //If value is not a number, call weather API by CITY
            console.log("CITY Detected");
            var url = "https://api.openweathermap.org/data/2.5/weather?q=" + val + "&appid=" + WEATHER_API_KEY;
            xmlRequest(url, onWeatherSuccess, onWeatherFail);

        }
        else { //ELSE CALL BY ZIP CODE
            console.log("ZIP Detected");
            var url = "https://api.openweathermap.org/data/2.5/weather?zip=" + val + "&appid=" + WEATHER_API_KEY;
            xmlRequest(url, onWeatherSuccess, onWeatherFail);
        }
    }

}

//Some helpers to aid in repeated tasks
function resetMapContent() {
    var r = document.getElementById("map");
    r.innerHTML = "";
}

function addMapContent(element) {
    var r = document.getElementById("map");
    r.appendChild(element);

}

function addWeatherContent(header, info) {
    const th = $("<th></th>").text(header);
    const td = $("<td></td>").text(info);
    const tr = $("<tr></tr>").append(th, td);
    //console.log(tr.html());
    $("#weather-data").append(tr);

    //var r = document.getElementById("weather");
    //r.appendChild(element);
}



function resetWeatherContent() {
    $("#weather-data").remove();

    //var r = document.getElementById("weather");
    //r.innerHTML = "";
}

function screenchg() {
    $('#textbox, #locbutton').toggle();

    $('#head').remove();

    $('#gobutton').text('Search Again');



}

//This function is called when the location button is pushed.
function onLocationClick() {
    navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError, {
        enableHighAccuracy: true,
        timeout: 30000
    }


    );
}


function xmlRequest(url, onSuccess, onFailure) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            onSuccess(JSON.parse(this.responseText));
        }
        else if (this.readyState == 4) {
            onFailure(this.status);
        }
    };

    request.open("GET", url, true);
    request.send();



}

function onWeatherSuccess(data) {
    onWeatherSuccessNoMap(data);

    resetMapContent();
    var mapp = new Gmap(data.coord.lat, data.coord.lon, 12, 300, 300);
    addMapContent(mapp);
}

function onWeatherSuccessNoMap(data) {
    resetWeatherContent();
    screenchg();

    const table = "<table></table>";
    $("#weather").append(table);

    const tableEle = $("#weather table");
    tableEle.attr('id', "weather-data");
    tableEle.addClass("table table-striped table-bordered");

    var celsius = (data.main.temp) - 273.15;
    celsius = celsius.toFixed(2);

    var sunrise = new Date(data.sys.sunrise * 1000);
    var sunset = new Date(data.sys.sunset * 1000);

    var sunsetHR = sunset.getHours();

    if (sunsetHR > 12) {
        sunsetHR = sunsetHR - 12;

        console.log(sunsetHR);
    }


    console.log(sunrise.getHours() + ":" + sunrise.getMinutes());

    //var line1 = "Weather for " + data.name;
    //var line2 = "Temperature " + data.main.temp + "K";
    //var ele1 = document.createElement('p');
    //var ele2 = document.createElement('p');
    //ele1.innerHTML = line1;
    //ele2.innerHTML = line2;


    var head = $('<div></div>');
    head.attr('id', 'head');
    head.html(`<h2>Weather for ${data.name}, ${data.sys.country}</h2>`);
    console.log(head.html());

    var img = $('<img id="icon" src=""  alt="Weather icon">');
    var iconCode = data.weather[0].icon
    var icon = 'https://openweathermap.org/img/w/' + iconCode + '.png';

    img.attr('src', icon);


    head.append(celsius + "C", img, data.weather[0].description);

    $('#logo').append(head);

    console.log(head.html());




    addWeatherContent("Temperature ", celsius + "C");


    addWeatherContent("Pressure ", data.main.pressure);

    addWeatherContent("Humidity ", data.main.humidity + "%");

    addWeatherContent("Wind ", data.wind.speed + " mph");

    addWeatherContent("Sunrise ", sunrise.getHours() + ":" + sunrise.getMinutes() + "AM");

    addWeatherContent("Sunset ", sunsetHR + ":" + sunset.getMinutes() + "PM");

}

function onWeatherFail(status) {
    alert("Failed to get weather on Code " + toString(status));
}


//Getting location was successful, make a new Gmap element and add it to the content after resetting the content.
function onLocationSuccess(p) {
    resetMapContent();
    addMapContent(new Gmap(p.coords.latitude, p.coords.longitude, 14, 300, 300));
    var url = "https://api.openweathermap.org/data/2.5/weather?lat=" + p.coords.latitude.toString() +
        "&lon=" + p.coords.longitude.toString() + "&appid=" + WEATHER_API_KEY;
    xmlRequest(url, onWeatherSuccessNoMap, onWeatherFail);

};

function onLocationError(e) {
    alert("Error getting location");
}


