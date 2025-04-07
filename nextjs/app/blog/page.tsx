import React from 'react';
import ArticleCard from '@/app/components/ArticleCard';
import Pagination from '@/app/components/Pagination';
import { type Metadata } from 'next';
import { BlogClient } from 'seobot';
import { Navbar } from '@/components/landing/Navbar';

// Define Promise type for searchParams
// Note: This page doesn't use route `params`
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(): Promise<Metadata> {
  const title = 'SAT Practice Blog';
  const description =
    'SAT Practice Blog is a blog that helps students prepare for the SAT exam. We offer a variety of resources to help you prepare for the SAT exam, including practice tests, study guides, and more.';
  return {
    title,
    description,
    metadataBase: new URL('https://satpracticebot.com'),
    alternates: {
      canonical: '/blog'
    },
    openGraph: {
      type: 'website',
      title,
      description,
      // images: [],
      url: 'https://satpracticebot.com/blog'
    },
    twitter: {
      title,
      description
      // card: 'summary_large_image',
      // images: [],
    }
  };
}

async function getPosts(page: number) {
  const key = process.env.SEOBOT_API_KEY;
  if (!key)
    throw Error(
      'SEOBOT_API_KEY enviroment variable must be set. You can use the DEMO key a8c58738-7b98-4597-b20a-0bb1c2fe5772 for testing - please set it in the root .env.local file'
    );

  const client = new BlogClient(key);
  return client.getArticles(page, 10);
}

export const fetchCache = 'force-no-store';

// Define props type for the page component
export type BlogPageProps = {
  // No `params` needed for this page
  searchParams: SearchParams;
};

// Update component signature and logic to use Promise pattern
export default async function Blog(props: BlogPageProps) {
  // Await searchParams promise
  const searchParams = await props.searchParams;
  const page = searchParams.page; // Access page from resolved searchParams

  // Ensure page is treated as a number, handling potential string/undefined types
  const pageNumber = Math.max(Number(page || '0') - 1, 0);
  const { total, articles } = await getPosts(pageNumber);
  const posts = articles || [];
  const lastPage = Math.ceil(total / 10);

  // More detailed logging
  console.log('Articles data:', articles);
  console.log('First article headline:', articles?.[0]?.headline);

  return (
    <>
      <Navbar user={null} />
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            SAT Practice Blog
          </h1>
          <div className="space-y-8">
            {posts.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {lastPage > 1 && (
            <div className="mt-12">
              <Pagination
                slug="/blog"
                pageNumber={pageNumber}
                lastPage={lastPage}
              />
            </div>
          )}
        </section>
      </main>
    </>
  );
}
