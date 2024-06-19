define([
    'jquery',
    'postmonger'
], function($, Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var minLatitude, maxLatitude, minLongitude, maxLongitude;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);

    function onRender() {
        // Initialize your activity here
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }

        // Recupera i dati di configurazione iniziali se disponibili
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : [];

        $.each(inArguments, function(index, inArgument) {
            if (inArgument.minLatitude) {
                minLatitude = inArgument.minLatitude;
            }
            if (inArgument.maxLatitude) {
                maxLatitude = inArgument.maxLatitude;
            }
            if (inArgument.minLongitude) {
                minLongitude = inArgument.minLongitude;
            }
            if (inArgument.maxLongitude) {
                maxLongitude = inArgument.maxLongitude;
            }
        });
        
        // Aggiorna la UI con i dati di configurazione
        $('#minLatitude').val(minLatitude);
        $('#maxLatitude').val(maxLatitude);
        $('#minLongitude').val(minLongitude);
        $('#maxLongitude').val(maxLongitude);
    }

    function save() {
        // Recupera i dati dall'input dell'utente
        minLatitude = $('#minLatitude').val();
        maxLatitude = $('#maxLatitude').val();
        minLongitude = $('#minLongitude').val();
        maxLongitude = $('#maxLongitude').val();

        // Aggiungi i dati al payload
        payload['arguments'].execute.inArguments = [
            { "minLatitude": minLatitude },
            { "maxLatitude": maxLatitude },
            { "minLongitude": minLongitude },
            { "maxLongitude": maxLongitude }
        ];

        payload.metaData.isConfigured = true;

        connection.trigger('updateActivity', payload);
    }
});
