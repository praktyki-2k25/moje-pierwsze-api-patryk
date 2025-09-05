🚀 Moje Pierwsze API
📝 Opis projektu
To jest mój pierwszy serwer API stworzony podczas warsztatów z REST API i Postmana.
👤 Autor

Imię i nazwisko: Patryk Szczotka
Data utworzenia: 04.09.2025
Firma/Szkoła: QualityCare

🛠️ Technologie

Node.js (wbudowany moduł http)
JavaScript
Postman (do testowania)

📋 Wymagania

Node.js (wersja 14 lub wyższa)
Postman lub przeglądarka

🚀 Jak uruchomić projekt?

Sklonuj repozytorium:

bashgit clone https://github.com/TWOJ_LOGIN/moje-pierwsze-api.git
cd moje-pierwsze-api

Zainstaluj Node.js (jeśli nie masz)

Pobierz z: https://nodejs.org/


Uruchom serwer:

bashnpm start
lub
bashnode server.js

Serwer uruchomi się na:

http://localhost:3000
📍 Dostępne endpointy
1. GET / - Podstawowy endpoint

URL: http://localhost:3000/
Odpowiedź:

json{
  "message": "Hello World!",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "author": "Jan Kowalski"
}
2. GET /about - Informacje o autorze

URL: http://localhost:3000/about
Odpowiedź:

json{
  "name": "Jan Kowalski",
  "role": "Praktykant",
  "company": "TechCorp",
  "learningGoals": ["REST API", "Node.js", "Postman"]
}
3. GET /time - Aktualny czas

URL: http://localhost:3000/time
Odpowiedź:

json{
  "currentTime": "10:30:45 GMT+0100",
  "currentDate": "Sat Jan 20 2024",
  "timestamp": 1705745445000,
  "timezone": "Europe/Warsaw"
}
4. GET /greeting - Spersonalizowane powitanie

URL: http://localhost:3000/greeting?name=Anna&lang=en
Parametry:

name - imię osoby (domyślnie: "Nieznajomy")
lang - język (pl, en, es, de) (domyślnie: "pl")


Odpowiedź:

json{
  "greeting": "Hello Anna! Nice to meet you!",
  "language": "en",
  "name": "Anna"
}
5. GET /counter - Licznik odwiedzin

URL: http://localhost:3000/counter
Odpowiedź:

json{
  "visits": 1,
  "message": "To jest wizyta numer 1"
}
6. POST /echo - Echo (zwraca wysłane dane)

URL: http://localhost:3000/echo
Body (JSON):

json{
  "test": "wartość",
  "liczba": 123
}

Odpowiedź:

json{
  "received": {
    "test": "wartość",
    "liczba": 123
  },
  "echoTime": "2024-01-20T10:30:00.000Z",
  "message": "Otrzymałem twoje dane!"
}
7. GET /my-endpoint - Własny endpoint (DO ZMODYFIKOWANIA)

URL: http://localhost:3000/my-endpoint
Zadanie: Stwórz własną, kreatywną funkcjonalność!

🧪 Testowanie w Postmanie

Utwórz nową kolekcję o nazwie "Moje API"
Dodaj requesty dla każdego endpointu
Przykładowe testy (zakładka Tests w Postmanie):

javascript// Test statusu odpowiedzi
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test zawartości odpowiedzi
pm.test("Response has message", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
});
📚 Czego się nauczyłem?

 Tworzenie prostego serwera HTTP w Node.js
 Obsługa różnych metod HTTP (GET, POST)
 Parsowanie parametrów URL
 Zwracanie odpowiedzi w formacie JSON
 Testowanie API za pomocą Postmana
 Podstawy Git i GitHub
 TODO: Dodaj więcej punktów

🎯 Zadania do wykonania

 Zadanie 1: Podstawowy endpoint /
 Zadanie 2: Endpoint /about z informacjami
 Zadanie 3: Endpoint /time z aktualnym czasem
 Zadanie 4: Endpoint /greeting z parametrami
 Zadanie 5: Licznik odwiedzin /counter
 Zadanie 6: Endpoint POST /echo
 Zadanie 7: Stwórz własny, kreatywny endpoint
 Zadanie 8: Dodaj README z dokumentacją
 Zadanie 9: Wgraj kod na GitHub
 Zadanie 10: Przetestuj wszystko w Postmanie

💡 Pomysły na rozwinięcie projektu

Dodanie bazy danych (np. SQLite)
Implementacja CRUD dla konkretnego zasobu (np. lista zadań)
Dodanie autentykacji (JWT)
Stworzenie frontendu w HTML/CSS/JS
Deployment na Heroku lub Vercel
Dodanie walidacji danych
Implementacja middleware do logowania

🔗 Przydatne linki

Node.js Documentation
Postman Learning Center
REST API Best Practices
GitHub Guides

📄 Licencja
MIT
