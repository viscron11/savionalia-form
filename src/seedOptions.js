/**
 * Run this script once to seed your options AND form config into Firestore.
 *
 * Usage:
 *   node src/seedOptions.js
 *
 * Edit the OPTIONS and FORM_CONFIG below with your actual data.
 */

const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAdM1j8qWx6hefMSlQ02z0JK56okDHD4YE",
    authDomain: "savionalia-form.firebaseapp.com",
    projectId: "savionalia-form",
    storageBucket: "savionalia-form.firebasestorage.app",
    messagingSenderId: "1001232475012",
    appId: "1:1001232475012:web:cdacdfbf0218eace1b33d1",
};

// ============================================
// ✏️ EDIT YOUR FORM FIELDS HERE
// Each field needs: id, label, type, placeholder, required, halfWidth
//
// type options: "text", "email", "tel", "number"
// halfWidth: true = field takes half the row (pair two together)
//            false = field takes the full row
// ============================================
const FORM_CONFIG = {
    title: "Formularz rejestracji",
    subtitle: "Wypełnij dane i wybierz swoje opcje",
    fields: [
        {
            id: "firstName",
            label: "Imię",
            type: "text",
            placeholder: "Wpisz swoje imię",
            required: true,
            halfWidth: true,
        },
        {
            id: "lastName",
            label: "Nazwisko",
            type: "text",
            placeholder: "Wpisz swoje nazwisko",
            required: true,
            halfWidth: true,
        },
        {
            id: "email",
            label: "E-mail",
            type: "email",
            placeholder: "twoj.email@example.com",
            required: true,
            halfWidth: false,
        },
        {
            id: "phone",
            label: "Numer telefonu",
            type: "tel",
            placeholder: "+48 123 456 789",
            required: true,
            halfWidth: false,
        },
    ],
};

// ============================================
// ✏️ EDIT YOUR OPTIONS HERE
// Each option needs: id, name, and totalSpots
// ============================================
const OPTIONS = [
    { id: "option_1", name: "Warsztat A", totalSpots: 30 },
    { id: "option_2", name: "Warsztat B", totalSpots: 25 },
    { id: "option_3", name: "Warsztat C", totalSpots: 20 },
    // Add more options as needed...
];

// ============================================
// ✏️ ADMIN EMAILS — who can access /#/admin
// ============================================
const ADMIN_EMAILS = [
    "viscron11@gmail.com",
    // Add more admin emails as needed...
];

// ============================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
    console.log("Seeding admin config...\n");

    await setDoc(doc(db, "config", "admins"), {
        allowedEmails: ADMIN_EMAILS,
    });
    console.log(`  ✓ Admin emails: ${ADMIN_EMAILS.join(", ")}`);

    console.log("\nSeeding form config...\n");

    await setDoc(doc(db, "config", "form"), FORM_CONFIG);
    console.log("  ✓ Form config saved");
    console.log(`    Title: "${FORM_CONFIG.title}"`);
    console.log(`    Fields: ${FORM_CONFIG.fields.map((f) => f.label).join(", ")}`);

    console.log("\nSeeding options...\n");

    for (const option of OPTIONS) {
        await setDoc(doc(db, "options", option.id), {
            name: option.name,
            totalSpots: option.totalSpots,
            spotsLeft: option.totalSpots,
        });
        console.log(
            `  ✓ ${option.id}: "${option.name}" (${option.totalSpots} miejsc)`
        );
    }

    console.log(`\nDone! Admins + config + ${OPTIONS.length} options created.`);
    process.exit(0);
}

seed().catch((err) => {
    console.error("Error seeding:", err);
    process.exit(1);
});
