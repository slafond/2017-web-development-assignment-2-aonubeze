const turku_lat_long = {latitude: 60.45, longitude: 22.2833};
function drawMap(data) {
    return new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: new google.maps.LatLng(data.latitude,data.longitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
}

$(document).ready(function(){
    $.getJSON("http://data.foli.fi/gtfs/routes", function(res){
        var busLines = res.map(function(route){
            return {route_id: route.route_id, route_name: route.route_long_name};
        });
        $.each(busLines, function(i, route){
            $("#bus-line-sel").append("<option " + "value=" + "'" + route.route_id + "'" + ">" + route.route_name + "</option>");
        });
    });
    drawMap(turku_lat_long);
    $("#show-route").click(function(){
        var route_id = Number($("#bus-line-sel").val().trim());
        if(route_id){
            showRoute(route_id);
        }
    });
    $("#show-buses").click(function(){
        var route_id = Number($("#bus-line-sel").val().trim());
        if(route_id){
            showBusesLocation(route_id);
        }
    });
});

function showBusesLocation(route_id){
    $.getJSON("http://data.foli.fi/siri/vm/pretty", function(vm){
        if(vm.status !== "OK"){
            alert("Data not ready, try again");
        }
        var vehicles = vm.result.vehicles;
        var vehicleIds = Object.keys(vehicles);
        var vehiclesInRoute = vehicleIds.filter(function(v_id){
            console.log(vehicles[v_id].publishedlinename);
            console.log("route_id: " + route_id);
            return vehicles[v_id].publishedlinename === route_id;
        });
        console.log(vehiclesInRoute);
    })
}

function showRoute(route_id){
    $.getJSON("http://data.foli.fi/gtfs/v0/20171130-162538/trips/route/"+route_id, function(trips){
        var index = Math.floor((Math.random() * trips.length) + 1);
        var shape_id = trips[index].shape_id;
        $.getJSON("http://data.foli.fi/gtfs/v0/20171130-162538/shapes/"+shape_id, function(shape){
            var pathCoordinates = shape.map(function(line){
                return {lat: line.lat, lng: line.lon};
            });
            var map = drawMap(turku_lat_long);
            var busPath = new google.maps.Polyline({
                path: pathCoordinates,
                geodesic: true,
                strokeColor: '#000FF',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            busPath.setMap(map);
        });
    });
}
