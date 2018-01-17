const turku_lat_long = {latitude: 60.45, longitude: 22.2833};
var map;
var oldBusPath;
var oldMarkers = [];
function drawMap(data) {
    return new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: new google.maps.LatLng(data.latitude,data.longitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
}

$(document).ready(function(){
    var busLines;
    getJSON("https://cors-anywhere.herokuapp.com/https://data.foli.fi/gtfs/routes")
        .then(function(res){
            busLines = res.map(function(route){
                return {route_id: route.route_id, route_name: route.route_long_name, route_ref: route.route_short_name};
            });
            $.each(busLines, function(i, route){
                $("#bus-line-sel").append("<option " + "value=" + "'" + route.route_id + "'" + ">" + route.route_ref + ": " + route.route_name + "</option>");
            });
        }, function(err){
            alert(err.statusText);
        });
    map = drawMap(turku_lat_long);
    $("#show-route").click(function(){
        var route_id = Number($("#bus-line-sel").val().trim());
        if(route_id){
            showRoute(route_id);
        }
    });
    $("#show-buses").click(function(){
        var route = $("#bus-line-sel option:selected").text().split(":")[0].trim();
        if(route){
            showBusesLocation(route);
        }
    });
    $("#refresh").click(function(){
        var route = $("#bus-line-sel option:selected").text().split(":")[0].trim();
        if(route){
            showBusesLocation(route);
        }
    });
});

function showBusesLocation(route_id){
    getJSON("https://cors-anywhere.herokuapp.com/https://data.foli.fi/siri/vm/pretty")
        .then(function(vm){
            var vehicles = vm.result.vehicles;
            var vehicleIds = Object.keys(vehicles);
            var vehiclesInRoute = vehicleIds.filter(function(v_id){
                return vehicles[v_id].publishedlinename === route_id;
            });
            oldMarkers.forEach(function(m){
                m.setMap(null);
            });
            oldMakers = [];
            vehiclesInRoute.forEach(function(v){
                var bus = vehicles[v];
                var myLatlng = new google.maps.LatLng(bus.latitude,bus.longitude);
                var marker = new google.maps.Marker({
                    position: myLatlng,
                    title: v
                });
                marker.setMap(map);
                oldMarkers.push(marker);
            });
        },
        function(err){
            alert(err.statusText);
        });
}


function showRoute(route_id){
    getJSON("https://cors-anywhere.herokuapp.com/https://data.foli.fi/gtfs/v0/20180117-130104/trips/route/"+route_id)
        .then(function(data){
            var index = Math.floor((Math.random() * data.length) + 1);
            return data[index].shape_id;
        })
        .then(function(shape_id){
            getJSON("https://cors-anywhere.herokuapp.com/https://data.foli.fi/gtfs/v0/220180117-130104/shapes/"+shape_id)
                .then(function(shape){
                    var pathCoordinates = shape.map(function(line){
                        return {lat: line.lat, lng: line.lon};
                    });
                    busPath = new google.maps.Polyline({
                        path: pathCoordinates,
                        geodesic: true,
                        strokeColor: '#000FF',
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });
                    if(oldBusPath){
                        oldBusPath.setMap(null);
                    }
                    busPath.setMap(map);
                    oldBusPath = busPath;
                })
        });
}

function getJSON(url){
    return new Promise(function(resolve, reject){
        $.getJSON(url)
            .done(function(data){
                resolve(data);
            })
            .fail(function(err){
                reject(err);
            });
    });
}
