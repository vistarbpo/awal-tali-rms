export type LangKey = 'en' | 'ar';

export const translations = {
  // ── Auth ──
  welcomeBack:        { en: 'Welcome back!',                                           ar: 'مرحباً بعودتك!' },
  enterPin:           { en: 'Enter your 5-digit PIN to continue',                      ar: 'أدخل رمز PIN المكوّن من 5 أرقام للمتابعة' },
  syncUsers:          { en: 'Sync Users',                                              ar: 'مزامنة المستخدمين' },
  welcomeBackComma:   { en: 'Welcome back,',                                           ar: 'مرحباً بعودتك،' },
  clockedIn:          { en: 'Clocked In',                                              ar: 'تم تسجيل الحضور' },
  notClockedIn:       { en: 'Not Clocked In',                                          ar: 'لم يتم تسجيل الحضور' },
  clockOut:           { en: 'Clock Out',                                               ar: 'تسجيل الانصراف' },
  clockIn:            { en: 'Clock In',                                                ar: 'تسجيل الحضور' },
  accessRegister:     { en: 'Access Register',                                         ar: 'الوصول إلى الصندوق' },
  exit:               { en: 'Exit',                                                    ar: 'خروج' },

  // ── Tab bar ──
  tabHome:            { en: 'HOME',                                                    ar: 'الرئيسية' },
  tabOrders:          { en: 'ORDERS',                                                  ar: 'الطلبات' },
  tabTables:          { en: 'TABLES',                                                  ar: 'الطاولات' },
  tabNew:             { en: 'NEW',                                                     ar: 'جديد' },

  // ── Action bar ──
  print:              { en: 'Print',                                                   ar: 'طباعة' },
  kitchen:            { en: 'Kitchen',                                                 ar: 'المطبخ' },
  void:               { en: 'Void',                                                    ar: 'إلغاء' },
  discount:           { en: 'Discount',                                                ar: 'خصم' },
  notes:              { en: 'Notes',                                                   ar: 'ملاحظات' },
  tags:               { en: 'Tags',                                                    ar: 'وسوم' },
  more:               { en: 'More',                                                    ar: 'المزيد' },

  // ── Order types ──
  orderType:          { en: 'Order Type',                                              ar: 'نوع الطلب' },
  dineIn:             { en: 'Dine in',                                                 ar: 'تناول في المكان' },
  pickUp:             { en: 'Pick up',                                                 ar: 'استلام' },
  delivery:           { en: 'Delivery',                                                ar: 'توصيل' },
  driveThru:          { en: 'Drive thru',                                              ar: 'خدمة السيارة' },

  // ── Void / cancel ──
  cancelOrder:        { en: 'Cancel Order',                                            ar: 'إلغاء الطلب' },
  selectVoidReason:   { en: 'Select a reason to void this order',                      ar: 'اختر سبباً لإلغاء هذا الطلب' },
  reasonNotAvail:     { en: 'Product not available',                                   ar: 'المنتج غير متوفر' },
  reasonNoShow:       { en: 'Delivery order — Customer did not show',                  ar: 'طلب توصيل — العميل لم يحضر' },
  reasonCancelled:    { en: 'Customer cancelled',                                      ar: 'إلغاء من العميل' },

  // ── More menu ──
  openTill:           { en: 'Open Till',                                               ar: 'فتح الخزينة' },
  closeTill:          { en: 'Close Till',                                              ar: 'إغلاق الخزينة' },
  endOfDay:           { en: 'End of Day',                                              ar: 'نهاية اليوم' },
  drawerOps:          { en: 'Drawer Operations',                                       ar: 'عمليات الدرج' },
  houseAccountPay:    { en: 'House Account Payment',                                   ar: 'دفع الحساب المنزلي' },
  productAvail:       { en: 'Product Availability',                                    ar: 'توفر المنتجات' },
  reports:            { en: 'Reports',                                                 ar: 'التقارير' },
  syncData:           { en: 'Sync Data',                                               ar: 'مزامنة البيانات' },
  diagnostics:        { en: 'Diagnostics',                                             ar: 'التشخيصات' },
  devices:            { en: 'Devices',                                                 ar: 'الأجهزة' },
  support:            { en: 'Support',                                                 ar: 'الدعم' },

  // ── Common actions ──
  cancel:             { en: 'Cancel',                                                  ar: 'إلغاء' },
  confirm:            { en: 'Confirm',                                                 ar: 'تأكيد' },
  done:               { en: 'Done',                                                    ar: 'تم' },
  save:               { en: 'Save',                                                    ar: 'حفظ' },
  back:               { en: 'Back',                                                    ar: 'رجوع' },
  add:                { en: 'Add',                                                     ar: 'إضافة' },
  remove:             { en: 'Remove',                                                  ar: 'حذف' },
  close:              { en: 'Close',                                                   ar: 'إغلاق' },
  search:             { en: 'Search',                                                  ar: 'بحث' },
  edit:               { en: 'Edit',                                                    ar: 'تعديل' },
  apply:              { en: 'Apply',                                                   ar: 'تطبيق' },
  no:                 { en: 'No',                                                      ar: 'لا' },
  yes:                { en: 'Yes',                                                     ar: 'نعم' },
  next:               { en: 'NEXT',                                                    ar: 'التالي' },

  // ── Till ──
  enterTillAmount:    { en: 'Enter Till Amount',                                       ar: 'أدخل مبلغ الخزينة' },
  tillNotOpen:        { en: 'Till Not Open',                                           ar: 'الخزينة مغلقة' },
  tillOpenPrompt:     { en: 'Would you like to open the till to start taking orders?', ar: 'هل تريد فتح الخزينة لبدء استقبال الطلبات؟' },
  closeTillConfirm:   { en: 'Are you sure you want to close Till?',                   ar: 'هل أنت متأكد من إغلاق الخزينة؟' },
  openTillConfirm:    { en: 'Are you sure you want to open Till?',                    ar: 'هل أنت متأكد من فتح الخزينة؟' },

  // ── Order panel ──
  addCourse:          { en: 'Add Course',                                              ar: 'إضافة طبق' },
  taxIncl:            { en: 'Tax (incl.)',                                             ar: 'الضريبة (شاملة)' },
  total:              { en: 'TOTAL',                                                   ar: 'الإجمالي' },
  items:              { en: 'Items',                                                   ar: 'العناصر' },
  addCustomer:        { en: 'Add Customer',                                            ar: 'إضافة عميل' },
  newOrder:           { en: 'NEW',                                                     ar: 'جديد' },
  subtotal:           { en: 'Subtotal',                                                ar: 'المجموع الفرعي' },
  chargesLabel:       { en: 'Charges',                                                 ar: 'الرسوم' },
  courseN:            { en: 'Course',                                                  ar: 'طبق' },

  // ── Status badges ──
  statusActive:       { en: 'ACTIVE',                                                  ar: 'نشط' },
  statusDone:         { en: 'DONE',                                                    ar: 'مكتمل' },
  statusVoid:         { en: 'VOID',                                                    ar: 'ملغي' },
  statusPending:      { en: 'PENDING',                                                 ar: 'قيد الانتظار' },
  statusReturned:     { en: 'RETURNED',                                                ar: 'مُرجَع' },

  // ── Search ──
  searchProducts:     { en: 'Search Products',                                         ar: 'البحث في المنتجات' },
  searchOrders:       { en: 'Search orders',                                           ar: 'البحث في الطلبات' },

  // ── Payment ──
  paymentTitle:       { en: 'Payment',                                                 ar: 'الدفع' },
  cash:               { en: 'Cash',                                                    ar: 'نقداً' },
  cashDesc:           { en: 'Accept banknotes & coins',                                ar: 'قبول الأوراق النقدية والعملات' },
  giftCard:           { en: 'Gift Card',                                               ar: 'بطاقة هدية' },
  giftCardDesc:       { en: 'Redeem a gift card',                                      ar: 'استرداد بطاقة هدية' },
  mada:               { en: 'Mada',                                                    ar: 'مدى' },
  madaDesc:           { en: 'Saudi debit / credit card',                               ar: 'بطاقة مدى / ائتمان' },
  houseAccount:       { en: 'House Account',                                           ar: 'حساب منزلي' },
  houseAccountDesc:   { en: 'Bill to customer account',                                ar: 'فاتورة على حساب العميل' },

  // ── Tables ──
  vip:                { en: 'VIP',                                                     ar: 'VIP' },
  family:             { en: 'Family',                                                  ar: 'عائلة' },
  single:             { en: 'Single',                                                  ar: 'أفراد' },
  available:          { en: 'Available',                                               ar: 'متاحة' },
  occupied:           { en: 'Occupied',                                                ar: 'مشغولة' },
  startOrder:         { en: 'Start Order',                                             ar: 'بدء الطلب' },
  seats:              { en: 'seats',                                                   ar: 'مقاعد' },
  guests:             { en: 'Guests',                                                  ar: 'ضيوف' },
  guestCount:         { en: 'Guest Count',                                             ar: 'عدد الضيوف' },
  table:              { en: 'Table',                                                   ar: 'طاولة' },

  // ── Orders screen ──
  filters:            { en: 'Filters',                                                 ar: 'تصفية' },
  filterStatus:       { en: 'Status',                                                  ar: 'الحالة' },
  filterType:         { en: 'Type',                                                    ar: 'النوع' },
  filterSource:       { en: 'Source',                                                  ar: 'المصدر' },
  filterCreator:      { en: 'Creator',                                                 ar: 'المنشئ' },
  filterCashier:      { en: 'Cashier',                                                 ar: 'أمين الصندوق' },
  filterDriver:       { en: 'Driver',                                                  ar: 'السائق' },
  filterBizDate:      { en: 'Business Date',                                           ar: 'تاريخ العمل' },
  filterDueDate:      { en: 'Due Date',                                                ar: 'تاريخ التسليم' },
  allOrders:          { en: 'All',                                                     ar: 'الكل' },

  // ── Order more menu ──
  setGuests:          { en: 'Set Guests',                                              ar: 'تحديد الضيوف' },
  addDueTime:         { en: 'Add Due Time',                                            ar: 'إضافة وقت التسليم' },
  addCharge:          { en: 'Add Charge',                                              ar: 'إضافة رسوم' },
  addCallName:        { en: 'Add Call Name',                                           ar: 'إضافة اسم النداء' },
  removeCustomer:     { en: 'Remove Customer',                                         ar: 'إزالة العميل' },
  assignPriceTag:     { en: 'Assign Price Tag',                                        ar: 'تعيين فئة السعر' },
  assignTable:        { en: 'Assign Table',                                            ar: 'تعيين طاولة' },
  addCoupon:          { en: 'Add Coupon',                                              ar: 'إضافة قسيمة' },
  joinOrder:          { en: 'Join Order',                                              ar: 'دمج الطلب' },
  splitOrder:         { en: 'Split Order',                                             ar: 'تقسيم الطلب' },
  redeemReward:       { en: 'Redeem Reward',                                           ar: 'استرداد المكافأة' },
  scanLoyaltyQr:      { en: 'Scan Loyalty QR',                                         ar: 'مسح رمز QR الولاء' },
  returnOrder:        { en: 'Return order',                                            ar: 'إرجاع الطلب' },
  viewReceipt:        { en: 'View Receipt',                                            ar: 'عرض الإيصال' },
  addDeliveryAddress: { en: 'Add Delivery Address',                                    ar: 'إضافة عنوان التوصيل' },
  addDriver:          { en: 'Add Driver',                                              ar: 'إضافة سائق' },

  // ── Join order ──
  join:               { en: 'JOIN',                                                    ar: 'دمج' },
  addCustShort:       { en: 'ADD CUSTOMER',                                            ar: 'إضافة عميل' },
  taxes:              { en: 'Taxes',                                                   ar: 'الضرائب' },
  course1:            { en: 'Course 1',                                                ar: 'الطبق 1' },
  course2:            { en: 'Course 2',                                                ar: 'الطبق 2' },

  // ── Split order ──
  addOrderBtn:        { en: '+ Add order',                                             ar: '+ إضافة طلب' },

  // ── Charges ──
  chargesSheet:       { en: 'Charges',                                                 ar: 'الرسوم' },
  addChargeTitle:     { en: 'Add Charge',                                              ar: 'إضافة رسوم' },
  chargeFieldLabel:   { en: 'Label',                                                   ar: 'التسمية' },
  chargeFieldAmount:  { en: 'Amount',                                                  ar: 'المبلغ' },

  // ── Call name ──
  callName:           { en: 'Add Call Name',                                           ar: 'إضافة اسم النداء' },
  callNamePlaceholder:{ en: 'Call Name',                                               ar: 'اسم النداء' },
  callNameHint:       { en: 'This name will be used to call the customer when the order is ready.', ar: 'سيُستخدم هذا الاسم لمناداة العميل عند جاهزية طلبه.' },

  // ── Notes / tags ──
  orderNotesTitle:    { en: 'Order Notes',                                             ar: 'ملاحظات الطلب' },
  itemNoteTitle:      { en: 'Item Note',                                               ar: 'ملاحظة العنصر' },
  orderTagsTitle:     { en: 'Order Tags',                                              ar: 'وسوم الطلب' },

  // ── Discount ──
  discountTitle:      { en: 'Discount',                                                ar: 'خصم' },
  discountAmount:     { en: 'Amount',                                                  ar: 'مبلغ' },
  discountPercent:    { en: 'Percentage',                                              ar: 'نسبة مئوية' },
  enterAmount:        { en: 'Enter Amount',                                            ar: 'أدخل المبلغ' },
  enterPercentage:    { en: 'Enter Percentage',                                        ar: 'أدخل النسبة المئوية' },
  itemDiscountTitle:  { en: 'Item Discount',                                           ar: 'خصم العنصر' },

  // ── Quantity ──
  quantityTitle:      { en: 'Quantity',                                                ar: 'الكمية' },

  // ── Hold time ──
  holdTimeTitle:      { en: 'Hold Time',                                               ar: 'وقت الانتظار' },

  // ── Due time ──
  dueTimeTitle:       { en: 'Add Due Time',                                            ar: 'إضافة وقت التسليم' },

  // ── Price tag ──
  priceTagTitle:      { en: 'Assign Price Tag',                                        ar: 'تعيين فئة السعر' },

  // ── Coupon ──
  couponTitle:        { en: 'Add Coupon',                                              ar: 'إضافة قسيمة' },

  // ── Select driver ──
  selectDriverTitle:  { en: 'Select Driver',                                           ar: 'اختيار سائق' },

  // ── Redeem reward ──
  redeemTitle:        { en: 'Redeem Reward',                                           ar: 'استرداد المكافأة' },

  // ── Sync data ──
  syncDataTitle:      { en: 'Sync Data',                                              ar: 'مزامنة البيانات' },
  syncingData:        { en: 'Syncing data…',                                          ar: 'جارٍ المزامنة…' },
  syncComplete:       { en: 'Sync complete',                                          ar: 'اكتملت المزامنة' },
  syncWait:           { en: 'Please wait while updates are applied.',                  ar: 'يرجى الانتظار حتى يتم تطبيق التحديثات.' },

  // ── Reports menu ──
  ordersSummary:      { en: 'Orders Summary',                                          ar: 'ملخص الطلبات' },
  tillsSummary:       { en: 'Tills Summary',                                           ar: 'ملخص الخزائن' },
  driverPayments:     { en: 'Driver Payments',                                         ar: 'مدفوعات السائقين' },
  activeDelivery:     { en: 'Active Delivery',                                         ar: 'التوصيل النشط' },
  productsMix:        { en: 'Products Mix',                                            ar: 'مزيج المنتجات' },

  // ── Drawer ops ──
  drawerOpsTitle:     { en: 'Drawer Operations',                                       ar: 'عمليات الدرج' },
  cashIn:             { en: 'Cash In',                                                 ar: 'إيداع نقدي' },
  cashOut:            { en: 'Cash Out',                                                ar: 'سحب نقدي' },
  payExpense:         { en: 'Pay Expense',                                             ar: 'دفع مصاريف' },

  // ── House account ──
  houseAccountTitle:  { en: 'House Account Payment',                                   ar: 'دفع الحساب المنزلي' },

  // ── Return order ──
  returnOrderTitle:   { en: 'Return Order',                                            ar: 'إرجاع الطلب' },
  selectReturnItems:  { en: 'Select items to return',                                  ar: 'اختر العناصر للإرجاع' },
  chooseQtyAndWaste:  { en: 'Choose qty and mark wasted items',                        ar: 'اختر الكمية وحدد العناصر المهدرة' },
  selectAll:          { en: 'Select All',                                              ar: 'تحديد الكل' },
  deselectAll:        { en: 'Deselect All',                                            ar: 'إلغاء تحديد الكل' },
  waste:              { en: 'Waste',                                                   ar: 'هدر' },
  selectReasonBelow:  { en: 'Select reason below',                                     ar: 'اختر السبب أدناه' },
  returnAmount:       { en: 'Return amount',                                           ar: 'مبلغ الإرجاع' },
  businessDate:       { en: 'Business date',                                           ar: 'تاريخ العمل' },
  selectADate:        { en: 'Select a date',                                           ar: 'اختر تاريخاً' },
  viewBtn:            { en: 'View',                                                    ar: 'عرض' },
  syncBtn:            { en: 'Sync',                                                    ar: 'مزامنة' },

  // ── Scan QR ──
  scanQR:             { en: 'Scan Loyalty QR',                                         ar: 'مسح رمز QR الولاء' },

  // ── Receipt ──
  receiptTitle:       { en: 'Receipt',                                                 ar: 'إيصال' },

  // ── Product availability ──
  availTitle:         { en: 'Product Availability',                                    ar: 'توفر المنتجات' },

  // ── Customer flow ──
  fullName:           { en: 'Full name',                                               ar: 'الاسم الكامل' },
  phone:              { en: 'Phone',                                                   ar: 'الهاتف' },
  email:              { en: 'Email',                                                   ar: 'البريد الإلكتروني' },
  addressField:       { en: 'Address',                                                 ar: 'العنوان' },
  country:            { en: 'Country',                                                 ar: 'الدولة' },
  newCustomer:        { en: 'New Customer',                                            ar: 'عميل جديد' },
  findCustomer:       { en: 'Find Customer',                                           ar: 'بحث عن عميل' },

  // ── End of day ──
  endOfDayTitle:      { en: 'End of Day',                                              ar: 'نهاية اليوم' },

  // ── Reservations ──
  reservationsTitle:  { en: 'Reservations',                                            ar: 'الحجوزات' },

  // ── Language toggle ──
  switchLang:         { en: 'عربي',                                                    ar: 'English' },

  // ── Assign table ──
  assignTableTitle:   { en: 'Assign Table',                                            ar: 'تعيين طاولة' },
  noTableAssigned:    { en: 'No table assigned',                                       ar: 'لا توجد طاولة محددة' },
} as const;

export type TKey = keyof typeof translations;
