const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/mappapc', (req, res) => {
    const { inArguments } = req.body;

    if (inArguments.length > 0) {
        const { minLatitude, maxLatitude, minLongitude, maxLongitude } = inArguments[0];
        // Logica per gestire le coordinate e fare decisioni
        console.log(`minLatitude: ${minLatitude}, maxLatitude: ${maxLatitude}, minLongitude: ${minLongitude}, maxLongitude: ${maxLongitude}`);
        
        // Restituisce un risultato di esempio
        res.json({ branchResult: 'selectedMapArea' });
    } else {
        res.status(400).json({ error: 'Invalid arguments' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
