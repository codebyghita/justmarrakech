/**
 * Simple utility to update page SEO meta tags dynamically.
 * @param {string} title 
 * @param {string} description 
 */
export const updateSEO = (title, description) => {
    if (title) {
        document.title = `${title} | Just Marrakech`;
    }
    
    if (description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', description);
    }
};
