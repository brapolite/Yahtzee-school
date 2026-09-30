let player = "";
let dice = ["X", "X", "X", "X", "X"];
let kept = [false, false, false, false, false];
let rollsLeft = 3;

function join() {
    player = document.getElementById("name").value;
    fetch("/join", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name: player})
    });
}

// Fonction qui envoie les dés à Python et affiche le résultat
function submitScore(categoryName) {
    if (dice.includes("X")) {
        alert("Tu dois lancer les dés avant de choisir une catégorie !");
        return;
    }

    fetch("/score", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            player: player,
            category: categoryName,
            dice_values: dice
        })
    })
    .then(r => r.json())
    .then(data => {
        // Trouver la ligne correspondante dans le tableau
        const labels = document.querySelectorAll(".category-label");
        labels.forEach(label => {
            if (label.innerText === data.category) {
                const row = label.parentElement;
                // On remplit le premier input (Joueur 1)
                const input = row.querySelector("input");
                if (input) {
                    input.value = data.points;
                    input.style.backgroundColor = "#d1ffd1"; // Vert clair pour confirmer
                    input.readOnly = true; 
                }
            }
        });
        
        console.log(`Score reçu : ${data.points} pour ${data.category}`);
        newTurn(); // Reset les dés pour le prochain tour
    });
}

function rollDice() {
    if (rollsLeft === 0) {
        alert("Plus de lancers disponibles !");
        return;
    }

    for (let i = 0; i < 5; i++) {
        if (!kept[i]) {
            dice[i] = Math.floor(Math.random() * 6) + 1;
            updateDie(i);
        }
    }
    rollsLeft--;
    document.getElementById("turn").textContent = "Lancers restants : " + rollsLeft;
}

function updateDie(index) {
    const button = document.getElementById("die" + index);
    const value = dice[index];
    if (value === "X") {
        button.innerHTML = "X";
        button.style.backgroundColor = "";
    } else {
        button.innerHTML = `<img src="/static/images/dice${value}.png" width="80" height="80">`;
        button.style.backgroundColor = kept[index] ? "lightgreen" : "";
    }
}

function toggleDie(index) {
    if (dice[index] !== "X") {
        kept[index] = !kept[index];
        updateDie(index);
    }
}

// Fonctions individuelles pour tes onclick HTML
function selectdie1() { toggleDie(0); }
function selectdie2() { toggleDie(1); }
function selectdie3() { toggleDie(2); }
function selectdie4() { toggleDie(3); }
function selectdie5() { toggleDie(4); }

function newTurn() {
    rollsLeft = 3;
    kept = [false, false, false, false, false];
    dice = ["X", "X", "X", "X", "X"];
    document.getElementById("turn").textContent = "Nouveau tour - 3 lancers";
    for (let i = 0; i < 5; i++) updateDie(i);
}

window.onload = () => {
    // Rend les catégories cliquables
    const categories = document.querySelectorAll(".category-label");
    categories.forEach(cat => {
        cat.style.cursor = "pointer";
        cat.onclick = function() { submitScore(this.innerText); };
        // Petit effet au survol
        cat.onmouseover = function() { this.style.color = "red"; };
        cat.onmouseout = function() { this.style.color = ""; };
    });
    newTurn();
};