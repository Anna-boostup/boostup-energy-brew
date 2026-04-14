
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Mail, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  category: {
    name: string;
  } | null;
}

export default function BlogManagement() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id, 
          title, 
          slug, 
          status, 
          published_at, 
          created_at,
          category:blog_categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      toast.error("Nepodařilo se načíst články.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete tento článek smazat?")) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Článek byl smazán.");
      fetchPosts();
    } catch (error: any) {
      toast.error("Chyba při mazání článku.");
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase italic">
            Správa <span className="text-lime">Blogu</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Vytvářejte a spravujte články pro váš web a newslettery.</p>
        </div>
        <Link to="/admin/blog/new">
          <Button className="bg-lime hover:bg-lime/90 text-olive-dark font-black rounded-2xl px-6 gap-2">
            <Plus className="w-5 h-5" />
            Nový článek
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          <Input
            placeholder="Hledat v článcích..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/5 border-white/10 text-white rounded-2xl h-12 focus:border-lime/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-white/5 border-white/10 text-white rounded-2xl h-12 hover:bg-white/10">
            <Filter className="w-4 h-4 mr-2" />
            Všechny kategorie
          </Button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-white/40 uppercase tracking-widest text-[10px] font-black py-6 pl-8">Název článku</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-[10px] font-black py-6">Kategorie</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-[10px] font-black py-6">Stav</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-[10px] font-black py-6">Datum</TableHead>
              <TableHead className="text-white/40 uppercase tracking-widest text-[10px] font-black py-6 text-right pr-8">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-white/20 font-medium">Načítám články...</TableCell>
              </TableRow>
            ) : filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-white/20 font-medium">Žádné články nebyly nalezeny.</TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="py-6 pl-8">
                    <span className="text-white font-bold group-hover:text-lime transition-colors">{post.title}</span>
                    <p className="text-[10px] text-white/20 font-mono mt-1">/{post.slug}</p>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 font-bold rounded-lg px-3 py-1">
                      {post.category?.name || "Bez kategorie"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6">
                    {post.status === 'published' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        <span className="text-[10px] font-black text-lime uppercase tracking-wider">Publikováno</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-white/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Koncept</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-6 text-white/40 text-xs">
                    {post.published_at 
                      ? format(new Date(post.published_at), 'd. MMMM yyyy', { locale: cs })
                      : format(new Date(post.created_at), 'd. MMMM yyyy', { locale: cs })
                    }
                  </TableCell>
                  <TableCell className="py-6 text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                        className="w-9 h-9 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // Transfer content to newsletter logic
                          toast.info("Přenáším obsah do newsletteru...");
                          navigate(`/admin/emails?from_blog=${post.id}`);
                        }}
                        className="w-9 h-9 rounded-xl hover:bg-lime/20 text-white/40 hover:text-lime transition-all"
                        title="Vytvořit Newsletter"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post.id)}
                        className="w-9 h-9 rounded-xl hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
