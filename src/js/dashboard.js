
/**
 * Dashboard functionality for PKR Accounts
 */

// Initialize charts and data when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await initializeDashboard();
    setupEventListeners();
  });
  
  async function initializeDashboard() {
    try {
      // Wait for database to initialize
      if (!window.db) {
        await new Promise(resolve => {
          const checkDb = setInterval(() => {
            if (window.db) {
              clearInterval(checkDb);
              resolve();
            }
          }, 100);
        });
      }
      
      // Load all required data
      await Promise.all([
        loadProfitLossChart(),
        loadSummaryCharts(),
        loadRecentStock(),
        loadRecentCustomers()
      ]);
      
      console.log('Dashboard initialized successfully');
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      showToast('Error', 'Failed to initialize dashboard', 'error');
    }
  }
  
  function setupEventListeners() {
    // Backup button
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
      backupBtn.addEventListener('click', handleBackup);
    }
    
    // PDF button
    const pdfBtn = document.getElementById('pdfBtn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', handleGeneratePDF);
    }
  }
  
  // Chart functions
  async function loadProfitLossChart() {
    // Sample data for the profit/loss chart
    // In a real application, this would come from transaction data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const recentMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
    
    // Generate some sample data for profits and losses
    const profits = recentMonths.map(() => Math.floor(Math.random() * 50000) + 10000);
    const expenses = recentMonths.map(() => Math.floor(Math.random() * 30000) + 5000);
    
    // Get canvas element
    const ctx = document.getElementById('profitLossChart').getContext('2d');
    
    // Create the chart
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: recentMonths,
        datasets: [
          {
            label: 'Income (PKR)',
            data: profits,
            borderColor: '#000000',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Expenses (PKR)',
            data: expenses,
            borderColor: '#6B7280',
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PKR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'PKR ' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }
  
  async function loadSummaryCharts() {
    // Load stock chart
    await loadStockChart();
    
    // Load expense chart
    await loadExpenseChart();
    
    // Load receivable chart
    await loadReceivableChart();
    
    // Load payable chart
    await loadPayableChart();
  }
  
  async function loadStockChart() {
    try {
      // Get stock summary data
      const stockSummary = await window.db.getStockSummary();
      
      // Prepare data for chart
      const labels = stockSummary.slice(0, 5).map(item => item.itemName);
      const data = stockSummary.slice(0, 5).map(item => item.totalValue);
      
      // Create chart
      const ctx = document.getElementById('stockChart').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              'rgba(0, 0, 0, 0.8)',
              'rgba(0, 0, 0, 0.6)',
              'rgba(0, 0, 0, 0.4)',
              'rgba(0, 0, 0, 0.2)',
              'rgba(107, 114, 128, 0.4)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10,
                font: {
                  size: 10
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed !== null) {
                    label += new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PKR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(context.parsed);
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error loading stock chart:', error);
    }
  }
  
  async function loadExpenseChart() {
    // Sample data for expense chart
    const categories = ['Utilities', 'Rent', 'Salaries', 'Supplies', 'Other'];
    const amounts = [12000, 45000, 63000, 24000, 18000];
    
    const ctx = document.getElementById('expenseChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: [
            'rgba(0, 0, 0, 0.8)',
            'rgba(0, 0, 0, 0.6)',
            'rgba(0, 0, 0, 0.4)',
            'rgba(0, 0, 0, 0.2)',
            'rgba(107, 114, 128, 0.4)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              font: {
                size: 10
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'PKR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(context.parsed);
                }
                return label;
              }
            }
          }
        }
      }
    });
  }
  
  async function loadReceivableChart() {
    try {
      // Get all customers with balances
      const customers = await window.db.getAllCustomersSummary();
      
      // Filter to get customers with positive balances (receivables)
      const receivables = customers
        .filter(customer => customer.balance > 0)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);
      
      // Prepare data for chart
      const labels = receivables.map(customer => customer.name);
      const data = receivables.map(customer => customer.balance);
      
      // Create chart
      const ctx = document.getElementById('receivableChart').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              'rgba(0, 0, 0, 0.8)',
              'rgba(0, 0, 0, 0.6)',
              'rgba(0, 0, 0, 0.4)',
              'rgba(0, 0, 0, 0.2)',
              'rgba(107, 114, 128, 0.4)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10,
                font: {
                  size: 10
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed !== null) {
                    label += new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PKR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(context.parsed);
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error loading receivable chart:', error);
    }
  }
  
  async function loadPayableChart() {
    try {
      // Get all customers with balances
      const customers = await window.db.getAllCustomersSummary();
      
      // Filter to get customers with negative balances (payables, we'll use absolute values)
      const payables = customers
        .filter(customer => customer.balance < 0)
        .map(customer => ({
          ...customer,
          balance: Math.abs(customer.balance)
        }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);
      
      // Prepare data for chart
      const labels = payables.map(customer => customer.name);
      const data = payables.map(customer => customer.balance);
      
      // Create chart
      const ctx = document.getElementById('payableChart').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              'rgba(0, 0, 0, 0.8)',
              'rgba(0, 0, 0, 0.6)',
              'rgba(0, 0, 0, 0.4)',
              'rgba(0, 0, 0, 0.2)',
              'rgba(107, 114, 128, 0.4)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10,
                font: {
                  size: 10
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed !== null) {
                    label += new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PKR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(context.parsed);
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error loading payable chart:', error);
    }
  }
  
  // Data loading functions
  async function loadRecentStock() {
    try {
      // Get all stock items
      const stockItems = await window.db.getAllStock();
      
      // Sort by date (newest first) and take the 5 most recent
      const recentStock = stockItems
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      // Display in the table
      const stockList = document.getElementById('recentStockList');
      if (stockList) {
        stockList.innerHTML = '';
        
        if (recentStock.length === 0) {
          stockList.innerHTML = `
            <tr>
              <td colspan="4" class="px-3 py-4 text-sm text-gray-500 text-center">No stock items found</td>
            </tr>
          `;
          return;
        }
        
        recentStock.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="px-3 py-2 text-sm text-gray-900">${item.itemName}</td>
            <td class="px-3 py-2 text-sm text-gray-500">${item.itemColor}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900">${item.quantity}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900">${formatCurrency(item.unitPrice)}</td>
          `;
          stockList.appendChild(row);
        });
      }
    } catch (error) {
      console.error('Error loading recent stock:', error);
    }
  }
  
  async function loadRecentCustomers() {
    try {
      // Get all customers with summaries
      const customers = await window.db.getAllCustomersSummary();
      
      // Sort by balance amount (highest first) and take the top 5
      const topCustomers = customers
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
        .slice(0, 5);
      
      // Display in the table
      const customersList = document.getElementById('recentCustomersList');
      if (customersList) {
        customersList.innerHTML = '';
        
        if (topCustomers.length === 0) {
          customersList.innerHTML = `
            <tr>
              <td colspan="4" class="px-3 py-4 text-sm text-gray-500 text-center">No customers found</td>
            </tr>
          `;
          return;
        }
        
        topCustomers.forEach(customer => {
          const balanceClass = customer.balance > 0 ? 'text-positive' : customer.balance < 0 ? 'text-negative' : '';
          
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="px-3 py-2 text-sm text-gray-900">${customer.name}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900">${formatCurrency(customer.totalDebit)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900">${formatCurrency(customer.totalCredit)}</td>
            <td class="px-3 py-2 text-right text-sm ${balanceClass} font-medium">${formatCurrency(customer.balance)}</td>
          `;
          customersList.appendChild(row);
        });
      }
    } catch (error) {
      console.error('Error loading recent customers:', error);
    }
  }
  
  // Helper functions
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Action handlers
  async function handleBackup() {
    try {
      // Call the Electron API to create a backup
      if (!window.electronAPI) {
        showToast('Error', 'Backup functionality is not available', 'error');
        return;
      }
      
      const result = await window.electronAPI.createBackup();
      
      if (result.success) {
        showToast('Success', result.message, 'success');
      } else {
        showToast('Error', result.message, 'error');
      }
    } catch (error) {
      console.error('Backup error:', error);
      showToast('Error', 'Failed to create backup', 'error');
    }
  }
  
  async function handleGeneratePDF() {
    try {
      // Call the Electron API to get the save path
      if (!window.electronAPI) {
        showToast('Error', 'PDF generation is not available', 'error');
        return;
      }
      
      const result = await window.electronAPI.generatePDF();
      
      if (!result.success) {
        showToast('Info', result.message, 'info');
        return;
      }
      
      // Generate PDF content
      const { jspdf } = window.jspdf;
      
      if (!jspdf) {
        showToast('Error', 'PDF generation library not loaded', 'error');
        return;
      }
      
      const doc = new jspdf.jsPDF();
      
      // Add content to PDF
      doc.setFontSize(20);
      doc.text('PKR Accounts Report', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      
      // Add stock summary
      const stockSummary = await window.db.getStockSummary();
      if (stockSummary.length > 0) {
        doc.setFontSize(16);
        doc.text('Stock Summary', 14, 50);
        
        // Create a table
        doc.autoTable({
          startY: 55,
          head: [['Item Name', 'Color', 'Quantity', 'Average Price (PKR)', 'Total Value (PKR)']],
          body: stockSummary.map(item => [
            item.itemName,
            item.itemColor,
            item.quantity.toString(),
            formatCurrency(item.averagePrice),
            formatCurrency(item.totalValue)
          ]),
          theme: 'grid'
        });
      }
      
      // Add customer summary
      const customers = await window.db.getAllCustomersSummary();
      if (customers.length > 0) {
        const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 50;
        
        doc.setFontSize(16);
        doc.text('Customer Summary', 14, currentY);
        
        // Create a table
        doc.autoTable({
          startY: currentY + 5,
          head: [['Customer Name', 'Phone', 'Total Debit (PKR)', 'Total Credit (PKR)', 'Balance (PKR)']],
          body: customers.map(customer => [
            customer.name,
            customer.phone,
            formatCurrency(customer.totalDebit),
            formatCurrency(customer.totalCredit),
            formatCurrency(customer.balance)
          ]),
          theme: 'grid'
        });
      }
      
      // Save the PDF
      doc.save(result.filePath);
      
      showToast('Success', 'PDF report generated successfully', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Error', 'Failed to generate PDF report', 'error');
    }
  }
  
  // Toast notification function
  function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    if (!toast || !toastTitle || !toastMessage || !toastIcon) return;
    
    // Set the content
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set the icon based on type
    let iconPath = '';
    switch (type) {
      case 'success':
        iconPath = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
        break;
      case 'error':
        iconPath = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
        break;
      case 'warning':
        iconPath = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>';
        break;
      case 'info':
      default:
        iconPath = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';
        break;
    }
    
    toastIcon.innerHTML = iconPath;
    
    // Show the toast
    toast.classList.remove('hide');
    toast.style.display = 'block';
    
    // Hide the toast after 3 seconds
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => {
        toast.style.display = 'none';
        toast.classList.remove('hide');
      }, 300);
    }, 3000);
  }
  