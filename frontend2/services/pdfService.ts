/**
 * @file services/pdfService.ts
 * @description Generates a professional delivery receipt matching the official design.
 */
import jsPDF from "jspdf";
import OriginalQRCode from "qrcode";

const APP_NAME = "TiiBnTick";
const BRAND_ORANGE = [249, 115, 22]; // RGB for #F97316

export const pdfService = {
    generateBordereauPDF: async (
        allData: any,
        trackingNumber: string,
        totalPrice: number,
        operatorFee: number,
        selectedMethod: string,
    ) => {
        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 15;
            let y = 20;

            // --- HELPER FUNCTIONS ---
            const addSectionTitle = (title: string) => {
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(45, 55, 72);
                pdf.text(title, margin, y);
                y += 2;
                pdf.setDrawColor(45, 55, 72);
                pdf.setLineWidth(0.5);
                pdf.line(margin, y, pageWidth - margin, y);
                y += 8;
            };

            const addGridField = (
                label: string,
                value: string,
                x: number,
                yPos: number,
            ) => {
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(0, 0, 0);
                pdf.text(`${label}: `, x, yPos);

                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(60, 60, 60);
                const valueX = x + pdf.getTextWidth(`${label}: `) + 1;
                pdf.text(String(value || "N/A"), valueX, yPos);
            };

            const addGridFieldForLongText = (
                label: string,
                value: string,
                x: number,
                yPos: number,
                maxWidth: number,
            ) => {
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(0, 0, 0);
                pdf.text(`${label}:`, x, yPos);

                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(60, 60, 60);

                const labelWidth = pdf.getTextWidth(`${label}: `);
                const valueX = x + labelWidth + 2;
                const availableWidth = maxWidth - labelWidth - 5;

                // Split text to fit width
                const lines = pdf.splitTextToSize(
                    String(value || "N/A"),
                    availableWidth,
                );
                pdf.text(lines, valueX, yPos);

                // Return height consumed: (number of lines * line height) + padding
                return lines.length * 4.5;
            };


            // --- 1. HEADER (Logo & QR Code) ---
            // Logo (Text based)
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
            pdf.text(APP_NAME, margin, y);

            // Slogan
            y += 6;
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(120, 120, 120);
            pdf.text("Votre solution de livraison de confiance", margin, y);

            // QR Code (Top Right)
            const qrDataURL = await OriginalQRCode.toDataURL(trackingNumber, {
                margin: 1,
            });
            const qrSize = 30;
            pdf.addImage(
                qrDataURL,
                "PNG",
                pageWidth - margin - qrSize,
                12,
                qrSize,
                qrSize,
            );

            // Receipt Title & Meta
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(11);
            pdf.text("Bordereau d'Expédition", pageWidth - margin - 32, 17, {
                align: "right",
            });

            pdf.setFontSize(8);
            pdf.setFont("helvetica", "normal");
            pdf.text(`N°: ${trackingNumber}`, pageWidth - margin - 32, 21, {
                align: "right",
            });
            pdf.text(
                `Date: ${new Date().toLocaleDateString("fr-FR")}`,
                pageWidth - margin - 32,
                25,
                { align: "right" },
            );

            y += 25;

            // --- 2. INTERVENANTS ---
            addSectionTitle("Intervenants");
            const startYInter = y;
            const colWidth = pageWidth / 2 - margin - 5; // Define a safe boundary for each column

            // Column 1: Sender
            let senderY = startYInter;
            senderY +=
                addGridFieldForLongText(
                    "Expéditeur",
                    allData.senderName || `${allData.senderLastName || ''} ${allData.senderFirstName || ''}`.trim(),
                    margin,
                    senderY,
                    colWidth,
                ) + 2;
            senderY +=
                addGridFieldForLongText(
                    "Téléphone",
                    allData.senderPhone,
                    margin,
                    senderY,
                    colWidth,
                ) + 2;
            senderY +=
                addGridFieldForLongText(
                    "Dépôt",
                    allData.departurePointName,
                    margin,
                    senderY,
                    colWidth,
                ) + 2;

            let recipientY = startYInter;
            const col2X = pageWidth / 2 + 5;
            recipientY +=
                addGridFieldForLongText(
                    "Destinataire",
                    allData.recipientName,
                    col2X,
                    recipientY,
                    colWidth,
                ) + 2;
            recipientY +=
                addGridFieldForLongText(
                    "Téléphone",
                    allData.recipientPhone,
                    col2X,
                    recipientY,
                    colWidth,
                ) + 2;
            recipientY +=
                addGridFieldForLongText(
                    "Point de Retrait",
                    allData.arrivalPointName,
                    col2X,
                    recipientY,
                    colWidth,
                ) + 2;

            y = Math.max(senderY, recipientY) + 5;

            // --- 3. DÉTAILS DU COLIS ---
            addSectionTitle("Détails du colis");
            const startYPackage = y;

            // We calculate Designation height first
            const designHeight = addGridFieldForLongText('Désignation', allData.designation, margin, y, 120);
            y += designHeight + 2; // Move Y down by the height of the designation

            y += addGridFieldForLongText('Poids', `${allData.weight} kg`, margin, y, 120) + 2;

            let caracteristiques = [];
            if (allData.isFragile) caracteristiques.push("Fragile");
            if (allData.isPerishable) caracteristiques.push("Périssable");
            const specHeight = addGridFieldForLongText('Spécificités', caracteristiques.join(', ') || 'Aucune', margin, y, 120);

            // Handle Image (Fixed position relative to start of section)
            if (allData.photo) {
                try {
                    pdf.addImage(allData.photo, 'JPEG', pageWidth - margin - 50, startYPackage, 50, 40);
                } catch (e) {
                    console.error("PDF Image error", e);
                }
            }
            y = Math.max(y + specHeight + 10, startYPackage + 45);

            // --- 4. RÉCAPITULATIF FINANCIER ---
            addSectionTitle("Récapitulatif Financier");

            const addFinanceRow = (label: string, value: number, isBold = false) => {
                pdf.setFont("helvetica", isBold ? "bold" : "normal");
                pdf.setFontSize(isBold ? 11 : 9);
                pdf.setTextColor(0, 0, 0);
                pdf.text(label, margin, y);
                pdf.text(`${value.toLocaleString()} FCFA`, pageWidth - margin, y, {
                    align: "right",
                });
                y += 6;
            };

            addFinanceRow("Coût de base", allData.basePrice || 0);
            addFinanceRow("Frais de trajet", allData.travelPrice || 0);
            if (operatorFee > 0) addFinanceRow("Frais transaction", operatorFee);

            y += 2;
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, y, pageWidth - margin, y);
            y += 8;

            const totalLabel =
                selectedMethod === "recipient"
                    ? "Total à payer par le Destinataire"
                    : "Total payé par l'Expéditeur";
            addFinanceRow(totalLabel, totalPrice, true);

            y += 20;

            // --- 5. SIGNATURES ---
            addSectionTitle("Signature");
            const sigY = y + 5;

            // Client Header
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            pdf.text("Client", margin + 20, sigY);
            pdf.setDrawColor(45, 55, 72);
            pdf.line(margin + 20, sigY + 1, margin + 31, sigY + 1); // Small underline

            // Agent Header
            pdf.text("Agent", pageWidth - margin - 35, sigY);
            pdf.line(
                pageWidth - margin - 35,
                sigY + 1,
                pageWidth - margin - 23,
                sigY + 1,
            );

            // Render actual client signature if exists
            if (allData.signatureUrl) {
                try {
                    pdf.addImage(
                        allData.signatureUrl,
                        "PNG",
                        margin + 15,
                        sigY + 2,
                        40,
                        20,
                    );
                } catch (e) {
                    console.error("Signature PDF Render Error:", e);
                    pdf.setFontSize(8);
                    pdf.setTextColor(200, 0, 0);
                    pdf.text("(Erreur de rendu signature)", margin + 15, sigY + 10);
                    pdf.setTextColor(0, 0, 0);
                }
            }

            y += 45;

            // --- 6. FOOTER ---
            const finalY = pdf.internal.pageSize.getHeight() - 10;
            pdf.setFontSize(7);
            pdf.setTextColor(150, 150, 150);
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, finalY - 5, pageWidth - margin, finalY - 5);

            const timestamp = new Date().toLocaleString("fr-FR");
            pdf.text(`Document généré le ${timestamp}.`, pageWidth / 2, finalY - 2, {
                align: "center",
            });
            pdf.text(
                `Ce document fait office de preuve de dépôt. ${APP_NAME} vous remercie.`,
                pageWidth / 2,
                finalY + 1,
                { align: "center" },
            );

            // Save
            pdf.save(`Bordereau_${trackingNumber}.pdf`);
        } catch (error) {
            console.error("Erreur génération PDF: ", error);
        }
    },
};
