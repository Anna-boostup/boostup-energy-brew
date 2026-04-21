
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Save, Globe, Eye, Image as ImageIcon, 
  Plus, Upload, Loader2, Layout, X, Calendar, Clock 
} from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface Category {
  id: string;
  name: string;
}

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    category_id: "",
    status: "draft" as "draft" | "published",
    featured_image_url: "",
    template: "modern" as "modern" | "centered" | "minimal",
    featured_image_position: "center" as "top" | "center" | "bottom"
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('blog_categories').select('id, name');
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title,
          slug: data.slug,
          content: data.content,
          category_id: data.category_id || "",
          status: data.status,
          featured_image_url: data.featured_image_url || "",
          template: data.template || "modern",
          featured_image_position: data.featured_image_position || "center"
        });
      }
    } catch (error) {
      toast.error("Chyba při načítání článku.");
      navigate("/admin/blog");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: prev.slug === generateSlug(prev.title) ? generateSlug(newTitle) : prev.slug
    }));
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, featured_image_url: publicUrl }));
      toast.success("Obrázek byl úspěšně nahrán.");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Chyba při nahrávání obrázku: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Prosím vyplňte název a obsah článku.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        content: formData.content,
        category_id: formData.category_id || null,
        status: formData.status,
        featured_image_url: formData.featured_image_url || null,
        template: formData.template,
        featured_image_position: formData.featured_image_position,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (isEditing) {
        const { error } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
        toast.success("Článek byl aktualizován.");
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([{ ...payload, created_at: new Date().toISOString() }])
          .select()
          .single();
        if (error) throw error;
        toast.success("Článek byl vytvořen.");
        if (data) {
          navigate(`/admin/blog/edit/${data.id}`, { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Chyba při ukládání článku: ${error.message || "Neznámá chyba"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      setCreatingCategory(true);
      const slug = generateSlug(newCategoryName);
      const { data, error } = await supabase
        .from('blog_categories')
        .insert([{ name: newCategoryName, slug }])
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      setFormData(prev => ({ ...prev, category_id: data.id }));
      setNewCategoryName("");
      setIsAddingCategory(false);
      toast.success("Kategorie byla vytvořena.");
    } catch (error: any) {
      console.error('Category error:', error);
      toast.error(`Chyba při vytváření kategorie: ${error.message}`);
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <form className="max-w-5xl mx-auto space-y-8 pb-20" onSubmit={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/admin/blog")}
            className="w-10 h-10 rounded-xl bg-olive-dark/5 border border-olive-dark/10 text-olive-dark/60 hover:text-olive-dark hover:bg-olive-dark/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-black tracking-tight text-olive-dark uppercase italic">
              {isEditing ? "Upravit" : "Nový"} <span className="text-lime">Článek</span>
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-olive-dark/5 border-olive-dark/10 text-olive-dark rounded-xl h-12 hover:bg-olive-dark/10 px-6 gap-2"
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4" />
            Náhled
          </Button>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }} 
            disabled={loading}
            className="bg-lime hover:bg-lime/90 text-olive-dark font-black rounded-xl h-12 px-8 gap-2 min-w-[140px]"
          >
            {loading ? "Ukládám..." : (<><Save className="w-5 h-5" /> Uložit článek</>)}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-admin-canvas border border-olive-dark/10 rounded-[2rem] shadow-sm p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-olive-dark font-black uppercase tracking-widest text-[10px] ml-1">Název článku</Label>
                <Input
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Zadejte chytlavý nadpis..."
                  className="bg-admin-canvas border-olive-dark/10 text-olive-dark rounded-2xl h-14 text-xl font-bold focus:border-lime-dark/50 transition-all px-6 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-olive-dark font-black uppercase tracking-widest text-[10px] ml-1">Obsah článku</Label>
                <RichTextEditor 
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Pište váš příběh..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-admin-canvas border border-olive-dark/10 rounded-[2rem] shadow-sm p-8 space-y-6">
            <h3 className="text-olive-dark font-black uppercase tracking-widest text-[10px]">Nastavení publikace</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-olive-dark font-black uppercase tracking-widest text-[10px] ml-1">URL Sluga</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                  placeholder="url-clanku"
                  className="bg-olive-dark/5 border-olive-dark/10 text-olive-dark rounded-xl h-11 focus:border-lime-dark/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-olive-dark font-black uppercase tracking-widest text-[10px] ml-1">Kategorie</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, category_id: val }))}
                  >
                    <SelectTrigger className="flex-1 bg-olive-dark/5 border-olive-dark/10 text-olive-dark rounded-xl h-11">
                      <SelectValue placeholder="Vyberte kategorii" />
                    </SelectTrigger>
                    <SelectContent className="bg-admin-canvas border-olive-dark/10 text-olive-dark rounded-xl">
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id} className="hover:bg-olive-dark/5 focus:bg-olive-dark/10">{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAddingCategory(true)}
                    className="w-11 h-11 rounded-xl bg-olive-dark/5 border-olive-dark/10 text-olive-dark/60 hover:text-olive-dark hover:bg-olive-dark/10 shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-olive-dark font-black uppercase tracking-widest text-[10px] ml-1">Stav</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val: any) => setFormData(prev => ({ ...prev, status: val }))}
                >
                  <SelectTrigger className="bg-olive-dark/5 border-olive-dark/10 text-olive-dark rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-canvas border-olive-dark/10 text-olive-dark rounded-xl">
                    <SelectItem value="draft">Koncept</SelectItem>
                    <SelectItem value="published">Publikovat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-olive-dark font-black uppercase tracking-widest text-[10px] ml-1">Šablona vzhledu</Label>
                <Select 
                  value={formData.template} 
                  onValueChange={(val: any) => setFormData(prev => ({ ...prev, template: val }))}
                >
                  <SelectTrigger className="bg-olive-dark/5 border-olive-dark/10 text-olive-dark rounded-xl h-11">
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4 text-olive-dark/40" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-admin-canvas border-olive-dark/10 text-olive-dark rounded-xl">
                    <SelectItem value="modern">Modern (Standard)</SelectItem>
                    <SelectItem value="centered">Centered (Střed)</SelectItem>
                    <SelectItem value="minimal">Minimal (Čistý)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-admin-canvas border border-olive-dark/10 rounded-[2rem] shadow-sm p-8 space-y-6">
            <h3 className="text-olive-dark font-black uppercase tracking-widest text-[10px]">Náhledový obrázek</h3>
            <div className="space-y-4">
              <div 
                className="aspect-video bg-olive-dark/5 rounded-2xl border-2 border-dashed border-olive-dark/10 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-lime-dark/50 transition-all overflow-hidden relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-lime animate-spin" />
                    <span className="text-[10px] text-olive-dark/40 uppercase font-black">Nahrávám...</span>
                  </div>
                ) : formData.featured_image_url ? (
                  <img src={formData.featured_image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-olive-dark/10 group-hover:text-olive-dark/30 transition-colors" />
                    <span className="text-[10px] text-olive-dark/20 uppercase font-black">Nahrát obrázek</span>
                  </>
                )}
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="space-y-1">
                <Label className="text-[10px] text-olive-dark/40 font-black uppercase ml-1">Nebo vložte URL</Label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                  className="bg-olive-dark/5 border-olive-dark/10 text-olive-dark rounded-xl h-11 focus:border-lime-dark/50 transition-all text-xs"
                />
              </div>

              {formData.featured_image_url && (
                <div className="space-y-2">
                  <Label className="text-[10px] text-olive-dark/40 font-black uppercase ml-1">Zarovnání (Object Position)</Label>
                  <div className="flex bg-olive-dark/5 p-1 rounded-xl border border-olive-dark/10">
                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFormData(prev => ({ ...prev, featured_image_position: pos }));
                        }}
                        className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                          formData.featured_image_position === pos 
                            ? 'bg-lime text-olive-dark shadow-sm' 
                            : 'text-olive-dark/40 hover:text-olive-dark/60'
                        }`}
                      >
                        {pos === 'top' ? 'Nahoru' : pos === 'center' ? 'Střed' : 'Dolů'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="bg-admin-canvas border-olive-dark/10 text-olive-dark rounded-[2rem] p-8 max-w-sm">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-display font-black tracking-tight uppercase italic">
              Nová <span className="text-lime">Kategorie</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-olive-dark font-black uppercase tracking-widest text-[10px] ml-1">Název kategorie</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Příklad: Novinky"
                id="new-category-input"
                className="bg-olive-dark/5 border-olive-dark/10 text-olive-dark rounded-xl h-12 focus:border-lime-dark/50 transition-all font-bold px-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddingCategory(false)}
              className="flex-1 bg-olive-dark/5 border-olive-dark/10 text-olive-dark rounded-xl h-12 hover:bg-olive-dark/10"
            >
              Zrušit
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                handleCreateCategory(e);
              }} 
              disabled={creatingCategory || !newCategoryName.trim()}
              className="flex-[2] bg-lime hover:bg-lime/90 text-olive-dark font-black rounded-xl h-12 px-6"
            >
              {creatingCategory ? "Vytvářím..." : "Vytvořit kategorii"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] overflow-y-auto p-0 bg-background border-none rounded-[3rem] shadow-2xl">
          <div className="sticky top-0 right-0 p-6 z-[60] flex justify-end pointer-events-none">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsPreviewOpen(false)}
              className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white pointer-events-auto shadow-xl"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="-mt-24">
            {formData.template === 'centered' ? (
              <div className="pt-32 pb-20 px-8">
                <div className="max-w-4xl mx-auto text-center mb-16">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-4">
                      <span className="bg-lime text-olive-dark px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        {categories.find(c => c.id === formData.category_id)?.name || "Kategorie"}
                      </span>
                      <div className="flex items-center gap-2 text-olive-dark/40 text-[10px] font-bold uppercase tracking-widest">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(), 'd. MMMM yyyy', { locale: cs })}
                      </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-black text-olive-dark tracking-tighter leading-tight">
                      {formData.title || "Váš úžasný nadpis"}
                    </h1>
                  </div>
                </div>

                {formData.featured_image_url && (
                  <div className="max-w-5xl mx-auto mb-16">
                    <div className="rounded-[3.5rem] overflow-hidden shadow-2xl aspect-[21/9]">
                      <img 
                        src={formData.featured_image_url} 
                        className={`w-full h-full object-cover ${
                          formData.featured_image_position === 'top' ? 'object-top' : 
                          formData.featured_image_position === 'bottom' ? 'object-bottom' : 
                          'object-center'
                        }`} 
                      />
                    </div>
                  </div>
                )}

                <div className="max-w-3xl mx-auto">
                  <div className="prose prose-lg prose-olive mx-auto mb-20 blog-content-premium">
                    <div dangerouslySetInnerHTML={{ __html: formData.content || '<p className="text-olive-dark/20 italic">Zatím žádný obsah...</p>' }} className="text-olive-dark/80" />
                  </div>
                </div>
              </div>
            ) : formData.template === 'minimal' ? (
              <div className="pt-32 pb-20 px-8">
                <div className="max-w-3xl mx-auto mb-16">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-lime-dark font-black text-[10px] uppercase tracking-widest">
                        {categories.find(c => c.id === formData.category_id)?.name || "Kategorie"}
                      </span>
                      <span className="text-olive-dark/20 text-[10px] font-black">•</span>
                      <div className="text-olive-dark/40 text-[10px] font-bold uppercase tracking-widest">
                        {format(new Date(), 'd. MMMM yyyy', { locale: cs })}
                      </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-display font-black text-olive-dark tracking-tighter">
                      {formData.title || "Váš úžasný nadpis"}
                    </h1>
                  </div>
                </div>

                {formData.featured_image_url && (
                  <div className="max-w-3xl mx-auto mb-16">
                    <div className="rounded-3xl overflow-hidden shadow-lg aspect-video">
                      <img 
                        src={formData.featured_image_url} 
                        className={`w-full h-full object-cover ${
                          formData.featured_image_position === 'top' ? 'object-top' : 
                          formData.featured_image_position === 'bottom' ? 'object-bottom' : 
                          'object-center'
                        }`} 
                      />
                    </div>
                  </div>
                )}

                <div className="max-w-3xl mx-auto">
                  <div className="prose prose-lg prose-olive mx-auto mb-20">
                    <div dangerouslySetInnerHTML={{ __html: formData.content || '<p className="text-olive-dark/20 italic">Zatím žádný obsah...</p>' }} className="text-olive-dark/80" />
                  </div>
                </div>
              </div>
            ) : (
              // Modern (Default)
              <>
                <div className="relative h-[60vh] min-h-[500px] w-full mb-16 px-4 md:px-8">
                  <div className="container mx-auto h-full p-0 flex flex-col gap-8 rounded-[3.5rem] overflow-hidden relative shadow-2xl">
                    {formData.featured_image_url ? (
                      <img 
                        src={formData.featured_image_url} 
                        className={`absolute inset-0 w-full h-full object-cover ${
                          formData.featured_image_position === 'top' ? 'object-top' : 
                          formData.featured_image_position === 'bottom' ? 'object-bottom' : 
                          'object-center'
                        }`} 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-olive-dark"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-olive-dark via-olive-dark/60 to-transparent"></div>
                    <div className="absolute bottom-16 left-0 right-0 z-10 px-12 md:px-20 max-w-5xl text-left">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <span className="bg-lime text-olive-dark px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            {categories.find(c => c.id === formData.category_id)?.name || "Kategorie"}
                          </span>
                          <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(), 'd. MMMM yyyy', { locale: cs })}
                          </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-white tracking-tighter leading-tight">
                          {formData.title || "Váš úžasný nadpis"}
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="container mx-auto px-8">
                  <div className="max-w-3xl mx-auto">
                    <div className="prose prose-lg prose-olive mx-auto mb-20 blog-content-premium">
                      <div dangerouslySetInnerHTML={{ __html: formData.content || '<p className="text-olive-dark/20 italic">Zatím žádný obsah...</p>' }} className="text-olive-dark/80" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
