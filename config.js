exports.dbUrl = process.env.MONGO_URL || process.env.DB_URL || 'postgresql://postgres:admin@localhost:5432/postgres';
exports.secret = process.env.JWT_SECRET || 'esta-es-la-api-burger-queen';
exports.adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost';
exports.adminPassword = process.env.ADMIN_PASSWORD || 'changeme';
