"use client";

import React from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { GenerateReportRequest } from './types';

const formatDateString = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month < 10 ? '0' : ''}${month}/${day < 10 ? '0' : ''}${day}/${year}`;
};

const formatPhoneNumber = (phoneNumber: string) => {
  return `(${phoneNumber.substring(0, 2)}) ${phoneNumber.substring(2, 6)}-${phoneNumber.substring(6, 10)}`;
};

const formatPrice = (price: number) => {
  return (price / 100).toFixed(2);
};

const generatePDF = async (request: GenerateReportRequest) => {
  const { month, data } = request;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  page.drawText(`Compras do mes de ${month}`, {
    x: 50,
    y: 350,
    size: 24,
    color: rgb(0, 0, 0),
  });

  let yPosition = 320;
  let totalValue = 0;

  const records = Array.isArray(data) ? data : [data];
  for (const record of records) {
    page.drawText(`Data: ${formatDateString(record.purchaseDate)}`, { x: 50, y: yPosition, size: 12 });
    page.drawText(`Cliente: ${record.client.name}`, { x: 200, y: yPosition, size: 12 });
    page.drawText(`Celular: ${formatPhoneNumber(record.client.phone)}`, { x: 400, y: yPosition, size: 12 });

    for (const product of record.products) {
      yPosition -= 15;
      page.drawText(`Produto: ${product.product.name}`, { x: 50, y: yPosition, size: 12 });
      page.drawText(`Quantidade: ${product.quantity}`, { x: 200, y: yPosition, size: 12 });
      const productValue = formatPrice(product.product.price * product.quantity);
      totalValue += (product.product.price * product.quantity);
      page.drawText(`R$ ${productValue}`, { x: 350, y: yPosition, size: 12 });
    }

    yPosition -= 25;
  }

  page.drawText(`Valor Total: R$ ${formatPrice(totalValue)}`, { x: 50, y: yPosition, size: 12 });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

const Home: React.FC = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/purchases/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: '2024-09-30',
          end: '2024-10-30',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const reportData = await response.json();

      const pdfBytes = await generatePDF({ month: "setembro", data: reportData });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'purchases_report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={handleDownload}>
        Download Purchases of the Month
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  button: {
    padding: '15px 30px',
    fontSize: '16px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default Home;
