var hist = getStoredHistory();
const maxHistorySize = 10;
const countries = [
    {code: "FI", name: "Finland"},
    {code: "FR", name: "France"},
    {code: "DE", name: "Germany"},
    {code: "IS", name: "Iceland"},
    {code: "IT", name: "Italy"},
    {code: "NO", name: "Norway"},
    {code: "SE", name: "Sweden"}
];

$(document).ready(function(){
    for (var i = 0; i < maxHistorySize; i++) {
        $("#history-table").append(
            "<tr><td>" + "</td></tr>"
        );
    }
    $.each(countries, function(i, country){
        $("#country-select").append("<option " + "value=" + "'" + country.code + "'" + ">" + country.name + "</option>");
    });
    updateHistory(null);
    $("#search").click(function(){
        var sel = $("#country-select");
        var zip = $("#zip-input").val().trim();
        var name = $("#country-select option:selected").text().trim();
        var code = sel.val().trim();
        if(!zip || !code)
            return;
        $.getJSON("https://api.zippopotam.us/" + code + "/" + zip, function(res){
            displayPlaces(res.places);
            updateHistory({"code": code, "name": name, "zip": zip});
            setMap(res.places);
        });
    });

    $(document).click(function(event){
        var d = $(event.target)[0].innerHTML.split(" ");
        if(d.length === 3){
            var name = d[1].trim();
            var country = {code: d[0].trim(), name: name.substring(0, name.length-1)};
            var zip = d[2].trim();
            var valid = countries.find(function(c){
                return c.code === country.code && c.name === country.name;
            });
            if(valid && zip){
                $.getJSON("https://api.zippopotam.us/" + country.code + "/" + zip, function(res){
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
        t[0].children[i+1].children[0].innerHTML = hist[i].code + " " + hist[i].name + ": " + hist[i].zip;
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
