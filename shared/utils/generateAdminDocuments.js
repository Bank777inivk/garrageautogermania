import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadLocalImage } from './loadLocalImage';

const primaryColor = [20, 33, 61]; // #14213D (Deep Blue)
const accentColor = [252, 163, 17]; // #FCA311 (Amber Gold)
const grayColor = [148, 163, 184]; // Slate-400

const getWhiteBgLogoUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    // Force white background and convert to JPG, using 'limit' to avoid internal padding
    return url.replace('/upload/', '/upload/b_rgb:FFFFFF,f_jpg,c_limit,w_500,h_250/');
};

const formatPrice = (price) => {
    if (price === undefined || price === null) return '0 €';
    const num = Math.round(Number(price));
    // Use regex for thousands separator with standard space to avoid jspdf font issues
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €";
};

const drawHeader = (doc, settings, title) => {
    const pageWidth = doc.internal.pageSize.width;

    // Left: Company logo if exists, else name
    if (settings?.logoUrl) {
        try {
            const logoUrl = getWhiteBgLogoUrl(settings.logoUrl);
            // Draw logo: Aligning strictly to x=20
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
    const subtitle = title.toLowerCase() === 'facture' ? 'PROFORMA OFFICIEL' : 
                     title.toLowerCase() === 'bordereau de livraison' ? 'BON DE RÉCEPTION' : 
                     'CONVENTION DE VENTE';
    doc.text(subtitle, pageWidth - 20, 32, { align: 'right' });

    doc.setDrawColor(...accentColor);
    doc.setLineWidth(1.5);
    doc.line(pageWidth - 80, 36, pageWidth - 20, 36);
};

const drawPartiesSection = (doc, order, settings, startY) => {
    const pageWidth = doc.internal.pageSize.width;
    const colWidth = (pageWidth - 45) / 2;
    const padding = 4;
    
    // --- VENDEUR BLOCK ---
    const sellerX = 20;
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.8);
    doc.line(sellerX, startY, sellerX, startY + 20); // Left accent vertical
    
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...grayColor);
    doc.text("VENDEUR / PRESTATAIRE", sellerX + padding, startY + 3);
    
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text(settings?.companyName?.toUpperCase() || "AUTO IMPORT", sellerX + padding, startY + 8);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const companyAddr = `${settings?.addressDetails?.street || settings?.address || ""}, ${settings?.addressDetails?.zip || ""} ${settings?.addressDetails?.city || ""}`.trim();
    doc.text(companyAddr, sellerX + padding, startY + 12);
    doc.setTextColor(...grayColor);
    doc.text(`${settings?.phone || ""}  •  ${settings?.email || ""}`, sellerX + padding, startY + 16);

    // --- ACHETEUR BLOCK ---
    const buyerX = sellerX + colWidth + 10;
    doc.setDrawColor(...primaryColor);
    doc.line(buyerX, startY, buyerX, startY + 20); // Left accent vertical
    
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...grayColor);
    doc.text("ACHETEUR / DESTINATAIRE", buyerX + padding, startY + 3);
    
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    const clientName = `${order.customer?.firstName} ${order.customer?.lastName}`.toUpperCase();
    doc.text(clientName, buyerX + padding, startY + 8);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const buyerAddr = `${order.customer?.address || ""}, ${order.customer?.zipCode || ""} ${order.customer?.city || ""}`.trim();
    doc.text(buyerAddr, buyerX + padding, startY + 12);
    doc.setTextColor(...grayColor);
    doc.text(`Tél: ${order.customer?.phone || "N/A"}`, buyerX + padding, startY + 16);

    return startY + 28; // Compact next Y
};

const drawFooter = (doc, settings) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(7);
    doc.setTextColor(...grayColor);
    const footerLines = [
        `${settings?.companyName} • SIRET: ${settings?.siret || 'N/A'} • TVA: ${settings?.tva || 'N/A'}`,
        `${settings?.address || ''}, ${settings?.city || ''}  •  ${settings?.phone || ''}  •  ${settings?.email || ''}`
    ];
    doc.text(footerLines[0], pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.text(footerLines[1], pageWidth / 2, pageHeight - 17, { align: 'center' });
};

export const generateOrderPDF = async (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Load default stamp and signature
    const stampUrl = settings?.documents?.stampUrl || null;
    const signatureUrl = settings?.documents?.signatureUrl || null;
    const defaultStamp = await loadLocalImage('/garrage_stamp_pro_1772904455871.png');
    const defaultSignature = await loadLocalImage('/garrage_signature_gerant_1772905088803.png');
    const finalStamp = stampUrl || defaultStamp;
    const finalSignature = signatureUrl || defaultSignature;

    drawHeader(doc, settings, "Bon de Commande");

    const partiesY = drawPartiesSection(doc, order, settings, 48);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`RÉFÉRENCE : ${order.orderNumber}`, 20, partiesY + 10);
    doc.text(`DATE : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, partiesY + 10, { align: 'right' });
    
    const tableStartY = partiesY + 22;
    autoTable(doc, {
        startY: tableStartY,
        body: order.items.map(item => {
            const displayPrice = item.effectivePrice || (item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price);
            return [
                `${item.name || `${item.brand} ${item.model}`}\nRéférence : ${item.vin || item.id?.substring(0, 10).toUpperCase() || 'N/A'}`,
                '1',
                formatPrice(displayPrice),
                formatPrice(displayPrice)
            ];
        }),
        head: [['Désignation', 'Qté', 'Prix Unitaire', 'Total']],
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: accentColor, textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: { 
            0: { cellWidth: 'auto' },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 }
    });

    let currentY = doc.lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 90;
    doc.setFillColor(...primaryColor);
    const summaryHeight = order.discountAmount > 0 ? 35 : 28;
    doc.roundedRect(summaryX, currentY - 5, 70, summaryHeight, 3, 3, 'F');
    
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("Sous-total :", summaryX + 5, currentY + 3);
    doc.text(formatPrice(order.subtotal || 0), summaryX + 65, currentY + 3, { align: 'right' });
    
    currentY += 10;
    if (order.discountAmount > 0) {
        doc.setTextColor(...accentColor);
        doc.text(`Remise (-${order.discountPercent || 15}%) :`, summaryX + 5, currentY);
        doc.text(`-${formatPrice(order.discountAmount)}`, summaryX + 65, currentY, { align: 'right' });
        currentY += 7;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL NET :", summaryX + 5, currentY);
    doc.text(formatPrice(order.total || 0), summaryX + 65, currentY, { align: 'right' });

    if (order.paymentOption === 'deposit') {
        currentY += 8;
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.2);
        doc.line(summaryX + 5, currentY - 5, summaryX + 65, currentY - 5);
        doc.setFontSize(11);
        doc.setTextColor(...accentColor);
        doc.text("ACOMPTE (30%) :", summaryX + 5, currentY + 1);
        doc.text(formatPrice(order.amountToPayNow || 0), summaryX + 65, currentY + 1, { align: 'right' });
    }

    let finalY = currentY + 15;

    // Professional Contract Clauses (Condensed for Order)
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("CONDITIONS GÉNÉRALES ET PARTICULIÈRES :", 20, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6); // Réduction significative de la police
    doc.setTextColor(...grayColor);
    const defaultTermsPlaceholder = "Décrivez les conditions générales de vente ici";
    let contractNotes = settings?.documents?.contractTerms;
    
    // Condensed version for Order PDF to save space
    if (!contractNotes || contractNotes.includes(defaultTermsPlaceholder) || contractNotes.length < 50) {
        contractNotes = `1. OBJET: Le présent bon commande est ferme et irrévocable. 2. CONFORMITÉ: Véhicule conforme aux standards de sécurité, CT de moins de 6 mois fourni pour l'occasion. 3. PROPRIÉTÉ: Le transfert de propriété est suspendu jusqu'au paiement intégral. Risques transférés dès la remise des clés. 4. LIVRAISON: Solde (70% si acompte) exigible à la remise des clés. Tout retard logistique de force majeure n'annule pas la vente. 5. GARANTIE: Garantie légale de conformité et vices cachés appliquées. 6. RÉTRACTATION: Délai légal de 14 jours pour les ventes à distance.`;
    }

    // Draw clauses compactly (without justify to avoid broken text on small font)
    currentY = finalY + 6;
    const textLines = doc.splitTextToSize(contractNotes, pageWidth - 40);
    doc.text(textLines, 20, currentY, { align: 'left', maxWidth: pageWidth - 40 });
    currentY += (textLines.length * 2.5) + 2; // Line height très compressé et ajusté
    
    let signTop = currentY + 5; // Réduction supplémentaire de l'espace avant signature
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("L'ACHETEUR (Bon pour accord)", 20, signTop);
    doc.text(`POUR ${settings?.companyName?.toUpperCase() || "LE VENDEUR"}`, pageWidth - 80, signTop);

    if (finalStamp) {
        try { doc.addImage(finalStamp, 'PNG', pageWidth - 78, signTop + 10, 45, 45); }
        catch (e) {}
    }
    if (finalSignature) {
        try { doc.addImage(finalSignature, 'PNG', pageWidth - 80, signTop + 20, 50, 25); }
        catch (e) {}
    }

    drawFooter(doc, settings);
    doc.save(`Bon_Commande_${order.orderNumber}.pdf`);
};

export const generateContractPDF = async (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Load default stamp and signature from /public if not set
    const stampUrl = settings?.documents?.stampUrl || null;
    const signatureUrl = settings?.documents?.signatureUrl || null;
    const defaultStamp = await loadLocalImage('/garrage_stamp_pro_1772904455871.png');
    const defaultSignature = await loadLocalImage('/garrage_signature_gerant_1772905088803.png');
    const finalStamp = stampUrl || defaultStamp;
    const finalSignature = signatureUrl || defaultSignature;

    drawHeader(doc, settings, "Contrat de Vente");

    const partiesY = drawPartiesSection(doc, order, settings, 48);

    // Contract Details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`RÉFÉRENCE CONTRAT : C-${order.orderNumber}`, 20, partiesY + 10);
    doc.text(`DATE : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, partiesY + 10, { align: 'right' });
    
    const tableStartY = partiesY + 22;
    // Vehicle Table - AMBER GOLD THEME
    autoTable(doc, {
        startY: tableStartY,
        body: order.items.map(item => {
            const displayPrice = item.effectivePrice || (item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price);
            return [
                `${item.name || `${item.brand} ${item.model}`}\nRéférence : ${item.vin || item.id?.substring(0, 10).toUpperCase() || 'N/A'}`,
                '1',
                formatPrice(displayPrice),
                formatPrice(displayPrice)
            ];
        }),
        head: [['Désignation du véhicule', 'Qté', 'Prix Unitaire', 'Total']],
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { 
            fillColor: accentColor, 
            textColor: [0, 0, 0], // Dark text for contrast on gold
            fontStyle: 'bold' 
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: { 
            0: { cellWidth: 'auto' },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 }
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // Summary Section (Matching Invoice Style)
    const summaryX = pageWidth - 90;
    doc.setFillColor(...primaryColor);
    const summaryHeight = order.discountAmount > 0 ? 35 : 28;
    doc.roundedRect(summaryX, currentY - 5, 70, summaryHeight, 3, 3, 'F');
    
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("Sous-total :", summaryX + 5, currentY + 3);
    doc.text(formatPrice(order.subtotal || 0), summaryX + 65, currentY + 3, { align: 'right' });
    
    currentY += 10;
    if (order.discountAmount > 0) {
        doc.setTextColor(...accentColor);
        doc.text(`Remise (-${order.discountPercent || 15}%) :`, summaryX + 5, currentY);
        doc.text(`-${formatPrice(order.discountAmount)}`, summaryX + 65, currentY, { align: 'right' });
        currentY += 7;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL NET :", summaryX + 5, currentY);
    doc.text(formatPrice(order.total || 0), summaryX + 65, currentY, { align: 'right' });

    if (order.paymentOption === 'deposit') {
        currentY += 8;
        // Small gold separator
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.2);
        doc.line(summaryX + 5, currentY - 5, summaryX + 65, currentY - 5);
        
        doc.setFontSize(11);
        doc.setTextColor(...accentColor);
        doc.text("ACOMPTE (30%) :", summaryX + 5, currentY + 1);
        doc.text(formatPrice(order.amountToPayNow || 0), summaryX + 65, currentY + 1, { align: 'right' });
    }

    let finalY = currentY + 15;

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
    
    // If terms are empty or just the placeholder, use our professional legal clauses
    if (!contractNotes || contractNotes.includes(defaultTermsPlaceholder) || contractNotes.length < 50) {
        contractNotes = `1. OBJET ET VALIDITÉ : Le présent bon de commande constitue un engagement ferme et irrévocable entre le vendeur et l'acheteur dès sa signature. Il définit les spécifications techniques et les conditions financières du véhicule désigné.
2. CONFORMITÉ ET ÉTAT DU VÉHICULE : Le vendeur certifie que le véhicule est conforme aux standards de sécurité et de fonctionnement. Un certificat de contrôle technique de moins de 6 mois sera fourni lors de la vente pour les véhicules d'occasion.
3. RÉSERVE DE PROPRIÉTÉ : Conformément à la loi n° 80-335 du 12 mai 1980, le transfert de propriété du véhicule est suspendu jusqu'au paiement intégral du prix en principal et accessoires. Les risques sont toutefois transférés à l'acheteur dès la remise des clés.
4. MODALITÉS DE LIVRAISON : La livraison s'effectuera à l'adresse indiquée ou au garage. Le solde restant du prix de vente (70% en cas d'accompte) pourra être acquitté directement lors de la remise des clés. Tout retard logistique de force majeure ne pourra donner lieu à l'annulation de la vente. l'acheteur dispose d'un droit d'inspection lors de la réception.
5. GARANTIE LÉGALE : Le véhicule bénéficie de la garantie légale de conformité et de la garantie contre les vices cachés. Toute garantie commerciale supplémentaire est détaillée dans un carnet spécifique remis lors de la livraison.
6. DROIT DE RÉTRACTATION : Pour les ventes conclues à distance, l'acheteur dispose d'un délai légal de 14 jours pour exercer son droit de rétractation sans avoir à justifier de motifs.`;
    }

    // Draw clauses one by one for better spacing and justification
    const splitNotes = contractNotes.split('\n');
    currentY = finalY + 8;
    
    splitNotes.forEach(note => {
        const textLines = doc.splitTextToSize(note, pageWidth - 40);
        // jspdf doesn't support perfect justification easily, so we use left align to avoid broken words
        doc.text(textLines, 20, currentY, { align: 'left', maxWidth: pageWidth - 40 });
        currentY += (textLines.length * 3.5) + 3; // Line height + gap between clauses
    });

    finalY = currentY + 2;

    // Signatures Section - REDESIGNED
    const signTop = finalY + 5;
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
    // Position manager name/label
    const managerName = settings?.documents?.managerName || "Le Gérant";
    doc.text(managerName, pageWidth - 35, signTop + 10, { align: 'right' });

    // Add Stamp & Signature "SUPERPOSÉS"
    if (finalStamp) {
        try {
            // Position stamp as the base layer - Reduced size for better fit
            doc.addImage(finalStamp, 'PNG', pageWidth - 70, signTop + 4, 30, 30);
        } catch (e) {
            console.error("Stamp error:", e);
        }
    }

    if (finalSignature) {
        try {
            // Place signature directly ON TOP of the stamp - Slightly offset
            doc.addImage(finalSignature, 'PNG', pageWidth - 65, signTop + 10, 40, 20);
        } catch (e) {
            console.error("Signature error:", e);
        }
    }

    drawFooter(doc, settings);
    doc.save(`Bon_de_Commande_${order.orderNumber}.pdf`);
};

export const generateInvoicePDF = async (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    drawHeader(doc, settings, "Facture Proforma");

    const partiesY = drawPartiesSection(doc, order, settings, 48);

    // Invoice Meta
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`FACTURE N° F-${order.orderNumber}`, 20, partiesY + 10);
    doc.text(`DATE D'ÉMISSION : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, partiesY + 10, { align: 'right' });

    const tableStartY = partiesY + 22;

    // Billing Flow
    autoTable(doc, {
        startY: tableStartY,
        head: [['Description', 'Qté', 'Prix Unitaire', 'Total']],
        body: order.items.map(item => {
            const displayPrice = item.effectivePrice || (item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price);
            return [
                `${item.brand} ${item.model}\nRéférence : ${item.id && item.id.length > 8 ? item.id.substring(0, 8).toUpperCase() : (item.id || 'N/A')}`,
                '1',
                formatPrice(displayPrice),
                formatPrice(displayPrice)
            ];
        }),
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 
            0: { cellWidth: 'auto' },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 }
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    // Summary Section
    const summaryX = pageWidth - 90;
    doc.setFillColor(...primaryColor);
    const summaryHeight = order.paymentOption === 'deposit' ? 45 : 35;
    doc.roundedRect(summaryX, finalY - 5, 70, summaryHeight, 3, 3, 'F');
    
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    
    doc.text("Sous-total :", summaryX + 5, finalY + 3);
    doc.text(formatPrice(order.subtotal || 0), summaryX + 65, finalY + 3, { align: 'right' });
    
    let currentY = finalY + 10;
    if (order.discountAmount > 0) {
        doc.setTextColor(...accentColor);
        doc.text(`Remise (-15%) :`, summaryX + 5, currentY);
        doc.text(`-${formatPrice(order.discountAmount)}`, summaryX + 65, currentY, { align: 'right' });
        currentY += 7;
    }
    
    doc.setTextColor(255, 255, 255);
    doc.text("Expédition :", summaryX + 5, currentY);
    doc.text(order.shipping === 0 ? "Offert" : formatPrice(order.shipping), summaryX + 65, currentY, { align: 'right' });
    
    currentY += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL NET :", summaryX + 5, currentY);
    doc.text(formatPrice(order.total || 0), summaryX + 65, currentY, { align: 'right' });

    if (order.paymentOption === 'deposit') {
        currentY += 8;
        // Small gold separator
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.2);
        doc.line(summaryX + 5, currentY - 5, summaryX + 65, currentY - 5);
        
        doc.setFontSize(11);
        doc.setTextColor(...accentColor);
        doc.text("ACOMPTE (30%) :", summaryX + 5, currentY + 1);
        doc.text(formatPrice(order.amountToPayNow || 0), summaryX + 65, currentY + 1, { align: 'right' });
    }

    // Payment Info - Ensuring clear gap with dynamic positioning
    let nextY = Math.max(currentY + 20, finalY + (order.paymentOption === 'deposit' ? 50 : 40));
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const strategyLabel = order.paymentOption === 'full' ? "PAIEMENT INTÉGRAL SÉLECTIONNÉ" : "RÈGLEMENT PAR ACOMPTE (30%)";
    doc.text(`MODALITÉ DE PAIEMENT : ${strategyLabel}`, 20, nextY);
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    const deadlineText = order.paymentOption === 'full' 
        ? "Le règlement intégral permet de finaliser la transaction immédiatement."
        : `Un acompte de ${formatPrice(order.amountToPayNow || 0)} est requis, le solde avant livraison.`;
    doc.text(deadlineText, 20, nextY + 7);

    // --- BANK DETAILS SECTION ---
    nextY += 16;
    
    // Vertical Accent Line for Bank Details
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.6);
    doc.line(20, nextY - 4, 20, nextY + 32);

    doc.setTextColor(...primaryColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("COORDONNÉES BANCAIRES POUR VIREMENT :", 24, nextY);

    doc.setFontSize(8);
    const rib = settings?.rib || {};
    const bankDetails = [
        { label: "Banque :", value: rib.bankName || settings?.bankName || 'N/A' },
        { label: "IBAN :", value: rib.iban || settings?.iban || 'N/A' },
        { label: "BIC :", value: rib.bic || settings?.bic || 'N/A' },
        { label: "Titulaire :", value: rib.titulaire || settings?.bankHolder || 'N/A' }
    ];

    bankDetails.forEach((item, i) => {
        const yPos = nextY + 8 + (i * 7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...grayColor);
        doc.text(item.label, 24, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...primaryColor);
        doc.text(item.value, 46, yPos);
    });

    // Update nextY after bank details (4 items * 7 + spacing)
    nextY += 38;

    // --- CLAUSES & NOTES SECTION ---
    const defaultFullNotes = "CLAUSE DE PAIEMENT INTÉGRAL : Le règlement total de cette facture proforma déclenche immédiatement la procédure d'exportation et de logistique. Le véhicule est réservé de manière ferme et définitive dès validation du virement. Préparation esthétique et contrôle technique final sous 48h ouvrées. Les documents administratifs originaux (Certificat d'immatriculation, Certificat de conformité COC, Facture d'achat) seront remis en main propre lors de la livraison ou expédiés par courrier sécurisé après encaissement.\n\nRÉSERVE DE PROPRIÉTÉ : Conformément à la loi, le transfert de propriété n'intervient qu'après paiement intégral du prix convenu.";
    const defaultDepositNotes = `CLAUSE D'ACOMPTE (30%) : Le versement de cet acompte fait office de réservation formelle du véhicule pour une durée maximale de 10 jours calendaires. Ce montant permet de bloquer le châssis et d'initier la mise en préparation logistique intermédiaire.\n\nMODALITÉS DE SOLDE : Le solde restant dû (70%) pourra être acquitté directement lors de la livraison du véhicule. La remise définitive des clés et de l'ensemble du dossier administratif original ne sera effectuée qu'après validation du règlement du solde.`;
    
    let finalNotes = settings?.documents?.invoiceNotes && settings.documents.invoiceNotes !== "Notes de Facturation" 
        ? settings.documents.invoiceNotes 
        : (order.paymentOption === 'full' ? defaultFullNotes : defaultDepositNotes);

    if (finalNotes) {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.1);
        doc.line(20, nextY - 5, pageWidth - 20, nextY - 5);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...grayColor);
        doc.text("CLAUSES ET NOTES DE FACTURATION :", 20, nextY);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayColor);
        const notes = doc.splitTextToSize(finalNotes, pageWidth - 40);
        doc.text(notes, 20, nextY + 7);
    }

    drawFooter(doc, settings);
    doc.save(`Facture_${order.orderNumber}.pdf`);
};

export const generatePaymentReceiptPDF = async (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const isDeposit = order.paymentOption === 'deposit';

    // Load default stamp and signature from /public if not set
    const stampUrl = settings?.documents?.stampUrl || null;
    const signatureUrl = settings?.documents?.signatureUrl || null;
    const defaultStamp = await loadLocalImage('/garrage_stamp_pro_1772904455871.png');
    const defaultSignature = await loadLocalImage('/garrage_signature_gerant_1772905088803.png');
    const finalStamp = stampUrl || defaultStamp;
    const finalSignature = signatureUrl || defaultSignature;

    drawHeader(doc, settings, isDeposit ? "Reçu d'Acompte" : "Reçu de Paiement");

    // --- STATUS BADGE (Top Right) ---
    const badgeText = isDeposit ? "ACOMPTE VALIDÉ" : "RÈGLEMENT INTÉGRAL";
    const badgeColor = isDeposit ? accentColor : [16, 185, 129]; // Gold or Emerald
    doc.setFillColor(...badgeColor);
    doc.roundedRect(pageWidth - 65, 45, 45, 8, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, pageWidth - 42.5, 50.5, { align: 'center' });

    const partiesY = drawPartiesSection(doc, order, settings, 55);

    // Document Meta
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`RÉFÉRENCE : R-${order.orderNumber}`, 20, partiesY + 12);
    doc.text(`ÉMIS LE : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, partiesY + 12, { align: 'right' });

    const tableStartY = partiesY + 25;

    // --- TABLE ---
    autoTable(doc, {
        startY: tableStartY,
        head: [['Description du véhicule', 'Qté', 'Prix Unitaire', 'Total']],
        body: order.items.map(item => {
            const displayPrice = item.effectivePrice || (item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price);
            return [
                `${item.brand} ${item.model}\nRéférence : ${item.id ? item.id.substring(0, 8).toUpperCase() : 'N/A'}`,
                '1',
                formatPrice(displayPrice),
                formatPrice(displayPrice)
            ];
        }),
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 
            0: { cellWidth: 'auto' },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 }
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // --- TOTAL CARD (Simplified & Premium) ---
    const summaryX = pageWidth - 90;
    doc.setFillColor(...primaryColor);
    const summaryHeight = order.discountAmount > 0 ? 45 : 38; 
    doc.roundedRect(summaryX, currentY - 5, 70, summaryHeight, 3, 3, 'F');
    
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("Sous-total :", summaryX + 5, currentY + 3);
    doc.text(formatPrice(order.subtotal || 0), summaryX + 65, currentY + 3, { align: 'right' });
    
    let statsY = currentY + 10;
    if (order.discountAmount > 0) {
        doc.setTextColor(...accentColor);
        doc.text(`Remise (-${order.discountPercent || 15}%) :`, summaryX + 5, statsY);
        doc.text(`-${formatPrice(order.discountAmount)}`, summaryX + 65, statsY, { align: 'right' });
        statsY += 7;
    }
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 200, 200);
    doc.text(isDeposit ? "ACOMPTE À PAYER (30%) :" : "TOTAL RÉGLÉ TTC :", summaryX + 5, statsY + 2);
    
    doc.setFontSize(14);
    doc.setTextColor(...accentColor);
    const finalAmount = isDeposit ? order.amountToPayNow : order.total;
    doc.text(formatPrice(finalAmount || 0), summaryX + 65, statsY + 10, { align: 'right' });

    let currentYReceipt = statsY + 35;
    const attestationY = currentYReceipt + 5;
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(1);
    doc.line(20, attestationY, 20, attestationY + 10); // Vertical gold bar

    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text("ATTESTATION DE RÈGLEMENT :", 25, attestationY + 3);

    doc.setFontSize(7.5);
    doc.setTextColor(...grayColor);
    doc.setFont(undefined, 'italic');
    const attestationText = isDeposit 
        ? "Ce document officiel atteste que l'acompte de 30% a été perçu. Le véhicule est en préparation."
        : "Ce document officiel atteste que le montant total a été perçu et validé par nos services financiers.";
    doc.text(attestationText, 25, attestationY + 8);

    // --- TWO COLUMNS SECTION (Journey Left | Signature Right) ---
    const colY = attestationY + 28;
    const leftColX = 20;
    const rightColX = 120;

    // LEFT: DELIVERY JOURNEY
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text("PROCESSUS DE LIVRAISON :", leftColX, colY);

    const steps = [
        { t: "LOGISTIQUE", d: "Inspection et documents export." },
        { t: "TRANSIT", d: "Transport international sécurisé." },
        { t: "CONCIERGERIE", d: "Formalités et préparation finale." },
        { t: "LIVRAISON", d: "Remise des clés à domicile." }
    ];

    let stepY = colY + 8;
    steps.forEach((step, idx) => {
        if (idx < steps.length - 1) {
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.4);
            doc.line(leftColX + 2, stepY + 2, leftColX + 2, stepY + 6);
        }
        doc.setFillColor(...accentColor);
        doc.circle(leftColX + 2, stepY, 1, 'F');
        doc.setFontSize(7);
        doc.setTextColor(...primaryColor);
        doc.text(step.t, leftColX + 6, stepY + 1);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayColor);
        doc.text(step.d, leftColX + 30, stepY + 1);
        doc.setFont(undefined, 'bold');
        stepY += 6;
    });

    // RIGHT: SIGNATURE SECTION
    const signTop = colY + 2;
    const colWidth = 70;
    const signLineStartX = pageWidth - 20 - colWidth + 10;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`POUR ${settings?.companyName?.toUpperCase() || "LE GARAGE"}`, signLineStartX, signTop);
    
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.6);
    doc.line(signLineStartX, signTop + 3, pageWidth - 20, signTop + 3);

    doc.setFontSize(7.5);
    doc.setTextColor(...primaryColor);
    const managerName = settings?.documents?.managerName || "Le Gérant";
    doc.text(managerName, pageWidth - 20, signTop + 8, { align: 'right' });

    if (finalStamp) {
        try {
            doc.addImage(finalStamp, 'PNG', pageWidth - 65, signTop + 4, 25, 25);
        } catch (e) {
            console.error("Stamp error:", e);
        }
    }

    if (finalSignature) {
        try {
            doc.addImage(finalSignature, 'PNG', pageWidth - 60, signTop + 10, 35, 18);
        } catch (e) {
            console.error("Signature error:", e);
        }
    }

    // BOTTOM: FOOTER NOTE (Full Width below columns)
    const footerNotesY = Math.max(stepY + 5, signTop + 30);
    let configuredNotes = isDeposit 
        ? (settings.documents?.depositNotes || "L'acompte de 30% a été validé. Préparation logistique en cours.")
        : (settings.documents?.fullPaymentNotes || "Ce reçu fait office de preuve de paiement intégrale.");
    
    doc.setFontSize(7);
    doc.setTextColor(...grayColor);
    doc.setFont(undefined, 'italic');
    const splitNotesFinal = doc.splitTextToSize(configuredNotes, pageWidth - 40);
    doc.text(splitNotesFinal, 20, footerNotesY);


    drawFooter(doc, settings);
    doc.save(`Recu_Paiement_${order.orderNumber}.pdf`);
};

export const generateDeliverySlipPDF = async (order, settings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Load default stamp and signature from /public if not set
    const stampUrl = settings?.documents?.stampUrl || null;
    const signatureUrl = settings?.documents?.signatureUrl || null;
    const defaultStamp = await loadLocalImage('/garrage_stamp_pro_1772904455871.png');
    const defaultSignature = await loadLocalImage('/garrage_signature_gerant_1772905088803.png');
    const finalStamp = stampUrl || defaultStamp;
    const finalSignature = signatureUrl || defaultSignature;

    drawHeader(doc, settings, "Bordereau de Livraison");

    const partiesY = drawPartiesSection(doc, order, settings, 55);

    // --- DELIVERY META (Top Right) ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`RÉFÉRENCE : L-${order.orderNumber}`, 20, partiesY + 12);
    doc.text(`DATE : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, partiesY + 12, { align: 'right' });

    const tableStartY = partiesY + 25;

    // --- CAR CARGO TABLE ---
    autoTable(doc, {
        startY: tableStartY,
        body: order.items.map(item => {
            const displayPrice = item.effectivePrice || (item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price);
            return [
                `${item.brand} ${item.model}\nRéférence : ${item.vin || item.id?.substring(0, 10).toUpperCase() || 'N/A'}`,
                '1',
                formatPrice(displayPrice || 0)
            ];
        }),
        head: [['Véhicule / Produit Livré', 'Qté', 'Prix']],
        headStyles: { 
            fillColor: primaryColor, 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: { fontSize: 8.5, cellPadding: 3 },
        columnStyles: { 
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 }
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    // --- DELIVERY APPROVAL NOTE ---
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text("CONSTAT DE LIVRAISON :", 20, currentY);

    doc.setFontSize(8.5);
    doc.setTextColor(...grayColor);
    doc.setFont(undefined, 'normal');
    const deliveryNote = settings?.documents?.deliveryNotes || "Le client reconnaît avoir reçu le véhicule désigné ci-dessus en parfait état de conformité avec le bon de commande. La remise des clés et de l'ensemble du dossier administratif original est effectuée ce jour.";
    const splitNote = doc.splitTextToSize(deliveryNote, pageWidth - 40);
    doc.text(splitNote, 20, currentY + 7);
    
    // Calculate final Y of the note to determine signTop
    const noteHeight = (splitNote.length * 5); 
    const signTop = Math.max(currentY + 12 + noteHeight, pageHeight - 85);

    // --- SIGNATURES SECTION (Refined Side-by-Side) ---
    const colWidth = (pageWidth - 40) / 2;

    // Buyer Column
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text("L'ACHETEUR (Réceptionnaire)", 20, signTop);
    
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.4);
    doc.line(20, signTop + 3, 20 + colWidth - 10, signTop + 3);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...grayColor);
    doc.text("(Signature précédée de la mention 'Bon pour réception')", 20, signTop + 8);

    // Garage Column
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    const garageLabel = `POUR ${settings?.companyName?.toUpperCase() || "LE GARAGE"}`;
    const garageLabelX = pageWidth - 20 - colWidth + 10;
    doc.text(garageLabel, garageLabelX, signTop);
    
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.8);
    doc.line(garageLabelX, signTop + 3, pageWidth - 20, signTop + 3);

    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    const managerName = settings?.documents?.managerName || "Service Logistique";
    doc.text(managerName, pageWidth - 20, signTop + 8, { align: 'right' });

    // Add Stamp & Signature
    if (finalStamp) {
        try {
            doc.addImage(finalStamp, 'PNG', pageWidth - 65, signTop + 4, 25, 25);
        } catch (e) {
            console.error("Stamp error:", e);
        }
    }

    if (finalSignature) {
        try {
            doc.addImage(finalSignature, 'PNG', pageWidth - 60, signTop + 10, 35, 18);
        } catch (e) {
            console.error("Signature error:", e);
        }
    }

    drawFooter(doc, settings);
    doc.save(`Bordereau_Livraison_${order.orderNumber}.pdf`);
};
