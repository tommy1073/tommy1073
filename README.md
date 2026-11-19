# Tommaso & Margherita · 24.04.2027 🌸

Il sito del nostro matrimonio. È un sito statico (HTML, CSS e JavaScript, senza dipendenze): basta aprire `index.html` nel browser.

## Sezioni

1. **Home**: i nomi, la data e il countdown, più il pulsante "Aggiungi al calendario" (.ics con promemoria una settimana prima)
2. **La nostra storia**: 4 tappe su una linea del tempo
3. **I nostri momenti**: galleria di foto con lightbox
4. **Il grande giorno**: cerimonia, ricevimento, programma e dress code
5. **RSVP**: modulo di conferma (presenza, numero di ospiti, allergie, canzone da ballare)
6. **Regalo**: l'itinerario in Giappone e l'IBAN con pulsante "Copia"
7. **FAQ** e petali di ciliegio che cadono (i *sakura*, la primavera giapponese)

## Cosa personalizzare

| Cosa | Dove |
|---|---|
| Testi della storia, luoghi, orari, FAQ | `index.html` (cerca le parti tra `[parentesi quadre]`) |
| IBAN e intestatari | `index.html`, sezione `id="regalo"` |
| Data/ora, email RSVP, evento calendario, didascalie delle foto | `CONFIG` all'inizio di `script.js` |
| Foto | cartella `images/`: `hero.jpg` (sfondo della home) e `foto1.jpg` … `foto8.jpg` |
| Link di Google Maps | `index.html`, sezione `id="programma"` |

Finché una foto non c'è, al suo posto compare un riquadro colorato con il nome del file da aggiungere.

## Ricevere le conferme (RSVP) in un Google Sheet

Senza configurazione, il modulo apre un'email precompilata verso `CONFIG.rsvpEmail`. Per raccogliere le risposte in automatico:

1. Crea un Google Sheet e apri **Estensioni → Apps Script**.
2. Incolla questo codice:

   ```js
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     const p = e.parameter;
     const cols = ["inviato", "nome", "contatto", "presenza", "adulti", "bambini",
                   "accompagnatori", "alimentazione", "canzone", "messaggio"];
     if (sheet.getLastRow() === 0) sheet.appendRow(cols);
     sheet.appendRow(cols.map((c) => p[c] || ""));
     return ContentService.createTextOutput("ok");
   }
   ```

3. **Esegui il deployment → Nuovo deployment → App web**, con "Chi ha accesso" impostato su **Chiunque**.
4. Copia l'URL (`https://script.google.com/macros/s/.../exec`) in `CONFIG.rsvpEndpoint` dentro `script.js`.

In alternativa funziona anche un form gratuito di [Formspree](https://formspree.io): incolla l'URL del form in `CONFIG.rsvpEndpoint`.

## Pubblicazione gratis con GitHub Pages

Nelle impostazioni del repository apri **Settings → Pages**, scegli il branch con questi file e la cartella `/ (root)`. Dopo un paio di minuti il sito è online.

## Aggiornare il sito

Dopo ogni modifica a `style.css` o `script.js`, cambia il numero dopo `?v=` nei due link in fondo e in cima a `index.html`: così i telefoni scaricano subito la versione nuova invece di quella salvata in memoria.
