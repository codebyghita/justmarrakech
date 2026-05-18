export const slugify = (value = '') =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const ACTIVITY_CATEGORIES = [
  {
    slug: 'bien-etre',
    label: 'Bien-Etre',
    cardImage: 'https://justmarrakech.com/storage/2024/04/24/la-sultana-hammam-spa.jpg',
    heroTitle: 'Activites bien-etre a Marrakech',
    heroSubtitle: 'Hammam, spa et massages',
    heroDescription:
      "Marrakech est l'une des destinations les plus reputees pour les experiences de bien-etre. Entre hammams traditionnels, spas de riads et soins relaxants, la ville offre de nombreuses possibilites pour se detendre pendant son sejour.",
    heroSupport:
      "Que vous souhaitiez decouvrir un hammam marocain authentique ou profiter d'un massage relaxant dans un spa haut de gamme, nous avons selectionne des etablissements reconnus pour la qualite de leurs prestations.",
    badges: ['Selection testee', 'Reservation WhatsApp', 'Conditions claires', 'Couples & groupes'],
  },
  {
    slug: 'culturelles',
    label: 'Culturelles',
    cardImage:
      'https://justmarrakech.com/storage/2024/09/15/souks-marrakech-visite-just-marrakech-1726423771.jpg',
    heroTitle: 'Activites culturelles a Marrakech',
    heroSubtitle: 'Medina, artisanat et patrimoine',
    heroDescription:
      "Explorez la medina, les souks et les lieux les plus emblematiques de Marrakech a travers une selection d'experiences pensees pour comprendre la ville au-dela des circuits rapides.",
    heroSupport:
      "Guides, ateliers, balades et rencontres avec les artisans: nous gardons le contenu de WordPress, mais dans une presentation plus claire et plus elegante.",
    badges: ['Selection testee', 'Reservation WhatsApp', 'Guide prive possible', 'Couples & groupes'],
  },
  {
    slug: 'experiences',
    label: 'Experiences',
    cardImage:
      'https://justmarrakech.com/storage/2026/02/18/vol-ballon-just-marrakech-palmeraie-montgolfiere-1771449632.jpg',
    heroTitle: 'Experiences a Marrakech',
    heroSubtitle: 'Aventure, desert et sensations',
    heroDescription:
      "Montgolfiere, quad, buggy, side-car ou chasse au tresor: cette categorie rassemble les experiences les plus immersives et les plus memorables a vivre autour de Marrakech.",
    heroSupport:
      "Chaque fiche garde ses photos, ses inclusions, ses formules et sa reservation WhatsApp, tout en restant dans votre UI premium.",
    badges: ['Selection testee', 'Reservation WhatsApp', 'Vehicule adapte au groupe', 'Couples & groupes'],
  },
  {
    slug: 'piscines',
    label: 'Piscines',
    cardImage: '/storage/images/1775831889_image-the-lemonary-villa-privee-piscine-just-marrakech-1727870496-360x240.jpg',
    heroTitle: 'Piscines a Marrakech',
    heroSubtitle: 'Day pass, villas et adresses detente',
    heroDescription:
      "Retrouvez ici les experiences piscine et beach club a Marrakech, avec un format plus lisible pour le client et des contenus facilement gerables ensuite dans l'admin.",
    heroSupport:
      "La structure est deja prete pour que toutes les adresses, horaires, photos et conditions soient ajoutees proprement par la suite.",
    badges: ['Selection testee', 'Reservation WhatsApp', 'Conditions claires', 'Day pass & groupes'],
  },
  {
    slug: 'diners-soirees',
    label: 'Diners & Soirees',
    cardImage:
      'https://justmarrakech.com/storage/2024/10/07/stand-street-food-marrakech-by-night-visite-guidee-souk-just-marrakech-1728324739.jpg',
    heroTitle: 'Diners et soirees a Marrakech',
    heroSubtitle: 'Street food, tables locales et ambiance',
    heroDescription:
      "Cette categorie rassemble les experiences gourmandes et les sorties du soir: adresses locales, street food, diners et moments a partager en couple ou en groupe.",
    heroSupport:
      "Le contenu reste celui de WordPress, mais la lecture est plus simple et le parcours de reservation plus clair.",
    badges: ['Selection testee', 'Reservation WhatsApp', 'Conditions claires', 'Couples & groupes'],
  },
];

export const ACTIVITY_OVERRIDES = {
  42: { categorySlug: 'experiences', activitySlug: 'vol-en-montgolfiere-a-marrakech', featured: true },
  43: { categorySlug: 'experiences', activitySlug: 'chasse-au-tresor-trottinette-djebel-3h', featured: true },
  45: { categorySlug: 'culturelles', activitySlug: 'atelier-bijoux-marrakech', featured: false },
  46: { categorySlug: 'culturelles', activitySlug: 'balade-2cv-a-marrakech', featured: false },
  48: { categorySlug: 'culturelles', activitySlug: 'visite-privee-medina-marrakech', featured: true },
  49: { categorySlug: 'diners-soirees', activitySlug: 'street-food-marrakech-by-night', featured: true },
  52: { categorySlug: 'experiences', activitySlug: 'buggy-agafay', featured: true },
  53: { categorySlug: 'experiences', activitySlug: 'quad-agafay', featured: false },
  54: { categorySlug: 'bien-etre', activitySlug: 'la-sultana-spa', featured: true },
  57: { categorySlug: 'experiences', activitySlug: 'buggy-palmeraie', featured: false },
  59: { categorySlug: 'experiences', activitySlug: 'quad-palmeraie', featured: false },
  60: { categorySlug: 'experiences', activitySlug: 'dromadaire-palmeraie', featured: false },
};

export const LANDING_BADGES = [
  'Selection testee',
  'Reservation WhatsApp',
  'Vehicule adapte au groupe',
  'Couples & groupes',
];

export const QUICK_PICK_COPY = [
  '6 experiences tres demandees',
  'Prix indicatifs',
  'Confirmation dispo par WhatsApp.',
  'Interlocuteur unique Just Marrakech.',
];

export function getCategoryBySlug(categorySlug) {
  return ACTIVITY_CATEGORIES.find((category) => category.slug === categorySlug) || null;
}

export function getActivityMeta(activity) {
  if (!activity) return null;
  const override = ACTIVITY_OVERRIDES[activity.id];
  if (!override) return null;
  const category = getCategoryBySlug(override.categorySlug);
  if (!category) return null;
  return {
    ...override,
    category,
  };
}

export function isManagedActivity(activity) {
  return Boolean(getActivityMeta(activity));
}

export function getManagedActivities(activities) {
  return activities.filter(isManagedActivity);
}

export function getActivitiesByCategory(activities, categorySlug) {
  return getManagedActivities(activities).filter(
    (activity) => getActivityMeta(activity)?.categorySlug === categorySlug
  );
}

export function getFeaturedActivities(activities) {
  return getManagedActivities(activities).filter(
    (activity) => getActivityMeta(activity)?.featured
  );
}

export function getActivityPath(activity) {
  const meta = getActivityMeta(activity);
  if (!meta) return `/detail/activity/${activity.id}`;
  return `/activities/${meta.categorySlug}/${meta.activitySlug}`;
}

export function findManagedActivityBySlug(activities, activitySlug) {
  return (
    getManagedActivities(activities).find(
      (activity) => getActivityMeta(activity)?.activitySlug === activitySlug
    ) || null
  );
}
