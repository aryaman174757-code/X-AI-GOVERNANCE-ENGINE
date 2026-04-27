/**
 * Export Service
 * Generate PDF and JSON compliance reports
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate PDF report
 */
export function generatePDFReport(auditEntry) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('X-AI Governance Engine', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Compliance Report', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 38, { align: 'center' });
  
  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 45, pageWidth - 20, 45);
  
  let yPos = 55;
  
  // Prompt Section
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('1. PROMPT', 20, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const promptLines = doc.splitTextToSize(auditEntry.prompt || 'N/A', pageWidth - 40);
  doc.text(promptLines, 20, yPos);
  yPos += promptLines.length * 5 + 10;
  
  // Intent Breakdown
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('2. INTENT BREAKDOWN', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  const intentData = [
    ['Goal', auditEntry.intent?.goal || 'N/A'],
    ['Method', auditEntry.intent?.method || 'N/A'],
    ['Target', auditEntry.intent?.target || 'N/A']
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Component', 'Value']],
    body: intentData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Risk Analysis Table
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('3. RISK ANALYSIS', 20, yPos);
  yPos += 10;
  
  const riskData = [
    ['Keyword Risk', auditEntry.riskBreakdown?.keyword?.score?.toFixed(2) || 'N/A'],
    ['Intent Risk', auditEntry.riskBreakdown?.intent?.score?.toFixed(2) || 'N/A'],
    ['Contextual Risk', auditEntry.riskBreakdown?.contextual?.score?.toFixed(2) || 'N/A'],
    ['Threat Score', auditEntry.threatScore?.toFixed(2) || 'N/A'],
    ['Total Risk Score', auditEntry.riskScore?.toFixed(2) || 'N/A']
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Factor', 'Score']],
    body: riskData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    margin: { left: 20, right: 20 }
  });
  
  yPos = doc.lastAutoTable.finalY + 15;
  
  // Threat Matches
  if (auditEntry.matchedThreats && auditEntry.matchedThreats.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('4. THREAT MATCHES', 20, yPos);
    yPos += 10;
    
    const threatData = auditEntry.matchedThreats.map(t => [
      t.pattern || 'N/A',
      t.category || 'N/A',
      t.severity?.toFixed(2) || 'N/A'
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Pattern', 'Category', 'Severity']],
      body: threatData,
      theme: 'striped',
      headStyles: { fillColor: [180, 60, 60] },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
  }
  
  // Final Decision
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('5. FINAL DECISION', 20, yPos);
  yPos += 10;
  
  const decisionColors = {
    'ALLOW': [34, 197, 94],
    'WARN': [245, 158, 11],
    'BLOCK': [239, 68, 68]
  };
  
  const decisionColor = decisionColors[auditEntry.decision] || [100, 100, 100];
  
  doc.setFillColor(...decisionColor);
  doc.roundedRect(20, yPos, 50, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(auditEntry.decision || 'N/A', 45, yPos + 8, { align: 'center' });
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(`Policy: ${auditEntry.policy || 'N/A'}`, 80, yPos + 8);
  
  yPos += 25;
  
  // Timestamp
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Timestamp: ${auditEntry.timestamp || 'N/A'}`, 20, yPos);
  doc.text(`Audit ID: ${auditEntry.id || 'N/A'}`, pageWidth - 20, yPos, { align: 'right' });
  
  // Footer
  doc.setFontSize(8);
  doc.text('X-AI Governance Engine - Compliance Report', pageWidth / 2, 285, { align: 'center' });
  
  return doc;
}

/**
 * Generate JSON report
 */
export function generateJSONReport(auditEntry) {
  return {
    reportType: 'X-AI Governance Engine Compliance Report',
    generatedAt: new Date().toISOString(),
    auditEntry: {
      id: auditEntry.id,
      prompt: auditEntry.prompt,
      intent: {
        goal: auditEntry.intent?.goal,
        method: auditEntry.intent?.method,
        target: auditEntry.intent?.target
      },
      riskAnalysis: {
        totalScore: auditEntry.riskScore,
        breakdown: auditEntry.riskBreakdown,
        components: {
          keywordRisk: auditEntry.riskBreakdown?.keyword?.score,
          intentRisk: auditEntry.riskBreakdown?.intent?.score,
          contextualRisk: auditEntry.riskBreakdown?.contextual?.score,
          threatScore: auditEntry.threatScore
        }
      },
      threatIntelligence: {
        score: auditEntry.threatScore,
        matchedPatterns: auditEntry.matchedThreats
      },
      decision: {
        outcome: auditEntry.decision,
        policy: auditEntry.policy,
        timestamp: auditEntry.timestamp
      }
    }
  };
}

/**
 * Export audit entry
 */
export function exportAuditEntry(auditEntry, format = 'pdf') {
  if (format === 'json') {
    const jsonReport = generateJSONReport(auditEntry);
    return {
      data: JSON.stringify(jsonReport, null, 2),
      contentType: 'application/json',
      filename: `governance-report-${auditEntry.id}.json`
    };
  }
  
  // Default to PDF
  const pdfDoc = generatePDFReport(auditEntry);
  return {
    data: pdfDoc.output('arraybuffer'),
    contentType: 'application/pdf',
    filename: `governance-report-${auditEntry.id}.pdf`
  };
}

export default {
  generatePDFReport,
  generateJSONReport,
  exportAuditEntry
};