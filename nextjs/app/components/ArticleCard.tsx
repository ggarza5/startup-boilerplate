import Link from 'next/link';

interface Article {
  id: string;
  slug: string;
  headline: string;
  metaDescription: string;
  image: string;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  category: {
    title: string;
    slug: string;
  };
  tags: Array<{
    title: string;
    slug: string;
  }>;
}

interface ArticleProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleProps> = ({ article }) => {
  console.log('ArticleCard rendering with article:', article);
  return (
    <li
      key={article.id}
      className="group relative bg-white dark:bg-gray-800 rounded-lg p-6 transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-800/50"
    >
      <div className="flex flex-wrap gap-2 items-center w-full text-sm text-gray-500 dark:text-gray-400 mb-3">
        <span>
          Published{' '}
          {new Date(article.createdAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
        {article.readingTime ? (
          <span>{` ⦁ ${article.readingTime}`} min read</span>
        ) : null}
      </div>
      <Link
        href={`/blog/${article.slug}`}
        className="block mb-3 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
          {article.headline}
        </h2>
      </Link>
      <div className="text-gray-600 dark:text-gray-300 text-sm sm:text-base line-clamp-2 mb-4">
        {article.metaDescription}
      </div>
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {(article.tags || []).splice(0, 3).map((t: any, ix: number) => (
            <a
              key={ix}
              href={`/blog/tag/${t.slug}`}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t.title}
            </a>
          ))}
        </div>
        <Link
          href={`/blog/${article.slug}`}
          className="inline-flex items-center text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
        >
          Read More
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </li>
  );
};

export default ArticleCard;
