import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Zpráva odeslána!",
      description: "Děkujeme za váš zájem. Brzy se vám ozveme.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="kontakt" className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Kontakt
          </h2>
          <div className="flex flex-col md:flex-row justify-center gap-6 text-primary-foreground/80">
            <a href="tel:+420777333327" className="flex items-center justify-center gap-2 hover:text-primary-foreground transition-colors">
              <Phone className="w-4 h-4" />
              Telefonní číslo: 777 333 327
            </a>
            <a href="mailto:boostupteam@email.com" className="flex items-center justify-center gap-2 hover:text-primary-foreground transition-colors">
              <Mail className="w-4 h-4" />
              E-mail: boostupteam@email.com
            </a>
          </div>
          <div className="mt-4 text-primary-foreground/60 text-sm">
            <p>Výrobce: AB Quattro</p>
            <p>Distributor: Mendlova univerzita</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-xl mx-auto bg-background rounded-2xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-foreground font-display font-semibold text-xl mb-2 text-center">
            Rádi uslyšíme vaše názory a zodpovíme dotazy
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                Jméno
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Vaše jméno"
                required
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vas@email.cz"
                required
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-1">
                Zpráva
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Vaše zpráva..."
                rows={4}
                required
                className="bg-secondary border-border resize-none"
              />
            </div>
            <Button type="submit" variant="hero" className="w-full">
              Odeslat
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
