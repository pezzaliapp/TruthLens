function analyzeText() {
    let text = document.getElementById("inputText").value;
    let output = document.getElementById("output");
    let warnings = [];

    // Parole assolute e termini di enfatizzazione
    const absoluteWords = ["sempre", "mai", "tutti", "nessuno", "ogni", "esclusivamente"];
    const strongModifiers = ["deve", "bisogna", "necessario", "impossibile", "non può"];

    // Controlla affermazioni assolute con contesto
    absoluteWords.forEach(word => {
        let regex = new RegExp(`(?:^|\\s)${word}(?:\\s|$)`, "gi"); 
        let match;
        while ((match = regex.exec(text)) !== null) {
            let index = match.index;
            let surroundingText = text.substring(Math.max(0, index - 15), Math.min(text.length, index + word.length + 15));

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

// Funzione per caricare e leggere file .docx e .pdf
function loadFile() {
    let file = document.getElementById("fileInput").files[0];
    if (!file) {
        alert("Seleziona un file prima di caricare.");
        return;
    }

    let reader = new FileReader();
    
    if (file.name.endsWith(".pdf")) {
        reader.onload = function () {
            let typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                let text = "";
                let totalPages = pdf.numPages;
                let countPromises = [];

                for (let i = 1; i <= totalPages; i++) {
                    countPromises.push(
                        pdf.getPage(i).then(page => 
                            page.getTextContent().then(textContent => {
                                textContent.items.forEach(item => text += item.str + " ");
                            })
                        )
                    );
                }

                Promise.all(countPromises).then(() => {
                    document.getElementById("inputText").value = text.trim();
                });
            });
        };
        reader.readAsArrayBuffer(file);
    } 
    else if (file.name.endsWith(".docx")) {
        reader.onload = function () {
            let arrayBuffer = this.result;
            let doc = new window.docx.Document(arrayBuffer);
            doc.load().then(content => {
                let text = content.getBody().map(p => p.getText()).join(" ");
                document.getElementById("inputText").value = text.trim();
            });
        };
        reader.readAsArrayBuffer(file);
    } 
    else {
        alert("Formato non supportato. Carica un file .docx o .pdf.");
    }
}
