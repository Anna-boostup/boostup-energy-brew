import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../logic/cartState';
import { ArrowLeft, ShoppingBag, CreditCard, Truck, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import mockPaymentService from '../../services/mockPayment';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [orderComplete, setOrderComplete] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '+420 ',
        street: '',
        city: '',
        zip: '',
        paymentMethod: 'card'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // Vytvořit objednávku
            const orderNumber = `ORD-${Date.now()}`;

            // Volání mock platební služby
            const paymentResult = await mockPaymentService.createPayment({
                orderNumber: orderNumber,
                total: cartTotal,
                items: cart,
                customer: formData
            });

            if (paymentResult.success) {
                // Úspěšná platba
                clearCart();
                navigate(`/payment/success?paymentId=${paymentResult.paymentId}&orderNumber=${orderNumber}&amount=${cartTotal}`);
            } else {
                // Neúspěšná platba
                navigate(`/payment/error?message=${encodeURIComponent(paymentResult.message)}`);
            }
        } catch (error) {
            console.error('Payment error:', error);
            navigate('/payment/error?message=Technická%20chyba%20při%20zpracování%20platby');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Speciální validace pro telefon
        if (name === 'phone') {
            // Povolit pouze +, číslice a mezery
            const filteredValue = value.replace(/[^\d+\s]/g, '');
            setFormData({
                ...formData,
                [name]: filteredValue
            });
            return;
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl p-12 max-w-2xl w-full text-center shadow-2xl"
                >
                    <div className="mb-8">
                        <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
                        <h1 className="text-4xl font-black uppercase italic tracking-tight mb-4">
                            OBJEDNÁVKA PŘIJATA!
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Děkujeme za vaši objednávku. Potvrzení jsme vám zaslali na email{' '}
                            <span className="font-bold text-primary">{formData.email}</span>
                        </p>
                    </div>
                    <div className="bg-secondary/10 rounded-2xl p-6 mb-8">
                        <p className="text-sm text-muted-foreground mb-2">Číslo objednávky</p>
                        <p className="text-2xl font-black">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary hover:bg-primary/90 text-white font-bold px-12 py-4 rounded-2xl transition-all hover:scale-105"
                    >
                        Zpět na hlavní stránku
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-primary/10 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 font-bold mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Zpět do košíku
                    </button>
                    <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight">
                        POKLADNA
                    </h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 shadow-xl sticky top-8">
                            <h2 className="text-2xl font-black uppercase italic mb-6 flex items-center gap-3">
                                <ShoppingBag size={24} className="text-primary" />
                                Vaše objednávka
                            </h2>

                            <div className="space-y-4 mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 pb-4 border-b border-border/30">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-xl"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.quantity}x {item.price} Kč
                                            </p>
                                        </div>
                                        <div className="font-bold text-accent">
                                            {item.price * item.quantity} Kč
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4 border-t-2 border-primary/20">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Mezisoučet</span>
                                    <span className="font-bold">{cartTotal} Kč</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Doprava</span>
                                    <span className="font-bold text-green-600">Zdarma</span>
                                </div>
                                <div className="flex justify-between text-2xl font-black pt-3 border-t border-border/30">
                                    <span>Celkem</span>
                                    <span className="text-accent">{cartTotal} Kč</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Delivery Information */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                                        <Truck size={24} className="text-primary" />
                                        Dodací údaje
                                    </h2>
                                    <span className="text-xs text-muted-foreground italic">* Povinné pole</span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-muted-foreground">
                                            Jméno *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-muted-foreground">
                                            Příjmení *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-muted-foreground">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-muted-foreground">
                                            Telefon *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="+420 000 000 000"
                                            pattern="(?:\+\d{1,3}|0\d{1,3})?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3,4}"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1 italic">
                                            Zadejte prosím číslo i s mezinárodní předvolbou (např. +420)
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-muted-foreground">
                                            Ulice a číslo popisné *
                                        </label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-muted-foreground">
                                            Město *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-muted-foreground">
                                            PSČ *
                                        </label>
                                        <input
                                            type="text"
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleChange}
                                            required
                                            pattern="[0-9]{3}\s?[0-9]{2}"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-colors"

                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl">
                                <h2 className="text-2xl font-black uppercase italic mb-6 flex items-center gap-3">
                                    <CreditCard size={24} className="text-primary" />
                                    Způsob platby
                                </h2>

                                <div className="space-y-4">
                                    {/* Digital Wallets */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-secondary/10 ${formData.paymentMethod === 'applepay' ? 'border-primary bg-secondary/5' : 'border-border'}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="applepay"
                                                checked={formData.paymentMethod === 'applepay'}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-lg"></span>
                                            </div>
                                            <p className="font-bold text-xs uppercase">Apple Pay</p>
                                        </label>

                                        <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-secondary/10 ${formData.paymentMethod === 'googlepay' ? 'border-primary bg-secondary/5' : 'border-border'}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="googlepay"
                                                checked={formData.paymentMethod === 'googlepay'}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <div className="w-12 h-12 bg-white border border-border rounded-lg flex items-center justify-center">
                                                <svg width="24" height="24" viewBox="0 0 24 24">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                </svg>
                                            </div>
                                            <p className="font-bold text-xs uppercase">Google Pay</p>
                                        </label>
                                    </div>

                                    {/* Standard Methods */}
                                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-secondary/10 ${formData.paymentMethod === 'card' ? 'border-primary bg-secondary/5' : 'border-border'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={formData.paymentMethod === 'card'}
                                            onChange={handleChange}
                                            className="w-5 h-5 accent-primary"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold">Platební karta</p>
                                            <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                                        </div>
                                    </label>

                                    <div className={`space-y-4 rounded-xl border-2 transition-all ${formData.paymentMethod === 'transfer' ? 'border-primary bg-secondary/5 p-4' : 'border-border p-4'}`}>
                                        <label className="flex items-center gap-4 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="transfer"
                                                checked={formData.paymentMethod === 'transfer'}
                                                onChange={handleChange}
                                                className="w-5 h-5 accent-primary"
                                            />
                                            <div className="flex-1">
                                                <p className="font-bold">Rychlý bankovní převod</p>
                                                <p className="text-sm text-muted-foreground">Okamžitá platba přes bankovní portál</p>
                                            </div>
                                        </label>

                                        {formData.paymentMethod === 'transfer' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2"
                                            >
                                                {[
                                                    { id: 'csas', name: 'Spořitelna', domain: 'csas.cz', color: 'bg-blue-600' },
                                                    { id: 'kb', name: 'KB', domain: 'kb.cz', color: 'bg-red-600' },
                                                    { id: 'csob', name: 'ČSOB', domain: 'csob.cz', color: 'bg-blue-800' },
                                                    { id: 'airbank', name: 'Air Bank', domain: 'airbank.cz', color: 'bg-green-500' },
                                                    { id: 'fio', name: 'Fio', domain: 'fio.cz', color: 'bg-blue-500' },
                                                    { id: 'raiffeisen', name: 'RB', domain: 'rb.cz', color: 'bg-yellow-400' },
                                                    { id: 'moneta', name: 'Moneta', domain: 'moneta.cz', color: 'bg-red-500' },
                                                    { id: 'mbank', name: 'mBank', domain: 'mbank.cz', color: 'bg-orange-500' }
                                                ].map((bank) => (
                                                    <button
                                                        key={bank.id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, subMethod: bank.id }))}
                                                        className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 group/bank ${formData.subMethod === bank.id ? 'border-primary bg-primary/10' : 'border-border bg-white hover:border-primary/50'}`}
                                                    >
                                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 border border-border/30 group-hover/bank:border-primary/20 transition-all overflow-hidden">
                                                            <img
                                                                src={`https://www.google.com/s2/favicons?domain=${bank.domain}&sz=128`}
                                                                alt={bank.name}
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                            <div className={`hidden w-full h-full ${bank.color} rounded flex items-center justify-center text-[10px] text-white font-bold`}>
                                                                {bank.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold truncate w-full text-center text-muted-foreground group-hover/bank:text-primary transition-colors">{bank.name}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>

                                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-secondary/10 ${formData.paymentMethod === 'cod' ? 'border-primary bg-secondary/5' : 'border-border'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleChange}
                                            className="w-5 h-5 accent-primary"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold">Dobírka</p>
                                            <p className="text-sm text-muted-foreground">Platba při převzetí (+ 50 Kč)</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full bg-accent hover:bg-accent/90 text-white font-black text-xl py-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl uppercase italic tracking-tight disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        Zpracování platby...
                                    </>
                                ) : (
                                    <>
                                        Dokončit objednávku • {cartTotal} Kč
                                    </>
                                )}
                            </button>

                            <p className="text-sm text-center text-muted-foreground">
                                Odesláním objednávky souhlasíte s{' '}
                                <a href="#" className="text-primary hover:underline">obchodními podmínkami</a>
                                {' '}a{' '}
                                <a href="#" className="text-primary hover:underline">zpracováním osobních údajů</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
