function analyzeText() {
    let text = document.getElementById("inputText").value;
    let output = document.getElementById("output");
    let warnings = [];

    // Parole assolute e termini di enfatizzazione
    const absoluteWords = ["sempre", "mai", "tutti", "nessuno", "ogni", "esclusivamente"];
    const strongModifiers = ["deve", "bisogna", "necessario", "impossibile", "non può"];

    // Controlla affermazioni assolute con contesto
    absoluteWords.forEach(word => {
        let regex = new RegExp(`(?:^|\\s)${word}(?:\\s|$)`, "gi"); // Trova la parola isolata
        let match;
        while ((match = regex.exec(text)) !== null) {
            let index = match.index;
            let surroundingText = text.substring(Math.max(0, index - 15), Math.min(text.length, index + word.length + 15));

            // Verifica se la parola è rafforzata da un termine problematico
            let hasStrongModifier = strongModifiers.some(modifier => surroundingText.includes(modifier));
            
            if (hasStrongModifier) {
                warnings.push(`⚠️ Affermazione assoluta rafforzata: "${word}", verifica il contesto.`);
            } else if (!surroundingText.includes("in alcuni casi") && !surroundingText.includes("può accadere")) {
                warnings.push(`⚠️ Affermazione assoluta: "${word}", verifica il contesto.`);
            }
        }
    });

    // Calcola il punteggio di affidabilità
    let score = 100 - (warnings.length * 10);
    score = score < 0 ? 0 : score;

    // Mostra i risultati
    if (warnings.length > 0) {
        output.innerHTML = `<strong>Punteggio di affidabilità: ${score}/100</strong><br><br>` + warnings.join("<br>");
    } else {
        output.innerHTML = `<strong>Punteggio di affidabilità: 100/100 ✅</strong><br><br>Il testo non sembra contenere segnali di manipolazione.`;
    }
}
