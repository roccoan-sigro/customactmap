define('customActivity', ['jquery', 'postmonger'], function ($, Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var eventDefinitionKey = null;
    var coordinates = {};

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTriggerEventDefinition', function (eventDefinitionModel) {
        eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
    });
    connection.on('clickedNext', save);

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTriggerEventDefinition');
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        if (hasInArguments) {
            var inArguments = payload['arguments'].execute.inArguments[0];
            coordinates = {
                minLatitude: inArguments.minLatitude,
                maxLatitude: inArguments.maxLatitude,
                minLongitude: inArguments.minLongitude,
                maxLongitude: inArguments.maxLongitude,
                Latitudine: inArguments.Latitudine,
                Longitudine: inArguments.Longitudine
            };

            // Calcolare il centro e il raggio della selezione per ripristinare la mappa
            var centerLat = (parseFloat(coordinates.minLatitude) + parseFloat(coordinates.maxLatitude)) / 2;
            var centerLng = (parseFloat(coordinates.minLongitude) + parseFloat(coordinates.maxLongitude)) / 2;

            // Inizializzare la mappa con la selezione salvata
            initializeMap(function (addMarkerAndCircle) {
                addMarkerAndCircle([centerLat, centerLng], 50); // Imposta il raggio iniziale a 50 metri
            });
        }
    }

        function save() {
            var minLatitude = coordinates.minLatitude;
            var maxLatitude = coordinates.maxLatitude;
            var minLongitude = coordinates.minLongitude;
            var maxLongitude = coordinates.maxLongitude;
            var userLatitude = coordinates.Latitudine || "{{Contact.Attribute.LongitudineLatitudine.Latitudine}}";
            var userLongitude = coordinates.Longitudine || "{{Contact.Attribute.LongitudineLatitudine.Longitudine}}";
        
            payload['arguments'].execute.inArguments = [{
                "minLatitude": minLatitude,
                "maxLatitude": maxLatitude,
                "minLongitude": minLongitude,
                "maxLongitude": maxLongitude,
                "Latitudine": userLatitude,
                "Longitudine": userLongitude,
                "SubscriberKey": "{{Contact.Key}}",
                "EmailAddress": "{{InteractionDefaults.Email}}"
            }];
        
            payload['metaData'].isConfigured = true;
        
            // Aggiorna il nome del primo outcome con i dettagli dell'indirizzo
            var address = document.getElementById('address').innerText.replace('Indirizzo: ', '');
            var radius = document.getElementById('radiusInput').value;
            var outcomeLabel = ${address}, ${radius}m;
        
            // Aggiorna il nome del primo outcome nel config.json
            payload['outcomes'][0].metaData.label = outcomeLabel;
        
            console.log('Saving payload:', JSON.stringify(payload, null, 2));
            connection.trigger('updateActivity', payload);
        }




    function updateCoordinates(newCoordinates) {
        console.log('New coordinates updated:', newCoordinates);
        coordinates = newCoordinates;
    }

    function initializeMap(callback) {
        if (typeof callback === 'function') {
            callback(function (latlng, radius) {
                if (window.addMarkerAndCircle) {
                    window.addMarkerAndCircle(latlng, radius);
                }
            });
        }
    }

    return {
        initialize: initialize,
        save: save,
        updateCoordinates: updateCoordinates,
        initializeMap: initializeMap
    };
});
