define('customActivity', ['jquery', 'postmonger'], function ($, Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var eventDefinitionKey;

    var selectedMinLatitude;
    var selectedMaxLatitude;
    var selectedMinLongitude;
    var selectedMaxLongitude;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedInteraction', setInteraction);
    connection.on('requestedTokens', onRequestedTokens);
    connection.on('clickedDone', onSave);

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestInteraction');
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

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        // Recupera i dati salvati precedentemente e imposta le variabili
        if (inArguments[0].minLatitude) {
            selectedMinLatitude = inArguments[0].minLatitude;
            selectedMaxLatitude = inArguments[0].maxLatitude;
            selectedMinLongitude = inArguments[0].minLongitude;
            selectedMaxLongitude = inArguments[0].maxLongitude;

            // Aggiorna la mappa con i dati salvati
            if (selectedMinLatitude && selectedMaxLatitude && selectedMinLongitude && selectedMaxLongitude) {
                var bounds = [
                    [selectedMinLatitude, selectedMinLongitude],
                    [selectedMaxLatitude, selectedMaxLongitude]
                ];

                var circleBounds = L.latLngBounds(bounds);
                var center = circleBounds.getCenter();
                var radius = calculateRadius(circleBounds);

                map.setView(center, 13);
                marker = L.marker(center).addTo(map);
                circle = L.circle(center, {
                    radius: radius,
                    color: 'blue',
                    fillOpacity: 0.2
                }).addTo(map);
            }
        }
    }

    function setInteraction(interaction) {
        if (interaction) {
            eventDefinitionKey = interaction.eventDefinitionKey;
        }
    }

    function onRequestedTokens(tokens) {
        // Gestisci i token richiesti, se necessario
    }

    function onSave() {
        // Salva i dati dalla mappa
        var minLatitude = selectedMinLatitude;
        var maxLatitude = selectedMaxLatitude;
        var minLongitude = selectedMinLongitude;
        var maxLongitude = selectedMaxLongitude;

        payload['arguments'].execute.inArguments = [{
            "minLatitude": minLatitude,
            "maxLatitude": maxLatitude,
            "minLongitude": minLongitude,
            "maxLongitude": maxLongitude
        }];

        payload['metaData'].isConfigured = true;

        // Log per il debugging
        console.log('Payload salvato:', JSON.stringify(payload));

        connection.trigger('updateActivity', payload);
    }

    function calculateRadius(bounds) {
        var center = bounds.getCenter();
        var northEast = bounds.getNorthEast();
        var earthRadius = 6371000; // Raggio della Terra in metri

        var dLat = toRadians(northEast.lat - center.lat);
        var dLng = toRadians(northEast.lng - center.lng);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRadians(center.lat)) * Math.cos(toRadians(northEast.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c / 2; // Raggio approssimativo del cerchio
    }

    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
});
