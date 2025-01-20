import React, {useState, useEffect} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const LatestNewsSidebar = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_NEWS_API_KEY;


  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true)
        if (apiUrl) {
          const response = await fetch(`https://newsapi.org/v2/everything?q=Marine conservation efforts coral&apiKey=${apiUrl}&language=en&sortBy=relevancy`)

          if (!response.ok) {
            throw new Error('Failed to fetch news');
          }
  
          const data = await response.json()
          const filteredNews = data.articles?.filter(article => !article.title.includes('[Removed]')) || [];
          setNews(filteredNews.slice(0, 5));
          setIsLoading(false)
        } else {
          setError('Could not access api key')
          console.log('Could not access api key')
        }
      } catch(e) {
        setError(e.message);
        console.error('Error fetching news:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();

    const interval = setInterval(fetchNews, 48 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [])


  const formatData = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  
  return (
    <Card className="w-80 h-min shadow-md mt-5 ml-16">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Latest Marine News</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className="h-4 w-full"/>
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
              <AlertCircle className='h-4 w-4'/>
              <AlertDescription>
                Failed to load news. Please try again later.
              </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && (
          <ul className='space-y-4'>
            {news.map((article, index) => (
              <li key={index} className="group">
                <a
                  href={article.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block space-y-1 p-2 rounded-lg transition-colors hover:bg-gray-50'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <h3 className='text-sm font-medium text-gray-900 group-hover:text-blue-600'>
                      {article.title}
                    </h3>
                    <ExternalLink className='h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>
                  <p className='text-xs text-gray-500'>
                    {formatData(article.publishedAt)}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !error && news.length === 0 && (
          <p className='text-center text-gray-500 py-4'>
            No news articles available
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestNewsSidebar