define('customActivity', ['jquery', 'postmonger'], function ($, Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var eventDefinitionKey = null;
    var coordinates = {};
    var selectedAddress = '';
    var selectedRadius = 50;
    var consentFilter = true;
    var estimatedRecordCount = 0;

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
            selectedAddress = state.address || '';
            estimatedRecordCount = state.estimatedRecordCount || 0;

            $('#consentCheckbox').prop('checked', consentFilter);
            $('#radiusSlider').val(selectedRadius);
            $('#radiusInput').val(selectedRadius);
            $('#address').text('Indirizzo: ' + selectedAddress);
            $('#recordCount').text(estimatedRecordCount);

            if (typeof window.addMarkerAndCircle === 'function') {
                window.addMarkerAndCircle([state.lat, state.lng], state.radius);
            }
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
            selectedAddress = inArguments.selectedAddress || '';
            estimatedRecordCount = inArguments.estimatedRecordCount || 0;

            $('#consentCheckbox').prop('checked', consentFilter);
            $('#radiusSlider').val(selectedRadius);
            $('#radiusInput').val(selectedRadius);
            $('#address').text('Indirizzo: ' + selectedAddress);
            $('#recordCount').text(estimatedRecordCount);

            if (typeof window.addMarkerAndCircle === 'function' && coordinates.Latitudine && coordinates.Longitudine) {
                window.addMarkerAndCircle([coordinates.Latitudine, coordinates.Longitudine], selectedRadius);
            }
        }

        // Aggiungi listener per la checkbox del consenso
        $('#consentCheckbox').on('change', function() {
            consentFilter = this.checked;
            saveMapState();
            updateEstimatedRecordCount();
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
            "selectedRadius": selectedRadius,
            "selectedAddress": selectedAddress,
            "estimatedRecordCount": estimatedRecordCount
        }];

        payload['metaData'].isConfigured = true;

        var consentLabel = consentFilter ? " (solo con consenso)" : "";
        payload['outcomes'][0].metaData.label = `${selectedAddress}, ${selectedRadius}m${consentLabel}, ${estimatedRecordCount} record stimati`;

        console.log('Saving payload:', JSON.stringify(payload, null, 2));
        connection.trigger('updateActivity', payload);
    }

    function updateCoordinates(newCoordinates) {
        console.log('New coordinates updated:', newCoordinates);
        coordinates = newCoordinates;
        saveMapState();
        updateEstimatedRecordCount();
    }

    function updateAddressAndRadius(address, radius) {
        selectedAddress = address;
        selectedRadius = radius;
        saveMapState();
        updateEstimatedRecordCount();
    }

    function updateEstimatedRecordCount() {
        // Implementa la logica per aggiornare il conteggio stimato dei record
        // Questo è un esempio, dovrai adattarlo alla tua logica effettiva
        if (typeof window.countRecords === 'function') {
            window.countRecords(
                coordinates.minLatitude,
                coordinates.maxLatitude,
                coordinates.minLongitude,
                coordinates.maxLongitude,
                function(count) {
                    estimatedRecordCount = count;
                    $('#recordCount').text(count);
                    saveMapState();
                }
            );
        }
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
            consentFilter: consentFilter,
            address: selectedAddress,
            estimatedRecordCount: estimatedRecordCount
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
