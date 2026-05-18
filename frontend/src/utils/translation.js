export const getTranslated = (item, field, lang = "fr") => {
  if (!item) return "";

  // 1. Normalize language (e.g. en-US -> en)
  const normalizedLang = lang.split('-')[0].toLowerCase();

  // 2. If language is French, return the primary field content
  if (normalizedLang === "fr") {
    const val = item[field];
    if (val === "Array") return "";
    return val || "";
  }

  // 3. Check for the translation in the translations relationship
  if (item.translations && Array.isArray(item.translations)) {
    const trans = item.translations.find(t => t.locale === normalizedLang && t.field === field);
    if (trans && trans.content && trans.content !== "Array") {
      // If it looks like JSON but is a string, we might want to return it as is 
      // or parse it. But getTranslated usually returns the raw content.
      // We'll let getJsonField handle the parsing.
      return trans.content;
    }
  }

  // 3. Fallback to French if no translation found
  const fallback = item[field];
  if (fallback === "Array") return "";
  return fallback || "";
};

/**
 * Safely parse JSON fields that might be returned as strings or objects
 */
export const getJsonField = (item, field, lang = "fr") => {
  const content = getTranslated(item, field, lang);
  if (!content) return [];
  
  if (content === "Array") return [];

  if (Array.isArray(content)) return content;
  
  if (typeof content === "string") {
    let trimmed = content.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        // Fix for "Bad control character in string literal" 
        // Replace literal newlines and carriage returns with escaped versions
        const sanitized = trimmed.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
        return JSON.parse(sanitized);
      } catch (e) {
        console.warn("JSON Parse error:", e, "on string:", trimmed);
        return [];
      }
    }
  }

  return content || [];
};

export const getCmsValue = (cms, slug, fallback, lang = "fr") => {
  const block = cms[slug];
  if (!block) return fallback;
  
  // Use getJsonField for robust parsing if it's supposed to be structured
  if (block.type === 'json' || block.type === 'image_list') {
    const val = getJsonField(block, 'content', lang);
    return (val && (!Array.isArray(val) || (Array.isArray(val) && val.length > 0))) ? val : fallback;
  }

  const val = getTranslated(block, 'content', lang);
  return (val !== null && val !== "Array") ? val : fallback;
};
