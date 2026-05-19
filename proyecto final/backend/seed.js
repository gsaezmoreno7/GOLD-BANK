const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de base de datos...');

  // 1. Crear Empresa
  const empresa = await prisma.empresa.upsert({
    where: { rut: '76.123.456-K' },
    update: {},
    create: {
      nombre: 'Maestranza R.S SPA',
      rut: '76.123.456-K',
      direccion: 'Av. Industrial 1234, Los Ángeles',
      telefono: '+56912345678',
      correo: 'contacto@maestranzars.cl',
    },
  });

  console.log(`Empresa creada: ${empresa.nombre}`);

  // 2. Crear Usuario ADMIN
  const contrasenaHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { correo: 'admin@maestranzars.cl' },
    update: {},
    create: {
      id_empresa: empresa.id_empresa,
      nombre: 'Administrador Principal',
      correo: 'admin@maestranzars.cl',
      contrasena_hash: contrasenaHash,
      rol: 'ADMIN',
    },
  });

  console.log(`Usuario ADMIN creado: ${admin.correo} (pass: admin123)`);

  // Crear Usuario Técnico de prueba
  const tecnicoHash = await bcrypt.hash('tecnico123', 10);
  await prisma.usuario.upsert({
    where: { correo: 'tecnico@maestranzars.cl' },
    update: {},
    create: {
      id_empresa: empresa.id_empresa,
      nombre: 'Técnico Especialista',
      correo: 'tecnico@maestranzars.cl',
      contrasena_hash: tecnicoHash,
      rol: 'TECNICO',
    },
  });

  // 3. Crear Gastos de prueba
  console.log('Creando gastos de prueba...');
  await prisma.gasto.deleteMany({});
  await prisma.gasto.createMany({
    data: [
      {
        id_empresa: empresa.id_empresa,
        descripcion: 'Compra de Soldadura Arco Manual INDURA 7018',
        monto: 45000,
        fecha: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
        categoria: 'SOLDADURA'
      },
      {
        id_empresa: empresa.id_empresa,
        descripcion: 'Par de sellos hidráulicos para cilindro Komatsu',
        monto: 120000,
        fecha: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
        categoria: 'REPUESTOS'
      },
      {
        id_empresa: empresa.id_empresa,
        descripcion: 'Pago de Electricidad Taller - Compañía CGE',
        monto: 85000,
        fecha: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20),
        categoria: 'SERVICIOS'
      },
      {
        id_empresa: empresa.id_empresa,
        descripcion: 'Juego de llaves punta corona Stanley (8-24mm)',
        monto: 65000,
        fecha: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
        categoria: 'HERRAMIENTAS'
      },
      {
        id_empresa: empresa.id_empresa,
        descripcion: 'Aceite hidráulico Mobil DTE 25 (Balde 20L)',
        monto: 98000,
        fecha: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 5),
        categoria: 'INSUMOS'
      }
    ]
  });
  console.log('Gastos de prueba creados.');

  console.log('Seed terminado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
