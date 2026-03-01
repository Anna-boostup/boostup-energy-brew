import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_FONTS } from '@/hooks/useDynamicFonts';
import type { TextStyle } from '@/lib/textStyles';

interface StyledTextFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    style: TextStyle;
    onStyleChange: (style: TextStyle) => void;
    multiline?: boolean;
    rows?: number;
    placeholder?: string;
    id?: string;
}

const FONT_SIZES = ['10', '11', '12', '13', '14', '15', '16', '17', '18', '20', '22', '24', '28', '32', '36', '40', '48', '56', '64', '72'];

const StyledTextField: React.FC<StyledTextFieldProps> = ({
    label,
    value,
    onChange,
    style,
    onStyleChange,
    multiline = false,
    rows = 3,
    placeholder,
    id,
}) => {
    const isBold = style.fontWeight === '700' || style.fontWeight === 'bold' || style.fontWeight === '800' || style.fontWeight === '900';
    const isItalic = style.fontStyle === 'italic';

    const previewStyle: React.CSSProperties = {
        fontFamily: style.fontFamily ? `"${style.fontFamily}", system-ui, sans-serif` : undefined,
        fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
        fontWeight: (style.fontWeight || undefined) as any,
        fontStyle: (style.fontStyle || undefined) as any,
    };

    return (
        <div className="grid gap-1">
            <Label
                htmlFor={id}
                className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-0.5"
            >
                {label}
            </Label>

            {/* Single unified card: toolbar + input */}
            <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary/40 transition-all duration-200">

                {/* Toolbar strip */}
                <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-muted/40 border-b border-border">
                    {/* Font family */}
                    <Select
                        value={style.fontFamily || 'Poppins'}
                        onValueChange={(v) => onStyleChange({ ...style, fontFamily: v })}
                    >
                        <SelectTrigger className="h-7 text-xs w-36 border border-border/60 bg-background shadow-none rounded-md">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {AVAILABLE_FONTS.map(f => (
                                <SelectItem key={f.name} value={f.name} className="text-xs">
                                    <span style={{ fontFamily: `"${f.name}", sans-serif` }}>{f.name}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Font size */}
                    <Select
                        value={style.fontSize || ''}
                        onValueChange={(v) => onStyleChange({ ...style, fontSize: v === '__clear__' ? '' : v })}
                    >
                        <SelectTrigger className="h-7 text-xs w-20 border border-border/60 bg-background shadow-none rounded-md">
                            <SelectValue placeholder="Vel." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__clear__" className="text-xs text-muted-foreground">Výchozí</SelectItem>
                            {FONT_SIZES.map(s => (
                                <SelectItem key={s} value={s} className="text-xs">{s}px</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Separator */}
                    <div className="h-5 w-px bg-border/60 mx-0.5" />

                    {/* Bold */}
                    <Button
                        type="button"
                        variant={isBold ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 w-7 p-0 text-sm font-black rounded-md"
                        onClick={() => onStyleChange({ ...style, fontWeight: isBold ? '' : '700' })}
                        title="Tučné"
                    >
                        B
                    </Button>

                    {/* Italic */}
                    <Button
                        type="button"
                        variant={isItalic ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 w-7 p-0 text-sm italic font-medium rounded-md"
                        onClick={() => onStyleChange({ ...style, fontStyle: isItalic ? 'normal' : 'italic' })}
                        title="Kurzíva"
                    >
                        i
                    </Button>

                    {/* Reset – visible only when something changed */}
                    {(style.fontSize || style.fontWeight || style.fontStyle === 'italic' || (style.fontFamily && style.fontFamily !== 'Poppins')) && (
                        <>
                            <div className="h-5 w-px bg-border/60 mx-0.5" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[10px] text-muted-foreground rounded-md"
                                onClick={() => onStyleChange({ fontFamily: 'Poppins', fontWeight: '', fontStyle: 'normal', fontSize: '' })}
                                title="Resetovat styl"
                            >
                                Reset
                            </Button>
                        </>
                    )}
                </div>

                {/* Text area / input – borderless, blends into the card */}
                {multiline ? (
                    <Textarea
                        id={id}
                        rows={rows}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        style={previewStyle}
                        className="resize-none border-0 rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                ) : (
                    <Input
                        id={id}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        style={previewStyle}
                        className="border-0 rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                )}
            </div>
        </div>
    );
};

export default StyledTextField;
