import { supabase } from '../lib/supabaseClient';
import {
  getBlogCategories,
  getBlogPostBySlug,
  getCaseStudyBySlug,
  getPublishedBlogPosts,
  getPublishedCaseStudies,
} from '../lib/contentQueries';

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase n’est pas configuré (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  }
  return supabase;
}

// Stable keys shared with the prerender payload.
export const contentKeys = {
  caseStudyList: 'case-studies:list',
  caseStudy: (slug) => `case-study:${slug}`,
  blogList: 'blog:list',
  blogCategories: 'blog:categories',
  blogPost: (slug) => `blog-post:${slug}`,
};

export const loadCaseStudies = () => getPublishedCaseStudies(requireClient());
export const loadCaseStudy = (slug) => getCaseStudyBySlug(requireClient(), slug);
export const loadBlogPosts = () => getPublishedBlogPosts(requireClient());
export const loadBlogCategories = () => getBlogCategories(requireClient());
export const loadBlogPost = (slug) => getBlogPostBySlug(requireClient(), slug);
