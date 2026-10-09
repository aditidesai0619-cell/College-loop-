// Visual identity per club: a default poster (illustration, no photos of people) and an accent colour.
// Matched by keyword so renamed/new clubs still get something sensible.
const CLUB_STYLES = [
  { match: /tech/i, poster: 'club-technical', accent: 'forest' },
  { match: /cultur/i, poster: 'club-cultural', accent: 'terra' },
  { match: /innov|entrepren/i, poster: 'club-innovation', accent: 'mustard' },
  { match: /film|cinema/i, poster: 'club-film', accent: 'ink' },
  { match: /women/i, poster: 'club-women', accent: 'blush' },
  { match: /financ|litera/i, poster: 'club-literary', accent: 'sage' },
  { match: /media|photo/i, poster: 'club-media', accent: 'terra' },
];

const ACCENTS = ['forest', 'sage', 'terra', 'mustard', 'blush', 'ink'];

const hash = (s = '') => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const styleFor = (name = '') => CLUB_STYLES.find((s) => s.match.test(name));

export const clubImage = (name) => {
  const s = styleFor(name);
  return s ? `/posters/${s.poster}.svg` : '';
};

export const clubAccent = (name) => styleFor(name)?.accent || ACCENTS[hash(name) % ACCENTS.length];

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

// Image sources in priority order: organizer-uploaded poster > seeded default artwork > club default poster
export const eventImageSources = (event) =>
  [...new Set([event?.poster, event?.coverImage, clubImage(event?.organizer?.name)].filter(Boolean))];
