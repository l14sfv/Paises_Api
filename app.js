const API_URL = 'https://restcountries.com/v3.1/all';
const FALLBACK_URL = 'https://restcountries.com/v3.1/all';

const translations = {
  en: {
    appTitle: 'Where in the world?',
    searchPlaceholder: 'Search for a country...',
    filterLabel: 'Filter by region',
    filterAll: 'Filter by Region',
    noResults: 'No countries match your search.',
    back: 'Back',
    population: 'Population',
    region: 'Region',
    capital: 'Capital',
    nativeName: 'Native Name',
    subRegion: 'Sub Region',
    topLevelDomain: 'Top Level Domain',
    currencies: 'Currencies',
    languages: 'Languages',
    borderCountries: 'Border Countries',
    noBorders: 'No border countries',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    spanish: 'Español',
    english: 'English',
    loading: 'Loading countries...',
    america: 'America'
  },
  es: {
    appTitle: '¿En qué parte del mundo?',
    searchPlaceholder: 'Buscar un país...',
    filterLabel: 'Filtrar por región',
    filterAll: 'Filtrar por Región',
    noResults: 'No hay países que coincidan con tu búsqueda.',
    back: 'Volver',
    population: 'Población',
    region: 'Región',
    capital: 'Capital',
    nativeName: 'Nombre nativo',
    subRegion: 'Subregión',
    topLevelDomain: 'Dominio superior',
    currencies: 'Monedas',
    languages: 'Idiomas',
    borderCountries: 'Países fronterizos',
    noBorders: 'Sin países fronterizos',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    spanish: 'Español',
    english: 'English',
    loading: 'Cargando países...',
    america: 'América'
  }
};

const state = {
  countries: [],
  filteredCountries: [],
  currentCountry: null,
  currentLang: 'en',
  currentTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
};

const countriesGrid = document.getElementById('countriesGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const regionSelect = document.getElementById('regionSelect');
const countriesView = document.getElementById('countriesView');
const detailView = document.getElementById('detailView');
const detailCard = document.getElementById('detailCard');
const backButton = document.getElementById('backButton');
const themeToggle = document.getElementById('themeToggle');
const themeToggleText = document.getElementById('themeToggleText');
const languageToggle = document.getElementById('languageToggle');
const languageToggleText = document.getElementById('languageToggleText');

function t(key) {
  return translations[state.currentLang][key] || key;
}

function setTheme(theme) {
  state.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  themeToggleText.textContent = theme === 'dark' ? t('lightMode') : t('darkMode');
  themeToggle.querySelector('.toolbar-btn__icon').textContent = theme === 'dark' ? '☀️' : '🌙';
}

function setLanguage(lang) {
  state.currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  languageToggleText.textContent = lang === 'en' ? t('spanish') : t('english');
  themeToggleText.textContent = state.currentTheme === 'dark' ? t('lightMode') : t('darkMode');

  const americaOption = [...regionSelect.options].find(option => option.value === 'Americas');
  if (americaOption) americaOption.textContent = t('america');

  renderCountries(state.filteredCountries);

  if (state.currentCountry) {
    renderDetail(state.currentCountry);
  }
}

async function loadCountries() {
  emptyState.classList.remove('hidden');
  emptyState.textContent = t('loading');

  try {
    let response = await fetch(API_URL);
    if (!response.ok) throw new Error('Primary API failed');
    const data = await response.json();
    state.countries = data.map(normalizeV2Country);
  } catch (error) {
    const fallbackResponse = await fetch(FALLBACK_URL);
    const fallbackData = await fallbackResponse.json();
    state.countries = fallbackData.map(normalizeV3Country);
  }

  state.filteredCountries = [...state.countries];
  emptyState.textContent = t('noResults');
  renderCountries(state.filteredCountries);
}

function normalizeV2Country(country) {
  return {
    code: country.alpha3Code,
    name: country.name,
    nativeName: country.nativeName || country.name,
    population: country.population,
    region: country.region,
    subregion: country.subregion,
    capital: country.capital,
    flag: country.flags?.png || country.flag,
    topLevelDomain: country.topLevelDomain || [],
    currencies: country.currencies || [],
    languages: country.languages || [],
    borders: country.borders || []
  };
}

function normalizeV3Country(country) {
  return {
    code: country.cca3,
    name: country.name?.common || 'Unknown',
    nativeName: Object.values(country.name?.nativeName || {})[0]?.common || country.name?.common || 'Unknown',
    population: country.population || 0,
    region: country.region || '',
    subregion: country.subregion || '',
    capital: country.capital?.[0] || 'N/A',
    flag: country.flags?.png || country.flags?.svg || '',
    topLevelDomain: country.tld || [],
    currencies: Object.entries(country.currencies || {}).map(([code, value]) => ({ code, name: value.name })),
    languages: Object.values(country.languages || {}).map(name => ({ name })),
    borders: country.borders || []
  };
}

function formatNumber(value) {
  return new Intl.NumberFormat(state.currentLang === 'es' ? 'es-CO' : 'en-US').format(value);
}

function renderCountries(countries) {
  countriesGrid.innerHTML = '';

  if (!countries.length) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  countries.forEach(country => {
    const card = document.createElement('button');
    card.className = 'country-card';
    card.type = 'button';

    card.innerHTML = `
      <img src="${country.flag}" alt="${country.name} flag" loading="lazy" width="320" height="200">
      <div class="country-card__body">
        <h2>${country.name}</h2>
        <p><strong>${t('population')}:</strong> ${formatNumber(country.population)}</p>
        <p><strong>${t('region')}:</strong> ${country.region || '—'}</p>
        <p><strong>${t('capital')}:</strong> ${country.capital || '—'}</p>
      </div>
    `;

    card.addEventListener('click', () => showCountryDetail(country.code));
    countriesGrid.appendChild(card);
  });
}

function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();
  const region = regionSelect.value;

  state.filteredCountries = state.countries.filter(country => {
    const matchesTerm = country.name.toLowerCase().includes(term);
    const matchesRegion = region === 'all' || country.region === region;
    return matchesTerm && matchesRegion;
  });

  renderCountries(state.filteredCountries);
}

function showCountryDetail(code) {
  const country = state.countries.find(item => item.code === code);
  if (!country) return;

  state.currentCountry = country;
  renderDetail(country);

  countriesView.classList.add('hidden');
  detailView.classList.remove('hidden');
}

function renderDetail(country) {
  const borderCountries = country.borders
    .map(code => state.countries.find(item => item.code === code))
    .filter(Boolean);

  detailCard.innerHTML = `
    <img class="detail-flag" src="${country.flag}" alt="${country.name} flag" width="560" height="400">
    <div class="detail-content">
      <h2>${country.name}</h2>
      <div class="detail-columns">
        <div>
          <p><strong>${t('nativeName')}:</strong> ${country.nativeName || '—'}</p>
          <p><strong>${t('population')}:</strong> ${formatNumber(country.population)}</p>
          <p><strong>${t('region')}:</strong> ${country.region || '—'}</p>
          <p><strong>${t('subRegion')}:</strong> ${country.subregion || '—'}</p>
          <p><strong>${t('capital')}:</strong> ${country.capital || '—'}</p>
        </div>
        <div>
          <p><strong>${t('topLevelDomain')}:</strong> ${(country.topLevelDomain || []).join(', ') || '—'}</p>
          <p><strong>${t('currencies')}:</strong> ${(country.currencies || []).map(item => item.name).join(', ') || '—'}</p>
          <p><strong>${t('languages')}:</strong> ${(country.languages || []).map(item => item.name).join(', ') || '—'}</p>
        </div>
      </div>
      <div class="border-countries">
        <p><strong>${t('borderCountries')}:</strong></p>
        <div class="border-list">
          ${
            borderCountries.length
              ? borderCountries.map(item =>
                  `<button class="border-chip" type="button" data-border="${item.code}">${item.name}</button>`
                ).join('')
              : `<span>${t('noBorders')}</span>`
          }
        </div>
      </div>
    </div>
  `;

  detailCard.querySelectorAll('[data-border]').forEach(button => {
    button.addEventListener('click', () => showCountryDetail(button.dataset.border));
  });
}

searchInput.addEventListener('input', applyFilters);
regionSelect.addEventListener('change', applyFilters);

backButton.addEventListener('click', () => {
  detailView.classList.add('hidden');
  countriesView.classList.remove('hidden');
});

themeToggle.addEventListener('click', () => {
  setTheme(state.currentTheme === 'dark' ? 'light' : 'dark');
});

languageToggle.addEventListener('click', () => {
  setLanguage(state.currentLang === 'en' ? 'es' : 'en');
});

setTheme(state.currentTheme);
setLanguage('en');
loadCountries();
