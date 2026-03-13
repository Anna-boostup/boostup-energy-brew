import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { getTextStyle } from '@/lib/textStyles';

interface ConceptDetailDialogProps {
    selectedConcept: any;
    onClose: () => void;
    SITE_CONTENT: any;
}

export const ConceptDetailDialog: React.FC<ConceptDetailDialogProps> = ({
    selectedConcept,
    onClose,
    SITE_CONTENT
}) => {
    if (!selectedConcept) return null;

    return (
        <Dialog open={!!selectedConcept} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl bg-card border-2 border-border">
                <DialogHeader className="text-left">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-2xl ${selectedConcept.bgColor} flex items-center justify-center shadow-lg`}>
                            <selectedConcept.Icon className={`w-8 h-8 ${selectedConcept.textColor}`} />
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-display font-black text-foreground" style={getTextStyle(SITE_CONTENT, `concept3b.${selectedConcept.id}.title`)}>
                                {selectedConcept.title}
                            </DialogTitle>
                            <p className="text-sm text-foreground/70 font-bold tracking-widest" style={getTextStyle(SITE_CONTENT, `concept3b.${selectedConcept.id}.subtitle`)}>
                                {selectedConcept.subtitle}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mb-6">
                    <p className="text-xl font-medium text-foreground leading-relaxed italic border-l-4 border-primary pl-4" style={getTextStyle(SITE_CONTENT, `concept3b.${selectedConcept.id}.description`)}>
                        {selectedConcept.description}
                    </p>
                </div>

                <DialogDescription asChild>
                    <div className="text-foreground space-y-4 text-base leading-relaxed" style={getTextStyle(SITE_CONTENT, `concept3b.${selectedConcept.id}.fullDescription`)}>
                        {selectedConcept.fullDescription.split('\n').map((line: string, i: number) => {
                            const trimmedLine = line.trim();
                            if (!trimmedLine) return null;
                            if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                                return (
                                    <h4 key={i} className="font-bold text-lg mt-6 mb-2 text-foreground" style={getTextStyle(SITE_CONTENT, `concept3b.${selectedConcept.id}.fullDescription`)}>
                                        {trimmedLine.replace(/\*\*/g, '')}
                                    </h4>
                                );
                            }
                            if (trimmedLine.startsWith('•')) {
                                return (
                                    <p key={i} className="pl-4 text-muted-foreground" style={getTextStyle(SITE_CONTENT, `concept3b.${selectedConcept.id}.fullDescription`)}>
                                        {trimmedLine}
                                    </p>
                                );
                            }
                            return (
                                <p key={i} className="text-foreground/80 leading-relaxed" style={getTextStyle(SITE_CONTENT, `concept3b.${selectedConcept.id}.fullDescription`)}>
                                    {trimmedLine}
                                </p>
                            );
                        })}
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};
