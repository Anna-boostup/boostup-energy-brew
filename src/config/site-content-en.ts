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
          • B-complex for optimal nervous system function
          
          **Benefits:**
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
            address: { label: "Address", value: { line1: "Chaloupkova 3002/1a, Královo Pole", line2: "612 00 Brno, Czech Republic" } }
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
};
