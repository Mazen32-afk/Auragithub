// ====================================================================
// AuraStock Inventory Management - Flutter & Dart (Android)
// Dark Mode Theme with Gold (#F59E0B) and Orange (#EA580C) Accents
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
    systemNavigationBarColor: Color(0xFF0B0E14),
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
  CurrencyOption(code: 'EGP', symbol: 'EGP ', name: 'EGP - Egyptian Pound (ج.م)'),
  CurrencyOption(code: 'EUR', symbol: '€', name: 'EUR - Euro (€)'),
  CurrencyOption(code: 'SAR', symbol: 'SAR ', name: 'SAR - Saudi Riyal (ر.س)'),
  CurrencyOption(code: 'AED', symbol: 'AED ', name: 'AED - UAE Dirham (د.إ)'),
];

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
        scaffoldBackgroundColor: const Color(0xFF0B0E14),
        primaryColor: const Color(0xFFF59E0B),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFF59E0B),
          secondary: Color(0xFFEA580C),
          surface: Color(0xFF141923),
          surfaceContainer: Color(0xFF1B2230),
          error: Color(0xFFEF4444),
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

  final List<String> _categories = [
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
      quantity: 3,
      price: 1250.00,
    ),
    Product(
      id: '3',
      name: 'Titanium Ergonomic Keyboard',
      barcode: '890123456036',
      category: 'Peripherals',
      quantity: 2,
      price: 289.50,
    ),
    Product(
      id: '4',
      name: 'Vanguard 4K Cinema Lens 50mm',
      barcode: '890123456043',
      category: 'Optics',
      quantity: 1,
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

  double get totalFinancialValue {
    return _products.fold(0.0, (sum, item) => sum + item.totalValue);
  }

  int get lowStockCount {
    return _products.where((p) => p.isLowStock).length;
  }

  List<Product> get filteredProducts {
    List<Product> list = _products;
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.toLowerCase().trim();
      list = list.where((p) {
        return p.name.toLowerCase().contains(q) || p.barcode.contains(q);
      }).toList();
    }
    final sorted = List<Product>.from(list);
    sorted.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
    return sorted;
  }

  String _formatPrice(double value) {
    final formatter = NumberFormat('#,##0.00');
    return '${_selectedCurrency.symbol}${formatter.format(value)}';
  }

  void _incrementQuantity(Product product) {
    setState(() {
      product.quantity += 1;
    });
  }

  void _decrementQuantity(Product product) {
    if (product.quantity > 0) {
      setState(() {
        product.quantity -= 1;
      });
      if (product.quantity < 5) {
        _triggerAndroidLowStockNotification(product);
      }
    }
  }

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
            const Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444)),
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
                    '${product.name} is down to ${product.quantity} units!',
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

  void _openAddProductDialog() {
    final nameController = TextEditingController();
    final barcodeController = TextEditingController();
    final priceController = TextEditingController();
    final qtyController = TextEditingController(text: '10');
    String selectedCat = _categories.first;
    final rand = Random();
    barcodeController.text = '890${rand.nextInt(900000000) + 100000000}';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF141923),
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
                            color: const Color(0xFFEA580C).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.add_box_rounded, color: Color(0xFFF59E0B)),
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
                                color: Color(0xFFF59E0B),
                              ),
                            ),
                            Text(
                              'Fill details to register into inventory',
                              style: TextStyle(color: Colors.white54, fontSize: 12),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    TextField(
                      controller: nameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'Product Name *',
                        labelStyle: const TextStyle(color: Colors.white70),
                        prefixIcon: const Icon(Icons.shopping_bag_outlined, color: Color(0xFFF59E0B)),
                        filled: true,
                        fillColor: const Color(0xFF1B2230),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: barcodeController,
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              labelText: 'Barcode / SKU *',
                              labelStyle: const TextStyle(color: Colors.white70),
                              prefixIcon: const Icon(Icons.qr_code_scanner, color: Color(0xFFF59E0B)),
                              filled: true,
                              fillColor: const Color(0xFF1B2230),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton.filledTonal(
                          tooltip: 'Generate Barcode',
                          style: IconButton.styleFrom(
                            backgroundColor: const Color(0xFF1B2230),
                            foregroundColor: const Color(0xFFF59E0B),
                          ),
                          icon: const Icon(Icons.autorenew),
                          onPressed: () {
                            setModalState(() {
                              barcodeController.text = '890${rand.nextInt(900000000) + 100000000}';
                            });
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1B2230),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: selectedCat,
                          isExpanded: true,
                          dropdownColor: const Color(0xFF1B2230),
                          icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFF59E0B)),
                          style: const TextStyle(color: Colors.white, fontSize: 14),
                          items: _categories.map((cat) {
                            return DropdownMenuItem<String>(
                              value: cat,
                              child: Text(cat),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setModalState(() {
                                selectedCat = val;
                              });
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: priceController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              labelText: 'Price (${_selectedCurrency.symbol}) *',
                              labelStyle: const TextStyle(color: Colors.white70),
                              prefixIcon: const Icon(Icons.attach_money, color: Color(0xFFF59E0B)),
                              filled: true,
                              fillColor: const Color(0xFF1B2230),
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
                              labelText: 'Initial Qty *',
                              labelStyle: const TextStyle(color: Colors.white70),
                              prefixIcon: const Icon(Icons.numbers, color: Color(0xFFEA580C)),
                              filled: true,
                              fillColor: const Color(0xFF1B2230),
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
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white70,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              side: const BorderSide(color: Colors.white24),
                            ),
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Cancel'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFEA580C),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                            ),
                            onPressed: () {
                              final name = nameController.text.trim();
                              final barcode = barcodeController.text.trim();
                              final price = double.tryParse(priceController.text) ?? 0.0;
                              final qty = int.tryParse(qtyController.text) ?? 0;

                              if (name.isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Please enter a product name')),
                                );
                                return;
                              }

                              setState(() {
                                _products.insert(
                                  0,
                                  Product(
                                    id: DateTime.now().millisecondsSinceEpoch.toString(),
                                    name: name,
                                    barcode: barcode.isNotEmpty ? barcode : '890000000000',
                                    category: selectedCat,
                                    quantity: qty,
                                    price: price,
                                  ),
                                );
                              });

                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  backgroundColor: const Color(0xFF141923),
                                  content: Text('Product "$name" added successfully! 🎉'),
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

  void _openAddCategoryDialog() {
    final catController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF141923),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Add New Category', style: TextStyle(color: Color(0xFFF59E0B))),
          content: TextField(
            controller: catController,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Category Title',
              labelStyle: TextStyle(color: Colors.white54),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEA580C)),
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

  void _openBulkAdjustSheet(Product product) {
    final qtyController = TextEditingController(text: product.quantity.toString());
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF141923),
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
                  color: Color(0xFFF59E0B),
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
                  labelStyle: const TextStyle(color: Color(0xFFEA580C)),
                  prefixIcon: const Icon(Icons.inventory_2, color: Color(0xFFF59E0B)),
                  filled: true,
                  fillColor: const Color(0xFF1B2230),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFF59E0B)),
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
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEA580C),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
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
        backgroundColor: const Color(0xFF0B0E14),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFEA580C).withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.inventory_2, color: Color(0xFFF59E0B), size: 20),
            ),
            const SizedBox(width: 8),
            const Text(
              'AuraStock',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
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
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  duration: const Duration(seconds: 1),
                  content: Text('Currency changed to ${curr.name}'),
                ),
              );
            },
            color: const Color(0xFF141923),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFFF59E0B), width: 0.8),
            ),
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1B2230), Color(0xFF141923)],
                ),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.5)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _selectedCurrency.code,
                    style: const TextStyle(
                      color: Color(0xFFF59E0B),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(width: 2),
                  const Icon(Icons.arrow_drop_down, color: Color(0xFFF59E0B), size: 16),
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
                        color: Color(0xFFF59E0B),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    c.name,
                    style: TextStyle(
                      color: _selectedCurrency.code == c.code ? const Color(0xFFEA580C) : Colors.white,
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
            icon: const Icon(Icons.add_circle, color: Color(0xFFEA580C), size: 22),
            onPressed: _openAddProductDialog,
          ),

          // Add Category
          IconButton(
            tooltip: 'Add Category',
            icon: const Icon(Icons.create_new_folder_outlined, color: Color(0xFFF59E0B), size: 20),
            onPressed: _openAddCategoryDialog,
          ),

          // Export Reports Menu (CSV & PDF)
          PopupMenuButton<String>(
            tooltip: 'Export Reports',
            icon: const Icon(Icons.download_rounded, color: Colors.white70, size: 20),
            color: const Color(0xFF141923),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFFF59E0B), width: 0.5),
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
                    Icon(Icons.table_view_outlined, color: Color(0xFFF59E0B), size: 18),
                    SizedBox(width: 10),
                    Text('Export as CSV', style: TextStyle(color: Colors.white)),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'pdf',
                child: Row(
                  children: [
                    Icon(Icons.picture_as_pdf_outlined, color: Color(0xFFEA580C), size: 18),
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
        backgroundColor: const Color(0xFFEA580C),
        foregroundColor: Colors.white,
        elevation: 6,
        icon: const Icon(Icons.add_shopping_cart_rounded, size: 20),
        label: const Text(
          'Add Product',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
      ),

      body: Column(
        children: [
          // 1. Dashboard: Total Financial Valuation
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1B2230), Color(0xFF141923)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: const Color(0xFFF59E0B).withOpacity(0.3),
                width: 1,
              ),
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
                            fontWeight: FontWeight.w600,
                            color: Color(0xFFF59E0B),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            _selectedCurrency.code,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFF59E0B),
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
                          border: Border.all(color: const Color(0xFFEF4444), width: 0.8),
                        ),
                        child: Text(
                          '$lowStockCount Low Stock',
                          style: const TextStyle(
                            color: Color(0xFFEF4444),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
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
                    Text(
                      '${_products.length} Products registered',
                      style: const TextStyle(color: Colors.white60, fontSize: 13),
                    ),
                    const SizedBox(width: 8),
                    const Text('•', style: TextStyle(color: Colors.white30)),
                    const SizedBox(width: 8),
                    Text(
                      '${_products.fold(0, (sum, p) => sum + p.quantity)} Units in stock',
                      style: const TextStyle(color: Colors.white60, fontSize: 13),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 5. Search Bar (Name or Barcode)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search by product name or barcode...',
                hintStyle: const TextStyle(color: Colors.white38),
                prefixIcon: const Icon(Icons.search, color: Color(0xFFF59E0B)),
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
                fillColor: const Color(0xFF141923),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // 2 & 4. Product List with Red Color for Qty < 5
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.only(left: 16, right: 16, top: 6, bottom: 80),
              itemCount: filteredProducts.length,
              itemBuilder: (context, index) {
                final product = filteredProducts[index];
                final isLow = product.quantity < 5;

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isLow
                        ? const Color(0xFF381014) // Deep Red Tint
                        : const Color(0xFF141923), // Dark Slate
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isLow
                          ? const Color(0xFFEF4444) // Bright Red Border
                          : const Color(0xFF263042),
                      width: isLow ? 1.5 : 1.0,
                    ),
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
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
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
                                const SizedBox(height: 4),
                                Text(
                                  'Barcode: ${product.barcode} • ${product.category}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isLow ? const Color(0xFFF87171) : Colors.white54,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Price: ${_formatPrice(product.price)} • Line: ${_formatPrice(product.totalValue)}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFFF59E0B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Delete action button
                          IconButton(
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
                      // Stepper and Bulk Adjustment field
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              IconButton.filled(
                                style: IconButton.styleFrom(
                                  backgroundColor: const Color(0xFF1B2230),
                                  foregroundColor: Colors.white,
                                ),
                                icon: const Icon(Icons.remove, size: 18),
                                onPressed: () => _decrementQuantity(product),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                child: Text(
                                  '${product.quantity}',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: isLow ? const Color(0xFFEF4444) : Colors.white,
                                  ),
                                ),
                              ),
                              IconButton.filled(
                                style: IconButton.styleFrom(
                                  backgroundColor: const Color(0xFF1B2230),
                                  foregroundColor: const Color(0xFFF59E0B),
                                ),
                                icon: const Icon(Icons.add, size: 18),
                                onPressed: () => _incrementQuantity(product),
                              ),
                            ],
                          ),
                          TextButton.icon(
                            style: TextButton.styleFrom(
                              foregroundColor: const Color(0xFFEA580C),
                            ),
                            icon: const Icon(Icons.edit_note, size: 18),
                            label: const Text('Bulk Adjust'),
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
