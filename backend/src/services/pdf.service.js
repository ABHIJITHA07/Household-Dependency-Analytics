import PDFDocument from 'pdfkit';

export class PdfService {
  /**
   * Generate a vector PDF document buffer from household report snapshot data.
   * @param {object} snapshot - Report snapshot payload
   * @returns {Promise<Buffer>}
   */
  static generateReportPDF(snapshot) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 40,
          size: 'A4',
          bufferPages: true
        });

        const buffers = [];
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', err => reject(err));

        // Colors Palette (Peach x Pistachio x Cream Theme)
        const colors = {
          primary: '#E89078',       // Peach
          primaryDark: '#B85B43',   // Dark Peach
          secondary: '#C2DFB3',     // Pistachio
          secondaryDark: '#3D6B4E', // Dark Pistachio
          background: '#FDFBF7',    // Cream surface
          cardBg: '#F8F4EE',
          darkText: '#2D2422',      // Cocoa
          mutedText: '#6E625E',
          accent: '#7E69AB',       // Lavender
          border: '#E8E1D7',
          white: '#FFFFFF',
          success: '#2E7D32',
          danger: '#C62828',
          warning: '#EF6C00'
        };

        const household = snapshot.householdInfo || {};
        const demographics = snapshot.demographics || {};
        const financials = snapshot.financials || {};
        const expenses = snapshot.expenseBreakdown || [];
        const prediction = snapshot.prediction || {};
        const insight = snapshot.insight || {};
        const monthlyRecord = snapshot.monthlyRecord || null;

        // --- PAGE HEADER BANNER ---
        doc.rect(0, 0, doc.page.width, 100).fill(colors.primary);
        doc.fillColor(colors.darkText).fontSize(20).font('Helvetica-Bold').text('Household Dependency Analytics System', 40, 28);
        doc.fontSize(12).font('Helvetica-Bold').text(snapshot.title || 'Household Financial Analytics Report', 40, 56);
        
        const periodText = snapshot.periodLabel
          ? `Period: ${snapshot.periodLabel}`
          : (monthlyRecord ? `Snapshot Period: ${monthlyRecord.recordMonth}/${monthlyRecord.recordYear}` : 'Live Profile Report');
        doc.fontSize(10).font('Helvetica').text(periodText, 40, 75);

        const genDate = snapshot.generatedAt ? new Date(snapshot.generatedAt).toLocaleDateString() : new Date().toLocaleDateString();
        doc.fontSize(9).font('Helvetica').text(`Generated: ${genDate}`, doc.page.width - 160, 75, { align: 'right' });

        let y = 120;

        // Helper: Section Title
        const drawSectionHeader = (title) => {
          if (y > 700) { doc.addPage(); y = 50; }
          doc.rect(40, y, doc.page.width - 80, 24).fill(colors.cardBg);
          doc.fillColor(colors.primaryDark).fontSize(11).font('Helvetica-Bold').text(title.toUpperCase(), 48, y + 6);
          y += 32;
        };

        // --- 1. HOUSEHOLD & DEMOGRAPHICS OVERVIEW ---
        drawSectionHeader('1. Household Demographic Profile');

        doc.fillColor(colors.darkText).fontSize(10).font('Helvetica-Bold').text(`Household Name: ${household.name || 'N/A'}`, 48, y);
        if (household.location) {
          doc.font('Helvetica').text(`Location: ${household.location}`, 300, y);
        }
        y += 18;

        // Demographics Grid/Table
        const demoData = [
          ['Total Members', String(demographics.totalMembers || 0)],
          ['Earning Members', String(demographics.earningMembers || 0)],
          ['Dependent Members', String(demographics.dependentMembers || 0)],
          ['Children (< 18 yrs)', String(demographics.childrenCount || 0)],
          ['Elderly (60+ yrs)', String(demographics.elderlyCount || 0)]
        ];

        let colX = 48;
        demoData.forEach(([label, val]) => {
          doc.rect(colX, y, 98, 40).fillAndStroke(colors.white, colors.border);
          doc.fillColor(colors.mutedText).fontSize(8).font('Helvetica').text(label, colX + 4, y + 6, { width: 90, align: 'center' });
          doc.fillColor(colors.darkText).fontSize(12).font('Helvetica-Bold').text(val, colX + 4, y + 22, { width: 90, align: 'center' });
          colX += 102;
        });

        y += 52;

        // --- 2. FINANCIAL HEALTH & DEPENDENCY ANALYTICS ---
        drawSectionHeader('2. Financial Health & Dependency Analytics');

        const formatCurrency = (amt) => amt !== undefined && amt !== null ? `₹${Number(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A';
        const formatPct = (pct) => pct !== undefined && pct !== null ? `${Number(pct).toFixed(2)}%` : 'Not Computable';

        doc.fillColor(colors.darkText).fontSize(10).font('Helvetica');
        
        // Income & Expense summary cards
        doc.rect(48, y, 246, 64).fillAndStroke(colors.white, colors.border);
        doc.fillColor(colors.mutedText).fontSize(9).text('Monthly Household Income', 58, y + 8);
        doc.fillColor(colors.darkText).fontSize(14).font('Helvetica-Bold').text(formatCurrency(financials.monthlyIncome), 58, y + 24);

        doc.rect(304, y, 246, 64).fillAndStroke(colors.white, colors.border);
        doc.fillColor(colors.mutedText).fontSize(9).font('Helvetica').text('Total Monthly Expenses', 314, y + 8);
        doc.fillColor(colors.darkText).fontSize(14).font('Helvetica-Bold').text(formatCurrency(financials.totalExpenses), 314, y + 24);

        y += 72;

        doc.rect(48, y, 160, 54).fillAndStroke(colors.white, colors.border);
        doc.fillColor(colors.mutedText).fontSize(8).font('Helvetica').text('Net Monthly Savings', 54, y + 6);
        doc.fillColor(financials.savings >= 0 ? colors.success : colors.danger).fontSize(11).font('Helvetica-Bold').text(formatCurrency(financials.savings), 54, y + 24);

        doc.rect(216, y, 160, 54).fillAndStroke(colors.white, colors.border);
        doc.fillColor(colors.mutedText).fontSize(8).font('Helvetica').text('Savings Rate %', 222, y + 6);
        doc.fillColor(colors.darkText).fontSize(11).font('Helvetica-Bold').text(formatPct(financials.savingsRate), 222, y + 24);

        doc.rect(384, y, 166, 54).fillAndStroke(colors.white, colors.border);
        doc.fillColor(colors.mutedText).fontSize(8).font('Helvetica').text('Dependency Ratio', 390, y + 6);
        const depRatioText = financials.dependencyRatio !== null && financials.dependencyRatio !== undefined
          ? `${Number(financials.dependencyRatio).toFixed(2)}% (${financials.dependencyLevel || 'N/A'})`
          : 'Not Computable (Zero Earners)';
        doc.fillColor(colors.darkText).fontSize(10).font('Helvetica-Bold').text(depRatioText, 390, y + 24);

        y += 66;

        // --- 3. EXPENSE ITEMIZATION BREAKDOWN ---
        if (expenses.length > 0) {
          drawSectionHeader('3. Categorized Expense Breakdown');

          // Header Row
          doc.rect(48, y, 502, 20).fill(colors.cardBg);
          doc.fillColor(colors.darkText).fontSize(9).font('Helvetica-Bold');
          doc.text('Category', 54, y + 5);
          doc.text('Essential', 180, y + 5);
          doc.text('Description', 260, y + 5);
          doc.text('Amount (₹)', 450, y + 5, { width: 90, align: 'right' });

          y += 20;

          doc.font('Helvetica').fontSize(9);
          expenses.slice(0, 15).forEach((item, index) => {
            if (y > 720) { doc.addPage(); y = 50; }
            const bg = index % 2 === 0 ? colors.white : '#FAF7F2';
            doc.rect(48, y, 502, 18).fillAndStroke(bg, colors.border);

            doc.fillColor(colors.darkText).text(item.category || 'OTHER', 54, y + 4);
            doc.text(item.isEssential || item.is_essential ? 'Yes (Essential)' : 'No (Discretionary)', 180, y + 4);
            doc.text((item.description || '-').substring(0, 30), 260, y + 4);
            doc.text(formatCurrency(item.amount), 450, y + 4, { width: 90, align: 'right' });

            y += 18;
          });

          y += 16;
        }

        // --- 4. ML RISK LEVEL ASSESSMENT ---
        drawSectionHeader('4. Machine Learning Risk Assessment');

        doc.rect(48, y, 502, 60).fillAndStroke(colors.cardBg, colors.border);
        doc.fillColor(colors.mutedText).fontSize(9).font('Helvetica').text('Supervised Random Forest Model Vulnerability Assessment:', 58, y + 8);
        
        const riskLevel = prediction.predictedRiskLevel || snapshot.predictedRiskLevel || 'NOT_EVALUATED';
        const riskColor = riskLevel === 'LOW' ? colors.success : (riskLevel === 'HIGH' ? colors.danger : colors.warning);

        doc.fillColor(riskColor).fontSize(14).font('Helvetica-Bold').text(`PREDICTED RISK LEVEL: ${riskLevel}`, 58, y + 26);
        if (prediction.confidence) {
          doc.fillColor(colors.darkText).fontSize(10).font('Helvetica').text(`Model Confidence Estimate: ${prediction.confidence}`, 350, y + 28);
        }

        y += 72;

        // --- 5. GEMINI AI INSIGHTS ---
        const sections = insight.sections || (typeof insight.contentJson === 'object' ? insight.contentJson : null);
        if (sections) {
          drawSectionHeader('5. Gemini AI Guidance & Action Plan');

          const keys = [
            ['understandHousehold', '1. Household Structure'],
            ['expenseReview', '2. Expense Review'],
            ['savingsStability', '3. Savings & Financial Stability'],
            ['growthOpportunities', '4. Growth & Optimization Opportunities'],
            ['thingsToMonitor', '5. Things to Monitor']
          ];

          keys.forEach(([k, title]) => {
            if (sections[k]) {
              if (y > 700) { doc.addPage(); y = 50; }
              doc.fillColor(colors.primaryDark).fontSize(10).font('Helvetica-Bold').text(title, 48, y);
              y += 14;
              doc.fillColor(colors.darkText).fontSize(9).font('Helvetica').text(sections[k], 48, y, { width: 502, align: 'justify' });
              y += doc.heightOfString(sections[k], { width: 502 }) + 10;
            }
          });
        }

        // --- DISCLAIMERS & FOOTER ---
        if (y > 680) { doc.addPage(); y = 50; }
        y += 10;
        doc.rect(48, y, 502, 44).fillAndStroke('#FFF9F2', colors.primary);
        doc.fillColor(colors.mutedText).fontSize(7.5).font('Helvetica').text(
          'DISCLAIMER: This automated analytics report combines deterministic accounting formulas, supervised machine learning probability estimates, and generative AI explanations. It is provided strictly for educational and self-assessment purposes and does not constitute certified legal, medical, or professional financial advice.',
          54, y + 6, { width: 490, align: 'center' }
        );

        // Page Numbering Footer
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);
          doc.fillColor(colors.mutedText).fontSize(8).font('Helvetica').text(
            `Page ${i + 1} of ${range.count} • Confidential • Household Dependency Analytics & Prediction System`,
            40,
            doc.page.height - 30,
            { align: 'center', width: doc.page.width - 80 }
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
