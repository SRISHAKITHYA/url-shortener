const db = require("../config/db");

(async () => {
  try {
    await db.executeSqlFile("../db/create_tables.sql");
    console.log("Database tables created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
})();
