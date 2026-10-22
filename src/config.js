module.exports = {
  google: {
    API_KEY: process.env.REACT_APP_APIKEY || "",
    CLIENT_ID: process.env.REACT_APP_CLIENT_ID || "",
    SECRET: process.env.REACT_APP_SECRET || "",
  },
  facebook: {
    APP_ID: process.env.REACT_APP_APP_ID || "",
  },
  api: {
    API_URL: process.env.REACT_APP_API_URL || "https://api-node.themesbrand.website",
    AUTH_API_URL: process.env.REACT_APP_AUTH_API_URL || "https://phamacoredev.co.ke:81",
    POWERBI_API_URL: process.env.REACT_APP_POWERBI_API_URL || "https://www.phamacoredev.co.ke:81",
    CONNECTION_DB: process.env.REACT_APP_CONNECTION_DB || "DEVTESTDB001",
    CLIENT_ID: parseInt(process.env.REACT_APP_CLIENT_ID || "1", 10),
    LOGOUT_API_URL: process.env.REACT_APP_LOGOUT_API_URL || "https://www.phamacoretraining.co.ke:81",
  }
};
