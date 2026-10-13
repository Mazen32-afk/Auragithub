import React, { useState, useEffect } from 'react';
import { Product, InventoryLog, FilterStatus, AndroidNotification } from './types';
import { INITIAL_PRODUCTS, AVAILABLE_CURRENCIES, PRODUCT_CATEGORIES } from './data/initialData';
import { exportInventoryToCSV, exportInventoryToPDF } from './utils/exportUtils';
import { playLowStockAlertSound } from './utils/soundUtils';
import { AndroidFrame } from './components/AndroidFrame';
import { TopNav } from './components/TopNav';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { BulkAdjustModal } from './components/BulkAdjustModal';
import { ProductFormModal } from './components/ProductFormModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { AuditLogModal } from './components/AuditLogModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { AndroidNotificationBanner } from './components/AndroidNotificationBanner';
import { NotificationDrawer } from './components/NotificationDrawer';
import { RotateCcw, Smartphone, Monitor } from 'lucide-react';

const STORAGE_KEY_PRODUCTS = 'aurastock_products_v1';
const STORAGE_KEY_LOGS = 'aurastock_logs_v1';
const STORAGE_KEY_CATEGORIES = 'aurastock_categories_v1';
const STORAGE_KEY_NOTIFICATIONS = 'aurastock_notifications_v1';

export default function App() {
  // Products state with local storage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS;
  });

  // Categories state with local storage persistence
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return PRODUCT_CATEGORIES;
  });

  // Audit Logs state
  const [logs, setLogs] = useState<InventoryLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Android Notifications state
  const [notifications, setNotifications] = useState<AndroidNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Active Android Heads-Up notification banner
  const [activeBannerNotification, setActiveBannerNotification] = useState<AndroidNotification | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'inventory' | 'dashboard' | 'history' | 'flutter'>('inventory');
  const [activeFilterStatus, setActiveFilterStatus] = useState<FilterStatus>('all');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState('USD');
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // Modals state
  const [bulkProduct, setBulkProduct] = useState<Product | null>(null);
  const [formModalState, setFormModalState] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null,
  });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  const currentCurrency = AVAILABLE_CURRENCIES.find((c) => c.code === selectedCurrencyCode) || AVAILABLE_CURRENCIES[0];

  // Helper: Trigger Android Notification when stock drops below 5
  const triggerLowStockAlert = (product: Product, previousQty: number, newQty: number) => {
    if (newQty < 5 && newQty < previousQty) {
      // Play Android alert chime
      playLowStockAlertSound();

      const notif: AndroidNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        quantity: newQty,
        previousQuantity: previousQty,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [notif, ...prev.slice(0, 50)]);
      setActiveBannerNotification(notif);
    }
  };

  // Log inventory modification helper
  const addLog = (
    productId: string,
    productName: string,
    type: InventoryLog['type'],
    previousQty: number,
    newQty: number,
    reason: string
  ) => {
    const newLog: InventoryLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      productName,
      type,
      previousQty,
      newQty,
      delta: newQty - previousQty,
      reason,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 100)]);
  };

  // Add new category
  const handleAddCategory = (categoryName: string) => {
    if (!categories.includes(categoryName)) {
      setCategories((prev) => [...prev, categoryName]);
    }
  };

  // 3. Increment Quantity (+1)
  const handleIncrement = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = p.quantity + 1;
          addLog(p.id, p.name, 'increment', p.quantity, newQty, 'Quick Increment (+1)');
          return { ...p, quantity: newQty, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  // 3. Decrement Quantity (-1) with Low-Stock Alert trigger
  const handleDecrement = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id && p.quantity > 0) {
          const previousQty = p.quantity;
          const newQty = p.quantity - 1;
          addLog(p.id, p.name, 'decrement', previousQty, newQty, 'Quick Decrement (-1)');
          triggerLowStockAlert(p, previousQty, newQty);
          return { ...p, quantity: newQty, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  // 3. Bulk stock adjustment with Low-Stock Alert trigger
  const handleApplyBulkAdjustment = (productId: string, newQuantity: number, reason: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const previousQty = p.quantity;
          addLog(p.id, p.name, 'bulk', previousQty, newQuantity, reason);
          triggerLowStockAlert(p, previousQty, newQuantity);
          return { ...p, quantity: newQuantity, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
    setBulkProduct(null);
  };

  // Add / Edit product with Low-Stock Alert trigger if created/edited with < 5
  const handleSaveProduct = (productData: Omit<Product, 'id' | 'updatedAt'> & { id?: string }) => {
    // Ensure category is in categories list
    if (productData.category && !categories.includes(productData.category)) {
      setCategories((prev) => [...prev, productData.category]);
    }

    if (productData.id) {
      // Edit
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productData.id) {
            const previousQty = p.quantity;
            const updated = {
              ...p,
              ...productData,
              updatedAt: new Date().toISOString(),
            };
            if (p.quantity !== productData.quantity) {
              addLog(p.id, p.name, 'edit', previousQty, productData.quantity, 'Product Edit / Stock Count');
              triggerLowStockAlert(updated, previousQty, productData.quantity);
            }
            return updated;
          }
          return p;
        })
      );
    } else {
      // Create new
      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      addLog(newProduct.id, newProduct.name, 'create', 0, newProduct.quantity, 'Initial Product Registration');
      if (newProduct.quantity < 5) {
        triggerLowStockAlert(newProduct, 0, newProduct.quantity);
      }
    }
    setFormModalState({ isOpen: false, product: null });
  };

  const handleDeleteProduct = (id: string) => {
    const item = products.find((p) => p.id === id);
    if (!item) return;
    if (confirm(`Are you sure you want to delete "${item.name}" from inventory?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addLog(item.id, item.name, 'edit', item.quantity, 0, 'Product SKU Deleted');
    }
  };

  // Reset to initial sample catalog
  const handleResetCatalog = () => {
    if (confirm('Reset inventory to initial luxury catalog demo? All current edits will be restored.')) {
      setProducts(INITIAL_PRODUCTS);
      setCategories(PRODUCT_CATEGORIES);
      setLogs([]);
      setNotifications([]);
    }
  };

  // 6. CSV & PDF Export
  const handleExportCSV = () => {
    exportInventoryToCSV(products, currentCurrency.symbol);
  };

  const handleExportPDF = () => {
    exportInventoryToPDF(products, currentCurrency.symbol);
  };

  return (
    <AndroidFrame isPhoneFrame={isPhoneFrame} onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}>
      {/* App Shell Container */}
      <div className="flex flex-col min-h-full">
        
        {/* Top Bar Contract Navigation with Notification Bell */}
        <TopNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAddModal={() => setFormModalState({ isOpen: true, product: null })}
          isPhoneFrame={isPhoneFrame}
          onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
          notificationCount={notifications.length}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        />

        {/* Secondary Utility Banner (Currency & Device Toggle) */}
        <div className="w-full bg-[#080b12]/60 backdrop-blur-xl border-b border-white/[0.04] px-4 md:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-slate-400 font-medium">Currency:</span>
              <select
                value={selectedCurrencyCode}
                onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                className="bg-black/40 border border-white/[0.08] rounded-xl px-2.5 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {AVAILABLE_CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.code} className="bg-[#0f1422]">
                    {cur.code} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPhoneFrame(!isPhoneFrame)}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-300 transition-colors cursor-pointer font-semibold bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] px-3 py-1 rounded-xl"
                title="Toggle Android Device Frame"
              >
                {isPhoneFrame ? (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fullscreen Glass</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Android View</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetCatalog}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="Reset sample inventory items"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
          {activeTab === 'inventory' && (
            <ProductList
              products={products}
              currencySymbol={currentCurrency.symbol}
              categoriesList={categories}
              onOpenAddCategory={() => setIsAddCategoryOpen(true)}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onOpenBulkAdjust={(p) => setBulkProduct(p)}
              onEditProduct={(p) => setFormModalState({ isOpen: true, product: p })}
              onDeleteProduct={handleDeleteProduct}
              onOpenScanner={() => setScannerOpen(true)}
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              activeFilterStatus={activeFilterStatus}
              onChangeFilterStatus={setActiveFilterStatus}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              products={products}
              currencySymbol={currentCurrency.symbol}
              onNavigateToLowStock={() => {
                setActiveFilterStatus('low_stock');
                setActiveTab('inventory');
              }}
              onNavigateToInventory={() => {
                setActiveFilterStatus('all');
                setActiveTab('inventory');
              }}
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
            />
          )}

          {activeTab === 'history' && (
            <AuditLogModal logs={logs} onClearLogs={() => setLogs([])} />
          )}

          {activeTab === 'flutter' && <FlutterCodeViewer />}
        </main>

        {/* Android Heads-Up Notification Banner */}
        <AndroidNotificationBanner
          notification={activeBannerNotification}
          onDismiss={() => setActiveBannerNotification(null)}
          onOpenBulkAdjust={(productId) => {
            const found = products.find((p) => p.id === productId);
            if (found) setBulkProduct(found);
          }}
        />

        {/* Android Notification Shade Drawer */}
        <NotificationDrawer
          notifications={notifications}
          isOpen={isNotificationDrawerOpen}
          onClose={() => setIsNotificationDrawerOpen(false)}
          onClearAll={() => setNotifications([])}
          onOpenBulkAdjust={(productId) => {
            const found = products.find((p) => p.id === productId);
            if (found) setBulkProduct(found);
          }}
        />

        {/* Add Category Modal */}
        <AddCategoryModal
          isOpen={isAddCategoryOpen}
          existingCategories={categories}
          onClose={() => setIsAddCategoryOpen(false)}
          onAddCategory={handleAddCategory}
        />

        {/* Bulk Adjustment Modal */}
        {bulkProduct && (
          <BulkAdjustModal
            product={bulkProduct}
            currencySymbol={currentCurrency.symbol}
            onClose={() => setBulkProduct(null)}
            onApplyAdjustment={handleApplyBulkAdjustment}
          />
        )}

        {/* Add/Edit Product Modal */}
        {formModalState.isOpen && (
          <ProductFormModal
            initialProduct={formModalState.product}
            currencySymbol={currentCurrency.symbol}
            categoriesList={categories}
            onOpenAddCategory={() => setIsAddCategoryOpen(true)}
            onClose={() => setFormModalState({ isOpen: false, product: null })}
            onSave={handleSaveProduct}
          />
        )}

        {/* Barcode Scanner Modal */}
        {scannerOpen && (
          <BarcodeScannerModal
            products={products}
            currencySymbol={currentCurrency.symbol}
            onClose={() => setScannerOpen(false)}
            onSelectProduct={(p) => {
              setBulkProduct(p);
            }}
          />
        )}

      </div>
    </AndroidFrame>
  );
}
