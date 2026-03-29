
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface IngredientsDialogProps {
  flavorName: string;
  ingredients: string;
}

const IngredientsDialog = ({ flavorName, ingredients }: IngredientsDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-[10px] font-bold underline decoration-dotted underline-offset-2 opacity-60 hover:opacity-100 transition-opacity uppercase tracking-wider py-1 px-1">
          Složení
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-2 border-border rounded-3xl p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-black text-foreground mb-1">
            SLOŽENÍ
          </DialogTitle>
          <p className="text-sm font-bold text-primary tracking-widest uppercase">{flavorName}</p>
        </DialogHeader>

        <div className="mt-6 p-6 rounded-2xl border border-border bg-background/50 leading-relaxed text-sm text-foreground/90 font-medium">
          {ingredients}
        </div>

        <p className="mt-6 text-[10px] text-muted-foreground leading-relaxed italic">
          * Složení se může mírně lišit v závislosti na šarži. Vždy kontrolujte údaje na obalu výrobku.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientsDialog;
