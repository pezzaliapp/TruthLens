// REGISTRAZIONE DEL SERVICE WORKER
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log("Service Worker registrato"))
      .catch(err => console.error("Service Worker non registrato", err));
  });
}

// GESTIONE INSTALLAZIONE PWA
let deferredInstallPrompt;
const installButton = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  installButton.classList.remove("hidden");
});

installButton.addEventListener("click", () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choice) => {
      console.log("Scelta installazione:", choice.outcome);
      deferredInstallPrompt = null;
      installButton.classList.add("hidden");
    });
  }
});

// FUNZIONE DI ANALISI DEL TESTO
function analizzaTesto(input) {
  const resultDiv = document.getElementById("result");
  let messaggi = [];
  
  // Esempio di parole problematiche
  const paroleAssolute = ["sempre", "mai", "tutti", "nessuno", "ogni"];
  const modificatori = ["deve", "bisogna", "impossibile"];

  paroleAssolute.forEach(parola => {
    const regex = new RegExp(`\\b${parola}\\b`, "gi");
    let match;
    while ((match = regex.exec(input)) !== null) {
      // Controlla 15 caratteri prima e dopo
      let inizio = Math.max(0, match.index - 15);
      let fine = Math.min(input.length, match.index + parola.length + 15);
      const contesto = input.substring(inizio, fine).toLowerCase();
      
      const modificatorePresente = modificatori.some(mod => contesto.includes(mod));
      if (modificatorePresente) {
        messaggi.push(`⚠️ Affermazione assoluta rafforzata: "${parola}"`);
      } else {
        messaggi.push(`⚠️ Affermazione assoluta: "${parola}"`);
      }
    }
  });
  
  // Calcola un punteggio base
  let punteggio = 100 - (messaggi.length * 10);
  if (punteggio < 0) punteggio = 0;
  
  let outputHtml = `<strong>Punteggio di affidabilità: ${punteggio}/100</strong>`;
  if (messaggi.length > 0) {
    outputHtml += "<br><br>" + messaggi.join("<br>");
  } else {
    outputHtml += "<br>Nessuna manipolazione rilevata.";
  }
  
  resultDiv.innerHTML = outputHtml;
}

// GESTIONE ANALISI DEL TESTO MANUALE
document.getElementById("analyzeManualBtn").addEventListener("click", () => {
  const testo = document.getElementById("manualText").value;
  if (!testo.trim()) {
    alert("Inserisci del testo prima di analizzare.");
    return;
  }
  analizzaTesto(testo);
});

// GESTIONE CARICAMENTO E ANALISI DOCUMENTO
document.getElementById("uploadBtn").addEventListener("click", () => {
  const fileInput = document.getElementById("docInput");
  const file = fileInput.files[0];
  
  if (!file) {
    alert("Seleziona un file prima di procedere.");
    return;
  }
  
  const reader = new FileReader();
  
  if (file.name.toLowerCase().endsWith(".pdf")) {
    // Gestione PDF con pdf.js
    reader.onload = function () {
      const typedArray = new Uint8Array(this.result);
      pdfjsLib.getDocument(typedArray).promise.then(pdf => {
        let testoCompleto = "";
        let pagine = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          pagine.push(
            pdf.getPage(i).then(page => 
              page.getTextContent().then(content => {
                content.items.forEach(item => {
                  testoCompleto += item.str + " ";
                });
              })
            )
          );
        }
        Promise.all(pagine).then(() => {
          document.getElementById("manualText").value = testoCompleto.trim();
          analizzaTesto(testoCompleto);
        });
      }).catch(err => {
        console.error("Errore PDF:", err);
        alert("Errore nel caricamento del PDF.");
      });
    };
    reader.readAsArrayBuffer(file);
    
  } else if (file.name.toLowerCase().endsWith(".docx")) {
    // Gestione DOCX con Mammoth.js
    reader.onload = function (event) {
      mammoth.extractRawText({ arrayBuffer: event.target.result })
        .then(result => {
          const testo = result.value;
          document.getElementById("manualText").value = testo.trim();
          analizzaTesto(testo);
        })
        .catch(err => {
          console.error("Errore DOCX:", err);
          alert("Errore nel caricamento del DOCX.");
        });
    };
    reader.readAsArrayBuffer(file);
    
  } else {
    alert("Formato non supportato. Usa PDF o DOCX.");
  }
});
