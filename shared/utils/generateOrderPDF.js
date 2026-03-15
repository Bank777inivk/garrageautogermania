import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadLocalImage } from './loadLocalImage';

export const generateOrderPDF = async (order, settings = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Load default stamp and signature from /public if not set
  const stampUrl = settings?.documents?.stampUrl || null;
  const signatureUrl = settings?.documents?.signatureUrl || null;
  const defaultStamp = await loadLocalImage('/garrage_stamp_pro_1772904455871.png');
  const defaultSignature = await loadLocalImage('/garrage_signature_gerant_1772905088803.png');
  const finalStamp = stampUrl || defaultStamp;
  const finalSignature = signatureUrl || defaultSignature;

  // Use settings or defaults
  const companyName = settings?.companyName || "GARRAGE AUTO GERMANIA";
  const address = settings?.addressDetails?.street || settings?.address || "123 Avenue de l'Automobile";
  const city = `${settings?.addressDetails?.zip || ''} ${settings?.addressDetails?.city || ''}${settings?.addressDetails?.country ? ', ' + settings?.addressDetails?.country : ''}`.trim() || "75000 Paris, France";
  const email = settings?.email || "contact@garrageautogermania.com";
  const phone = settings?.phone || "+33 1 23 45 67 89";

  const rib = settings?.rib || {};
  const iban = rib.iban || settings?.iban || "FR76...";
  const bic = rib.bic || settings?.bic || "BNPP...";
  const bankHolder = rib.titulaire || settings?.bankHolder || "GARRAGE AUTO GERMANIA";
  const bankName = rib.bankName || "BNP Paribas";

  const siret = settings?.siret || "N/A";
  const tva = settings?.tva || "N/A";

  // Colors
  const primaryColor = [220, 38, 38]; // Red-600
  const grayColor = [107, 114, 128]; // Gray-500
  const blackColor = [17, 24, 39]; // Gray-900

  // Helper for white background on logo
  const getWhiteBgLogoUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/b_rgb:FFFFFF,f_jpg,c_pad/');
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0 €';
    const num = Math.round(Number(price));
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €";
  };

  // Header: Logo or Company Name
  if (settings?.logoUrl) {
    try {
      const logoUrl = getWhiteBgLogoUrl(settings.logoUrl);
      // Draw white background rectangle
      doc.setFillColor(255, 255, 255);
      doc.rect(20, 10, 50, 25, 'F');

      // Add logo: forced to JPEG for white background consistency
      doc.addImage(logoUrl, 'JPEG', 20, 10, 50, 25);
    } catch (e) {
      console.error("Order logo error:", e);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(companyName, 20, 20);
    }
  } else {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(companyName, 20, 20);
  }

  // Company Info (Right side)
  doc.setFontSize(8.5);
  doc.setTextColor(...blackColor);
  doc.text(address, pageWidth - 20, 20, { align: "right" });
  doc.text(city, pageWidth - 20, 24, { align: "right" });
  doc.text(email, pageWidth - 20, 28, { align: "right" });
  doc.text(phone, pageWidth - 20, 32, { align: "right" });

  // Title (Further reduced for perfect spacing)
  doc.setDrawColor(...grayColor);
  doc.line(20, 40, pageWidth - 20, 40);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text(`BON DE COMMANDE N° ${order.orderNumber}`, 20, 50);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const orderDate = order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
    : new Date().toLocaleDateString('fr-FR');
  doc.text(`Date : ${orderDate}`, 20, 58);

  // Client Info
  doc.setFillColor(243, 244, 246); // Gray-100
  doc.rect(20, 68, pageWidth / 2 - 25, 35, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("INFORMATIONS CLIENT", 25, 74);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.customer?.firstName} ${order.customer?.lastName}`, 25, 80);
  doc.text(`${order.customer?.address}`, 25, 85);
  doc.text(`${order.customer?.zipCode} ${order.customer?.city}`, 25, 90);
  // Tél fix (remove duplicate 110 line if any)
  doc.text(`Tél : ${order.customer?.phone || 'N/A'}`, 25, 95);

  // Vehicle Info
  const item = order.items && order.items[0] ? order.items[0] : {};
  const formattedRef = item.id && item.id.length > 8 ? item.id.substring(0, 8).toUpperCase() : (item.id || 'N/A');
  const displayPrice = item.effectivePrice || (item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price);
  const formattedUnitPrice = formatPrice(displayPrice || 0);

  doc.setFillColor(243, 244, 246);
  doc.rect(pageWidth / 2 + 5, 68, pageWidth / 2 - 25, 35, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("VÉHICULE COMMANDÉ", pageWidth / 2 + 10, 74);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${item.brand} ${item.model}`, pageWidth / 2 + 10, 80);
  doc.text(`Référence : ${formattedRef}`, pageWidth / 2 + 10, 85);
  doc.text(`Prix unitaire : ${formattedUnitPrice}`, pageWidth / 2 + 10, 90);

  // Order Details Table
  const tableTop = 115;

  doc.setDrawColor(229, 231, 235);
  doc.line(20, tableTop, pageWidth - 20, tableTop);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("Désignation", 25, tableTop + 7);
  doc.text("Total", pageWidth - 25, tableTop + 7, { align: "right" });

  doc.line(20, tableTop + 10, pageWidth - 20, tableTop + 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${item.brand} ${item.model}`, 25, tableTop + 16);
  doc.text(formattedUnitPrice, pageWidth - 25, tableTop + 16, { align: "right" });

  doc.text("Frais de dossier & Expédition", 25, tableTop + 24);
  const shippingText = order.shipping === 0 ? 'Offerts' : formatPrice(order.shipping || 0);
  doc.text(shippingText, pageWidth - 25, tableTop + 24, { align: "right" });

  let summaryY = tableTop + 32;
  if (order.discountAmount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38); // Red for discount
    doc.text(`Remise Exceptionnelle Paiement Intégral (-15%)`, 25, summaryY + 8);
    doc.text(`-${formatPrice(order.discountAmount)}`, pageWidth - 25, summaryY + 8, { align: "right" });
    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'normal');
    summaryY += 10;
  }

  doc.line(20, summaryY + 2, pageWidth - 20, summaryY + 2);

  // Total
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("TOTAL NET À RÉGLER", pageWidth - 80, summaryY + 10);
  doc.setTextColor(...primaryColor);
  doc.text(formatPrice(order.total || 0), pageWidth - 25, summaryY + 10, { align: "right" });
  doc.setTextColor(...blackColor);

  // Payment Breakdown
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  const paymentText = order.paymentOption === 'full' 
    ? "Option choisie : Règlement intégral immédiat (Remise 15% appliquée)"
    : "Option choisie : Règlement par acompte de 30% (Solde à la livraison)";
  doc.text(paymentText, 20, summaryY + 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`MONTANT DU VIREMENT ATTENDU : ${formatPrice(order.amountToPayNow || 0)}`, 20, summaryY + 32);

  // Bank Details
  const bankTop = 180;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("COORDONNÉES BANCAIRES", 20, bankTop);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Banque : ${bankName}`, 20, bankTop + 8);
  doc.text(`Titulaire : ${bankHolder}`, 20, bankTop + 14);
  doc.text(`IBAN : ${iban}`, 20, bankTop + 20);
  doc.text(`BIC : ${bic}`, 20, bankTop + 26);

  doc.setFont('helvetica', 'bold');
  doc.text(`Référence à indiquer : ${order.orderNumber}`, 20, bankTop + 34);

  // Signatures
  const signTop = 225;
  const managerName = settings?.documents?.managerName || '';
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("Le Client", 40, signTop);
  doc.text(`Pour ${companyName}`, pageWidth - 80, signTop);

  doc.setDrawColor(200, 200, 200);
  doc.line(20, signTop + 4, 80, signTop + 4);
  doc.line(pageWidth - 80, signTop + 4, pageWidth - 20, signTop + 4);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text("(Signature précédée de la mention 'Lu et approuvé')", 20, signTop + 10);
  if (managerName) {
    doc.setFont('helvetica', 'normal');
    doc.text(managerName, pageWidth - 80, signTop + 10);
  }

  // Stamp & Signature (default local or Cloudinary)
  if (finalStamp) {
    try { doc.addImage(finalStamp, 'PNG', pageWidth - 78, signTop + 12, 50, 50); }
    catch (e) { console.error("Stamp error:", e); }
  }
  if (finalSignature) {
    try {
      doc.addImage(finalSignature, 'PNG', pageWidth - 80, signTop + 24, 55, 28);
    }
    catch (e) { console.error("Signature error:", e); }
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Bon pour accord", 40, signTop + 25);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`${companyName} - SIRET : ${siret}`, pageWidth / 2, 280, { align: "center" });
  doc.text(`TVA Intracommunautaire : ${tva}`, pageWidth / 2, 285, { align: "center" });

  // Save
  doc.save(`Bon_Commande_${order.orderNumber}.pdf`);
};
