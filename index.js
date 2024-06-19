// index.js

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware per gestire il parsing del corpo delle richieste in formato JSON
app.use(bodyParser.json());

// Endpoint per gestire le richieste POST
app.post('/decision', (req, res) => {
    try {
        // Esempio di log per visualizzare i dati ricevuti
        console.log('Request Body:', req.body);

        // Eseguire qui la logica di decisione basata sui dati ricevuti
        const requestData = req.body;
        const minLatitude = parseFloat(requestData.minLatitude);
        const maxLatitude = parseFloat(requestData.maxLatitude);
        const minLongitude = parseFloat(requestData.minLongitude);
        const maxLongitude = parseFloat(requestData.maxLongitude);

        const personMailingAddress = JSON.parse(requestData.PersonMailingAddress);
        const contactLatitude = parseFloat(personMailingAddress.latitude);
        const contactLongitude = parseFloat(personMailingAddress.longitude);

        let branchResult = "remainingContacts";

        if (contactLatitude >= minLatitude && contactLatitude <= maxLatitude &&
            contactLongitude >= minLongitude && contactLongitude <= maxLongitude) {
            branchResult = "selectedMapArea";
        }

        // Preparare la risposta da inviare a Salesforce Marketing Cloud
        const response = {
            branchResult: branchResult
        };

        // Restituire la risposta in formato JSON
        res.json(response);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Avvio del server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
