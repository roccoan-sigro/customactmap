define('customActivity', ['jquery', 'postmonger'], function ($, Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var eventDefinitionKey;

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
    }

    function setInteraction(interaction) {
        if (interaction) {
            eventDefinitionKey = interaction.eventDefinitionKey;
        }
    }

    function save() {
        // Use the selected coordinates from index.html
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

    return {
        initialize: initialize
    };
});
