const dbConnection = require('../config/mongoConnection');

async function main() {
    const db = await dbConnection();
    await db.dropDatabase();

    console.log('Done cleaning database');

    await db.serverConfig.close();
};

main();