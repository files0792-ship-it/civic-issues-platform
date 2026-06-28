import { State, City } from 'country-state-city';

const COUNTRY_CODE = 'IN';

export function getIndianStates() {
  return State.getStatesOfCountry(COUNTRY_CODE)
    .map((s) => ({ value: s.isoCode, label: s.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getIndianCities(stateCode) {
  if (!stateCode) return [];
  return City.getCitiesOfState(COUNTRY_CODE, stateCode)
    .map((c) => ({ value: c.name, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

let allIndianCitiesCache = null;

export function getAllIndianCities() {
  if (allIndianCitiesCache) return allIndianCitiesCache;

  const seen = new Set();
  const cities = [];

  for (const state of getIndianStates()) {
    for (const city of getIndianCities(state.value)) {
      if (!seen.has(city.value)) {
        seen.add(city.value);
        cities.push(city);
      }
    }
  }

  allIndianCitiesCache = cities.sort((a, b) => a.label.localeCompare(b.label));
  return allIndianCitiesCache;
}

export function getIndianStateName(stateCode) {
  return State.getStateByCodeAndCountry(stateCode, COUNTRY_CODE)?.name || '';
}

export function getIssueGroupKey(issue) {
  if (issue.city && issue.state) {
    return `${issue.city}|${issue.state}`.trim().toLowerCase();
  }
  return (issue.location || '').trim().toLowerCase();
}

export function getGeocodeQuery(issue) {
  if (issue.city && issue.state) {
    return `${issue.city}, ${issue.state}, India`;
  }
  return issue.location || '';
}
