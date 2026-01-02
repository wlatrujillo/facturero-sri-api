
import app from "./app.js";


const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';


app
    .listen(PORT,
        () => console.info(`Server listening on port ${PORT} environment ${NODE_ENV}`));