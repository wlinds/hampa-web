// src/utils/seo.ts

interface SEOData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

/**
 * Set SEO meta tags for the page
 */
export const setSEOTags = (data: SEOData) => {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author
  } = data;

  // Set title
  if (title) {
    document.title = title.includes('Hampaoasen') ? title : `${title} - Hampaoasen`;
  }

  // Set or update meta description
  if (description) {
    setMetaTag('description', description);
  }

  // Open Graph tags
  if (title) {
    setMetaProperty('og:title', title);
  }
  if (description) {
    setMetaProperty('og:description', description);
  }
  if (image) {
    setMetaProperty('og:image', image);
  }
  if (url) {
    setMetaProperty('og:url', url);
  }
  setMetaProperty('og:type', type);

  // Twitter Card tags
  setMetaProperty('twitter:card', 'summary_large_image');
  if (title) {
    setMetaProperty('twitter:title', title);
  }
  if (description) {
    setMetaProperty('twitter:description', description);
  }
  if (image) {
    setMetaProperty('twitter:image', image);
  }

  // Article specific tags
  if (type === 'article') {
    if (publishedTime) {
      setMetaProperty('article:published_time', publishedTime);
    }
    if (modifiedTime) {
      setMetaProperty('article:modified_time', modifiedTime);
    }
    if (author) {
      setMetaProperty('article:author', author);
    }
  }
};

/**
 * Set a meta tag with name attribute
 */
const setMetaTag = (name: string, content: string) => {
  let metaTag = document.querySelector(`meta[name="${name}"]`);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
};

/**
 * Set a meta tag with property attribute (for Open Graph)
 */
const setMetaProperty = (property: string, content: string) => {
  let metaTag = document.querySelector(`meta[property="${property}"]`);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('property', property);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
};

/**
 * Reset SEO tags to default Hampaoasen values
 */
export const resetSEOTags = () => {
  setSEOTags({
    title: 'Hampaoasen - Hampa & Biologisk Mångfald',
    description: 'Specialister på hampakultivering och biologisk mångfald i Sverige. Vi erbjuder rådgivning, etablering av hampaareal och grönyteskötsel för hållbar framtid.',
    url: 'https://hampaoasen.se',
    type: 'website'
  });
};

/**
 * Generate structured data for blog posts
 */
interface BlogPostStructuredData {
  "@context": string;
  "@type": string;
  headline: string;
  description: string;
  author: {
    "@type": string;
    name: string;
  };
  datePublished: string;
  dateModified: string;
  publisher: {
    "@type": string;
    name: string;
    url: string;
  };
  mainEntityOfPage: {
    "@type": string;
    "@id": string;
  };
  image?: string;
}

export const generateBlogPostStructuredData = (data: {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  url: string;
}) => {
  const structuredData: BlogPostStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": data.title,
    "description": data.description,
    "author": {
      "@type": "Person",
      "name": data.author
    },
    "datePublished": data.publishedDate,
    "dateModified": data.modifiedDate || data.publishedDate,
    "publisher": {
      "@type": "Organization",
      "name": "Hampaoasen",
      "url": "https://hampaoasen.se"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": data.url
    }
  };

  if (data.image) {
    structuredData["image"] = data.image;
  }

  return structuredData;
};

/**
 * Insert structured data into the page
 */
export const insertStructuredData = (data: object) => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Insert new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};