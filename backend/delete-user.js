const admin = require('firebase-admin');

// Initialize Firebase Admin (use default credentials)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

async function deleteUserByPhone(phone) {
  try {
    console.log(`Szukam użytkownika z numerem: ${phone}`);

    // Find user in Firestore
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('phone', '==', phone).get();

    if (snapshot.empty) {
      console.log('Nie znaleziono użytkownika z tym numerem telefonu');
      return;
    }

    // Delete each matching user
    const batch = db.batch();
    let count = 0;

    snapshot.forEach(doc => {
      console.log(`Znaleziono użytkownika: ${doc.id}`);
      console.log('Dane:', JSON.stringify(doc.data(), null, 2));
      batch.delete(doc.ref);
      count++;
    });

    await batch.commit();
    console.log(`✅ Usunięto ${count} użytkownika/ów`);

  } catch (error) {
    console.error('Błąd podczas usuwania użytkownika:', error);
    throw error;
  } finally {
    await admin.app().delete();
  }
}

// Run the script
const phone = process.argv[2] || '+48536087316';
deleteUserByPhone(phone);
