// Membuat akun OWNER baru (atau menjadikan akun yang sudah ada sebagai OWNER).
//
// Cara pakai (di folder proyek):
//   npm run owner:create -- "Nama Owner" email@contoh.com passwordnya 08123456789
//
// Nomor HP boleh dikosongkan. Berlaku untuk SQLite maupun MySQL,
// sesuai DATABASE_URL di file .env.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const [name, email, password, phone] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.log('Cara pakai:');
    console.log('  npm run owner:create -- "Nama Owner" email@contoh.com password [no_hp]');
    process.exit(1);
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    console.log('Format email tidak valid.');
    process.exit(1);
  }
  if (password.length < 6) {
    console.log('Password minimal 6 karakter.');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const mail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: mail } });

    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'OWNER' } });
      console.log(`Akun ${mail} sudah ada, perannya kini OWNER (password lama tidak berubah).`);
    } else {
      await prisma.user.create({
        data: {
          name: name.trim(),
          email: mail,
          phone: phone || null,
          password: await bcrypt.hash(password, 10),
          role: 'OWNER',
        },
      });
      console.log(`Owner baru dibuat: ${mail}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
