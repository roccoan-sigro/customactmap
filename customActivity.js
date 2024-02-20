// Definisci il modulo usando la sintassi di RequireJS
define(["js/postmonger"], function (Postmonger) {
    'use strict';

    // Inizializza la sessione di Postmonger
    var connection = new Postmonger.Session();
    var payload = {};

    // Gestisci l'evento di inizializzazione dell'attività
    connection.on('initActivity', function (data) {
        if (data) {
            payload = data;
        }
    });

    // Gestisci l'evento di richiesta dei token
    connection.on('requestedTokens', function (data) {
        // ... (rimani invariato il resto del tuo codice)
    });

    // Funzione chiamata al rendering dell'interfaccia utente
    function onRender() {
        // ... (rimani invariato il resto del tuo codice)
    }

    // Gestisci l'evento di click sul pulsante Next
    connection.on('clickedNext', function () {
        // Salva le configurazioni prima di chiudere l'iframe
        connection.trigger('updateActivity', getActivityConfig());
        connection.trigger('nextStep');
    });

    // Funzione per ottenere le configurazioni dell'attività
    function getActivityConfig() {
        return {
            minLatitude: selectedMinLatitude,
            maxLatitude: selectedMaxLatitude,
            minLongitude: selectedMinLongitude,
            maxLongitude: selectedMaxLongitude
        };
    }

    // Funzione per aggiornare il journey
    function updateJourney(isInRange) {
        var data = {
            metaData: {},
            name: payload.name || 'CustomActivity',
            type: payload.type || 'EVENT',
            outcomes: [
                {
                    key: 'inRange',
                    next: isInRange ? 'inRange' : 'outOfRange'
                }
            ],
            arguments: {},
            configurationArguments: payload.configurationArguments || {},
            iconUrl: 'url-to-your-icon.png'
        };

        connection.trigger('updateActivity', data);
    }

    // Esporta eventuali funzioni o variabili che desideri rendere accessibili esternamente
    return {
        onRender: onRender,
        updateJourney: updateJourney
    };
});
