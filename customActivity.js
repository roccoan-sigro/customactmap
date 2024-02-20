define(["js/postmonger"], function (Postmonger) {
  'use strict';

  var connection = new Postmonger.Session();

  var payload = {};

  $(window).ready(onRender);

  connection.on('initActivity', function (data) {
      if (data) {
          payload = data;
      }
  });

  connection.on('requestedTokens', function (data) {
      // Gli oggetti 'data' contengono i token richiesti
      var requestedTokens = data.requestedTokens;

      // Estrai i campi dalla Data Extension
      var subscriberKey = requestedTokens['SubscriberKey'];
      var emailAddress = requestedTokens['EmailAddress'];
      var phone = requestedTokens['Phone'];
      var personMailingAddress = requestedTokens['PersonMailingAddress'];

      // Verifica se PersonMailingAddress è una stringa JSON e parsifica
      var coordinates;
      try {
          coordinates = JSON.parse(personMailingAddress);
      } catch (error) {
          // Gestire eventuali errori nella conversione JSON
          console.error('Errore nella conversione JSON per PersonMailingAddress:', error);
          updateJourney(false); // Non è possibile ottenere le coordinate, quindi considera fuori range
          return;
      }

      // Ora puoi accedere alle coordinate specifiche
      var contactLatitude = coordinates.latitude;
      var contactLongitude = coordinates.longitude;

      // Usa i valori globali per latitudine e longitudine ottenuti da updateCircle
      var minLatitude = selectedMinLatitude;
      var maxLatitude = selectedMaxLatitude;
      var minLongitude = selectedMinLongitude;
      var maxLongitude = selectedMaxLongitude;

      // Confronto delle coordinate
      var isInRange =
          contactLatitude >= minLatitude &&
          contactLatitude <= maxLatitude &&
          contactLongitude >= minLongitude &&
          contactLongitude <= maxLongitude;

      // Invia i risultati alla funzione updateJourney
      updateJourney(isInRange);
  });

  function onRender() {
    // Inizializza l'interfaccia utente e aggiungi gli eventi
    // Gestisci gli eventi del tuo front-end qui
    // ...

    // Esempio di come invocare la funzione updateJourney
    // updateJourney(true); // o false a seconda della logica di confronto

    // Carica le configurazioni salvate
    connection.trigger('requestInteraction');
    connection.on('requestedInteraction', function (config) {
        // Verifica se ci sono configurazioni salvate
        if (config) {
            // Utilizza i valori salvati per ripristinare lo stato
            selectedMinLatitude = config.minLatitude;
            selectedMaxLatitude = config.maxLatitude;
            selectedMinLongitude = config.minLongitude;
            selectedMaxLongitude = config.maxLongitude;

            // Esegui l'aggiornamento sulla mappa o dove necessario
            // ...
        }
    });

    // Aggiungi un evento per gestire la chiusura dell'iframe
    connection.on('clickedNext', function () {
        // Salva le configurazioni prima di chiudere l'iframe
        connection.trigger('updateActivity', getActivityConfig());
        connection.trigger('nextStep');
    });
}

    // Funzione per ottenere le configurazioni dell'attività
    function getActivityConfig() {
        return {
            minLatitude: selectedMinLatitude,
            maxLatitude: selectedMaxLatitude,
            minLongitude: selectedMinLongitude,
            maxLongitude: selectedMaxLongitude
        };
    }


  function updateJourney(isInRange) {
      // Aggiorna il journey con i risultati del confronto
      var data = {
          metaData: {},
          name: payload.name || 'CustomActivity',
          type: payload.type || 'EVENT',
          outcomes: [
              {
                  key: 'inRange',
                  next: isInRange ? 'inRange' : 'outOfRange'
              }
          ],
          arguments: {},
          configurationArguments: payload.configurationArguments || {},
          iconUrl: 'url-to-your-icon.png'
      };

      connection.trigger('updateActivity', data);
  }

  return {};
});
