import { useContent } from "@/context/ContentContext";
import { Button } from "./ui/button";
import { Phone, Mail, MapPin, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ContactSection = () => {
  const { content: SITE_CONTENT } = useContent();
  const content = SITE_CONTENT.contact;
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: content.toast.success.title,
      description: content.toast.success.description,
    });
  };

  return (
    <section id="kontakt" className="py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Contact Info */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-full text-sm font-bold mb-6">
                <MessageSquare className="w-4 h-4" />
                {content.title}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-foreground mb-8 leading-tight">
                {content.headline}
              </h2>
              <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
                {content.description}
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{content.info.phone.label}</p>
                    <p className="text-xl font-display font-bold">{content.info.phone.value}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{content.info.email.label}</p>
                    <p className="text-xl font-display font-bold">{content.info.email.value}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{content.info.address.label}</p>
                    <p className="text-xl font-display font-bold leading-relaxed">
                      {content.info.address.value.line1}<br />
                      {content.info.address.value.line2}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-card p-8 lg:p-12 rounded-[2rem] border-2 border-border shadow-soft animate-fade-up animation-delay-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">{content.form.name.label}</label>
                    <input
                      required
                      type="text"
                      className="w-full px-6 py-4 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-all"
                      placeholder={content.form.name.placeholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">{content.form.email.label}</label>
                    <input
                      required
                      type="email"
                      className="w-full px-6 py-4 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-all"
                      placeholder={content.form.email.placeholder}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">{content.form.message.label}</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-6 py-4 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-all resize-none"
                    placeholder={content.form.message.placeholder}
                  ></textarea>
                </div>
                <Button variant="hero" type="submit" className="w-full group">
                  {content.form.submit}
                  <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
