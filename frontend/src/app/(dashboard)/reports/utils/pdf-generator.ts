// src/app/(dashboard)/reports/utils/pdf-generator.ts
import { formatDisplayDate, formatRp, formatTooltipDate } from './formatters';

interface GeneratePDFParams {
    chartData: any[];
    startDate: string;
    endDate: string;
    totalRevenue: number;
    averageRevenue: number;
    maxRevenue: number;
    userName: string;
}

export const generateFinancialReportPDF = ({
    chartData,
    startDate,
    endDate,
    totalRevenue,
    averageRevenue,
    maxRevenue,
    userName
}: GeneratePDFParams) => {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
        alert('Popup diblokir! Mohon izinkan popup untuk export PDF');
        return;
    }

    const printDate = new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Generate table rows
    const tableRows = chartData.map((item: any) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">
                ${formatTooltipDate(item.period)}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
                ${formatRp(Number(item.revenue))}
            </td>
        </tr>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Laporan Keuangan</title>
            <style>
                @media print {
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .no-print {
                        display: none;
                    }
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 20px;
                    background: #f9fafb;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding: 30px 20px;
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .header h1 {
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 10px;
                    letter-spacing: -0.5px;
                }
                
                .header p {
                    font-size: 14px;
                    opacity: 0.95;
                    margin: 5px 0;
                }
                
                .summary-cards {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin: 30px 0;
                }
                
                .summary-card {
                    padding: 25px;
                    border-radius: 12px;
                    color: white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .summary-card.blue {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                }
                
                .summary-card.green {
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                }
                
                .summary-card.purple {
                    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
                }
                
                .summary-card h3 {
                    font-size: 13px;
                    font-weight: 500;
                    opacity: 0.9;
                    margin-bottom: 8px;
                }
                
                .summary-card .value {
                    font-size: 26px;
                    font-weight: 700;
                    margin-bottom: 5px;
                }
                
                .summary-card .sub {
                    font-size: 11px;
                    opacity: 0.8;
                }
                
                .detail-section {
                    margin: 40px 0;
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                
                .detail-section h2 {
                    color: #2563eb;
                    font-size: 22px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #e5e7eb;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                
                thead {
                    background: #f3f4f6;
                }
                
                th {
                    padding: 15px 12px;
                    text-align: left;
                    font-weight: 600;
                    color: #374151;
                    font-size: 14px;
                    border-bottom: 2px solid #e5e7eb;
                }
                
                th:last-child {
                    text-align: right;
                }
                
                tbody tr:hover {
                    background: #f9fafb;
                }
                
                tfoot tr {
                    background: #f3f4f6;
                    font-weight: 700;
                }
                
                tfoot td {
                    padding: 15px 12px;
                    border-top: 3px solid #2563eb;
                    font-size: 16px;
                }
                
                .footer {
                    margin-top: 60px;
                    padding-top: 30px;
                    border-top: 2px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                
                .footer-left {
                    font-size: 12px;
                    color: #6b7280;
                }
                
                .footer-right {
                    text-align: right;
                }
                
                .footer-right p {
                    margin: 5px 0;
                    font-size: 12px;
                    color: #6b7280;
                }
                
                .signature {
                    margin-top: 60px;
                    padding-top: 15px;
                    border-top: 2px solid #333;
                    font-weight: 600;
                    font-size: 14px;
                    color: #333;
                    min-width: 200px;
                }
                
                .print-button {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 14px 28px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                    transition: all 0.2s;
                    z-index: 1000;
                }
                
                .print-button:hover {
                    background: #1d4ed8;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
                }
                
                .print-button:active {
                    transform: translateY(0);
                }
            </style>
        </head>
        <body>
            <button class="print-button no-print" onclick="window.print()">
                🖨️ Cetak / Simpan PDF
            </button>
            
            <div class="header">
                <h1>LAPORAN KEUANGAN</h1>
                <p style="font-size: 15px; margin-top: 10px;">
                    Periode: ${formatDisplayDate(new Date(startDate))} - ${formatDisplayDate(new Date(endDate))}
                </p>
                <p>Dicetak pada: ${printDate}</p>
            </div>
            
            <div class="summary-cards">
                <div class="summary-card blue">
                    <h3>Total Pendapatan</h3>
                    <div class="value">${formatRp(totalRevenue)}</div>
                    <div class="sub">${chartData.length} hari transaksi</div>
                </div>
                <div class="summary-card green">
                    <h3>Rata-rata per Hari</h3>
                    <div class="value">${formatRp(averageRevenue)}</div>
                    <div class="sub">Berdasarkan ${chartData.length} hari</div>
                </div>
                <div class="summary-card purple">
                    <h3>Pendapatan Tertinggi</h3>
                    <div class="value">${formatRp(maxRevenue)}</div>
                    <div class="sub">Dalam periode ini</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h2>📊 Detail Pendapatan Harian</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th style="text-align: right;">Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="text-align: left;">TOTAL</td>
                            <td style="text-align: right;">${formatRp(totalRevenue)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="footer">
                <div class="footer-left">
                    <p><strong>Laporan Keuangan Klinik</strong></p>
                    <p>Dokumen ini digenerate secara otomatis oleh sistem</p>
                    <p style="margin-top: 5px;">© ${new Date().getFullYear()} - All Rights Reserved</p>
                </div>
                <div class="footer-right">
                    <p>Dicetak oleh:</p>
                    <div class="signature">${userName}</div>
                </div>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Auto focus untuk print dialog
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.focus();
        }, 250);
    };
};