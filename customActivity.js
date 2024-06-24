define('customActivity', ['jquery', 'postmonger'], function ($, Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var eventDefinitionKey;
    var coordinates = {};

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedInteraction', setInteraction);
    connection.on('clickedNext', save);

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

        if (hasInArguments) {
            var inArguments = payload['arguments'].execute.inArguments[0];
            coordinates = {
                minLatitude: inArguments.minLatitude,
                maxLatitude: inArguments.maxLatitude,
                minLongitude: inArguments.minLongitude,
                maxLongitude: inArguments.maxLongitude,
                userLatitude: inArguments.Latitudine,
                userLongitude: inArguments.Longitudine
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

    function setInteraction(interaction) {
        if (interaction) {
            eventDefinitionKey = interaction.eventDefinitionKey;
        }
    }

    function save() {
        var minLatitude = coordinates.minLatitude;
        var maxLatitude = coordinates.maxLatitude;
        var minLongitude = coordinates.minLongitude;
        var maxLongitude = coordinates.maxLongitude;
        var userLatitude = coordinates.userLatitude;
        var userLongitude = coordinates.userLongitude;

        payload['arguments'].execute.inArguments = [{
            "minLatitude": minLatitude,
            "maxLatitude": maxLatitude,
            "minLongitude": minLongitude,
            "maxLongitude": maxLongitude,
            "userLatitude": "{{Contact.Attribute.LongitudineLatitudine.Latitudine}}",
            "userLongitude": "{{Contact.Attribute.LongitudineLatitudine.Longitudine}}",
            "SubscriberKey": "{{Contact.Key}}",
            "EmailAddress": "{{InteractionDefaults.Email}}"
        }];

        payload['metaData'].isConfigured = true;

        console.log('Salvataggio payload:', payload);
        connection.trigger('updateActivity', payload);
    }

    function updateCoordinates(newCoordinates) {
        console.log('Nuove coordinate aggiornate:', newCoordinates);
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
