export const getTranslated = (item, field, lang) => {
  if (!item) return '';
  const defaultVal = item[field];
  if (lang === 'fr') return defaultVal;

  if (item.translations && item.translations.length > 0) {
    const trans = item.translations.find((tr) => tr.locale === lang && tr.field === field);
    if (trans) return trans.content;
  }
  // Return null instead of defaultVal to allow frontend t() fallback if database translation is missing
  return null;
};

export const getCmsValue = (cms, slug, fallback, lang) => {
  const block = cms[slug];
  if (!block) return fallback;
  return getTranslated(block, 'content', lang);
};
