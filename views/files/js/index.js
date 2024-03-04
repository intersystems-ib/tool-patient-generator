function downloadPatients()
{
    window.location = 'http://localhost:5000/download/patients'
}

function downloadMessages()
{
    window.location = 'http://localhost:5000/download/messages?type='+$('#typeEvent').val();
}

function downloadClinicians()
{
    window.location = 'http://localhost:5000/download/clinicians'
}

function sendGenerationRequest(type){
    var total = 1;
    var event = '';
    var patIdAssigningFacility = '';
    var patIdTypeIdentifier = '';
    var assigningAuthority = '';
    var patNHC = '';

    if (type === 'patients')
    {
        total = $('#numPatients').val();        
    }
    else if (type === 'clinicians')
    {
        total = $('#numClinicians').val();
    }
    else if (type === 'messages')
    {
        total = $('#numMessages').val();
        event = $('#typeEvent').val();
        assigningAuthority = $('#assigningAuthority').val();
        patIdAssigningFacility = $('#patIdAssigningFacility').val();
        patIdTypeIdentifier = $('#patIdTypeIdentifier').val();
        patNHC = $('#patNHC').val();
    }

    const infoRequest = {
        type: type,
        total: total,
        event: event,
        patIdAssigningFacility: patIdAssigningFacility,
        patIdTypeIdentifier: patIdTypeIdentifier,
        assigningAuthority: assigningAuthority,
        patNHC: patNHC
    };

    websocket.send(JSON.stringify(infoRequest));
}

function init() {
    wsConnect();
}

function wsConnect() {
    websocket = new WebSocket("ws://localhost:5000");

    websocket.onopen = function (evt) {
        onOpen(evt)
    };
    websocket.onclose = function (evt) {
        onClose(evt)
    };
    websocket.onmessage = function (evt) {
        onMessage(evt)
    };
    websocket.onerror = function (evt) {
        onError(evt)
    };
}

// Se ejecuta cuando se establece la conexión Websocket con el servidor
function onOpen(evt) {

    const infoRequest = {
        type: 'check',
        total: 0
    };

    websocket.send(JSON.stringify(infoRequest));
}

// Se ejecuta cuando la conexión con el servidor se cierra
function onClose(evt) {

    // Deshabilitamos el boton
    // Intenta reconectarse cada 2 segundos
    setTimeout(function () {
        wsConnect()
    }, 2000);
}

// Se invoca cuando se recibe un mensaje del servidor
function onMessage(evt) {
    const fileStatus = JSON.parse(evt.data);
    if (fileStatus.message) {
        $('#console').append('<pre class=\"text-light text-left cursor mb-0\" style=\"overflow:hidden;\">' + fileStatus.value + '</pre><br/>')
        $('#console').scrollTop($('#console').prop("scrollHeight"));
        $('#generateMessagesButton').attr('disabled',false);
    }
    else {
        $('#downloadMessagesButton').attr('disabled', 'true');
    }

    if (fileStatus.patient) {
        $('#console').append('<pre class=\"text-light text-left cursor mb-0\" style=\"overflow:hidden;\">' + fileStatus.value + '</pre><br/>')
        $('#console').scrollTop($('#console').prop("scrollHeight"));
    }

    if (fileStatus.patients) {
        $('#downloadPatientsButton').removeAttr('disabled');        
    }
    else {
        $('#downloadPatientsButton').attr('disabled', 'true');
    }
    if (fileStatus.messages) {
        $('#downloadMessagesButton').removeAttr('disabled');   
        $('#generatePatientsButton').removeAttr('disabled');     
    }
    else {
        $('#downloadMessagesButton').attr('disabled', 'true');
    }
    if (fileStatus.clinicians) {
        $('#downloadCliniciansButton').removeAttr('disabled');        
    }
    else {
        $('#downloadCliniciansButton').attr('disabled', 'true');
    }
}

// Se invoca cuando se presenta un error en el WebSocket
function onError(evt) {
    console.log("ERROR: " + evt.data);
}

// Envía un mensaje al servidor (y se imprime en la consola)
function doSend(message) {
    console.log("Enviando: " + message);
    websocket.send(message);
}

$(document).ready(function() {
    $('#generateMessagesButton').click(function()
    {
        sendGenerationRequest("messages");
        $(this).attr('disabled', 'true');
        $('#console').empty();
    });

    $('#generatePatientsButton').click(function()
    {
        sendGenerationRequest("patients");
        $(this).attr('disabled', 'true');
        $('#console').empty();
    });

    $('#generateCliniciansButton').click(function()
    {
        sendGenerationRequest("clinicians");
        $(this).attr('disabled', 'true');
        $('#console').empty();
    });
    
    $('#downloadMessagesButton').click(function()
    {
        downloadMessages();
    });

    $('#downloadPatientsButton').click(function()
    {
        downloadPatients();
    });
    $('#downloadCliniciansButton').click(function()
    {
        downloadClinicians();
    });
});

window.addEventListener("load", init, false);