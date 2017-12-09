var hist = getStoredHistory();
const countries = {
    FI: "Finland", FR: "France", DE: "Germany", IS: "Iceland", IT: "Italy", NO: "Norway", SE: "Sweden"
};

$(document).ready(function(){
    updateHistory(null);
    $("#search").click(function(){
        var zip = $("#zip-input").val().trim();
        var country = $("#country-select").val().trim();
        if(!zip || !country)
            return;
        $.getJSON("http://api.zippopotam.us/" + country + "/" + zip, function(res){
            displayPlaces(res.places);
            updateHistory({"code": country, "country": countries[country], "zip": zip});
            setMap(res.places);
        });
    });

    $(document).click(function(event){
        var d = $(event.target)[0].innerHTML.split(" ");
        if(d.length === 3){
            var country = d[0].trim();
            var zip = d[2].trim();
            var c = Object.keys(countries);
            if(c.includes(country) && zip){
                $.getJSON("http://api.zippopotam.us/" + country + "/" + zip, function(res){
                    displayPlaces(res.places);
                    setMap(res.places);
                });
            }
        }
    })
});

function updateHistory (data) {
    if(data){
        if(hist.length === 10){
            hist.shift();
        }
        hist.push(data);
        storeHistory(hist);
    }
    var t = $("#history-table");
    for (var i = 0; i < hist.length; i++) {
        t[0].children[1].children[i].innerHTML = hist[i].code + " " + hist[i].country + ": " + hist[i].zip;
    }
}

function displayPlaces(data){
    $('#places').empty();
    var len = data.length;
    var html = "<table><thead><tr><th>Place name</th><th>Longitude</th><th>Latitude</th></tr></thead><tbody>";
    for (var i = 0; i < len; ++i) {
        html += "<tr>";
        html += ("<td>" + data[i]["place name"] + "</td>");
        html += ("<td>" + data[i].longitude + "</td>");
        html += ("<td>" + data[i].latitude + "</td>");
        html += "</tr>";
    }
    html += '</tbody></table>';

    $(html).appendTo('#places');
}

function setMap(data) {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: new google.maps.LatLng(data[0].latitude,data[0].longitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    var infoWindow = new google.maps.InfoWindow();
    var marker, i;
    for (i = 0; i < data.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(data[i].latitude,data[i].longitude),
            map: map
        });

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infoWindow.setContent(data[i]["place name"]);
                infoWindow.open(map, marker);
            }
        })(marker, i));
    }
}

function getStoredHistory(){
    if(typeof(Storage) !== "undefined"){
        return JSON.parse(localStorage.getItem("searchHistory")) || [];
    }else{
        return []
    }
}

function storeHistory(history){
    if(typeof(Storage) !== "undefined"){
        localStorage.setItem("searchHistory", JSON.stringify(history));
    }
}
