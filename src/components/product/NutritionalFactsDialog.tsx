
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

interface NutritionalFactsDialogProps {
  flavorName: string;
  data: string;
}

const NutritionalFactsDialog = ({ flavorName, data }: NutritionalFactsDialogProps) => {
  const rows = data.split('\n').map(line => {
    const [label, value] = line.split(':');
    return { label: label?.trim(), value: value?.trim() };
  }).filter(row => row.label && row.value);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-[10px] font-bold underline decoration-dotted underline-offset-2 opacity-60 hover:opacity-100 transition-opacity uppercase tracking-wider py-1 px-1">
          Nutriční hodnoty
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-2 border-border rounded-3xl p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-black text-foreground mb-2">
            NUTRIČNÍ HODNOTY
          </DialogTitle>
          <p className="text-sm font-bold text-primary tracking-widest uppercase">{flavorName}</p>
        </DialogHeader>

        <div className="mt-6 rounded-2xl border border-border overflow-hidden bg-background">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-xs text-foreground py-3">Typ</TableHead>
                <TableHead className="font-bold text-xs text-foreground text-right py-3">Množství (60ml)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i} className="border-border hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-sm py-3">{row.label}</TableCell>
                  <TableCell className="text-right font-bold text-sm py-3">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="mt-6 text-[10px] text-muted-foreground leading-relaxed">
          * Referenční hodnota příjmu u průměrné dospělé osoby (8 400 kJ / 2 000 kcal).
          Skladujte v suchu při teplotě do 25 °C. Po otevření ihned spotřebujte.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default NutritionalFactsDialog;
