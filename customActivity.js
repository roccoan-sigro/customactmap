define('customActivity', ['jquery', 'postmonger'], function ($, Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var eventDefinitionKey = null;
    var coordinates = {};
    var selectedAddress = '';
    var selectedRadius = 0;
    var consentFilter = true;

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

            consentFilter = inArguments.consentFilter !== undefined ? inArguments.consentFilter : true;
            $('#consentCheckbox').prop('checked', consentFilter);

            initializeMap(function (addMarkerAndCircle) {
                addMarkerAndCircle([centerLat, centerLng], 50);
            });
        }

        $('#consentCheckbox').on('change', function() {
            consentFilter = this.checked;
        });
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
            "consentFilter": consentFilter,
            "Consenso": "{{Contact.Attribute.LongitudineLatitudine.Consenso}}"
        }];

        payload['metaData'].isConfigured = true;

        var consentLabel = consentFilter ? " (solo con consenso)" : "";
        payload['outcomes'][0].metaData.label = `${selectedAddress}, ${selectedRadius}m${consentLabel}`;

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

    function initializeMap(callback) {
        var state = loadMapState();
        if (state && typeof callback === 'function') {
            callback(function (latlng, radius) {
                if (window.addMarkerAndCircle) {
                    window.addMarkerAndCircle(latlng, radius);
                    consentCheckbox.checked = state.consentFilter;
                }
            });
        }
    }

    function saveMapState(latlng, radius, consentFilter) {
        const mapState = {
            lat: latlng.lat,
            lng: latlng.lng,
            radius: radius,
            consentFilter: consentFilter
        };
        localStorage.setItem('mapState', JSON.stringify(mapState));
    }

    function loadMapState() {
        const mapState = localStorage.getItem('mapState');
        if (mapState) {
            return JSON.parse(mapState);
        }
        return null;
    }

    return {
        initialize: initialize,
        save: save,
        updateCoordinates: updateCoordinates,
        updateAddressAndRadius: updateAddressAndRadius,
        initializeMap: initializeMap
    };
});
