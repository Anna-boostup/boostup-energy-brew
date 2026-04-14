import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { Calendar, User, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  featured_image_url: string;
  category: string;
  published_at: string;
  author_id: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Blog - BoostUp Energy Brew" 
        description="Objevte svět čisté energie, soustředění a biohackingu. Články o tom, jak funguje BoostUp a jak maximalizovat svůj výkon."
      />
      <Header />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <header className="max-w-3xl mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-lime text-olive-dark px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase inline-block mb-6 shadow-lg shadow-lime/20">
                MAGAZÍN
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-olive-dark mb-6 leading-none">
                BOOSTUP <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-olive-dark/80 to-olive-dark/40">DIGEST</span>
              </h1>
              <p className="text-xl text-olive-dark/60 leading-relaxed font-medium">
                Vše o energii, soustředění a o tom, jak z každého dne vytěžit maximum.
              </p>
            </motion.div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-lime" />
              <p className="text-xs font-black uppercase tracking-[0.3em] text-olive-dark/30">Načítám články...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((post, index) => (
                <motion.article 
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link to={`/blog/${post.slug}`} className="group block h-full">
                    <div className="bg-cream rounded-[2.5rem] overflow-hidden border border-olive-dark/5 shadow-2xl shadow-olive-dark/5 hover:shadow-lime/10 transition-all duration-500 h-full flex flex-col">
                      <div className="aspect-[16/10] overflow-hidden relative">
                        {post.featured_image_url ? (
                          <img 
                            src={post.featured_image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-olive-dark/10 flex items-center justify-center">
                            <span className="text-olive-dark/20 font-black text-2xl tracking-widest italic">BOOSTUP</span>
                          </div>
                        )}
                        <div className="absolute top-6 left-6">
                          <span className="bg-white/90 backdrop-blur-md text-olive-dark px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-olive-dark/40 uppercase tracking-widest mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(post.published_at), 'd. MMMM yyyy', { locale: cs })}
                          </div>
                        </div>

                        <h2 className="text-2xl font-black text-olive-dark mb-4 leading-tight group-hover:text-lime-dark transition-colors duration-300">
                          {post.title}
                        </h2>

                        <p className="text-olive-dark/60 text-sm leading-relaxed mb-8 line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="mt-auto flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-olive-dark group-hover:gap-6 gap-4 transition-all duration-300">
                          ČÍST VÍCE <ChevronRight className="w-4 h-4 text-lime" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-cream rounded-[3rem] border border-dashed border-olive-dark/10">
              <p className="text-olive-dark/40 font-bold uppercase tracking-widest italic">Zatím jsme nenapsali žádné články.</p>
              <Link to="/" className="inline-block mt-6 text-sm font-black underline hover:text-lime">Zpět domů</Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
