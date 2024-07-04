define('customActivity', ['jquery', 'postmonger'], function ($, Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var eventDefinitionKey = null;
    var coordinates = {};
    var selectedAddress = '';
    var selectedRadius = 50;
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

        var state = loadMapState();
        if (state) {
            coordinates = {
                minLatitude: state.lat - (state.radius / 111111),
                maxLatitude: state.lat + (state.radius / 111111),
                minLongitude: state.lng - (state.radius / (111111 * Math.cos(state.lat * Math.PI / 180))),
                maxLongitude: state.lng + (state.radius / (111111 * Math.cos(state.lat * Math.PI / 180))),
                Latitudine: state.lat,
                Longitudine: state.lng
            };
            selectedRadius = state.radius;
            consentFilter = state.consentFilter;
            $('#consentCheckbox').prop('checked', consentFilter);
            $('#radiusSlider').val(selectedRadius);
            $('#radiusInput').val(selectedRadius);
        } else if (payload['arguments'] && 
                   payload['arguments'].execute && 
                   payload['arguments'].execute.inArguments && 
                   payload['arguments'].execute.inArguments.length > 0) {
            var inArguments = payload['arguments'].execute.inArguments[0];
            coordinates = {
                minLatitude: inArguments.minLatitude,
                maxLatitude: inArguments.maxLatitude,
                minLongitude: inArguments.minLongitude,
                maxLongitude: inArguments.maxLongitude,
                Latitudine: inArguments.Latitudine,
                Longitudine: inArguments.Longitudine
            };
            selectedRadius = inArguments.selectedRadius || 50;
            consentFilter = inArguments.consentFilter !== undefined ? inArguments.consentFilter : true;
            $('#consentCheckbox').prop('checked', consentFilter);
            $('#radiusSlider').val(selectedRadius);
            $('#radiusInput').val(selectedRadius);
        }

        initializeMap(function (addMarkerAndCircle) {
            if (state) {
                addMarkerAndCircle([state.lat, state.lng], state.radius);
            } else if (coordinates.Latitudine && coordinates.Longitudine) {
                addMarkerAndCircle([coordinates.Latitudine, coordinates.Longitudine], selectedRadius);
            }
        });

        $('#consentCheckbox').on('change', function() {
            consentFilter = this.checked;
            saveMapState();
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
            "Consenso": "{{Contact.Attribute.LongitudineLatitudine.Consenso}}",
            "selectedRadius": selectedRadius
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
        saveMapState();
    }

    function updateAddressAndRadius(address, radius) {
        selectedAddress = address;
        selectedRadius = radius;
        saveMapState();
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

    function saveMapState() {
        if (!coordinates.Latitudine || !coordinates.Longitudine) return;
        
        const mapState = {
            lat: coordinates.Latitudine,
            lng: coordinates.Longitudine,
            radius: selectedRadius,
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
        initializeMap: initializeMap,
        saveMapState: saveMapState,
        loadMapState: loadMapState
    };
});
