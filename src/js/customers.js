
/**
 * Customers management functionality for PKR Accounts
 */

// DOM Elements
let addCustomerModal;
let editCustomerModal;
let customerDetailsModal;
let confirmDeleteModal;
let addCustomerForm;
let editCustomerForm;
let customersList;
let deleteCustomerId;
let currentCustomerId;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await initElements();
  await initCustomersPage();
  setupEventListeners();
});

async function initElements() {
  // Get DOM elements
  addCustomerModal = document.getElementById('addCustomerModal');
  editCustomerModal = document.getElementById('editCustomerModal');
  customerDetailsModal = document.getElementById('customerDetailsModal');
  confirmDeleteModal = document.getElementById('confirmDeleteModal');
  addCustomerForm = document.getElementById('addCustomerForm');
  editCustomerForm = document.getElementById('editCustomerForm');
  customersList = document.getElementById('customersList');
}

async function initCustomersPage() {
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
    
    // Load data for the customers page
    await loadCustomers();
    
    console.log('Customers page initialized successfully');
  } catch (error) {
    console.error('Error initializing customers page:', error);
    showToast('Error', 'Failed to initialize customers page', 'error');
  }
}

function setupEventListeners() {
  // Add customer button
  const addCustomerBtn = document.getElementById('addCustomerBtn');
  if (addCustomerBtn) {
    addCustomerBtn.addEventListener('click', () => {
      showModal(addCustomerModal);
    });
  }
  
  // Add customer form
  if (addCustomerForm) {
    addCustomerForm.addEventListener('submit', handleAddCustomer);
    
    // Cancel button
    const cancelAddCustomer = document.getElementById('cancelAddCustomer');
    if (cancelAddCustomer) {
      cancelAddCustomer.addEventListener('click', () => {
        hideModal(addCustomerModal);
      });
    }
  }
  
  // Edit customer form
  if (editCustomerForm) {
    editCustomerForm.addEventListener('submit', handleEditCustomer);
    
    // Cancel button
    const cancelEditCustomer = document.getElementById('cancelEditCustomer');
    if (cancelEditCustomer) {
      cancelEditCustomer.addEventListener('click', () => {
        hideModal(editCustomerModal);
      });
    }
  }
  
  // Close customer details button
  const closeCustomerDetails = document.getElementById('closeCustomerDetails');
  if (closeCustomerDetails) {
    closeCustomerDetails.addEventListener('click', () => {
      hideModal(customerDetailsModal);
    });
  }
  
  // Delete confirmation
  const cancelDelete = document.getElementById('cancelDelete');
  const confirmDelete = document.getElementById('confirmDelete');
  
  if (cancelDelete) {
    cancelDelete.addEventListener('click', () => {
      hideModal(confirmDeleteModal);
    });
  }
  
  if (confirmDelete) {
    confirmDelete.addEventListener('click', async () => {
      if (deleteCustomerId) {
        await deleteCustomer(deleteCustomerId);
        hideModal(confirmDeleteModal);
      }
    });
  }
}

// Data loading functions
async function loadCustomers() {
  try {
    const customers = await window.db.getAllCustomersSummary();
    
    if (customersList) {
      customersList.innerHTML = '';
      
      if (customers.length === 0) {
        customersList.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-4 text-sm text-gray-500 text-center">No customers found</td>
          </tr>
        `;
        return;
      }
      
      // Sort by name
      customers.sort((a, b) => a.name.localeCompare(b.name));
      
      customers.forEach(customer => {
        const row = document.createElement('tr');
        const balanceClass = customer.balance > 0 ? 'text-positive' : customer.balance < 0 ? 'text-negative' : '';
        
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${customer.name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${customer.phone || '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${formatCurrency(customer.totalDebit)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${formatCurrency(customer.totalCredit)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm ${balanceClass} font-medium text-right">${formatCurrency(customer.balance)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
            <button class="view-customer-btn text-black hover:text-gray-600 mx-1" data-id="${customer.id}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="edit-customer-btn text-black hover:text-gray-600 mx-1" data-id="${customer.id}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="delete-customer-btn text-red-600 hover:text-red-800 mx-1" data-id="${customer.id}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </td>
        `;
        
        customersList.appendChild(row);
      });
      
      // Add event listeners for action buttons
      document.querySelectorAll('.view-customer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.getAttribute('data-id'));
          openCustomerDetails(id);
        });
      });
      
      document.querySelectorAll('.edit-customer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.getAttribute('data-id'));
          openEditCustomerModal(id);
        });
      });
      
      document.querySelectorAll('.delete-customer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.getAttribute('data-id'));
          openDeleteConfirmation(id);
        });
      });
    }
  } catch (error) {
    console.error('Error loading customers:', error);
  }
}

async function loadCustomerTransactions(customerId) {
  try {
    const transactions = await window.db.getTransactionsByCustomerId(customerId);
    const transactionsList = document.getElementById('customerTransactionsList');
    
    if (transactionsList) {
      transactionsList.innerHTML = '';
      
      if (transactions.length === 0) {
        transactionsList.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-4 text-sm text-gray-500 text-center">No transactions found</td>
          </tr>
        `;
        return;
      }
      
      // Sort by date (newest first)
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Calculate running balance
      let runningBalance = 0;
      
      transactions.forEach(transaction => {
        const row = document.createElement('tr');
        const isDebit = transaction.type === 'debit';
        
        // Update running balance
        if (isDebit) {
          runningBalance += transaction.amount;
        } else {
          runningBalance -= transaction.amount;
        }
        
        const balanceClass = runningBalance > 0 ? 'text-positive' : runningBalance < 0 ? 'text-negative' : '';
        
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(transaction.date)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${isDebit ? 'Debit' : 'Credit'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.description || '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${isDebit ? formatCurrency(transaction.amount) : '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${!isDebit ? formatCurrency(transaction.amount) : '-'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm ${balanceClass} font-medium text-right">${formatCurrency(runningBalance)}</td>
        `;
        
        transactionsList.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error loading customer transactions:', error);
  }
}

// Form handling functions
async function handleAddCustomer(e) {
  e.preventDefault();
  
  try {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    
    if (!name) {
      showToast('Error', 'Please enter a customer name', 'error');
      return;
    }
    
    // Create customer object
    const customer = {
      name,
      phone,
      address
    };
    
    // Save to database
    await window.db.addCustomer(customer);
    
    // Reset form
    addCustomerForm.reset();
    
    // Hide modal
    hideModal(addCustomerModal);
    
    // Refresh data
    await loadCustomers();
    
    showToast('Success', 'Customer added successfully', 'success');
  } catch (error) {
    console.error('Error adding customer:', error);
    showToast('Error', 'Failed to add customer', 'error');
  }
}

async function handleEditCustomer(e) {
  e.preventDefault();
  
  try {
    const id = parseInt(document.getElementById('editCustomerId').value);
    const name = document.getElementById('editCustomerName').value.trim();
    const phone = document.getElementById('editCustomerPhone').value.trim();
    const address = document.getElementById('editCustomerAddress').value.trim();
    
    if (!name) {
      showToast('Error', 'Please enter a customer name', 'error');
      return;
    }
    
    // Create customer object
    const customer = {
      id,
      name,
      phone,
      address
    };
    
    // Save to database
    await window.db.updateCustomer(customer);
    
    // Hide modal
    hideModal(editCustomerModal);
    
    // Refresh data
    await loadCustomers();
    
    showToast('Success', 'Customer updated successfully', 'success');
  } catch (error) {
    console.error('Error updating customer:', error);
    showToast('Error', 'Failed to update customer', 'error');
  }
}

async function deleteCustomer(id) {
  try {
    await window.db.deleteCustomer(id);
    
    // Refresh data
    await loadCustomers();
    
    showToast('Success', 'Customer deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting customer:', error);
    showToast('Error', 'Failed to delete customer', 'error');
  }
}

// UI handling functions
async function openCustomerDetails(id) {
  try {
    const customer = await window.db.getCustomerById(id);
    
    if (!customer) {
      showToast('Error', 'Customer not found', 'error');
      return;
    }
    
    // Save current customer ID
    currentCustomerId = id;
    
    // Get customer summary
    const summary = await window.db.getCustomerSummary(id);
    
    // Update summary display
    document.getElementById('customerDetailDebit').textContent = formatCurrency(summary.totalDebit);
    document.getElementById('customerDetailCredit').textContent = formatCurrency(summary.totalCredit);
    
    const balance = summary.balance;
    const balanceElement = document.getElementById('customerDetailBalance');
    balanceElement.textContent = formatCurrency(balance);
    balanceElement.className = balance > 0 ? 'text-2xl font-semibold text-positive' : balance < 0 ? 'text-2xl font-semibold text-negative' : 'text-2xl font-semibold text-black';
    
    // Load transactions
    await loadCustomerTransactions(id);
    
    // Show modal
    showModal(customerDetailsModal);
  } catch (error) {
    console.error('Error opening customer details:', error);
    showToast('Error', 'Failed to load customer data', 'error');
  }
}

async function openEditCustomerModal(id) {
  try {
    const customer = await window.db.getCustomerById(id);
    
    if (!customer) {
      showToast('Error', 'Customer not found', 'error');
      return;
    }
    
    // Fill the form
    document.getElementById('editCustomerId').value = customer.id;
    document.getElementById('editCustomerName').value = customer.name;
    document.getElementById('editCustomerPhone').value = customer.phone || '';
    document.getElementById('editCustomerAddress').value = customer.address || '';
    
    // Show modal
    showModal(editCustomerModal);
  } catch (error) {
    console.error('Error opening edit modal:', error);
    showToast('Error', 'Failed to load customer data', 'error');
  }
}

function openDeleteConfirmation(id) {
  deleteCustomerId = id;
  showModal(confirmDeleteModal);
}

function showModal(modal) {
  if (!modal) return;
  
  modal.classList.remove('hidden');
  modal.classList.add('modal-enter');
  modal.classList.remove('modal-exit');
}

function hideModal(modal) {
  if (!modal) return;
  
  modal.classList.add('modal-exit');
  modal.classList.remove('modal-enter');
  
  // Wait for animation to complete
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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
