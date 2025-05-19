import { OAuth2Client } from 'google-auth-library';

async function verifyGoogleToken(code) {
  try {
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.ALLOWED_ORIGIN
    );

    const { tokens } = await oAuth2Client.getToken(code);
    const { id_token } = tokens;

    if (!id_token) {
      throw new Error('Could not retrieve ID token.');
    }

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw error; // Re-throw the error to be handled in the controller
  }
}

export default verifyGoogleToken;
