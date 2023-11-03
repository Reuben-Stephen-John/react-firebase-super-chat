/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onDocumentCreated} from "firebase-functions/v2/firestore";
const {getFirestore} = require("firebase-admin/firestore");
const Filter = require('bad-words');
const {initializeApp} = require("firebase-admin/app");

initializeApp();
const db = getFirestore();



exports.detectEvilUsers = onDocumentCreated('messages/{messageId}', async (snap, context) => {
        const filter = new Filter();
        const { text, uid } = snap.data(); 


        if (filter.isProfane(text)) {

            const cleaned = filter.clean(text);
            await snap.ref.update({text: `🤐 I got BANNED for life for saying... ${cleaned}`});

            await db.collection('banned').doc(uid).set({});
        } 

        const userRef = db.collection('users').doc(uid)

        const userData = (await userRef.get()).data();

        if (userData.msgCount >= 7) {
            await db.collection('banned').doc(uid).set({});
        } else {
            await userRef.set({ msgCount: (userData.msgCount || 0) + 1 })
        }

});