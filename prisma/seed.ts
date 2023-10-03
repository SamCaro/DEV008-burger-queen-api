const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function seedData() {
    try {
        const existingUser = await prisma.users.findFirst({
            where: { email: 'admin@admin.com' },
        });

        if (!existingUser) {
            const plainTextPassword = 'admin';
            const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
            await prisma.users.create({
                data: {
                    email: 'admin@admin.com',
                    password: hashedPassword,
                    role: 'Admin',
                },
            });

            console.log('Autenticacion exitosa');
        } else {
            console.log('Ingrese correctamente sus credenciales');
        }
    } catch (error) {
        console.log('Error al ingresar datos:', error)
    } finally {
        await prisma.$disconnect();
    }
}

seedData();

