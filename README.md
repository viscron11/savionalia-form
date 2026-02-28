# Savionalia — Registration Form

A simple registration form for the Savionalia youth event, built with React and Firebase Firestore.

## Features

- **Dynamic form fields** — fields (name, email, phone, etc.) are configured in Firestore, no code changes needed
- **Workshop selection with live spot counter** — users see how many spots are left in real time; the counter decreases automatically on registration
- **Atomic transactions** — registration and spot decrement happen in a single Firestore transaction, safe for concurrent users
- **Admin dashboard** (`/#/admin`) — a table of all submissions with a spots overview summary
- **Invisible reCAPTCHA** — bot protection without extra clicks for users
- **GitHub Pages hosting** — one-command deploy with `npm run deploy`

## Tech Stack

- React (Create React App)
- Firebase Firestore
- react-google-recaptcha
- GitHub Pages (gh-pages)

## Local Development

```bash
npm install
npm start
```

## Deploy

```bash
npm run deploy
```

## Configuration

1. Set your Firebase config in `src/firebase.js`
2. Set your reCAPTCHA site key in `src/components/RegistrationForm.js`
3. Edit options and form fields in `src/seedOptions.js`, then run `node src/seedOptions.js`
