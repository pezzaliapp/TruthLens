/***********************************
 * REGISTRAZIONE SERVICE WORKER
 ***********************************/
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log("Service Worker registrato correttamente!"))
      .catch(err => console.log("Errore Service Worker:", err));
  });
}

/***********************************
 * GESTIONE EVENTO BEFOREINSTALLPROMPT
 ***********************************/
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

// Intercetta l'evento di installazione
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Evento beforeinstallprompt catturato!');
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove('hidden'); // Mostra il pulsante
});

installBtn.addEventListener('click', () => {
  if (!deferredPrompt) return;
  installBtn.classList.add('hidden');
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log("PWA installata con successo.");
    } else {
      console.log("Installazione PWA annullata.");
    }
    deferredPrompt = null;
  });
});

/***********************************
 * FUNZIONE PRINCIPALE: ANALIZZA TESTO
 ***********************************/
function analyzeText() {
  const text = document.getElementById("inputText").value;
  const output = document.getElementById("output");
  let warnings = [];

  // Parole assolute e termini di enfatizzazione
  const absoluteWords = ["sempre", "mai", "tutti", "nessuno", "ogni", "esclusivamente"];
  const strongModifiers = ["deve", "bisogna", "necessario", "impossibile", "non può"];

  absoluteWords.forEach(word => {
    let regex = new RegExp(`(?:^|\\s)${word}(?:\\s|$)`, "gi");
    let match;
    while ((match = regex.exec(text)) !== null) {
      let index = match.index;
      let surroundingText = text.substring(Math.max(0, index - 15), Math.min(text.length, index + word.length + 15));
      let hasStrongModifier = strongModifiers.some(mod => surroundingText.includes(mod));
      if (hasStrongModifier) {
        warnings.push(`⚠️ Affermazione assoluta rafforzata: "${word}"`);
      } else if (!surroundingText.includes("in alcuni casi") && !surroundingText.includes("può accadere")) {
        warnings.push(`⚠️ Affermazione assoluta: "${word}"`);
      }
    }
  });

  // Calcolo punteggio
  let score = 100 - (warnings.length * 10);
  if (score < 0) score = 0;

  // Output
  if (warnings.length > 0) {
    output.innerHTML = `<strong>Punteggio di affidabilità: ${score}/100</strong><br><br>` + warnings.join("<br>");
  } else {
    output.innerHTML = `<strong>Punteggio di affidabilità: 100/100 ✅</strong><br>Nessuna manipolazione evidente.`;
  }
}

/***********************************
 * FUNZIONE CARICAMENTO FILE .DOCX E .PDF
 ***********************************/
function loadFile() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) {
    alert("Seleziona un file prima di caricare.");
    return;
  }

  const reader = new FileReader();

  if (file.name.endsWith(".pdf")) {
    // Caricamento PDF con pdf.js
    reader.onload = function() {
      let typedarray = new Uint8Array(this.result);
      pdfjsLib.getDocument(typedarray).promise.then(pdf => {
        let text = "";
        let promises = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          promises.push(
            pdf.getPage(i).then(page => 
              page.getTextContent().then(tc => {
                tc.items.forEach(item => text += item.str + " ");
              })
            )
          );
        }
        Promise.all(promises).then(() => {
          document.getElementById("inputText").value = text.trim();
        });
      });
    };
    reader.readAsArrayBuffer(file);

  } else if (file.name.endsWith(".docx")) {
    // Caricamento DOCX con docx.js
    reader.onload = function() {
      let arrayBuffer = this.result;
      let doc = new window.docx.Document(arrayBuffer);
      doc.load().then(content => {
        let text = content.getBody().map(p => p.getText()).join(" ");
        document.getElementById("inputText").value = text.trim();
      });
    };
    reader.readAsArrayBuffer(file);

  } else {
    alert("Formato non supportato. Carica un file .docx o .pdf.");
  }
}
