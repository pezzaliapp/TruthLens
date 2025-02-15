function analyzeText() {
    let text = document.getElementById("inputText").value;
    let output = document.getElementById("output");
    let warnings = [];

    // Parole sospette
    const warningWords = ["scioccante", "urgente", "segreto", "non vogliono che tu sappia", "incredibile", "scandalo"];
    
    // Controlla parole sospette
    warningWords.forEach(word => {
        if (text.toLowerCase().includes(word)) {
            warnings.push(`🔴 Parola sospetta: "${word}"`);
        }
    });

    // Controlla eccesso di maiuscole
    if ((text.match(/[A-Z]{5,}/g) || []).length > 3) {
        warnings.push("⚠️ Uso eccessivo di MAIUSCOLE, possibile manipolazione emotiva.");
    }

    // Controlla punteggiatura esagerata
    if ((text.match(/!{3,}|\.{3,}|\?{3,}/g) || []).length > 0) {
        warnings.push("⚠️ Punteggiatura esagerata rilevata (!!!, ???, ...).");
    }

    // Controlla affermazioni assolute
    const absoluteWords = ["sempre", "mai", "tutti", "nessuno"];
    absoluteWords.forEach(word => {
        if (text.toLowerCase().includes(word)) {
            warnings.push(`⚠️ Affermazione assoluta: "${word}", verifica il contesto.`);
        }
    });

    // Assegna punteggio di affidabilità (più warning, più basso il punteggio)
    let score = 100 - (warnings.length * 10);
    score = score < 0 ? 0 : score;

    // Mostra i risultati
    if (warnings.length > 0) {
        output.innerHTML = `<strong>Punteggio di affidabilità: ${score}/100</strong><br><br>` + warnings.join("<br>");
    } else {
        output.innerHTML = `<strong>Punteggio di affidabilità: 100/100 ✅</strong><br><br>Il testo non sembra contenere segnali di manipolazione.`;
    }
}
