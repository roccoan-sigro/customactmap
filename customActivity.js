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
        console.log('Initialize data:', data);

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
                radius: inArguments.radius || 50,
                Latitudine: inArguments.Latitudine,
                Longitudine: inArguments.Longitudine
            };

            // Calcolare il centro della selezione per ripristinare la mappa
            var centerLat = (parseFloat(coordinates.minLatitude) + parseFloat(coordinates.maxLatitude)) / 2;
            var centerLng = (parseFloat(coordinates.minLongitude) + parseFloat(coordinates.maxLongitude)) / 2;

            // Inizializzare la mappa con la selezione salvata
            initializeMap(function (addMarkerAndCircle) {
                // Ripristina il marker e il cerchio con i dati salvati
                addMarkerAndCircle([centerLat, centerLng], coordinates.radius);
            });
        }
    }

    function save() {
        var radius = document.getElementById('radiusInput').value;
        var userLatitude = coordinates.Latitudine || "{{Contact.Attribute.LongitudineLatitudine.Latitudine}}";
        var userLongitude = coordinates.Longitudine || "{{Contact.Attribute.LongitudineLatitudine.Longitudine}}";

        payload['arguments'].execute.inArguments = [{
            "minLatitude": coordinates.minLatitude,
            "maxLatitude": coordinates.maxLatitude,
            "minLongitude": coordinates.minLongitude,
            "maxLongitude": coordinates.maxLongitude,
            "radius": radius,
            "Latitudine": userLatitude,
            "Longitudine": userLongitude,
            "SubscriberKey": "{{Contact.Key}}",
            "EmailAddress": "{{InteractionDefaults.Email}}"
        }];

        payload['metaData'].isConfigured = true;

        // Aggiorna il nome del primo outcome con i dettagli dell'indirizzo
        var address = document.getElementById('address').innerText.replace('Indirizzo: ', '');
        var outcomeLabel = `${address}, ${radius}m`;

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

    function addMarkerAndCircle(latlng, radius) {
        if (!latlng) return;

        // Rimuove marcatore e cerchio esistenti, se presenti
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
        if (circle) {
            map.removeLayer(circle);
            circle = null;
        }

        // Aggiunge nuovo marcatore e cerchio
        marker = L.marker(latlng).addTo(map);
        circle = L.circle(latlng, {
            radius: radius,
            color: '#8e001c',
            fillOpacity: 0.2
        }).addTo(map);

        const bounds = circle.getBounds();
        const selectedMinLatitude = bounds.getSouthWest().lat.toFixed(8);
        const selectedMaxLatitude = bounds.getNorthEast().lat.toFixed(8);
        const selectedMinLongitude = bounds.getSouthWest().lng.toFixed(8);
        const selectedMaxLongitude = bounds.getNorthEast().lng.toFixed(8);

        updateCoordinates({
            minLatitude: selectedMinLatitude,
            maxLatitude: selectedMaxLatitude,
            minLongitude: selectedMinLongitude,
            maxLongitude: selectedMaxLongitude,
            Latitudine: latlng.lat,
            Longitudine: latlng.lng,
            radius: radius
        });

        // Aggiorna l'indirizzo
        updateAddress(latlng);

        // Aggiungi la chiamata per ottenere il conteggio dei record dalla DE
        fetch('https://mappa-protezione-civile-7987e051c9db.herokuapp.com/countRecords', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                minLatitude: selectedMinLatitude,
                maxLatitude: selectedMaxLatitude,
                minLongitude: selectedMinLongitude,
                maxLongitude: selectedMaxLongitude,
                radius: radius
            })
        })
        .then(response => response.json())
        .then(data => {
            // Mostra il numero di record nel front-end
            document.getElementById('recordCount').innerText = `Numero di record: ${data.count}`;
        })
        .catch(error => {
            console.error('Errore durante il recupero del numero di record:', error);
            document.getElementById('recordCount').innerText = 'Errore nel recupero dei record';
        });
    }

    return {
        updateCoordinates: updateCoordinates,
        initializeMap: initializeMap
    };
});
