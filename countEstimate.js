// Funzione per calcolare il numero di record basato sul raggio
function calculateEstimatedRecords(radius, consentChecked) {
    // Calcola il lato del quadrato circoscritto
    const sideLength = 2 * radius;

    // Calcola l'area del quadrato
    const areaSquareMeters = Math.pow(sideLength, 2);

    // Converti l'area da metri quadrati a chilometri quadrati
    const areaSquareKm = areaSquareMeters / 1000000;

    // Densità abitativa in ab/km²
    const density = consentChecked ? 157 : 528;

    // Calcola il numero stimato di record
    const estimatedRecords = Math.round(areaSquareKm * density);

    return estimatedRecords;
}

// Funzione per aggiornare l'UI con il numero stimato di record
function updateEstimatedRecords(radius, consentChecked) {
    const estimatedRecords = calculateEstimatedRecords(radius, consentChecked);
    const estimatedRecordsElement = document.getElementById('estimatedRecords');
    estimatedRecordsElement.innerText = `Stima record coinvolti: ${estimatedRecords}`;
}

// Aggiorna il conteggio iniziale
updateEstimatedRecords(parseInt(radiusSlider.value), document.getElementById('consentCheckbox').checked);

// Aggiorna l'UI quando il raggio cambia
radiusSlider.addEventListener('input', () => {
    const radius = parseInt(radiusSlider.value);
    const consentChecked = document.getElementById('consentCheckbox').checked;
    updateEstimatedRecords(radius, consentChecked);
});

// Aggiorna l'UI quando la casella di consenso cambia
consentCheckbox.addEventListener('change', () => {
    const radius = parseInt(radiusSlider.value);
    const consentChecked = document.getElementById('consentCheckbox').checked;
    updateEstimatedRecords(radius, consentChecked);
});
