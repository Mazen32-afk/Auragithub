import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product } from '../types';

export function exportInventoryToCSV(products: Product[], currencySymbol: string = '$'): void {
  const headers = ['SKU / Barcode', 'Product Name', 'Category', 'Quantity', 'Unit Price', 'Total Valuation', 'Stock Status', 'Last Updated'];
  
  const rows = products.map((p) => {
    const totalVal = (p.quantity * p.price).toFixed(2);
    const status = p.quantity === 0 ? 'OUT OF STOCK' : p.quantity < 5 ? 'LOW STOCK (<5)' : 'IN STOCK';
    
    // Escape double quotes and commas
    const cleanName = `"${p.name.replace(/"/g, '""')}"`;
    const cleanCat = `"${p.category.replace(/"/g, '""')}"`;
    const cleanBarcode = `"${p.barcode}"`;
    const cleanPrice = `${p.price.toFixed(2)}`;
    const cleanDate = `"${new Date(p.updatedAt).toLocaleDateString()} ${new Date(p.updatedAt).toLocaleTimeString()}"`;

    return [
      cleanBarcode,
      cleanName,
      cleanCat,
      p.quantity,
      cleanPrice,
      totalVal,
      status,
      cleanDate
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `inventory_report_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInventoryToPDF(products: Product[], currencySymbol: string = '$'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalFinancialVal = products.reduce((acc, p) => acc + p.quantity * p.price, 0);
  const totalUnits = products.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockCount = products.filter((p) => p.quantity < 5).length;
  const now = new Date();
  const dateFormatted = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

  // Dark header banner
  doc.setFillColor(15, 20, 30);
  doc.rect(0, 0, 210, 42, 'F');

  // Gold accent line
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 42, 210, 2, 'F');

  // Title in White / Amber
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AURASTOCK INVENTORY REPORT', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 190, 205);
  doc.text('Android & Mobile Warehouse Valuation Statement', 14, 26);
  doc.text(`Generated: ${dateFormatted}`, 14, 33);

  // Summary Metrics Box
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Total Value: ${currencySymbol}${totalFinancialVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 140, 18);
  doc.text(`Total Units: ${totalUnits.toLocaleString()}`, 140, 25);
  doc.text(`Active SKUs: ${products.length}  |  Low Stock (<5): ${lowStockCount}`, 140, 32);

  // Table Data preparation
  const tableData = products.map((p) => {
    const isLow = p.quantity < 5;
    const lineTotal = `${currencySymbol}${(p.quantity * p.price).toFixed(2)}`;
    const statusText = p.quantity === 0 ? 'OUT (0)' : isLow ? `LOW (${p.quantity})` : 'HEALTHY';
    return [
      p.barcode,
      p.name,
      p.category,
      p.quantity.toString(),
      `${currencySymbol}${p.price.toFixed(2)}`,
      lineTotal,
      statusText
    ];
  });

  autoTable(doc, {
    startY: 48,
    head: [['Barcode / SKU', 'Product Name', 'Category', 'Qty', 'Unit Price', 'Line Value', 'Stock Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [20, 26, 40],
      textColor: [245, 158, 11],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 32, font: 'courier' },
      1: { cellWidth: 50 },
      2: { cellWidth: 26 },
      3: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 22, halign: 'center' }
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 2.8,
    },
    didParseCell: (data) => {
      // Highlight low stock (< 5) cells in table
      if (data.section === 'body') {
        const rowData = products[data.row.index];
        if (rowData && rowData.quantity < 5) {
          if (data.column.index === 3 || data.column.index === 6) {
            data.cell.styles.textColor = [220, 38, 38]; // Red highlight
            data.cell.styles.fillColor = [254, 226, 226];
          }
        }
      }
    },
    foot: [
      ['', 'TOTAL FINANCIAL VALUATION', '', totalUnits.toString(), '', `${currencySymbol}${totalFinancialVal.toFixed(2)}`, '']
    ],
    footStyles: {
      fillColor: [240, 243, 248],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 9
    }
  });

  const dateStr = now.toISOString().slice(0, 10);
  doc.save(`AuraStock_Inventory_${dateStr}.pdf`);
}
