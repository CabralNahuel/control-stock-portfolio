import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getMetricasComprasRetiros } from "@/app/services/articulos";
import { getCurrentUser, tieneRol } from "@/app/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !tieneRol(user, ["ADMIN", "JEFE_COMPRAS"])) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  if (!desde || !hasta) {
    return NextResponse.json({ error: "Parámetros 'desde' y 'hasta' requeridos" }, { status: 400 });
  }

  const metricas = await getMetricasComprasRetiros(desde, hasta);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Métricas", {
    views: [{ state: "frozen", ySplit: 9 }],
  });

  sheet.columns = [
    { header: "Artículo", key: "articulo", width: 38 },
    { header: "Compras (u)", key: "compras", width: 14 },
    { header: "Retiros (u)", key: "retiros", width: 14 },
    { header: "Stock actual", key: "stock", width: 14 },
  ];

  // Título
  sheet.mergeCells("A1:D1");
  const titulo = sheet.getCell("A1");
  titulo.value = `Métricas de ${desde} a ${hasta}`;
  titulo.font = { bold: true, size: 14, color: { argb: "FF1F2937" } };
  titulo.alignment = { horizontal: "left", vertical: "middle" };

  // Resumen
  sheet.mergeCells("A3:D3");
  const resumenTitle = sheet.getCell("A3");
  resumenTitle.value = "Resumen";
  resumenTitle.font = { bold: true, color: { argb: "FF0EA5E9" } };

  const resumenHeader = sheet.addRow(["Tipo", "Movimientos", "Unidades"]);
  resumenHeader.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0EA5E9" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFD1D5DB" } },
      left: { style: "thin", color: { argb: "FFD1D5DB" } },
      bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
      right: { style: "thin", color: { argb: "FFD1D5DB" } },
    };
  });
  sheet.addRow(["Compras", metricas.compras.movimientos, metricas.compras.unidades]);
  sheet.addRow(["Retiros", metricas.retiros.movimientos, metricas.retiros.unidades]);

  // Separador + detalle
  sheet.mergeCells("A8:D8");
  const detalleTitle = sheet.getCell("A8");
  detalleTitle.value = "Detalle por artículo";
  detalleTitle.font = { bold: true, color: { argb: "FF0EA5E9" } };

  const headerDetalle = sheet.getRow(9);
  headerDetalle.values = ["Artículo", "Compras (u)", "Retiros (u)", "Stock actual"];
  headerDetalle.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0284C7" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFD1D5DB" } },
      left: { style: "thin", color: { argb: "FFD1D5DB" } },
      bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
      right: { style: "thin", color: { argb: "FFD1D5DB" } },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  metricas.porArticulo.forEach((p) => {
    const row = sheet.addRow([
      p.nombre,
      p.comprasUnidades,
      p.retirosUnidades,
      p.stockActual,
    ]);
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 1 ? "left" : "right",
      };
    });
  });

  // Auto filtro en tabla de detalle.
  sheet.autoFilter = {
    from: "A9",
    to: "D9",
  };

  const buffer = await workbook.xlsx.writeBuffer();

  const fileName = `metricas_${desde}_${hasta}.xlsx`;

  return new NextResponse(Buffer.from(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}

