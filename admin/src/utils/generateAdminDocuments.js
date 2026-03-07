import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const primaryColor = [15, 23, 42]; // Slate-900 (Premium dark)
const accentColor = [185, 28, 28]; // Red-700
const grayColor = [100, 116, 139]; // Slate-500

const drawHeader = (doc, settings, title) => {
    const pageWidth = doc.internal.pageSize.width;

    // Left: Company Logo/Name
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(settings?.companyName || "AUTO IMPORT", 20, 25);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);


    // Right: Document Title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text(title.toUpperCase(), pageWidth - 20, 30, { align: 'right' });

    doc.setDrawColor(...accentColor);
    doc.setLineWidth(1);
    doc.line(pageWidth - 100, 35, pageWidth - 20, 35);
};

const drawFooter = (doc, settings) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    const footerText = `${settings?.companyName} - SIRET: ${settings?.siret || 'N/A'} - TVA: ${settings?.tva || 'N/A'} - ${settings?.address || ''}, ${settings?.city || ''}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
};

export const generateContractPDF = (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    drawHeader(doc, settings, "Contrat de Vente");

    // Addresses Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("VENDEUR", 20, 55);
    doc.text("ACHETEUR", pageWidth / 2 + 10, 55);

    doc.setFont('helvetica', 'normal');
    doc.text(settings?.companyName || "Auto Import", 20, 62);
    doc.text(settings?.address || "", 20, 67);
    doc.text(`${settings?.zipCode || ""} ${settings?.city || ""}`, 20, 72);
    doc.text(settings?.email || "", 20, 77);

    doc.text(`${order.customer?.firstName} ${order.customer?.lastName}`, pageWidth / 2 + 10, 62);
    doc.text(order.customer?.address || "", pageWidth / 2 + 10, 67);
    doc.text(`${order.customer?.zipCode || ""} ${order.customer?.city || ""}`, pageWidth / 2 + 10, 72);
    doc.text(order.customer?.country || "", pageWidth / 2 + 10, 77);

    // Contract Details
    doc.setFont('helvetica', 'bold');
    doc.text(`RÉFÉRENCE CONTRAT : C-${order.orderNumber}`, 20, 95);
    doc.text(`DATE : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, 95, { align: 'right' });

    // Vehicle Table
    autoTable(doc, {
        startY: 105,
        head: [['Désignation du véhicule', 'Référence', 'Prix TTC']],
        body: order.items.map(item => [
            `${item.brand} ${item.model}`,
            item.id,
            `${Number(item.price).toLocaleString()} €`
        ]),
        headStyles: { fillGray: [240, 240, 240], textColor: primaryColor, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 5 },
    });

    const finalY = doc.lastAutoTable.finalY + 20;

    // Legal Content
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("CONDITIONS PARTICULIÈRES", 20, finalY);
    doc.setFont('helvetica', 'normal');
    const legalText = "Le présent contrat atteste de la vente des véhicules listés ci-dessus. Le vendeur s'engage à livrer un véhicule conforme à la description fournie. L'acheteur s'engage à régler la somme totale mentionnée selon les modalités de paiement convenues (Virement bancaire). Le transfert de propriété aura lieu à réception totale des fonds.";
    doc.text(doc.splitTextToSize(legalText, pageWidth - 40), 20, finalY + 7);

    // Signatures
    doc.setFont('helvetica', 'bold');
    doc.text("Signature de l'acheteur (Précédé de 'Bon pour accord')", 20, finalY + 40);
    doc.text(`Signature & Cachet de ${settings?.companyName}`, pageWidth - 20, finalY + 40, { align: 'right' });

    if (settings?.stampUrl) {
        // Stamp logic (requires async loading)
    }

    drawFooter(doc, settings);
    doc.save(`Contrat_${order.orderNumber}.pdf`);
};

export const generateInvoicePDF = (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    drawHeader(doc, settings, "Facture");

    // Invoice Meta
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`FACTURE N° F-${order.orderNumber}`, 20, 50);
    doc.text(`DATE D'ÉMISSION : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, 50, { align: 'right' });

    // Billing Flow
    autoTable(doc, {
        startY: 65,
        head: [['Description', 'Quantité', 'Prix Unitaire', 'Total']],
        body: order.items.map(item => [
            `${item.brand} ${item.model}\nRéférence : ${item.id}`,
            '1',
            `${Number(item.price).toLocaleString()} €`,
            `${Number(item.price).toLocaleString()} €`
        ]),
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("TOTAL NET À PAYER :", pageWidth - 100, finalY + 10);
    doc.setTextColor(...accentColor);
    doc.text(`${order.total?.toLocaleString()} €`, pageWidth - 20, finalY + 10, { align: 'right' });

    // Payment Info
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.text("Coordonnées de paiement :", 20, finalY + 30);
    doc.setFont('helvetica', 'normal');
    doc.text(`Banque : ${settings?.bankName || 'N/A'}`, 25, finalY + 37);
    doc.text(`IBAN : ${settings?.iban || 'N/A'}`, 25, finalY + 44);
    doc.text(`BIC : ${settings?.bic || 'N/A'}`, 25, finalY + 51);
    doc.text(`Titulaire : ${settings?.bankHolder || 'N/A'}`, 25, finalY + 58);

    drawFooter(doc, settings);
    doc.save(`Facture_${order.orderNumber}.pdf`);
};
