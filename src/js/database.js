
/**
 * Database management for PKR Accounts
 * Uses IndexedDB for local storage
 */

// Database constants
const DB_NAME = 'pkr_accounts_db';
const DB_VERSION = 1;
const STORES = {
  STOCK: 'stock',
  CUSTOMERS: 'customers',
  TRANSACTIONS: 'transactions',
  SETTINGS: 'settings'
};

// Initialize database
let db;

function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Database opened successfully');
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.STOCK)) {
        const stockStore = db.createObjectStore(STORES.STOCK, { keyPath: 'id', autoIncrement: true });
        stockStore.createIndex('itemName', 'itemName', { unique: false });
        stockStore.createIndex('itemColor', 'itemColor', { unique: false });
        stockStore.createIndex('date', 'date', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.CUSTOMERS)) {
        const customersStore = db.createObjectStore(STORES.CUSTOMERS, { keyPath: 'id', autoIncrement: true });
        customersStore.createIndex('name', 'name', { unique: false });
        customersStore.createIndex('phone', 'phone', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const transactionsStore = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id', autoIncrement: true });
        transactionsStore.createIndex('customerId', 'customerId', { unique: false });
        transactionsStore.createIndex('date', 'date', { unique: false });
        transactionsStore.createIndex('type', 'type', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
      
      console.log('Database setup complete');
    };
  });
}

// Generic database operations
function addItem(storeName, item) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);
    
    request.onsuccess = (event) => {
      resolve(event.target.result); // Returns the ID of the new item
    };
    
    request.onerror = (event) => {
      console.error(`Error adding item to ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

function updateItem(storeName, item) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      console.error(`Error updating item in ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

function deleteItem(storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = (event) => {
      resolve(true);
    };
    
    request.onerror = (event) => {
      console.error(`Error deleting item from ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

function getItem(storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      console.error(`Error getting item from ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

function getAllItems(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      console.error(`Error getting all items from ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

function getItemsByIndex(storeName, indexName, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      console.error(`Error getting items by index from ${storeName}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

// Stock-specific operations
async function addStock(stock) {
  // Ensure stock has a date field
  if (!stock.date) {
    stock.date = new Date().toISOString().split('T')[0];
  }
  
  // Calculate total price
  stock.totalPrice = stock.quantity * stock.unitPrice;
  
  return await addItem(STORES.STOCK, stock);
}

async function updateStock(stock) {
  // Calculate total price
  stock.totalPrice = stock.quantity * stock.unitPrice;
  
  return await updateItem(STORES.STOCK, stock);
}

async function deleteStock(id) {
  return await deleteItem(STORES.STOCK, id);
}

async function getAllStock() {
  return await getAllItems(STORES.STOCK);
}

async function getStockById(id) {
  return await getItem(STORES.STOCK, id);
}

// Get unique item names
async function getUniqueItemNames() {
  const allStock = await getAllStock();
  const uniqueNames = [...new Set(allStock.map(item => item.itemName))];
  return uniqueNames;
}

// Get unique colors
async function getUniqueColors() {
  const allStock = await getAllStock();
  const uniqueColors = [...new Set(allStock.map(item => item.itemColor))];
  return uniqueColors;
}

// Get stock summary (grouped by item name and color)
async function getStockSummary() {
  const allStock = await getAllStock();
  
  // Group by item name and color
  const summaryMap = new Map();
  
  allStock.forEach(item => {
    const key = `${item.itemName}-${item.itemColor}`;
    
    if (!summaryMap.has(key)) {
      summaryMap.set(key, {
        itemName: item.itemName,
        itemColor: item.itemColor,
        quantity: 0,
        totalValue: 0
      });
    }
    
    const summary = summaryMap.get(key);
    summary.quantity += item.quantity;
    summary.totalValue += item.totalPrice;
  });
  
  // Convert map to array and calculate average price
  const summary = Array.from(summaryMap.values()).map(item => ({
    ...item,
    averagePrice: item.quantity > 0 ? (item.totalValue / item.quantity) : 0
  }));
  
  return summary;
}

// Customer-specific operations
async function addCustomer(customer) {
  return await addItem(STORES.CUSTOMERS, customer);
}

async function updateCustomer(customer) {
  return await updateItem(STORES.CUSTOMERS, customer);
}

async function deleteCustomer(id) {
  // Delete customer
  await deleteItem(STORES.CUSTOMERS, id);
  
  // Delete associated transactions
  const transactions = await getItemsByIndex(STORES.TRANSACTIONS, 'customerId', id);
  for (const transaction of transactions) {
    await deleteItem(STORES.TRANSACTIONS, transaction.id);
  }
  
  return true;
}

async function getAllCustomers() {
  return await getAllItems(STORES.CUSTOMERS);
}

async function getCustomerById(id) {
  return await getItem(STORES.CUSTOMERS, id);
}

// Transaction-specific operations
async function addTransaction(transaction) {
  // Ensure transaction has a date field
  if (!transaction.date) {
    transaction.date = new Date().toISOString().split('T')[0];
  }
  
  return await addItem(STORES.TRANSACTIONS, transaction);
}

async function updateTransaction(transaction) {
  return await updateItem(STORES.TRANSACTIONS, transaction);
}

async function deleteTransaction(id) {
  return await deleteItem(STORES.TRANSACTIONS, id);
}

async function getTransactionsByCustomerId(customerId) {
  return await getItemsByIndex(STORES.TRANSACTIONS, 'customerId', customerId);
}

// Calculate customer summary (total debit, credit, balance)
async function getCustomerSummary(customerId) {
  const transactions = await getTransactionsByCustomerId(customerId);
  
  let totalDebit = 0;
  let totalCredit = 0;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'debit') {
      totalDebit += transaction.amount;
    } else if (transaction.type === 'credit') {
      totalCredit += transaction.amount;
    }
  });
  
  return {
    totalDebit,
    totalCredit,
    balance: totalDebit - totalCredit
  };
}

// Calculate all customers summary
async function getAllCustomersSummary() {
  const customers = await getAllCustomers();
  const summaries = [];
  
  for (const customer of customers) {
    const summary = await getCustomerSummary(customer.id);
    summaries.push({
      ...customer,
      ...summary
    });
  }
  
  return summaries;
}

// Settings operations
async function getSetting(id) {
  return await getItem(STORES.SETTINGS, id);
}

async function saveSetting(setting) {
  return await updateItem(STORES.SETTINGS, setting);
}

// Export/Import data for backup
async function exportDatabase() {
  const stock = await getAllStock();
  const customers = await getAllCustomers();
  const transactions = await getAllItems(STORES.TRANSACTIONS);
  const settings = await getAllItems(STORES.SETTINGS);
  
  return {
    stock,
    customers,
    transactions,
    settings,
    exportDate: new Date().toISOString(),
    version: DB_VERSION
  };
}

async function importDatabase(data) {
  // Clear existing data
  const clearStore = async (storeName) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    await store.clear();
  };
  
  try {
    // Clear all stores
    await clearStore(STORES.STOCK);
    await clearStore(STORES.CUSTOMERS);
    await clearStore(STORES.TRANSACTIONS);
    await clearStore(STORES.SETTINGS);
    
    // Add imported data
    const addAll = async (storeName, items) => {
      if (!items || !items.length) return;
      
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      for (const item of items) {
        await store.add(item);
      }
    };
    
    await addAll(STORES.STOCK, data.stock);
    await addAll(STORES.CUSTOMERS, data.customers);
    await addAll(STORES.TRANSACTIONS, data.transactions);
    await addAll(STORES.SETTINGS, data.settings);
    
    return true;
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
}

// Initialize and expose database API
async function init() {
  await initDatabase();
  
  // Expose database functions to window for use in other scripts
  window.db = {
    // Stock operations
    addStock,
    updateStock,
    deleteStock,
    getAllStock,
    getStockById,
    getUniqueItemNames,
    getUniqueColors,
    getStockSummary,
    
    // Customer operations
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getAllCustomers,
    getCustomerById,
    getCustomerSummary,
    getAllCustomersSummary,
    
    // Transaction operations
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByCustomerId,
    
    // Settings operations
    getSetting,
    saveSetting,
    
    // Backup operations
    exportDatabase,
    importDatabase,
  };
  
  // Also expose backup functions directly on window for use by the main process
  window.exportDatabase = exportDatabase;
  window.importDatabase = importDatabase;
  
  return window.db;
}

// Initialize database on page load
document.addEventListener('DOMContentLoaded', init);
