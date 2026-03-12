import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    googleVerification?: string;
}

export const SEO = ({
    title,
    description = "Přírodní energie na celý den. 6 hodin soustředění bez nervozity a crash efektu.",
    image = "https://www.drinkboostup.cz/hero-vse.jpg",
    url = "https://www.drinkboostup.cz",
    type = "website",
    googleVerification = "ZUV9w82flSkJabmd855ZDSmaKWNTzQDlsWHOuPKwEYw"
}: SEOProps) => {
    const siteTitle = "BoostUp Supplements";
    const fullTitle = `${title} | ${siteTitle}`;

    // Schema.org JSON-LD for Organization and Product
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://www.drinkboostup.cz/#organization",
                "name": "BoostUp",
                "url": "https://drinkboostup.cz",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.drinkboostup.cz/logo-green.png"
                },
                "sameAs": [
                    "https://www.instagram.com/boostup_energy/",
                    "https://www.facebook.com/boostupenergybrew"
                ]
            },
            {
                "@type": "Product",
                "name": "BoostUp Pure Shot 60ml",
                "description": "Čistá energie z čajového extraktu s elektrolyty a adaptogeny.",
                "brand": {
                    "@type": "Brand",
                    "name": "BoostUp"
                },
                "image": "https://www.drinkboostup.cz/hero-vse.jpg",
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "124"
                },
                "review": {
                    "@type": "Review",
                    "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5"
                    },
                    "author": {
                        "@type": "Person",
                        "name": "Jan Novák"
                    }
                },
                "offers": {
                    "@type": "Offer",
                    "url": "https://www.drinkboostup.cz/#produkty",
                    "priceCurrency": "CZK",
                    "price": "59.00",
                    "priceValidUntil": "2026-12-31",
                    "availability": "https://schema.org/InStock"
                }
            },
            {
                "@type": "WebSite",
                "@id": "https://www.drinkboostup.cz/#website",
                "url": "https://drinkboostup.cz",
                "name": "BoostUp",
                "publisher": {
                    "@id": "https://www.drinkboostup.cz/#organization"
                }
            }
        ]
    };

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {googleVerification && <meta name="google-site-verification" content={googleVerification} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};
