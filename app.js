const state = { jobs: [], query: '', track: 'all', type: 'all', fit: 'all' };
const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (url, label) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>`;
const typeOrder = {'full-time':0,'contract':1,'internship':2};
const typeLabels = {'full-time':'Full-time','contract':'Contract','internship':'Internship'};
const trackLabels = {pharma:'Pharma & healthtech',process:'Process & quality',analytics:'Analytics & data',operations:'Operations'};
let lastVerified = '';

function card(job) {
  const person = job.contact ? `${escapeHtml(job.contact.name)} · ${escapeHtml(job.contact.role)}<br>${link(job.contact.url, job.contact.method || 'Public professional profile')}<br>${link(job.contact.source, 'Attribution')}` : 'No verified personal contact route. Use the direct application link.';
  const stage = job.stage ? `${escapeHtml(job.stage)} · ${link(job.stageSource || job.apply, 'Stage source')}` : 'Stage unconfirmed';
  return `<article class="card">
    <div class="card-top"><span class="company">${escapeHtml(job.company)}</span><span class="fit-badge fit-${escapeHtml(job.fit)}">${escapeHtml(job.fit)} fit</span></div>
    <h3>${escapeHtml(job.role)}</h3>
    <div class="chips"><span class="chip ${job.type === 'internship' ? 'internship' : ''}">${escapeHtml(job.typeLabel || typeLabels[job.type])}</span><span class="chip">${escapeHtml(job.arrangement)}</span><span class="chip">${escapeHtml(job.trackLabel || trackLabels[job.track])}</span></div>
    <p class="fit-line">${escapeHtml(job.fitLine)}</p>
    <p class="resume">Use the <strong>${escapeHtml(job.resume)}</strong> résumé${job.caveat ? ` · ${escapeHtml(job.caveat)}` : ''}</p>
    <div class="card-actions"><a class="apply" href="${escapeHtml(job.apply)}" target="_blank" rel="noopener noreferrer">Apply directly ↗</a></div>
    <details><summary>Sources, stage & contact</summary><div class="detail-grid"><p><strong>Application</strong>${link(job.apply,'Open posting')}</p><p><strong>Checked</strong>${escapeHtml(job.checked || lastVerified)}</p><p><strong>Company stage</strong>${stage}</p><p><strong>Named contact</strong>${person}</p><p><strong>Work arrangement</strong>${escapeHtml(job.locationDetail || 'Bengaluru')}</p><p><strong>Posting source</strong>${link(job.source || job.apply,job.sourceLabel || 'Application page')}</p></div></details>
  </article>`;
}

function render() {
  const q = state.query.toLocaleLowerCase();
  const filtered = state.jobs.filter(j => (state.track === 'all' || j.track === state.track) && (state.type === 'all' || j.type === state.type) && (state.fit === 'all' || j.fit === state.fit) && (!q || [j.company,j.role,j.fitLine,j.trackLabel || trackLabels[j.track],j.arrangement].join(' ').toLocaleLowerCase().includes(q)));
  filtered.sort((a,b) => (typeOrder[a.type] - typeOrder[b.type]) || (['strong','possible','stretch'].indexOf(a.fit) - ['strong','possible','stretch'].indexOf(b.fit)) || a.company.localeCompare(b.company) || a.role.localeCompare(b.role));
  $('cards').innerHTML = filtered.map(card).join('');
  $('result-count').textContent = `${filtered.length} of ${state.jobs.length} verified roles`;
  $('empty').hidden = filtered.length > 0;
}

fetch('jobs.json').then(r => { if (!r.ok) throw new Error('Could not load the opportunity list.'); return r.json(); }).then(data => {
  state.jobs = data.jobs;
  lastVerified = data.lastVerified;
  $('verified-date').textContent = data.lastVerified;
  $('job-count').textContent = data.jobs.length;
  $('company-count').textContent = new Set(data.jobs.map(j=>j.company)).size;
  $('fulltime-count').textContent = data.jobs.filter(j=>j.type==='full-time').length;
  render();
}).catch(error => { $('cards').innerHTML = `<p class="empty">${escapeHtml(error.message)}</p>`; });

$('search').addEventListener('input', e => { state.query=e.target.value.trim(); render(); });
for (const key of ['track','type','fit']) $(key).addEventListener('change', e => { state[key]=e.target.value; render(); });
$('clear-filters').addEventListener('click', () => { state.query='';state.track='all';state.type='all';state.fit='all';$('search').value='';for(const key of ['track','type','fit']) $(key).value='all';render(); });
