import { supabase } from '../config/supabase';

// Generate URL-friendly slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
};

// Fetch all published articles (public)
export const fetchPublishedArticles = async (category = null) => {
  let query = supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image,
      category,
      tags,
      views,
      published_at,
      created_at,
      author_id
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  
  if (error) return { data: null, error };
  
  // Fetch author info separately
  if (data && data.length > 0) {
    const authorIds = [...new Set(data.filter(a => a.author_id).map(a => a.author_id))];
    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', authorIds);
      
      const authorMap = Object.fromEntries((authors || []).map(a => [a.id, a]));
      data.forEach(article => {
        article.author = authorMap[article.author_id] || null;
      });
    }
  }
  
  return { data, error };
};

// Fetch single article by slug
export const fetchArticleBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return { data: null, error };

  // Fetch author info
  if (data && data.author_id) {
    const { data: author } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('id', data.author_id)
      .single();
    data.author = author;
  }

  // Increment view count
  await supabase
    .from('articles')
    .update({ views: (data.views || 0) + 1 })
    .eq('id', data.id);

  return { data, error: null };
};

// Fetch all articles for admin (all statuses)
export const fetchAllArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error };
  
  // Fetch author info separately
  if (data && data.length > 0) {
    const authorIds = [...new Set(data.filter(a => a.author_id).map(a => a.author_id))];
    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', authorIds);
      
      const authorMap = Object.fromEntries((authors || []).map(a => [a.id, a]));
      data.forEach(article => {
        article.author = authorMap[article.author_id] || null;
      });
    }
  }

  return { data, error };
};

// Fetch single article by ID (for editing)
export const fetchArticleById = async (id) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

// Create new article
export const createArticle = async (articleData, authorId) => {
  const slug = generateSlug(articleData.title);
  
  const payload = {
    title: articleData.title,
    slug,
    content: articleData.content,
    excerpt: articleData.excerpt || null,
    cover_image: articleData.cover_image || null,
    category: articleData.category || null,
    tags: articleData.tags || [],
    status: articleData.status || 'draft',
    author_id: authorId,
    published_at: articleData.status === 'published' ? new Date().toISOString() : null
  };

  const { data, error } = await supabase
    .from('articles')
    .insert(payload)
    .select()
    .single();

  return { data, error };
};

// Update existing article
export const updateArticle = async (id, articleData) => {
  // Get existing article to check if we need to set published_at
  const { data: existing } = await fetchArticleById(id);
  
  const updates = {
    title: articleData.title,
    content: articleData.content,
    excerpt: articleData.excerpt || null,
    cover_image: articleData.cover_image || null,
    category: articleData.category || null,
    tags: articleData.tags || [],
    status: articleData.status,
    updated_at: new Date().toISOString()
  };

  // Set published_at when publishing for the first time
  if (articleData.status === 'published' && !existing?.published_at) {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete article
export const deleteArticle = async (id) => {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  return { error };
};

// Get unique categories from published articles
export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('category')
    .eq('status', 'published')
    .not('category', 'is', null);

  if (error) return { data: [], error };

  const categories = [...new Set(data.map(d => d.category).filter(Boolean))];
  return { data: categories, error: null };
};

// Get article statistics for admin dashboard
export const fetchArticleStats = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('id, status, views');

  if (error) return { data: null, error };

  const stats = {
    total: data.length,
    published: data.filter(a => a.status === 'published').length,
    draft: data.filter(a => a.status === 'draft').length,
    archived: data.filter(a => a.status === 'archived').length,
    totalViews: data.reduce((sum, a) => sum + (a.views || 0), 0)
  };

  return { data: stats, error: null };
};

// Search articles
export const searchArticles = async (query) => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      category,
      status,
      created_at
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  return { data, error };
};
