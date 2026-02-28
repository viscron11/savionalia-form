import {
    collection,
    doc,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Submits a registration and atomically decrements spotsLeft
 * for each selected option using a Firestore transaction.
 *
 * @param {Object} formData - { firstName, lastName, email, phone }
 * @param {string[]} selectedOptionIds - array of option document IDs
 * @returns {Promise<string>} - the new registration document ID
 * @throws {Error} - if any selected option has no spots left
 */
export async function submitRegistration(formData, selectedOptionIds) {
    // Use a transaction to atomically check & decrement all selected options
    const registrationId = await runTransaction(db, async (transaction) => {
        // 1. Read all selected option docs inside the transaction
        const optionRefs = selectedOptionIds.map((id) => doc(db, "options", id));
        const optionSnaps = await Promise.all(
            optionRefs.map((ref) => transaction.get(ref))
        );

        // 2. Validate that all options have spots left
        for (let i = 0; i < optionSnaps.length; i++) {
            const snap = optionSnaps[i];
            if (!snap.exists()) {
                throw new Error(`Opcja "${selectedOptionIds[i]}" nie istnieje.`);
            }
            const data = snap.data();
            if (data.spotsLeft <= 0) {
                throw new Error(
                    `Przepraszamy, "${data.name}" nie ma już wolnych miejsc. Odśwież stronę i spróbuj ponownie.`
                );
            }
        }

        // 3. Decrement spotsLeft for each selected option
        for (let i = 0; i < optionRefs.length; i++) {
            const currentSpots = optionSnaps[i].data().spotsLeft;
            transaction.update(optionRefs[i], { spotsLeft: currentSpots - 1 });
        }

        // 4. Create the registration document
        const regRef = doc(collection(db, "registrations"));
        transaction.set(regRef, {
            ...formData,
            selectedOptions: selectedOptionIds,
            createdAt: serverTimestamp(),
        });

        return regRef.id;
    });

    return registrationId;
}
