export interface EmailTemplateDefault {
    subject: string;
    content_html: string;
}

export const EMAIL_DEFAULTS: Record<string, EmailTemplateDefault> = {
    confirm_signup: {
        subject: 'Potvrď svůj e-mail | BoostUp ⚡',
        content_html: `
<h2 style="color:#3a572c;margin:0 0 16px 0;font-size:24px;font-weight:bold">Vítej v týmu! 🚀 Prověříme se?</h2>
<p style="margin:0 0 24px 0;font-size:16px;color:#4b5563">Děkujeme za registraci na BoostUp Energy. Pro aktivaci tvého účtu prosím klikni na tlačítko níže.</p>
<div style="margin:32px 0;text-align:center">
    <a href="{{confirmationLink}}" style="background:#3a572c;color:white;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;font-size:16px">Potvrdit e-mail</a>
</div>
<p style="margin:32px 0 0 0;font-size:13px;color:#4b5563">Pokud jsi se neregistroval, můžeš tento e-mail bezpečně ignorovat.</p>
        `
    },
    reset_password: {
        subject: 'Obnova hesla | BoostUp ⚡',
        content_html: `
<h2 style="color:#3a572c;margin:0 0 16px 0;font-size:24px;font-weight:bold">Zapomenuté heslo?</h2>
<p style="margin:0 0 24px 0;font-size:16px;color:#4b5563">To se stane každému. Klikni na tlačítko níže a nastav si nové heslo ke svému účtu.</p>
<div style="margin:32px 0;text-align:center">
    <a href="{{resetLink}}" style="background:#3a572c;color:white;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;font-size:16px">Změnit heslo</a>
</div>
<p style="margin:32px 0 0 0;font-size:13px;color:#4b5563">Tento odkaz vyprší za 24 hodin. Pokud jsi o změnu nežádal, nic se neděje – tvoje heslo zůstane nezměněno.</p>
        `
    },
    magic_link: {
        subject: 'Přihlášení do BoostUp ⚡',
        content_html: `
<h2 style="color:#3a572c;margin:0 0 16px 0;font-size:24px;font-weight:bold">Tvůj odkaz pro přihlášení</h2>
<p style="margin:0 0 32px 0;font-size:16px;color:#4b5563">Kliknutím na tlačítko níže budeš okamžitě přihlášen ke svému účtu.</p>
<div style="margin:32px 0;text-align:center">
    <a href="{{magicLink}}" style="background:#3a572c;color:white;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;font-size:16px">Přihlásit se</a>
</div>
<p style="margin:32px 0 0 0;font-size:13px;color:#4b5563">Tento odkaz je platný pouze po omezenou dobu. Pokud jsi jsi ho nevyžádal, můžeš tento e-mail ignorovat.</p>
        `
    },
    registration: {
        subject: 'Vítej v týmu BoostUp! 🚀',
        content_html: `
<h1 style="color:#3a572c;margin:0 0 16px 0;font-size:28px;font-weight:bold">Ahoj {{customerName}}!</h1>
<p style="margin:0 0 24px 0;font-size:16px;color:#4b5563">Jsme nadšení, že ses přidal k BoostUp. Tvůj účet byl úspěšně vytvořen a teď už ti nic nebrání v cestě za maximálním výkonem.</p>
<div style="margin:30px 0;text-align:center">
    <a href="{{BASE_URL}}" style="background:#3a572c;color:white;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;font-size:16px">Doplnit zásoby energie</a>
</div>
<p style="margin:0;font-size:14px;color:#4b5563">Pokud budeš cokoliv potřebovat, stačí odpovědět na tento e-mail.</p>
        `
    },
    order_confirmation: {
        subject: '✅ Potvrzení objednávky {{orderNumber}} | BoostUp',
        content_html: `
<h2 style="color:#3a572c;margin:0 0 16px 0;font-size:24px;font-weight:bold">Díky za tvoji objednávku!</h2>
<p style="margin:0 0 24px 0;font-size:16px;color:#4b5563">Ahoj {{customerName}}, tvoje objednávka <strong>{{orderNumber}}</strong> byla úspěšně přijata. Už na ní začínáme pracovat.</p>
<table style="width:100%;margin:24px 0;border-collapse:collapse;text-align:left">
    {{itemsHtml}}
    <tr>
        <td style="padding:20px 0 0 0;font-size:18px;font-weight:bold;color:#1f2937">Celkem</td>
        <td style="padding:20px 0 0 0;text-align:right;font-size:22px;font-weight:bold;color:#3a572c">{{total}} Kč</td>
    </tr>
</table>
<p style="margin:0;font-size:14px;color:#4b5563">Hned jak zásilku předáme dopravci, pošleme ti e-mail se sledovacím číslem.</p>
        `
    },
    shipping: {
        subject: '🚚 Tvoje zásilka {{orderNumber}} je na cestě! | BoostUp',
        content_html: `
<h2 style="color:#3a572c;margin:0 0 16px 0;font-size:24px;font-weight:bold">Tvůj BoostUp je na cestě! 🚀</h2>
<p style="margin:0 0 24px 0;font-size:16px;color:#4b5563">Tvůj balíček k objednávce <strong>{{orderNumber}}</strong> jsme právě předali Zásilkovně.</p>
<div style="background:#f9fafb;padding:32px;border-radius:24px;margin:24px 0;border:1px solid #f3f4f6;text-align:center">
    <p style="margin:0 0 8px 0;font-size:12px;color:#4b5563;text-transform:uppercase;font-weight:bold;letter-spacing:1px">Sledovací číslo</p>
    <p style="font-size:24px;font-weight:bold;margin:0 0 20px 0;color:#3a572c">{{trackingNumber}}</p>
    <a href="https://tracking.packeta.com/cs/?id={{trackingNumber}}" style="background:#3a572c;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;font-size:16px">Sledovat zásilku</a>
</div>
        `
    },
    contact_auto_reply: {
        subject: 'Díky za tvou zprávu! | BoostUp',
        content_html: `
<h2 style="color:#3a572c;margin:0 0 16px 0;font-size:24px;font-weight:bold">Zpráva přijata ⚡</h2>
<p style="margin:0 0 24px 0;font-size:16px;color:#4b5563">Ahoj, tvoje zpráva dorazila k nám do BoostUpu. Ozveme se ti co nejdříve, obvykle to netrvá déle než pár hodin.</p>
<div style="background:#f9fafb;padding:24px;border-radius:16px;margin:24px 0;border:1px solid #f3f4f6;font-style:italic;color:#4b5563;text-align:left">
    "{{message}}"
</div>
<p style="margin:0;font-size:14px;color:#4b5563">Zatím můžeš mrknout na naše novinky na <a href="https://instagram.com/drinkboostup" style="color:#3a572c;font-weight:600;text-decoration:none">Instagramu</a>.</p>
        `
    },
    newsletter_signup: {
        subject: 'Nový odběratel newsletteru! 📧',
        content_html: `
<h2 style="color:#3a572c;margin:0 0 16px 0;font-size:24px;font-weight:bold">Nový zájemce o BoostUp</h2>
<p style="margin:0 0 24px 0;font-size:16px;color:#4b5563">Máme nového odběratele v newsletteru.</p>
<div style="background:#f9fafb;padding:24px;border-radius:16px;margin:24px 0;border:1px solid #f3f4f6;text-align:center">
    <p style="margin:0 0 8px 0;font-size:12px;color:#4b5563;text-transform:uppercase;font-weight:bold">E-mail</p>
    <p style="font-size:20px;font-weight:bold;margin:0;color:#3a572c">{{subscriberEmail}}</p>
</div>
        `
    },
    contact_inquiry: {
        subject: 'Nová zpráva z kontaktního formuláře 📩',
        content_html: `
<h2 style="color:#3a572c;margin:0 0 16px 0;font-size:24px;font-weight:bold">Nová zpráva od zákazníka</h2>
<div style="background:#f9fafb;padding:24px;border-radius:16px;margin:24px 0;border:1px solid #f3f4f6;text-align:left">
    <p style="margin:0 0 16px 0;font-size:14px;color:#4b5563">
        <strong>Od:</strong> {{customerName}} ({{customerEmail}})
    </p>
    <p style="margin:0;color:#1f2937;line-height:1.6">
        {{message}}
    </p>
</div>
        `
    }
};

export const EMAIL_BASE_LAYOUT = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;color:#1f2937">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="padding:40px 20px">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:white;border-radius:32px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.03)">
                    <!-- Header / Logo -->
                    <tr>
                        <td align="center" style="padding:48px 40px 24px 40px;">
                            <img src="https://www.drinkboostup.cz/logo.png" alt="BoostUp" width="200" border="0" style="display:block;height:auto;">
                        </td>
                    </tr>
                    
                    <!-- Body Content -->
                    <tr>
                        <td align="center" style="padding:32px 40px 48px 40px;line-height:1.6;font-size:16px;text-align:center;">
                            <div style="color:#1f2937;">
                                {{content_html}}
                            </div>
                        </td>
                    </tr>
                </table>
                
                <!-- Footer -->
                <table width="600" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center" style="padding:32px 40px;font-size:13px;color:#4b5563">
                            <p style="margin:0 0 8px 0;font-weight:500">BoostUp &middot; Chaloupkova 3002/1a &middot; 612 00 Brno</p>
                            <p style="margin:0">
                                <a href="https://www.drinkboostup.cz" style="color:#3a572c;text-decoration:none;font-weight:700">drinkboostup.cz</a>
                                &nbsp;&nbsp;&middot;&nbsp;&nbsp;
                                <a href="mailto:info@drinkboostup.cz" style="color:#3a572c;text-decoration:none;font-weight:500">info@drinkboostup.cz</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
