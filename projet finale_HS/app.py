from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def calculer_score(categorie, dés):
    # On s'assure que les dés sont des nombres entiers
    dés = [int(d) for d in dés if str(d).isdigit()]
    if not dés: return 0

    # Logique pour les chiffres (Uns, Deux, etc.)
    valeurs_simples = {
        "Uns": 1, "Deux": 2, "Trois": 3, 
        "Quatres": 4, "Cinqs": 5, "Six": 6
    }
    
    if categorie in valeurs_simples:
        cible = valeurs_simples[categorie]
        return dés.count(cible) * cible

    # Logique pour les combinaisons spéciales
    counts = [dés.count(d) for d in set(dés)]
    
    if categorie == "Brelan":
        return sum(dés) if any(c >= 3 for c in counts) else 0
    
    if categorie == "Carré":
        return sum(dés) if any(c >= 4 for c in counts) else 0
    
    if categorie == "Full":
        return 25 if (2 in counts and 3 in counts) else 0
    
    if categorie == "Petite Suite":
        # On vérifie si 4 chiffres se suivent
        unique_sorted = sorted(list(set(dés)))
        suites = [[1,2,3,4], [2,3,4,5], [3,4,5,6]]
        for s in suites:
            if all(val in unique_sorted for val in s):
                return 30
        return 0

    if categorie == "Grande Suite":
        unique_sorted = sorted(list(set(dés)))
        if unique_sorted in [[1,2,3,4,5], [2,3,4,5,6]]:
            return 40
        return 0

    if categorie == "Yahtzee 2.0":
        return 51 if any(c == 5 for c in counts) else 0
        
    if categorie == "Chance":
        return sum(dés)

    return 0

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/rules")
def rules():
    return render_template("rules.html")

@app.route("/join", methods=["POST"])
def join():
    data = request.get_json()
    name = data.get("name", "")
    return jsonify({"status": "ok", "player": name})

@app.route("/score", methods=["POST"])
def score():
    data = request.get_json()
    categorie = data.get("category")
    dés = data.get("dice_values")
    points = calculer_score(categorie, dés)
    return jsonify({"category": categorie, "points": points})

@app.route("/state")
def state():
    return jsonify({"turn": "Player 1", "board": [""] * 9})

if __name__ == "__main__":
    app.run(debug=True)    
