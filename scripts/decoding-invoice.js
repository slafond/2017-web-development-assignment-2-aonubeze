function getVersion(virtualCode){
    return Number(virtualCode.trim().charAt(0));
}

function version5Decode(virtualCode){
    var iban = "FI".concat(virtualCode.substr(1, 16));
    var amnt = Number(virtualCode.substr(17, 8)) * 0.01;
    var refCheckDigit = virtualCode.substr(25, 2);
    var ref = Number(virtualCode.substr(27, 21));
    var date = virtualCode.substr(48, 6);
    var y = date.substr(0, 2);
    var m = date.substr(2, 2);
    var d = date.substr(4, 2);

    if(Number(date) === 0)
        date = "";
    else
        date = d + '.' + m + '.' + "20" + y;


    $("#iban-value").html(iban);
    $("#amnt-value").html(amnt.toFixed(2) + " Euros");
    $("#ref-value").html("RF" + refCheckDigit + ref.toString());
    $("#date-value").html(date);
}

function version4Decode(virtualCode){
    var iban = "FI".concat(virtualCode.substr(1, 16));
    var amnt = Number(virtualCode.substr(17, 8)) * 0.01;
    var ref = Number(virtualCode.substr(28, 20));
    var date = virtualCode.substr(48, 6);
    var y = date.substr(0, 2);
    var m = date.substr(2, 2);
    var d = date.substr(4, 2);

    if(Number(date) === 0)
        date = "";
    else
        date = d + '.' + m + '.' + "20" + y;


    $("#iban-value").html(iban);
    $("#amnt-value").html(amnt.toFixed(2) + " Euros");
    $("#ref-value").html(ref.toString());
    $("#date-value").html(date);
}


$(document).ready(function(){
    $("#hide-btn").click(function(){
        var hideBtn = $("#hide-btn");
        var state = hideBtn.text().trim().toUpperCase();
        if(state === "SHOW"){
            hideBtn.text("Hide");
            $("#info-section").slideDown("slow");
        }
        else{
            hideBtn.text("Show");
            $("#info-section").slideUp("slow");
        }
    });
    $("#decode-btn").click(function(){
        var virtualCode = $("#v-code-input").val().trim();
        var version = getVersion(virtualCode);
        if(!version){
            alert("You must enter a valid virtual code");
            return;
        }
        if(version === 4){
            version4Decode(virtualCode);
            $("#bar-code-container").css("background-color", "white");
            $("#barcode").JsBarcode(virtualCode);
        } else if(version === 5){
            version5Decode(virtualCode);
            $("#barcode").JsBarcode(virtualCode);
        } else{
            alert("Wrong Virtual Code");
        }
    });
});