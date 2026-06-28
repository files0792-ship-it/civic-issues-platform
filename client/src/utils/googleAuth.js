import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirebaseAuth } from '../config/firebase.js';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export function getGoogleAuthErrorMessage(error) {
  const code = error?.code || '';

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Sign-in was cancelled.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Pop-up was blocked. Please allow pop-ups for this site and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error. Check your connection and try again.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google Sign-In is not enabled for this app.';
  }

  return error?.message || 'Google Sign-In failed. Please try again.';
}

/** Opens Google OAuth popup, returns Firebase ID token. Does not persist Firebase session. */
export async function getGoogleIdToken() {
  const auth = getFirebaseAuth();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  await signOut(auth);
  return idToken;
}
