import test from 'node:test';
import assert from 'node:assert/strict';
import { applyLocationFilters } from './locationFilter.js';

test('state filter matches dedicated state field', () => {
  const filter = applyLocationFilters({}, { state: 'Gujarat' });
  assert.ok(filter.$or);
  assert.equal(filter.$or.length, 3);
});

test('city filter matches dedicated city field', () => {
  const filter = applyLocationFilters({}, { city: 'Jamnagar' });
  assert.ok(filter.$or);
  assert.equal(filter.$or.length, 3);
});

test('state and city filters combine with AND', () => {
  const filter = applyLocationFilters({}, { state: 'Gujarat', city: 'Jamnagar' });
  assert.ok(filter.$and);
  assert.equal(filter.$and.length, 2);
});

test('legacy location matches state filter', () => {
  const filter = applyLocationFilters({}, { state: 'Gujarat' });
  const locationClause = filter.$or.find((clause) => clause.location);
  assert.match('Jamnagar, Gujarat', locationClause.location);
});

test('legacy location matches city filter', () => {
  const filter = applyLocationFilters({}, { city: 'Jamnagar' });
  const locationClause = filter.$or.find((clause) => clause.location);
  assert.match('Jamnagar, Gujarat', locationClause.location);
});

test('state filter ignores other states', () => {
  const filter = applyLocationFilters({}, { state: 'Gujarat' });
  const locationClause = filter.$or.find((clause) => clause.location);
  assert.doesNotMatch('Mumbai, Maharashtra', locationClause.location);
});

test('city filter ignores other cities', () => {
  const filter = applyLocationFilters({}, { city: 'Jamnagar' });
  const locationClause = filter.$or.find((clause) => clause.location);
  assert.doesNotMatch('Mumbai, Maharashtra', locationClause.location);
});
