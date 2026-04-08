import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Info, FlaskConical, Gauge } from "lucide-react";

interface SpecRow {
  label: string;
  value?: string;
  per100?: string;
  perPortion?: string;
  rhp?: string;
}

interface ProductSpecs {
  basicInfo: SpecRow[];
  nutrition: SpecRow[];
  vitamins: SpecRow[];
  activeSubstances: SpecRow[];
}

interface ProductSpecsDialogProps {
  flavorName: string;
  specs: ProductSpecs;
  isSelected?: boolean;
  flavorId?: string;
}

const ProductSpecsDialog = ({ flavorName, specs, isSelected, flavorId }: ProductSpecsDialogProps) => {
  if (!specs) return null;

  const getTriggerStyles = () => {
    if (!isSelected) {
      return "text-primary bg-primary/5 border-primary/10 hover:border-primary/30";
    }

    switch (flavorId) {
      case 'lemon':
        return "text-primary bg-white/40 border-primary/20 hover:bg-white/60";
      case 'red':
      case 'silky':
        return "text-white bg-white/10 border-white/30 hover:bg-white/20";
      default:
        return "text-primary bg-primary/5 border-primary/10";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={`flex items-center gap-1.5 text-[10px] font-black transition-all uppercase tracking-widest py-1.5 px-2 rounded-lg border ${getTriggerStyles()}`}>
          <FileText className="w-3 h-3" />
          Složení a nutriční fakta
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-none rounded-[2rem] p-0 shadow-2xl">
        <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-xl border-b border-border/10 p-8 pb-4">
          <DialogHeader>
            <div className="flex items-baseline gap-3 mb-1">
               <DialogTitle className="text-3xl font-display font-black text-foreground tracking-tighter uppercase italic">
                KOMPLETNÍ FAKTA
              </DialogTitle>
              <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase opacity-80">{flavorName}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Oficiální specifikace produktu a nutriční profil</p>
          </DialogHeader>
        </div>

        <div className="p-8 pt-4 space-y-10">
          {/* Section 1: Základní údaje */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Info className="w-4 h-4" />
              <h4 className="text-sm font-black tracking-widest uppercase">Základní údaje</h4>
            </div>
            <div className="rounded-2xl border border-border/10 overflow-hidden bg-background/50">
              <Table>
                <TableBody>
                  {specs.basicInfo.map((row, i) => (
                    <TableRow key={i} className="border-border/5 hover:bg-primary/5 transition-colors">
                      <TableCell className="w-1/3 font-bold text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/20 py-3 px-4">
                        {row.label}
                      </TableCell>
                      <TableCell className="text-sm font-medium py-3 px-4 leading-relaxed whitespace-pre-wrap">
                        {row.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Section 2: Nutriční hodnoty */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Gauge className="w-4 h-4" />
              <h4 className="text-sm font-black tracking-widest uppercase">Nutriční hodnoty</h4>
            </div>
            <div className="rounded-2xl border border-border/10 overflow-hidden bg-background/50">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border/10 hover:bg-transparent">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-3 px-4">Položka</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-right py-3 px-4">Na 100 ml</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-right py-3 px-4">Na 60 ml / 1 porce</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-right py-3 px-4">RHP*</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specs.nutrition.map((row, i) => (
                    <TableRow key={i} className="border-border/5 hover:bg-primary/5 transition-colors">
                      <TableCell className={`text-sm font-bold py-3 px-4 ${row.label.startsWith('z toho') ? 'pl-8 font-medium italic opacity-80' : ''}`}>
                        {row.label}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium py-3 px-4">{row.per100}</TableCell>
                      <TableCell className="text-right text-sm font-black py-3 px-4 text-primary">{row.perPortion}</TableCell>
                      <TableCell className="text-right text-[11px] font-bold py-3 px-4 text-muted-foreground">{row.rhp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Section 3: Vitamíny a minerální látky */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <FlaskConical className="w-4 h-4" />
              <h4 className="text-sm font-black tracking-widest uppercase">Vitamíny a minerální látky</h4>
            </div>
            <div className="rounded-2xl border border-border/10 overflow-hidden bg-background/50">
              <Table>
                <TableHeader className="bg-muted/50">
                   <TableRow className="border-border/10 hover:bg-transparent">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-3 px-4">Složka</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-right py-3 px-4">Na 100 ml</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-right py-3 px-4">Na 60 ml</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-right py-3 px-4">RHP*</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specs.vitamins.map((row, i) => (
                    <TableRow key={i} className="border-border/5 hover:bg-primary/5 transition-colors">
                      <TableCell className="text-sm font-bold py-3 px-4">{row.label}</TableCell>
                      <TableCell className="text-right text-sm font-medium py-3 px-4">{row.per100}</TableCell>
                      <TableCell className="text-right text-sm font-black py-3 px-4 text-primary">{row.perPortion}</TableCell>
                      <TableCell className="text-right text-[11px] font-black py-3 px-4 bg-primary/5 text-primary">
                        {row.rhp}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Section 4: Ostatní látky */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-sm font-black tracking-widest uppercase">Ostatní látky</h4>
            </div>
            <div className="rounded-2xl border border-border/10 overflow-hidden bg-background/50">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border/10 hover:bg-transparent">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-3 px-4">Substance</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-right py-3 px-4">Na 100 ml</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-right py-3 px-4">Na 60 ml</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specs.activeSubstances.map((row, i) => (
                    <TableRow key={i} className="border-border/5 hover:bg-primary/5 transition-colors">
                      <TableCell className={`text-sm font-bold py-3 px-4 ${row.label.startsWith('z toho') ? 'pl-8 font-medium italic opacity-80' : ''}`}>
                        {row.label}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium py-3 px-4">{row.per100}</TableCell>
                      <TableCell className="text-right text-sm font-black py-3 px-4 text-primary">{row.perPortion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <div className="p-6 bg-muted/30 rounded-2xl border border-border/10">
            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              *RHP - referenční hodnota příjmu pro průměrnou dospělou osobu (8400 kJ / 2000 kcal).
              NE - niacin ekvivalent.
              Vyrobeno v souladu s nejpřísnějšími standardy kvality v České republice.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Add icon import for sparkles
import { Sparkles } from "lucide-react";

export default ProductSpecsDialog;
