# Savionalia — Formularz Rejestracji

Prosty formularz rejestracyjny na wydarzenie Savionalia, zbudowany w React z backendem Firebase Firestore.

## Funkcje

- **Dynamiczne pola formularza** — pola (imię, nazwisko, e-mail, telefon itp.) konfigurowane z Firestore, bez zmian w kodzie
- **Wybór warsztatów z licznikiem miejsc** — użytkownik widzi na żywo ile miejsc zostało; po zapisie licznik automatycznie się zmniejsza
- **Atomowe transakcje** — rejestracja i zmniejszenie liczby miejsc odbywają się w jednej transakcji Firestore, bezpiecznie przy wielu użytkownikach jednocześnie
- **Panel administracyjny** (`/#/admin`) — tabela ze wszystkimi zgłoszeniami i podsumowanie zajętych miejsc
- **Invisible reCAPTCHA** — ochrona przed botami bez dodatkowych kliknięć
- **Hosting na GitHub Pages** — szybki deploy jednym poleceniem `npm run deploy`

## Technologie

- React (Create React App)
- Firebase Firestore
- react-google-recaptcha
- GitHub Pages (gh-pages)

## Uruchomienie lokalne

```bash
npm install
npm start
```

## Deploy

```bash
npm run deploy
```

## Konfiguracja

1. Ustaw dane Firebase w `src/firebase.js`
2. Klucz reCAPTCHA w `src/components/RegistrationForm.js`
3. Edytuj opcje i pola formularza w `src/seedOptions.js`, a następnie uruchom `node src/seedOptions.js`
