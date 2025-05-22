// lib/search-utils.ts
import { load } from 'cheerio';
import natural from 'natural';
import { SEARCH_CONSTANTS } from '../constants/search';
import stringSimilarity from 'string-similarity';
import nlp from 'compromise';


const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

export async function preprocessQuery(query: string): Promise<string> {
  if (!query?.trim()) return '';

  // Remove HTML if present
  const $ = load(query);
  query = $.text();

  // Normalize whitespace
  query = query.replace(/\s+/g, ' ').trim();

  // Remove special characters but keep meaningful punctuation
  query = query.replace(/[^\w\s-.,?!]/g, '');

  // Tokenize and stem
  const tokens = tokenizer.tokenize(query.toLowerCase());
  if (!tokens) return query;

  const stemmed = tokens.map(token => stemmer.stem(token));

  // Remove stopwords
  const stopwords = new Set(natural.stopwords);
  const filtered = stemmed.filter(token => !stopwords.has(token));

  return filtered.join(' ');
}

export async function highlightText(
  text: string,
  query: string,
  maxLength: number = SEARCH_CONSTANTS.HIGHLIGHT_LENGTH
): Promise<string> {
  if (!text || !query) return text || '';

  const tokens = tokenizer.tokenize(query.toLowerCase());
  if (!tokens) return text;

  const stemmedTokens = tokens.map(token => stemmer.stem(token));
  const textTokens = tokenizer.tokenize(text);
  if (!textTokens) return text;

  // Find best matching snippet
  let bestSnippet = '';
  let maxMatches = 0;

  for (let i = 0; i < textTokens.length; i++) {
    const snippetTokens = textTokens.slice(i, i + maxLength);
    const matches = snippetTokens.filter(token => 
      stemmedTokens.includes(stemmer.stem(token.toLowerCase()))
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestSnippet = snippetTokens.join(' ');
    }
  }

  // Highlight matching terms
  const highlighted = bestSnippet.replace(
    new RegExp(`(${stemmedTokens.join('|')})`, 'gi'),
    '<mark>$1</mark>'
  );

  return highlighted;
}