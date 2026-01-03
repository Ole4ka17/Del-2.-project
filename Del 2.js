function laan() {
    var sum = parseFloat(document.getElementById("loanAmount").value);
    var rente = parseFloat(document.getElementById("interest").value);
    var aar = parseFloat(document.getElementById("years").value);

    if (isNaN(sum) || isNaN(rente) || isNaN(aar) || aar <= 0) {
        document.getElementById("loanResult").innerHTML = "Fyll inn alle feltene riktig.";
        return;
    }

    var mndRente = rente / 100 / 12;
    var antMnd = aar * 12;
    var betaling = (sum * mndRente) / (1 - Math.pow(1 + mndRente, -antMnd));

    document.getElementById("loanResult").innerHTML = "Månedlig betaling: " + betaling.toFixed(2) + " kr";
}

var pin = Math.floor(Math.random() * 9000) + 1000;

function gjett() {
    var tall = parseInt(document.getElementById("pinGuess").value);

    if (isNaN(tall)) {
        document.getElementById("pinResult").innerHTML = "Skriv inn et tall først.";
        return;
    }

    if (tall === pin) {
        document.getElementById("pinResult").innerHTML = "Riktig! Du gjettet PIN-koden!";
    } else if (tall < pin) {
        document.getElementById("pinResult").innerHTML = "For lavt!";
    } else {
        document.getElementById("pinResult").innerHTML = "For høyt!";
    }
}

var liste = [];

function leggTil() {
    var tekst = document.getElementById("transText").value.trim();
    var sum = document.getElementById("transAmount").value;

    if (!tekst || !sum) return;

    liste.push(tekst + " - " + sum + " kr");

    var ul = document.getElementById("transList");
    ul.innerHTML = "";

    for (var i = 0; i < liste.length; i++) {
        var li = document.createElement("li");
        li.textContent = liste[i];
        ul.appendChild(li);
    }

    document.getElementById("transText").value = "";
    document.getElementById("transAmount").value = "";
}

