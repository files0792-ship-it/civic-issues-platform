import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIssueFilter } from './issueQuery.js';
import { normalizeImagePath, publicImageUrl } from './issueShape.js';

const gujaratIssue = {
  state: 'Gujarat',
  city: 'Jamnagar',
  location: 'Jamnagar, Gujarat',
};

const mumbaiIssue = {
  state: 'Maharashtra',
  city: 'Mumbai',
  location: 'Mumbai, Maharashtra',
};

const legacyIssue = {
  location: 'Jamnagar, Gujarat',
};

function matchesRegex(value, regex) {
  if (value == null) return false;
  return regex.test(String(value));
}

function matchClause(doc, clause) {
  if (clause.state) return matchesRegex(doc.state, clause.state);
  if (clause.city) return matchesRegex(doc.city, clause.city);
  if (clause.location) return matchesRegex(doc.location, clause.location);
  return false;
}

function matchesFilter(doc, filter) {
  if (filter.status && doc.status !== filter.status) return false;

  function evalNode(node) {
    if (node.$and) return node.$and.every(evalNode);
    if (node.$or) return node.$or.some((clause) => matchClause(doc, clause));
    return true;
  }

  const { status, ...rest } = filter;
  if (Object.keys(rest).length === 0) return true;
  return evalNode(rest);
}

test('state only matches Gujarat issue', () => {
  const filter = buildIssueFilter({ state: 'Gujarat' });
  assert.equal(matchesFilter(gujaratIssue, filter), true);
  assert.equal(matchesFilter(legacyIssue, filter), true);
  assert.equal(matchesFilter(mumbaiIssue, filter), false);
});

test('city only matches Jamnagar issue', () => {
  const filter = buildIssueFilter({ city: 'Jamnagar' });
  assert.equal(matchesFilter(gujaratIssue, filter), true);
  assert.equal(matchesFilter(legacyIssue, filter), true);
  assert.equal(matchesFilter(mumbaiIssue, filter), false);
});

test('state and city together match only Jamnagar in Gujarat', () => {
  const filter = buildIssueFilter({ state: 'Gujarat', city: 'Jamnagar' });
  assert.equal(matchesFilter(gujaratIssue, filter), true);
  assert.equal(matchesFilter(legacyIssue, filter), true);
  assert.equal(matchesFilter(mumbaiIssue, filter), false);
});

test('case insensitive state filter', () => {
  const filter = buildIssueFilter({ state: 'gujarat' });
  assert.equal(matchesFilter(gujaratIssue, filter), true);
});

test('text search combines with location filters via $and', () => {
  const filter = buildIssueFilter({ q: 'pothole', state: 'Gujarat' });
  assert.ok(filter.$and);
  assert.ok(filter.$and.some((part) => part.$text));
  assert.ok(filter.$and.some((part) => part.$or));
  assert.equal(filter.$text, undefined);
});

test('normalizeImagePath handles legacy formats', () => {
  assert.equal(normalizeImagePath('issues/photo.jpg'), 'issues/photo.jpg');
  assert.equal(normalizeImagePath('uploads/issues/photo.jpg'), 'issues/photo.jpg');
  assert.equal(normalizeImagePath('photo.jpg'), 'issues/photo.jpg');
  assert.equal(normalizeImagePath('/uploads/issues/photo.jpg'), 'issues/photo.jpg');
});

test('publicImageUrl avoids duplicated uploads segment', () => {
  assert.equal(publicImageUrl('uploads/issues/photo.jpg'), '/uploads/issues/photo.jpg');
  assert.equal(publicImageUrl('photo.jpg'), '/uploads/issues/photo.jpg');
});
