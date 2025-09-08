#!/usr/bin/env node

// db-view.js - Narzędzie do podglądu bazy danych
// Użycie: node db-view.js

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function viewDatabase() {
    console.log('\n:bar_chart: PODGLĄD BAZY DANYCH\n');
    console.log('=' .repeat(60));

    try {
        // Otwórz bazę danych
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        // Pobierz użytkowników
        console.log('\n:busts_in_silhouette: UŻYTKOWNICY:');
        console.log('-'.repeat(60));
        const users = await db.all('SELECT * FROM users ORDER BY id');
        console.table(users);
        console.log(`Łącznie użytkowników: ${users.length}`);

        // Pobierz zadania
        console.log('\n:clipboard: ZADANIA:');
        console.log('-'.repeat(60));
        const todos = await db.all(`
            SELECT
                t.id,
                t.title,
                t.completed,
                t.priority,
                u.name as owner,
                t.created_at
            FROM todos t
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.id
        `);
        console.table(todos);
        console.log(`Łącznie zadań: ${todos.length}`);

        // Statystyki
        console.log('\n:chart_with_upwards_trend: STATYSTYKI:');
        console.log('-'.repeat(60));

        const stats = await db.get(`
            SELECT
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT AVG(age) FROM users) as avg_age,
                (SELECT COUNT(*) FROM todos) as total_todos,
                (SELECT COUNT(*) FROM todos WHERE completed = 1) as completed_todos
        `);

        console.log(`• Użytkownicy: ${stats.total_users}`);
        console.log(`• Średni wiek: ${stats.avg_age ? Math.round(stats.avg_age) : 'N/A'}`);
        console.log(`• Wszystkie zadania: ${stats.total_todos}`);
        console.log(`• Ukończone zadania: ${stats.completed_todos}`);
        console.log(`• Nieukończone zadania: ${stats.total_todos - stats.completed_todos}`);

        // Miasta
        console.log('\n:cityscape:  MIASTA:');
        console.log('-'.repeat(60));
        const cities = await db.all(`
            SELECT city, COUNT(*) as count
            FROM users
            WHERE city IS NOT NULL
            GROUP BY city
            ORDER BY count DESC
        `);
        cities.forEach(c => {
            console.log(`• ${c.city}: ${c.count} użytkowników`);
        });

        console.log('\n' + '='.repeat(60));
        console.log(':white_check_mark: Koniec raportu\n');

        // Zamknij bazę
        await db.close();

    } catch (error) {
        console.error(':x: Błąd:', error.message);
        console.log('\n:bulb: Wskazówka: Upewnij się, że:');
        console.log('   1. Baza danych istnieje (uruchom serwer przynajmniej raz)');
        console.log('   2. Jesteś w odpowiednim folderze');
        console.log('   3. Zainstalowałeś pakiety (npm install)\n');
    }
}

// Uruchom
viewDatabase();
