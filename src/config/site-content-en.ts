/**
 * English translations for the site content.
 * Only user-facing marketing and navigation text is translated here.
 * Technical data (nutritional facts, banking info, etc.) remains unchanged.
 */

export const SITE_CONTENT_EN = {
    navigation: [
        { label: "Our Mission", href: "/#mise" },
        { label: "Products", href: "/#produkty" },
        { label: "3B Concept", href: "/#3b" },
        { label: "Contact", href: "/#kontakt" },
    ],
    social: {
        instagram: "https://www.instagram.com/boost_up_czech/",
        facebook: "https://www.facebook.com/profile.php?id=61567084724538",
        linkedin: "https://www.linkedin.com/company/boost-up-czech/"
    },

    hero: {
        announcement: "COMING SOON",
        headline: {
            part1: "DISCOVER THE NEW STANDARD OF",
            gradient: "STABLE FOCUS",
            part2: "Efficiency, speed and precision even under pressure."
        },
        description: "Up to 6 hours of focus and clean energy from stimulants. The power of 2.5 espressos without the jitters. No artificial sweeteners or flavourings.",
        testimonial: "Tested among professionals working under high pressure.",
        cta: {
            primary: "Buy now",
            secondary: "Discover more",
            concept3b: "3B Concept"
        },
        trustBadges: [
            "Natural stimulants",
            "Electrolytes",
            "Adaptogens",
            "Vitamins"
        ],
        benefits: [
            { bold: "Up to 6 hours of energy", text: "no crash at the end" },
            { bold: "Natural extracts", text: "no sugar, no artificial sweeteners" },
            { bold: "Calm under pressure", text: "performance without chaos" },
            { bold: "Developed with experts", text: "at Mendel University" },
        ],
        tags: [
            { label: "FOCUS", ingredientId: "vitamins", colorClass: "bg-olive", dotColor: "#3d5a2f" },
            { label: "STIMULATION", ingredientId: "stimulants", colorClass: "bg-lime", dotColor: "#dfdf57" },
            { label: "RESILIENCE", ingredientId: "adaptogens", colorClass: "bg-orange", dotColor: "#f29739" },
            { label: "BALANCE", ingredientId: "electrolytes", colorClass: "bg-terracotta", dotColor: "#aa263e" },
        ],
        showDiscountPopup: true,
        discountCode: "BOOST10",
    },

    mission: {
        badge: "ABOUT US",
        headline: {
            part1: "OUR",
            highlight: "MISSION"
        },
        paragraphs: [
            "We all know that day when you're trying to focus, finish a task, but your mental capacity just isn't enough. Coffee no longer helps and classic energy drinks?",
            "They bring a quick burst of energy, but within minutes you feel the crash. We wanted to change that.",
            "That's why we created BoostUp – a clean, effective shot that keeps you in peak condition for long hours."
        ],
        features: [
            {
                title: "Clean energy",
                stat: "2.5x",
                description: "The power of 2.5 espressos in one shot",
                color: "bg-lime"
            },
            {
                title: "Long-lasting",
                stat: "6h+",
                description: "Sustained focus without the crash effect",
                color: "bg-terracotta"
            },
            {
                title: "Natural formula",
                stat: "100%",
                description: "Tea extract, adaptogens and vitamins",
                color: "bg-olive"
            },
            {
                title: "No compromises",
                stat: "0%",
                description: "No artificial sweeteners or preservatives",
                color: "bg-orange"
            }
        ]
    },

    concept3b: {
        badge: "OUR APPROACH",
        headline: "THE 3B CONCEPT",
        description: "We bring a unique approach to energy to the market. Three pillars that are missing.",
        cta: "Discover the power of 3B",
        concepts: [
            {
                id: "brain",
                title: "BRAIN",
                subtitle: "Cognitive focus",
                description: "Maximum mental performance and concentration throughout the entire working day",
                stats: "Focus +85%",
                fullDescription: `
          BRAIN represents the first pillar of our 3B concept focused on optimising cognitive functions.
          
          **What it contains:**
          • L-theanine for calm concentration without jitters
          • Guarana for gradual energy release
          • Enhanced mental sharpness and clarity of thought
          • Better ability to concentrate on demanding tasks
          • Support for memory and information processing speed
          • No "brain fog" or fatigue after the effect wears off
          
          Ideal for students, professionals and anyone who needs maximum mental performance.
        `
            },
            {
                id: "body",
                title: "BODY",
                subtitle: "Physical energy",
                description: "Sustained physical energy without jitters and the crash effect",
                stats: "Energy +6h",
                fullDescription: `
          BODY is the second pillar focused on sustainable physical energy throughout the day.
          
          **What it contains:**
          • Natural caffeine in an optimal dose
          • Taurine for muscle performance support
          • Electrolytes for proper hydration
          
          **Benefits:**
          • Stable energy for 6+ hours
          • No sharp onset or subsequent "crash"
          • Support for physical performance and endurance
          • Faster recovery after exertion
          
          Perfect for athletes, active people and those who need energy for long working days.
        `
            },
            {
                id: "balance",
                title: "BALANCE",
                subtitle: "Harmony",
                description: "Balanced formula for optimal functioning of body and mind",
                stats: "Stability 100%",
                fullDescription: `
          BALANCE is the third pillar that unites BRAIN and BODY into a harmonious whole.
          
          **What it contains:**
          • Adaptogens for stress resilience
          • Antioxidants for cell protection
          • Natural ingredients without artificial additives
          
          **Benefits:**
          • Synergy between mental and physical components
          • Support for natural body balance
          • Reduction of negative stress effects
          • Long-term support for health and vitality
          
          The key to a sustainable lifestyle without extremes or compromises.
        `
            }
        ]
    },

    cta: {
        badge: "Be the first to try it",
        headline: {
            part1: "PREPARE FOR",
            highlight: "A NEW ERA OF ENERGY"
        },
        description: "Subscribe and get exclusive access to testers, discounts and news. Be part of the BoostUp community.",
        placeholder: "your@email.com",
        button: "Subscribe to newsletter",
        socialProof: {
            waiting: "+500 waiting for launch",
            launch: "Launch Q1 2025",
            natural: "100% natural"
        }
    },

    contact: {
        title: "CONTACT",
        headline: "HAVE A QUESTION?",
        description: "Curious about our products, partnership or just want to say hello? Write to us or call – we'd love to connect.",
        info: {
            phone: { label: "Phone", value: "775 222 037" },
            email: { label: "Email", value: "info@drinkboostup.cz" },
            address: { label: "Address", value: { line1: "Technologická 123", line2: "616 00 Brno, Czech Republic" } }
        },
        form: {
            name: { label: "Name", placeholder: "John Smith" },
            email: { label: "Email", placeholder: "john@email.com" },
            message: { label: "Message", placeholder: "How can we help you?" },
            submit: "Send message"
        },
        toast: {
            success: {
                title: "Message sent",
                description: "Thank you for your interest, we'll be in touch soon."
            }
        }
    },

    footer: {
        brand: {
            description: "6 hours of focus and clean energy from stimulants. The power of 2.5 espressos without the jitters. No artificial sweeteners or flavourings."
        },
        links: [
            {
                title: "NAVIGATION",
                items: [
                    { label: "About us", href: "/#mise" },
                    { label: "Products", href: "/#produkty" },
                    { label: "3B Concept", href: "/#3b" },
                    { label: "Contact", href: "/#kontakt" }
                ]
            },
            {
                title: "SUPPORT",
                items: [
                    { label: "Terms of Service", href: "/obchodni-podminky" },
                    { label: "Privacy Policy", href: "/ochrana-osobnich-udaju" },
                    { label: "Returns", href: "/reklamace" },
                    { label: "Cookies", href: "/cookies" },
                    { label: "Shipping & Payment", href: "/doprava-a-platba" },
                    { label: "Recurring Payments", href: "/podminky-opakovane-platby" }
                ]
            }
        ],
        contact: {
            title: "CONTACT",
            email: "info@drinkboostup.cz",
            phone: "+420 775 222 037",
            address: {
                line1: "Chaloupkova 3002/1a, Královo Pole",
                line2: "612 00 Brno, Czech Republic"
            }
        },
        bottom: {
            copyright: "© 2026 BOOSTUP SUPPLEMENTS S.R.O. ALL RIGHTS RESERVED.",
            legal: [
                { label: "Terms of Service", href: "/obchodni-podminky" },
                { label: "Privacy Policy", href: "/ochrana-osobnich-udaju" }
            ]
        }
    },

    flavors: {
        lemon: {
            name: "LEMON BLAST",
            description: "Citrus freshness and energy for a clear and focused mind",
            labels: ["Sugar free", "Vegan", "Energy"],
        },
        red: {
            name: "RED RUSH",
            description: "Red fruits and guarana for your fast and effective kick-start",
            labels: ["Vitamins", "Fast onset", "Performance"],
        },
        silky: {
            name: "SILKY LEAF",
            description: "Gentle green tea and lemon balm for long-lasting and calm energy",
            labels: ["Antioxidants", "Calm power", "Focus"],
        }
    },

    ingredientDetails: {
        stimulants: {
            title: "Natural stimulants",
            subtitle: "Clean energy from nature",
            description: "We harness the power of proven natural substances that deliver energy gradually, without sharp fluctuations or subsequent fatigue.",
            benefits: [
                "Increased alertness and attention",
                "Support for mental performance",
                "Gradual release without jitters"
            ],
            ingredients: ["Natural caffeine", "Guarana", "L-Theanine"]
        },
        electrolytes: {
            title: "Electrolytes",
            subtitle: "Optimal cell hydration",
            description: "Essential minerals for proper muscle function, nervous system health and maintaining deep hydration throughout the day.",
            benefits: [
                "Prevention of muscle cramps",
                "Better nerve impulse transmission",
                "Maintaining energy in cells"
            ],
            ingredients: ["Magnesium", "Potassium", "Sodium", "Calcium"]
        },
        adaptogens: {
            title: "Adaptogens",
            subtitle: "Stress resilience",
            description: "Herbs and mushrooms that help the body adapt to physical and mental stress and maintain inner balance.",
            benefits: [
                "Reduction of cortisol levels",
                "Immune system support",
                "Improved mood and recovery"
            ],
            ingredients: ["Ashwagandha", "Rhodiola rosea", "Lemon balm"]
        },
        vitamins: {
            title: "Vitamins",
            subtitle: "Fuel for your metabolism",
            description: "A complex of B and C vitamins that are key for transforming food into energy and protection against oxidative stress.",
            benefits: [
                "Support for energy metabolism",
                "Reduction of fatigue and exhaustion",
                "DNA and cell protection"
            ],
            ingredients: ["Vitamin B6", "Vitamin B12", "Vitamin C"]
        }
    },

    configurator: {
        badge: "PACK CONFIGURATOR",
        headline: "CREATE YOUR ENERGY",
        description: "Choose your pack size, flavor and delivery method. All freshly prepared for peak performance.",
        outOfStock: "OUT OF STOCK",
        cta: "ADD TO CART",
        total: "Total"
    },

    // NEW: Centralized Admin strings (English)
    admin: {
        terminalLabel: "Admin Terminal",
        auth: {
            verifying: "Verifying permissions...",
            noPermission: "You do not have permission to access the administration.",
            backToHome: "Back to Home",
            logout: "Log out"
        },
        navigation: {
            dashboard: "Overview",
            orders: "Orders",
            inventory: "Product Inventory",
            manufacture: "Production Inventory",
            messages: "Messages",
            emails: "Email Templates",
            content: "Site Content",
            pricing: "Pricing & Stats",
            promoCodes: "Promo Codes",
            profile: "My Account",
            help: "Help",
            quickTips: "Quick Tips",
            quickTipsDesc: "Don't waste time"
        },
        dashboard: {
            title: "DASHBOARD",
            welcome: "Welcome back, Admin.",
            salesStatus: "E-shop Status",
            salesActive: "✓ SALES ACTIVE",
            salesActiveDesc: "The shop is now fully operational for all customers.",
            salesPaused: "⏸ PAUSED",
            salesPausedDesc: "Sales have been temporarily paused. Customers cannot place new orders.",
            updateError: "Update Error",
            revenue: "Total Revenue",
            revenueDesc: "Lifetime Value",
            workflow: "Workflow",
            newOrders: "New / Paid",
            processing: "In Production",
            shipped: "Shipped",
            cancelled: "Cancelled",
            todayLabel: "TODAY",
            inventory: "INVENTORY",
            recentOrders: "RECENT ORDERS",
            recentOrdersDesc: "Last 10 transactions on the e-shop.",
            viewAll: "View All",
            noOrders: "No active orders",
            paymentPending: "PENDING",
            paymentPaid: "PAID",
            statusShipped: "COMPLETED",
            statusProcessing: "PRODUCTION",
            statusCancelled: "CANCELLED",
            statusReceived: "RECEIVED",
            unitKs: "pcs",
            multiplier: "x",
            paymentLabel: "Payment",
            statusLabel: "Status",
            amountLabel: "AMOUNT",
        },
        inventory: {
            sectionTitle: "INVENTORY",
            sectionDesc: "Current bottle counts for shipping.",
            lemon: "🍋 Lemon Blast",
            red: "🍓 Red Rush",
            title: "Warehouse",
            description: "Global overview of all physical stock in bottles and cases.",
            unit: "bottles",
            addStock: "Add Stock",
            removeStock: "Remove Stock",
            historyTitle: "Movement History",
            editDetails: "Edit Product",
            salesStatus: "SALE ACTIVE",
            manufacture: {
                title: "Production & Materials",
                subtitle: "Tracking ingredient status and packaging materials",
                loading: "Loading inventory...",
                newMaterial: "New Material",
                emptyTitle: "No materials",
                emptyDesc: "No production materials have been added yet.",
                limitLabel: "LIMIT:",
                warnAtLabel: "WARNING:",
                changeStatus: "Stock Movement",
                status: {
                    ok: "STATUS OK",
                    warning: "LOW STOCK",
                    critical: "CRITICAL"
                },
                table: {
                    id: "NAME / ID",
                    status: "CURRENT STATUS",
                    limits: "SET LIMITS"
                },
                dialogs: {
                    restock: {
                        title: "Edit Status: {name}",
                        amountLabel: "Amount ({unit})",
                        amountPlaceholder: "Enter amount...",
                        noteLabel: "Note (optional)",
                        notePlaceholder: "Reason for change...",
                        consumeBtn: "Consume (-)",
                        restockBtn: "Restock (+)",
                        success: "Successfully saved",
                        successDesc: "Stock for {name} has been updated.",
                        error: "Error",
                        errorDesc: "Failed to update stock status.",
                    },
                    history: {
                        title: "Movement History: {name}",
                        table: {
                            date: "Date",
                            type: "Type",
                            change: "Change",
                            user: "User",
                            note: "Note",
                        },
                        empty: "No movement records found.",
                        systemUser: "System",
                        types: {
                            restock: "Restock",
                            use: "Consumption",
                            correction: "Correction",
                        }
                    },
                    edit: {
                        titleAdd: "Add New Material/Supply",
                        titleEdit: "Edit: {name}",
                        nameLabel: "Item Name",
                        namePlaceholder: "e.g. Bottles 500ml",
                        unitLabel: "Measurement Unit",
                        unitPlaceholder: "pcs, kg, l, etc.",
                        levelsTitle: "Alert Levels",
                        warningLabel: "Warning Level (yellow)",
                        warningDesc: "Stock running low — prepare an order.",
                        criticalLabel: "Critical Level (red)",
                        criticalDesc: "Stock almost exhausted — restock immediately.",
                        notificationsLabel: "Enable low stock notifications",
                        saveBtn: "Save Changes",
                        savingBtn: "Saving...",
                        success: "Saved",
                        successDesc: "Material/supply {name} has been saved.",
                        error: "Error",
                        errorDesc: "Failed to save the item.",
                    }
                }
            },
            stock: {
                restock: {
                    titleIn: "Restock",
                    titleOut: "Remove",
                    tabIn: "Restock",
                    tabOut: "Remove",
                    currentLabel: "Current Stock",
                    countLabelIn: "Bottles to restock",
                    countLabelOut: "Bottles to remove",
                    nextTotal: "Estimated Total",
                    negativeWarning: "Warning: Total will be negative!",
                    noteLabel: "Note",
                    notePlaceholderIn: "e.g. Supplier delivery #123",
                    notePlaceholderOut: "e.g. Damaged items disposal",
                    defaultNoteIn: "Restock of bottles",
                    defaultNoteOut: "Removal / Inventory correction",
                    unit: "pcs",
                },
                history: {
                    title: "Movement History:",
                    empty: "No movements for this item.",
                    systemUser: "System",
                    table: {
                        date: "Date",
                        user: "User",
                        type: "Type",
                        change: "Change",
                        note: "Note",
                    },
                    types: {
                        restock: "Restock",
                        sale: "Sale",
                        correction: "Correction",
                    }
                }
            },
            products: {
                edit: {
                    title: "Edit Product",
                    nameLabel: "Product Name",
                    saleLabel: "Sale",
                    saleDesc: "Show SALE badge",
                    activeLabel: "Active Sale",
                    activeDesc: "Show product on web",
                    descLabel: "Description",
                    descPlaceholder: "e.g. Citrus freshness and energy...",
                    tooltipLabel: "Tooltip (text in \"i\" bubble)",
                    tooltipPlaceholder: "Text to show in bubble...",
                    imageLabel: "Product Photo",
                    imagePreview: "Product Preview",
                    uploading: "Uploading...",
                    uploadHint: "Click or drag file here",
                    uploadFormat: "PNG, JPG (ideally square PNG)",
                    success: "Product updated",
                    successDesc: "Changes for {sku} saved successfully.",
                    error: "Error during save",
                    imageSuccess: "Image uploaded",
                    imageSuccessDesc: "Image uploaded successfully.",
                    imageError: "Error during upload",
                    saveBtn: "Save Changes",
                }
            }
        },
        invoices: {
            title: "INVOICE",
            docNumber: "Document Number",
            customer: "Customer",
            issueDate: "Issue Date",
            dueDate: "Due Date",
            issuer: "Supplier",
            icLabel: "ID",
            labels: {
                item: "Item",
                qty: "Quantity",
                price: "Price/pc",
                total: "Total",
                grandTotal: "TOTAL TO PAY",
            },
            footer: {
                thanks: "Thank you for your order.",
                contact: "In case of questions, contact us at {email}",
            },
            qr: "QR Payment",
            actions: {
                save: "Save to PDF",
                print: "Print",
                close: "Close Invoice",
                open: "Invoice"
            }
        },
        editor: {
            bold: "Bold",
            italic: "Italic",
            reset: "Reset Style",
            defaultSize: "Default",
            sizePlaceholder: "Size",
        },
        alerts: {
            lowStock: "Low stock warning",
        },
        orders: {
            title: "Order Management",
            description: "Overview and processing of customer orders.",
            table: {
                id: "ID",
                date: "DATE",
                customer: "CUSTOMER",
                items: "ITEMS",
                amount: "AMOUNT",
                payment: "PAYMENT",
                method: "METHOD",
                status: "STATUS",
                actions: "ACTIONS"
            },
            status: {
                unpaid: "UNPAID",
                paid: "PAID",
                storno: "CANCELLED",
                transfer: "TRANSFER",
                express: "APPLE/GOOGLE"
            },
            cancelDialog: {
                title: "Cancel Order",
                question: "Do you really want to cancel this order?",
                warning: "This action is irreversible. Items will be returned to stock and order will be marked as cancelled.",
                back: "Back",
                confirmLabel: "Confirm Cancellation"
            },
            empty: "No orders in this category.",
            copyId: "ID Copied",
            itemsLabel: "Items:",
            totalPriceLabel: "Total price",
            markAsPaid: "Mark as paid",
            markAsShipped: "Mark as shipped",
            viewInvoice: "View invoice",
            notifToggle: "Enable browser notifications",
            sorting: "Sorting",
            labelsA4: "Combine on A4",
            labelsA4Desc: "Saves paper, places labels side by side",
            labelsSequential: "Print sequentially (one by one)",
            labelsSequentialDesc: "Opens each label in a new window",
            packetaLabel: "Packeta Label",
            viewDetail: "Detail",
            notifEnabled: "Notifications enabled! 🔔",
            notifEnabledDesc: "You will now be notified of every new customer message directly in the browser.",
            bulkStatusTitle: "Bulk Status Change",
            bulkCancelTitle: "Bulk Cancellation",
            bulkCancelQuestion: "Do you really want to cancel {size} selected orders? This action is irreversible.",
            printOptions: "Bulk Print Options",
            printOptionsDesc: "Choose the format for printing {size} labels.",
            printStarted: "Print Started",
            printStartedDesc: "Labels are generating in a new window. Orders have been moved to 'Processing'.",
            more: "MORE",
            markAsProcessing: "Mark as processing",
            bulkPrintErr: "Cannot print in bulk",
            bulkPrintErrDesc: "Selected orders do not have numeric IDs or shipping barcodes.",
            printingTitle: "Printing Started",
            printingDesc: "Labels are being generated in a new window. Orders have been moved to 'Processing'.",
            syncSuccess: "Sync Completed",
            syncSuccessDesc: "All shipments have been checked. Updated: {count}.",
            syncError: "Sync Error",
            statusChanged: "Order status changed",
            statusChangedDesc: "Order {id} was marked as {status}.",
            bulkStatusChangedDesc: "{count} orders were marked as {status}.",
            sortBy: "Sort by",
            sortLatest: "Latest first",
            sortOldest: "Oldest first",
            sortIdAsc: "Order ID (0-9)",
            sortIdDesc: "Order ID (9-0)",
            syncNow: "Synchronize",
            tabPending: "New / Paid",
            tabProcessing: "Processing",
            tabShipped: "Completed",
            tabCancelled: "Cancelled",
            cancel: "Cancel",
            confirmBulkCancel: "Confirm Bulk Cancellation",
            allowNotif: "Allow notifications",
            detail: {
                title: "Order",
                closeLabel: "Close order detail",
                invoice: "Invoice",
                print: "Print",
                label: "Label",
                createPacket: "Create Shipment",
                packetCreated: "Shipment created",
                packetCreatedDesc: "Barcode: {barcode}. Shipping and e-mail will be sent automatically once you drop the package at Packeta.",
                packetError: "Error creating shipment",
                currentStatus: "Current Status",
                paymentLabel: "Payment",
                deliveryLabel: "Delivery",
                paymentPending: "Payment: Pending",
                paymentPaid: "Payment: Paid",
                shippedStatus: "Delivery: Completed",
                processingStatus: "Delivery: In Production",
                pendingStatus: "Delivery: Awaiting Processing",
                customer: "Customer",
                deliveryTitle: "Delivery",
                method: "METHOD",
                paymentMethodLabel: "PAYMENT",
                methodZasilkovna: "Packeta",
                methodCourier: "Courier",
                paymentTransfer: "Bank Transfer",
                paymentCard: "Card Online",
                tracking: "Shipment Tracking",
                trackLink: "Track Package →",
                table: {
                    item: "Item",
                    qty: "Quantity",
                    price: "Total Price"
                },
                subtotal: "Subtotal",
                shipping: "Shipping",
                free: "Free",
                totalLabel: "TOTAL",
                qrTitle: "Payment Details",
                account: "Account",
                vs: "VS",
                bank: "Bank",
                qrInstruction: "Scan the QR code in your banking app for instant payment."
            }
        },
        contentManager: {
            title: "CONTENT ENGINE",
            description: "Manage visual and text content of the website",
            langCZ: "🇨🇿 CZECH",
            langEN: "🇬🇧 ENGLISH",
            preview: "Preview",
            reset: "Reset",
            save: "Save Changes",
            previewGenerated: "Preview has been generated",
            saveSuccess: "Content has been successfully saved",
            resetConfirm: "Do you really want to reset all content to default values? This action is irreversible.",
            resetSuccess: "Content has been reset to default values",
            loading: "Loading website content...",
            tabs: {
                hero: "Hero (Intro)",
                mission: "Mission",
                ingredients: "Ingredients",
                concept: "3B Concept",
                cta: "CTA (Subscription)",
                contact: "Contact",
                flavors: "Flavors",
                footer: "Footer",
                settings: "Settings"
            },
            sections: {
                hero: {
                    title: "Main Hero Section",
                    sectionDesc: "The visual centerpiece of your web presentation",
                    badge: "Badge text (COMING SOON)",
                    visibility: "Announcement banner visibility",
                    headlinePart1: "Headline Part 1",
                    headlineGradient: "Highlighted Headline",
                    headlinePart2: "Headline Part 2",
                    description: "Main description",
                    testimonial: "Subheadline under buttons (Testimonial)",
                    placeholder: "Enter text under buttons...",
                    ctaPrimary: "Primary Button",
                    ctaSecondary: "Secondary Button",
                    cta3b: "3B Concept Text"
                },
                mission: {
                    title: "Our Mission",
                    description: "Section telling the story of your brand",
                    badge: "Badge text (ABOUT US)",
                    visibility: "Badge visibility (ABOUT US)",
                    headlinePart1: "Headline Part 1",
                    highlight: "Highlighted headline text",
                    paragraphs: "Story content paragraphs",
                    paragraphLabel: "Story Block"
                },
                ingredients: {
                    title: "Scientific Information",
                    description: "Detailed breakdown of ingredients and their benefits",
                    category: "Category Name",
                    subtitle: "Sub-headline",
                    summary: "Effect summary",
                    benefits: "Key Benefits (list)",
                    tags: "Specific Substances (tags)"
                },
                concept: {
                    title: "3B Concept",
                    description: "Main pillars of performance and functionality",
                    headline: "Main Section Headline",
                    cta: "Button Text (CTA)",
                    intro: "Introductory Concept Description",
                    pillars: "Individual Pillars (Cards)",
                    pillarTitlePlaceholder: "Keyword (e.g. BRAIN)",
                    pillarSubtitle: "Catchy sub-headline",
                    pillarStats: "Performance statistics",
                    pillarDesc: "Card text (Limited space)",
                    pillarFullDesc: "Main detailed text (Popup window)",
                    pillarTip: "TIP: Use • for bullets",
                    pillarAddBullet: "+ ADD BULLET"
                },
                cta: {
                    title: "CTA Section (Subscription)",
                    sectionDesc: "Conversion element for newsletter",
                    badge: "Badge text (CONTACT)",
                    visibility: "CONTACT badge visibility",
                    headline: "Main Headline",
                    description: "Subscription benefits description",
                    placeholder: "Enter description text...",
                    inputPlaceholder: "Your email...",
                    button: "Subscribe now"
                },
                contact: {
                    title: "Contact Details",
                    description: "How customers can reach you",
                    badge: "Badge text (CONTACT)",
                    visibility: "CONTACT badge visibility",
                    headline: "Main headline",
                    email: "Email address",
                    phone: "Phone number",
                    address: "Address (Headquarters)"
                },
                flavors: {
                    title: "Flavor Management",
                    sectionTitle: "Flavor Catalog",
                    sectionDesc: "Manage parameters and specifications of individual flavor variants and product details",
                    code: "Code",
                    name: "Flavor Name",
                    tagline: "Slogan (Tagline)",
                    description: "Short description (for flavor selection)",
                    descPlaceholder: "Short description of the flavor that will be displayed to customers...",
                    specsTitle: "Detailed Specifications & Nutritional Values",
                    tabs: {
                        nutrition: "Nutrition",
                        vitamins: "Vitamins",
                        active: "Others"
                    },
                    table: {
                        item: "Item",
                        per100: "per 100g",
                        perPortion: "per portion",
                        rhp: "RDI (%)"
                    },
                    micronutrients: "Micronutrients Overview",
                    activeSubstances: "Other active substances",
                    addRow: "Add row"
                },
                footer: {
                    title: "Web Footer",
                    description: "Core information at the bottom of the page",
                    brand: "Brand description",
                    copyright: "Copyright text",
                    brandLabel: "Short brand description",
                    copyrightLabel: "Copyright text"
                },
                settings: {
                    title: "Global Settings",
                    description: "Control of global features and behavioral elements",
                    discountPopup: "Discount Pop-up (Engagement)",
                    discountPopupDesc: "Show a pop-up window with a discount offer upon first visit."
                }
            },
            notices: {
                saveWarning: {
                    title: "Don't forget to save changes!",
                    description: "All modifications in this engine will become active only after clicking SAVE CHANGES at the top of the control panel."
                },
                systemInfo: {
                    title: "System Info",
                    description: "Changes will take effect immediately across the entire site after saving. If an unexpected synchronization error occurs, the system will automatically switch to backup mode and load static content."
                }
            }
        },
        pricing: {
            title: "Pricing & Stats",
            description: "Sales analysis and e-shop performance",
            card: {
                title: "Pricing",
                subtitle: "Global price settings for all packs.",
                pack3: "Pack 3 pcs",
                pack12: "Pack 12 pcs",
                pack21: "Pack 21 pcs",
                perUnit: "CZK / unit",
                save: "Save new prices",
                success: "Prices updated",
                successDesc: "New prices have been successfully propagated to the system.",
                errorTitle: "Error during saving",
                currency: "CZK"
            },
            stats: {
                ordersTitle: "Order Volume",
                ordersSubtitle: "Orders over the last 30 days.",
                unitsTitle: "Sold Units",
                unitsSubtitle: "Sold bottles by flavors.",
                ordersLabel: "Orders",
                flavors: {
                    lemon: "Lemon Rush",
                    red: "Red Dragon",
                    silky: "Silky Breeze"
                }
            },
            charts: {
                revenue: "Revenue (CZK)",
                orders: "Order Count",
                units: "Bottles Sold",
                lemon: "Lemon Rush",
                red: "Red Dragon",
                silky: "Silky Breeze"
            }
        },
        profile: {
            title: "My Profile",
            description: "Manage personal info and account settings.",
            tabs: {
                info: "Personal Info",
                orders: "My Orders",
                subscriptions: "Subscriptions",
                security: "Security"
            },
            form: {
                personal: "Personal Details",
                personalDesc: "Your information for delivery and billing.",
                fullName: "Full Name",
                phone: "Phone",
                address: "Delivery Address",
                street: "Street",
                houseNumber: "House No.",
                city: "City",
                zip: "ZIP",
                billing: "Billing Details",
                isSame: "Billing address is the same as delivery",
                isCompany: "Business purchase",
                company: "Company",
                ico: "VAT ID / ICO",
                dic: "TAX ID / DIC",
                billingStreet: "Street (Billing)",
                billingHouseNumber: "House No. (Billing)",
                billingCity: "City (Billing)",
                billingZip: "Zip Code (Billing)",
                billingCompany: "Company Name",
                emailNote: "Primary email cannot be changed in settings.",
                save: "Save Profile",
                success: "Profile Saved",
                successDesc: "Your details have been successfully updated.",
                generalError: "Error"
            },
            security: {
                password: "Change Password",
                passwordDesc: "Update your access credentials.",
                current: "Current Password",
                new: "New Password",
                confirm: "Confirm New Password",
                update: "Update Password",
                success: "Password successfully changed",
                successDesc: "Your password has been successfully updated.",
                errorTitle: "Error changing password",
                matchNote: "Passwords are identical",
                errors: {
                    mismatchTitle: "Passwords do not match",
                    mismatchDesc: "New password and confirmation must be identical.",
                    tooShortTitle: "Password is too short",
                    tooShortDesc: "Password must be at least 8 characters long.",
                    wrongCurrent: "Current password is incorrect."
                }
            }
        },
        help: {
            title: "Help Center",
            description: "Administration guide and content management.",
            quickTips: "Quick Tips",
            quickTipsDesc: "How to save time",
            tips: {
                stats: { title: "Statistics", desc: "Track performance in real-time." },
                fonts: { title: "Working with Fonts", desc: "Changes take effect immediately after saving." },
                security: { title: "Security", desc: "Your data is protected by Auth." }
            },
            sections: {
                content: {
                    title: "Web Content",
                    description: "Manage texts and visual content across all site sections. Path: Admin → Web Content",
                    items: {
                        hero: { label: "Hero (Intro)", desc: "Main headings, product description, buttons, and testimonial. Also includes visibility toggle for the COMING SOON badge." },
                        mission: { label: "Mission", desc: "Texts in 'About Us' section – badges, headings, and paragraphs. Badge visibility can be toggled on/off." },
                        ingredients: { label: "Ingredients", desc: "Names and descriptions of ingredients displayed on the site." },
                        concept: { label: "3B Concept", desc: "Card content – subheadings, stats, and short descriptions for each card." },
                        cta: { label: "CTA (Subscription)", desc: "Newsletter section – badges, headings, description, and email form texts." },
                        contact: { label: "Contact", desc: "Email, phone, and address displayed in the contact section." },
                        flavors: { label: "Flavors", desc: "Names, descriptions, and labels for individual BoostUp variants." },
                        footer: { label: "Footer", desc: "Brand description and copyright text at the bottom of the site." }
                    }
                },
                typography: {
                    title: "Typography Control",
                    description: "Every text field in the Web Content section has an integrated style toolbar.",
                    items: {
                        font: { label: "Font Family", desc: "Select a font from Google Fonts (Poppins, Inter, Roboto, Montserrat, Playfair Display, etc.). Poppins is the site default." },
                        size: { label: "Font Size", desc: "Choose from preset sizes 10px–72px. Selecting 'Default' removes overrides and uses the template default." },
                        styles: { label: "Bold (B) / Italic (i)", desc: "Buttons work as toggles – one click to enable, second to disable. Highlighted buttons = active style." },
                        reset: { label: "Reset", desc: "Appears automatically if styles are modified. Clicking returns to default settings (Poppins, default size, no bold/italic)." },
                        live: { label: "Live Preview", desc: "See changes reflecting in the input field in real-time. Changes apply to the site after clicking 'Save Changes' at the top." }
                    }
                },
                visibility: {
                    title: "Badge Visibility",
                    description: "Visibility toggles appear above relevant text fields.",
                    items: {
                        active: { label: "Toggle ON = Badge Visible", desc: "The corresponding colored badge (e.g., 'NEW', 'COMING SOON') will be displayed on the site." },
                        inactive: { label: "Toggle OFF = Badge Hidden", desc: "The badge will not be displayed on the site, even if text is present in the field." },
                        location: { label: "Toggle Locations", desc: "Hero – COMING SOON badge, Mission – ABOUT US badge, CTA – badge, Contact – CONTACT badge." }
                    }
                },
                orders: {
                    title: "Orders",
                    description: "Overview and management of all customer orders. Path: Admin → Orders",
                    items: {
                        filtering: { label: "Order Filtering", desc: "Filter orders by status (pending, confirmed, shipped, delivered, cancelled)." },
                        detail: { label: "Order Detail", desc: "Click an order to view details – customer, products, address, payment method." },
                        copy: { label: "Copy ID", desc: "The 'Copy' icon next to the Order ID saves the code to your clipboard immediately." },
                        status: { label: "Status Change", desc: "Customers receive an automatic email when the status changes to 'Shipped'." },
                        packeta: { label: "Packeta Labels", desc: "Generate and print Zasilkovna labels directly from the order detail." },
                        notifications: { label: "Browser Notifications", desc: "Enable sound and visual alerts for new orders." }
                    }
                },
                pricing: {
                    title: "Pricing & Statistics",
                    description: "Global price management and e-shop performance overview. Path: Admin → Pricing & Stats",
                    items: {
                        global: { label: "Global Pack Pricing", desc: "Set prices for 3, 12, and 21 pack sizes across the entire site." },
                        stats: { label: "Sales Statistics", desc: "Charts for orders and units sold over the last 30 days." },
                        analysis: { label: "Flavor Analysis", desc: "Track flavor popularity, including calculated MIX pack breakdowns." }
                    }
                },
                promos: {
                    title: "Promo Codes",
                    description: "Manage promo coupons and welcome pop-ups. Path: Admin → Promo Codes",
                    codeLabel: "Unique code (e.g. BOOST20)",
                    discountLabel: "Discount amount in %",
                    syncing: "Syncing with database...",
                    items: {
                        creation: { label: "Code Creation", desc: "Create unlimited codes with percentage-based discounts." },
                        popup: { label: "Welcome Pop-up", desc: "Automatic discount offer for new site visitors." },
                        rules: { label: "Discount Rules", desc: "Promo codes do not stack with subscription discounts." }
                    }
                },
                inventory: {
                    title: "Product Inventory",
                    description: "Manage stock levels for finished products. Path: Admin → Product Inventory",
                    items: {
                        add: { label: "Add Stock", desc: "Click a product and enter the quantity to add." },
                        minimum: { label: "Minimum Stock", desc: "Receive alerts when stock levels fall below the set threshold." }
                    }
                },
                manufacture: {
                    title: "Manufacture Inventory",
                    description: "Manage raw materials and production supplies. Path: Admin → Manufacture Inventory",
                    items: {
                        alert: { label: "Alert (Red Dot)", desc: "Indicates an item is below minimum or warning levels." },
                        edit: { label: "Edit Supply", desc: "Manually adjust raw material quantities in the detail view." },
                        notifications: { label: "Notifications", desc: "Option to enable/disable alerts for each specific material." }
                    }
                },
                saving: {
                    title: "Saving Changes",
                    description: "Important information about saving configurations.",
                    items: {
                        button: { label: "'Save Changes' Button", desc: "Changes will not be live on the site until you click this button." },
                        loading: { label: "Automatic Load", desc: "Refreshing the page returns data to the last saved state." },
                        reset: { label: "'Reset' Button", desc: "Discards all unsaved changes and returns to the initial state." }
                    }
                },
                security: {
                    title: "Auth & Security",
                    description: "Information about login and system security.",
                    items: {
                        magic: { label: "Magic Link", desc: "Automatic login links sent directly to your email." },
                        detection: { label: "Domain Detection", desc: "Automatic recognition of test and production environments." },
                        supabase: { label: "Whitelist (Important!)", desc: "Domains must be whitelisted in the Supabase Dashboard for proper redirection." }
                    }
                },
                design: {
                    title: "Design & Branding",
                    description: "Visual identity standards and interface readability.",
                    items: {
                        palette: { label: "Color Palette", desc: "Official BoostUp colors: Olive, Lime, and Terracotta." },
                        charts: { label: "Chart Colors", desc: "Chart coding corresponds to individual product flavors." },
                        readability: { label: "Readability", desc: "High contrast is automatically applied for maximum accessibility." }
                    }
                },
                marketing: {
                    title: "Email Marketing (Campaigns)",
                    description: "Bulk newsletter distribution. Path: Admin → Email CMS",
                    items: {
                        campaigns: { label: "Marketing Campaigns", desc: "Send selected templates to all subscribers in batches." },
                        progress: { label: "Progress Bar", desc: "Monitor campaign progress in real-time." }
                    }
                },
                newsletter: {
                    title: "Newsletter & Opt-out",
                    description: "Subscriber management and unsubscribe flow",
                    items: {
                        subscribers: { label: "Subscribers", desc: "Manage the database of active contacts and subscription status." },
                        campaigns: { label: "Campaign Creation", desc: "Bulk mailing with automated link personalization." },
                        unsub: { label: "Unsubscribe (GDPR)", desc: "Automated opt-out system via personalized links in the footer." },
                        safety: { label: "Safety", desc: "Protection against duplicate sending and filtering of inactive contacts." }
                    }
                }
            }
        },
        messages: {
            status: {
                unread: "New",
                read: "Read",
                replied: "Replied"
            },
            empty: "No messages to display.",
            actions: {
                reply: "Reply",
                markRead: "Mark as read",
                delete: "Delete",
                send: "Send reply",
                cancel: "Cancel",
                saving: "Sending..."
            },
            success: {
                replied: "Reply sent",
                read: "Message marked as read",
                deleted: "Message deleted"
            }
        },
        emailManager: {
            title: "Email Management",
            description: "System notifications and SMTP server settings.",
            tabs: {
                settings: "Settings",
                templates: "Templates",
                logs: "Sending History"
            },
            form: {
                provider: "Provider",
                host: "SMTP Host",
                port: "Port",
                user: "Username",
                pass: "Password",
                fromName: "Sender Name",
                fromEmail: "Sender Email",
                save: "Save Settings",
                test: "Send Test Email"
            },
            templates: {
                order_confirmation: "Order Confirmation",
                shipping: "Shipping Update",
                contact_auto_reply: "Contact Auto-Reply",
                registration: "Welcome Email",
                reset_password: "Password Reset",
                magic_link: "Magic Link Login",
                contact_inquiry: "New Inquiry (for Admin)",
                newsletter_signup: "Newsletter Signup"
            },
            campaign: {
                title: "Email Campaigns",
                description: "Bulk newsletter distribution to subscribers.",
                target: "Target Audience",
                subscribers: "Newsletter Subscribers",
                selectTemplate: "Select template for campaign",
                start: "Launch Campaign",
                sending: "Sending campaign...",
                completed: "Campaign completed",
                stats: "Delivery stats",
                startDesc: "The template will be sent to all subscribers after clicking launch.",
                confirm: "Are you sure you want to send this campaign to {count} people?",
                success: "Campaign has been sent to all subscribers!",
                noSubscribers: "No subscribers found",
                activeEmails: "Active emails",
                sourceNote: "Loaded from newsletter_subscriptions",
                progressStatus: "Sent {sentCount} of {totalToSend} emails"
            },
            dialogs: {
                createTitle: "Create New Email",
                createDesc: "Define template ID for system use.",
                idLabel: "Unique ID (e.g., summer_sale)",
                idPlaceholder: "no spaces or special characters",
                createBtn: "Create Template",
                htmlTitle: "Base HTML Structure",
                htmlDesc: "Read-only – this part is fixed for all emails."
            },
            editor: {
                subject: "Email Subject",
                content: "Email Content (HTML)",
                styleLabel: "Style: BoostUp Premium Layout",
                placeholders: "Available Variables",
                activeEmailsLabel: "Active emails",
                preview: "Preview",
                howItWorks: "How it works?",
                howItWorksDesc: "Database entries override default code settings. To restore original text, delete content and save.",
                status: "Status Engine",
                default: "DEFAULT",
                structure: "Template Structure",
                structureDesc: "Inserted into a fixed frame with logo.",
                placeholder: "Enter text...",
                subjectPlaceholder: "Enter email subject...",
                contentPlaceholder: "Enter template HTML code...",
                viewHtml: "View HTML",
                previewFull: "Preview Full Email",
                copyBase: "Copy Base Template",
                copySuccess: "Base HTML code copied to clipboard.",
                tagsTitle: "Available Tags (Placeholders)",
                tagsNote: "Click a tag to insert it into the editor. These tags will be automatically replaced with real data during sending.",
                previewCtaTitle: "Want to see how it looks?",
                previewCtaDesc: "Send yourself a test email with these changes",
                customBadge: "CUSTOM",
                searchPlaceholder: "Search template...",
                newSubject: "New Email",
                newContent: "<p>Start writing your email here...</p>"
            },
            success: {
                saved: "Template saved",
                defaultLoaded: "Default system code loaded.",
                created: "New template has been created",
                testSent: "Test email has been sent to {email}",
                campaignSent: "Campaign has been sent to all subscribers!"
            },
            errors: {
                load: "Failed to load templates",
                save: "Failed to save template",
                create: "Error creating template",
                delete: "Error deleting template",
                test: "Error sending test email",
                subscribers: "Failed to load subscribers",
                idRequired: "Template ID is required",
                idExists: "Template with this ID already exists",
                fieldsRequired: "Subject and content must be filled",
                defaultMissing: "No default system code exists for this template."
            },
            testData: {
                customerName: "John Doe",
                orderNumber: "TEST-12345",
                message: "This is a test message for template preview.",
                itemName1: "BoostUp Lemon Blast",
                itemName2: "BoostUp Mixed Pack"
            }
        }
    },

    checkout: {
        title: "Checkout",
        titleLine1: "COMPLETE",
        titleLine2: "ORDER",
        subTitle: "Secure Checkout / Delivery within 48h",
        backToCart: "Back to selecting packs",
        cartTitle: "My Cart",
        summaryTitle: "Summary",
        steps: {
          stepCount: "Step 3 of 3",
          confirmation: "Order Confirmation"
        },
        personalInfo: {
            title: "Shipping & Contact",
            description: "Enter your delivery details",
            mode_personal: "Personal",
            mode_company: "Business",
            firstName: "First Name",
            lastName: "Last Name",
            email: "Email Address",
            phone: "Phone Number",
            companyLabel: "I am buying for a company",
            companyName: "Company Name",
            ico: "ID (IČO)",
            dic: "VAT ID (DIČ)"
        },
        address: {
            title: "Billing Information",
            street: "Street",
            houseNumber: "House No.",
            city: "City",
            zip: "Postcode",
            billingSame: "Billing address is the same"
        },
        delivery: {
            title: "Shipping Method",
            method_personal: "Personal Pickup (Brno)",
            method_zasilkovna: "Zásilkovna (Packeta)",
            pickupPoint: "Pickup Point",
            changePoint: "Change Pickup Point",
            free: "FREE"
        },
        payment: {
            title: "Payment Method",
            method_gopay: "GoPay (Card, Apple Pay, Transfer)",
            method_bank: "Bank Transfer",
            method_stripe_express: "Express Payment (Apple/Google Pay)"
        },
        express: {
            title: "Express Checkout",
            subtitle: "Native payment / No forms",
            description: "The fastest way to energy. Address and contact info load securely from your phone.",
            promoPlaceholder: "Have a promo code?",
            promoApply: "APPLY",
            promoNote: "Note: Promo codes cannot be combined with subscription discounts.",
            divider: "Fast Payment",
            secureNote: "Secured by Stripe"
        },
        summary: {
            subtotal: "Subtotal",
            discount: "Total Discount",
            shipping: "Shipping",
            totalWithVat: "Total incl. VAT",
            submitButton: "ORDER AND PAY",
            processing: "Processing..."
        }
    },

    promoCodes: {
        title: "PROMO CODES",
        description: "Manage discount coupons and loyalty codes.",
        createButton: "Create Code",
        formTitle: "Create Code",
        formDesc: "Define discount percentage and voucher code.",
        codePlaceholder: "E.G. BOOST10",
        codeLabel: "Unique code (e.g., BOOST20)",
        discountLabel: "Discount amount in %",
        discountNote: "Discount does not stack with subscription discount (15%). The system automatically selects the better option.",
        syncing: "Syncing with database...",
        statusActive: "ACTIVE",
        statusPaused: "PAUSED",
        deleteConfirm: "Do you really want to delete this promo code?",
        notifications: {
            loadError: "Failed to load promo codes",
            createSuccess: "Promo code successfully created",
            createError: "Failed to create code",
            activated: "Code activated",
            deactivated: "Code deactivated",
            toggleError: "Error changing code status",
            deleteSuccess: "Code deleted",
            deleteError: "Error deleting code",
            popupOn: "Pop-up enabled",
            popupOff: "Pop-up disabled",
            popupError: "Error changing pop-up state",
            popupCodeChanged: "Pop-up code changed to {code}",
            popupCodeError: "Error changing code"
        },
        popupSection: {
            title: "GIFT GATE (POP-UP)",
            description: "Management of the discount pop-up for new visitors.",
            toggleLabel: "Pop-up Visibility",
            toggleDesc: "Enable/disable automatic discount display upon page load.",
            codeLabel: "DISPLAYED CODE",
            helpText: "This code will be shown to customers in the pop-up. Ensure this code is also created in the table below."
        },
        listSection: {
            title: "ACTIVE COUPONS",
            empty: "No promo codes",
            emptyDesc: "You haven't created any promo codes yet. Start by clicking the 'Create Code' button.",
            table: {
                code: "CODE",
                discount: "DISCOUNT",
                status: "STATUS",
                created: "CREATED",
                actions: "ACTIONS"
            }
        }
    }
};
