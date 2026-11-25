import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';

export type Locale = 'ar' | 'en';

const english: Record<string, string> = {
    'هاف أوتو': 'Half Auto', 'إدارة السيارات والشحن': 'Vehicle & Shipping Management',
    'الرئيسية': 'Dashboard', 'المشتريات': 'Purchases', 'المبيعات': 'Sales', 'السيارات': 'Vehicles',
    'التجار': 'Traders', 'الحاويات': 'Containers', 'النقل البري': 'Road Transport',
    'المصاريف والغرامات': 'Expenses & Penalties', 'المحاسبة': 'Accounting', 'دفتر الحسابات': 'Ledger',
    'التقارير': 'Reports', 'الإعدادات': 'Settings', 'المزيد': 'More', 'الوضع النهاري': 'Light mode',
    'الشعار وصيانة قاعدة البيانات وسجل الأخطاء': 'Logo, database maintenance, and error log',
    'شعار النظام': 'System Logo', 'PNG أو JPG أو WEBP، بحد أقصى 3 MB.': 'PNG, JPG, or WEBP, up to 3 MB.',
    'اختيار الشعار': 'Choose Logo', 'رفع الشعار': 'Upload Logo', 'تحديث قاعدة البيانات': 'Database Update',
    'ينشئ نسخة احتياطية تلقائياً ثم يشغّل migrations الجديدة فقط، دون حذف البيانات.': 'Creates a backup automatically, then runs new migrations only without deleting data.',
    'Backup وتشغيل Migrations': 'Backup & Run Migrations', 'سجل أخطاء Laravel': 'Laravel Error Log',
    'آخر 250 سطراً من laravel.log': 'Latest 250 lines from laravel.log',
    'سيتم إنشاء Backup أولاً ثم تشغيل migrations. هل تريد المتابعة؟': 'A backup will be created before running migrations. Continue?',
    'الوضع الليلي': 'Dark mode', 'مدير النظام': 'System Manager', 'الإدارة': 'Administration',
    'إجمالي السيارات': 'Total Vehicles', 'الحاويات المفتوحة': 'Open Containers', 'تكلفة المخزون': 'Inventory Cost',
    'نظرة سريعة على حركة السيارات والشحن والحسابات': 'A quick overview of vehicles, shipping, and accounts',
    'أحدث السيارات': 'Latest Vehicles', 'رقم المخزون': 'Stock Number', 'السيارة': 'Vehicle', 'التاجر': 'Trader',
    'التكلفة': 'Cost', 'لا توجد سيارات بعد': 'No vehicles yet', 'إضافة سيارة': 'Add Vehicle',
    'إضافة سيارة جديدة': 'Add New Vehicle', 'بحث برقم VIN أو المخزون أو الماركة...': 'Search by VIN, stock number, or make...',
    'المخزون': 'Stock', 'الحالة': 'Status', 'سعر الشراء': 'Purchase Price', 'التكلفة النهائية': 'Final Cost',
    'مشتراة': 'Purchased', 'لا توجد نتائج': 'No results', 'الماركة': 'Make', 'الموديل': 'Model',
    'السنة': 'Year', 'اللون': 'Color', 'بدون تاجر': 'No trader', 'حفظ السيارة': 'Save Vehicle',
    'جارٍ الحفظ...': 'Saving...', 'جارٍ فحص رقم VIN...': 'Checking VIN...', 'رقم VIN غير صالح.': 'Invalid VIN.',
    'تعذر فحص VIN الآن. حاول مرة أخرى.': 'Unable to check VIN now. Please try again.',
    'لا تستخدم I أو O أو Q': 'Do not use I, O, or Q', 'السيارة الموجودة:': 'Existing vehicle:',
    'يرجى مراجعة الحقول المطلوبة والقيم المكررة.': 'Please review required fields and duplicate values.',
    'إضافة تاجر': 'Add Trader', 'اسم التاجر': 'Trader Name', 'الهاتف': 'Phone', 'البريد': 'Email',
    'البريد الإلكتروني': 'Email', 'عدد السيارات': 'Vehicle Count', 'الرصيد الافتتاحي': 'Opening Balance',
    'حفظ التاجر': 'Save Trader', 'الاسم': 'Name', 'إضافة حاوية': 'Add Container',
    'إضافة حاوية — نفس تنسيق Excel': 'Add Container — Excel Format', 'حفظ الحاوية': 'Save Container', 'بطاقات': 'Cards',
    'رقم الحاوية': 'Container Number', 'رقم BL': 'BL Number', 'الوكيل': 'Agent', 'الوكيل / ACENTA': 'Agent / ACENTA', 'تسلسل': 'Sequence',
    'التاريخ': 'Date', 'تاريخ ARF': 'ARF Date', 'التسلسل': 'Sequence', 'أجور الوكيل': 'Agent Fee',
    'المخزن / DEPO': 'Depot / DEPO', 'العمولة': 'Commission', 'مصروف الجمارك': 'Customs Expense',
    'المدفوع': 'Paid', 'المصاريف': 'Expenses', 'مجموع المصاريف': 'Total Expenses', 'المتبقي': 'Remaining',
    'فتح الحاوية': 'Open Container', 'لا توجد حاويات': 'No containers', 'قائمة': 'List', 'شبكة': 'Grid',
    'معلومات الحاوية — حسب Excel': 'Container Information — Excel Format', 'بدون وكيل': 'No agent', 'بدون BL': 'No BL',
    'تعديل المعلومات': 'Edit Information', 'رجوع': 'Back', 'سيارات الحاوية': 'Container Vehicles',
    'التوزيع معتمد': 'Allocation Approved', 'اختر سيارة لإضافتها': 'Select a vehicle to add', 'إضافة': 'Add',
    'حصة الحاوية': 'Container Share', 'أضف سيارة واحدة على الأقل': 'Add at least one vehicle',
    'ملخص التوزيع': 'Allocation Summary', 'حصة السيارة التقريبية': 'Estimated Vehicle Share',
    'اعتماد التوزيع': 'Approve Allocation', 'مصاريف الحاوية': 'Container Expenses',
    'توزع بالتساوي عند الاعتماد': 'Distributed equally upon approval', 'إضافة مصروف': 'Add Expense',
    'البند': 'Item', 'الوصف': 'Description', 'المبلغ': 'Amount', 'لا توجد مصاريف بعد': 'No expenses yet',
    'إضافة مصروف حاوية': 'Add Container Expense', 'نوع المصروف': 'Expense Type', 'المخزن': 'Depot',
    'الجمارك': 'Customs', 'أخرى': 'Other', 'حفظ المصروف': 'Save Expense',
    'تعديل معلومات الحاوية': 'Edit Container Information', 'حفظ التعديلات': 'Save Changes',
    'اعتماد التوزيع سيقفل السيارات والمصاريف. هل تريد المتابعة؟': 'Approving the allocation will lock vehicles and expenses. Continue?',
    'إدارة الناقلات والسائقين وتوزيع التكلفة على 1–6 سيارات': 'Manage carriers, drivers, and distribute costs across 1–6 vehicles',
    'نقلة جديدة': 'New Shipment', 'المرجع': 'Reference', 'الناقلة': 'Carrier', 'السائق': 'Driver',
    'معتمدة': 'Approved', 'مسودة': 'Draft', 'فتح': 'Open', 'لا توجد نقلات بعد': 'No shipments yet',
    'إنشاء نقلة برية': 'Create Road Shipment', 'رقم/مرجع النقلة': 'Shipment Number / Reference',
    'اسم الناقلة': 'Carrier Name', 'رقم اللوحة': 'Plate Number', 'اسم السائق': 'Driver Name',
    'رقم هاتف السائق': 'Driver Phone', 'تاريخ التحميل': 'Loading Date', 'إنشاء النقلة': 'Create Shipment',
    'السيارات المحملة': 'Loaded Vehicles', 'اختر سيارة': 'Select Vehicle', 'تحميل': 'Load',
    'ملخص التكلفة': 'Cost Summary', 'أجرة ومصاريف وغرامات': 'Freight, Expenses & Penalties', 'حصة السيارة': 'Vehicle Share',
    'اعتماد التوزيع وقفل النقلة؟': 'Approve allocation and lock shipment?', 'تكاليف النقلة': 'Shipment Costs',
    'إضافة تكلفة': 'Add Cost', 'النوع': 'Type', 'غرامة مشتركة': 'Shared Penalty',
    'إضافة تكلفة للنقلة': 'Add Shipment Cost', 'نوع التكلفة': 'Cost Type', 'أجرة النقل': 'Transport Fee',
    'مصروف إضافي': 'Additional Expense', 'احتسابها كغرامة مشتركة': 'Count as a shared penalty', 'حفظ التكلفة': 'Save Cost',
    'هذه الوحدة ضمن المرحلة التالية': 'This module is planned for the next phase',
    'تم تجهيز مكان الوحدة في النظام والقائمة الرئيسية. سيتم ربطها بالعمليات المحاسبية بعد تثبيت دورة السيارات والحاويات.': 'The module and its navigation are ready. It will be connected to accounting after the vehicle and container workflow is finalized.',
    'شرح هذه الصفحة': 'Page Guide', 'إغلاق': 'Close', 'تخطي الشرح': 'Skip Guide', 'السابق': 'Previous', 'التالي': 'Next', 'فهمت': 'Got It', 'ملاحظة:': 'Note:', 'الخطوة': 'Step', 'من': 'of', 'جارٍ تحميل المزيد...': 'Loading more...',
    'مرحباً بك في هاف أوتو': 'Welcome to Half Auto', 'هذه الصفحة تعطيك ملخصاً سريعاً عن السيارات والحاويات والتجار وتكلفة المخزون.': 'This page gives you a quick summary of vehicles, containers, traders, and inventory cost.',
    'بطاقات الملخص': 'Summary Cards', 'الأرقام في الأعلى تتحدث تلقائياً عند إضافة السيارات والحاويات والمصاريف.': 'The figures above update automatically when vehicles, containers, and expenses are added.',
    'آخر السيارات': 'Latest Vehicles', 'من الجدول السفلي يمكنك متابعة أحدث السيارات المسجلة وتكلفتها الحالية.': 'Use the table below to track recently registered vehicles and their current cost.',
    'إدارة السيارات': 'Vehicle Management', 'هنا تجد كل السيارات مع VIN والتاجر وسعر الشراء والتكلفة النهائية.': 'Find all vehicles here with their VIN, trader, purchase price, and final cost.',
    'اضغط «إضافة سيارة» وأدخل رقم المخزون وVIN والماركة والموديل وسعر الشراء.': 'Click “Add Vehicle” and enter the stock number, VIN, make, model, and purchase price.',
    'يجب ألا يتكرر رقم VIN أو رقم المخزون.': 'VIN and stock number must be unique.', 'البحث السريع': 'Quick Search', 'ابحث باستخدام VIN أو رقم المخزون أو اسم الماركة.': 'Search using VIN, stock number, or make.',
    'إدارة التجار': 'Trader Management', 'هذه الصفحة تجمع التجار وعدد سيارات كل تاجر ورصيده الافتتاحي.': 'This page lists traders, their vehicle counts, and opening balances.',
    'اضغط «إضافة تاجر»، ثم أدخل الاسم والهاتف. البريد الإلكتروني اختياري.': 'Click “Add Trader”, then enter the name and phone. Email is optional.',
    'ربط السيارات': 'Linking Vehicles', 'عند إضافة أو تعديل سيارة اختر التاجر، وستظهر السيارة تلقائياً ضمن حسابه.': 'Choose the trader when adding or editing a vehicle; it will appear automatically in their account.',
    'إدارة الحاويات': 'Container Management', 'أنشئ الحاوية أولاً باستخدام رقم الحاوية وBL وARF ووكيل الشحن.': 'Create the container first using its number, BL, ARF, and shipping agent.',
    'اضغط «فتح» لإضافة السيارات والمصاريف ومراجعة التوزيع.': 'Click “Open” to add vehicles and expenses and review the allocation.',
    'حد الحمولة': 'Capacity Limit', 'كل حاوية تقبل من سيارة واحدة إلى أربع سيارات فقط.': 'Each container accepts 1 to 4 vehicles only.',
    'الخطوة 1: إضافة السيارات': 'Step 1: Add Vehicles', 'اختر السيارات من القائمة وأضفها إلى الحاوية. يمكن أن تكون لتاجر واحد أو لتجار مختلفين.': 'Select vehicles from the list and add them to the container. They may belong to one or different traders.',
    'الخطوة 2: تسجيل المصاريف': 'Step 2: Record Expenses', 'أضف أجور الوكيل وMIP وDemurrage والمخزن والعمولة والجمارك.': 'Add agent fees, MIP, demurrage, depot, commission, and customs.',
    'الخطوة 3: مراجعة الحصص': 'Step 3: Review Shares', 'يعرض النظام حصة تقريبية لكل سيارة فوراً قبل الاعتماد.': 'The system shows an estimated share for each vehicle before approval.',
    'الخطوة 4: اعتماد التوزيع': 'Step 4: Approve Allocation', 'بعد التأكد اضغط «اعتماد التوزيع». سيحفظ النظام الحصص ويقفل الحاوية.': 'After reviewing, click “Approve Allocation”. The system saves the shares and locks the container.',
    'بعد الاعتماد لا يمكن تغيير السيارات أو المصاريف حفاظاً على صحة الحسابات.': 'After approval, vehicles and expenses cannot be changed to preserve accounting accuracy.',
    'أنشئ نقلة جديدة وأدخل اسم السائق ورقم الهاتف والناقلة واللوحة.': 'Create a shipment and enter the driver name, phone, carrier, and plate.',
    'فتح النقلة': 'Open Shipment', 'بعد الإنشاء افتح النقلة لتحميل السيارات وإضافة الأجرة والغرامات.': 'Open the shipment after creation to load vehicles and add fees and penalties.',
    'كل ناقلة تقبل من سيارة واحدة إلى ست سيارات فقط.': 'Each carrier accepts 1 to 6 vehicles only.',
    'الخطوة 1: تحميل السيارات': 'Step 1: Load Vehicles', 'اختر السيارات المحملة على الناقلة، بحد أقصى ست سيارات.': 'Select the loaded vehicles, up to six.',
    'الخطوة 2: إضافة التكاليف': 'Step 2: Add Costs', 'سجل أجرة النقل والغرامة المشتركة وأي مصروف إضافي.': 'Record the transport fee, shared penalty, and any additional expense.',
    'الخطوة 3: مراجعة الحصة': 'Step 3: Review Share', 'راجع حصة كل سيارة من المجموع قبل الاعتماد.': 'Review each vehicle’s share of the total before approval.',
    'الخطوة 4: اعتماد النقلة': 'Step 4: Approve Shipment', 'اضغط «اعتماد التوزيع» لقفل النقلة وإضافة التكلفة إلى السيارات.': 'Click “Approve Allocation” to lock the shipment and add costs to vehicles.',
};

const patterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [/^(\d+) سيارة مسجلة$/, m => `${m[1]} registered vehicles`], [/^(\d+) تاجر$/, m => `${m[1]} traders`],
    [/^(\d+) من (\d+) سيارات$/, m => `${m[1]} of ${m[2]} vehicles`], [/^الخطوة (\d+) من (\d+)$/, m => `Step ${m[1]} of ${m[2]}`],
    [/^الحاوية (.+)$/, m => `Container ${m[1]}`], [/^النقلة (.+)$/, m => `Shipment ${m[1]}`], [/^تسلسل #(.*)$/, m => `Sequence #${m[1]}`],
];

function translate(value: string) {
    const leading = value.match(/^\s*/)?.[0] ?? '';
    const trailing = value.match(/\s*$/)?.[0] ?? '';
    const clean = value.trim();
    if (!clean) return value;
    let result = english[clean];
    if (!result) for (const [pattern, render] of patterns) { const match = clean.match(pattern); if (match) { result = render(match); break; } }
    return result ? leading + result + trailing : value;
}

function normalizeDisplay(value: string) {
    return value.replace(/(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)?/g, '$3/$2/$1');
}

const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({ locale: 'ar', setLocale: () => undefined });

export function LocaleProvider({ children }: PropsWithChildren) {
    const [locale, setLocaleState] = useState<Locale>(() => (localStorage.getItem('locale') === 'en' ? 'en' : 'ar'));
    const originals = useRef(new WeakMap<Node, string>());
    const attributeOriginals = useRef(new WeakMap<Element, Map<string, string>>());
    const setLocale = (next: Locale) => { localStorage.setItem('locale', next); setLocaleState(next); };

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        const apply = (root: Node) => {
            if (root.nodeType === Node.TEXT_NODE) {
                if (!originals.current.has(root)) originals.current.set(root, root.nodeValue ?? '');
                const original = originals.current.get(root) ?? '';
                const display = normalizeDisplay(original);
                const next = locale === 'en' ? translate(display) : display;
                if (root.nodeValue !== next) root.nodeValue = next;
                return;
            }
            if (!(root instanceof Element)) return;
            for (const name of ['title', 'placeholder', 'aria-label']) {
                if (!root.hasAttribute(name)) continue;
                if (!attributeOriginals.current.has(root)) attributeOriginals.current.set(root, new Map());
                const values = attributeOriginals.current.get(root)!;
                if (!values.has(name)) values.set(name, root.getAttribute(name) ?? '');
                const original = values.get(name)!;
                root.setAttribute(name, locale === 'en' ? translate(original) : original);
            }
            root.childNodes.forEach(apply);
        };
        apply(document.body);
        const observer = new MutationObserver(records => records.forEach(record => {
            record.addedNodes.forEach(apply);
            if (record.type === 'characterData') apply(record.target);
        }));
        observer.observe(document.body, { subtree: true, childList: true, characterData: true });
        return () => observer.disconnect();
    }, [locale]);

    return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
