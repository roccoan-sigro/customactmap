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
                maxLongitude: inArguments.maxLongitude
            };

            // Calcolare il centro e il raggio della selezione per ripristinare la mappa
            var centerLat = (parseFloat(coordinates.minLatitude) + parseFloat(coordinates.maxLatitude)) / 2;
            var centerLng = (parseFloat(coordinates.minLongitude) + parseFloat(coordinates.maxLongitude)) / 2;
            var radius = calculateRadius(coordinates);

            // Inizializzare la mappa con la selezione salvata
            initializeMap(function (addMarkerAndCircle) {
                addMarkerAndCircle([centerLat, centerLng], radius);
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

        payload['arguments'].execute.inArguments = [{
            "minLatitude": minLatitude,
            "maxLatitude": maxLatitude,
            "minLongitude": minLongitude,
            "maxLongitude": maxLongitude
        }];

        payload['metaData'].isConfigured = true;

        connection.trigger('updateActivity', payload);
    }

    function updateCoordinates(newCoordinates) {
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

    function calculateRadius(coords) {
        var latDiff = parseFloat(coords.maxLatitude) - parseFloat(coords.minLatitude);
        var lngDiff = parseFloat(coords.maxLongitude) - parseFloat(coords.minLongitude);
        var avgLat = (parseFloat(coords.maxLatitude) + parseFloat(coords.minLatitude)) / 2;

        var latRadius = (latDiff * 111139); // Convert degrees to meters (approx)
        var lngRadius = (lngDiff * 111139 * Math.cos(avgLat * (Math.PI / 180))); // Adjust for latitude

        return Math.max(latRadius, lngRadius) / 2; // Return the average radius
    }

    return {
        initialize: initialize,
        save: save,
        updateCoordinates: updateCoordinates,
        initializeMap: initializeMap
    };
});
