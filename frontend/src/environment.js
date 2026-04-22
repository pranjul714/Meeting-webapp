const IS_PROD = true; // Default to production mode for deployment prep

const server = process.env.REACT_APP_BACKEND_URL || (IS_PROD ? 
    "https://meeting-webapp.onrender.com" : 
    "http://localhost:8000");

export default server;



// XdqBknSnw2zTt5AZ