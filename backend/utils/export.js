// CSV and PDF export utilities

const generateCSV = (transactions) => {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  const csvRows = [headers.join(',')];

  transactions.forEach(transaction => {
    const row = [
      new Date(transaction.date).toLocaleDateString(),
      transaction.type,
      transaction.category,
      `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes
      transaction.amount.toFixed(2)
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

const generatePDF = async (transactions, user) => {
  // Simple PDF generation - in production, use libraries like puppeteer or pdfkit
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Expense Tracker Report</h1>
          <p>Generated for: ${user.name}</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <p>Total Transactions: ${transactions.length}</p>
          <p>Total Income: $${transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
          <p>Total Expenses: $${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.type}</td>
                <td>${t.category}</td>
                <td>${t.description}</td>
                <td>$${t.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // In production, use puppeteer to generate actual PDF
  // For now, return HTML as buffer
  return Buffer.from(html, 'utf8');
};

module.exports = {
  generateCSV,
  generatePDF
};