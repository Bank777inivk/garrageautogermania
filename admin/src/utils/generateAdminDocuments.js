import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const primaryColor = [20, 33, 61]; // #14213D (Deep Blue)
const accentColor = [252, 163, 17]; // #FCA311 (Amber Gold)
const grayColor = [148, 163, 184]; // Slate-400

const getWhiteBgLogoUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    // Force white background and convert to JPG, using 'limit' to avoid internal padding
    return url.replace('/upload/', '/upload/b_rgb:FFFFFF,f_jpg,c_limit,w_500,h_250/');
};

const drawHeader = (doc, settings, title) => {
    const pageWidth = doc.internal.pageSize.width;

    // Left: Company logo if exists, else name
    if (settings?.logoUrl) {
        try {
            const logoUrl = getWhiteBgLogoUrl(settings.logoUrl);
            doc.addImage(logoUrl, 'JPEG', 20, 10, 50, 25);
        } catch (e) {
            console.error("Header logo error:", e);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...primaryColor);
            doc.text(settings?.companyName?.toUpperCase() || "AUTO IMPORT", 20, 25);
        }
    } else {
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(settings?.companyName?.toUpperCase() || "AUTO IMPORT", 20, 25);
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    const subtitleY = settings?.logoUrl ? 38 : 32;
    // Aligning subtitle strictly to x=20
    doc.text("DOCUMENT OFFICIEL ET CERTIFIÉ", 20, subtitleY);

    // Dynamic Legal Info in Header
    doc.setFontSize(7);
    doc.setTextColor(...grayColor);
    let legalInfo = [];
    if (settings?.siret) legalInfo.push(`SIRET: ${settings.siret}`);
    if (settings?.tva) legalInfo.push(`TVA: ${settings.tva}`);
    if (legalInfo.length > 0) {
        doc.text(legalInfo.join("  |  "), 20, subtitleY + 4);
    }

    // Right: Document Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(title.toUpperCase(), pageWidth - 20, 25, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(...accentColor);
    const subtitle = title.toLowerCase() === 'facture' ? 'PROFORMA OFFICIEL' : 'CONVENTION DE VENTE';
    doc.text(subtitle, pageWidth - 20, 32, { align: 'right' });

    doc.setDrawColor(...accentColor);
    doc.setLineWidth(1.5);
    doc.line(pageWidth - 80, 36, pageWidth - 20, 36);
};

const drawFooter = (doc, settings) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    const footerText = `${settings?.companyName} - SIRET: ${settings?.siret || 'N/A'} - TVA: ${settings?.tva || 'N/A'} - ${settings?.address || ''}, ${settings?.city || ''}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 12, { align: 'center' });
};

export const generateContractPDF = (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    drawHeader(doc, settings, "Bon de Commande");

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

    // Vehicle Table - AMBER GOLD THEME
    autoTable(doc, {
        startY: 105,
        head: [['Désignation du véhicule', 'Référence / Châssis', 'Prix TTC']],
        body: order.items.map(item => [
            `${item.brand} ${item.model}`,
            item.vin || item.id?.substring(0, 10).toUpperCase() || 'N/A',
            `${Number(item.price).toLocaleString()} €`
        ]),
        styles: { fontSize: 8, cellPadding: 5 },
        headStyles: { 
            fillColor: accentColor, 
            textColor: [0, 0, 0], // Dark text for contrast on gold
            fontStyle: 'bold' 
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: 20, right: 20 }
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    // Professional Contract Clauses
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("CONDITIONS GÉNÉRALES ET PARTICULIÈRES :", 20, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...grayColor);
    const defaultTermsPlaceholder = "Décrivez les conditions générales de vente ici";
    let contractNotes = settings?.documents?.contractTerms;
    
    if (!contractNotes || contractNotes.includes(defaultTermsPlaceholder) || contractNotes.length < 50) {
        contractNotes = `1. OBJET ET VALIDITÉ : Le présent bon de commande constitue un engagement ferme et irrévocable entre le vendeur et l'acheteur dès sa signature. Il définit les spécifications techniques et les conditions financières du véhicule désigné.
2. CONFORMITÉ ET ÉTAT DU VÉHICULE : Le vendeur certifie que le véhicule est conforme aux standards de sécurité et de fonctionnement. Un certificat de contrôle technique de moins de 6 mois sera fourni lors de la vente pour les véhicules d'occasion.
3. RÉSERVE DE PROPRIÉTÉ : Conformément à la loi n° 80-335 du 12 mai 1980, le transfert de propriété du véhicule est suspendu jusqu'au paiement intégral du prix en principal et accessoires. Les risques sont toutefois transférés à l'acheteur dès la remise des clés.
4. MODALITÉS DE LIVRAISON : La livraison s'effectuera à l'adresse indiquée ou au garage. Tout retard logistique de force majeure ne pourra donner lieu à l'annulation de la vente. L'acheteur dispose d'un droit d'inspection lors de la réception.
5. GARANTIE LÉGALE : Le véhicule bénéficie de la garantie légale de conformité et de la garantie contre les vices cachés. Toute garantie commerciale supplémentaire est détaillée dans un carnet spécifique remis lors de la livraison.
6. DROIT DE RÉTRACTATION : Pour les ventes conclues à distance, l'acheteur dispose d'un délai légal de 14 jours pour exercer son droit de rétractation sans avoir à justifier de motifs.`;
    }

    const splitNotes = contractNotes.split('\n');
    let currentY = finalY + 8;
    
    splitNotes.forEach(note => {
        const textLines = doc.splitTextToSize(note, pageWidth - 40);
        doc.text(textLines, 20, currentY, { align: 'justify', maxWidth: pageWidth - 40 });
        currentY += (textLines.length * 4.5) + 3;
    });
    
    finalY = currentY + 3;
    
    // Signatures Section - REDESIGNED
    const signTop = finalY + 8;
    const colWidth = (pageWidth - 40) / 2;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    
    // Buyer
    doc.text("L'ACHETEUR", 20, signTop);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(20, signTop + 3, 20 + colWidth - 10, signTop + 3);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...grayColor);
    doc.text("(Signature précédée de la mention 'Lu et approuvé')", 20, signTop + 10);

    // Seller
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    const sellerLabel = settings?.documents?.managerName ? `POUR ${settings.companyName.toUpperCase()}` : `POUR LE VENDEUR`;
    doc.text(sellerLabel, 20 + colWidth + 10, signTop);
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.8);
    doc.line(20 + colWidth + 10, signTop + 3, pageWidth - 20, signTop + 3);

    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    const managerLabel = settings?.documents?.managerName || "Le Gérant";
    doc.text(managerLabel, pageWidth - 35, signTop + 10, { align: 'right' });

    // Positioning stamp and signature "SUPERPOSÉS"
    if (settings?.documents?.stampUrl) {
        try {
            doc.addImage(settings.documents.stampUrl, 'PNG', pageWidth - 75, signTop + 5, 35, 35);
        } catch (e) {}
    }
    if (settings?.documents?.signatureUrl) {
        try {
            doc.addImage(settings.documents.signatureUrl, 'PNG', pageWidth - 70, signTop + 12, 45, 22);
        } catch (e) {}
    }

    drawFooter(doc, settings);
    doc.save(`Bon_de_Commande_${order.orderNumber}.pdf`);
};

export const generateInvoicePDF = (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    drawHeader(doc, settings, "Facture Proforma");

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

    // Invoice Meta
    doc.setFont('helvetica', 'bold');
    doc.text(`FACTURE N° F-${order.orderNumber}`, 20, 95);
    doc.text(`DATE D'ÉMISSION : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, 95, { align: 'right' });

    // Billing Flow
    autoTable(doc, {
        startY: 105,
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

    // Summary Section
    const summaryX = pageWidth - 90;
    const summaryHeight = order.paymentOption === 'deposit' ? 30 : 20;
    doc.roundedRect(summaryX, finalY - 5, 70, summaryHeight, 3, 3, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text("TOTAL NET À PAYER :", summaryX + 5, finalY + 3);
    
    doc.setFontSize(14);
    doc.setTextColor(...accentColor);
    doc.text(`${order.total?.toLocaleString()} €`, summaryX + 65, finalY + 11, { align: 'right' });

    if (order.paymentOption === 'deposit') {
        const acompteY = finalY + 20;
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.2);
        doc.line(summaryX + 5, acompteY - 4, summaryX + 65, acompteY - 4);

        doc.setFontSize(9);
        doc.setTextColor(...accentColor);
        doc.text("ACOMPTE (30%) :", summaryX + 5, acompteY + 2);
        const acompteAmount = Math.round(order.total * 0.3);
        doc.text(`${acompteAmount.toLocaleString()} €`, summaryX + 65, acompteY + 2, { align: 'right' });
    }

    // Payment Info - Ensuring clear gap with dynamic positioning
    let nextY = finalY + 40;
    
    // Vertical Accent Line
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.line(20, nextY - 4, 20, nextY + 30);

    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("COORDONNÉES BANCAIRES POUR VIREMENT :", 24, nextY);
    
    doc.setFontSize(8.5);
    const rib = settings?.rib || {};
    const bankDetails = [
        { label: "Banque :", value: rib.bankName || 'N/A' },
        { label: "IBAN :", value: rib.iban || 'N/A' },
        { label: "BIC :", value: rib.bic || 'N/A' },
        { label: "Titulaire :", value: rib.bankHolder || settings?.companyName || 'N/A' }
    ];

    bankDetails.forEach((item, i) => {
        const yPos = nextY + 8 + (i * 7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...grayColor);
        doc.text(item.label, 24, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...primaryColor);
        doc.text(item.value, 42, yPos);
    });

    // Invoice Notes
    const defaultFullNotes = "CLAUSE DE PAIEMENT INTÉGRAL : Le règlement total déclenche immédiatement la procédure d'exportation. Le véhicule est réservé dès validation du virement. Préparation et contrôle final sous 48h. Les documents administratifs originaux seront remis lors de la livraison ou expédiés après encaissement.\n\nRÉSERVE DE PROPRIÉTÉ : Le transfert de propriété n'intervient qu'après paiement intégral du prix convenu.";
    const defaultDepositNotes = `CLAUSE D'ACOMPTE (30%) : Ce versement constitue une réservation formelle pour 10 jours. Il permet de bloquer le véhicule et d'initier la logistique.
    
MODALITÉS DE SOLDE : Le solde (70%) peut être acquitté directement à la livraison. La remise des clés s'effectuera après validation du règlement du solde par nos services.`;

    let finalNotes = settings?.documents?.invoiceNotes && settings.documents.invoiceNotes !== "Notes de Facturation" 
        ? settings.documents.invoiceNotes 
        : (order.paymentOption === 'full' ? defaultFullNotes : defaultDepositNotes);

    if (finalNotes) {
        nextY += 45;
        doc.setDrawColor(240, 240, 240);
        doc.setLineWidth(0.1);
        doc.line(20, nextY - 5, pageWidth - 20, nextY - 5);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...grayColor);
        doc.text("CLAUSES ET NOTES DE FACTURATION :", 20, nextY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...grayColor);
        const splitNotes = doc.splitTextToSize(finalNotes, pageWidth - 40);
        doc.text(splitNotes, 20, nextY + 6);
    }

    drawFooter(doc, settings);
    doc.save(`Facture_${order.orderNumber}.pdf`);
};
