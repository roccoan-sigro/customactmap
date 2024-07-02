define('customActivity', ['jquery', 'postmonger'], function ($, Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var eventDefinitionKey = null;
    var coordinates = {};
    var selectedAddress = '';
    var selectedRadius = 0;
    var consentStatus = true;  // Stato di default della checkbox

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

            var centerLat = (parseFloat(coordinates.minLatitude) + parseFloat(coordinates.maxLatitude)) / 2;
            var centerLng = (parseFloat(coordinates.minLongitude) + parseFloat(coordinates.maxLongitude)) / 2;

            initializeMap(function (addMarkerAndCircle) {
                addMarkerAndCircle([centerLat, centerLng], 50);
            });

            // Imposta lo stato della checkbox se già presente nei dati
            if (typeof inArguments.consentStatus !== 'undefined') {
                consentStatus = inArguments.consentStatus;
                $('#consentCheckbox').prop('checked', consentStatus);
            }
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
            "EmailAddress": "{{InteractionDefaults.Email}}",
            "consentStatus": consentStatus
        }];

        payload['metaData'].isConfigured = true;

        // Aggiorna l'etichetta del primo ramo
        payload['outcomes'][0].metaData.label = `${selectedAddress}, ${selectedRadius}m`;

        console.log('Saving payload:', JSON.stringify(payload, null, 2));
        connection.trigger('updateActivity', payload);
    }

    function updateCoordinates(newCoordinates) {
        console.log('New coordinates updated:', newCoordinates);
        coordinates = newCoordinates;
    }

    function updateAddressAndRadius(address, radius) {
        selectedAddress = address;
        selectedRadius = radius;
    }

    function updateConsentStatus(status) {
        consentStatus = status;
        console.log('Consent status updated:', consentStatus);
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
        updateAddressAndRadius: updateAddressAndRadius,
        updateConsentStatus: updateConsentStatus,
        initializeMap: initializeMap
    };
});
