// ====================================================================
// AuraStock Inventory Management - Flutter & Dart (Android)
// Luxury Royal Sapphire Blue Theme (#2563EB / #38BDF8 / #080D1A)
// ====================================================================

import 'dart:io';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF080D1A),
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  runApp(const AuraStockApp());
}

class CurrencyOption {
  final String code;
  final String symbol;
  final String name;

  const CurrencyOption({
    required this.code,
    required this.symbol,
    required this.name,
  });
}

const List<CurrencyOption> CURRENCIES = [
  CurrencyOption(code: 'USD', symbol: '\$', name: 'USD - Dollar (\$)'),
  CurrencyOption(code: 'EGP', symbol: 'EGP ', name: 'EGP - Egyptian Pound (Ø¬.Ù…)'),
  CurrencyOption(code: 'EUR', symbol: 'â‚¬', name: 'EUR - Euro (â‚¬)'),
  CurrencyOption(code: 'SAR', symbol: 'SAR ', name: 'SAR - Saudi Riyal (Ø±.Ø³)'),
  CurrencyOption(code: 'AED', symbol: 'AED ', name: 'AED - UAE Dirham (Ø¯.Ø¥)'),
];

enum QuickSortOption {
  all('All Items', Icons.apps_rounded),
  lowStock('âš ï¸ Low Stock (<5)', Icons.warning_amber_rounded),
  highestValue('ðŸ’° Highest Value', Icons.trending_up_rounded),
  alphabetical('ðŸ”¤ A - Z', Icons.sort_by_alpha_rounded),
  lowestQuantity('ðŸ“‰ Lowest Qty', Icons.arrow_downward_rounded);

  final String label;
  final IconData icon;
  const QuickSortOption(this.label, this.icon);
}

class Product {
  final String id;
  String name;
  String barcode;
  String category;
  int quantity;
  double price;

  Product({
    required this.id,
    required this.name,
    required this.barcode,
    required this.category,
    required this.quantity,
    required this.price,
  });

  double get totalValue => quantity * price;
  bool get isLowStock => quantity < 5;
}

class AuraStockApp extends StatelessWidget {
  const AuraStockApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AuraStock Android',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF080D1A), // Midnight Navy
        primaryColor: const Color(0xFF2563EB), // Royal Sapphire Blue
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF2563EB), // Royal Blue
          secondary: Color(0xFF38BDF8), // Electric Cyan
          surface: Color(0xFF0F172A), // Slate 900
          surfaceContainer: Color(0xFF1E293B), // Slate 800
          error: Color(0xFFEF4444), // Low stock Red alert
        ),
        fontFamily: 'Roboto',
      ),
      home: const InventoryScreen(),
    );
  }
}

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  CurrencyOption _selectedCurrency = CURRENCIES[0]; // Default USD, switchable to EGP
  QuickSortOption _activeSort = QuickSortOption.all;
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Audio Gear',
    'Timepieces',
    'Peripherals',
    'Optics',
    'Power & Tech',
    'General',
  ];

  final List<Product> _products = [
    Product(
      id: '1',
      name: 'Aura Pro Studio Headphones',
      barcode: '890123456012',
      category: 'Audio Gear',
      quantity: 14,
      price: 349.99,
    ),
    Product(
      id: '2',
      name: 'Chronos Mechanical Chronograph',
      barcode: '890123456029',
      category: 'Timepieces',
      quantity: 3, // < 5 -> Triggers RED row styling!
      price: 1250.00,
    ),
    Product(
      id: '3',
      name: 'Titanium Ergonomic Keyboard',
      barcode: '890123456036',
      category: 'Peripherals',
      quantity: 2, // < 5 -> Triggers RED row styling!
      price: 289.50,
    ),
    Product(
      id: '4',
      name: 'Vanguard 4K Cinema Lens 50mm',
      barcode: '890123456043',
      category: 'Optics',
      quantity: 1, // < 5 -> Triggers RED row styling!
      price: 1890.00,
    ),
    Product(
      id: '5',
      name: 'Solarium Power Station 1200W',
      barcode: '890123456050',
      category: 'Power & Tech',
      quantity: 18,
      price: 799.00,
    ),
    Product(
      id: '6',
      name: 'Apex Precision Wireless Mouse',
      barcode: '890123456067',
      category: 'Peripherals',
      quantity: 42,
      price: 119.00,
    ),
  ];

  // 1. Total Financial Value Calculation
  double get totalFinancialValue {
    return _products.fold(0.0, (sum, item) => sum + item.totalValue);
  }

  int get lowStockCount {
    return _products.where((p) => p.isLowStock).length;
  }

  int get totalUnitsCount {
    return _products.fold(0, (sum, item) => sum + item.quantity);
  }

  List<Product> get filteredProducts {
    List<Product> list = _products;

    // Search Filter (Name or Barcode)
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.toLowerCase().trim();
      list = list.where((p) {
        return p.name.toLowerCase().contains(q) || p.barcode.contains(q);
      }).toList();
    }

    // Category Filter
    if (_selectedCategory != 'All') {
      list = list.where((p) => p.category == _selectedCategory).toList();
    }

    // Quick Sort Filter
    final sorted = List<Product>.from(list);
    switch (_activeSort) {
      case QuickSortOption.all:
        // Default alphabetical order
        sorted.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
        break;
      case QuickSortOption.lowStock:
        // Filter ONLY products with quantity < 5
        return sorted.where((p) => p.isLowStock).toList();
      case QuickSortOption.highestValue:
        sorted.sort((a, b) => b.totalValue.compareTo(a.totalValue));
        break;
      case QuickSortOption.alphabetical:
        sorted.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
        break;
      case QuickSortOption.lowestQuantity:
        sorted.sort((a, b) => a.quantity.compareTo(b.quantity));
        break;
    }

    return sorted;
  }

  String _formatPrice(double value) {
    final formatter = NumberFormat('#,##0.00');
    return '${_selectedCurrency.symbol}${formatter.format(value)}';
  }

  // 3. Increment & Decrement Stock
  void _incrementQuantity(Product product) {
    HapticFeedback.lightImpact();
    setState(() {
      product.quantity += 1;
    });
  }

  void _decrementQuantity(Product product) {
    if (product.quantity > 0) {
      HapticFeedback.mediumImpact();
      setState(() {
        product.quantity -= 1;
      });
      if (product.quantity < 5) {
        _triggerAndroidLowStockNotification(product);
      }
    }
  }

  // Barcode Copy to Clipboard with Haptic Feedback
  void _copyBarcode(String barcode, String productName) {
    Clipboard.setData(ClipboardData(text: barcode));
    HapticFeedback.selectionClick();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF0F172A),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFF38BDF8), width: 1),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        duration: const Duration(seconds: 2),
        content: Row(
          children: [
            const Icon(Icons.qr_code_2_rounded, color: Color(0xFF38BDF8), size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Barcode "$barcode" copied for $productName',
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Android Heads-Up Notification System for Low Stock (< 5)
  void _triggerAndroidLowStockNotification(Product product) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF2E0A10),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFEF4444), width: 1.5),
        ),
        margin: const EdgeInsets.all(16),
        content: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 28),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'LOW STOCK ALERT (< 5)',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                  ),
                  Text(
                    '${product.name} dropped to ${product.quantity} units!',
                    style: const TextStyle(color: Colors.white70, fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Add Product Dialog (Royal Blue Aesthetic)
  void _openAddProductDialog() {
    final nameController = TextEditingController();
    final barcodeController = TextEditingController();
    final priceController = TextEditingController();
    final qtyController = TextEditingController(text: '10');
    String selectedCat = _categories.firstWhere((c) => c != 'All', orElse: () => 'General');

    // Generate random 12-digit barcode default
    final rand = Random();
    barcodeController.text = '890${rand.nextInt(900000000) + 100000000}';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.white24,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2563EB).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFF2563EB).withOpacity(0.4)),
                          ),
                          child: const Icon(Icons.add_shopping_cart_rounded, color: Color(0xFF38BDF8), size: 22),
                        ),
                        const SizedBox(width: 12),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Add New Product',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'Stock updates in real-time',
                              style: TextStyle(color: Color(0xFF38BDF8), fontSize: 11),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Product Name
                    TextField(
                      controller: nameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'Product Name',
                        labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        prefixIcon: const Icon(Icons.shopping_bag_outlined, color: Color(0xFF38BDF8)),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Barcode Field with Auto-Generate Action
                    TextField(
                      controller: barcodeController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'Barcode (12-digit)',
                        labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        prefixIcon: const Icon(Icons.qr_code_rounded, color: Color(0xFF38BDF8)),
                        suffixIcon: IconButton(
                          tooltip: 'Regenerate Barcode',
                          icon: const Icon(Icons.refresh_rounded, color: Color(0xFF38BDF8)),
                          onPressed: () {
                            setModalState(() {
                              barcodeController.text = '890${rand.nextInt(900000000) + 100000000}';
                            });
                          },
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Category Dropdown
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: selectedCat,
                          isExpanded: true,
                          dropdownColor: const Color(0xFF1E293B),
                          style: const TextStyle(color: Colors.white),
                          items: _categories.where((c) => c != 'All').map((cat) {
                            return DropdownMenuItem<String>(
                              value: cat,
                              child: Text(cat),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setModalState(() => selectedCat = val);
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Price & Initial Stock Row
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: priceController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              labelText: 'Price (${_selectedCurrency.symbol.trim()})',
                              labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                              filled: true,
                              fillColor: const Color(0xFF1E293B),
                              prefixIcon: const Icon(Icons.attach_money_rounded, color: Color(0xFF38BDF8)),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: qtyController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              labelText: 'Initial Qty',
                              labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                              filled: true,
                              fillColor: const Color(0xFF1E293B),
                              prefixIcon: const Icon(Icons.inventory_2_outlined, color: Color(0xFF38BDF8)),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Actions (Cancel / Save)
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white70,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              side: const BorderSide(color: Colors.white24),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Cancel'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF2563EB),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              elevation: 4,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: () {
                              final name = nameController.text.trim();
                              final barcode = barcodeController.text.trim();
                              final price = double.tryParse(priceController.text) ?? 0.0;
                              final qty = int.tryParse(qtyController.text) ?? 1;

                              if (name.isEmpty || barcode.isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Please enter name and barcode')),
                                );
                                return;
                              }

                              setState(() {
                                _products.insert(
                                  0,
                                  Product(
                                    id: DateTime.now().millisecondsSinceEpoch.toString(),
                                    name: name,
                                    barcode: barcode,
                                    category: selectedCat,
                                    quantity: qty,
                                    price: price,
                                  ),
                                );
                              });

                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  backgroundColor: const Color(0xFF0F172A),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    side: const BorderSide(color: Color(0xFF2563EB)),
                                  ),
                                  behavior: SnackBarBehavior.floating,
                                  content: Text('Product "$name" added successfully! ðŸš€'),
                                ),
                              );
                            },
                            child: const Text('Save Product', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // Add Category Dialog
  void _openAddCategoryDialog() {
    final catController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF0F172A),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: Color(0xFF2563EB), width: 1),
          ),
          title: const Row(
            children: [
              Icon(Icons.create_new_folder_rounded, color: Color(0xFF38BDF8), size: 24),
              SizedBox(width: 8),
              Text('Add New Category', style: TextStyle(color: Colors.white, fontSize: 17)),
            ],
          ),
          content: TextField(
            controller: catController,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Category Title',
              labelStyle: TextStyle(color: Color(0xFF94A3B8)),
              enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF38BDF8))),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                final cat = catController.text.trim();
                if (cat.isNotEmpty && !_categories.contains(cat)) {
                  setState(() {
                    _categories.add(cat);
                  });
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Category "$cat" added!')),
                  );
                } else {
                  Navigator.pop(context);
                }
              },
              child: const Text('Add'),
            ),
          ],
        );
      },
    );
  }

  // 3. Bulk Adjustment Bottom Sheet
  void _openBulkAdjustSheet(Product product) {
    final qtyController = TextEditingController(text: product.quantity.toString());
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Bulk Stock Adjustment',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF38BDF8),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                product.name,
                style: const TextStyle(color: Colors.white70, fontSize: 13),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: qtyController,
                keyboardType: TextInputType.number,
                autofocus: true,
                style: const TextStyle(color: Colors.white, fontSize: 18),
                decoration: InputDecoration(
                  labelText: 'Set Exact Quantity',
                  labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  prefixIcon: const Icon(Icons.inventory_2, color: Color(0xFF38BDF8)),
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF2563EB)),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white70,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        final val = int.tryParse(qtyController.text);
                        if (val != null && val >= 0) {
                          setState(() {
                            product.quantity = val;
                          });
                          Navigator.pop(context);
                        }
                      },
                      child: const Text('Save Quantity'),
                    ),
                  ),
                ],
              )
            ],
          ),
        );
      },
    );
  }

  // 6. CSV & PDF Export
  Future<void> _exportCSV() async {
    final buffer = StringBuffer();
    buffer.writeln('Barcode,Name,Category,Quantity,Price(${_selectedCurrency.code}),TotalValue(${_selectedCurrency.code})');
    for (var p in _products) {
      buffer.writeln('${p.barcode},"${p.name}",${p.category},${p.quantity},${p.price},${p.totalValue}');
    }
    final tempDir = await getTemporaryDirectory();
    final file = File('${tempDir.path}/inventory_report.csv');
    await file.writeAsString(buffer.toString());
    await Share.shareXFiles([XFile(file.path)], text: 'AuraStock CSV Report');
  }

  Future<void> _exportPDF() async {
    final pdf = pw.Document();
    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Header(
                level: 0,
                child: pw.Text('AuraStock Inventory Valuation Report',
                  style: pw.TextStyle(fontSize: 22, fontWeight: pw.FontWeight.bold)),
              ),
              pw.Text('Total Valuation: ${_formatPrice(totalFinancialValue)}'),
              pw.SizedBox(height: 20),
              pw.Table.fromTextArray(
                headers: ['Barcode', 'Product', 'Qty', 'Price', 'Value'],
                data: _products.map((p) => [
                  p.barcode,
                  p.name,
                  p.quantity.toString(),
                  _formatPrice(p.price),
                  _formatPrice(p.totalValue),
                ]).toList(),
              ),
            ],
          );
        },
      ),
    );
    final tempDir = await getTemporaryDirectory();
    final file = File('${tempDir.path}/inventory_report.pdf');
    await file.writeAsBytes(await pdf.save());
    await Share.shareXFiles([XFile(file.path)], text: 'AuraStock PDF Report');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF080D1A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF38BDF8)],
                ),
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2563EB).withOpacity(0.4),
                    blurRadius: 10,
                  )
                ],
              ),
              child: const Icon(Icons.inventory_2_rounded, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'AuraStock',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17, letterSpacing: -0.3),
                ),
                Text(
                  'ROYAL BLUE PRO',
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF38BDF8), letterSpacing: 0.8),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Currency Selector Button (USD / EGP / EUR / SAR / AED)
          PopupMenuButton<CurrencyOption>(
            tooltip: 'Change Currency',
            initialValue: _selectedCurrency,
            onSelected: (CurrencyOption curr) {
              setState(() {
                _selectedCurrency = curr;
              });
              HapticFeedback.selectionClick();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  duration: const Duration(seconds: 1),
                  backgroundColor: const Color(0xFF0F172A),
                  content: Text('Currency changed to ${curr.name}'),
                ),
              );
            },
            color: const Color(0xFF0F172A),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFF2563EB), width: 1),
            ),
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                ),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF2563EB).withOpacity(0.6)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _selectedCurrency.code,
                    style: const TextStyle(
                      color: Color(0xFF38BDF8),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(width: 2),
                  const Icon(Icons.arrow_drop_down, color: Color(0xFF38BDF8), size: 16),
                ],
              ),
            ),
            itemBuilder: (context) => CURRENCIES.map((c) => PopupMenuItem<CurrencyOption>(
              value: c,
              child: Row(
                children: [
                  Container(
                    width: 32,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      c.symbol.trim(),
                      style: const TextStyle(
                        color: Color(0xFF38BDF8),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    c.name,
                    style: TextStyle(
                      color: _selectedCurrency.code == c.code ? const Color(0xFF38BDF8) : Colors.white,
                      fontWeight: _selectedCurrency.code == c.code ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ],
              ),
            )).toList(),
          ),

          // Add Product icon in AppBar
          IconButton(
            tooltip: 'Add Product',
            icon: const Icon(Icons.add_circle, color: Color(0xFF38BDF8), size: 22),
            onPressed: _openAddProductDialog,
          ),

          // Add Category
          IconButton(
            tooltip: 'Add Category',
            icon: const Icon(Icons.create_new_folder_outlined, color: Colors.white70, size: 20),
            onPressed: _openAddCategoryDialog,
          ),

          // Export Reports Menu (CSV & PDF)
          PopupMenuButton<String>(
            tooltip: 'Export Reports',
            icon: const Icon(Icons.download_rounded, color: Colors.white70, size: 20),
            color: const Color(0xFF0F172A),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFF2563EB), width: 0.8),
            ),
            onSelected: (val) {
              if (val == 'csv') _exportCSV();
              if (val == 'pdf') _exportPDF();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'csv',
                child: Row(
                  children: [
                    Icon(Icons.table_view_outlined, color: Color(0xFF38BDF8), size: 18),
                    SizedBox(width: 10),
                    Text('Export as CSV', style: TextStyle(color: Colors.white)),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'pdf',
                child: Row(
                  children: [
                    Icon(Icons.picture_as_pdf_outlined, color: Color(0xFF60A5FA), size: 18),
                    SizedBox(width: 10),
                    Text('Export as PDF', style: TextStyle(color: Colors.white)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),

      // Prominent Floating Action Button for Add Product
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddProductDialog,
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        elevation: 8,
        icon: const Icon(Icons.add_shopping_cart_rounded, size: 20),
        label: const Text(
          'Add Product',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
      ),

      body: Column(
        children: [
          // 1. Dashboard: Total Financial Valuation (Royal Blue Executive Glass)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: const Color(0xFF2563EB).withOpacity(0.4),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2563EB).withOpacity(0.12),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                )
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Text(
                          'TOTAL INVENTORY VALUATION',
                          style: TextStyle(
                            fontSize: 11,
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF38BDF8),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2563EB).withOpacity(0.25),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.4)),
                          ),
                          child: Text(
                            _selectedCurrency.code,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF38BDF8),
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (lowStockCount > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFEF4444), width: 1),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 14),
                            const SizedBox(width: 4),
                            Text(
                              '$lowStockCount Low Stock',
                              style: const TextStyle(
                                color: Color(0xFFEF4444),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      )
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  _formatPrice(totalFinancialValue),
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    fontFeatures: [FontFeature.tabularFigures()],
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${_products.length} Products registered',
                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '$totalUnitsCount Total Units in stock',
                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 5. Search Bar (Name or Barcode)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search by product name or barcode...',
                hintStyle: const TextStyle(color: Colors.white38),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF38BDF8)),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.white54),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: const Color(0xFF0F172A),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFF1E293B)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFF1E293B)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFF2563EB)),
                ),
              ),
            ),
          ),

          // Feature: Horizontal Quick Sort & Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              children: QuickSortOption.values.map((sort) {
                final isSelected = _activeSort == sort;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    selected: isSelected,
                    showCheckmark: false,
                    avatar: Icon(
                      sort.icon,
                      size: 14,
                      color: isSelected ? Colors.white : (sort == QuickSortOption.lowStock ? const Color(0xFFEF4444) : const Color(0xFF94A3B8)),
                    ),
                    label: Text(
                      sort.label,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        color: isSelected ? Colors.white : (sort == QuickSortOption.lowStock ? const Color(0xFFEF4444) : const Color(0xFF94A3B8)),
                      ),
                    ),
                    backgroundColor: const Color(0xFF0F172A),
                    selectedColor: const Color(0xFF2563EB),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color: isSelected
                            ? const Color(0xFF38BDF8)
                            : (sort == QuickSortOption.lowStock ? const Color(0xFFEF4444).withOpacity(0.5) : const Color(0xFF1E293B)),
                        width: 1,
                      ),
                    ),
                    onSelected: (val) {
                      setState(() {
                        _activeSort = sort;
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Feature: Category Quick Filter Badges
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
            child: Row(
              children: _categories.map((cat) {
                final isCatSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ChoiceChip(
                    selected: isCatSelected,
                    label: Text(
                      cat,
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: isCatSelected ? FontWeight.bold : FontWeight.normal,
                        color: isCatSelected ? Colors.white : Colors.white60,
                      ),
                    ),
                    backgroundColor: Colors.transparent,
                    selectedColor: const Color(0xFF1E3A8A),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: BorderSide(
                        color: isCatSelected ? const Color(0xFF38BDF8) : Colors.white12,
                        width: 0.8,
                      ),
                    ),
                    onSelected: (val) {
                      setState(() {
                        _selectedCategory = cat;
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 4),

          // 2 & 4. Product List with Red Color for Qty < 5 and Royal Blue Palette
          Expanded(
            child: filteredProducts.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.inventory_2_outlined, size: 48, color: Colors.white24),
                        const SizedBox(height: 12),
                        const Text('No products found', style: TextStyle(color: Colors.white54, fontSize: 15)),
                        if (_activeSort == QuickSortOption.lowStock)
                          const Padding(
                            padding: EdgeInsets.only(top: 6),
                            child: Text('All products are healthy (â‰¥ 5 units) ðŸŽ‰', style: TextStyle(color: Color(0xFF10B981), fontSize: 13)),
                          ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(left: 16, right: 16, top: 4, bottom: 85),
                    itemCount: filteredProducts.length,
                    itemBuilder: (context, index) {
                      final product = filteredProducts[index];
                      final isLow = product.quantity < 5; // Automatic RED styling when < 5

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          // Requirement 4: Automatic RED color for quantity drops below 5
                          color: isLow
                              ? const Color(0xFF280E14) // Deep Ruby Red Tint
                              : const Color(0xFF0F172A), // Luxury Dark Slate
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isLow
                                ? const Color(0xFFEF4444) // Bright Red Border
                                : const Color(0xFF1E293B), // Subtle Navy Border
                            width: isLow ? 1.5 : 1.0,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: isLow ? const Color(0xFFEF4444).withOpacity(0.12) : Colors.black.withOpacity(0.2),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              product.name,
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 15,
                                                color: isLow ? const Color(0xFFFCA5A5) : Colors.white,
                                              ),
                                            ),
                                          ),
                                          if (isLow)
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFEF4444),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: const Text(
                                                'LOW STOCK',
                                                style: TextStyle(
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.w900,
                                                  color: Colors.white,
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 5),

                                      // Barcode row with Tap-to-Copy Feature
                                      GestureDetector(
                                        onTap: () => _copyBarcode(product.barcode, product.name),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF1E293B),
                                                borderRadius: BorderRadius.circular(6),
                                                border: Border.all(color: Colors.white12),
                                              ),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  const Icon(Icons.qr_code_rounded, size: 12, color: Color(0xFF38BDF8)),
                                                  const SizedBox(width: 4),
                                                  Text(
                                                    product.barcode,
                                                    style: const TextStyle(
                                                      fontSize: 11,
                                                      fontFamily: 'monospace',
                                                      color: Colors.white70,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 4),
                                                  const Icon(Icons.copy_rounded, size: 11, color: Colors.white38),
                                                ],
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Text(
                                              'â€¢ ${product.category}',
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: isLow ? const Color(0xFFF87171) : Colors.white54,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        'Price: ${_formatPrice(product.price)} â€¢ Valuation: ${_formatPrice(product.totalValue)}',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: isLow ? const Color(0xFFFCA5A5) : const Color(0xFF38BDF8),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                // Delete action button
                                IconButton(
                                  tooltip: 'Delete Product',
                                  icon: const Icon(Icons.delete_outline, size: 18, color: Colors.white30),
                                  onPressed: () {
                                    setState(() {
                                      _products.removeWhere((p) => p.id == product.id);
                                    });
                                  },
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // 3. Quick Stepper (+1 / -1) and Bulk Adjustment Row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1E293B),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.white10),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                  child: Row(
                                    children: [
                                      IconButton(
                                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                        padding: EdgeInsets.zero,
                                        icon: const Icon(Icons.remove_rounded, size: 18, color: Colors.white70),
                                        onPressed: () => _decrementQuantity(product),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 10),
                                        child: Text(
                                          '${product.quantity}',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w800,
                                            color: isLow ? const Color(0xFFEF4444) : Colors.white,
                                          ),
                                        ),
                                      ),
                                      IconButton(
                                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                        padding: EdgeInsets.zero,
                                        icon: const Icon(Icons.add_rounded, size: 18, color: Color(0xFF38BDF8)),
                                        onPressed: () => _incrementQuantity(product),
                                      ),
                                    ],
                                  ),
                                ),
                                TextButton.icon(
                                  style: TextButton.styleFrom(
                                    foregroundColor: const Color(0xFF38BDF8),
                                    backgroundColor: const Color(0xFF2563EB).withOpacity(0.12),
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                      side: BorderSide(color: const Color(0xFF2563EB).withOpacity(0.3)),
                                    ),
                                  ),
                                  icon: const Icon(Icons.edit_note_rounded, size: 18),
                                  label: const Text('Bulk Adjust', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  onPressed: () => _openBulkAdjustSheet(product),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
