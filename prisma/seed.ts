// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

async function main() {
  console.log("Starting demo seed...");

  try {
    // Demo categories
    await prisma.categoria.createMany({
      data: [
        { nombre: "Office Supplies" },
        { nombre: "IT Equipment" },
        { nombre: "Maintenance" },
      ],
      skipDuplicates: true
    });

    const categorias = await prisma.categoria.findMany();

    const office = categorias.find(c => c.nombre === "Office Supplies")!;
    const it = categorias.find(c => c.nombre === "IT Equipment")!;
    const maintenance = categorias.find(c => c.nombre === "Maintenance")!;

    // Demo items
    await prisma.articulo.createMany({
      data: [
        { nombre: "A4 Paper Pack", stock: 80, categoriaId: office.id, stockBajo: 25 },
        { nombre: "Permanent Marker", stock: 45, categoriaId: office.id, stockBajo: 15 },
        { nombre: "USB-C Dock", stock: 12, categoriaId: it.id, stockBajo: 5 },
        { nombre: "Wireless Mouse", stock: 28, categoriaId: it.id, stockBajo: 10 },
        { nombre: "Ethernet Cable 2m", stock: 40, categoriaId: it.id, stockBajo: 12 },
        { nombre: "Cleaning Kit", stock: 16, categoriaId: maintenance.id, stockBajo: 6 },
        { nombre: "Safety Gloves", stock: 30, categoriaId: maintenance.id, stockBajo: 10 },
        { nombre: "Industrial Tape", stock: 22, categoriaId: maintenance.id, stockBajo: 8 },
      ],
      skipDuplicates: true
    });

    const articulos = await prisma.articulo.findMany();

    const paper = articulos.find(a => a.nombre === "A4 Paper Pack")!;
    const dock = articulos.find(a => a.nombre === "USB-C Dock")!;
    const tape = articulos.find(a => a.nombre === "Industrial Tape")!;

    // Demo users
    const demoPassword = await bcrypt.hash("demo1234", SALT_ROUNDS);
    await prisma.usuario.createMany({
      data: [
        { nombre: "admin_demo", password: demoPassword, rol: "ADMIN" },
        { nombre: "manager_demo", password: demoPassword, rol: "JEFE_COMPRAS" },
        { nombre: "staff_demo", password: demoPassword, rol: "EMPLEADO" },
      ],
      skipDuplicates: true,
    });

    const usuarios = await prisma.usuario.findMany();
    const admin = usuarios.find((u) => u.nombre === "admin_demo");
    const manager = usuarios.find((u) => u.nombre === "manager_demo");

    // Demo purchases
    await prisma.compra.createMany({
      data: [
        { cantidad: 24, articuloId: paper.id, usuarioId: admin?.id },
        { cantidad: 8, articuloId: dock.id, usuarioId: manager?.id },
        { cantidad: 15, articuloId: tape.id, usuarioId: admin?.id },
      ],
      skipDuplicates: true,
    });

    // Demo withdrawals
    await prisma.retiro.createMany({
      data: [
        { cantidad: 4, articuloId: paper.id, usuarioId: admin?.id ?? 1 },
        { cantidad: 2, articuloId: dock.id, usuarioId: manager?.id ?? 1 },
      ],
      skipDuplicates: true,
    });

    console.log("Demo seed completed.");
  } catch (e) {
    console.error("Seed failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();