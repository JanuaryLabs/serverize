import { cert, initializeApp } from 'firebase-admin/app';
import type { GoogleServiceAccount } from '../../core/service-account';

const serviceAccount: GoogleServiceAccount = JSON.parse(
	Buffer.from(process.env.FIREBASE_AUTH_SERVICE_ACCOUNT_KEY, 'base64').toString(
		'ascii'
	)
);

export const firebaseApp = initializeApp({
	credential: cert({
		clientEmail: serviceAccount.client_email,
		privateKey: serviceAccount.private_key,
		projectId: serviceAccount.project_id,
	}),
	projectId: serviceAccount.project_id,
	serviceAccountId: serviceAccount.client_email,
});
