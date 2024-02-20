define(["postmonger"], function(pm) {
  // Funzione principale invocata da Journey Builder
  const journeyStart = function(callback) {
    // Recupera i dati di configurazione e i dati di input
    const journeyActivitySettings = pm.settingsFor("currentActivity");
    const input = pm.inputData.get("inputData");

    // Estrai coordinate minime e massime dal front-end
    const selectedMinLatitude = input.selectedMinLatitude;
    const selectedMaxLatitude = input.selectedMaxLatitude;
    const selectedMinLongitude = input.selectedMinLongitude;
    const selectedMaxLongitude = input.selectedMaxLongitude;

    // Elabora i dati dell'entry source in batch
    pm.data.forAllInDataExtension(journeyActivitySettings.sourceDE, input, processRow, callback);
  };

  // Funzione per elaborare ogni riga della data extension
  const processRow = function(row, callback) {
    // Estrai coordinate dalla mail address JSON
    const physicalAddress = row.PhysicalEmailAddress;
    const addressObj = JSON.parse(physicalAddress);
    const latitude = addressObj.latitude;
    const longitude = addressObj.longitude;

    // Verifica se le coordinate rientrano nell'area selezionata
    const isWithinArea = isCoordinateWithinBounds(latitude, longitude, selectedMinLatitude, selectedMaxLatitude, selectedMinLongitude, selectedMaxLongitude);

    // Inserisci il contatto nel ramo appropriato del journey
    if (isWithinArea) {
      pm.journeyContinue("inArea");
    } else {
      pm.journeyContinue("excluded");
    }

    // Processo completato per questa riga
    callback();
  };

  // Funzione per verificare se le coordinate rientrano nell'area selezionata
  const isCoordinateWithinBounds = function(latitude, longitude, minLat, maxLat, minLon, maxLon) {
    return latitude >= minLat && latitude <= maxLat && longitude >= minLon && longitude <= maxLon;
  };

  // Registra la funzione con Postmonger
  pm.register("journeyStart", journeyStart);
});
