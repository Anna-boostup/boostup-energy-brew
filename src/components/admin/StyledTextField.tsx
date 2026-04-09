import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AVAILABLE_FONTS } from '@/hooks/useDynamicFonts';
import type { TextStyle } from '@/lib/textStyles';
import { Bold, Italic, RotateCcw } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

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

const FONT_SIZES = ['10', '11', '12', '14', '16', '18', '20', '24', '32', '40', '48', '56', '64', '72'];

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
    const { content } = useContent();
    const isBold = style.fontWeight === '700' || style.fontWeight === 'bold';
    const isItalic = style.fontStyle === 'italic';

    const previewStyle: React.CSSProperties = {
        fontFamily: style.fontFamily ? `"${style.fontFamily}", sans-serif` : undefined,
        fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
        fontWeight: isBold ? '700' : '400',
        fontStyle: isItalic ? 'italic' : 'normal',
    };

    if (!content) return null;
    const t = content.admin.editor;

    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-[11px] font-black uppercase tracking-[0.3em] text-olive/40 pl-1">{label}</Label>
            
            <div className="rounded-2xl border border-olive/10 bg-white shadow-sm overflow-hidden focus-within:border-lime/40 focus-within:ring-4 focus-within:ring-lime/5 transition-all">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-olive-dark/[0.02] border-b border-olive/5">
                    {/* Font Family */}
                    <Select 
                        value={style.fontFamily || 'Poppins'} 
                        onValueChange={(v) => onStyleChange({ ...style, fontFamily: v })}
                    >
                        <SelectTrigger className="h-8 w-[140px] text-[10px] font-bold uppercase tracking-widest border-olive/10 bg-white">
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

                    {/* Font Size */}
                    <Select 
                        value={style.fontSize || ""} 
                        onValueChange={(v) => onStyleChange({ ...style, fontSize: v === '__default' ? '' : v })}
                    >
                        <SelectTrigger className="h-8 w-[80px] text-[10px] font-bold uppercase tracking-widest border-olive/10 bg-white">
                            <SelectValue placeholder={t.sizePlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__default" className="text-xs italic text-muted-foreground">{t.defaultSize}</SelectItem>
                            {FONT_SIZES.map(s => (
                                <SelectItem key={s} value={s} className="text-xs">{s}px</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="w-px h-4 bg-olive/10 mx-1" />

                    <Button
                        type="button"
                        variant={isBold ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-lg ${isBold ? "bg-olive-dark text-white" : "border-olive/10 text-olive-dark/40"}`}
                        onClick={() => onStyleChange({ ...style, fontWeight: isBold ? '400' : '700' })}
                        title={t.bold}
                    >
                        <Bold className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                        type="button"
                        variant={isItalic ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-lg ${isItalic ? "bg-olive-dark text-white" : "border-olive/10 text-olive-dark/40"}`}
                        onClick={() => onStyleChange({ ...style, fontStyle: isItalic ? 'normal' : 'italic' })}
                        title={t.italic}
                    >
                        <Italic className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 ml-auto text-[10px] font-black uppercase tracking-widest text-olive-dark/30 hover:text-terracotta transition-colors"
                        onClick={() => onStyleChange({ fontFamily: '', fontWeight: '', fontStyle: 'normal', fontSize: '' })}
                        title={t.reset}
                    >
                        <RotateCcw className="h-3 w-3 mr-1.5" />
                        {t.reset}
                    </Button>
                </div>

                {multiline ? (
                    <textarea
                        id={id}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={rows}
                        style={previewStyle}
                        className="w-full p-4 resize-none border-none focus:ring-0 text-sm font-medium leading-relaxed bg-transparent"
                    />
                ) : (
                    <input
                        id={id}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        style={previewStyle}
                        className="w-full px-4 h-14 border-none focus:ring-0 text-sm font-medium bg-transparent"
                    />
                )}
            </div>
        </div>
    );
};

export default StyledTextField;
