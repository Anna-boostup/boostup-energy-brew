import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, Loader2, Clock, Share2 } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  title: string;
  content_html: string;
  excerpt: string;
  slug: string;
  featured_image_url: string;
  category: string;
  published_at: string;
  status: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 bg-olive-dark rounded-3xl flex items-center justify-center animate-pulse">
           <Loader2 className="w-8 h-8 text-lime animate-spin" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-olive-dark/40 animate-pulse">Načítám článek...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-display font-black text-olive-dark mb-4">Článek nebyl nalezen</h1>
        <p className="text-olive-dark/60 mb-8">Omlouváme se, ale tento článek neexistuje nebo již byl smazán.</p>
        <Link to="/blog">
          <Button variant="outline" className="rounded-2xl border-olive-dark/10">Zpět na blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title={`${post.title} - Blog BoostUp`} 
        description={post.excerpt}
        ogImage={post.featured_image_url}
      />
      <Header />

      <main className="flex-1 pt-24 pb-20">
        {/* Article Header */}
        <div className="relative h-[60vh] min-h-[500px] w-full mb-16 px-4 md:px-8">
          <div className="container mx-auto h-full p-0 flex flex-col gap-8 rounded-[3.5rem] overflow-hidden relative shadow-2xl">
            {post.featured_image_url ? (
              <img 
                src={post.featured_image_url} 
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-olive-dark"></div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-olive-dark via-olive-dark/60 to-transparent"></div>

            {/* Back Button */}
            <div className="absolute top-10 left-10 z-20">
              <Link to="/blog" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-6 py-3 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest border border-white/5">
                <ChevronLeft className="w-4 h-4" /> Zpět
              </Link>
            </div>

            {/* Title Content */}
            <div className="absolute bottom-16 left-0 right-0 z-10 px-12 md:px-20 max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-lime text-olive-dark px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(post.published_at), 'd. MMMM yyyy', { locale: cs })}
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-white tracking-tighter leading-tight mb-8">
                  {post.title}
                </h1>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="prose prose-lg prose-olive mx-auto mb-20 blog-content-premium"
            >
              {/* Injecting raw HTML safely */}
              <div 
                dangerouslySetInnerHTML={{ __html: post.content_html || '' }} 
                className="text-olive-dark/80 prose-headings:font-display prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-olive-dark prose-p:leading-relaxed prose-img:rounded-3xl prose-img:shadow-2xl prose-a:text-lime-dark prose-a:font-bold prose-strong:text-olive-dark prose-blockquote:border-l-lime prose-blockquote:bg-olive-dark/5 prose-blockquote:p-8 prose-blockquote:rounded-r-3xl"
              />
            </motion.div>

            <div className="border-t border-olive-dark/10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-olive-dark flex items-center justify-center text-lime font-display font-black">BU</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-olive-dark">Redakce BoostUp</p>
                    <p className="text-[10px] font-bold text-olive-dark/40 uppercase tracking-widest">Kvalita & Energie</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-olive-dark/30 mr-2">Sdílet:</span>
                  <button className="p-3 bg-cream hover:bg-lime/20 rounded-xl transition-colors border border-olive-dark/5" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Odkaz zkopírován do schránky!");
                  }}>
                    <Share2 className="w-4 h-4 text-olive-dark" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
