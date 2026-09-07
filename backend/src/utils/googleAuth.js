const { google } = require('googleapis');

/**
 * Creates and returns an OAuth2 client configured with credentials.
 */
const getOAuth2Client = () => {
    const defaultRedirectUri = process.env.NODE_ENV === 'production'
      ? 'https://miraculous-enjoyment-production-072e.up.railway.app/api/drive/callback'
      : 'http://localhost:5001/api/drive/callback';

    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || defaultRedirectUri
    );
};

module.exports = {
  getOAuth2Client,
};
