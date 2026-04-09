import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/context/ContentContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, Save, Shield, ShoppingBag, RefreshCw, Mail, Fingerprint, MapPin, CreditCard, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountOrders from "@/pages/account/Orders";
import Subscriptions from "@/pages/account/Subscriptions";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const AdminProfile = () => {
    const { user, profile } = useAuth();
    const { content } = useContent();
    const { toast } = useToast();

    // Profile info state
    const [fullName, setFullName] = useState(profile?.full_name || "");
    const [phone, setPhone] = useState(profile?.address?.delivery?.phone || "");
    
    // Address state
    const [deliveryStreet, setDeliveryStreet] = useState(profile?.address?.delivery?.street || "");
    const [deliveryHouseNumber, setDeliveryHouseNumber] = useState(profile?.address?.delivery?.houseNumber || "");
    const [deliveryCity, setDeliveryCity] = useState(profile?.address?.delivery?.city || "");
    const [deliveryZip, setDeliveryZip] = useState(profile?.address?.delivery?.zip || "");
    
    // Billing state
    const [billingSame, setBillingSame] = useState(profile?.address?.billing?.isSame !== false);
    const [isCompany, setIsCompany] = useState(profile?.address?.billing?.isCompany === true);
    const [billingCompany, setBillingCompany] = useState(profile?.address?.billing?.company || "");
    const [billingICO, setBillingICO] = useState(profile?.address?.billing?.ico || "");
    const [billingDIC, setBillingDIC] = useState(profile?.address?.billing?.dic || "");
    const [billingStreet, setBillingStreet] = useState(profile?.address?.billing?.street || "");
    const [billingHouseNumber, setBillingHouseNumber] = useState(profile?.address?.billing?.houseNumber || "");
    const [billingCity, setBillingCity] = useState(profile?.address?.billing?.city || "");
    const [billingZip, setBillingZip] = useState(profile?.address?.billing?.zip || "");

    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSavingProfile(true);
        try {
            const addressData = {
                delivery: {
                    street: deliveryStreet,
                    houseNumber: deliveryHouseNumber,
                    city: deliveryCity,
                    zip: deliveryZip,
                    phone: phone,
                },
                billing: {
                    isSame: billingSame,
                    isCompany: isCompany,
                    company: billingCompany,
                    ico: billingICO,
                    dic: billingDIC,
                    street: billingSame ? deliveryStreet : billingStreet,
                    houseNumber: billingSame ? deliveryHouseNumber : billingHouseNumber,
                    city: billingSame ? deliveryCity : billingCity,
                    zip: billingSame ? deliveryZip : billingZip,
                }
            };

            const { error } = await supabase
                .from("profiles")
                .update({ 
                    full_name: fullName,
                    address: addressData
                })
                .eq("id", user.id);
            if (error) throw error;
            toast({ title: content?.admin?.profile?.form?.success || "Saved", description: content?.admin?.profile?.form?.successDesc });
        } catch (error: any) {
            toast({ title: content?.admin?.profile?.form?.generalError || "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast({ title: content?.admin?.profile?.security?.errors?.mismatchTitle || "Error", description: content?.admin?.profile?.security?.errors?.mismatchDesc, variant: "destructive" });
            return;
        }
        if (newPassword.length < 8) {
            toast({ title: content?.admin?.profile?.security?.errors?.tooShortTitle || "Error", description: content?.admin?.profile?.security?.errors?.tooShortDesc, variant: "destructive" });
            return;
        }

        setIsChangingPassword(true);
        try {
            // Re-authenticate with current password first
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: currentPassword,
            });
            if (signInError) throw new Error(content?.admin?.profile?.security?.errors?.wrongCurrent || "Wrong password");

            // Then update password
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            toast({ title: content?.admin?.profile?.security?.success || "Updated", description: content?.admin?.profile?.security?.successDesc });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast({ title: content?.admin?.profile?.security?.errorTitle || "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="space-y-16 pb-32 animate-in fade-in duration-1000">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-start gap-4 sm:gap-8">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[1.8rem] sm:rounded-[2.5rem] bg-olive-dark flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-lime/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-white relative z-10" />
                    </div>
                    <div className="space-y-1 sm:space-y-3">
                        <h1 className="text-3xl sm:text-6xl font-black text-olive-dark tracking-tighter font-display uppercase italic leading-none">{content?.admin?.profile?.title || "My Profile"}</h1>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                            <p className="text-brand-muted font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px]">
                                {content?.admin?.profile?.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-12">
                <div className="p-1.5 sm:p-2 bg-olive-dark rounded-[2rem] sm:rounded-[2.5rem] w-full md:w-fit shadow-2xl overflow-hidden">
                    <TabsList className="bg-transparent h-auto p-0.5 sm:p-1 gap-1 sm:gap-2 flex sm:flex-nowrap overflow-x-auto no-scrollbar">
                        <TabsTrigger value="profile" className="flex-1 sm:flex-initial gap-2 sm:gap-3 px-4 sm:px-10 py-4 sm:py-5 rounded-[1.8rem] sm:rounded-[2.2rem] font-black uppercase text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] text-white/40 data-[state=active]:bg-lime data-[state=active]:text-olive-dark transition-all duration-500 border-none shadow-none data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20 whitespace-nowrap">
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{content?.admin?.profile?.tabs?.info || "Info"}</span>
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="flex-1 sm:flex-initial gap-2 sm:gap-3 px-4 sm:px-10 py-4 sm:py-5 rounded-[1.8rem] sm:rounded-[2.2rem] font-black uppercase text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] text-white/40 data-[state=active]:bg-lime data-[state=active]:text-olive-dark transition-all duration-500 border-none shadow-none data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20 whitespace-nowrap">
                            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{content?.admin?.profile?.tabs?.orders || "Orders"}</span>
                        </TabsTrigger>
                        <TabsTrigger value="subscriptions" className="flex-1 sm:flex-initial gap-2 sm:gap-3 px-4 sm:px-10 py-4 sm:py-5 rounded-[1.8rem] sm:rounded-[2.2rem] font-black uppercase text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] text-white/40 data-[state=active]:bg-lime data-[state=active]:text-olive-dark transition-all duration-500 border-none shadow-none data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20 whitespace-nowrap">
                            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{content?.admin?.profile?.tabs?.subscriptions || "Subscriptions"}</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="profile" className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-0">
                    {/* Profile Info Card */}
                    <div className="glass-card rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden border border-white/40 shadow-2xl h-full flex flex-col">
                        <div className="bg-olive-dark p-6 sm:p-10 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-lime/10 rounded-xl">
                                    <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase italic tracking-tight">{content?.admin?.profile?.form?.personal || "Personal"}</h3>
                            </div>
                            <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">{content?.admin?.profile?.form?.personalDesc}</p>
                        </div>
                        <div className="p-6 sm:p-10 flex-1">
                            <form onSubmit={handleSaveProfile} className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark pl-1">Email</Label>
                                    <div className="relative group/input">
                                        <Input
                                            id="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="h-16 pl-14 rounded-2xl border-none bg-olive-dark/5 text-olive-dark/60 font-medium cursor-not-allowed italic"
                                        />
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-dark/20" />
                                    </div>
                                    <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest pl-1">{content?.admin?.profile?.form?.emailNote}</p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark pl-1">{content?.admin?.profile?.form?.phone || "Phone"}</Label>
                                    <div className="relative group/input">
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+420..."
                                            className="h-16 pl-14 rounded-2xl border-2 border-transparent bg-white shadow-xl shadow-background/50 focus-visible:ring-lime focus-visible:border-lime transition-all font-display font-black text-lg text-olive-dark"
                                        />
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-dark/20 group-focus-within/input:text-white transition-colors" />
                                    </div>
                                </div>

                                <Separator className="bg-olive-dark/10" />

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-lime/10 rounded-xl">
                                            <MapPin className="w-5 h-5 text-olive-dark" />
                                        </div>
                                        <h4 className="text-sm font-black text-olive-dark uppercase tracking-widest">{content?.admin?.profile?.form?.address || "Address"}</h4>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="deliveryStreet" className="text-[9px] font-black uppercase tracking-widest text-olive-dark/40 ml-1">{content?.admin?.profile?.form?.street}</Label>
                                            <Input id="deliveryStreet" value={deliveryStreet} onChange={e => setDeliveryStreet(e.target.value)} className="h-14 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="deliveryHouseNumber" className="text-[9px] font-black uppercase tracking-widest text-olive-dark/40 ml-1">{content?.admin?.profile?.form?.houseNumber}</Label>
                                            <Input id="deliveryHouseNumber" value={deliveryHouseNumber} onChange={e => setDeliveryHouseNumber(e.target.value)} className="h-14 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="deliveryCity" className="text-[9px] font-black uppercase tracking-widest text-olive-dark/40 ml-1">{content?.admin?.profile?.form?.city}</Label>
                                            <Input id="deliveryCity" value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)} className="h-14 rounded-xl" />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="deliveryZip" className="text-[9px] font-black uppercase tracking-widest text-olive-dark/40 ml-1">{content?.admin?.profile?.form?.zip}</Label>
                                            <Input id="deliveryZip" value={deliveryZip} onChange={e => setDeliveryZip(e.target.value)} className="h-14 rounded-xl" />
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-olive-dark/10" />

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-lime/10 rounded-xl">
                                                <CreditCard className="w-5 h-5 text-olive-dark" />
                                            </div>
                                            <h4 className="text-sm font-black text-olive-dark uppercase tracking-widest">{content?.admin?.profile?.form?.billing || "Billing"}</h4>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-olive-dark/5 px-4 py-2 rounded-xl">
                                            <Checkbox
                                                id="billingSame"
                                                checked={billingSame}
                                                onCheckedChange={(checked) => setBillingSame(checked as boolean)}
                                            />
                                            <Label htmlFor="billingSame" className="text-[9px] font-black uppercase tracking-widest cursor-pointer">{content?.admin?.profile?.form?.isSame}</Label>
                                        </div>
                                    </div>

                                    {!billingSame && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label htmlFor="billingStreet" className="text-[9px] font-black uppercase tracking-widest text-olive-dark/40 ml-1">{content?.admin?.profile?.form?.billingStreet}</Label>
                                                <Input id="billingStreet" value={billingStreet} onChange={e => setBillingStreet(e.target.value)} className="h-14 rounded-xl" />
                                            </div>
                                            <div className="space-y-2 text-white-dark">
                                                <Label htmlFor="billingHouseNumber" className="text-[9px] font-black uppercase tracking-widest text-olive-dark/40 ml-1">{content?.admin?.profile?.form?.billingHouseNumber}</Label>
                                                <Input id="billingHouseNumber" value={billingHouseNumber} onChange={e => setBillingHouseNumber(e.target.value)} className="h-14 rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="billingCity" className="text-[9px] font-black uppercase tracking-widest text-olive-dark/40 ml-1">{content?.admin?.profile?.form?.billingCity}</Label>
                                                <Input id="billingCity" value={billingCity} onChange={e => setBillingCity(e.target.value)} className="h-14 rounded-xl" />
                                            </div>
                                            <div className="space-y-2 sm:col-span-2">
                                                <Label htmlFor="billingZip" className="text-[9px] font-black uppercase tracking-widest text-olive-dark/40 ml-1">{content?.admin?.profile?.form?.billingZip}</Label>
                                                <Input id="billingZip" value={billingZip} onChange={e => setBillingZip(e.target.value)} className="h-14 rounded-xl" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2 bg-olive-dark/5 px-4 py-2 rounded-xl w-fit">
                                        <Checkbox
                                            id="isCompany"
                                            checked={isCompany}
                                            onCheckedChange={(checked) => setIsCompany(checked as boolean)}
                                        />
                                        <Label htmlFor="isCompany" className="text-[9px] font-black uppercase tracking-widest cursor-pointer">{content?.admin?.profile?.form?.isCompany}</Label>
                                    </div>

                                    {isCompany && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2 sm:col-span-2 font-white-dark">
                                                <Label htmlFor="billingCompany" className="text-[9px] font-black uppercase tracking-widest text-olive-dark/40 ml-1">{content?.admin?.profile?.form?.billingCompany}</Label>
                                                <Input id="billingCompany" value={billingCompany} onChange={e => setBillingCompany(e.target.value)} className="h-14 rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="billingICO" className="text-[9px] font-black uppercase tracking-widest text-olive-dark/40 ml-1">{content?.admin?.profile?.form?.ico}</Label>
                                                <Input id="billingICO" value={billingICO} onChange={e => setBillingICO(e.target.value)} className="h-14 rounded-xl" />
                                            </div>
                                            <div className="space-y-2 text-white-dark">
                                                <Label htmlFor="billingDIC" className="text-[9px] font-black uppercase tracking-widest text-olive-dark/40 ml-1">{content?.admin?.profile?.form?.dic}</Label>
                                                <Input id="billingDIC" value={billingDIC} onChange={e => setBillingDIC(e.target.value)} className="h-14 rounded-xl" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={isSavingProfile}
                                    className="w-full h-14 sm:h-16 bg-olive-dark hover:bg-black text-white font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] rounded-2xl shadow-2xl shadow-olive/20 transition-all hover:scale-[1.02] active:scale-95 gap-3"
                                >
                                    {isSavingProfile ? <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Save className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    {content?.admin?.profile?.form?.save || "Save Profile"}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Password Change Card */}
                    <div className="glass-card rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden border border-white/40 shadow-2xl h-full flex flex-col">
                        <div className="bg-olive-dark p-6 sm:p-10 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-lime/10 rounded-xl">
                                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase italic tracking-tight">{content?.admin?.profile?.security?.password || "Password"}</h3>
                            </div>
                            <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">{content?.admin?.profile?.security?.passwordDesc}</p>
                        </div>
                        <div className="p-6 sm:p-10 flex-1">
                            <form onSubmit={handleChangePassword} className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="currentPassword" title={content?.admin?.profile?.security?.current} className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark pl-1">{content?.admin?.profile?.security?.current || "Current Password"}</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-16 px-6 rounded-2xl border-2 border-transparent bg-white shadow-xl shadow-background/50 focus-visible:ring-lime transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="newPassword" title={content?.admin?.profile?.security?.new} className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark pl-1">{content?.admin?.profile?.security?.new || "New Password"}</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder={content?.admin?.profile?.security?.errors?.tooShortDesc || "••••••••"}
                                        className="h-16 px-6 rounded-2xl border-2 border-transparent bg-white shadow-xl shadow-background/50 focus-visible:ring-lime transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="confirmPassword" title={content?.admin?.profile?.security?.confirm} className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark pl-1">{content?.admin?.profile?.security?.confirm || "Confirm Password"}</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={content?.admin?.profile?.security?.confirm || "••••••••"}
                                        className="h-16 px-6 rounded-2xl border-2 border-transparent bg-white shadow-xl shadow-background/50 focus-visible:ring-lime transition-all"
                                        required
                                    />
                                    {newPassword && confirmPassword && (
                                        <div className="flex items-center gap-2 pl-1">
                                            {newPassword !== confirmPassword ? (
                                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{content?.admin?.profile?.security?.errors?.mismatchTitle}</p>
                                            ) : (
                                                <p className="text-[10px] text-white-dark font-bold uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                                                    <Fingerprint className="w-3 h-3" />
                                                    {content?.admin?.profile?.security?.matchNote || "Passwords match"}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={isChangingPassword || !newPassword || newPassword !== confirmPassword}
                                    className="w-full h-14 sm:h-16 bg-olive-dark hover:bg-black text-white font-black uppercase text-[10px] sm:text-xs tracking-[0.3em] rounded-2xl shadow-2xl shadow-olive/20 transition-all hover:scale-[1.02] active:scale-95 gap-3"
                                >
                                    {isChangingPassword ? <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    {content?.admin?.profile?.security?.update || "Update Password"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="orders" className="mt-0 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="glass-card rounded-[2.5rem] sm:rounded-[3.5rem] p-2 sm:p-4 overflow-hidden border border-white/40 shadow-2xl">
                        <AccountOrders />
                    </div>
                </TabsContent>

                <TabsContent value="subscriptions" className="mt-0 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="glass-card rounded-[2.5rem] sm:rounded-[3.5rem] p-2 sm:p-4 overflow-hidden border border-white/40 shadow-2xl">
                        <Subscriptions />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminProfile;
