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

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        // Initialize your form fields here with inArguments values, if necessary
        // Carica la selezione salvata
        loadSelection(inArguments);
    }

    function setInteraction(interaction) {
        if (interaction) {
            eventDefinitionKey = interaction.eventDefinitionKey;
        }
    }

    function save() {
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

        connection.trigger('updateActivity', payload);
    }

    function loadSelection(inArguments) {
        var selection = inArguments.find(arg => arg.minLatitude && arg.maxLatitude && arg.minLongitude && arg.maxLongitude);
        if (selection) {
            selectedMinLatitude = selection.minLatitude;
            selectedMaxLatitude = selection.maxLatitude;
            selectedMinLongitude = selection.minLongitude;
            selectedMaxLongitude = selection.maxLongitude;

            // Aggiorna la mappa con la selezione salvata
            var lat = (parseFloat(selectedMinLatitude) + parseFloat(selectedMaxLatitude)) / 2;
            var lng = (parseFloat(selectedMinLongitude) + parseFloat(selectedMaxLongitude)) / 2;
            var radius = calculateRadius(selectedMinLatitude, selectedMaxLatitude, selectedMinLongitude, selectedMaxLongitude);

            marker = L.marker([lat, lng]).addTo(map);
            radiusSlider.value = radius;
            radiusInput.value = radius;
            updateCircle(radius);
        }
    }

    function calculateRadius(minLat, maxLat, minLng, maxLng) {
        var earthRadius = 6371000; // in meters
        var dLat = toRadians(maxLat - minLat);
        var dLng = toRadians(maxLng - minLng);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRadians(minLat)) * Math.cos(toRadians(maxLat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c / 2; // raggio approssimativo del cerchio
    }

    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
});
