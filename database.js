// database.js - Moduł obsługi bazy danych SQLite
// Autor: [Wpisz swoje imię i nazwisko]
// Data: [Wpisz datę]

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Funkcja inicjalizująca bazę danych
async function initializeDB() {
    // Otwórz połączenie z bazą
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    console.log('📦 Inicjalizacja bazy danych...');

    // TABELA 1: Użytkownicy
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            age INTEGER CHECK(age >= 0 AND age <= 120),
            city TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Tabela "users" gotowa');

    // TABELA 2: Zadania (todos)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT 0,
            priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
            user_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    `);
    console.log('✅ Tabela "todos" gotowa');

    // Sprawdź czy są już jakieś dane
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    
    // Jeśli baza jest pusta, dodaj przykładowe dane
    if (userCount.count === 0) {
        console.log('📝 Dodawanie przykładowych danych...');
        
        // Dodaj przykładowych użytkowników
        await db.run(
            'INSERT INTO users (name, email, age, city) VALUES (?, ?, ?, ?)',
            ['Jan Kowalski', 'jan@example.com', 25, 'Warszawa']
        );
        await db.run(
            'INSERT INTO users (name, email, age, city) VALUES (?, ?, ?, ?)',
            ['Anna Nowak', 'anna@example.com', 30, 'Kraków']
        );
        await db.run(
            'INSERT INTO users (name, email, age, city) VALUES (?, ?, ?, ?)',
            ['Piotr Wiśniewski', 'piotr@example.com', 28, 'Gdańsk']
        );
        
        // Dodaj przykładowe zadania
        await db.run(
            'INSERT INTO todos (title, description, user_id, priority) VALUES (?, ?, ?, ?)',
            ['Nauka REST API', 'Dokończyć warsztaty z API', 1, 'high']
        );
        await db.run(
            'INSERT INTO todos (title, description, user_id, priority, completed) VALUES (?, ?, ?, ?, ?)',
            ['Projekt w Postmanie', 'Stworzyć kolekcję testów', 1, 'medium', 1]
        );
        await db.run(
            'INSERT INTO todos (title, description, user_id, priority) VALUES (?, ?, ?, ?)',
            ['Nauka SQLite', 'Poznać podstawy baz danych', 2, 'high']
        );
        
        console.log('✅ Przykładowe dane dodane');
    }

    return db;
}

module.exports = { initializeDB };
