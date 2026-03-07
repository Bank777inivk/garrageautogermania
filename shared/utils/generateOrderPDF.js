import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateOrderPDF = (order, settings = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Use settings or defaults
  const companyName = settings?.companyName || "AUTO IMPORT PRO";
  const address = settings?.address || "123 Avenue des Champs-Élysées";
  const city = settings?.city || "75008 Paris, France";
  const email = settings?.email || "contact@autoimport-pro.com";
  const phone = settings?.phone || "+33 1 23 45 67 89";
  const iban = settings?.iban || "DE56 1001 1001 2176 5100 26";
  const bic = settings?.bic || "NTSBDEB1XXX";
  const bankHolder = settings?.bankHolder || "Jennifer Suß";
  const siret = settings?.siret || "123 456 789 00010";
  const tva = settings?.tva || "FR 12 345 678 901";

  // Colors
  const primaryColor = [220, 38, 38]; // Red-600
  const grayColor = [107, 114, 128]; // Gray-500
  const blackColor = [17, 24, 39]; // Gray-900

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(companyName, 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text("Spécialiste de l'importation automobile", 20, 26);

  // Company Info (Right side)
  doc.setFontSize(9);
  doc.setTextColor(...blackColor);
  doc.text(address, pageWidth - 20, 20, { align: "right" });
  doc.text(city, pageWidth - 20, 25, { align: "right" });
  doc.text(email, pageWidth - 20, 30, { align: "right" });
  doc.text(phone, pageWidth - 20, 35, { align: "right" });

  // Title
  doc.setDrawColor(...grayColor);
  doc.line(20, 45, pageWidth - 20, 45);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text(`BON DE COMMANDE N° ${order.orderNumber}`, 20, 60);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const orderDate = order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
    : new Date().toLocaleDateString('fr-FR');
  doc.text(`Date : ${orderDate}`, 20, 66);

  // Client Info
  doc.setFillColor(243, 244, 246); // Gray-100
  doc.rect(20, 75, pageWidth / 2 - 25, 40, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("INFORMATIONS CLIENT", 25, 82);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.customer?.firstName} ${order.customer?.lastName}`, 25, 90);
  doc.text(`${order.customer?.address}`, 25, 95);
  doc.text(`${order.customer?.zipCode} ${order.customer?.city}`, 25, 100);
  doc.text(`${order.customer?.country}`, 25, 110);
  doc.text(`Tél : ${order.customer?.phone}`, 25, 110);

  // Vehicle Info
  const item = order.items && order.items[0] ? order.items[0] : {};

  doc.setFillColor(243, 244, 246);
  doc.rect(pageWidth / 2 + 5, 75, pageWidth / 2 - 25, 40, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("VÉHICULE COMMANDÉ", pageWidth / 2 + 10, 82);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${item.brand} ${item.model}`, pageWidth / 2 + 10, 90);
  doc.text(`Référence : ${item.id}`, pageWidth / 2 + 10, 95);
  doc.text(`Prix unitaire : ${Number(item.price).toLocaleString()} €`, pageWidth / 2 + 10, 100);

  // Order Details Table
  const tableTop = 130;

  doc.setDrawColor(229, 231, 235);
  doc.line(20, tableTop, pageWidth - 20, tableTop);

  doc.setFont('helvetica', 'bold');
  doc.text("Désignation", 25, tableTop + 8);
  doc.text("Total", pageWidth - 25, tableTop + 8, { align: "right" });

  doc.line(20, tableTop + 12, pageWidth - 20, tableTop + 12);

  doc.setFont('helvetica', 'normal');
  doc.text(`${item.brand} ${item.model}`, 25, tableTop + 20);
  doc.text(`${Number(item.price).toLocaleString()} €`, pageWidth - 25, tableTop + 20, { align: "right" });

  doc.text("Frais de dossier & Expédition", 25, tableTop + 30);
  doc.text(`${order.shipping === 0 ? 'Offerts' : order.shipping + ' €'}`, pageWidth - 25, tableTop + 30, { align: "right" });

  doc.line(20, tableTop + 40, pageWidth - 20, tableTop + 40);

  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("TOTAL À PAYER", pageWidth - 80, tableTop + 50);
  doc.setTextColor(...primaryColor);
  doc.text(`${order.total?.toLocaleString()} €`, pageWidth - 25, tableTop + 50, { align: "right" });
  doc.setTextColor(...blackColor);

  // Bank Details
  const bankTop = 200;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("COORDONNÉES BANCAIRES", 20, bankTop);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Titulaire : ${bankHolder}`, 20, bankTop + 8);
  doc.text(`IBAN : ${iban}`, 20, bankTop + 14);
  doc.text(`BIC : ${bic}`, 20, bankTop + 20);
  doc.text(`Référence à indiquer : ${order.orderNumber}`, 20, bankTop + 26);

  // Signatures
  const signTop = 240;
  doc.setFontSize(10);
  doc.text("Signature du Client", 40, signTop);
  doc.text(`Pour ${companyName}`, pageWidth - 70, signTop);

  // Seal/Signature images could be added here if we have them as base64
  if (settings?.signatureUrl) {
    // Note: This would require loading image first
  }

  doc.setDrawColor(...grayColor);
  doc.line(20, signTop + 5, 80, signTop + 5);
  doc.line(pageWidth - 80, signTop + 5, pageWidth - 20, signTop + 5);

  doc.text("Lu et approuvé", 40, signTop + 35);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`${companyName} - SIRET : ${siret}`, pageWidth / 2, 280, { align: "center" });
  doc.text(`TVA Intracommunautaire : ${tva}`, pageWidth / 2, 285, { align: "center" });

  // Save
  doc.save(`Bon_Commande_${order.orderNumber}.pdf`);
};
