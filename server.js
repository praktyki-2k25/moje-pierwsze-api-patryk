// server.js - Prosty serwer API w Node.js
// Autor: Patryk Szczotka
// Data: 04.09.2025
 
const http = require('http');
const url = require('url');

// === NOWE IMPORTY DLA BAZY DANYCH ===
const { initializeDB } = require('./database');

// Zmienna globalna dla bazy danych
let db = null;

// Funkcja pomocnicza do parsowania body
function parseBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', chunk => body += chunk.toString());
        request.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
    });
}
 
// Konfiguracja serwera
const PORT = 3000;
const HOST = 'localhost';
 
// Funkcja obsługująca requesty
const requestHandler = async (request, response) => {
    // Parsowanie URL i pobranie ścieżki
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;
    const method = request.method;
 
    // Ustawienie nagłówków CORS (aby można było testować z przeglądarki)
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Content-Type', 'application/json');
 
    // Logowanie requestów
    console.log(`[${new Date().toISOString()}] ${method} ${path}`);
 
    // ZADANIE 1: Podstawowy endpoint
    if (path === '/' && method === 'GET') {
        response.statusCode = 200;
        response.end(JSON.stringify({
            message: "Hello World!",
            timestamp: new Date().toISOString(),
            author: "[Twoje imię]" // <- Zmień na swoje imię
        }));
    }
 
    // ZADANIE 2: Endpoint "about"
    else if (path === '/about' && method === 'GET') {
        response.statusCode = 200;
        response.end(JSON.stringify({
            name: "Patryk Szczotka", // <- Uzupełnij
            role: "Praktykant",
            company: "praktyki", // <- Uzupełnij
            learningGoals: [
                "Nauczyć się REST API",
                "Poznać Node.js",
                "Opanować Postman"
            ]
        }));
    }
 
    // ZADANIE 3: Endpoint z aktualnym czasem
    else if (path === '/time' && method === 'GET') {
        const now = new Date();
        response.statusCode = 200;
        response.end(JSON.stringify({
            currentTime: now.toTimeString(),
            currentDate: now.toDateString(),
            timestamp: now.getTime(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }));
    }
 
    // ZADANIE 4: Endpoint z parametrami query
    else if (path === '/greeting' && method === 'GET') {
        const name = parsedUrl.query.name || 'Nieznajomy';
        const lang = parsedUrl.query.lang || 'pl';
 
        const greetings = {
            'pl': `Cześć ${name}! Miło Cię poznać!`,
            'en': `Hello ${name}! Nice to meet you!`,
            'es': `¡Hola ${name}! ¡Encantado de conocerte!`,
            'de': `Hallo ${name}! Schön dich kennenzulernen!`
        };
 
        response.statusCode = 200;
        response.end(JSON.stringify({
            greeting: greetings[lang] || greetings['pl'],
            language: lang,
            name: name
        }));
    }
 
    // ZADANIE 5: Prosty licznik odwiedzin
    else if (path === '/counter' && method === 'GET') {
        // Uwaga: Ten licznik resetuje się przy restarcie serwera
        // W prawdziwej aplikacji użylibyśmy bazy danych
        if (!global.visitCounter) {
            global.visitCounter = 0;
        }
        global.visitCounter++;
 
        response.statusCode = 200;
        response.end(JSON.stringify({
            visits: global.visitCounter,
            message: `To jest wizyta numer ${global.visitCounter}`
        }));
    }
 
    // ZADANIE 6: Endpoint POST - echo
    else if (path === '/echo' && method === 'POST') {
        let body = '';
 
        request.on('data', chunk => {
            body += chunk.toString();
        });
 
        request.on('end', () => {
            try {
                const data = JSON.parse(body);
                response.statusCode = 200;
                response.end(JSON.stringify({
                    received: data,
                    echoTime: new Date().toISOString(),
                    message: "Otrzymałem twoje dane!"
                }));
            } catch (error) {
                response.statusCode = 400;
                response.end(JSON.stringify({
                    error: "Nieprawidłowy format JSON"
                }));
            }
        });
    }
 
    // ZADANIE DODATKOWE: Twój własny endpoint
    else if (path === '/my-endpoint' && method === 'GET') {
        // TODO: Stwórz własny, kreatywny endpoint
        // Może to być cokolwiek - losowa ciekawostka, cytat dnia, 
        // prosty kalkulator, generator haseł, itp.
        response.statusCode = 200;
        response.end(JSON.stringify({
            message: "W 2009 roku Google napisało algorytm, który nauczył się… grać w klasycznego Pac-Mana lepiej niż większość ludzi.!",
            hint: "Zmodyfikuj ten kod według własnego pomysłu"
        }));
    }
 
    // Obsługa nieistniejących endpointów
    else {
        response.statusCode = 404;
        response.end(JSON.stringify({
            error: "Endpoint not found",
            availableEndpoints: [
                "GET /",
                "GET /about",
                "GET /time",
                "GET /greeting?name=Jan&lang=pl",
                "GET /counter",
                "POST /echo",
                "GET /my-endpoint"
            ]
        }));
    }
};
 
// Utworzenie serwera
const server = http.createServer(requestHandler);
 
// Uruchomienie serwera
server.listen(PORT, HOST, () => {
    console.log(`🚀 Serwer uruchomiony!`);
    console.log(`📍 Adres: http://${HOST}:${PORT}`);
    console.log(`📝 Dostępne endpointy:`);
    console.log(`   - GET  http://${HOST}:${PORT}/`);
    console.log(`   - GET  http://${HOST}:${PORT}/about`);
    console.log(`   - GET  http://${HOST}:${PORT}/time`);
    console.log(`   - GET  http://${HOST}:${PORT}/greeting?name=Jan&lang=pl`);
    console.log(`   - GET  http://${HOST}:${PORT}/counter`);
    console.log(`   - POST http://${HOST}:${PORT}/echo`);
    console.log(`   - GET  http://${HOST}:${PORT}/my-endpoint`);
    console.log(`\n⌨️  Naciśnij Ctrl+C aby zatrzymać serwer`);
});
