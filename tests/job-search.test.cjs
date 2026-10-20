const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('src/templates/candidate.html', 'utf8');
const between = (start, end) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)));
const loader = between('    async function loadJobs(', '    function loadMoreJobs(');
const search = between('    function syncJobSearchInputs(', '    function renderCategoryPills(');

function setup(elements = {jobSearchInput: {value: ''}, mapJobSearchInput: {value: ''}}) {
  const urls = [], tasks = [], errors = [];
  const context = vm.createContext({
    document: {getElementById: id => elements[id]},
    // Reproduce the old browser named-property collision: neither collection has .value.
    window: {jobSearchInput: {length: 2}}, jobSearchInput: {length: 2},
    String, URLSearchParams, userLocation: {}, radiusKm: 35, jobScope: 'all',
    jobSortBy: 'match', selectedCategory: 'All', selectedCompanyName: '',
    jobsOffset: 0, jobsList: [], companiesList: [], categoriesList: [], activeCompanyId: null,
    jobsHasMore: false, jobsSummary: {}, searchDebounceTimer: null,
    api: async url => { urls.push(url); return {ok: true, data: {jobs: []}}; },
    clearTimeout() {}, setTimeout(fn) { tasks.push(fn); return tasks.length; },
    toast: text => errors.push(text), renderLocationControls() {}, renderCategoryPills() {},
    renderSummaryBadges() {}, renderCompaniesMap() {}, renderJobs() {},
  });
  vm.runInContext(loader + search, context);
  return {context, elements, urls, tasks, errors};
}

test('map and list search fields each have a unique ID', () => {
  for (const id of ['jobSearchInput', 'mapJobSearchInput']) {
    assert.equal((html.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1);
  }
});

test('initial job loading tolerates an absent search control', async () => {
  const {context, urls} = setup({});
  await context.loadJobs();
  assert.equal(new URL(urls[0], 'https://local.test').searchParams.has('q'), false);
});

test('both search boxes synchronize and send a trimmed query despite a named-property collision', async () => {
  const {context, elements, urls, tasks} = setup();
  context.debouncedJobSearch('  Finance & audit  ');
  assert.equal(elements.jobSearchInput.value, elements.mapJobSearchInput.value);
  tasks.pop()();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(new URL(urls[0], 'https://local.test').searchParams.get('q'), 'Finance & audit');
  context.debouncedJobSearch('');
  tasks.pop()();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(elements.mapJobSearchInput.value, '');
  assert.equal(new URL(urls[1], 'https://local.test').searchParams.has('q'), false);
});

test('a failed search shows a message instead of an unhandled rejection', async () => {
  const {context, tasks, errors} = setup();
  context.api = async () => { throw new Error('Connection unavailable'); };
  context.debouncedJobSearch('analyst');
  tasks.pop()();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(errors, ['Connection unavailable']);
});
