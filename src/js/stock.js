
/**
 * Stock management functionality for PKR Accounts
 */

// DOM Elements
let itemNameDropdown;
let itemColorDropdown;
let itemNameInput;
let itemColorInput;
let itemDropdownBtn;
let colorDropdownBtn;
let addStockModal;
let editStockModal;
let confirmDeleteModal;
let addStockForm;
let editStockForm;
let stockSummaryList;
let stockEntriesList;
let deleteStockId;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await initElements();
  await initStockPage();
  setupEventListeners();
});

async function initElements() {
  // Get DOM elements
  itemNameDropdown = document.getElementById('itemNameDropdown');
  itemColorDropdown = document.getElementById('itemColorDropdown');
  itemNameInput = document.getElementById('itemNameInput');
  itemColorInput = document.getElementById('itemColorInput');
  itemDropdownBtn = document.getElementById('itemDropdownBtn');
  colorDropdownBtn = document.getElementById('colorDropdownBtn');
  addStockModal = document.getElementById('addStockModal');
  editStockModal = document.getElementById('editStockModal');
  confirmDeleteModal = document.getElementById('confirmDeleteModal');
  addStockForm = document.getElementById('addStockForm');
  editStockForm = document.getElementById('editStockForm');
  stockSummaryList = document.getElementById('stockSummaryList');
  stockEntriesList = document.getElementById('stockEntriesList');
  
  // Set default date to today for new stock items
  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
}

async function initStockPage() {
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
    
    // Load data for the stock page
    await Promise.all([
      loadStockSummary(),
      loadStockEntries(),
      loadItemNamesList(),
      loadItemColorsList()
    ]);
    
    console.log('Stock page initialized successfully');
  } catch (error) {
    console.error('Error initializing stock page:', error);
    showToast('Error', 'Failed to initialize stock page', 'error');
  }
}

function setupEventListeners() {
  // Add stock button
  const addStockBtn = document.getElementById('addStockBtn');
  if (addStockBtn) {
    addStockBtn.addEventListener('click', () => {
      showModal(addStockModal);
    });
  }
  
  // Item name dropdown
  if (itemDropdownBtn && itemNameDropdown) {
    itemDropdownBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDropdown(itemNameDropdown);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#itemNameDropdown') && !e.target.closest('#itemDropdownBtn')) {
        itemNameDropdown.classList.add('hidden');
      }
    });
    
    // New item button
    const newItemBtn = document.getElementById('newItemBtn');
    if (newItemBtn) {
      newItemBtn.addEventListener('click', () => {
        const newItemName = prompt('Enter new item name:');
        if (newItemName && newItemName.trim() !== '') {
          itemNameInput.value = newItemName.trim();
          itemNameDropdown.classList.add('hidden');
          loadItemNamesList();
        }
      });
    }
  }
  
  // Item color dropdown
  if (colorDropdownBtn && itemColorDropdown) {
    colorDropdownBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDropdown(itemColorDropdown);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#itemColorDropdown') && !e.target.closest('#colorDropdownBtn')) {
        itemColorDropdown.classList.add('hidden');
      }
    });
    
    // New color button
    const newColorBtn = document.getElementById('newColorBtn');
    if (newColorBtn) {
      newColorBtn.addEventListener('click', () => {
        const newColor = prompt('Enter new color:');
        if (newColor && newColor.trim() !== '') {
          itemColorInput.value = newColor.trim();
          itemColorDropdown.classList.add('hidden');
          loadItemColorsList();
        }
      });
    }
  }
  
  // Add stock form
  if (addStockForm) {
    addStockForm.addEventListener('submit', handleAddStock);
    
    // Cancel button
    const cancelAddStock = document.getElementById('cancelAddStock');
    if (cancelAddStock) {
      cancelAddStock.addEventListener('click', () => {
        hideModal(addStockModal);
      });
    }
  }
  
  // Edit stock form
  if (editStockForm) {
    editStockForm.addEventListener('submit', handleEditStock);
    
    // Cancel button
    const cancelEditStock = document.getElementById('cancelEditStock');
    if (cancelEditStock) {
      cancelEditStock.addEventListener('click', () => {
        hideModal(editStockModal);
      });
    }
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
      if (deleteStockId) {
        await deleteStockItem(deleteStockId);
        hideModal(confirmDeleteModal);
      }
    });
  }
}

// Data loading functions
async function loadStockSummary() {
  try {
    const summary = await window.db.getStockSummary();
    
    if (stockSummaryList) {
      stockSummaryList.innerHTML = '';
      
      if (summary.length === 0) {
        stockSummaryList.innerHTML = `
          <tr>
            <td colspan="5" class="px-6 py-4 text-sm text-gray-500 text-center">No stock items found</td>
          </tr>
        `;
        return;
      }
      
      summary.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.itemName}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.itemColor}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${item.quantity}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${formatCurrency(item.averagePrice)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${formatCurrency(item.totalValue)}</td>
        `;
        
        stockSummaryList.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error loading stock summary:', error);
  }
}

async function loadStockEntries() {
  try {
    const entries = await window.db.getAllStock();
    
    if (stockEntriesList) {
      stockEntriesList.innerHTML = '';
      
      if (entries.length === 0) {
        stockEntriesList.innerHTML = `
          <tr>
            <td colspan="7" class="px-6 py-4 text-sm text-gray-500 text-center">No stock entries found</td>
          </tr>
        `;
        return;
      }
      
      // Sort by date (newest first)
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      entries.forEach(entry => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(entry.date)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${entry.itemName}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.itemColor}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${entry.quantity}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${formatCurrency(entry.unitPrice)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${formatCurrency(entry.totalPrice)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="edit-stock-btn text-black hover:text-gray-600 mr-3" data-id="${entry.id}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="delete-stock-btn text-red-600 hover:text-red-800" data-id="${entry.id}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </td>
        `;
        
        stockEntriesList.appendChild(row);
      });
      
      // Add event listeners for edit and delete buttons
      document.querySelectorAll('.edit-stock-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.getAttribute('data-id'));
          openEditStockModal(id);
        });
      });
      
      document.querySelectorAll('.delete-stock-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.getAttribute('data-id'));
          openDeleteConfirmation(id);
        });
      });
    }
  } catch (error) {
    console.error('Error loading stock entries:', error);
  }
}

async function loadItemNamesList() {
  try {
    const itemNames = await window.db.getUniqueItemNames();
    const itemNamesList = document.getElementById('itemNamesList');
    
    if (itemNamesList) {
      itemNamesList.innerHTML = '';
      
      if (itemNames.length === 0) {
        itemNamesList.innerHTML = `
          <div class="py-2 px-4 text-sm text-gray-500">No items found</div>
        `;
        return;
      }
      
      itemNames.forEach(name => {
        const div = document.createElement('div');
        div.className = 'px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100';
        div.textContent = name;
        div.addEventListener('click', () => {
          itemNameInput.value = name;
          itemNameDropdown.classList.add('hidden');
        });
        
        itemNamesList.appendChild(div);
      });
    }
  } catch (error) {
    console.error('Error loading item names:', error);
  }
}

async function loadItemColorsList() {
  try {
    const colors = await window.db.getUniqueColors();
    const itemColorsList = document.getElementById('itemColorsList');
    
    if (itemColorsList) {
      itemColorsList.innerHTML = '';
      
      if (colors.length === 0) {
        itemColorsList.innerHTML = `
          <div class="py-2 px-4 text-sm text-gray-500">No colors found</div>
        `;
        return;
      }
      
      colors.forEach(color => {
        const div = document.createElement('div');
        div.className = 'px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100';
        div.textContent = color;
        div.addEventListener('click', () => {
          itemColorInput.value = color;
          itemColorDropdown.classList.add('hidden');
        });
        
        itemColorsList.appendChild(div);
      });
    }
  } catch (error) {
    console.error('Error loading item colors:', error);
  }
}

// Form handling functions
async function handleAddStock(e) {
  e.preventDefault();
  
  try {
    const itemName = itemNameInput.value.trim();
    const itemColor = itemColorInput.value.trim();
    const quantity = parseInt(document.getElementById('quantity').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const date = document.getElementById('date').value;
    
    if (!itemName || !itemColor || isNaN(quantity) || isNaN(unitPrice) || !date) {
      showToast('Error', 'Please fill in all fields with valid values', 'error');
      return;
    }
    
    if (quantity <= 0) {
      showToast('Error', 'Quantity must be greater than zero', 'error');
      return;
    }
    
    if (unitPrice < 0) {
      showToast('Error', 'Unit price cannot be negative', 'error');
      return;
    }
    
    // Create stock object
    const stock = {
      itemName,
      itemColor,
      quantity,
      unitPrice,
      date,
      totalPrice: quantity * unitPrice
    };
    
    // Save to database
    await window.db.addStock(stock);
    
    // Reset form
    addStockForm.reset();
    document.getElementById('date').valueAsDate = new Date();
    
    // Hide modal
    hideModal(addStockModal);
    
    // Refresh data
    await Promise.all([
      loadStockSummary(),
      loadStockEntries(),
      loadItemNamesList(),
      loadItemColorsList()
    ]);
    
    showToast('Success', 'Stock added successfully', 'success');
  } catch (error) {
    console.error('Error adding stock:', error);
    showToast('Error', 'Failed to add stock', 'error');
  }
}

async function handleEditStock(e) {
  e.preventDefault();
  
  try {
    const id = parseInt(document.getElementById('editStockId').value);
    const itemName = document.getElementById('editItemName').value.trim();
    const itemColor = document.getElementById('editItemColor').value.trim();
    const quantity = parseInt(document.getElementById('editQuantity').value);
    const unitPrice = parseFloat(document.getElementById('editUnitPrice').value);
    const date = document.getElementById('editDate').value;
    
    if (!itemName || !itemColor || isNaN(quantity) || isNaN(unitPrice) || !date) {
      showToast('Error', 'Please fill in all fields with valid values', 'error');
      return;
    }
    
    if (quantity <= 0) {
      showToast('Error', 'Quantity must be greater than zero', 'error');
      return;
    }
    
    if (unitPrice < 0) {
      showToast('Error', 'Unit price cannot be negative', 'error');
      return;
    }
    
    // Create stock object
    const stock = {
      id,
      itemName,
      itemColor,
      quantity,
      unitPrice,
      date,
      totalPrice: quantity * unitPrice
    };
    
    // Save to database
    await window.db.updateStock(stock);
    
    // Hide modal
    hideModal(editStockModal);
    
    // Refresh data
    await Promise.all([
      loadStockSummary(),
      loadStockEntries()
    ]);
    
    showToast('Success', 'Stock updated successfully', 'success');
  } catch (error) {
    console.error('Error updating stock:', error);
    showToast('Error', 'Failed to update stock', 'error');
  }
}

async function deleteStockItem(id) {
  try {
    await window.db.deleteStock(id);
    
    // Refresh data
    await Promise.all([
      loadStockSummary(),
      loadStockEntries()
    ]);
    
    showToast('Success', 'Stock deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting stock:', error);
    showToast('Error', 'Failed to delete stock', 'error');
  }
}

// UI handling functions
async function openEditStockModal(id) {
  try {
    const stock = await window.db.getStockById(id);
    
    if (!stock) {
      showToast('Error', 'Stock item not found', 'error');
      return;
    }
    
    // Fill the form
    document.getElementById('editStockId').value = stock.id;
    document.getElementById('editItemName').value = stock.itemName;
    document.getElementById('editItemColor').value = stock.itemColor;
    document.getElementById('editQuantity').value = stock.quantity;
    document.getElementById('editUnitPrice').value = stock.unitPrice;
    document.getElementById('editDate').value = stock.date;
    
    // Show modal
    showModal(editStockModal);
  } catch (error) {
    console.error('Error opening edit modal:', error);
    showToast('Error', 'Failed to load stock data', 'error');
  }
}

function openDeleteConfirmation(id) {
  deleteStockId = id;
  showModal(confirmDeleteModal);
}

function toggleDropdown(dropdown) {
  dropdown.classList.toggle('hidden');
  
  if (!dropdown.classList.contains('hidden')) {
    dropdown.classList.add('dropdown-enter');
    dropdown.classList.remove('dropdown-exit');
  } else {
    dropdown.classList.add('dropdown-exit');
    dropdown.classList.remove('dropdown-enter');
  }
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
