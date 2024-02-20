define(['postmonger'], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};

    $(window).ready(onRender);

    connection.on('requestedTokens', onRequestedTokens);
    connection.on('requestedEndpoints', onRequestedEndpoints);
    connection.on('requestedSchema', onRequestedSchema);
    connection.on('requestedCulture', onRequestedCulture);
    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);

    function onRender() {
        // Fetch the data from the page and populate the payload
        payload.latitudeMin = parseFloat(getQueryParam('minLatitude'));
        payload.latitudeMax = parseFloat(getQueryParam('maxLatitude'));
        payload.longitudeMin = parseFloat(getQueryParam('minLongitude'));
        payload.longitudeMax = parseFloat(getQueryParam('maxLongitude'));

        // Trigger the 'ready' event when rendering is complete
        connection.trigger('ready');
    }

    function onRequestedTokens(tokens) {
        // Handling requested tokens
        // Add logic to handle tokens if needed
        connection.trigger('requestedTokens', tokens);
    }

    function onRequestedEndpoints(endpoints) {
        // Handling requested endpoints
        // Add logic to handle endpoints if needed
        connection.trigger('requestedEndpoints', endpoints);
    }

    function onRequestedSchema(schema) {
        // Handling requested schema
        // Add logic to handle schema if needed
        connection.trigger('requestedSchema', schema);
    }

    function onRequestedCulture(culture) {
        // Handling requested culture
        // Add logic to handle culture if needed
        connection.trigger('requestedCulture', culture);
    }

    function initialize(data) {
        // Handling initialization
        // Add logic to handle initialization if needed
        if (data) {
            payload = data;
        }
        connection.trigger('initActivity', payload);
    }

    function save() {
        // Handling the 'Next' button click

        // Assuming your DE fields are named 'latitude' and 'longitude'
        var latitude = parseFloat('{{Contact.Attribute.PhysicalEmailAddress.latitude}}');
        var longitude = parseFloat('{{Contact.Attribute.PhysicalEmailAddress.longitude}}');

        // Check if the contact's coordinates fall within the selected range
        if (
            latitude >= payload.latitudeMin &&
            latitude <= payload.latitudeMax &&
            longitude >= payload.longitudeMin &&
            longitude <= payload.longitudeMax
        ) {
            // Contact falls within the selected range, proceed with the first branch of the journey
            connection.trigger('nextStep');
        } else {
            // Contact does not fall within the selected range, proceed with the second branch of the journey
            connection.trigger('gotoStep', 2); // Assuming second step index is 2
        }
    }

    // Utility function to get query parameters from the URL
    function getQueryParam(param) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
});
