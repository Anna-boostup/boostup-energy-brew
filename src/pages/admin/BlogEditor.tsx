
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Globe, Eye, Image as ImageIcon } from "lucide-react";
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
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    category_id: "",
    status: "draft" as "draft" | "published",
    featured_image_url: ""
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
          featured_image_url: data.featured_image_url || ""
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
        updated_at: new Date().toISOString(),
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
        const { error } = await supabase
          .from('blog_posts')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
        toast.success("Článek byl vytvořen.");
      }
      navigate("/admin/blog");
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error("Chyba při ukládání článku.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/admin/blog")}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase italic">
              {isEditing ? "Upravit" : "Nový"} <span className="text-lime">Článek</span>
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-white/5 border-white/10 text-white rounded-xl h-12 hover:bg-white/10 px-6 gap-2"
            onClick={() => toast.info("Náhled bude k dispozici po uložení.")}
          >
            <Eye className="w-4 h-4" />
            Náhled
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-lime hover:bg-lime/90 text-olive-dark font-black rounded-xl h-12 px-8 gap-2 min-w-[140px]"
          >
            {loading ? "Ukládám..." : (<><Save className="w-5 h-5" /> Uložit článek</>)}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black ml-1">Název článku</Label>
                <Input
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Zadejte chytlavý nadpis..."
                  className="bg-white/5 border-white/10 text-white rounded-2xl h-14 text-xl font-bold focus:border-lime/50 transition-all px-6"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black ml-1">Obsah článku</Label>
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
          <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-8 space-y-6">
            <h3 className="text-white/40 uppercase tracking-widest text-[10px] font-black">Nastavení publikace</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black ml-1">URL Sluga</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                  placeholder="url-clanku"
                  className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus:border-lime/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black ml-1">Kategorie</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, category_id: val }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-11">
                    <SelectValue placeholder="Vyberte kategorii" />
                  </SelectTrigger>
                  <SelectContent className="bg-olive-dark border-white/10 text-white rounded-xl">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="hover:bg-white/5 focus:bg-white/5">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black ml-1">Stav</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val: any) => setFormData(prev => ({ ...prev, status: val }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-olive-dark border-white/10 text-white rounded-xl">
                    <SelectItem value="draft">Koncept</SelectItem>
                    <SelectItem value="published">Publikovat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-8 space-y-6">
            <h3 className="text-white/40 uppercase tracking-widest text-[10px] font-black">Náhledový obrázek</h3>
            <div className="space-y-4">
              <div className="aspect-video bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-lime/50 transition-all overflow-hidden relative">
                {formData.featured_image_url ? (
                  <img src={formData.featured_image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-white/10 group-hover:text-lime/50 transition-colors" />
                    <span className="text-[10px] text-white/20 uppercase font-black">Nahrát obrázek</span>
                  </>
                )}
              </div>
              <Input
                placeholder="URL obrázku..."
                value={formData.featured_image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus:border-lime/50 transition-all text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
