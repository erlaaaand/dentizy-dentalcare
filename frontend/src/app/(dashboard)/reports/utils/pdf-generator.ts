// src/components/financial-report/utils/pdf-generator.ts
import { formatDisplayDate, formatRp, formatTooltipDate } from './formatters';

interface GeneratePDFParams {
    chartData: any[];
    startDate: string;
    endDate: string;
    totalRevenue: number;
    userName: string;
}

export const generateFinancialReportPDF = ({
    chartData,
    startDate,
    endDate,
    totalRevenue,
    userName
}: GeneratePDFParams) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Popup diblokir! Mohon izinkan popup untuk export PDF');
        return;
    }

    const printDate = new Date().toLocaleString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const tableRows = chartData.map((item: any) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">${formatTooltipDate(item.period)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatRp(Number(item.revenue))}</td>
        </tr>
    `).join('');

    // ... (Masukkan sisa string HTML style dan body di sini seperti kode asli Anda) ...
    // Untuk mempersingkat jawaban, saya asumsikan string HTML panjang ada di sini
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Laporan Keuangan</title>
            <style>
                /* ... Copy style CSS dari kode lama Anda ke sini ... */
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                /* ... dst ... */
            </style>
        </head>
        <body>
            <div class="header">
                <h1>LAPORAN KEUANGAN</h1>
                <p>Periode: ${formatDisplayDate(new Date(startDate))} - ${formatDisplayDate(new Date(endDate))}</p>
                <p>Dicetak pada: ${printDate}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>Total Pendapatan: ${formatRp(totalRevenue)}</h3>
            </div>

            <table>
                <thead>
                    <tr style="background: #f3f4f6;">
                        <th>Tanggal</th>
                        <th style="text-align: right;">Pendapatan</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
                <tfoot>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">TOTAL</td>
                        <td style="padding: 12px; text-align: right; font-weight: bold;">${formatRp(totalRevenue)}</td>
                    </tr>
                </tfoot>
            </table>

             <div class="footer" style="margin-top: 50px;">
                <p>Dicetak oleh: <strong>${userName}</strong></p>
             </div>
             
             <script>
                window.onload = function() { setTimeout(function() { window.print(); }, 500); }
             </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};