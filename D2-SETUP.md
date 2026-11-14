# DEV@Deakin – SIT313 D2 setup

## Frontend
1. Keep the existing Firebase web configuration in the project-root `.env` (same folder as `package.json`). Use the six `VITE_FIREBASE_*` values from Firebase Console > Project settings > Your apps > Task4P > SDK setup > Config.
2. Add `VITE_API_URL=http://localhost:5000` to that same `.env`.
3. Run `npm install`, then `npm run dev` in the project root.

## Backend
1. Open Firebase Console > Project settings > Service accounts > Generate new private key for the SAME Firebase project used by the frontend.
2. Save the downloaded JSON file as `backend/serviceAccountKey.json`. Never commit or share this file.
3. Create `backend/.env` with `PORT=5000`, your SendGrid key and verified sender email (if using newsletter):
   `SENDGRID_API_KEY=...`
   `SENDER_EMAIL=...`
4. In a terminal run `cd backend`, `npm install`, then `npm run dev`.
5. Test `http://localhost:5000/` – it should show `DEV@Deakin backend is running.`

## D2 features
- `POST /api/posts` requires a Firebase ID token and saves validated posts with author UID and server timestamp.
- `GET /api/posts` is public; visitors and Free users receive only Free posts. Paid users receive Free and Paid posts. The filtering is performed on the backend before the response is sent.
- The Browse Posts page supports post type, tag and date filters, hide (client-side only), reset and expand.
- The Firestore Admin SDK is used only in the backend. Client rules deny direct reads/writes to `posts`.

## Before submitting
- Verify Firebase Authentication and Firestore are enabled in the selected project.
- Verify user documents are stored in `users/{uid}` and the subscription field is `subscriptionPlan: "Free"` or `"Paid"`.
- Create at least one Free post and one Paid post using appropriate accounts, then test visitor, Free and Paid browsing.
- Ensure `.env`, `backend/.env`, `backend/serviceAccountKey.json`, `node_modules` and `dist` are not committed.
