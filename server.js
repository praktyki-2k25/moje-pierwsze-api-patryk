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

// ===============================================
    // NOWE ENDPOINTY - BAZA DANYCH
    // ===============================================
 
    // GET /api/users - Pobierz wszystkich użytkowników
    else if (path === '/api/users' && method === 'GET') {
        try {
            // Obsługa parametrów query
            const { sort, order, city, age_min, age_max, page, limit } = parsedUrl.query;
 
            let query = 'SELECT * FROM users WHERE 1=1';
            const params = [];
 
            // Filtrowanie po mieście
            if (city) {
                query += ' AND city = ?';
                params.push(city);
            }
 
            // Filtrowanie po wieku
            if (age_min) {
                query += ' AND age >= ?';
                params.push(parseInt(age_min));
            }
            if (age_max) {
                query += ' AND age <= ?';
                params.push(parseInt(age_max));
            }
 
            // Sortowanie
            if (sort) {
                const validColumns = ['name', 'email', 'age', 'created_at'];
                if (validColumns.includes(sort)) {
                    query += ` ORDER BY ${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;
                }
            }
 
            // Paginacja
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const offset = (pageNum - 1) * limitNum;
 
            // Policz wszystkie rekordy (do paginacji)
            const totalResult = await db.get(
                'SELECT COUNT(*) as total FROM users WHERE 1=1' + 
                (city ? ' AND city = ?' : '') +
                (age_min ? ' AND age >= ?' : '') +
                (age_max ? ' AND age <= ?' : ''),
                params
            );
 
            // Dodaj LIMIT i OFFSET do głównego zapytania
            query += ' LIMIT ? OFFSET ?';
            params.push(limitNum, offset);
 
            const users = await db.all(query, params);
 
            response.statusCode = 200;
            response.end(JSON.stringify({
                success: true,
                page: pageNum,
                limit: limitNum,
                total: totalResult.total,
                totalPages: Math.ceil(totalResult.total / limitNum),
                count: users.length,
                users: users
            }));
        } catch (error) {
            response.statusCode = 500;
            response.end(JSON.stringify({
                success: false,
                error: 'Błąd podczas pobierania użytkowników',
                details: error.message
            }));
        }
    }
 
    // GET /api/users/:id - Pobierz konkretnego użytkownika
    else if (path.match(/^\/api\/users\/\d+$/) && method === 'GET') {
        try {
            const userId = path.split('/')[3];
 
            const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
 
            if (user) {
                // Pobierz też zadania użytkownika
                const todos = await db.all(
                    'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
                    userId
                );
 
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    user: user,
                    todos: todos
                }));
            } else {
                response.statusCode = 404;
                response.end(JSON.stringify({
                    success: false,
                    error: 'Użytkownik nie został znaleziony'
                }));
            }
        } catch (error) {
            response.statusCode = 500;
            response.end(JSON.stringify({
                success: false,
                error: 'Błąd podczas pobierania użytkownika',
                details: error.message
            }));
        }
    }
 
    // POST /api/users - Utwórz nowego użytkownika
    else if (path === '/api/users' && method === 'POST') {
        try {
            const data = await parseBody(request);
            const { name, email, age, city } = data;
 
            // Walidacja
            if (!name || !email) {
                response.statusCode = 400;
                response.end(JSON.stringify({
                    success: false,
                    error: 'Imię i email są wymagane'
                }));
                return;
            }
 
            // Sprawdź format emaila
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                response.statusCode = 400;
                response.end(JSON.stringify({
                    success: false,
                    error: 'Nieprawidłowy format email'
                }));
                return;
            }
 
            // Sprawdź wiek
            if (age && (age < 0 || age > 120)) {
                response.statusCode = 400;
                response.end(JSON.stringify({
                    success: false,
                    error: 'Wiek musi być między 0 a 120'
                }));
                return;
            }
 
            const result = await db.run(
                'INSERT INTO users (name, email, age, city) VALUES (?, ?, ?, ?)',
                [name, email, age || null, city || null]
            );
 
            const newUser = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
 
            response.statusCode = 201;
            response.end(JSON.stringify({
                success: true,
                message: 'Użytkownik utworzony pomyślnie',
                user: newUser
            }));
 
        } catch (error) {
            if (error.message.includes('UNIQUE')) {
                response.statusCode = 409;
                response.end(JSON.stringify({
                    success: false,
                    error: 'Email jest już zajęty'
                }));
            } else {
                response.statusCode = 500;
                response.end(JSON.stringify({
                    success: false,
                    error: 'Błąd podczas tworzenia użytkownika',
                    details: error.message
                }));
            }
        }
    }
 
    // PUT /api/users/:id - Zaktualizuj użytkownika
    else if (path.match(/^\/api\/users\/\d+$/) && method === 'PUT') {
        try {
            const userId = path.split('/')[3];
            const data = await parseBody(request);
            const { name, email, age, city } = data;
 
            // Sprawdź czy użytkownik istnieje
            const existingUser = await db.get('SELECT * FROM users WHERE id = ?', userId);
            if (!existingUser) {
                response.statusCode = 404;
                response.end(JSON.stringify({
                    success: false,
                    error: 'Użytkownik nie został znaleziony'
                }));
                return;
            }
 
            // Walidacja emaila jeśli został podany
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    response.statusCode = 400;
                    response.end(JSON.stringify({
                        success: false,
                        error: 'Nieprawidłowy format email'
                    }));
                    return;
                }
            }
 
            // Walidacja wieku jeśli został podany
            if (age !== undefined && (age < 0 || age > 120)) {
                response.statusCode = 400;
                response.end(JSON.stringify({
                    success: false,
                    error: 'Wiek musi być między 0 a 120'
                }));
                return;
            }
 
            // Aktualizuj dane
            await db.run(
                'UPDATE users SET name = ?, email = ?, age = ?, city = ? WHERE id = ?',
                [
                    name || existingUser.name,
                    email || existingUser.email,
                    age !== undefined ? age : existingUser.age,
                    city !== undefined ? city : existingUser.city,
                    userId
                ]
            );
 
            const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', userId);
 
            response.statusCode = 200;
            response.end(JSON.stringify({
                success: true,
                message: 'Użytkownik zaktualizowany pomyślnie',
                user: updatedUser
            }));
 
        } catch (error) {
            if (error.message.includes('UNIQUE')) {
                response.statusCode = 409;
                response.end(JSON.stringify({
                    success: false,
                    error: 'Email jest już zajęty'
                }));
            } else {
                response.statusCode = 500;
                response.end(JSON.stringify({
                    success: false,
                    error: 'Błąd podczas aktualizacji użytkownika',
                    details: error.message
                }));
            }
        }
    }
 
    // DELETE /api/users/:id - Usuń użytkownika
    else if (path.match(/^\/api\/users\/\d+$/) && method === 'DELETE') {
        try {
            const userId = path.split('/')[3];
 
            const result = await db.run('DELETE FROM users WHERE id = ?', userId);
 
            if (result.changes > 0) {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Użytkownik usunięty pomyślnie'
                }));
            } else {
                response.statusCode = 404;
                response.end(JSON.stringify({
                    success: false,
                    error: 'Użytkownik nie został znaleziony'
                }));
            }
        } catch (error) {
            response.statusCode = 500;
            response.end(JSON.stringify({
                success: false,
                error: 'Błąd podczas usuwania użytkownika',
                details: error.message
            }));
        }
    }
 
    // GET /api/stats - Statystyki
    else if (path === '/api/stats' && method === 'GET') {
        try {
            const userStats = await db.get(`
                SELECT 
                    COUNT(*) as total_users,
                    AVG(age) as average_age,
                    MIN(age) as youngest,
                    MAX(age) as oldest
                FROM users
            `);
 
            const cities = await db.all(`
                SELECT city, COUNT(*) as count 
                FROM users 
                WHERE city IS NOT NULL 
                GROUP BY city 
                ORDER BY count DESC
            `);
 
            const todoStats = await db.get(`
                SELECT 
                    COUNT(*) as total_todos,
                    SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as pending
                FROM todos
            `);
 
            response.statusCode = 200;
            response.end(JSON.stringify({
                success: true,
                users: {
                    total: userStats.total_users,
                    averageAge: userStats.average_age ? Math.round(userStats.average_age) : 0,
                    youngest: userStats.youngest,
                    oldest: userStats.oldest
                },
                cities: cities,
                todos: todoStats
            }));
        } catch (error) {
            response.statusCode = 500;
            response.end(JSON.stringify({
                success: false,
                error: 'Błąd podczas pobierania statystyk',
                details: error.message
            }));
        }
    }
 
    // GET /api/todos - Wszystkie zadania
    else if (path === '/api/todos' && method === 'GET') {
        try {
            const todos = await db.all(`
                SELECT 
                    t.*,
                    u.name as user_name,
                    u.email as user_email
                FROM todos t
                LEFT JOIN users u ON t.user_id = u.id
                ORDER BY t.created_at DESC
            `);
 
            response.statusCode = 200;
            response.end(JSON.stringify({
                success: true,
                count: todos.length,
                todos: todos
            }));
        } catch (error) {
            response.statusCode = 500;
            response.end(JSON.stringify({
                success: false,
                error: 'Błąd podczas pobierania zadań',
                details: error.message
            }));
        }
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


// Funkcja startowa z inicjalizacją bazy danych
async function startServer() {
    try {
        // Inicjalizuj bazę danych
        db = await initializeDB();
        console.log('✅ Baza danych połączona');
        
        // Utworzenie serwera
        const server = http.createServer(requestHandler);
        
        // Uruchomienie serwera
        server.listen(PORT, HOST, () => {
            console.log(`\n🚀 Serwer uruchomiony z bazą danych!`);
            console.log(`📍 Adres: http://${HOST}:${PORT}`);
            console.log(`\n📝 Dostępne endpointy:`);
            console.log(`\n   STARE ENDPOINTY (bez bazy):`);
            console.log(`   - GET  http://${HOST}:${PORT}/`);
            console.log(`   - GET  http://${HOST}:${PORT}/about`);
            console.log(`   - GET  http://${HOST}:${PORT}/time`);
            console.log(`   - GET  http://${HOST}:${PORT}/greeting?name=Jan&lang=pl`);
            console.log(`   - GET  http://${HOST}:${PORT}/counter`);
            console.log(`   - POST http://${HOST}:${PORT}/echo`);
            console.log(`   - GET  http://${HOST}:${PORT}/my-endpoint`);
            console.log(`\n   NOWE ENDPOINTY (z bazą danych):`);
            console.log(`   - GET    http://${HOST}:${PORT}/api/users`);
            console.log(`   - GET    http://${HOST}:${PORT}/api/users/:id`);
            console.log(`   - POST   http://${HOST}:${PORT}/api/users`);
            console.log(`   - PUT    http://${HOST}:${PORT}/api/users/:id`);
            console.log(`   - DELETE http://${HOST}:${PORT}/api/users/:id`);
            console.log(`   - GET    http://${HOST}:${PORT}/api/stats`);
            console.log(`   - GET    http://${HOST}:${PORT}/api/todos`);
            console.log(`\n⌨️  Naciśnij Ctrl+C aby zatrzymać serwer\n`);
        });
    } catch (error) {
        console.error('❌ Błąd podczas uruchamiania serwera:', error);
        process.exit(1);
    }
}

// Uruchom serwer
startServer();
