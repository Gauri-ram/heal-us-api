const { app, database } = require('./server');

const startServer = async () => {
    try {
        await database();
        app.listen(3002, () => {
            console.log("server is listening")
        });
    } catch (error) {
        console.log("Connection error with db")
        console.log("Server cannot be started")
    }
}

startServer();