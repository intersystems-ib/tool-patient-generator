/*jshint strict:false */

(function() {
    'use strict';
    // this function is strict...
}());

// Setting up our app requirements

const fs = require('fs');
const express = require('express');
const functions = require('./functions.js');
const csv = require('csv-parser');
const app = express();
const Server = require('http').Server;
const server = new Server(app);
const path = require('path');
const port = 5000;
const WebSocketServer = require("websocket").server;
var format = require("string-template");
const { generateCIPA } = require('./functions.js');


var rows = [];
var patients = [];
var clinicians = [];
var allergies = [];
var facilities = [];
var diagnosis = [];
var resources = [];
var measures = [];
var analysis = [];
var bloodTypes = []

// Setting up our port
var ipIRIS = "localhost";
var portIRIS = 52774;
var namespaceIRIS = "HSPIDATA";
var userIRIS = "superuser";
var passwordIRIS = "SYS";

// const connection = irisNative.createConnection({host: ipIRIS, port: portIRIS, ns: namespaceIRIS, user: userIRIS, pwd: passwordIRIS});
// const irisNative = connection.createIris();

server.listen(port, () => console.log("Server at 5000"));

// Creamos el servidor de sockets y lo incorporamos al servidor de la aplicación
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});


// Configuiring simple express routes
// getDir() function is used here along with package.json.pkg.assets

app.use('/', express.static(getDir() + '/views'));

app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));

app.get('/', function(req, res) {
    res.sendFile(getDir() + '/views/index.html');
});

app.get('/download/patients', function(req, res) {
    if (fs.existsSync(getDir() + '/views/files/generated/patients.csv')) {
        res.download(getDir() + '/views/files/generated/patients.csv'); 
    }
    else {
        res.sendFile(getDir() + '/views/index.html');
    }
});

app.get('/download/messages', function(req, res) {
    if (fs.existsSync(getDir() + '/views/files/generated/messages'+req.query.type+'.txt')) {
        res.download(getDir() + '/views/files/generated/messages'+req.query.type+'.txt'); 
    }
    else {
        res.sendFile(getDir() + '/../views/index.html');
    }
});

app.get('/download/clinicians', function(req, res) {
    if (fs.existsSync(getDir() + '/views/files/generated/clinicians.csv')) {
        res.download(getDir() + '/views/files/generated/clinicians.csv'); 
    }
    else {
        res.sendFile(getDir() + '/views/index.html');
    }
});
    

// Using a function to set default app path
function getDir() {
    if (process.pkg) {
        return path.resolve(process.execPath + "/..");
    } else {
        return path.join(require.main ? require.main.path : process.cwd());
    }
}

wsServer.on("request", (request) =>{

    const connection = request.accept(null, request.origin);
    connection.on("message", (message) => {
        const dataRequest = JSON.parse(message.utf8Data);
        if (dataRequest.type === 'patients')
        {
            fs.createReadStream('./views/files/seed/personSeed.csv')
            .pipe(csv())
            .on('data', (row) => {
                rows.push(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                var patient = '';
                patient = 'Name,Surname1,Surname2,Gender,TypeStreet,Street,Number,Floor,Door,PostalCode,City,DOB,NHC1,NHC2,NHC3,NHC4,NHC5,NHC6,NHC7,NHC8,CIPA,CellPhone,NSS,MPI,SNS,DNI,Email,Region,Country\r\n';
                for (var i = 0; i < dataRequest.total; i++) {
                    const nameGenderIndex = Math.floor(Math.random() * rows.length);
                    const surname = rows[Math.floor(Math.random() * rows.length)].Surname.toUpperCase();
                    const name = rows[nameGenderIndex].Name.toUpperCase();
                    const row = name + ',' +
                        surname + ',' +
                        rows[Math.floor(Math.random() * rows.length)].Surname.toUpperCase() + ',' +
                        rows[nameGenderIndex].Gender.toUpperCase() + ',' +
                        rows[Math.floor(Math.random() * rows.length)].TypeStreet.toUpperCase() + ',' + 
                        rows[Math.floor(Math.random() * rows.length)].Name.toUpperCase() + ' ' + rows[Math.floor(Math.random() * rows.length)].Surname.toUpperCase() + ',' + //STREET
                        Math.floor(Math.random() * 400) + ',' +
                        rows[Math.floor(Math.random() * rows.length)].Floor.toUpperCase() + ',' + 
                        rows[Math.floor(Math.random() * rows.length)].Door.toUpperCase() + ',' + //DOOR
                        '28' + Math.floor(Math.random()*999).toString().padStart(3, '0') + ',' + //POSTALCODE
                        rows[Math.floor(Math.random() * rows.length)].City.toUpperCase() + ',' + //CITY
                        functions.parseDate(new Date(+(new Date()) - Math.floor(Math.random()*2500000000000)), 'dateType', false) + ',' + //DOB
                        functions.generateId(6) + ',' +  //NHC1
                        functions.generateId(6) + ',' +  //NHC2
                        functions.generateId(6) + ',' +  //NHC3
                        functions.generateId(6) + ',' +  //NHC4
                        functions.generateId(6) + ',' +  //NHC5
                        functions.generateId(6) + ',' +  //NHC6
                        functions.generateId(6) + ',' +  //NHC7
                        functions.generateId(6) + ',' +  //NHC8                    
                        '1'+ functions.generateId(9) +','+ //CIPA
                        '555' + Math.floor(Math.random() * 999999) + ',' + //CellPhone
                        Math.floor(Math.random() * 99) + '/' + Math.floor(Math.random() * 9999999999) + ',' + // NSS
                        Math.floor(Math.random() * 9999999) + ',' +  // MPI
                        'BBBBBBBBDR'+ Math.floor(Math.random() * 999999) + ',' + //SNS
                        functions.generateDNI(Math.floor(Math.random() * 99999999)).padStart(9,'0') + ',' + //NIF
                        name.replace(/\s/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "." + surname.normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@" + rows[Math.floor(Math.random() * rows.length)].Email.toUpperCase() + ',' + //EMAIL
                        rows[Math.floor(Math.random() * rows.length)].Region.toUpperCase() + ',' + //REGION
                        rows[Math.floor(Math.random() * rows.length)].Country.toUpperCase() +'\r\n'; //COUNTRY
                    patient += row;
                    connection.send(sendPatient(row));
                }
                fs.writeFileSync('./views/files/generated/patients.csv', patient, (err) => {
                    // throws an error, you could also catch it here
                    if (err)
                        throw err;
                });
                connection.send(checkFiles());
            });
        }        
        else if (dataRequest.type === 'clinicians') {
            fs.createReadStream('./views/files/seed/personSeed.csv')
                .pipe(csv())
                .on('data', (row) => {
                    rows.push(row);
                })
                .on('end', () => {
                    console.log('CSV file successfully processed');
                    var clinician = '';
                    clinician = 'Name,Surname1,Surname2,CIAS,User\r\n';
                    for (var i = 0; i < dataRequest.total; i++) {
                        clinician = clinician + 
                            rows[Math.floor(Math.random() * rows.length)].Name.toUpperCase() + ',' +
                            rows[Math.floor(Math.random() * rows.length)].Surname.toUpperCase() + ',' +
                            rows[Math.floor(Math.random() * rows.length)].Surname.toUpperCase() + ',' +
                            '0' + Math.floor(Math.random() * 999999999)+ String.fromCharCode(65+Math.floor(Math.random() * 26)) + ',' +
                            'user' + Math.floor(Math.random() * 999).toString().padStart( 2, '0') + '\r\n';
                    }
                    fs.writeFileSync('./views/files/generated/clinicians.csv', clinician, (err) => {
                        // throws an error, you could also catch it here
                        if (err)
                            throw err;
                    });
                    connection.send(checkFiles());
                });
        }
        else if (dataRequest.type === 'check')
        {
            connection.send(checkFiles());
        }
        else if (dataRequest.type === 'messages')
        {
            patients = [];
            clinicians = [];
            allergies = [];
            facilities = [];
            diagnosis = [];
            resources = [];
            measures = [];
            analysis = [];
            bloodTypes = []
            fs.createReadStream('./views/files/generated/patients.csv')
            .pipe(csv())
            .on('data', (row) => {
                patients.push(row);
            })
            .on('end', () => {
                fs.createReadStream('./views/files/generated/clinicians.csv')
                .pipe(csv())
                .on('data', (row) => {
                    clinicians.push(row);
                })
                .on('end', () => {
                    fs.createReadStream('./views/files/seed/allergies.csv')
                    .pipe(csv({
                        separator: ';'
                    }))
                    .on('data', (row) => {
                        allergies.push(row);
                    })
                    .on('end', () => {
                        fs.createReadStream('./views/files/seed/facilities.csv')
                        .pipe(csv())
                        .on('data', (row) => {
                            facilities.push(row);
                        })
                        .on('end', () => {
                            fs.createReadStream('./views/files/seed/diagnosis.csv')
                            .pipe(csv({
                                separator: ';'
                            }))
                            .on('data', (row) => {
                                diagnosis.push(row);
                            })
                            .on('end', () => {
                                fs.createReadStream('./views/files/seed/resources.csv')
                                .pipe(csv({
                                    separator: ';'
                                }))
                                .on('data', (row) => {
                                    resources.push(row);
                                })
                                .on('end', () => {
                                    fs.createReadStream('./views/files/seed/measures.csv')
                                    .pipe(csv())
                                    .on('data', (row) => {
                                        measures.push(row);
                                    })
                                    .on('end', () => {
                                        fs.createReadStream('./views/files/seed/analysis.csv')
                                        .pipe(csv())
                                        .on('data', (row) => {
                                            analysis.push(row);
                                        })
                                        .on('end', () => {
                                            fs.createReadStream('./views/files/seed/bloodTypes.csv')
                                            .pipe(csv())
                                            .on('data', (row) => {
                                                bloodTypes.push(row);
                                            })
                                            .on('end', () => {
                                                if (dataRequest.event === 'a28' && fs.existsSync('./views/files/generated/messagesa28.txt'))
                                                {
                                                    fs.rmSync('./views/files/generated/messagesa28.txt');                                                                        
                                                }
                                                else if (dataRequest.event === 's12' && fs.existsSync('./views/files/generated/messagess12.txt'))
                                                {
                                                    fs.rmSync('./views/files/generated/messagess12.txt');                                                                        
                                                }
                                                else if (dataRequest.event === 'r01' && fs.existsSync('./views/files/generated/messagesr01.txt'))
                                                {
                                                    fs.rmSync('./views/files/generated/messagesr01.txt');                                                                        
                                                } 
                                                else if (dataRequest.event === 'a08' && fs.existsSync('./views/files/generated/messagesa08.txt'))
                                                {
                                                    fs.rmSync('./views/files/generated/messagesa08.txt');                                                                        
                                                }                                           
                                                generateMessage(dataRequest.total, dataRequest.event, dataRequest.patIdAssigningFacility, dataRequest.patIdTypeIdentifier, dataRequest.assigningAuthority, dataRequest.patNHC, connection);    
                                                connection.send(checkFiles()); 
                                            });
                                        });  
                                    }); 
                                });
                            }); 
                        });
                    });
                });
            });
        return true;
        }
    });
    connection.on("close", (reasonCode, description) => {
        console.log("El cliente se desconectó");
    });
});

function checkFiles() {
    const filesChecked = {
        patients: fs.existsSync('./views/files/generated/patients.csv'),
        clinicians: fs.existsSync('./views/files/generated/clinicians.csv'),
        messages: fs.existsSync('./views/files/generated/messagesa28.txt') || fs.existsSync('./views/files/generated/messagess12.txt') || fs.existsSync('./views/files/generated/messagesr01.txt')
    }
    return JSON.stringify(filesChecked);
}

function sendMessage(message) {
    const messageJson = {
        message: true,
        messages: false,
        value: message
    }
    return JSON.stringify(messageJson);
}

function sendPatient(patient) {
    const messageJson = {
        patient: true,
        messages: false,
        value: patient
    }
    return JSON.stringify(messageJson);
}

function generateMessage(total, event, patIdAssigningFacility,patIdTypeIdentifier, assigningAuthority, patNHC, connection) {
    var patientIndex = 0;
    for (var i = 0; i < total; i++){
        patientIndex = i % patients.length;
        const dateTime = functions.parseDate(new Date(+(new Date())), 'dateTime', false);
        const datePoints = functions.parseDate(new Date(+(new Date())), 'date', true);
        const time = functions.parseDate(new Date(+(new Date())), 'time', false);
        const patient = patients[patientIndex];
        const randomPerson1 = patients[Math.floor(Math.random() * patients.length)];
        const randomPerson2 = patients[Math.floor(Math.random() * patients.length)];
        const sendingApp = "HIS";
        const receivingApp = "EMPI";
        const sendingFacility = assigningAuthority;
        const patIdFacility = patIdAssigningFacility;
        const typeIdentifier = patIdTypeIdentifier;
        const center1 = facilities[Math.floor(Math.random() * facilities.length)];
        const center2 = facilities[Math.floor(Math.random() * facilities.length)];
        const clinician1 = clinicians[Math.floor(Math.random() * clinicians.length)];
        const clinician2 = clinicians[Math.floor(Math.random() * clinicians.length)];
        const allergy = allergies[Math.floor(Math.random() * allergies.length)];
        const diag = diagnosis[Math.floor(Math.random() * diagnosis.length)];
        const resource = resources[Math.floor(Math.random() * resources.length)];
        const durationMillis = parseInt(resource.Duration) * 60 * 1000;
        const dateInPast = functions.parseDate(new Date(+(new Date()) + Math.floor(Math.random()*1000000000000)), 'dateTime', false);
        const dateStartAppointment = functions.parseDate(new Date(+(new Date()) + 15000000), 'dateTime', false);
        const dateEndAppointment = functions.parseDate(new Date(+(new Date()) + (15000000 + durationMillis)), 'dateTime', false);
        const allergySegment = Math.random() < 0.5 ? 0 : 1;
        const diagnosisSegment = Math.random() < 0.5 ? 0 : 1;
        const addSub = Math.random() < 0.5 ? 0 : 1;
        const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
        
        var NHC = patient.NHC1
        if (patNHC === '2') {
            NHC = patient.NHC2
        }
        else if (patNHC === '3') {
            NHC = patient.NHC3
        }
        else if (patNHC === '4') {
            NHC = patient.NHC4
        }
        else if (patNHC === '5') {
            NHC = patient.NHC5
        }
        else if (patNHC === '6') {
            NHC = patient.NHC6
        }
        else if (patNHC === '7') {
            NHC = patient.NHC7
        }
        else if (patNHC === '8') {
            NHC = patient.NHC8
        }

        var message = '';
        var template = ''

        var patientID = patient.CIPA

        if (typeIdentifier === 'NI') 
        {
            patientID = patient.DNI
        }
        if (event === 'a28')
        {
            template = fs.readFileSync((allergySegment && diagnosisSegment) ? './views/files/templates/A28/A28.template' : allergySegment ? './views/files/templates/A28/A28_NO_DG1.template' : 
            diagnosisSegment ? './views/files/templates/A28/A28_NO_AL1.template' : './views/files/templates/A28/A28_NO_AL1_DG1.template' , {encoding:'utf8', flag:'r'})

            message = format(template, {
                sendingApp: sendingApp,
                sendingFacility: sendingFacility, // HLUP
                receivingApplication: receivingApp,
                receivingFacility: center2.code,
                dateMessage: dateTime,
                messageId: Math.floor(Math.random() * 999999),
                patientId: patientID,
                patientIdIdentifier: typeIdentifier, //'SN','NI', 'SSN'
                assigningAuthority: patIdFacility, //"SERMAS",'MI','SEGSOC',...
                patientNHC: NHC,
                surname1: patient.Surname1,
                surname2: patient.Surname2,
                name: patient.Name,
                birthDate: patient.DOB.substring(0, 8),
                sex: patient.Gender,
                streetAddress: patient.TypeStreet +' '+ patient.Street,
                restAddress: patient.Number +' '+ patient.Floor +' '+ patient.Door,
                postalCode: patient.PostalCode,
                cityAddress: patient.City,
                region: patient.Region,
                country: patient.Country,
                cellPhone: patient.CellPhone,
                personalEmail: patient.Email,
                allergyType: allergySegment? allergy.type : '',
                allergyDescription: allergySegment? allergy.description : '',
                severityCode: allergySegment? allergy.severityCode : '',
                severityDescription: allergySegment? allergy.severityName : '',
                allergyDate: allergySegment? dateInPast : '',
                diagnosisCode: diagnosisSegment? diag.code : '',
                diagnosisLiteral: diagnosisSegment? diag.literal : '',
                diagnosisDate: diagnosisSegment? dateTime.substring(0,8) : '',
                clinicianSurname: diagnosisSegment? clinician1.Surname1 + ' ' + clinician1.Surname2 : '',
                clinicianName: diagnosisSegment? clinician1.Name : '',
                bloodType: bloodType.Type
            });
        }
        else if (event === 's12')
        {
            template = fs.readFileSync('./views/files/templates/S12/S12.template' , {encoding:'utf8', flag:'r'});
            message = format(template, {
                sendingApp: sendingApp,
                sendingFacility: sendingFacility, //'HULP'
                receivingApplication: receivingApp,
                receivingFacility: center2.code,
                dateMessage: dateTime,
                placerAppointmentId: Math.floor(Math.random() * 999999),
                fillerAppointmentId: Math.floor(Math.random() * 999999),
                resourceCode: resource.Code,
                resourceDescription: resource.Description,
                resourceExam: resource.Exam,
                resourceDuration: resource.Duration,
                dateStartAppointment: dateStartAppointment,
                dateEndAppointment: dateEndAppointment,
                fillerPersonSurname: randomPerson1.Surname1 + ' ' + randomPerson1.Surname2,
                fillerPersonName: randomPerson1.Name,
                enterPersonSurname: randomPerson2.Surname1 + ' ' + randomPerson2.Surname2,
                enterPersonName: randomPerson2.Name,
                messageId: Math.floor(Math.random() * 999999),
                patientId: patientID,
                patientIdIdentifier: typeIdentifier, //'NI'
                assigningAuthority: patIdFacility, // 'MI'
                patientNHC: NHC,
                surname1: patient.Surname1,
                surname2: patient.Surname2,
                name: patient.Name,
                birthDate: patient.DOB.substring(0, 8),
                sex: patient.Gender,
                streetAddress: patient.TypeStreet +' '+ patient.Street,
                restAddress: patient.Number +' '+ patient.Floor +' '+ patient.Door,
                postalCode: patient.PostalCode,
                cityAddress: patient.City,
                region: patient.Region,
                country: patient.Country,
                cellPhone: patient.CellPhone,
                personalEmail: patient.Email,
            });

        }
        else if (event === 'r01')
        {
            message = '';
            // PARA CREAR UNA SERIE DE LECTURAS HACEMOS UN BUCLE PARA REPRESENTAR 10 TOMAS EN 10 DÍAS
            template = fs.readFileSync('./views/files/templates/R01/R01.template' , {encoding:'utf8', flag:'r'});
            var templateSegment = fs.readFileSync('./views/files/templates/R01/OBX_segment.template' , {encoding:'utf8', flag:'r'});
            
            message += format(template, {
                sendingApp: sendingApp,
                sendingFacility: sendingFacility, //'HULP'
                receivingApplication: receivingApp,
                receivingFacility: center2.code,
                dateMessage: dateTime,
                messageId: Math.floor(Math.random() * 999999),
                patientId: patientID,
                patientIdIdentifier: typeIdentifier, //'NI'
                assigningAuthority: patIdFacility, // 'MI'
                patientNHC: NHC,
                surname1: patient.Surname1,
                surname2: patient.Surname2,
                name: patient.Name,
                birthDate: patient.DOB.substring(0, 8),
                sex: patient.Gender,
                streetAddress: patient.TypeStreet +' '+ patient.Street,
                restAddress: patient.Number +' '+ patient.Floor +' '+ patient.Door,
                postalCode: patient.PostalCode,
                cityAddress: patient.City,
                region: patient.Region,
                country: patient.Country,
                cellPhone: patient.CellPhone,
                personalEmail: patient.Email,
                orderingDoctorCias: clinician1.CIAS,
                orderingDoctorSurname1: clinician1.Surname1,
                orderingDoctorSurname2: clinician1.Surname2,
                orderingDoctorName: clinician1.Name,
                attendingDoctorCias: clinician2.CIAS,
                attendingDoctorSurname1: clinician2.Surname1,
                attendingDoctorSurname2: clinician2.Surname2,
                attendingDoctorName: clinician2.Name,
                orderRequest: Math.floor(Math.random() * 999999),
                visitId: Math.floor(Math.random() * 999999),
                fillerRequest: Math.floor(Math.random() * 999999),
                sendingFacilityName: center1.Name,
            });
            for (var j = 0; j < analysis.length; j++){                    
                var segment = format(templateSegment, {
                    id: j+1,
                    measureId: analysis[j].Code,
                    measureLabel: analysis[j].Label,
                    measureValue: Math.floor(parseFloat(analysis[j].Middle) + (Math.random() < 0.5 ? - Math.random() : Math.random()) * parseInt(analysis[j].Random)).toFixed(parseInt(analysis[j].Decimals)),
                    measureUnits: analysis[j].Units,
                    measureRange: analysis[j].Range,
                    dateMeasure: dateTime
                });
                message += segment + '\r\n';
            }            
        }
        else if (event === 'a08')
        {
            message = '';
            // PARA CREAR UNA SERIE DE LECTURAS HACEMOS UN BUCLE PARA REPRESENTAR 10 TOMAS EN 10 DÍAS
            template = fs.readFileSync('./views/files/templates/A08/A08.template' , {encoding:'utf8', flag:'r'});
            var templateSegment = fs.readFileSync('./views/files/templates/A08/OBX_segment.template' , {encoding:'utf8', flag:'r'});
            for (var day = 0; day < 10; day++)
            {
                var dateMeasure = functions.parseDate(new Date(+(new Date()) - (86400000 * day)), 'dateTime', false);                
                message += format(template, {
                    sendingApp: sendingApp,
                    sendingFacility: sendingFacility, //'HULP'
                    receivingApplication: receivingApp,
                    receivingFacility: center2.code,
                    dateMessage: dateMeasure,
                    messageId: Math.floor(Math.random() * 999999),
                    patientId: patientID,
                    patientIdIdentifier: typeIdentifier, //'NI'
                    assigningAuthority: patIdFacility, // 'MI'
                    patientNHC: NHC,
                    surname1: patient.Surname1,
                    surname2: patient.Surname2,
                    name: patient.Name,
                    birthDate: patient.DOB.substring(0, 8),
                    sex: patient.Gender,
                    streetAddress: patient.TypeStreet +' '+ patient.Street,
                    restAddress: patient.Number +' '+ patient.Floor +' '+ patient.Door,
                    postalCode: patient.PostalCode,
                    cityAddress: patient.City,
                    region: patient.Region,
                    country: patient.Country,
                    cellPhone: patient.CellPhone,
                    personalEmail: patient.Email,
                    orderingDoctorCias: clinician1.CIAS,
                    orderingDoctorSurname1: clinician1.Surname1,
                    orderingDoctorSurname2: clinician1.Surname2,
                    orderingDoctorName: clinician1.Name,
                    orderRequest: Math.floor(Math.random() * 999999),
                    fillerRequest: Math.floor(Math.random() * 999999),
                    sendingFacilityName: center1.Name,
                });
                message += '\r\n';             
                for (var k = 0; k < measures.length; k++){  
                    var segment = format(templateSegment, {
                        id: k+1,
                        measureId: measures[k].Code,
                        measureLabel: measures[k].Label,
                        measureValue: Math.floor(parseInt(measures[k].Value) + (addSub === 0? - Math.random() : Math.random()) * parseInt(measures[k].Range), 100),
                        measureUnits: measures[k].Units,
                        dateMeasure: dateMeasure
                    });
                    message += segment + '\r\n';
                }
                message += '\r\n\r\n'
            }   
        }   
        connection.send(sendMessage(message));        
        message += '\r\n\r\n';
        fs.appendFileSync('./views/files/generated/messages'+event+'.txt', message);
    }
    return true;
}
