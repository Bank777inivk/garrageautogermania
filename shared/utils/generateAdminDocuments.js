import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadLocalImage } from './loadLocalImage';

const primaryColor = [15, 23, 42]; // Slate-900 (Premium dark)
const accentColor = [185, 28, 28]; // Red-700
const grayColor = [100, 116, 139]; // Slate-500

const getWhiteBgLogoUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    // Force white background and convert to JPG to eliminate transparency issues in PDFs
    return url.replace('/upload/', '/upload/b_rgb:FFFFFF,f_jpg,c_pad/');
};

const formatPrice = (price) => {
    if (price === undefined || price === null) return '0 €';
    const num = Math.round(Number(price));
    // Use regex for thousands separator with standard space to avoid jspdf font issues
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €";
};

const drawHeader = (doc, settings, title) => {
    const pageWidth = doc.internal.pageSize.width;

    // Left: Company Logo or Name
    if (settings?.logoUrl) {
        try {
            const logoUrl = getWhiteBgLogoUrl(settings.logoUrl);
            // Draw white background rectangle as a safeguard
            doc.setFillColor(255, 255, 255);
            doc.rect(20, 10, 50, 25, 'F');
            // Add logo: forced to JPEG for white background consistency
            doc.addImage(logoUrl, 'JPEG', 20, 10, 50, 25);
        } catch (e) {
            console.error("Header logo error:", e);
            // Fallback to name if logo fails
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...primaryColor);
            doc.text(settings?.companyName || "GARRAGE AUTO GERMANIA", 20, 25);
        }
    } else {
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(settings?.companyName || "GARRAGE AUTO GERMANIA", 20, 25);
    }

    // Right: Document Title (Resized to 16 for elegance and space)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text(title.toUpperCase(), pageWidth - 20, 25, { align: 'right' });

    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.8);
    doc.line(pageWidth - 70, 29, pageWidth - 20, 29);
};

const drawFooter = (doc, settings) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    const footerText = `${settings?.companyName} - SIRET: ${settings?.siret || 'N/A'} - TVA: ${settings?.tva || 'N/A'} - ${settings?.address || ''}, ${settings?.city || ''}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
};

export const generateContractPDF = async (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Load default stamp and signature from /public if not set
    const stampUrl = settings?.documents?.stampUrl || null;
    const signatureUrl = settings?.documents?.signatureUrl || null;
    const defaultStamp = await loadLocalImage('/garrage_stamp_pro_1772904455871.png');
    const defaultSignature = await loadLocalImage('/garrage_signature_gerant_1772905088803.png');
    const finalStamp = stampUrl || defaultStamp;
    const finalSignature = signatureUrl || defaultSignature;

    drawHeader(doc, settings, "Contrat de Vente");

    // Addresses Section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("VENDEUR", 20, 50);
    doc.text("ACHETEUR", pageWidth / 2 + 10, 50);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    const companyAddress = settings?.addressDetails?.street || settings?.address || "";
    const companyCity = `${settings?.addressDetails?.zip || ""} ${settings?.addressDetails?.city || ""}`.trim();
    const companyCountry = settings?.addressDetails?.country || "";

    doc.text(settings?.companyName || "Auto Import", 20, 57);
    doc.text(companyAddress, 20, 61);
    if (companyCity) doc.text(companyCity, 20, 65);
    if (companyCountry) doc.text(companyCountry, 20, 69);
    doc.text(`Tél : ${settings?.phone || ""}`, 20, 73);
    doc.text(`Email : ${settings?.email || ""}`, 20, 77);

    doc.text(`${order.customer?.firstName} ${order.customer?.lastName}`, pageWidth / 2 + 10, 57);
    doc.text(order.customer?.address || "", pageWidth / 2 + 10, 61);
    doc.text(`${order.customer?.zipCode || ""} ${order.customer?.city || ""}`, pageWidth / 2 + 10, 65);
    doc.text(order.customer?.country || "", pageWidth / 2 + 10, 69);
    doc.text(`Tél : ${order.customer?.phone || ""}`, pageWidth / 2 + 10, 73);

    // Contract Details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`RÉFÉRENCE CONTRAT : C-${order.orderNumber}`, 20, 88);
    doc.text(`DATE : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, 88, { align: 'right' });

    // Vehicle Table
    autoTable(doc, {
        startY: 95,
        head: [['Désignation du véhicule', 'Référence', 'Prix TTC']],
        body: order.items.map(item => [
            `${item.brand} ${item.model}`,
            item.id && item.id.length > 8 ? item.id.substring(0, 8).toUpperCase() : (item.id || 'N/A'),
            formatPrice(item.price)
        ]),
        headStyles: { fillGray: [240, 240, 240], textColor: primaryColor, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 4 },
    });

    const finalY = doc.lastAutoTable.finalY + 20;

    // Legal Content
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text("CONDITIONS PARTICULIÈRES", 20, finalY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    // Use dynamic contract terms from settings if available
    const legalText = settings?.documents?.contractTerms || "Le présent contrat atteste de la vente des véhicules listés ci-dessus. Le vendeur s'engage à livrer un véhicule conforme à la description fournie. L'acheteur s'engage à régler la somme totale mentionnée selon les modalités de paiement convenues (Virement bancaire). Le transfert de propriété aura lieu à réception totale des fonds.";

    doc.text(doc.splitTextToSize(legalText, pageWidth - 40), 20, finalY + 7);

    // Signatures Section
    const signTop = finalY + 45;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("L'ACHETEUR", 20, signTop);

    const sellerLabel = settings?.documents?.managerName ? `POUR ${settings.companyName.toUpperCase()}` : `POUR LE VENDEUR`;
    doc.text(sellerLabel, pageWidth - 20, signTop, { align: 'right' });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, signTop + 5, 80, signTop + 5);
    doc.line(pageWidth - 80, signTop + 5, pageWidth - 20, signTop + 5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text("(Signature précédée de la mention 'Lu et approuvé')", 20, signTop + 12);
    if (settings?.documents?.managerName) {
        doc.text(settings.documents.managerName, pageWidth - 20, signTop + 12, { align: 'right' });
    }

    // Add Stamp & Signature (from Cloudinary or local default)
    if (finalStamp) {
        try {
            doc.addImage(finalStamp, 'PNG', pageWidth - 75, signTop + 10, 50, 50);
        } catch (e) {
            console.error("Stamp error:", e);
        }
    }

    if (finalSignature) {
        try {
            doc.addImage(finalSignature, 'PNG', pageWidth - 78, signTop + 22, 55, 28);
        } catch (e) {
            console.error("Signature error:", e);
        }
    }

    drawFooter(doc, settings);
    doc.save(`Contrat_${order.orderNumber}.pdf`);
};

export const generateInvoicePDF = async (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    drawHeader(doc, settings, "Facture");

    // Invoice Meta
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`FACTURE N° F-${order.orderNumber}`, 20, 45);
    doc.text(`DATE D'ÉMISSION : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, 45, { align: 'right' });

    // Billing Flow
    autoTable(doc, {
        startY: 55,
        head: [['Description', 'Quantité', 'Prix Unitaire', 'Total']],
        body: order.items.map(item => [
            `${item.brand} ${item.model}\nRéférence : ${item.id && item.id.length > 8 ? item.id.substring(0, 8).toUpperCase() : (item.id || 'N/A')}`,
            '1',
            formatPrice(item.price),
            formatPrice(item.price)
        ]),
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        styles: { fontSize: 8, cellPadding: 4 },
        columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("TOTAL NET À PAYER :", pageWidth - 100, finalY + 8);
    doc.setTextColor(...accentColor);
    doc.text(formatPrice(order.total || 0), pageWidth - 20, finalY + 8, { align: 'right' });

    // Payment Info Section
    doc.setTextColor(...primaryColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("COORDONNÉES BANCAIRES :", 20, finalY + 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const rib = settings?.rib || {};
    doc.text(`Banque : ${rib.bankName || settings?.bankName || 'N/A'}`, 25, finalY + 32);
    doc.text(`IBAN : ${rib.iban || settings?.iban || 'N/A'}`, 25, finalY + 39);
    doc.text(`BIC : ${rib.bic || settings?.bic || 'N/A'}`, 25, finalY + 46);
    doc.text(`Titulaire : ${rib.titulaire || settings?.bankHolder || 'N/A'}`, 25, finalY + 53);

    // Dynamic Invoice Notes
    if (settings?.documents?.invoiceNotes) {
        doc.setFontSize(8);
        doc.setTextColor(...grayColor);
        doc.text(doc.splitTextToSize(settings.documents.invoiceNotes, pageWidth - 40), 20, finalY + 75);
    }

    drawFooter(doc, settings);
    doc.save(`Facture_${order.orderNumber}.pdf`);
};

export const generatePaymentReceiptPDF = async (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    drawHeader(doc, settings, "Reçu de Paiement");

    // Receipt Meta
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`REÇU N° R-${order.orderNumber}`, 20, 45);
    doc.text(`DATE D'ÉMISSION : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, 45, { align: 'right' });

    // Payment Info
    autoTable(doc, {
        startY: 55,
        head: [['Description', 'Quantité', 'Montant Payé']],
        body: order.items.map(item => [
            `${item.brand} ${item.model}\nRéférence : ${item.id && item.id.length > 8 ? item.id.substring(0, 8).toUpperCase() : (item.id || 'N/A')}`,
            '1',
            formatPrice(item.price)
        ]),
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        styles: { fontSize: 8, cellPadding: 4 },
        columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("TOTAL RÉGLÉ :", pageWidth - 100, finalY + 8);
    doc.setTextColor(...accentColor);
    doc.text(formatPrice(order.total || 0), pageWidth - 20, finalY + 8, { align: 'right' });

    doc.setTextColor(...primaryColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text("Ce document atteste que le montant total a été réglé en intégralité.", 20, finalY + 25);

    drawFooter(doc, settings);
    doc.save(`Recu_Paiement_${order.orderNumber}.pdf`);
};

export const generateDeliverySlipPDF = async (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    drawHeader(doc, settings, "Bordereau de Livraison");

    // Delivery Meta
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`BORDEREAU N° L-${order.orderNumber}`, 20, 45);
    doc.text(`DATE : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, 45, { align: 'right' });

    // Customer Info Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(20, 55, pageWidth - 40, 35, 3, 3, 'FD');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text("INFORMATIONS DU CLIENT", 25, 63);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`, 25, 70);
    doc.text(`${order.customer?.phone || ''}`, 25, 76);
    doc.text(`${order.customer?.email || ''}`, 25, 82);

    // Items table
    autoTable(doc, {
        startY: 100,
        head: [['Véhicule / Produit Livré', 'Référence', 'Quantité']],
        body: order.items.map(item => [
            `${item.brand} ${item.model}`,
            item.id ? item.id.substring(0, 8).toUpperCase() : 'N/A',
            '1'
        ]),
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        styles: { fontSize: 8, cellPadding: 4 },
    });

    const finalY = doc.lastAutoTable.finalY + 15;

    // Signature Block
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Le Client (Bon pour accord et réception)", 20, finalY);
    doc.text("Le Garage", pageWidth - 20, finalY, { align: 'right' });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, finalY + 5, 80, finalY + 5);
    doc.line(pageWidth - 80, finalY + 5, pageWidth - 20, finalY + 5);

    // Stamp and Signature for Garage
    try {
        const finalStamp = settings?.documents?.stampUrl ? getWhiteBgLogoUrl(settings.documents.stampUrl) : await loadLocalImage('/garrage_stamp_pro_1772904455871.png');
        const finalSignature = settings?.documents?.signatureUrl ? getWhiteBgLogoUrl(settings.documents.signatureUrl) : await loadLocalImage('/garrage_signature_gerant_1772905088803.png');

        if (finalStamp) {
            doc.addImage(finalStamp, 'PNG', pageWidth - 70, finalY + 10, 40, 40);
        }
        if (finalSignature) {
            doc.addImage(finalSignature, 'PNG', pageWidth - 70, finalY + 20, 50, 25);
        }
    } catch (error) {
        console.error("Error drawing stamp/signature on delivery slip", error);
    }

    drawFooter(doc, settings);
    doc.save(`Bordereau_Livraison_${order.orderNumber}.pdf`);
};
