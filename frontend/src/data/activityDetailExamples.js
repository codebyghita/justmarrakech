export const ACTIVITY_DETAIL_EXAMPLES = {
  54: {
    title: 'La Sultana Spa',
    description:
      "Offrez-vous un veritable rituel marocain dans un hammam privatise a Marrakech. Un moment hors du temps entre purification, relaxation profonde et massage aux huiles naturelles.",
    full_description:
      "Une parenthese bien-etre dans un hammam beldi traditionnel privatise a Marrakech.\n\nVous commencez par la chaleur douce du hammam, puis un gommage au savon noir pour purifier la peau en profondeur.\n\nLe rituel se poursuit avec un enveloppement au rhassoul, puis un massage relaxant d'environ 1 heure aux huiles naturelles.\n\nVous terminez avec un the a la menthe dans l'espace detente, pour prolonger la sensation de calme.",
    duration: '~1h30',
    location: 'Marrakech',
    group_size: 'Prive',
    price_from: 60,
    images: [
      '/storage/images/activities/69d8d14d8fd15_vol-en-montgolfiere-just-marrakech-1771449585-360x240.jpg',
      '/storage/images/activities/69d8d14f25bbf_vol-ballon-just-marrakech-palmeraie-montgolfiere-1771449632.jpg',
      '/storage/images/activities/69d8d150a0fe6_vol-montgolfiere-marrakech-preparation-decollage-1771449632.jpg',
      '/storage/images/activities/69d8d154519d3_vol-montgolfiere-marrakech-decollage-1771449631.jpg',
      '/storage/images/activities/69d8d1575de16_vol-montgolfiere-marrakech-petit-dejeuner-1771449632.jpg',
    ],
    formulas: [
      {
        title: 'Rituel Prive Signature',
        price: 'A partir de 60 EUR / personne',
        includes: [
          'Hammam purifiant',
          'Gommage au gant de Kessa et savon noir',
          'Enveloppement corporel au rhassoul',
          "Massage relaxant d'environ 1h aux huiles naturelles",
          'The a la menthe offert (espace detente)',
        ],
      },
      {
        title: 'Rituel Duo Premium',
        price: 'A partir de 120 EUR (2 pers)',
        includes: [
          'Experience privatisee pour 2 personnes',
          'Hammam + gommage + rhassoul',
          'Massage relaxant en duo',
          'Pause detente avec the et douceurs',
          'Assistance reservation via WhatsApp',
        ],
      },
    ],
    included: [
      'Acces privatise au hammam',
      'The a la menthe (espace detente)',
      'Peignoir, chaussons, dessous jetables',
      "Massage relaxant d'environ 1h aux huiles naturelles",
      'Enveloppement au rhassoul',
      'Savon noir + gant de Kessa',
    ],
    not_included: [
      "Transport jusqu'au hammam (en option)",
      'Achats personnels eventuels',
      'Pourboire ou gratification',
    ],
    practical_info_points: [
      "Lieu: Gueliz, a proximite du Radisson Blu (adresse precise apres reservation)",
      'Horaires: 11h00 - 20h00 (ferme le dimanche)',
      'Participants: experience privatisee pour couples, amis et familles',
      "Age minimum: 16 ans accompagne",
      'Accessibilite: non accessible aux fauteuils roulants',
      "A prevoir: vetements confortables apres les soins, maillot possible (optionnel)",
    ],
    faq: [
      {
        question: 'Peut-on reserver en derniere minute ?',
        answer:
          "Oui, selon disponibilite. Pour avoir le meilleur horaire, il est conseille de reserver au moins 24h a l'avance.",
        condition: 'Reservation minimum 24h avant',
        image:
          '/storage/images/activities/69d8d150a0fe6_vol-montgolfiere-marrakech-preparation-decollage-1771449632.jpg',
        image_caption: 'Exemple visuel de l experience',
      },
      {
        question: 'Le transport est-il inclus ?',
        answer:
          "Le transport peut etre ajoute en option. Sinon, nous vous envoyons l'adresse exacte apres validation.",
        condition: 'Transport non inclus dans le tarif de base',
      },
      {
        question: 'Cette activite convient-elle aux couples ?',
        answer:
          "Oui, ce rituel est ideal en duo et peut etre organise en version romantique selon votre demande.",
        condition: 'Disponible en version duo selon disponibilite',
      },
      {
        question: 'Comment confirmer ma reservation ?',
        answer:
          'Vous choisissez votre formule puis vous confirmez via WhatsApp avec la date et l heure souhaitees.',
        condition: 'Confirmation finale apres validation de la disponibilite',
      },
    ],
    reviews: [
      {
        id: 'seed-1',
        name: 'Salma',
        rating: 5,
        comment:
          "Experience tres relaxante. L'equipe etait ponctuelle, le lieu propre et le massage top.",
        createdAt: '2026-04-12T10:00:00.000Z',
      },
      {
        id: 'seed-2',
        name: 'Yassine',
        rating: 4,
        comment:
          'Bonne organisation globale. Le rituel etait conforme, je recommande pour un moment detente a Marrakech.',
        createdAt: '2026-04-13T15:30:00.000Z',
      },
    ],
  },
};

export function getActivityDetailExample(activity) {
  if (!activity?.id) return null;
  return ACTIVITY_DETAIL_EXAMPLES[activity.id] || null;
}
