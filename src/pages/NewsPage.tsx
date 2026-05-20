/**
 * News Page Component
 * Displays market news and intelligence
 */
import React, { useState, useEffect } from 'react';
import { Newspaper, Radio, TrendingUp, TrendingDown, ExternalLink, Clock, Bookmark, Search, Filter } from 'lucide-react';
import { fetchTopFinancialNews, NewsArticle as ApiNewsArticle, highlightKeywords } from '@/services/newsapi';

const T = {
  bg0: '#0C0E12', bg1: '#131722', bg2: '#1E222D', bg3: '#2A2E39',
  border0: 'rgba(255,255,255,0.06)', border1: 'rgba(255,255,255,0.08)',
  brand: '#2962FF', brandLt: '#5B8DEF',
  text0: '#FFFFFF', text1: '#D1D4DC', text2: '#787B86', text3: '#50535E',
  up: '#26A69A', upBg: 'rgba(38,166,154,0.10)',
  dn: '#EF5350', dnBg: 'rgba(239,83,80,0.10)',
  warn: '#FF9800',
};

interface NewsArticle extends ApiNewsArticle {
  id: string;
  category: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Toutes' },
  { id: 'markets', label: 'Marchés' },
  { id: 'tech', label: 'Tech' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'economy', label: 'Économie' },
];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const articles = await fetchTopFinancialNews(30);
      const newsWithIds = articles.map((article, index) => ({
        ...article,
        id: `news-${index}-${Date.now()}`,
        category: inferCategory(article.title + ' ' + (article.description || '')),
      }));
      setNews(newsWithIds);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const inferCategory = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('crypto') || lower.includes('bitcoin') || lower.includes('ethereum')) return 'crypto';
    if (lower.includes('tech') || lower.includes('apple') || lower.includes('microsoft') || lower.includes('nvidia') || lower.includes('tesla')) return 'tech';
    if (lower.includes('economy') || lower.includes('fed') || lower.includes('interest') || lower.includes('inflation')) return 'economy';
    return 'markets';
  };

  const filteredNews = news.filter((article) => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  return (
    <div style={{
      height: '100%',
      background: T.bg0,
      color: T.text1,
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        background: T.bg1,
        borderBottom: `1px solid ${T.border0}`,
        padding: '10px 16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: T.text3, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              NEWS
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: T.text0, fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={14} color={T.brand} />
              MARKET INTELLIGENCE
            </div>
          </div>
          <button
            onClick={loadNews}
            disabled={loading}
            style={{
              padding: '6px 12px',
              background: loading ? T.bg2 : T.brand,
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} color={T.text3} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Rechercher des articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                background: T.bg2,
                border: `1px solid ${T.border1}`,
                borderRadius: '4px',
                color: T.text0,
                fontSize: '11px',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = T.brand; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = T.border1; }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '12px',
                border: 'none',
                background: activeCategory === cat.id ? T.brand : T.bg2,
                color: activeCategory === cat.id ? '#fff' : T.text2,
                fontSize: '10px',
                fontWeight: activeCategory === cat.id ? 700 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: T.text3 }}>
            Chargement des actualités...
          </div>
        ) : filteredNews.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: T.text3 }}>
            Aucun article trouvé
          </div>
        ) : (
          filteredNews.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              bookmarked={bookmarked.has(article.id)}
              onToggleBookmark={() => toggleBookmark(article.id)}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NewsCard({ article, bookmarked, onToggleBookmark, formatDate }: {
  article: NewsArticle;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  formatDate: (date: string) => string;
}) {
  const [hovered, setHovered] = useState(false);

  const sentimentColor = article.sentiment === 'positive' ? T.up : article.sentiment === 'negative' ? T.dn : T.text3;
  const sentimentBg = article.sentiment === 'positive' ? T.upBg : article.sentiment === 'negative' ? T.dnBg : T.bg2;

  return (
    <div
      style={{
        background: T.bg1,
        border: `1px solid ${T.border0}`,
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {article.urlToImage && (
            <div style={{
              width: '120px',
              height: '80px',
              backgroundImage: `url(${article.urlToImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '6px',
              flexShrink: 0,
            }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: T.text3,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                {article.category.toUpperCase()}
              </span>
              <span style={{
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '3px',
                background: sentimentBg,
                color: sentimentColor,
                fontWeight: 600,
              }}>
                {article.sentiment === 'positive' ? 'Positif' : article.sentiment === 'negative' ? 'Négatif' : 'Neutre'}
              </span>
            </div>

            <h3 style={{
              fontSize: '14px',
              fontWeight: 700,
              color: hovered ? T.brandLt : T.text0,
              margin: 0,
              marginBottom: '8px',
              lineHeight: 1.4,
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
              onClick={() => article.url && window.open(article.url, '_blank', 'noopener,noreferrer')}
            >
              {highlightKeywords(article.title)}
            </h3>

            {article.description && (
              <p style={{
                fontSize: '12px',
                color: T.text2,
                margin: 0,
                marginBottom: '12px',
                lineHeight: 1.5,
              }}>
                {highlightKeywords(article.description)}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: T.text3, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Newspaper size={10} />
                  {article.source.name}
                </span>
                <span style={{ fontSize: '10px', color: T.text3, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={10} />
                  {formatDate(article.publishedAt)}
                </span>
                {article.author && (
                  <span style={{ fontSize: '10px', color: T.text3 }}>
                    Par {article.author}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={onToggleBookmark}
                  style={{
                    padding: '6px 10px',
                    background: 'transparent',
                    border: `1px solid ${T.border1}`,
                    borderRadius: '4px',
                    color: bookmarked ? T.warn : T.text2,
                    fontSize: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = bookmarked ? T.warn : T.brand;
                    e.currentTarget.style.color = bookmarked ? T.warn : T.brandLt;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border1;
                    e.currentTarget.style.color = bookmarked ? T.warn : T.text2;
                  }}
                >
                  <Bookmark size={12} fill={bookmarked ? T.warn : 'none'} />
                  {bookmarked ? 'Enregistré' : 'Enregistrer'}
                </button>

                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 12px',
                      background: T.brand,
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    Lire l'article
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
