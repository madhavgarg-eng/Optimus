import { setupData } from './data-bridge.js';
export function bootOptimus(db){
const localISO = d => new Date(d.getTime() - d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const TODAY_REAL = new Date();
const TODAY = db.demo ? new Date('2026-10-15T09:30:00') : TODAY_REAL;
const TODAY_ISO = localISO(TODAY);
const isoWeek = d => { const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())); const n=t.getUTCDay()||7; t.setUTCDate(t.getUTCDate()+4-n); return Math.ceil(((t-Date.UTC(t.getUTCFullYear(),0,1))/864e5+1)/7); };
const nowStamp = () => { const d=new Date(); return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'})+', '+d.toTimeString().slice(0,5); };
const newId = (p, n) => db.demo ? p + n : p + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
const D = s => new Date(s + 'T00:00:00');
const dayDiff = s => Math.round((D(s) - D(TODAY_ISO)) / 864e5);
const fmt = s => { const d = D(s); return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}); };
const fmtLong = s => D(s).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const inr = n => '₹' + n.toLocaleString('en-IN');

/* ---------------- sample data ---------------- */
const USERS = {
  rajiv:{name:'Rajiv Gupta',role:'Chairperson',kind:'chair',color:'#111111'},
  neha:{name:'Neha Kadian',role:'Head of Operations',kind:'head',color:'#3B3B3B'},
  madhav:{name:'Madhav Garg',role:'DWM Owner',kind:'owner',color:'#5F5F5F'},
  shivpriya:{name:'Shivpriya',role:'Team Lead',kind:'lead',color:'#404040'},
  ananya:{name:'Ananya Sharma',role:'Programme Manager',kind:'pm',color:'#1D4ED8'},
  karan:{name:'Karan Mehta',role:'Programme Manager',kind:'pm',color:'#6B7280'},
  ishita:{name:'Ishita Rao',role:'Programme Manager',kind:'pm',color:'#D97706'}
};
const PMS = ['ananya','karan','ishita'];
const UU = id => USERS[id] || {name:String(id||'Unknown'), role:'', kind:'pm', color:'#737373'};
const initials = id => UU(id).name.split(' ').map(w=>w[0]).slice(0,2).join('');

let TASKS = [
  {id:'T-1042',title:'Share Q3 faculty utilisation summary',owner:'ananya',by:'rajiv',due:'2026-10-12',status:'doing',freq:'One-off',cat:'Faculty',pri:'High',record:'Summary attached',comments:[{u:'rajiv',t:'Please include faculty not called since July.',w:'10 Oct'}]},
  {id:'T-1043',title:'Finalise venue for Delhi residency (Nov cohort)',owner:'karan',by:'rajiv',due:'2026-10-14',status:'blocked',freq:'One-off',cat:'Sessions',pri:'High',record:'Venue confirmation',comments:[{u:'karan',t:'Waiting on the hotel quote, chasing today.',w:'14 Oct'}]},
  {id:'T-1044',title:'Upload class notes: Succession Planning (12 Oct)',owner:'ananya',by:'madhav',due:'2026-10-14',status:'todo',freq:'Per session',cat:'Notes',pri:'Medium',record:'Notes on session',comments:[]},
  {id:'T-1045',title:'Clear TDS for September guest sessions',owner:'ishita',by:'neha',due:'2026-10-10',status:'doing',freq:'Monthly',cat:'Payments',pri:'High',record:'TDS fields updated',comments:[{u:'neha',t:'Finance needs this before the 15th.',w:'8 Oct'}]},
  {id:'T-1046',title:'Confirm faculty for Family Constitution workshop',owner:'ananya',by:'shivpriya',due:TODAY_ISO,status:'todo',freq:'Per session',cat:'Sessions',pri:'High',record:'Faculty linked to session',comments:[]},
  {id:'T-1047',title:'Send pre-read to OPMC2 for Governance module',owner:'ananya',by:'ananya',due:TODAY_ISO,status:'todo',freq:'Per session',cat:'Sessions',pri:'Medium',record:'Email sent',comments:[]},
  {id:'T-1048',title:'Quarterly learner 1:1s (Q4)',owner:'ananya',by:'madhav',due:'2026-12-31',status:'doing',freq:'Quarterly',cat:'Students',pri:'Medium',record:'Interaction logs',comments:[]},
  {id:'T-1049',title:'Quarterly connect: faculty not called since July',owner:'ananya',by:'madhav',due:'2026-12-31',status:'doing',freq:'Quarterly',cat:'Faculty',pri:'Medium',record:'Interaction logs',comments:[]},
  {id:'T-1050',title:'Draft Q4 guest speaker shortlist',owner:'karan',by:'rajiv',due:'2026-10-20',status:'doing',freq:'One-off',cat:'Faculty',pri:'Medium',record:'Shortlist attached',comments:[]},
  {id:'T-1051',title:'Readiness checklist: Mumbai alumni evening',owner:'ishita',by:'shivpriya',due:'2026-10-17',status:'todo',freq:'Per session',cat:'Sessions',pri:'High',record:'Checklist complete',comments:[]},
  {id:'T-1052',title:'Record September KPI actuals',owner:'karan',by:'madhav',due:'2026-10-06',status:'done',freq:'Monthly',cat:'KPIs',pri:'High',record:'KPI entry',comments:[]},
  {id:'T-1053',title:'Record September KPI actuals',owner:'ishita',by:'madhav',due:'2026-10-06',status:'done',freq:'Monthly',cat:'KPIs',pri:'High',record:'KPI entry',comments:[]},
  {id:'T-1054',title:'Prepare board note on programme outcomes',owner:'neha',by:'rajiv',due:'2026-10-22',status:'doing',freq:'One-off',cat:'Reporting',pri:'High',record:'Note attached',comments:[]},
  {id:'T-1055',title:'Collect feedback forms: Wealth Transition session',owner:'ishita',by:'ishita',due:'2026-10-13',status:'todo',freq:'Per session',cat:'Students',pri:'Low',record:'Feedback uploaded',comments:[]},
  {id:'T-1056',title:'Update faculty directory with new expertise tags',owner:'karan',by:'madhav',due:'2026-10-24',status:'todo',freq:'One-off',cat:'Faculty',pri:'Low',record:'Directory updated',comments:[]},
  {id:'T-1057',title:'Weekly compliance report',owner:'madhav',by:'rajiv',due:'2026-10-19',status:'todo',freq:'Weekly',cat:'Reporting',pri:'Medium',record:'Report sent',comments:[]},
  {id:'T-1058',title:'Book travel for Prof. Menon (Bengaluru session)',owner:'karan',by:'shivpriya',due:'2026-10-16',status:'todo',freq:'Per session',cat:'Sessions',pri:'Medium',record:'Tickets attached',comments:[]},
  {id:'T-1059',title:'Quarterly learner 1:1s (Q4)',owner:'karan',by:'madhav',due:'2026-12-31',status:'doing',freq:'Quarterly',cat:'Students',pri:'Medium',record:'Interaction logs',comments:[]},
  {id:'T-1060',title:'Upload class notes: Next-Gen Leadership (9 Oct)',owner:'ishita',by:'madhav',due:'2026-10-13',status:'todo',freq:'Per session',cat:'Notes',pri:'Medium',record:'Notes on session',comments:[]}
];

let SESSIONS = [
  {id:'S-311',date:'2026-10-12',time:'10:00',prog:'OPM',cohort:'OPMC2',title:'Succession Planning in Practice',mode:'Offline',venue:'Gurugram campus, Room 2.4',fac:'f1',pm:'ananya',notes:false,check:[1,1,1,1,1],pay:{inv:'Received',paid:'Pending',tds:'Not deducted'}},
  {id:'S-312',date:'2026-10-09',time:'16:00',prog:'EBAP',cohort:'EBAPC2',title:'Next-Gen Leadership Roundtable',mode:'Online',venue:'Zoom',fac:'f4',pm:'ishita',notes:false,check:[1,1,1,1,1],pay:{inv:'Received',paid:'Paid',tds:'Deducted'}},
  {id:'S-313',date:'2026-10-16',time:'11:00',prog:'OPM',cohort:'OPMC2',title:'Family Governance and Councils',mode:'Online',venue:'Zoom',fac:'f2',pm:'ananya',notes:false,check:[1,1,0,1,0],pay:{inv:'Not due',paid:'Not due',tds:'Not due'}},
  {id:'S-314',date:'2026-10-17',time:'18:30',prog:'OPM',cohort:'All OPM cohorts',title:'Mumbai Alumni Evening',mode:'Offline',venue:'Taj Lands End, Mumbai',fac:'f6',pm:'ishita',notes:false,check:[1,0,0,1,0],pay:{inv:'Not due',paid:'Not due',tds:'Not due'}},
  {id:'S-315',date:'2026-10-20',time:'10:00',prog:'OPM',cohort:'OPMC1',title:'Family Constitution Workshop',mode:'Offline',venue:'Gurugram campus, Room 1.2',fac:null,pm:'ananya',notes:false,check:[0,0,1,0,0],pay:{inv:'Not due',paid:'Not due',tds:'Not due'}},
  {id:'S-316',date:'2026-10-21',time:'15:00',prog:'EBAP',cohort:'EBAPC1',title:'Wealth and Philanthropy',mode:'Online',venue:'Zoom',fac:'f5',pm:'karan',notes:false,check:[1,1,1,0,0],pay:{inv:'Not due',paid:'Not due',tds:'Not due'}},
  {id:'S-317',date:'2026-10-23',time:'10:00',prog:'EBAP',cohort:'EBAPC1',title:'Managing Family Conflict',mode:'Offline',venue:'Bengaluru, Leela Palace',fac:'f3',pm:'karan',notes:false,check:[1,0,0,0,0],pay:{inv:'Not due',paid:'Not due',tds:'Not due'}},
  {id:'S-318',date:'2026-10-06',time:'14:00',prog:'EBAP',cohort:'EBAPC2',title:'Wealth Transition Across Generations',mode:'Online',venue:'Zoom',fac:'f7',pm:'ishita',notes:true,check:[1,1,1,1,1],pay:{inv:'Received',paid:'Paid',tds:'Deducted'}},
  {id:'S-319',date:'2026-10-03',time:'10:00',prog:'EBAP',cohort:'EBAPC1',title:'Strategy for Family Enterprises',mode:'Offline',venue:'Gurugram campus, Room 2.4',fac:'f8',pm:'karan',notes:true,check:[1,1,1,1,1],pay:{inv:'Received',paid:'Paid',tds:'Deducted'}}
];
const CHECK_ITEMS = ['Faculty confirmed','Venue or link shared','Pre-read sent','Reminder to students','Travel and logistics'];

const FACULTY = {
  f1:{name:'Dr. Arvind Menon',exp:'Succession, governance',city:'Bengaluru',sessions:6,lastSession:'2026-10-12',lastContact:'2026-10-12',rating:4.7,pm:'ananya',senior:true},
  f2:{name:'Prof. Kavita Iyer',exp:'Family councils',city:'Mumbai',sessions:4,lastSession:'2026-09-18',lastContact:'2026-10-02',rating:4.5,pm:'ananya',senior:true},
  f3:{name:'Rohan Bhatia',exp:'Conflict resolution',city:'Delhi',sessions:3,lastSession:'2026-08-22',lastContact:'2026-09-30',rating:4.4,pm:'karan',senior:false},
  f4:{name:'Meera Kapoor',exp:'Next-gen leadership',city:'Delhi',sessions:5,lastSession:'2026-10-09',lastContact:'2026-10-09',rating:4.8,pm:'ishita',senior:false},
  f5:{name:'Dr. Sanjay Nair',exp:'Wealth, philanthropy',city:'Kochi',sessions:2,lastSession:'2026-07-14',lastContact:'2026-07-14',rating:4.2,pm:'karan',senior:true},
  f6:{name:'Farah Khan Ali',exp:'Alumni networks',city:'Mumbai',sessions:1,lastSession:'2026-06-30',lastContact:'2026-06-30',rating:4.6,pm:'ishita',senior:false},
  f7:{name:'Vikram Sethi',exp:'Wealth transition',city:'Gurugram',sessions:3,lastSession:'2026-10-06',lastContact:'2026-10-06',rating:4.3,pm:'ishita',senior:false},
  f8:{name:'Prof. Anil Deshpande',exp:'Strategy',city:'Pune',sessions:7,lastSession:'2026-10-03',lastContact:'2026-10-03',rating:4.9,pm:'karan',senior:true},
  f9:{name:'Lakshmi Raghavan',exp:'Family office setup',city:'Chennai',sessions:0,lastSession:null,lastContact:'2026-05-21',rating:null,pm:'ananya',senior:false},
  f10:{name:'Harsh Vardhan Jain',exp:'Tax and structuring',city:'Jaipur',sessions:1,lastSession:'2026-04-11',lastContact:'2026-04-11',rating:4.1,pm:'ananya',senior:false}
};

const COHORTS = [
  {code:'OPMC1',prog:'OPM',status:'Running',pm:'ananya',start:'2026-01-12',end:'2027-01-15',format:'Hybrid: monthly residency and weekly online classes',size:12,sessions:10,faculty:['f1','f2','f8'],keydates:[['Residency 4, Gurugram','2026-11-09'],['Capstone proposal due','2026-11-30'],['Graduation','2027-01-15']]},
  {code:'OPMC2',prog:'OPM',status:'Running',pm:'ananya',start:'2026-06-08',end:'2027-06-11',format:'Hybrid: monthly residency and weekly online classes',size:11,sessions:7,faculty:['f1','f3','f10'],keydates:[['Residency 3, Bengaluru','2026-10-23'],['Mid-programme review','2026-12-04']]},
  {code:'OPMC3',prog:'OPM',status:'In preparation',pm:'karan',start:'2027-01-11',end:'2028-01-14',format:'Hybrid: monthly residency and weekly online classes',size:10,sessions:0,faculty:['f8','f9'],keydates:[['Admissions close','2026-11-28'],['Orientation','2027-01-11']]},
  {code:'EBAPC1',prog:'EBAP',status:'Running',pm:'karan',start:'2026-03-02',end:'2026-12-18',format:'Online with two campus immersions',size:10,sessions:9,faculty:['f3','f5','f7'],keydates:[['Immersion 2, Mumbai','2026-11-16'],['Final presentations','2026-12-14']]},
  {code:'EBAPC2',prog:'EBAP',status:'Running',pm:'ishita',start:'2026-08-03',end:'2027-05-28',format:'Online with two campus immersions',size:9,sessions:5,faculty:['f4','f6','f7'],keydates:[['Immersion 1, Gurugram','2026-11-02'],['Module 3 begins','2026-11-23']]}
];
const PROGS = {OPM:'OPM', EBAP:'EBAP'};
const NAMES = ['Aditya Birla Jr.','Sneha Agarwal','Rahul Oberoi','Pooja Mittal','Kunal Goenka','Tanvi Hinduja','Arjun Piramal','Nisha Ruia','Dev Shah','Riya Jindal','Siddharth Bajaj','Ira Kirloskar','Manav Dalmia','Aanya Singhania','Yash Munjal','Kabir Khaitan','Meher Poddar','Vivaan Lodha','Anika Kothari','Rohan Bhartia','Saanvi Garware','Arnav Jhunjhunwala','Diya Somani','Ishaan Kejriwal','Myra Saraf','Reyansh Bangur','Kiara Modi','Aarav Patodia','Navya Khemka','Vihaan Chokhani','Zara Lohia','Atharv Daga','Prisha Rathi','Krish Bagri','Avni Bubna','Shaurya Nevatia','Tara Kanoria','Ayaan Morarka','Sara Choudhary','Rudra Bhuwalka','Ananya Jalan','Veer Tibrewala','Mira Dalmia','Dhruv Sekhsaria','Pari Harlalka','Om Saboo','Kavya Goyal','Ved Agarwalla','Siya Mohta','Neel Murarka','Aditi Bansal','Arhaan Sarda'];
const ASG_TITLES = ['Family business diagnostic','Succession roadmap','Governance charter draft','Case analysis: The Mehra Group','Strategy memo to the board'];
const rnd = (()=>{ let s=20261016; return ()=> (s = (s*16807) % 2147483647) / 2147483647; })();
const addDays = (s,n)=>{ const d=D(s); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
let nameI = 0;
COHORTS.forEach(c=>{
  c.sess = Array.from({length:c.sessions},(_,i)=>({n:i+1,date:addDays('2026-10-14',-(c.sessions-1-i)*14)}));
  c.asg = Array.from({length:Math.floor(c.sessions/2)},(_,i)=>({n:i+1,title:ASG_TITLES[i%ASG_TITLES.length],due:c.sess[2*i+1].date,max:20}));
  c.students = Array.from({length:c.size},(_,k)=>{
    const eng = k%5===3 ? 0.45+rnd()*0.2 : 0.72+rnd()*0.28;
    const att = c.sess.map(()=>{ const r=rnd(); return r<eng?'P':r<eng+0.07?'L':r<eng+0.11?'E':'A'; });
    const subs = c.asg.map(a=>{ if (rnd() > eng+0.12) return {st:'Missing',score:null}; const late = rnd()<0.15; return {st:late?'Late':'On time',score:Math.max(5,Math.min(20,Math.round(a.max*(0.25+eng*0.62+(rnd()-0.5)*0.34))))}; });
    const counted = att.filter(x=>x!=='E');
    const pct = counted.length ? Math.round(counted.filter(x=>x!=='A').length/counted.length*100) : null;
    const scored = subs.filter(s=>s.score!=null);
    return {id:c.code+'-'+String(k+1).padStart(3,'0'), name:NAMES[nameI++ % NAMES.length], cohort:c.code, pm:c.pm, att:pct, attRec:att, subs,
      avg: scored.length? Math.round(scored.reduce((a,s)=>a+s.score,0)/scored.length/20*100) : null,
      last: c.status==='Running' && rnd()<0.62 ? addDays('2026-10-01', Math.floor(rnd()*14)) : null,
      ones: c.status==='Running' ? [['2026-09-'+String(8+Math.floor(rnd()*18)).padStart(2,'0'),'Progress check-in; discussed capstone topic'],['2026-08-'+String(5+Math.floor(rnd()*20)).padStart(2,'0'),'Settling in; family business context shared']] : []};
  });
});
let STUDENTS = COHORTS.filter(c=>c.status==='Running').flatMap(c=>c.students);
const cohortStats = c => {
  const st = c.students, s = st.filter(x=>x.att!=null);
  const totalSubs = st.reduce((a,x)=>a+x.subs.length,0), done = st.reduce((a,x)=>a+x.subs.filter(y=>y.st!=='Missing').length,0);
  const avgs = st.filter(x=>x.avg!=null);
  return {att: s.length? Math.round(s.reduce((a,x)=>a+x.att,0)/s.length) : null, sub: totalSubs? Math.round(done/totalSubs*100) : null,
    score: avgs.length? Math.round(avgs.reduce((a,x)=>a+x.avg,0)/avgs.length) : null, risk: st.filter(x=>x.att!=null && x.att<75).length};
};
const visibleCohorts = () => isMgr() ? COHORTS : COHORTS.filter(c=>c.pm===S.user);


/* ---------------- KPI framework (Rev 6) ---------------- */
const PILLARS = {1:'Pillar 1 · System-of-record trackers', 2:'Pillar 2 · Masters\' Union NPS', 3:'Pillar 3 · RG 360° confidential feedback'};
const KPI_DEF = [
  {n:1,p:1,w:8,area:'Academic Planning & Preparedness',src:'Academic Calendar Tracker',rec:'Sessions › calendar share dates, LMS upload log',how:['Session calendar shared with the Ops team per MU guideline, no row blank or TBD','Session calendar shared with students per MU norm','LMS resource uploaded less than 48 hours before its session counts as a miss'],formula:'A (Ops, 3%): sessions shared with Ops on time (±3 days) ÷ total sessions × 100. B (Students, 5%): sessions shared with learners on time ÷ total sessions × 100. Denominator = immersions + hybrid/online sessions.'},
  {n:2,p:1,w:5,area:'Faculty Management, Travel & Logistics',src:'Faculty Travel, Terms, Payments, Session Feedback trackers',rec:'Faculty, Sessions and Payments',how:['Outstation flight and hotel booked 15 days ahead and confirmed in writing','Honorarium and travel terms tracker current, shared with RG monthly','Payments tracker updated within 3 working days; faculty paid within 15 days; TDS certificate before the 30th after quarter-end','Feedback, pics and post-session note within 24 hours; MU pics within 3 days; fireside chat status within 7 days'],formula:'On-time updates across all six sub-trackers ÷ total updates due in the quarter × 100.'},
  {n:3,p:1,w:3,area:'Quarterly Faculty Touchbase',src:'Faculty Touchbase Tracker',rec:'Faculty › Log a connect',how:['Every faculty member who has taught or is on the potential list is contacted once a quarter','Call, WhatsApp or email, logged with date and key observations'],formula:'Faculty contacted with a logged entry ÷ total faculty on the touchbase list × 100.'},
  {n:4,p:1,w:8,area:'Learner Engagement & Quarterly 1:1s',src:'Learner Engagement Log',rec:'Students and Cohorts › Log 1:1',how:['One documented 1:1 with every learner every quarter, with a written summary','Any at-risk signal escalated to RG in writing within 24 hours'],formula:'Learners with a logged 1:1 in the quarter ÷ total active learners × 100.'},
  {n:5,p:1,w:12,area:'Session Attendance & Presence Discipline',src:'Observation tracker + Keka + Zoom/Meet logs',rec:'Sessions › check-in and observation note',how:['Online: in Zoom/Meet 10 minutes early, camera on','Hybrid: at venue 15 minutes early (Keka); Immersion: 30 minutes early (Keka)','In the classroom throughout unless an RG-communicated emergency','Observation note within 2 hours of session end'],formula:'Sessions with zero attendance misses ÷ total assigned sessions × 100.'},
  {n:6,p:1,w:3,area:'Attendance & Leave Record Management',src:'Keka',rec:'Keka (read-only sync)',how:['Daily attendance marked in Keka by 10:00 AM','Leave applied in advance except same-day emergencies','No retroactive marking without Managing Partner approval'],formula:'Working days with timely attendance or approved leave ÷ total working days × 100.'},
  {n:7,p:1,w:8,area:'Assignment Completion by Learners',src:'Assignment Completion Tracker',rec:'Cohorts › Assignments',how:['Each assignment tracked per learner against its deadline; results shared with the Academic Lead','Below 80% completion: reminder to non-submitters and written escalation within 24 hours'],formula:'Average assignment submission rate across all assignments in the quarter.'},
  {n:8,p:1,w:3,area:'Capstone Coordination',src:'Capstone Coordination Tracker',rec:'Cohorts › Capstone milestones',how:['Kickoff, mentor allocation, interim review, final submission and evaluation tracked against schedule'],formula:'Milestones completed and logged on schedule ÷ total scheduled milestones × 100.'},
  {n:9,p:1,w:4,area:'Faculty PPT Quality Control',src:'PPT Review Checklist',rec:'Sessions › PPT checklist',how:['Faculty deck reviewed against the PPT checklist before every session','A miss = checklist not completed in time, or a late deck not flagged'],formula:'Sessions with a completed checklist ÷ total sessions × 100.'},
  {n:10,p:1,w:3,area:'Daily (EOD) Reporting Discipline',src:'EOD Report (Google Form)',rec:'My Day › Submit EOD report',how:['End-of-day report submitted by the stated time on every working day'],formula:'Working days with an on-time EOD report ÷ total working days × 100.'},
  {n:11,p:1,w:4,area:'Budgeting & Financial Discipline',src:'Budget Tracker + approvals in Drive',rec:'Cohorts › Budget',how:['All spend pre-approved in writing against a cohort budget','Budget vs actual updated within 2 working days of any spend'],formula:'Variance % = (actual − approved) ÷ approved × 100. Banded: 100 if ≤5% with no process misses, 60 if ≤5% with misses, 0 if over 5%.'},
  {n:12,p:1,w:5,area:'Batch Retention',src:'Learner Status Tracker + Dropout Log',rec:'Cohorts › Students (early warnings)',how:['Disengagement signals (3+ missed sessions, missing assignments, unresponsive) get an early-warning entry and an action plan within 5 days','A dropout not flagged as an early warning the prior month is a process miss'],formula:'100 − (dropouts ÷ learners at start of quarter × 100); 0 if any dropout was not pre-flagged.'},
  {n:13,p:1,w:4,area:'Escalation & Ownership Discipline',src:'Escalation Tracker',rec:'Escalations log',how:['Acknowledged within 2 hours, resolved by the PM, resolution note within 2 working days','A miss = not logged same day, late acknowledgement or no resolution note'],formula:'Escalations handled without a miss ÷ total escalations × 100.'},
  {n:14,p:2,w:15,area:'Student NPS & Satisfaction',src:'Masters\' Union (provided directly)',rec:'Bulk upload from MU NPS report',how:['Session-by-session satisfaction score (out of 5), aggregated for the quarter','NPS = % promoters (9–10) − % detractors (0–6)'],formula:'KPI score = MAX(0, MIN(100, NPS × 2)). NPS 50 or above scores full marks.'},
  {n:15,p:3,w:4,area:'MU Relationship Management',src:'RG 360° (MU Ops & Academic leads)',rec:'360° round, held by Rajiv',how:['Confidential rating by MU Operations and Academic team leads, once a year'],formula:'(Average rating ÷ 5) × 100; 0 if an unresolved escalation is on record.'},
  {n:16,p:3,w:4,area:'Faculty Relationship Management',src:'RG 360° (3 sampled faculty)',rec:'360° round, held by Rajiv',how:['Confidential rating from 3 faculty who taught 10+ hours or are critical to the programme'],formula:'(Average rating ÷ 5) × 100; 0 if an unresolved escalation is on record.'},
  {n:17,p:3,w:4,area:'Learner Satisfaction (confidential sample)',src:'RG 360° (15% learner sample)',rec:'360° round, held by Rajiv',how:['Confidential rating from an unbiased 15% sample of the batch, once a year'],formula:'(Average rating ÷ 5) × 100; 0 if an unresolved escalation is on record.'},
  {n:18,p:3,w:3,area:'Professionalism & Conduct',src:'RG 360° Feedback',rec:'360° round, held by Rajiv',how:['Structured observation folded into the same annual 360° round'],formula:'(Average rating ÷ 5) × 100.'}
];
const KQ = {Q3:{
  ananya:[{a:[11,12],b:[10,12]},[41,48],[14,18],[21,23],[44,48],[61,64],[88,100],[5,6],[40,48],[58,64],{v:3.2,m:1},{d:1,e:23,f:true},[9,11],{nps:41,sat:4.4},4.4,4.2,4.5,4.6],
  karan:[{a:[12,12],b:[11,12]},[44,46],[17,18],[19,20],[47,48],[63,64],[93,100],[6,6],[45,46],[62,64],{v:2.1,m:0},{d:0,e:20,f:true},[7,7],{nps:47,sat:4.6},4.6,4.5,4.4,4.7],
  ishita:[{a:[9,10],b:[7,10]},[30,40],[10,16],[14,18],[33,40],[58,64],[79,100],[3,5],[28,40],[51,64],{v:6.8,m:2},{d:1,e:18,f:false},[6,9],{nps:36,sat:4.3},4.1,4.3,4.0,4.4]}};
(function(){ // Q4 to date, derived deterministically from Q3 patterns
  let s=7; const r=()=> (s=(s*16807)%2147483647)/2147483647;
  KQ.Q4={};
  for (const pm of PMS){
    KQ.Q4[pm] = KQ.Q3[pm].map((v,i)=>{
      const part = ([n,d])=>{ const d2=Math.max(2,Math.round(d*0.28)); return [Math.max(0,Math.min(d2,Math.round(n/d*d2+(r()-0.55)))),d2]; };
      if (i===0) return {a:part(v.a),b:part(v.b)};
      if (i===6) return [Math.round(v[0]+(r()-0.5)*8),100];
      if (i===10) return {v:+(v.v*(0.6+r()*0.5)).toFixed(1),m:v.m?1:0};
      if (i===11) return {d:0,e:v.e,f:true};
      if (i===13) return {nps:Math.round(v.nps+(r()-0.5)*10),sat:v.sat};
      if (i>=14) return v;
      return part(v);
    });
  }
})();
const KSTATE = {Q3:{ananya:'Signed by PM',karan:'Locked',ishita:'Ready for review'}, Q4:{ananya:'In progress',karan:'In progress',ishita:'In progress'}};
const kqv = (q,pm,i) => { const a = KQ[q] && KQ[q][pm]; return a && a[i]!=null ? a[i] : null; };
const kstate = (q,p) => (KSTATE[q]||{})[p] || 'In progress';
const clamp = x=>Math.max(0,Math.min(100,x));
const pct = ([n,d])=> d? n/d*100 : 0;
function kpiScore(n,v){
  if (v==null) return 0;
  if (n===1) return (pct(v.a)*3+pct(v.b)*5)/8;
  if (n===11) return v.v<=5 ? (v.m?60:100) : 0;
  if (n===12) return (v.d && !v.f) ? 0 : v.e ? clamp(100 - v.d/v.e*100) : 0;
  if (n===14) return clamp(v.nps*2);
  if (n>=15) return clamp(v/5*100);
  return clamp(pct(v));
}
function kpiEvidence(n,v){
  if (v==null) return 'No data yet';
  if (n===1) return `Ops ${v.a[0]}/${v.a[1]} · Students ${v.b[0]}/${v.b[1]}`;
  if (n===7) return `${v[0]}% avg submission`;
  if (n===11) return `Variance ${v.v}% · ${v.m} process miss${v.m===1?'':'es'}`;
  if (n===12) return `${v.d} dropout${v.d===1?'':'s'} of ${v.e}${v.d?(v.f?' · pre-flagged':' · not pre-flagged'):''}`;
  if (n===14) return `NPS ${v.nps} · satisfaction ${v.sat}/5`;
  if (n>=15) return `Rating ${v.toFixed(1)}/5`;
  return `${v[0]} of ${v[1]}`;
}
function scorecard(pm,q){
  const rows = KPI_DEF.map((d,i)=>{ const v=kqv(q,pm,i), s=kpiScore(d.n,v); return {...d, v, s, pts:s*d.w/100, ev:kpiEvidence(d.n,v)}; });
  const total = rows.reduce((a,r)=>a+r.pts,0);
  const pill = p => { const rs=rows.filter(r=>r.p===p); return {pts:rs.reduce((a,r)=>a+r.pts,0), max:rs.reduce((a,r)=>a+r.w,0)}; };
  return {rows, total, band: bandOf(total), p1:pill(1), p2:pill(2), p3:pill(3)};
}
const BANDS = [[90,'Outstanding',100,'t-good'],[80,'Exceeds Expectations',80,'t-good'],[70,'Meets Expectations',60,'t-info'],[60,'Below Expectations',30,'t-warn'],[0,'Unsatisfactory',0,'t-bad']];
const bandOf = s => { const b = BANDS.find(b=>s>=b[0]); return {min:b[0],name:b[1],pay:b[2],cls:b[3]}; };
const scoreCol = s => s>=90?'var(--good)':s>=80?'var(--accent)':s>=70?'var(--info)':s>=60?'var(--warn)':'var(--bad)';
const kpiChip = n => { const d=KPI_DEF[n-1]; return `<button class="kchip" data-act="kpi" data-n="${n}" title="${esc(d.area)} · ${d.w}% weight">KPI ${n} · ${d.w}%</button>`; };
const kpiFeeds = (ns, label='Counts toward') => `<div class="kfeeds"><span>${label}</span>${ns.map(n=>`<button class="kchip lg" data-act="kpi" data-n="${n}">KPI ${n} ${esc(KPI_DEF[n-1].area)} · ${KPI_DEF[n-1].w}%</button>`).join('')}</div>`;
function scoreRing(s, size=96){
  const r=size/2-8, c=2*Math.PI*r, off=c*(1-s/100), col=scoreCol(s);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Weighted score ${s.toFixed(1)}" style="flex:none"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="9"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})"/><text x="${size/2}" y="${size/2+7}" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-size="${size>80?22:16}" font-weight="600" fill="var(--ink)">${s.toFixed(1)}</text></svg>`;
}
const taskKpi = t => t.cat==='Notes'?5 : t.cat==='Payments'?2 : t.cat==='Students'?4 : t.cat==='Faculty'?(/connect/i.test(t.title)?3:2) : t.cat==='Sessions'?(/pre-read/i.test(t.title)?1:/travel|venue|readiness/i.test(t.title)?2:1) : null;

const HONORARIA = [
  {fac:'f1',session:'S-311',amt:85000,status:'Approved',note:'Senior faculty rate, full day'},
  {fac:'f8',session:'S-319',amt:95000,status:'Paid',note:'Includes case preparation'},
  {fac:'f2',session:'S-313',amt:60000,status:'Agreed',note:'Online half day'},
  {fac:'f5',session:'S-316',amt:55000,status:'Agreed',note:'Online half day'}
];

/* ---------------- invoices ---------------- */
// Two kinds: receivable (Reverentia bills a client such as Masters' Union) and payable (a faculty member bills Reverentia).
// Party, GSTIN and bank details are samples until Reverentia's registered details are added in Admin.
const REV_PARTY = {name:'Reverentia',addr:'Gurugram, Haryana',gstin:'06AAACR1234A1Z5',pan:'AAACR1234A',state:'Haryana',email:'accounts@reverentia.in'};
const REV_BANK = {name:'Reverentia',bank:'HDFC Bank, Gurugram',acct:'50200012345678',ifsc:'HDFC0001234'};
const MU_PARTY = {name:"Masters' Union",addr:'Gurugram, Haryana',gstin:'06AAFCM5678B1Z2',pan:'',state:'Haryana',email:'finance@mastersunion.org'};
const STATES = ['Haryana','Delhi','Maharashtra','Karnataka','Kerala','Tamil Nadu','Rajasthan','Uttar Pradesh','Gujarat','West Bengal','Telangana','Punjab','Other'];
const facParty = id => { const f=FACULTY[id]; return {name:f.name,addr:f.city,gstin:'',pan:'XXXXX'+String(1000+Object.keys(FACULTY).indexOf(id)*37).slice(0,4)+'X',state:({Bengaluru:'Karnataka',Mumbai:'Maharashtra',Delhi:'Delhi',Kochi:'Kerala',Gurugram:'Haryana',Pune:'Maharashtra',Chennai:'Tamil Nadu',Jaipur:'Rajasthan'})[f.city]||'Other',email:''}; };
const facBank = id => ({name:FACULTY[id].name,bank:'Bank on file',acct:'XXXXXXXX'+String(4021+Object.keys(FACULTY).indexOf(id)*13),ifsc:'On file'});

let INVOICES = [
  {id:'IV-41',no:'REV/26-27/0041',type:'sales',date:'2026-09-08',due:'2026-09-23',from:REV_PARTY,to:MU_PARTY,cohort:'OPMC2',session:null,items:[{d:'Programme delivery: OPMC2 Residency 2 (Gurugram), 3 days',sac:'999293',q:1,r:420000}],gst:18,tds:10,notes:'Payment within 15 days of invoice date.',status:'sent',pays:[{date:'2026-09-21',amt:453600,tds:42000,ref:'UTR HDFCN26264418822'}],pm:'ananya',by:'neha'},
  {id:'IV-42',no:'REV/26-27/0042',type:'sales',date:'2026-09-20',due:'2026-10-05',from:REV_PARTY,to:MU_PARTY,cohort:'EBAPC1',session:null,items:[{d:'Programme delivery: EBAPC1 Module 4, 6 online sessions',sac:'999293',q:6,r:38000},{d:'Programme management fee, September',sac:'999293',q:1,r:45000}],gst:18,tds:10,notes:'Payment within 15 days of invoice date.',status:'sent',pays:[],pm:'karan',by:'neha'},
  {id:'IV-43',no:'REV/26-27/0043',type:'sales',date:'2026-10-03',due:'2026-10-18',from:REV_PARTY,to:MU_PARTY,cohort:'EBAPC2',session:null,items:[{d:'Programme delivery: EBAPC2 Module 2, 4 online sessions',sac:'999293',q:4,r:38000}],gst:18,tds:10,notes:'Payment within 15 days of invoice date.',status:'sent',pays:[{date:'2026-10-12',amt:80000,tds:0,ref:'UTR ICICN26285530019'}],pm:'ishita',by:'neha'},
  {id:'IV-44',no:'REV/26-27/0044',type:'sales',date:'2026-10-14',due:'2026-10-29',from:REV_PARTY,to:MU_PARTY,cohort:'OPMC2',session:null,items:[{d:'Programme delivery: OPMC2 Residency 3 (Bengaluru), 3 days',sac:'999293',q:1,r:420000},{d:'Venue and logistics, at cost',sac:'998596',q:1,r:186500}],gst:18,tds:10,notes:'Payment within 15 days of invoice date.',status:'draft',pays:[],pm:'ananya',by:'madhav'},
  {id:'IV-45',no:'RVF/26-27/0108',type:'faculty',date:'2026-10-09',due:'2026-10-24',from:facParty('f4'),to:REV_PARTY,fac:'f4',cohort:'EBAPC2',session:'S-312',items:[{d:'Teaching honorarium: Next-Gen Leadership Roundtable (9 Oct, online)',sac:'999293',q:1,r:30000}],gst:0,tds:10,notes:'',status:'sent',pays:[{date:'2026-10-13',amt:27000,tds:3000,ref:'NEFT N286261190'}],pm:'ishita',by:'ishita'},
  {id:'IV-46',no:'RVF/26-27/0109',type:'faculty',date:'2026-10-12',due:'2026-10-27',from:facParty('f1'),to:REV_PARTY,fac:'f1',cohort:'OPMC2',session:'S-311',items:[{d:'Teaching honorarium: Succession Planning in Practice (12 Oct, full day)',sac:'999293',q:1,r:85000},{d:'Travel reimbursement, Bengaluru to Delhi',sac:'',q:1,r:14200}],gst:0,tds:10,notes:'',status:'sent',pays:[],pm:'ananya',by:'ananya'},
  {id:'IV-47',no:'RVF/26-27/0104',type:'faculty',date:'2026-10-06',due:'2026-10-21',from:facParty('f7'),to:REV_PARTY,fac:'f7',cohort:'EBAPC2',session:'S-318',items:[{d:'Teaching honorarium: Wealth Transition Across Generations (6 Oct, online)',sac:'999293',q:1,r:30000}],gst:0,tds:10,notes:'',status:'sent',pays:[{date:'2026-10-14',amt:27000,tds:3000,ref:'NEFT N287110043'}],pm:'ishita',by:'ishita'},
  {id:'IV-48',no:'RVF/26-27/0099',type:'faculty',date:'2026-09-24',due:'2026-10-09',from:facParty('f3'),to:REV_PARTY,fac:'f3',cohort:'EBAPC1',session:null,items:[{d:'Teaching honorarium: Conflict Resolution workshop (22 Aug)',sac:'999293',q:1,r:40000}],gst:18,tds:10,notes:'',status:'sent',pays:[],pm:'karan',by:'karan'}
];
INVOICES.forEach(v=>{ if (v.type==='faculty'){ v.from.gstin = v.gst ? '07ABCPB4321K1Z9' : ''; v.att = {name: FACULTY[v.fac].name.replace(/^(Dr\.|Prof\.)\s*/,'').replace(/\s+/g,'_')+'_invoice_'+v.no.split('/').pop()+'.pdf', size: 84000+v.no.length*1300, blob:null, at:v.date}; v.recvd = v.date; } });
const invNext = { sales: 45, faculty: 110 };

const invConf = v => v.type==='faculty' && FACULTY[v.fac] && FACULTY[v.fac].senior;
const invHide = v => invConf(v) && !canConf();
const visibleInvoices = () => isMgr() ? INVOICES : INVOICES.filter(v=>v.pm===S.user);
function invCalc(v){
  const sub = v.items.reduce((a,i)=>a+(+i.q||0)*(+i.r||0),0);
  const gst = Math.round(sub*(+v.gst||0)/100), intra = v.from.state===v.to.state;
  const total = sub + gst, tds = Math.round(sub*(+v.tds||0)/100);
  const settled = v.pays.reduce((a,p)=>a+(+p.amt||0)+(+p.tds||0),0);
  return {sub, gst, cgst: intra?gst/2:0, sgst: intra?gst/2:0, igst: intra?0:gst, intra, total, tds, net: total-tds, settled, bal: Math.max(0,total-settled)};
}
function invStatus(v){
  if (v.status==='cancelled') return 'Cancelled';
  if (v.status==='draft') return 'Draft';
  const c = invCalc(v);
  if (c.bal < 1) return 'Paid';
  if (v.status==='received') return dayDiff(v.due) < 0 ? 'Overdue' : 'To approve';
  if (dayDiff(v.due) < 0) return 'Overdue';
  return c.settled > 0 ? 'Partly paid' : 'Awaiting payment';
}
const INV_TAG = {'To approve':'t-accent',Paid:'t-good','Partly paid':'t-info','Awaiting payment':'t-warn',Overdue:'t-bad',Draft:'',Cancelled:''};
const invTag = v => { const s=invStatus(v); return `<span class="tag ${INV_TAG[s]}">${s==='Overdue'?`Overdue ${-dayDiff(v.due)}d`:s}</span>`; };
const invParty = v => v.type==='sales' ? v.to.name : v.from.name;
const rs = n => '₹' + Math.round(n).toLocaleString('en-IN');
const rs2 = n => '₹' + (+n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
function inWords(n){
  n = Math.round(n); if (!n) return 'Zero';
  const a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const t=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const two = x => x<20 ? a[x] : t[Math.floor(x/10)]+(x%10?' '+a[x%10]:'');
  const three = x => (x>=100 ? a[Math.floor(x/100)]+' Hundred'+(x%100?' ':'') : '') + (x%100?two(x%100):'');
  const parts=[]; const cr=Math.floor(n/1e7); n%=1e7; const lk=Math.floor(n/1e5); n%=1e5; const th=Math.floor(n/1e3); n%=1e3;
  if (cr) parts.push((cr>=100?inWords(cr):two(cr))+' Crore'); if (lk) parts.push(two(lk)+' Lakh'); if (th) parts.push(two(th)+' Thousand'); if (n) parts.push(three(n));
  return parts.join(' ');
}
// The standard invoice layout: one template for every invoice Optimus issues or records.
function invDoc(v, sm){
  const c = invCalc(v), st = v.status==='draft' ? 'Draft' : invStatus(v);
  const title = v.gst ? 'TAX INVOICE' : 'INVOICE';
  const bank = v.type==='sales' ? REV_BANK : facBank(v.fac);
  const sess = v.session ? SESSIONS.find(s=>s.id===v.session) : null;
  const party = (p, lbl) => `<div><div class="ilbl">${lbl}</div><b>${esc(p.name||'—')}</b><div class="imuted">${esc(p.addr||'')}${p.state&&p.addr&&!p.addr.includes(p.state)?', '+esc(p.state):''}</div>${p.gstin?`<div>GSTIN: <b>${esc(p.gstin)}</b></div>`:''}${p.pan?`<div>PAN: ${esc(p.pan)}</div>`:''}${p.email?`<div class="imuted">${esc(p.email)}</div>`:''}</div>`;
  return `<div class="inv-doc${sm?' sm':''}">
    <div class="ih"><div>${v.type==='sales'?`<div class="ibrand"><span class="imark">R</span><div><b style="font-size:1.25em">Reverentia</b><div class="imuted">School of Family Business programmes</div></div></div>`:`<div><b style="font-size:1.25em">${esc(v.from.name)}</b><div class="imuted">Faculty invoice to Reverentia</div></div>`}
      ${st==='Paid'?'<div class="ipaid">PAID</div>':st==='Draft'?'<div class="idraft">DRAFT</div>':''}</div>
      <div style="text-align:right"><h4>${title}</h4><dl class="imeta" style="margin-top:8px"><dt>Invoice no.</dt><dd>${esc(v.no)}</dd><dt>Invoice date</dt><dd>${v.date?fmt(v.date)+' '+D(v.date).getFullYear():'—'}</dd><dt>Due date</dt><dd>${v.due?fmt(v.due)+' '+D(v.due).getFullYear():'—'}</dd><dt>Place of supply</dt><dd>${esc(v.to.state||'—')}</dd></dl></div></div>
    <div class="iparties">${party(v.from,'Bill from')}${party(v.to,'Bill to')}</div>
    <div style="display:flex;gap:18px;flex-wrap:wrap;padding-top:10px" class="imuted"><span>Programme: <b style="color:#111">${esc(v.cohort?((COHORTS.find(x=>x.code===v.cohort)||{}).prog||'')+' · '+v.cohort:'—')}</b></span>${sess?`<span>Session: <b style="color:#111">${esc(sess.title)}, ${fmt(sess.date)}</b></span>`:''}</div>
    <table><thead><tr><th style="width:28px">#</th><th>Description</th><th>SAC</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>
      ${v.items.map((i,k)=>`<tr><td>${k+1}</td><td>${esc(i.d||'—')}</td><td>${esc(i.sac||'')}</td><td class="r">${+i.q||0}</td><td class="r">${rs2(+i.r||0)}</td><td class="r">${rs2((+i.q||0)*(+i.r||0))}</td></tr>`).join('')}
    </tbody></table>
    <div class="itot"><dl><dt>Taxable value</dt><dd>${rs2(c.sub)}</dd>
      ${v.gst?(c.intra?`<dt>CGST @ ${v.gst/2}%</dt><dd>${rs2(c.cgst)}</dd><dt>SGST @ ${v.gst/2}%</dt><dd>${rs2(c.sgst)}</dd>`:`<dt>IGST @ ${v.gst}%</dt><dd>${rs2(c.igst)}</dd>`):`<dt>GST</dt><dd>Not applicable</dd>`}
      <dt class="grand">Invoice total</dt><dd class="grand">${rs2(c.total)}</dd>
      ${v.tds?`<dt>Less TDS @ ${v.tds}% (u/s ${v.tds===2?'194C':'194J'}, deducted by payer)</dt><dd>− ${rs2(c.tds)}</dd><dt><b style="color:#111">Net payable</b></dt><dd><b>${rs2(c.net)}</b></dd>`:''}
    </dl></div>
    <div class="iwords"><span class="imuted">Amount in words:</span> <b>Rupees ${inWords(c.total)} only</b></div>
    <div class="ifoot"><div><div class="ilbl">Pay to</div><div>${esc(bank.name)}</div><div>${esc(bank.bank)}</div><div>A/c no. <b>${esc(bank.acct)}</b> · IFSC ${esc(bank.ifsc)}</div>${v.notes?`<div class="ilbl" style="margin-top:10px">Notes</div><div>${esc(v.notes)}</div>`:''}</div>
      <div class="isign"><div class="imuted">${v.gst?'':'Supplier not registered under GST. '}This is a computer-generated invoice.</div><div><div style="border-top:1px solid #111;display:inline-block;padding-top:4px;min-width:180px">For ${esc(v.from.name)}<br><span class="imuted">Authorised signatory</span></div></div></div></div>
  </div>`;
}

function invFiltered(){
  const f = S.invF || 'all', ty = S.invT || 'all', st = v=>invStatus(v);
  let list = visibleInvoices().filter(v=>ty==='all'||v.type===ty);
  if (f==='open') list = list.filter(v=>['To approve','Awaiting payment','Partly paid','Overdue'].includes(st(v)));
  if (f==='overdue') list = list.filter(v=>st(v)==='Overdue');
  if (f==='paid') list = list.filter(v=>st(v)==='Paid');
  if (f==='draft') list = list.filter(v=>st(v)==='Draft');
  if (S.q) list = list.filter(v=>(v.no+invParty(v)+(v.cohort||'')).toLowerCase().includes(S.q.toLowerCase()));
  return list.slice().sort((a,b)=>b.date.localeCompare(a.date));
}
function viewInvoices(){
  const all = visibleInvoices(), f = S.invF || 'all', ty = S.invT || 'all';
  const list = invFiltered(), st = v=>invStatus(v);
  const live = all.filter(v=>!['Draft','Cancelled'].includes(st(v)) && !invHide(v)), hidden = all.filter(invHide).length;
  const sum = (arr, k) => arr.reduce((a,v)=>a+invCalc(v)[k],0);
  const recv = live.filter(v=>v.type==='sales'), pay = live.filter(v=>v.type==='faculty');
  const od = live.filter(v=>st(v)==='Overdue');
  const segs = (key, cur, opts) => `<div class="seg">${opts.map(([k,l])=>`<button class="${cur===k?'on':''}" data-act="${key}" data-v="${k}">${l}</button>`).join('')}</div>`;
  return `<div class="page-head"><div><h1>Invoices</h1><p>Create a standard invoice in a minute, and see which invoices are paid, part-paid or overdue.</p>${kpiFeeds([2])}</div><div class="toolbar"><button class="btn" data-act="invxlsx">${ic('file')}Export list to Excel</button><button class="btn primary" data-act="modal" data-m="invoice">${ic('plus')}Create invoice</button></div></div>
  <div class="grid g4">
    <div class="card stat"><span class="lbl">To receive from clients</span><span class="val num">${rs(sum(recv,'bal'))}</span><span class="sub">${recv.filter(v=>invCalc(v).bal>=1).length} open of ${recv.length} invoices</span></div>
    <div class="card stat"><span class="lbl">To pay faculty</span><span class="val num">${rs(sum(pay,'bal'))}</span><span class="sub">${pay.filter(v=>invCalc(v).bal>=1).length} open · paid within 15 days (KPI 2)</span></div>
    <div class="card stat alert"><span class="lbl">Overdue</span><span class="val num">${od.length}</span><span class="sub">${od.length?rs(sum(od,'bal'))+' outstanding':'Nothing overdue'}</span></div>
    <div class="card stat"><span class="lbl">Settled this quarter</span><span class="val num">${rs(live.reduce((a,v)=>a+v.pays.filter(p=>p.date>='2026-10-01').reduce((b,p)=>b+p.amt+p.tds,0),0))}</span><span class="sub">Including TDS${hidden?` · ${hidden} confidential not shown`:''}</span></div>
  </div>
  <div class="toolbar">${segs('invf',f,[['all','All'],['open','Awaiting payment'],['overdue','Overdue'],['paid','Paid'],['draft','Drafts']])}${segs('invt',ty,[['all','Both'],['sales','We bill'],['faculty','Faculty bills us']])}</div>
  <div class="card"><div class="tbl-wrap"><table><thead><tr><th>Invoice</th><th>${ty==='faculty'?'Faculty':ty==='sales'?'Client':'Party'}</th><th>Cohort</th><th class="r">Total</th><th class="r">Balance</th><th>Due</th><th>Status</th><th class="r">Invoice</th></tr></thead><tbody>
  ${list.map(v=>{const c=invCalc(v),h=invHide(v);return `<tr class="click" data-act="inv" data-id="${v.id}"><td><b class="mono" style="font-size:13px;color:var(--ink);white-space:nowrap">${esc(v.no)}</b><div style="font-size:12px;color:var(--ink-3)">${fmt(v.date)} · <span class="tag plain ${v.type==='sales'?'t-accent':''}" style="font-size:11px;padding:0 7px">${v.type==='sales'?'We bill':'Faculty'}</span></div></td><td><b style="font-weight:600">${esc(invParty(v))}</b>${v.session?`<div style="font-size:12px;color:var(--ink-3)">${esc((SESSIONS.find(s=>s.id===v.session)||{}).title||'')}</div>`:''}</td><td>${esc(v.cohort||'—')}</td><td class="r num">${h?`<span class="tag">${ic('lock')} Confidential</span>`:`<b>${rs(c.total)}</b>`}</td><td class="r num">${h?'—':c.bal>=1?rs(c.bal):'<span style="color:var(--ink-3)">₹0</span>'}</td><td class="num">${fmt(v.due)}</td><td>${invTag(v)}</td><td class="r">${h?'':`<button class="btn sm" data-act="invpdf" data-id="${v.id}" title="Download ${esc(v.no)} as PDF">${ic('download')}Download invoice</button>`}</td></tr>`}).join('')||'<tr><td colspan="8" class="empty">No invoices match</td></tr>'}
  </tbody></table></div></div>
  <p class="demo-note">Status updates itself: an invoice past its due date with a balance shows as overdue, and recording payments marks it part-paid or paid. TDS deducted by the payer counts toward settling the invoice. Reverentia's GSTIN, address and bank details shown here are samples.</p>`;
}

function drawerInvoice(v){
  const c = invCalc(v), s = invStatus(v), h = invHide(v);
  const canAct = isMgr() || v.pm===S.user;
  const acts = [];
  if (!h) acts.push(`<button class="btn" data-act="invpdf" data-id="${v.id}">${ic('download')}Download invoice (PDF)</button>`,`<button class="btn" data-act="invprint" data-id="${v.id}">${ic('file')}Print</button>`);
  if (canAct && s==='Draft') acts.push(`<button class="btn primary" data-act="invsend" data-id="${v.id}">Mark as sent</button>`);
  if (isMgr() && v.status==='received' && s!=='Paid') acts.push(`<button class="btn primary" data-act="invapprove" data-id="${v.id}">${ic('tick')}Approve for payment</button>`);
  if (canAct && !h && v.status!=='received' && ['Awaiting payment','Partly paid','Overdue'].includes(s)) acts.push(`<button class="btn primary" data-act="modal" data-m="invpay" data-id="${v.id}">Record payment</button>`);
  if (canAct && ['Draft','Awaiting payment','Overdue'].includes(s) && !v.pays.length) acts.push(`<button class="btn ghost" data-act="invcancel" data-id="${v.id}">Cancel invoice</button>`);
  return `<div class="scrim" data-act="close"><div class="drawer wide" role="dialog" aria-label="Invoice detail" data-stop>
    <div class="drawer-h"><div style="flex:1"><div class="mono" style="color:var(--ink-3)">${esc(v.no)} · ${v.type==='sales'?'Receivable':'Payable to faculty'}</div><h2>${esc(invParty(v))}</h2><div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">${invTag(v)}${invConf(v)?`<span class="tag t-warn">${ic('lock')} Senior faculty · honorarium access only</span>`:''}</div></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div>
    <div class="drawer-b">
      ${acts.length?`<div style="display:flex;gap:8px;flex-wrap:wrap">${acts.join('')}</div>`:''}
      ${h?`<div class="card"><div class="lock">${ic('lock')}<h2 class="h3">Amounts are confidential</h2><p style="max-width:44ch;margin:0">This is a senior faculty honorarium, so only people with honorarium access can see the invoice amount. You can still see its status: <b>${esc(s)}</b>.</p></div></div>`:`
      <div class="grid g4" style="gap:10px">
        <div class="card stat"><span class="lbl">Invoice total</span><span class="val num" style="font-size:22px">${rs(c.total)}</span></div>
        <div class="card stat"><span class="lbl">Received</span><span class="val num" style="font-size:22px">${rs(c.settled-v.pays.reduce((a,p)=>a+p.tds,0))}</span></div>
        <div class="card stat"><span class="lbl">TDS deducted</span><span class="val num" style="font-size:22px">${rs(v.pays.reduce((a,p)=>a+p.tds,0))}</span></div>
        <div class="card stat ${s==='Overdue'?'alert':''}"><span class="lbl">Balance</span><span class="val num" style="font-size:22px">${rs(c.bal)}</span><span class="sub">${s==='Paid'?'Settled':dueText(v.due)}</span></div>
      </div>
      ${v.att?`<div><div class="eyebrow" style="margin-bottom:6px">Invoice received from faculty</div><div class="pay-row"><span class="att-ic">${ic('file')}</span><div style="flex:1;min-width:0"><b style="word-break:break-all">${esc(v.att.name)}</b><div class="demo-note">${v.att.size<1024?'Under 1':(v.att.size/1024).toFixed(0)} KB · received ${fmt(v.att.at)}${v.status==='received'?' · waiting for approval':v.approvedBy?` · approved by ${esc(UU(v.approvedBy).name.split(' ')[0])}`:''}</div></div>${v.att.path&&!v.att.blob?`<button class="btn sm" data-act="attopen" data-id="${v.id}">Open</button><button class="btn sm" data-act="attdl" data-id="${v.id}">${ic('download')}Download</button>`:v.att.blob?`<a class="btn sm" href="${v.att.url}" target="_blank" rel="noopener">Open</a><button class="btn sm" data-act="attdl" data-id="${v.id}">${ic('download')}Download</button>`:'<span class="demo-note">Sample file</span>'}</div>
        <div class="strip" style="margin-top:10px;gap:4px">${['Received','Approved','Paid'].map((t,i)=>{const done=i===0||(i===1&&v.status!=='received')||(i===2&&s==='Paid');return `<span class="tag ${done?'t-good':''}" style="${done?'':'opacity:.7'}">${i+1}. ${t}</span>`}).join('<span style="color:var(--ink-3)">→</span>')}</div></div>`:''}
      <div><div class="eyebrow" style="margin-bottom:6px">Payments</div>${v.pays.length?v.pays.map(p=>`<div class="pay-row"><span class="tag t-good">${fmt(p.date)}</span><div style="flex:1"><b class="num">${rs(p.amt)}</b> received${p.tds?` · <span class="num">${rs(p.tds)}</span> TDS`:''}<div class="demo-note">${esc(p.ref||'No reference')}</div></div></div>`).join(''):'<div class="demo-note">No payments recorded yet.</div>'}</div>
      <div><div class="eyebrow" style="margin-bottom:8px">${v.att?'Recorded in Optimus as':'Invoice'}</div><div class="inv-wrap">${invDoc(v,true)}</div></div>`}
      <dl class="kv"><dt>Created by</dt><dd>${who(v.by)}</dd><dt>Programme Manager</dt><dd>${who(v.pm)}</dd><dt>Cohort</dt><dd>${esc(v.cohort||'—')}</dd></dl>
    </div></div></div>`;
}

// Downloads: the viewer's download capability when the page runs in claude.ai, a plain browser download otherwise.
const _scripts = {};
const loadScript = src => _scripts[src] || (_scripts[src] = new Promise((ok,no)=>{ const t=document.createElement('script'); t.src=src; t.onload=ok; t.onerror=()=>{ delete _scripts[src]; no(new Error('load')); }; document.head.appendChild(t); }));
async function saveFile(filename, blob){
  let dl = null;
  try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch(_){ dl = null; }
  if (dl){
    try { await dl.save({filename, data: blob}); toast(`Downloaded ${filename}`); }
    catch(e){ toast(e && e.code==='declined' ? 'Download cancelled' : e && e.code==='rate_limited' ? 'A download is already waiting for you to confirm' : 'Downloads are not available in this view'); }
    return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href), 4000); toast(`Downloaded ${filename}`);
}
let invBusy = false;
async function invPdf(v){
  if (!v || invHide(v) || invBusy) return; invBusy = true; toast('Preparing the PDF…');
  const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:0;top:0;width:760px;background:#fff;z-index:-1;pointer-events:none';
  host.innerHTML = invDoc(v); document.body.appendChild(host);
  const el = host.firstElementChild; el.style.minWidth = '0';
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
    const blob = await window.html2pdf().set({margin:[10,10,12,10], image:{type:'jpeg',quality:0.97}, html2canvas:{scale:2,backgroundColor:'#ffffff',scrollX:0,scrollY:0}, jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}, pagebreak:{mode:['css','legacy']}}).from(el).outputPdf('blob');
    await saveFile(v.no.replace(/\//g,'-')+'.pdf', blob);
  } catch(_){ toast('Could not build the PDF here. Use Print and choose "Save as PDF".'); }
  finally { host.remove(); invBusy = false; }
}
async function invXlsx(){
  if (invBusy) return; invBusy = true;
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    const X = window.XLSX, list = invFiltered();
    const rows = list.map(v=>{ const c=invCalc(v), h=invHide(v), last=v.pays[v.pays.length-1], sess=v.session?SESSIONS.find(s=>s.id===v.session):null; const amt = n => h ? 'Confidential' : Math.round(n*100)/100;
      return {'Invoice no.':v.no,'Type':v.type==='sales'?'We bill (receivable)':'Faculty bills us (payable)','Invoice date':v.date,'Due date':v.due,'Party':invParty(v),'Party GSTIN':(v.type==='sales'?v.to.gstin:v.from.gstin)||'','Programme':(COHORTS.find(x=>x.code===v.cohort)||{}).prog||'','Cohort':v.cohort||'','Session':sess?sess.title:'','Taxable value (₹)':amt(c.sub),'GST (₹)':amt(c.gst),'Invoice total (₹)':amt(c.total),'TDS expected (₹)':amt(c.tds),'Received (₹)':amt(v.pays.reduce((a,p)=>a+p.amt,0)),'TDS deducted (₹)':amt(v.pays.reduce((a,p)=>a+p.tds,0)),'Balance (₹)':amt(c.bal),'Status':invStatus(v),'Last payment date':last?last.date:'','Last payment reference':last?last.ref:'','Programme Manager':UU(v.pm).name}; });
    const ws = X.utils.json_to_sheet(rows); ws['!cols'] = Object.keys(rows[0]||{a:1}).map(k=>({wch:Math.max(12,Math.min(40,k.length+4))}));
    const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, 'Invoices');
    const buf = X.write(wb, {bookType:'xlsx', type:'array'});
    await saveFile(`Reverentia invoices ${fmt(TODAY_ISO).replace(' ','-')}-${TODAY_ISO.slice(0,4)}.xlsx`, new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  } catch(_){ toast('Could not build the Excel file here.'); }
  finally { invBusy = false; }
}
function invItemRow(i){ i=i||{d:'',sac:'999293',q:1,r:''}; return `<div class="iv-item"><input class="iv-desc" placeholder="What is being billed?" value="${esc(i.d)}" aria-label="Description"><input class="iv-sac" placeholder="SAC" value="${esc(i.sac)}" aria-label="SAC code"><input class="iv-q" type="number" min="0" step="1" value="${i.q}" aria-label="Quantity"><input class="iv-r" type="number" min="0" step="1" placeholder="Rate ₹" value="${i.r}" aria-label="Rate in rupees"><button class="iv-del" data-act="invdel" aria-label="Remove line">${ic('x')}</button></div>`; }
function invForm(){
  const coh = COHORTS.filter(c=>isMgr()||c.pm===S.user);
  const facs = activeFac().filter(([,f])=>isMgr()||f.pm===S.user);
  const sess = visibleSessions().slice().sort((a,b)=>b.date.localeCompare(a.date));
  const stOpts = sel => STATES.map(s=>`<option ${s===sel?'selected':''}>${s}</option>`).join('');
  return `<div class="ivf">
  <div class="grid" style="gap:12px">
    <div class="field"><label>Invoice type</label><div class="seg mode-seg iv-type">${[['sales','Reverentia bills a client'],['faculty','Faculty bills Reverentia']].map(([k,l],i)=>`<label class="${i===0?'on':''}"><input type="radio" name="iv-ty" value="${k}" ${i===0?'checked':''}>${l}</label>`).join('')}</div></div>
    <div class="iv-sec">Bill from</div>
    <div class="iv-ro iv-s-only"><b>Reverentia</b> · GSTIN ${REV_PARTY.gstin} · ${REV_PARTY.state}</div>
    <div class="field iv-f-only" hidden><label for="iv-ff">Faculty member</label><select id="iv-ff">${facs.map(([k,f])=>`<option value="${k}">${esc(f.name)}${f.senior?' (senior, confidential)':''}</option>`).join('')}</select></div>
    <div class="grid g2 iv-f-only" hidden><div class="field"><label for="iv-fg">Faculty GSTIN (if registered)</label><input id="iv-fg" placeholder="Leave blank if not registered"></div><div class="field"><label for="iv-fp">Faculty PAN</label><input id="iv-fp" placeholder="ABCDE1234F"></div></div>
    <div class="iv-sec">Bill to</div>
    <div class="iv-ro iv-f-only" hidden><b>Reverentia</b> · GSTIN ${REV_PARTY.gstin} · ${REV_PARTY.state}</div>
    <div class="grid g2 iv-s-only"><div class="field"><label for="iv-tn">Client name</label><input id="iv-tn" value="${esc(MU_PARTY.name)}"></div><div class="field"><label for="iv-tg">Client GSTIN</label><input id="iv-tg" value="${MU_PARTY.gstin}"></div></div>
    <div class="grid g2 iv-s-only"><div class="field"><label for="iv-ta">Billing address</label><input id="iv-ta" value="${esc(MU_PARTY.addr)}"></div><div class="field"><label for="iv-tst">State (place of supply)</label><select id="iv-tst">${stOpts(MU_PARTY.state)}</select></div></div>
    <div class="iv-sec">Details</div>
    <div class="grid g3 sc-when"><div class="field"><label for="iv-d">Invoice date</label><input id="iv-d" type="date" value="${TODAY_ISO}"></div><div class="field"><label for="iv-terms">Payment terms</label><select id="iv-terms"><option value="0">Due on receipt</option><option value="7">7 days</option><option value="15" selected>15 days</option><option value="30">30 days</option></select></div><div class="field"><label for="iv-due">Due date</label><input id="iv-due" type="date" value="2026-10-30"></div></div>
    <div class="grid g2"><div class="field"><label for="iv-c">Cohort</label><select id="iv-c">${coh.map(c=>`<option value="${c.code}">${c.code} · ${c.prog}</option>`).join('')}</select></div><div class="field"><label for="iv-ss">Session (optional)</label><select id="iv-ss"><option value="">Not linked to a session</option>${sess.map(s=>`<option value="${s.id}">${esc(s.title)} · ${fmt(s.date)}</option>`).join('')}</select></div></div>
    <div class="iv-sec">Line items</div>
    <div class="iv-items" id="iv-items"><div class="iv-item head"><span>Description</span><span>SAC</span><span>Qty</span><span>Rate (₹)</span><span></span></div>${invItemRow({d:'Programme delivery: ',sac:'999293',q:1,r:''})}</div>
    <button class="btn sm" data-act="invadd" style="align-self:flex-start">${ic('plus')}Add line</button>
    <div class="grid g2"><div class="field"><label for="iv-gst">GST</label><select id="iv-gst"><option value="18" selected>18% (CGST + SGST, or IGST)</option><option value="0">No GST (exempt or not registered)</option></select></div><div class="field"><label for="iv-tds">TDS the payer will deduct</label><select id="iv-tds"><option value="10" selected>10% · section 194J (professional fees)</option><option value="2">2% · section 194C (contract)</option><option value="0">No TDS</option></select></div></div>
    <div class="field"><label for="iv-n">Notes on the invoice</label><input id="iv-n" value="Payment within 15 days of invoice date."></div>
    <span class="sc-err" id="iv-err"></span>
  </div>
  <div class="ivf-prev"><div class="eyebrow" style="margin-bottom:8px">Invoice preview</div><div class="inv-wrap" id="iv-prev"></div><div class="demo-note" style="margin-top:8px">Every invoice uses this same layout. Totals, GST split, TDS and the amount in words fill in as you type.</div></div>
  </div>`;
}
function invRead(){
  const g = id=>document.getElementById(id), ty=(document.querySelector('input[name="iv-ty"]:checked')||{}).value||'sales';
  const items = [...document.querySelectorAll('#iv-items .iv-item:not(.head)')].map(r=>({d:r.querySelector('.iv-desc').value.trim(),sac:r.querySelector('.iv-sac').value.trim(),q:+r.querySelector('.iv-q').value||0,r:+r.querySelector('.iv-r').value||0}));
  let from, to, fac=null;
  if (ty==='sales'){ from=REV_PARTY; to={name:g('iv-tn').value.trim(),addr:g('iv-ta').value.trim(),gstin:g('iv-tg').value.trim().toUpperCase(),pan:'',state:g('iv-tst').value,email:''}; }
  else { fac=g('iv-ff').value; from={...facParty(fac),gstin:g('iv-fg').value.trim().toUpperCase(),pan:g('iv-fp').value.trim().toUpperCase()||facParty(fac).pan}; to=REV_PARTY; }
  const n = invNext[ty];
  return {id:'IV-new',no:(ty==='sales'?'REV':'RVF')+'/26-27/'+String(n).padStart(4,'0'),type:ty,date:g('iv-d').value,due:g('iv-due').value,from,to,fac,cohort:g('iv-c').value,session:g('iv-ss').value||null,items,gst:+g('iv-gst').value,tds:+g('iv-tds').value,notes:g('iv-n').value.trim(),status:'draft',pays:[],pm:(COHORTS.find(c=>c.code===g('iv-c').value)||{}).pm||S.user,by:S.user};
}
function invCheck(v){
  if (!v.date) return 'Add the invoice date.';
  if (v.due && v.due < v.date) return 'The due date is before the invoice date.';
  if (v.type==='sales' && !v.to.name) return 'Add the client name.';
  if (v.type==='sales' && v.gst && v.to.gstin && !/^[0-9]{2}[A-Z0-9]{13}$/.test(v.to.gstin)) return 'The client GSTIN should be 15 characters, starting with the 2-digit state code.';
  if (v.type==='faculty' && v.gst && !v.from.gstin) return 'Add the faculty GSTIN, or choose "No GST" if they are not registered.';
  if (!v.items.some(i=>i.d && i.q>0 && i.r>0)) return 'Add at least one line with a description, quantity and rate.';
  return '';
}
let invLastType = 'sales';
function invPreview(e){
  const box = document.getElementById('iv-prev'); if (!box) return;
  const g = id=>document.getElementById(id);
  const ty=(document.querySelector('input[name="iv-ty"]:checked')||{}).value||'sales';
  if (ty!==invLastType){ // switching type sets sensible defaults for GST and notes
    g('iv-gst').value = ty==='sales' ? '18' : '0';
    g('iv-n').value = ty==='sales' ? 'Payment within 15 days of invoice date.' : '';
    const first = document.querySelector('#iv-items .iv-desc'); if (first && /^(Programme delivery|Teaching honorarium): ?$/.test(first.value)) first.value = ty==='sales'?'Programme delivery: ':'Teaching honorarium: ';
    invLastType = ty;
  }
  if (e && (e.target.id==='iv-d' || e.target.id==='iv-terms') && g('iv-d').value) g('iv-due').value = addDays(g('iv-d').value, +g('iv-terms').value);
  if (e && e.target.id==='iv-ss' && g('iv-ss').value){ const s=SESSIONS.find(x=>x.id===g('iv-ss').value); if (s){ g('iv-c').value = COHORTS.some(c=>c.code===s.cohort)?s.cohort:g('iv-c').value; if (ty==='faculty' && s.fac && [...g('iv-ff').options].some(o=>o.value===s.fac)) g('iv-ff').value=s.fac; const first=document.querySelector('#iv-items .iv-desc'); if (first && /^(Programme delivery|Teaching honorarium): ?$/.test(first.value)) first.value=(ty==='sales'?'Programme delivery: ':'Teaching honorarium: ')+s.title+' ('+fmt(s.date)+')'; } }
  document.querySelectorAll('.ivf .iv-s-only').forEach(x=>x.hidden = ty!=='sales');
  document.querySelectorAll('.ivf .iv-f-only').forEach(x=>x.hidden = ty!=='faculty');
  document.querySelectorAll('.iv-type label').forEach(l=>l.classList.toggle('on', l.querySelector('input').checked));
  const v = invRead(), err = invCheck(v);
  const conf = v.type==='faculty' && FACULTY[v.fac] && FACULTY[v.fac].senior;
  box.innerHTML = invDoc(v, true);
  const ee = g('iv-err'); if (ee) ee.textContent = S.invTried ? err : (conf ? 'Senior faculty: after saving, only people with honorarium access will see this amount.' : '');
}
document.addEventListener('input', e=>{ if (e.target.closest && e.target.closest('.ivf')) invPreview(e); });
document.addEventListener('change', e=>{ if (e.target.closest && e.target.closest('.ivf')) invPreview(e); });
function invPayForm(v){
  const c = invCalc(v), tdsLeft = Math.max(0, c.tds - v.pays.reduce((a,p)=>a+p.tds,0));
  return `<div class="iv-ro">Balance on <b>${esc(v.no)}</b>: <b>${rs(c.bal)}</b>${tdsLeft?` · of which TDS still to be deducted: ${rs(tdsLeft)}`:''}</div>
    <div class="grid g2"><div class="field"><label for="ip-a">${v.type==='sales'?'Amount received':'Amount paid'} (₹)</label><input id="ip-a" type="number" min="0" value="${Math.max(0,c.bal-tdsLeft)}"></div><div class="field"><label for="ip-t">TDS deducted (₹)</label><input id="ip-t" type="number" min="0" value="${tdsLeft}"></div></div>
    <div class="grid g2"><div class="field"><label for="ip-d">Date</label><input id="ip-d" type="date" value="${TODAY_ISO}"></div><div class="field"><label for="ip-r">UTR or reference</label><input id="ip-r" placeholder="e.g. UTR HDFCN2628…"></div></div>
    <p class="demo-note" style="margin:0">If the amount plus TDS covers the balance, the invoice is marked paid. A smaller amount marks it part-paid.</p>`;
}

const TEMPLATES = [
  {name:'Learner 1:1s (KPI 4)',who:'Every PM',freq:'Quarterly',when:'Last day of quarter',rec:'1:1 summary per learner',next:'2026-12-31'},
  {name:'EOD report (KPI 10)',who:'Every PM',freq:'Daily',when:'End of working day',rec:'EOD report',next:TODAY_ISO},
  {name:'Quarterly KPI scorecard',who:'Every PM',freq:'Quarterly',when:'Locked by 30th after quarter-end',rec:'Signed scorecard',next:'2026-10-30'},
  {name:'Faculty quarterly connect',who:'Every PM',freq:'Quarterly',when:'Last day of quarter',rec:'Interaction log per faculty',next:'2026-12-31'},
  {name:'Observation note (KPI 5)',who:'Session PM',freq:'Per session',when:'2 hours after session',rec:'Observation note',next:'Auto'},
  {name:'PPT review checklist (KPI 9)',who:'Session PM',freq:'Per session',when:'Before session starts',rec:'Signed-off checklist',next:'Auto'},
  {name:'Session readiness checklist',who:'Session PM',freq:'Per session',when:'2 days before',rec:'Checklist complete',next:'Auto'},
  {name:'Weekly compliance report',who:'Madhav Garg',freq:'Weekly',when:'Monday',rec:'Report sent',next:'2026-10-19'},
  {name:'Payment and TDS update',who:'Session PM',freq:'Monthly',when:'10th',rec:'TDS fields updated',next:'2026-11-10'}
];

const AUDIT = [
  ['15 Oct, 09:12','karan','marked done','T-1059 progress note added'],
  ['15 Oct, 08:47','rajiv','assigned','T-1050 Draft Q4 guest speaker shortlist'],
  ['14 Oct, 18:20','karan','changed status','T-1043 In progress → Blocked'],
  ['14 Oct, 16:03','ananya','logged 1:1','Dev Shah, Cohort 5'],
  ['14 Oct, 11:40','neha','verified KPIs','Ishita Rao, September'],
  ['13 Oct, 17:55','ishita','logged connect','Meera Kapoor'],
  ['13 Oct, 10:02','madhav','edited template','Class notes: due 2 working days after'],
  ['12 Oct, 19:30','rajiv','approved KPIs','Ananya Sharma, September']
];


/* ---------------- faculty directory ---------------- */
// Directory fields per faculty. Honorarium rates, totals and bank details are confidential: only Rajiv and Neha see them.
const FAC_EXTRA = {
  f1:{desig:'Professor, Family Business and Governance',email:'arvind.menon@example.com',phone:'+91 98450 11223',linkedin:'https://www.linkedin.com/in/arvind-menon',payroll:'Reverentia',hours:36,basis:'session',rate:85000,bank:{holder:'Arvind Menon',bank:'HDFC Bank',acct:'50100023314021',ifsc:'HDFC0000523'},pan:'AKMPM4021K'},
  f2:{desig:'Visiting Professor, Family Councils',email:'kavita.iyer@example.com',phone:'+91 98200 44781',linkedin:'https://www.linkedin.com/in/kavita-iyer',payroll:'MU',hours:12,basis:'session',rate:60000,bank:{holder:'Kavita Iyer',bank:'ICICI Bank',acct:'002101558834',ifsc:'ICIC0000021'},pan:'ABJPI8834C'},
  f3:{desig:'Mediator and Family Business Advisor',email:'rohan.bhatia@example.com',phone:'+91 98110 23990',linkedin:'https://www.linkedin.com/in/rohan-bhatia',payroll:'Reverentia',hours:10.5,basis:'hour',rate:12000,bank:{holder:'Rohan Bhatia',bank:'Axis Bank',acct:'918010044417702',ifsc:'UTIB0000049'},pan:'BHRPB7702L'},
  f4:{desig:'Next-Gen Leadership Coach',email:'meera.kapoor@example.com',phone:'+91 99100 66512',linkedin:'https://www.linkedin.com/in/meera-kapoor',payroll:'Reverentia',hours:7.5,basis:'hour',rate:20000,bank:{holder:'Meera Kapoor',bank:'Kotak Mahindra Bank',acct:'7412558890',ifsc:'KKBK0000181'},pan:'CKMPK8890D'},
  f5:{desig:'Founder, Philanthropy Advisory Practice',email:'sanjay.nair@example.com',phone:'+91 94470 31206',linkedin:'https://www.linkedin.com/in/sanjay-nair',payroll:'MU',hours:3,basis:'session',rate:55000,bank:{holder:'Sanjay Nair',bank:'Federal Bank',acct:'14520100031206',ifsc:'FDRL0001452'},pan:'AQNPN1206F'},
  f6:{desig:'Alumni Relations Consultant',email:'farah.ali@example.com',phone:'+91 98330 77104',linkedin:'https://www.linkedin.com/in/farah-khan-ali',payroll:'Reverentia',hours:2,basis:'session',rate:35000,bank:{holder:'Farah Khan Ali',bank:'HDFC Bank',acct:'50100077104118',ifsc:'HDFC0000060'},pan:'AFKPA7104H'},
  f7:{desig:'Wealth Transition Advisor',email:'vikram.sethi@example.com',phone:'+91 98111 50922',linkedin:'https://www.linkedin.com/in/vikram-sethi',payroll:'Reverentia',hours:4.5,basis:'hour',rate:20000,bank:{holder:'Vikram Sethi',bank:'ICICI Bank',acct:'663501509221',ifsc:'ICIC0006635'},pan:'BVSPS9221M'},
  f8:{desig:'Professor of Strategy',email:'anil.deshpande@example.com',phone:'+91 98220 18840',linkedin:'https://www.linkedin.com/in/anil-deshpande',payroll:'MU',hours:42,basis:'session',rate:95000,bank:{holder:'Anil Deshpande',bank:'State Bank of India',acct:'30218841902',ifsc:'SBIN0001021'},pan:'AADPD1884J'},
  f9:{desig:'Family Office Specialist',email:'lakshmi.raghavan@example.com',phone:'+91 98410 62273',linkedin:'https://www.linkedin.com/in/lakshmi-raghavan',payroll:'Reverentia',hours:0,basis:'hour',rate:15000,bank:{holder:'',bank:'',acct:'',ifsc:''},pan:''},
  f10:{desig:'Chartered Accountant, Tax and Structuring',email:'harsh.jain@example.com',phone:'+91 98290 40117',linkedin:'https://www.linkedin.com/in/harsh-vardhan-jain',payroll:'Reverentia',hours:2,basis:'hour',rate:10000,bank:{holder:'Harsh Vardhan Jain',bank:'Bank of Baroda',acct:'28470100040117',ifsc:'BARB0JAIPUR'},pan:'AHJPJ0117N'}
};
Object.entries(FAC_EXTRA).forEach(([id,x])=>Object.assign(FACULTY[id],x));
const facName = id => FACULTY[id] ? esc(FACULTY[id].name) : '<span class="tag t-bad">Not assigned</span>';
const activeFac = () => Object.entries(FACULTY).filter(([,f])=>!f.removed);
const facUnits = f => f.basis==='hour' ? (+f.hours||0) : (+f.sessions||0);
const facHon = f => (+f.rate||0) * facUnits(f);
const MASK = 'XXXX';
const honTxt = n => canConf() ? rs(n) : MASK;
const acctTxt = a => !a ? '—' : canConf() ? a : 'XXXX ' + a.slice(-4);
const hrs = h => (Math.round((+h||0)*10)/10).toLocaleString('en-IN');
const payTagF = p => `<span class="tag plain ${p==='MU'?'t-info':'t-accent'}">${p==='MU'?"MU payroll":'Reverentia payroll'}</span>`;
const lnk = u => { if (!u) return ''; const h = /^https?:\/\//i.test(u) ? u : 'https://'+u; return `<a href="${esc(h)}" target="_blank" rel="noopener noreferrer" class="zlink" data-stop-row>LinkedIn</a>`; };

function viewFaculty(){
  const pf = S.facPay || 'all';
  let list = activeFac();
  if (pf!=='all') list = list.filter(([,f])=>f.payroll===pf);
  if (S.q) list = list.filter(([,f])=>(f.name+f.desig+f.exp+f.email).toLowerCase().includes(S.q.toLowerCase()));
  list = list.sort((a,b)=>a[1].name.replace(/^(Dr\.|Prof\.)\s*/,'').localeCompare(b[1].name.replace(/^(Dr\.|Prof\.)\s*/,'')));
  const all = activeFac(), toConnect = all.filter(([,f])=>!f.lastContact || f.lastContact<'2026-10-01');
  const totalHrs = list.reduce((a,[,f])=>a+(+f.hours||0),0), totalSess = list.reduce((a,[,f])=>a+(+f.sessions||0),0), totalHon = list.reduce((a,[,f])=>a+facHon(f),0);
  const seg = `<div class="seg">${[['all','All'],['Reverentia','Reverentia payroll'],['MU','MU payroll']].map(([k,l])=>`<button class="${pf===k?'on':''}" data-act="facpay" data-v="${k}">${l}</button>`).join('')}</div>`;
  return `<div class="page-head"><div><h1>Faculty directory</h1><p>Every faculty member's profile, payroll, sessions, hours and honorarium in one place. Honorariums and bank details are visible only to people with honorarium access.</p>${kpiFeeds([3,2])}</div><div class="toolbar"><button class="btn" data-act="modal" data-m="connect">${ic('phone')}Log a connect</button><button class="btn" data-act="modal" data-m="invrecv">${ic('upload')}Attach received invoice</button>${isMgr()?`<button class="btn primary" data-act="modal" data-m="facform">${ic('plus')}Add faculty</button>`:''}</div></div>
  <div class="grid g4">
    <div class="card stat"><span class="lbl">Faculty in directory</span><span class="val num">${all.length}</span><span class="sub">${all.filter(([,f])=>f.payroll==='MU').length} on MU payroll · ${all.filter(([,f])=>f.payroll!=='MU').length} on Reverentia</span></div>
    <div class="card stat"><span class="lbl">Sessions and hours taken</span><span class="val num">${hrs(totalHrs)} h</span><span class="sub">${totalSess} sessions${pf!=='all'?' · filtered':''}</span></div>
    <div class="card stat"><span class="lbl">Honorarium to date</span><span class="val num">${honTxt(totalHon)}</span><span class="sub">${canConf()?'Rate × hours or sessions taken':`${ic('lock')} Honorarium access needed to see amounts`}</span></div>
    <div class="card stat alert"><span class="lbl">Not contacted this quarter</span><span class="val num">${toConnect.length}</span><span class="sub">Quarterly connect due by 31 Dec</span></div>
  </div>
  <div class="toolbar">${seg}</div>
  <div class="card"><div class="tbl-wrap"><table><thead><tr><th>Faculty</th><th>Contact</th><th>Payroll</th><th class="r">Sessions</th><th class="r">Hours</th><th class="r">Rate</th><th class="r">Honorarium</th><th>Invoices</th><th>Bank</th><th>Quarterly connect</th></tr></thead><tbody>
  ${list.map(([id,f])=>{const due=!f.lastContact||f.lastContact<'2026-10-01';return `<tr class="click" data-act="fac" data-id="${id}"><td class="fac-name"><b style="font-weight:600">${esc(f.name)}</b><div style="font-size:12px;color:var(--ink-3);max-width:240px">${esc(f.desig||f.exp)}${f.senior?' · Senior':''}</div></td><td style="font-size:13px"><div>${f.email?esc(f.email):'—'}</div><div>${lnk(f.linkedin)}</div></td><td>${payTagF(f.payroll)}</td><td class="r num">${f.sessions}</td><td class="r num">${hrs(f.hours)}</td><td class="r num">${canConf()?`${rs(f.rate)}<div style="font-size:11px;color:var(--ink-3)">per ${f.basis}</div>`:MASK}</td><td class="r num"><b>${honTxt(facHon(f))}</b></td><td style="white-space:nowrap">${facInvTag(id)}</td><td style="font-size:13px;white-space:nowrap">${f.bank&&f.bank.acct?`${esc(f.bank.bank)}<div class="mono" style="color:var(--ink-3)">${esc(acctTxt(f.bank.acct))}</div>`:'<span class="tag t-warn">Missing</span>'}</td><td>${due?`<button class="btn sm" data-act="modal" data-m="connect" data-id="${id}">Connect due</button>`:`<span class="tag t-good">Connected</span>`}<div style="font-size:12px;color:var(--ink-3);margin-top:3px">Last: ${f.lastContact?fmt(f.lastContact):'never'}</div></td></tr>`}).join('')||'<tr><td colspan="10" class="empty">No faculty match</td></tr>'}
  </tbody></table></div></div>
  <p class="demo-note">Honorarium = rate × hours taken (hourly faculty) or rate × sessions taken (per-session faculty). People without access see XXXX in place of rates, totals and full bank account numbers.</p>`;
}

function drawerFaculty(id){
  const f = FACULTY[id], conf = canConf();
  const calc = conf ? `${rs(f.rate)} per ${f.basis} × ${f.basis==='hour'?hrs(f.hours)+' hours':f.sessions+' sessions'} = <b>${rs(facHon(f))}</b>` : `${MASK} <span class="demo-note">${ic('lock')} Visible only to Rajiv and Neha</span>`;
  const sess = SESSIONS.filter(s=>s.fac===id).sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="scrim" data-act="close"><div class="drawer" role="dialog" aria-label="Faculty profile" data-stop>
    <div class="drawer-h"><div style="flex:1"><div class="eyebrow">${esc(f.city||'')}${f.senior?' · Senior faculty':''}</div><h2>${esc(f.name)}</h2><div class="demo-note" style="margin-top:2px">${esc(f.desig||'')}</div><div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">${payTagF(f.payroll)}${f.lastContact&&f.lastContact>='2026-10-01'?'<span class="tag t-good">Connected this quarter</span>':'<span class="tag t-warn">Connect due</span>'}</div></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div>
    <div class="drawer-b">
      ${isMgr()?`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="modal" data-m="facform" data-id="${id}">Edit profile</button><button class="btn" data-act="modal" data-m="connect" data-id="${id}">${ic('phone')}Log a connect</button><button class="btn ghost" data-act="modal" data-m="facdel" data-id="${id}" style="color:var(--bad)">Remove from directory</button></div>`:''}
      <div class="grid g3" style="gap:10px">
        <div class="card stat"><span class="lbl">Sessions taken</span><span class="val num" style="font-size:24px">${f.sessions}</span></div>
        <div class="card stat"><span class="lbl">Hours taken</span><span class="val num" style="font-size:24px">${hrs(f.hours)}</span></div>
        <div class="card stat"><span class="lbl">Honorarium to date</span><span class="val num" style="font-size:24px">${honTxt(facHon(f))}</span></div>
      </div>
      <div><div class="eyebrow" style="margin-bottom:8px">Profile</div><dl class="kv"><dt>Name</dt><dd>${esc(f.name)}</dd><dt>Designation</dt><dd>${esc(f.desig||'—')}</dd><dt>Email</dt><dd>${f.email?`<a class="zlink" href="mailto:${esc(f.email)}">${esc(f.email)}</a>`:'—'}</dd><dt>Phone</dt><dd>${esc(f.phone||'—')}</dd><dt>LinkedIn</dt><dd>${f.linkedin?lnk(f.linkedin):'—'}</dd><dt>Expertise</dt><dd>${esc(f.exp||'—')}</dd><dt>Payroll</dt><dd>${f.payroll==='MU'?"Masters' Union":'Reverentia'}</dd><dt>Programme Manager</dt><dd>${who(f.pm)}</dd><dt>Rating</dt><dd>${f.rating?f.rating.toFixed(1)+' / 5':'New'}</dd></dl></div>
      <div><div class="eyebrow" style="margin-bottom:8px">Honorarium</div><dl class="kv"><dt>Basis</dt><dd>Per ${f.basis}</dd><dt>Rate</dt><dd>${conf?rs(f.rate):MASK}</dd><dt>Calculation</dt><dd>${calc}</dd></dl></div>
      <div><div class="eyebrow" style="margin-bottom:8px">Bank details</div>${f.bank&&f.bank.acct?`<dl class="kv"><dt>Account holder</dt><dd>${esc(f.bank.holder)}</dd><dt>Bank</dt><dd>${esc(f.bank.bank)}</dd><dt>Account no.</dt><dd class="mono" style="font-size:13px">${esc(acctTxt(f.bank.acct))}</dd><dt>IFSC</dt><dd class="mono" style="font-size:13px">${conf?esc(f.bank.ifsc):MASK}</dd><dt>PAN</dt><dd class="mono" style="font-size:13px">${f.pan?(conf?esc(f.pan):'XXXXX'+esc(f.pan.slice(5))):'—'}</dd></dl>`:'<div class="demo-note">No bank details yet. Add them before the first payment.</div>'}</div>
      <div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div class="eyebrow">Invoices received</div><button class="btn sm" data-act="modal" data-m="invrecv" data-id="${id}">${ic('upload')}Attach received invoice</button></div>${facInvoices(id).length?`<div class="list">${facInvoices(id).map(v=>{const c=invCalc(v),h=invHide(v);return `<div class="item click" data-act="inv" data-id="${v.id}" style="padding-inline:0;cursor:pointer"><div class="main-t"><b style="font-weight:600">${esc(v.no)}</b><div class="meta"><span>${fmt(v.date)}</span>${v.att?`<span>${ic('file')} ${esc(v.att.name.length>26?v.att.name.slice(0,25)+'…':v.att.name)}</span>`:''}<span>${h?MASK:rs(c.total)}${!h&&c.bal>=1&&c.settled?` · ${rs(c.bal)} due`:''}</span></div></div>${invTag(v)}</div>`}).join('')}</div>`:'<div class="demo-note">No invoices yet. Attach one when the faculty sends it.</div>'}</div>
      <div><div class="eyebrow" style="margin-bottom:8px">Sessions in Optimus</div>${sess.length?`<div class="list">${sess.map(s=>`<div class="item" style="padding-inline:0"><div class="main-t"><b style="font-weight:500">${esc(s.title)}</b><div class="meta"><span>${fmt(s.date)}</span><span>${esc(s.cohort)}</span><span>${s.mode}</span></div></div></div>`).join('')}</div>`:'<div class="demo-note">No sessions scheduled in Optimus yet.</div>'}</div>
    </div></div></div>`;
}

function facForm(id){
  const f = id ? FACULTY[id] : {name:'',desig:'',email:'',phone:'',linkedin:'',city:'',exp:'',payroll:'Reverentia',pm:isMgr()?(PMS[0]||S.user):S.user,senior:false,sessions:0,hours:0,basis:'hour',rate:'',bank:{holder:'',bank:'',acct:'',ifsc:''},pan:''};
  const conf = canConf(), hideBank = id && !conf;
  const v = x => esc(x==null?'':x);
  return `<div class="facf grid" style="gap:12px">
    <div class="iv-sec" style="border:0;padding:0">Profile</div>
    <div class="grid g2"><div class="field"><label for="ff-n">Name *</label><input id="ff-n" value="${v(f.name)}" placeholder="e.g. Dr. Priya Shah"></div><div class="field"><label for="ff-d">Designation</label><input id="ff-d" value="${v(f.desig)}" placeholder="e.g. Professor of Strategy"></div></div>
    <div class="grid g2"><div class="field"><label for="ff-e">Email *</label><input id="ff-e" type="email" value="${v(f.email)}" placeholder="name@domain.com"></div><div class="field"><label for="ff-ph">Phone</label><input id="ff-ph" value="${v(f.phone)}" placeholder="+91"></div></div>
    <div class="grid g2"><div class="field"><label for="ff-l">LinkedIn</label><input id="ff-l" value="${v(f.linkedin)}" placeholder="https://www.linkedin.com/in/…"></div><div class="field"><label for="ff-c">City</label><input id="ff-c" value="${v(f.city)}"></div></div>
    <div class="field"><label for="ff-x">Expertise</label><input id="ff-x" value="${v(f.exp)}" placeholder="e.g. Succession, governance"></div>
    <div class="grid g3 sc-when"><div class="field"><label for="ff-p">Payroll</label><select id="ff-p"><option value="Reverentia" ${f.payroll!=='MU'?'selected':''}>Reverentia</option><option value="MU" ${f.payroll==='MU'?'selected':''}>Masters' Union (MU)</option></select></div><div class="field"><label for="ff-pm">Programme Manager</label><select id="ff-pm">${PMS.map(p=>`<option value="${p}" ${f.pm===p?'selected':''}>${esc(UU(p).name)}</option>`).join('')}</select></div><div class="field"><label>&nbsp;</label><label style="display:flex;gap:8px;align-items:center;font-weight:500;font-size:13px;color:var(--ink)"><input type="checkbox" id="ff-sr" ${f.senior?'checked':''}> Senior faculty</label></div></div>
    <div class="iv-sec">Sessions, hours and honorarium</div>
    <div class="grid g2"><div class="field"><label for="ff-s">Sessions taken</label><input id="ff-s" type="number" min="0" step="1" value="${+f.sessions||0}"></div><div class="field"><label for="ff-h">Hours taken</label><input id="ff-h" type="number" min="0" step="0.5" value="${+f.hours||0}"></div></div>
    ${conf?`<div class="grid g2"><div class="field"><label for="ff-b">Honorarium basis</label><select id="ff-b"><option value="hour" ${f.basis==='hour'?'selected':''}>Per hour</option><option value="session" ${f.basis==='session'?'selected':''}>Per session</option></select></div><div class="field"><label for="ff-r">Rate (₹)</label><input id="ff-r" type="number" min="0" step="500" value="${v(f.rate)}"></div></div><div class="iv-ro" id="ff-calc"></div>`:`<div class="iv-ro">${ic('lock')} Honorarium rates are set by people with honorarium access. Totals show as XXXX for everyone else.</div>`}
    <div class="iv-sec">Bank details</div>
    ${hideBank?`<div class="demo-note">Bank details on file are hidden. Leave these blank to keep them, or type new details to replace them.</div>`:''}
    <div class="grid g2"><div class="field"><label for="ff-bh">Account holder</label><input id="ff-bh" value="${hideBank?'':v(f.bank.holder)}" placeholder="${hideBank?'On file':''}"></div><div class="field"><label for="ff-bn">Bank</label><input id="ff-bn" value="${hideBank?'':v(f.bank.bank)}" placeholder="${hideBank?'On file':''}"></div></div>
    <div class="grid g3 sc-when"><div class="field"><label for="ff-ba">Account no.</label><input id="ff-ba" value="${hideBank?'':v(f.bank.acct)}" placeholder="${hideBank?acctTxt(f.bank.acct):''}"></div><div class="field"><label for="ff-bi">IFSC</label><input id="ff-bi" value="${hideBank?'':v(f.bank.ifsc)}" placeholder="${hideBank?'XXXX':'e.g. HDFC0001234'}"></div><div class="field"><label for="ff-pan">PAN</label><input id="ff-pan" value="${hideBank?'':v(f.pan)}" placeholder="${hideBank?'XXXX':'ABCDE1234F'}"></div></div>
    <span class="sc-err" id="ff-err"></span>
  </div>`;
}
let irFile = null;
const facInvoices = id => INVOICES.filter(v=>v.type==='faculty' && v.fac===id && v.status!=='cancelled' && (isMgr()||v.pm===S.user));
function facInvTag(id){
  const list = facInvoices(id); if (!list.length) return '<span class="demo-note">None</span>';
  const st = list.map(invStatus).filter(x=>x!=='Cancelled'), od = st.filter(x=>x==='Overdue').length, ap = st.filter(x=>x==='To approve').length, open = st.filter(x=>x!=='Paid').length;
  if (od) return `<span class="tag t-bad">${od} overdue</span>`;
  if (ap) return `<span class="tag t-accent">${ap} to approve</span>`;
  if (open) return `<span class="tag t-warn">${open} unpaid</span>`;
  return `<span class="tag t-good">${list.length} paid</span>`;
}
function recvForm(fid){
  const facs = activeFac().filter(([,f])=>isMgr()||f.pm===S.user);
  const sess = visibleSessions().slice().sort((a,b)=>b.date.localeCompare(a.date));
  irFile = null;
  return `<div class="grid recvf" style="gap:12px">
    <div class="field"><label for="ir-f">Faculty member</label><select id="ir-f">${facs.map(([k,f])=>`<option value="${k}" ${k===fid?'selected':''}>${esc(f.name)}</option>`).join('')}</select></div>
    <div class="drop" id="ir-drop"><div style="font-weight:600" id="ir-fname">Attach the invoice the faculty sent you</div><div class="demo-note">PDF, JPG or PNG</div><label class="btn sm" for="ir-file">Choose file</label><input id="ir-file" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*" hidden></div>
    <div class="grid g2"><div class="field"><label for="ir-no">Faculty's invoice no.</label><input id="ir-no" placeholder="As printed on their invoice"></div><div class="field"><label for="ir-ss">Session</label><select id="ir-ss"><option value="">Not linked to a session</option>${sess.map(s=>`<option value="${s.id}" data-fac="${s.fac||''}">${esc(s.title)} · ${fmt(s.date)}</option>`).join('')}</select></div></div>
    <div class="grid g3 sc-when"><div class="field"><label for="ir-d">Invoice date</label><input id="ir-d" type="date" value="${TODAY_ISO}"></div><div class="field"><label for="ir-r">Received on</label><input id="ir-r" type="date" value="${TODAY_ISO}"></div><div class="field"><label for="ir-due">Pay by</label><input id="ir-due" type="date" value="2026-10-30"></div></div>
    <div class="grid g3 sc-when"><div class="field"><label for="ir-a">Amount before GST (₹)</label><input id="ir-a" type="number" min="0" step="100"></div><div class="field"><label for="ir-g">GST</label><select id="ir-g"><option value="0">No GST</option><option value="18">18%</option></select></div><div class="field"><label for="ir-t">TDS to deduct</label><select id="ir-t"><option value="10">10% · 194J</option><option value="2">2% · 194C</option><option value="0">None</option></select></div></div>
    <div class="field"><label for="ir-desc">What is it for?</label><input id="ir-desc" value="Teaching honorarium"></div>
    <div class="iv-ro" id="ir-sum"></div>
    <span class="sc-err" id="ir-err"></span>
  </div>`;
}
function recvSum(e){
  const g=id=>document.getElementById(id), box=g('ir-sum'); if (!box) return;
  if (e && e.target.id==='ir-file' && e.target.files[0]){ irFile=e.target.files[0]; g('ir-fname').textContent = irFile.name+' · '+(irFile.size/1024).toFixed(0)+' KB'; g('ir-drop').style.borderColor='var(--good)'; }
  if (e && e.target.id==='ir-r' && g('ir-r').value) g('ir-due').value = addDays(g('ir-r').value, 15);
  if (e && e.target.id==='ir-ss' && g('ir-ss').value){ const s=SESSIONS.find(x=>x.id===g('ir-ss').value); if (s){ if (s.fac && [...g('ir-f').options].some(o=>o.value===s.fac)) g('ir-f').value=s.fac; g('ir-desc').value='Teaching honorarium: '+s.title+' ('+fmt(s.date)+')'; } }
  const a=+g('ir-a').value||0, gst=Math.round(a*(+g('ir-g').value)/100), tds=Math.round(a*(+g('ir-t').value)/100);
  const sen = FACULTY[g('ir-f').value] && FACULTY[g('ir-f').value].senior;
  box.innerHTML = a ? `Invoice total <b>${rs(a+gst)}</b>${gst?` (incl. GST ${rs(gst)})`:''} · TDS ${rs(tds)} · <b>net to pay ${rs(a+gst-tds)}</b>${sen&&!canConf()?' · amount will then show only to people with honorarium access':''}` : 'Enter the amount to see the total, TDS and net payable.';
}
document.addEventListener('input', e=>{ if (e.target.closest && e.target.closest('.recvf')) recvSum(e); });
document.addEventListener('change', e=>{ if (e.target.closest && e.target.closest('.recvf')) recvSum(e); });
function recvSave(){
  const g=id=>document.getElementById(id), fid=g('ir-f').value, a=+g('ir-a').value||0;
  const err = !irFile ? 'Attach the invoice file the faculty sent.' : !a ? 'Enter the invoice amount.' : !g('ir-d').value ? 'Add the invoice date.' : '';
  if (err){ g('ir-err').textContent = err; return null; }
  const s = g('ir-ss').value ? SESSIONS.find(x=>x.id===g('ir-ss').value) : null;
  const no = g('ir-no').value.trim() || 'RVF/26-27/'+String(invNext.faculty).padStart(4,'0');
  const v = {id:newId('IV-', 49+INVOICES.length-8), no, type:'faculty', date:g('ir-d').value, due:g('ir-due').value||addDays(g('ir-d').value,15), from:{...facParty(fid), gstin: +g('ir-g').value ? 'On invoice' : '', pan: FACULTY[fid].pan || facParty(fid).pan}, to:REV_PARTY, fac:fid, cohort: s && COHORTS.some(c=>c.code===s.cohort) ? s.cohort : (COHORTS.find(c=>c.faculty.includes(fid))||COHORTS[0]).code, session: s?s.id:null, items:[{d:g('ir-desc').value.trim()||'Teaching honorarium',sac:'999293',q:1,r:a}], gst:+g('ir-g').value, tds:+g('ir-t').value, notes:'', status:'received', pays:[], pm: FACULTY[fid].pm, by:S.user, recvd:g('ir-r').value, att:{name:irFile.name, size:irFile.size, blob:irFile, url:URL.createObjectURL(irFile), at:g('ir-r').value||TODAY_ISO}};
  if (!g('ir-no').value.trim()) invNext.faculty++;
  INVOICES.unshift(v); irFile = null;
  return v;
}
function facCalc(){
  const g=id=>document.getElementById(id), box=g('ff-calc'); if (!box) return;
  const basis=g('ff-b').value, rate=+g('ff-r').value||0, units = basis==='hour' ? (+g('ff-h').value||0) : (+g('ff-s').value||0);
  box.innerHTML = `Honorarium to date: ${rs(rate)} per ${basis} × ${basis==='hour'?hrs(units)+' hours':units+' sessions'} = <b>${rs(rate*units)}</b>`;
}
document.addEventListener('input', e=>{ if (e.target.closest && e.target.closest('.facf')) facCalc(); });
document.addEventListener('change', e=>{ if (e.target.closest && e.target.closest('.facf')) facCalc(); });
function facSave(id){
  const g=x=>document.getElementById(x), val=x=>g(x)?g(x).value.trim():'';
  const name=val('ff-n'), email=val('ff-e'), li=val('ff-l');
  const err = !name ? 'Add the faculty member\'s name.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Add a valid email address.' : (li && !/linkedin\.com\//i.test(li)) ? 'The LinkedIn link should be a linkedin.com address.' : (val('ff-bi') && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(val('ff-bi'))) ? 'IFSC should be 11 characters, like HDFC0001234.' : (val('ff-pan') && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(val('ff-pan'))) ? 'PAN should look like ABCDE1234F.' : '';
  if (err){ g('ff-err').textContent = err; return null; }
  const isNew = !id; if (isNew) id = newId('f', Object.keys(FACULTY).length+1);
  const f = FACULTY[id] || {sessions:0,hours:0,lastSession:null,lastContact:null,rating:null,basis:'hour',rate:0,bank:{holder:'',bank:'',acct:'',ifsc:''},pan:''};
  Object.assign(f,{name,desig:val('ff-d'),email,phone:val('ff-ph'),linkedin:li,city:val('ff-c'),exp:val('ff-x'),payroll:val('ff-p'),pm:val('ff-pm'),senior:g('ff-sr').checked,sessions:+val('ff-s')||0,hours:+val('ff-h')||0});
  if (g('ff-b')){ f.basis=val('ff-b'); f.rate=+val('ff-r')||0; }
  const nb={holder:val('ff-bh'),bank:val('ff-bn'),acct:val('ff-ba'),ifsc:val('ff-bi').toUpperCase()};
  if (canConf() || isNew || Object.values(nb).some(Boolean)) f.bank = Object.values(nb).some(Boolean) ? nb : (isNew ? nb : f.bank);
  if (canConf() || isNew || val('ff-pan')) f.pan = val('ff-pan').toUpperCase() || (isNew ? '' : f.pan);
  FACULTY[id] = f;
  return {id, isNew, name};
}

/* ---------------- data bridge ---------------- */
const EMPTY_BANK = () => ({holder:'',bank:'',acct:'',ifsc:''});
const BRIDGE = {
  users: USERS, pms: PMS, audit: AUDIT,
  invoices: () => INVOICES,
  invConf: v => invConf(v),
  canConf: () => !!S.user && canConf(),
  toast: m => toast(m),
  render: () => render(),
  collect(){
    const out = [];
    const put = (collection, id, owner_key, confidential, data) => out.push({collection, id:String(id), owner_key: owner_key||null, confidential: !!confidential, data});
    TASKS.forEach(t => put('tasks', t.id, t.owner, false, t));
    SESSIONS.forEach(x => put('sessions', x.id, x.pm, false, x));
    Object.entries(FACULTY).forEach(([id,f]) => { const {rate, bank, pan, ...pub} = f; put('faculty', id, f.pm, false, pub); put('faculty_private', id, f.pm, true, {rate:+rate||0, bank: bank||EMPTY_BANK(), pan: pan||''}); });
    COHORTS.forEach(c => put('cohorts', c.code, c.pm, false, c));
    HONORARIA.forEach(h => put('honoraria', h.fac+'|'+h.session, null, true, h));
    INVOICES.forEach(v => { const d = {...v}; if (d.att){ const {blob, url, ...a} = d.att; d.att = a; } put('invoices', v.id, v.pm, invConf(v), d); });
    put('settings', 'kstate', null, false, KSTATE);
    put('settings', 'kq', null, false, KQ);
    put('settings', 'invnext', null, false, invNext);
    return out;
  },
  hydrate(rows){
    const by = c => rows.filter(r => r.collection===c);
    const asc = c => by(c).sort((a,b)=>a.seq-b.seq).map(r=>r.data);
    const desc = c => by(c).sort((a,b)=>b.seq-a.seq).map(r=>r.data);
    TASKS = desc('tasks');
    SESSIONS = asc('sessions');
    INVOICES = desc('invoices');
    const priv = Object.fromEntries(by('faculty_private').map(r=>[r.id, r.data]));
    Object.keys(FACULTY).forEach(k => delete FACULTY[k]);
    by('faculty').sort((a,b)=>a.seq-b.seq).forEach(r => { FACULTY[r.id] = {rate:0, bank:EMPTY_BANK(), pan:'', ...r.data, ...(priv[r.id]||{})}; });
    COHORTS.length = 0; COHORTS.push(...asc('cohorts'));
    HONORARIA.length = 0; HONORARIA.push(...asc('honoraria'));
    const setting = id => (by('settings').find(r=>r.id===id)||{}).data;
    const swap = (obj, val) => { if (!val) return; Object.keys(obj).forEach(k=>delete obj[k]); Object.assign(obj, val); };
    swap(KSTATE, setting('kstate') || {Q3:{}, Q4:{}}); swap(KQ, setting('kq') || {Q3:{}, Q4:{}}); swap(invNext, setting('invnext') || {sales:1, faculty:1});
    STUDENTS = COHORTS.filter(c=>c.status==='Running').flatMap(c=>c.students||[]);
  },
  login(key){
    S.user = key; S.view = UU(key).kind==='pm' ? 'myday' : 'overview';
    S.taskScope = UU(key).kind==='chair' ? 'assigned' : 'mine';
    if (pendingReqs().length) S.adminTab = 'users';
  }
};

/* ---------------- state ---------------- */
const S = {user:null, view:null, taskFilter:'open', taskScope:'mine', kpiMonth:'Oct', payTab:'status', adminTab:'templates', sessTab:'upcoming', drawer:null, modal:null, toast:null, notif:false, q:'', cohort:null, ctab:'profile', up:null, kpiQ:'Q3', kpiPm:'team', invF:'all', invT:'all', invTried:false, facPay:'all'};
try{ const r = localStorage.getItem('optimus-role'); if(r && USERS[r]) {} }catch(e){}

// Everyone whose work is tracked: the whole team except the chairperson.
// "My team" is everyone who reports to me, directly or through someone who reports to me (Admin > People and access > Reports to).
const teamOf = me => { const out = []; let front = [me]; while (front.length){ const next = Object.keys(USERS).filter(k=>k!==me && !out.includes(k) && front.includes(UU(k).boss)); out.push(...next); front = next; } return out; };
const teamPms = () => db.demo ? PMS : PMS.filter(p=>teamOf(S.user).includes(p));
const trackedPeople = () => db.demo ? ['neha','madhav','ananya','karan','ishita'] : teamOf(S.user);
const noTeamNote = () => `<div class="card"><div class="empty">No one reports to you yet, so your team is empty. ${canManageUsers()?'Set who reports to whom in Admin, then People and access.':'Ask the DWM owner to set it in Admin, then People and access.'}</div></div>`;
const isMgr = () => ['chair','head','owner','lead'].includes(UU(S.user).kind);
// Honorarium access is a per-person switch (People and access). The preview falls back to role.
// The DWM owner always has every kind of access, whatever the hierarchy or switches say.
const isOwner = id => UU(id).kind === 'owner';
const hasHon = id => { const u = UU(id); if (u.kind === 'owner') return true; return u.hon != null ? !!u.hon : ['chair','head'].includes(u.kind); };
const canConf = () => hasHon(S.user);
// Sign-up requests waiting for the DWM owner (the database only returns them to an owner).
const REQUESTS = db.demo ? [{email:'riya.kapoor@mastersunion.org', name:'Riya Kapoor', status:'pending', requested_at:new Date().toISOString()}] : (db.requests||[]).slice();
const pendingReqs = () => isOwner(S.user) ? REQUESTS.filter(r=>r.status==='pending') : [];
const isOverdue = t => t.status!=='done' && dayDiff(t.due) < 0;
const visibleTasks = () => isMgr() ? TASKS : TASKS.filter(t=>t.owner===S.user);
const visibleSessions = () => isMgr() ? SESSIONS : SESSIONS.filter(s=>s.pm===S.user);
const visibleStudents = () => isMgr() ? STUDENTS : STUDENTS.filter(s=>s.pm===S.user);

/* ---------------- icons ---------------- */
const I = {
  pin:'<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/>',
  home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  check:'<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2A5 5 0 0 1 21.5 19"/>',
  cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>',
  tick:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chat:'<path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-6.2A8 8 0 1 1 21 12z"/>',
  note:'<path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4M8 9h8M8 13h5"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  download:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
  receipt:'<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'
};
const ic = (n, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const av = (id, lg) => `<span class="av${lg?' lg':''}" style="background:${UU(id).color}" title="${esc(UU(id).name)}">${initials(id)}</span>`;
const who = id => `<span class="who">${av(id)}<span>${esc(UU(id).name)}</span></span>`;

function statusTag(t){
  if (t.status==='done') return '<span class="tag t-good">Done</span>';
  if (isOverdue(t)) return `<span class="tag t-bad">Overdue ${-dayDiff(t.due)}d</span>`;
  if (t.status==='blocked') return '<span class="tag t-warn">Blocked</span>';
  if (t.status==='doing') return '<span class="tag t-info">In progress</span>';
  return '<span class="tag">Not started</span>';
}
function dueText(s){ const d = dayDiff(s); if (d===0) return 'Due today'; if (d===1) return 'Due tomorrow'; if (d<0) return `Was due ${fmt(s)}`; return `Due ${fmt(s)}`; }

/* ---------------- nav ---------------- */
function navFor(){
  const k = UU(S.user).kind;
  const overdue = visibleTasks().filter(isOverdue).length;
  const items = [];
  if (k==='pm') items.push(['myday','My Day','sun']);
  else items.push(['overview','Overview','home']);
  items.push(['cohorts','Cohorts','layers']);
  items.push(['tasks','Tasks','check',overdue]);
  items.push(['sessions','Sessions','cal']);
  items.push(['faculty','Faculty','people']);
  items.push(['students','Students','cap']);
  items.push(['kpis', k==='pm'?'My KPIs':'KPIs','chart']);
  if (k!=='pm') items.push(['payments','Payments','wallet']);
  items.push(['invoices','Invoices','receipt',visibleInvoices().filter(v=>invStatus(v)==='Overdue').length]);
  if (k!=='pm') items.push(['reports','Reports','file']);
  if (k==='owner' || k==='chair' || k==='head') items.push(['admin','Admin','gear',pendingReqs().length]);
  return items;
}

/* ---------------- views ---------------- */
function viewLogin(){
  const order = ['rajiv','neha','madhav','shivpriya','ananya','karan'];
  return `<div class="login">
  <section class="login-art"><canvas id="weave"></canvas>
    <div class="brand"><span class="brand-mark">O</span>Optimus</div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <h1>Every task, session and KPI in one place.</h1>
      <p>Optimus is Reverentia's daily work management system. Everyone sees what to do, by when, and where to update it. Leaders see live status without chasing anyone.</p>
    </div>
    <div class="login-promise">
      <div><b>One source of truth</b>Tasks, sessions, faculty, students and KPIs</div>
      <div><b>Recurring work, automated</b>Daily to quarterly duties appear on their own</div>
      <div><b>Live for leadership</b>Overdue and missing updates flagged automatically</div>
      <div><b>Private where it matters</b>Honorariums visible only to Rajiv and Neha</div>
    </div>
  </section>
  <section class="login-form"><div class="login-card">
    <div><div class="eyebrow">Masters' Union · School of Family Business</div><h2 style="margin-top:6px">Sign in to Optimus</h2></div>
    <button class="gbtn" data-act="login" data-u="rajiv"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Continue with Google</button>
    <div class="divider">Demo: view as</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${order.map(id=>`<button class="persona" data-act="login" data-u="${id}">${av(id,true)}<span><b>${esc(UU(id).name)}</b><small>${esc(UU(id).role)}</small></span><span class="tag plain ${UU(id).kind==='pm'?'t-accent':''}">${UU(id).kind==='pm'?'Own work only':UU(id).kind==='owner'?'Everything':UU(id).kind==='chair'||UU(id).kind==='head'?'Full access':'Team view'}</span></button>`).join('')}
    </div>
    <p class="demo-note">This is a design preview with sample data. Names, sessions and figures are illustrative.</p>
  </div></section></div>`;
}

function shell(content){
  const u = USERS[S.user];
  const nav = navFor();
  const notifs = notifications();
  return `<a class="skip" href="#main">Skip to main content</a><div class="app">
  <aside class="rail" aria-label="Main menu">
    <div class="brand"><span class="brand-mark">O</span>Optimus</div>
    <nav class="nav" aria-label="Main">
      <div class="nav-label">Workspace</div>
      ${nav.map(([k,l,i,c])=>`<button class="${S.view===k?'on':''}" data-act="go" data-v="${k}" ${S.view===k?'aria-current="page"':''}>${ic(i)}<span>${l}</span>${c?`<span class="count"><span class="sr-only">, </span>${c}<span class="sr-only"> ${k==='admin'?'waiting for approval':'overdue'}</span></span>`:''}</button>`).join('')}
    </nav>
    <div class="rail-foot">
      <div class="me">${av(S.user)}<div><b>${esc(u.name)}</b><small>${esc(u.role)}</small></div></div>
      <button class="switch" data-act="logout">${db.demo?'Switch person':'Sign out'}</button>
    </div>
  </aside>
  <div class="main">
    <header class="topbar">
      <label class="search">${ic('search')}<input id="q" type="search" placeholder="Search students, cohorts, tasks, sessions, faculty" value="${esc(S.q)}" aria-label="Search everything" autocomplete="off"></label>
      <span class="spacer"></span>
      ${db.demo?'<span class="demo-pill">Preview · sample data</span>':(db.status?`<span class="demo-pill">${esc(db.status)}</span>`:'')}
      <button class="iconbtn easy-btn" data-act="easy" aria-pressed="${document.documentElement.hasAttribute('data-easy')}" title="Easy reading: larger text and stronger contrast">Aa</button><button class="iconbtn" data-act="theme" aria-label="Toggle theme">${ic('moon')}</button>
      <div style="position:relative">
        <button class="iconbtn" data-act="notif" aria-label="Notifications">${ic('bell')}${notifs.length?'<span class="dot"></span>':''}</button>
        ${S.notif?`<div class="card notif"><div class="card-h"><h2 class="h3">Notifications</h2><small>${notifs.length}</small></div><div class="list">${notifs.map(n=>`<div class="item"><span class="sev" style="background:var(--${n[0]})"></span><div class="main-t"><b style="font-weight:500">${n[1]}</b><div class="meta">${n[2]}</div></div></div>`).join('')}</div></div>`:''}
      </div>
      <button class="iconbtn mobile-only" data-act="logout" aria-label="Switch person">${av(S.user)}</button>
    </header>
    <main class="page" id="main" tabindex="-1">${content}</main>
  </div>
  </div>`;
}

function notifications(){
  const mine = visibleTasks().filter(t=>t.owner===S.user || isMgr());
  const out = [];
  mine.filter(isOverdue).slice(0,3).forEach(t=>out.push(['bad',`${esc(t.title)}`,`${esc(UU(t.owner).name)} · overdue since ${fmt(t.due)}`]));
  mine.filter(t=>t.status!=='done' && dayDiff(t.due)>=0 && dayDiff(t.due)<=2).slice(0,2).forEach(t=>out.push(['warn',esc(t.title),dueText(t.due)]));
  if (UU(S.user).kind==='pm' && kstate('Q3',S.user)==='Ready for review') out.unshift(['info','Your Q3 KPI scorecard is ready. Review and sign it by 30 Oct.','KPIs · today']);
  if (pendingReqs().length) out.unshift(['info',`${pendingReqs().length===1?esc(pendingReqs()[0].name||pendingReqs()[0].email)+' is':pendingReqs().length+' people are'} waiting for you to approve their Optimus account.`,'Admin · People and access']);
  if (UU(S.user).kind==='chair') out.unshift(['info','Ananya Sharma signed her Q3 KPI scorecard. Approve and lock it by 30 Oct.','KPIs · today']);
  return out;
}

function taskRow(t, opts={}){
  const done = t.status==='done';
  const sevC = done?'transparent':isOverdue(t)?'var(--bad)':dayDiff(t.due)<=1?'var(--warn)':'transparent';
  return `<div class="item ${done?'done':''}">
    <span class="sev" style="background:${sevC}"></span>
    <button class="chk ${done?'on':''}" data-act="toggle" data-id="${t.id}" aria-label="Mark ${done?'not done':'done'}">${ic('tick')}</button>
    <div class="main-t" data-act="open" data-id="${t.id}" style="cursor:pointer">
      <b>${esc(t.title)}</b>
      <div class="meta"><span>${dueText(t.due)}</span><span>${esc(t.freq)}</span><span>${esc(t.cat)}</span>${taskKpi(t)?`<span>KPI ${taskKpi(t)} · ${KPI_DEF[taskKpi(t)-1].w}%</span>`:''}${t.comments.length?`<span>${t.comments.length} comment${t.comments.length>1?'s':''}</span>`:''}${opts.showOwner?`<span>${esc(UU(t.owner).name)}</span>`:''}</div>
    </div>
    ${statusTag(t)}
  </div>`;
}

function ring(pct, label){
  if (!isFinite(pct)) return `<svg class="ring" viewBox="0 0 84 84" role="img" aria-label="${label}: no data yet"><circle cx="42" cy="42" r="34" fill="none" stroke="var(--surface-2)" stroke-width="8"/><text x="42" y="47" text-anchor="middle" font-size="15" font-weight="600" fill="var(--ink-3)">—</text></svg>`;
  const r=34, c=2*Math.PI*r, off=c*(1-Math.min(pct,100)/100);
  const col = pct>=90?'var(--good)':pct>=60?'var(--warn)':'var(--bad)';
  return `<svg class="ring" viewBox="0 0 84 84" role="img" aria-label="${label} ${pct}%"><circle cx="42" cy="42" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="8"/><circle cx="42" cy="42" r="${r}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 42 42)"/><text x="42" y="47" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-size="17" font-weight="600" fill="var(--ink)">${pct}%</text></svg>`;
}

function viewMyDay(){
  const me = S.user, u = USERS[me];
  const mine = TASKS.filter(t=>t.owner===me);
  const overdue = mine.filter(isOverdue);
  const today = mine.filter(t=>t.status!=='done' && dayDiff(t.due)===0);
  const week = mine.filter(t=>t.status!=='done' && dayDiff(t.due)>0 && dayDiff(t.due)<=7);
  const later = mine.filter(t=>t.status!=='done' && dayDiff(t.due)>7);
  const studs = STUDENTS.filter(s=>s.pm===me), done1 = studs.filter(s=>s.last).length;
  const facs = activeFac().filter(([,f])=>f.pm===me);
  const conn = facs.filter(([,f])=>f.lastContact && f.lastContact>='2026-10-01').length;
  const sess = SESSIONS.filter(s=>s.pm===me && dayDiff(s.date)>=0).sort((a,b)=>a.date.localeCompare(b.date));
  const notesDue = SESSIONS.filter(s=>s.pm===me && dayDiff(s.date)<0 && !s.notes);
  const section = (title, list, hint) => list.length?`<div class="card"><div class="card-h"><h2 class="h3">${title}</h2><small>${hint}</small></div><div class="list">${list.map(t=>taskRow(t)).join('')}</div></div>`:'';
  return `
  <section class="hello">
    <div><div class="eyebrow" style="color:var(--rail-ink-2)">${fmtLong(TODAY_ISO)}</div><h1>Good morning, ${esc(u.name.split(' ')[0])}</h1><p>${overdue.length?`${overdue.length} item${overdue.length>1?'s are':' is'} overdue. Start there.`:'Nothing overdue. Nice work.'}</p></div>
    <div class="hello-stats">
      <div><b class="${overdue.length?'red':''}">${overdue.length}</b><span>Overdue</span></div>
      <div><b>${today.length}</b><span>Due today</span></div>
      <div><b>${week.length}</b><span>This week</span></div>
      <div><b>${sess.length}</b><span>Upcoming sessions</span></div>
    </div>
  </section>
  <div class="quick">
    <button class="btn primary" data-act="modal" data-m="oneone">${ic('chat')}Log student 1:1</button>
    <button class="btn" data-act="modal" data-m="connect">${ic('phone')}Log faculty connect</button>
    <button class="btn" data-act="modal" data-m="notes">${ic('note')}Add class notes</button>
    <button class="btn" data-act="toast" data-t="EOD report submitted at 6:02 PM. Counts toward KPI 10.">${ic('file')}Submit EOD report</button>
    <button class="btn" data-act="modal" data-m="task">${ic('plus')}New task</button>
  </div>
  <div class="grid g21">
    <div class="grid" style="align-content:start">
      ${section('Overdue',overdue,'Update or reschedule these first')}
      ${section('Today',today,fmtLong(TODAY_ISO))}
      ${section('This week',week,'Next 7 days')}
      ${section('Later',later,'Recurring and long-running')}
    </div>
    <div class="grid" style="align-content:start">
      <div class="card"><div class="card-h"><h2 class="h3">Q4 coverage</h2><small>Quarter to date</small></div>
        <div class="card-b grid" style="gap:16px">
          <div class="ring-row">${ring(Math.round(done1/studs.length*100),'Student 1:1 coverage')}<div><b>Learner 1:1s</b> ${kpiChip(4)}<div class="demo-note">${done1} of ${studs.length} learners met this quarter. ${studs.length-done1} to go by 31 Dec.</div><button class="btn ghost sm" data-act="go" data-v="students" style="padding-left:0">See who is pending</button></div></div>
          <div class="ring-row">${ring(Math.round(conn/facs.length*100),'Faculty connect coverage')}<div><b>Faculty touchbase</b> ${kpiChip(3)}<div class="demo-note">${conn} of ${facs.length} faculty contacted this quarter.</div><button class="btn ghost sm" data-act="go" data-v="faculty" style="padding-left:0">See who to call</button></div></div>
        </div>
      </div>
      <div class="card"><div class="card-h"><h2 class="h3">Next sessions</h2><button class="btn ghost sm" data-act="go" data-v="sessions">All</button></div>
        <div class="list">${sess.slice(0,3).map(s=>sessItem(s)).join('') || '<div class="empty">No upcoming sessions</div>'}</div>
      </div>
      ${notesDue.length?`<div class="card"><div class="card-h"><h2 class="h3">Notes missing</h2><span class="tag t-bad">${notesDue.length}</span></div><div class="list">${notesDue.map(s=>`<div class="item"><div class="main-t"><b>${esc(s.title)}</b><div class="meta">${fmt(s.date)} · due ${fmt(addWorkdays(s.date,2))}</div></div><button class="btn sm" data-act="modal" data-m="notes" data-id="${s.id}">Add notes</button></div>`).join('')}</div></div>`:''}
      ${myKpiCard()}
        </div>
  </div>`;
}
function addWorkdays(s,n){ const d=D(s); while(n>0){ d.setDate(d.getDate()+1); if(d.getDay()%6) n--; } return d.toISOString().slice(0,10); }
function kpiLine(m,t,a){
  const pct = Math.min(100, Math.round(a/t*100));
  const col = pct>=90?'var(--good)':pct>=60?'var(--warn)':'var(--bad)';
  return `<div><div style="display:flex;justify-content:space-between;font-size:13px"><span>${m.label}</span><span class="num"><b>${a}${m.unit}</b> <span style="color:var(--ink-3)">/ ${t}${m.unit}</span></span></div><div class="bar" style="margin-top:6px"><i style="width:${pct}%;background:${col}"></i></div></div>`;
}
function sessItem(s){
  const ready = s.check.filter(Boolean).length;
  const rc = ready===5?'t-good':ready>=3?'t-warn':'t-bad';
  return `<div class="item" data-act="session" data-id="${s.id}" style="cursor:pointer">
    <div style="text-align:center;min-width:44px"><div class="eyebrow" style="font-size:11px">${D(s.date).toLocaleDateString('en-IN',{month:'short'})}</div><div style="font-family:var(--f-display);font-size:22px;font-weight:600;line-height:1">${D(s.date).getDate()}</div></div>
    <div class="main-t"><b>${esc(s.title)}</b><div class="meta"><span>${s.time} · ${s.mode}</span><span>${s.fac?esc(FACULTY[s.fac].name):'<span style="color:var(--bad)">No faculty yet</span>'}</span></div></div>
    <span class="tag ${rc}">${ready}/5 ready</span></div>`;
}

function spark(vals, col){
  const w=200,h=34,max=Math.max(...vals),min=Math.min(...vals);
  const pts = vals.map((v,i)=>[i/(vals.length-1)*w, h-4-(v-min)/((max-min)||1)*(h-10)]);
  const d = pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('');
  const last = pts[pts.length-1];
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}L${w} ${h}L0 ${h}Z" fill="${col}" opacity=".12"/><path d="${d}" fill="none" stroke="${col}" stroke-width="2" vector-effect="non-scaling-stroke"/><circle cx="${last[0]}" cy="${last[1]}" r="3" fill="${col}"/></svg>`;
}

function compliance(id){
  const ts = TASKS.filter(t=>t.owner===id);
  const due = ts.filter(t=>dayDiff(t.due)<=0);
  const ok = due.filter(t=>t.status==='done').length;
  const od = ts.filter(isOverdue).length;
  const pct = due.length? Math.round((due.length-od)/due.length*100) : 100;
  return {open:ts.filter(t=>t.status!=='done').length, od, pct};
}

function viewOverview(){
  const k = UU(S.user).kind;
  const all = TASKS, open = all.filter(t=>t.status!=='done'), od = all.filter(isOverdue);
  const week = open.filter(t=>dayDiff(t.due)>=0 && dayDiff(t.due)<=7);
  const mine = all.filter(t=>t.by===S.user);
  const people = trackedPeople();
  const missingNotes = SESSIONS.filter(s=>dayDiff(s.date)<-2 && !s.notes);
  const pending11 = STUDENTS.filter(s=>!s.last).length;
  const upcoming = SESSIONS.filter(s=>dayDiff(s.date)>=0).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
  const comp = people.length ? Math.round(people.reduce((a,p)=>a+compliance(p).pct,0)/people.length) : 0;
  return `
  <div class="page-head"><div><div class="eyebrow">${fmtLong(TODAY_ISO)} · Week ${isoWeek(TODAY)}</div><h1>${k==='chair'?'Good morning, Rajiv':'Team overview'}</h1><p>Live status across Reverentia. Updated as people mark their work.</p></div>
  <div class="toolbar"><button class="btn" data-act="go" data-v="reports">${ic('file')}Weekly report</button><button class="btn primary" data-act="modal" data-m="task">${ic('plus')}Assign a task</button></div></div>
  <div class="grid g4">
    <div class="card stat"><span class="lbl">Open tasks</span><span class="val num">${open.length}</span>${spark([22,19,24,21,18,20,open.length],'var(--accent)')}<span class="sub">Across ${new Set(open.map(t=>t.owner)).size} people</span></div>
    <div class="card stat alert"><span class="lbl">Overdue</span><span class="val num">${od.length}</span>${spark([3,5,4,6,7,5,od.length],'var(--bad)')}<span class="sub">Oldest: ${fmt(od.map(t=>t.due).sort()[0])}</span></div>
    <div class="card stat"><span class="lbl">Due in the next 7 days</span><span class="val num">${week.length}</span>${spark([9,8,11,10,7,9,week.length],'var(--info)')}<span class="sub">${week.filter(t=>t.pri==='High').length} high priority</span></div>
    <div class="card stat"><span class="lbl">On-time compliance</span><span class="val num">${comp}%</span>${spark([71,74,70,76,79,77,comp],'var(--good)')}<span class="sub">Target 90%</span></div>
  </div>
  <div class="grid g21">
    <div class="card"><div class="card-h"><h2 class="h3">Needs attention</h2><small>Overdue and missing updates, oldest first</small></div>
      <div class="list">
        ${od.sort((a,b)=>a.due.localeCompare(b.due)).map(t=>`<div class="item click" data-act="open" data-id="${t.id}" style="cursor:pointer"><span class="sev" style="background:var(--bad)"></span>${av(t.owner)}<div class="main-t"><b>${esc(t.title)}</b><div class="meta"><span>${esc(UU(t.owner).name)}</span><span>Assigned by ${esc(UU(t.by).name.split(' ')[0])}</span>${t.comments.length?`<span>“${esc(t.comments[t.comments.length-1].t.slice(0,48))}${t.comments[t.comments.length-1].t.length>48?'…':''}”</span>`:''}</div></div>${statusTag(t)}</div>`).join('')}
        ${missingNotes.map(s=>`<div class="item"><span class="sev" style="background:var(--warn)"></span>${av(s.pm)}<div class="main-t"><b>Class notes missing: ${esc(s.title)}</b><div class="meta"><span>${esc(UU(s.pm).name)}</span><span>Session on ${fmt(s.date)}</span></div></div><span class="tag t-warn">Missing update</span></div>`).join('')}
        <div class="item"><span class="sev" style="background:var(--warn)"></span><span class="av" style="background:var(--surface-2);color:var(--ink-2)">${pending11}</span><div class="main-t"><b>${pending11} learners have no 1:1 yet this quarter</b><div class="meta"><span>KPI 4 · due by 31 Dec</span></div></div><button class="btn sm" data-act="go" data-v="students">View</button></div>
      </div>
    </div>
    <div class="grid" style="align-content:start">
      <div class="card"><div class="card-h"><h2 class="h3">By person</h2><small>On-time rate</small></div>
        <div class="tbl-wrap"><table><tbody>
        ${people.map(p=>{const c=compliance(p);const col=c.pct>=90?'var(--good)':c.pct>=70?'var(--warn)':'var(--bad)';return `<tr><td>${who(p)}</td><td style="width:40%"><div class="bar"><i style="width:${c.pct}%;background:${col}"></i></div></td><td class="r num"><b>${c.pct}%</b></td><td class="r num" style="color:${c.od?'var(--bad)':'var(--ink-3)'}">${c.od} late</td></tr>`}).join('')}
        </tbody></table></div>
      </div>
      <div class="card"><div class="card-h"><h2 class="h3">Upcoming sessions</h2><button class="btn ghost sm" data-act="go" data-v="sessions">All</button></div><div class="list">${upcoming.map(sessItem).join('')}</div></div>
    </div>
  </div>
  <div class="card"><div class="card-h"><h2 class="h3">${k==='chair'?'Tasks I assigned':'Tasks assigned by me'}</h2><small>${mine.filter(t=>t.status!=='done').length} open</small></div>
    <div class="tbl-wrap"><table><thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Last update</th><th>Status</th></tr></thead><tbody>
    ${mine.length?mine.map(t=>`<tr class="click" data-act="open" data-id="${t.id}"><td><b style="font-weight:600">${esc(t.title)}</b><div class="mono" style="color:var(--ink-3)">${t.id}</div></td><td>${who(t.owner)}</td><td class="num">${fmt(t.due)}</td><td style="color:var(--ink-2);font-size:13px;max-width:260px">${t.comments.length?esc(t.comments[t.comments.length-1].t):'No comments yet'}</td><td>${statusTag(t)}</td></tr>`).join(''):`<tr><td colspan="5" class="empty">Nothing assigned yet</td></tr>`}
    </tbody></table></div>
  </div>
  ${teamKpiCard()}`;
}

function viewTasks(){
  let list = visibleTasks();
  if (isMgr() && S.taskScope==='assigned') list = list.filter(t=>t.by===S.user);
  if (isMgr() && S.taskScope==='mine') list = list.filter(t=>t.owner===S.user || t.by===S.user);
  const f = S.taskFilter;
  if (f==='open') list = list.filter(t=>t.status!=='done');
  if (f==='overdue') list = list.filter(isOverdue);
  if (f==='done') list = list.filter(t=>t.status==='done');
  if (S.q) list = list.filter(t=>(t.title+t.cat+UU(t.owner).name).toLowerCase().includes(S.q.toLowerCase()));
  list = list.slice().sort((a,b)=>a.due.localeCompare(b.due));
  const scope = isMgr()?`<div class="seg">${[['mine','Mine'],['assigned','Assigned by me'],['all','Everyone']].map(([k,l])=>`<button class="${S.taskScope===k?'on':''}" data-act="scope" data-v="${k}">${l}</button>`).join('')}</div>`:'';
  return `<div class="page-head"><div><h1>Tasks</h1><p>${isMgr()?'Every task in Reverentia, with its owner, deadline and latest update.':'Everything you own. Tick it off when it is done.'}</p></div><button class="btn primary" data-act="modal" data-m="task">${ic('plus')}New task</button></div>
  <div class="toolbar">${scope}<div class="seg">${[['open','Open'],['overdue','Overdue'],['done','Done'],['all','All']].map(([k,l])=>`<button class="${f===k?'on':''}" data-act="tfilter" data-v="${k}">${l}</button>`).join('')}</div></div>
  <div class="card">${isMgr()?`<div class="tbl-wrap"><table><thead><tr><th><span class="sr-only">Actions</span></th><th>Task</th><th>Owner</th><th>Frequency</th><th>Due</th><th>Status</th></tr></thead><tbody>${list.map(t=>`<tr class="click" data-act="open" data-id="${t.id}"><td style="width:40px"><button class="chk ${t.status==='done'?'on':''}" data-act="toggle" data-id="${t.id}" aria-label="Toggle done">${ic('tick')}</button></td><td><b style="font-weight:600">${esc(t.title)}</b><div class="meta" style="font-size:12px;color:var(--ink-3)"><span class="mono">${t.id}</span> · ${esc(t.cat)} · by ${esc(UU(t.by).name.split(' ')[0])}${taskKpi(t)?` · KPI ${taskKpi(t)}`:''}</div></td><td>${who(t.owner)}</td><td>${esc(t.freq)}</td><td class="num">${fmt(t.due)}</td><td>${statusTag(t)}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">No tasks match</td></tr>'}</tbody></table></div>`:`<div class="list">${list.map(t=>taskRow(t)).join('')||'<div class="empty">No tasks match</div>'}</div>`}</div>`;
}

function viewSessions(){
  let list = visibleSessions();
  const up = S.sessTab==='upcoming';
  list = list.filter(s=>up?dayDiff(s.date)>=0:dayDiff(s.date)<0).sort((a,b)=>up?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
  return `<div class="page-head"><div><h1>Sessions</h1><p>Schedule, faculty, readiness, class notes and payment status for every session.</p>${kpiFeeds([1,5,9])}</div><div class="toolbar">${markableCohorts().length?`<button class="btn" data-act="pastsess">${ic('upload')}Upload past sessions</button>`:''}<button class="btn primary" data-act="modal" data-m="sched">${ic('plus')}Schedule a class</button></div></div>
  <div class="toolbar"><div class="seg"><button class="${up?'on':''}" data-act="sesstab" data-v="upcoming">Upcoming</button><button class="${!up?'on':''}" data-act="sesstab" data-v="past">Past</button></div></div>
  <div class="card"><div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Session</th><th>Faculty</th><th>PM</th><th>${up?'Readiness':'Class notes'}</th><th>Payment</th><th>TDS</th></tr></thead><tbody>
  ${list.map(s=>{const r=s.check.filter(Boolean).length;return `<tr class="click" data-act="session" data-id="${s.id}"><td class="num" style="white-space:nowrap"><b>${fmt(s.date)}</b><div style="font-size:12px;color:var(--ink-3)">${s.time} · ${s.mode}</div></td><td><b style="font-weight:600">${esc(s.title)}</b><div style="font-size:12px;color:var(--ink-3)">${esc(s.prog)} · ${esc(s.cohort)}</div></td><td>${s.fac?esc(FACULTY[s.fac].name):'<span class="tag t-bad">Not assigned</span>'}</td><td>${who(s.pm)}</td><td>${up?`<span class="tag ${r===5?'t-good':r>=3?'t-warn':'t-bad'}">${r}/5 ready</span>`:(s.notes?'<span class="tag t-good">Added</span>':`<span class="tag t-bad">Missing</span>`)}</td><td>${payTag(s.pay.paid)}</td><td>${payTag(s.pay.tds)}</td></tr>`}).join('')||'<tr><td colspan="7" class="empty">No sessions</td></tr>'}
  </tbody></table></div></div>${!up?pastRecorded():''}`;
}
function pastRecorded(){
  const rows = visibleCohorts().flatMap(c=>c.sess.filter(x=>!SESSIONS.some(y=>y.cohort===c.code && y.date===x.date)).map(x=>({c, x, i:c.sess.indexOf(x)}))).sort((a,b)=>b.x.date.localeCompare(a.x.date));
  if (!rows.length) return '';
  return `<div class="card" style="margin-top:16px"><div class="card-h"><h2 class="h3">Earlier sessions recorded for attendance</h2><small>Uploaded or added while marking attendance</small></div><div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Session</th><th>Cohort</th><th class="r">Attendance marked</th></tr></thead><tbody>${rows.map(({c,x,i})=>{const marked=c.students.filter(s=>s.attRec[i]).length;return `<tr class="click" data-act="cohortatt" data-id="${esc(c.code)}"><td class="num"><b>${fmt(x.date)}</b> ${x.date.slice(0,4)}</td><td>${esc(x.title||'Session '+x.n)}</td><td>${esc(c.code)}</td><td class="r num">${marked?`${marked} of ${c.students.length}`:'<span class="tag t-warn">Not yet</span>'}</td></tr>`}).join('')}</tbody></table></div></div>`;
}
function payTag(v){ const m={Paid:'t-good',Deducted:'t-good',Received:'t-info',Pending:'t-warn','Not deducted':'t-warn','Not due':''}; return `<span class="tag ${m[v]||''}">${v}</span>`; }

// Student search: name, email, phone, company, student ID or cohort. Phone numbers match on digits alone, so +91 98100 00000 matches 9810000000.
const stuMatch = (s, q) => { const t = q.trim().toLowerCase(); if (!t) return true; const d = t.replace(/\D/g,'');
  return t.split(/\s+/).every(w => [s.name, s.email, s.company, s.id, s.cohort, s.phone].some(v => String(v||'').toLowerCase().includes(w))) || (d.length >= 4 && String(s.phone||'').replace(/\D/g,'').includes(d)); };
/* ---------------- search everything (top bar) ---------------- */
function viewSearch(){
  const q = (S.q||'').trim(), t = q.toLowerCase(), has = (...v) => t.split(/\s+/).every(w => v.some(x => String(x||'').toLowerCase().includes(w)));
  const myCohorts = isMgr() ? COHORTS : COHORTS.filter(c=>c.pm===S.user);
  const groups = [
    ['Students', myCohorts.flatMap(c=>c.students||[]).filter(s=>stuMatch(s,q)), s=>`<div class="item click" data-act="student" data-id="${esc(s.id)}"><div class="main-t"><b>${esc(s.name)}</b><div class="meta">${[s.cohort, s.email, s.phone, s.company].filter(Boolean).map(esc).join(' · ')}</div></div></div>`],
    ['Cohorts', myCohorts.filter(c=>has(c.code, c.prog, UU(c.pm).name, c.format)), c=>`<div class="item click" data-act="cohortgo" data-id="${esc(c.code)}"><div class="main-t"><b>${esc(c.code)}</b><div class="meta">${esc(c.prog)} · ${c.students.length} students · ${esc(UU(c.pm).name)}</div></div></div>`],
    ['Tasks', visibleTasks().filter(x=>has(x.title, x.cat, UU(x.owner).name, x.id)), x=>`<div class="item click" data-act="open" data-id="${esc(x.id)}"><div class="main-t"><b>${esc(x.title)}</b><div class="meta">${esc(UU(x.owner).name)} · due ${fmt(x.due)}${x.status==='done'?' · done':''}</div></div></div>`],
    ['Sessions', visibleSessions().filter(x=>has(x.title, x.cohort, x.prog, x.fac&&FACULTY[x.fac]?FACULTY[x.fac].name:'', x.venue)), x=>`<div class="item click" data-act="session" data-id="${esc(x.id)}"><div class="main-t"><b>${esc(x.title)}</b><div class="meta">${fmt(x.date)} ${x.date.slice(0,4)} · ${esc(x.cohort)}${x.fac&&FACULTY[x.fac]?' · '+esc(FACULTY[x.fac].name):''}</div></div></div>`],
    ['Faculty', activeFac().filter(([,f])=>has(f.name, f.desig, f.exp, f.email, f.phone, f.city)), ([id,f])=>`<div class="item click" data-act="fac" data-id="${esc(id)}"><div class="main-t"><b>${esc(f.name)}</b><div class="meta">${[f.desig||f.exp, f.email].filter(Boolean).map(esc).join(' · ')}</div></div></div>`],
    ['Invoices', visibleInvoices().filter(v=>has(v.no, invParty(v), v.cohort)), v=>`<div class="item click" data-act="inv" data-id="${esc(v.id)}"><div class="main-t"><b>${esc(v.no)}</b><div class="meta">${esc(invParty(v))}${v.cohort?' · '+esc(v.cohort):''}</div></div></div>`],
  ];
  const total = groups.reduce((a,[,l])=>a+l.length,0);
  return `<div class="page-head"><div><h1>Search</h1><p id="q-count" aria-live="polite">${total?`${total} result${total===1?'':'s'} for “${esc(q)}”`:`Nothing found for “${esc(q)}”`}</p></div><button class="btn" data-act="qclear">Clear search</button></div>
  ${total?groups.filter(([,l])=>l.length).map(([h,l,row])=>`<div class="card" style="margin-bottom:16px"><div class="card-h"><h2 class="h3">${h}</h2><small>${l.length}${l.length>12?', showing 12':''}</small></div><div class="list">${l.slice(0,12).map(row).join('')}</div></div>`).join(''):`<div class="card"><div class="empty">Try a name, email, phone number, company, cohort, task or invoice number.</div></div>`}`;
}
function viewStudents(){
  const all = visibleStudents().slice().sort((a,b)=>(a.last||'').localeCompare(b.last||''));
  const done = all.filter(s=>s.last).length;
  // searching also covers cohorts that have not started yet
  const pool = S.sq ? (isMgr() ? COHORTS : COHORTS.filter(c=>c.pm===S.user)).flatMap(c=>c.students||[]) : all;
  const list = pool.filter(s=>stuMatch(s, S.sq||''));
  return `<div class="page-head"><div><h1>Students</h1><p>A one-to-one with every learner each month, as Rajiv's email asks. KPI 4 scores the quarter's coverage. Learners not yet met in October are listed first.</p>${kpiFeeds([4,12])}</div><div class="toolbar">${markableCohorts().length?`<button class="btn" data-act="stuadd" data-id="">${ic('plus')}Add students</button>`:''}<button class="btn primary" data-act="modal" data-m="oneone">${ic('chat')}Log a 1:1</button></div></div>
  <div class="grid g3">
    <div class="card stat"><span class="lbl">October 1:1s done</span><span class="val num">${done} / ${all.length}</span><div class="bar"><i style="width:${all.length?Math.round(done/all.length*100):0}%"></i></div></div>
    <div class="card stat alert"><span class="lbl">Still to meet</span><span class="val num">${all.length-done}</span><span class="sub">Due by 31 Oct</span></div>
    <div class="card stat"><span class="lbl">Below 70% attendance</span><span class="val num">${all.filter(s=>s.att!=null&&s.att<70).length}</span><span class="sub">Flagged as at risk</span></div>
  </div>
  <div class="toolbar"><label class="search stu-search">${ic('search')}<span class="sr-only">Search students</span><input id="stu-q" type="search" placeholder="Search students by name, email, phone or company" value="${esc(S.sq||'')}" aria-describedby="stu-count" autocomplete="off"></label>${S.sq?`<button class="btn sm" data-act="stuqclear">Clear</button>`:''}<span id="stu-count" class="demo-note" aria-live="polite">${S.sq?`${list.length} match${list.length===1?'':'es'}`:`${all.length} student${all.length===1?'':'s'}`}</span></div>
  <div class="card"><div class="tbl-wrap"><table><thead><tr><th>Student</th><th>Cohort</th>${isMgr()?'<th>PM</th>':''}<th class="c">Aug</th><th class="c">Sep</th><th class="c">Oct</th><th>Attendance</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>
  ${list.length?'':`<tr><td colspan="${isMgr()?8:7}" class="empty">${S.sq?`No student matches “${esc(S.sq)}”. Search looks at name, email, phone, company, student ID and cohort.`:'No students yet. Add them from a cohort, or with Add students above.'}</td></tr>`}
  ${list.map(s=>`<tr class="click" data-act="student" data-id="${esc(s.id)}"><td><b style="font-weight:600">${esc(s.name)}</b>${[s.email,s.phone,s.company].filter(Boolean).length?`<div style="font-size:12px;color:var(--ink-3)">${[s.email,s.phone,s.company].filter(Boolean).map(esc).join(' · ')}</div>`:''}</td><td>${esc(s.cohort)}</td>${isMgr()?`<td>${who(s.pm)}</td>`:''}${['2026-08','2026-09'].map(m=>{const o=s.ones.find(x=>x[0].startsWith(m));return `<td class="c num">${o?`<span class="tag t-good" title="${esc(o[1])}">${fmt(o[0])}</span>`:'<span class="tag t-bad">Missed</span>'}</td>`}).join('')}<td class="c num">${s.last?`<span class="tag t-good">${fmt(s.last)}</span>`:'<span class="tag t-warn">Pending</span>'}</td><td><div style="display:flex;align-items:center;gap:8px"><div class="bar" style="width:80px"><i style="width:${s.att||0}%;background:${pctCol(s.att)}"></i></div><span class="num">${pctTxt(s.att)}</span>${s.att!=null&&s.att<70?'<span class="tag t-bad">At risk</span>':''}</div></td><td class="r">${s.last?'':`<button class="btn sm" data-act="modal" data-m="oneone" data-id="${s.id}">Log 1:1</button>`}</td></tr>`).join('')}
  </tbody></table></div></div>`;
}

function viewKpis(){
  const q = S.kpiQ, mgr = isMgr();
  const who2 = mgr ? S.kpiPm : S.user;
  const qSeg = `<div class="seg"><button class="${q==='Q3'?'on':''}" data-act="kq" data-v="Q3">Q3 · Jul–Sep (final)</button><button class="${q==='Q4'?'on':''}" data-act="kq" data-v="Q4">Q4 · Oct–Dec (to date)</button></div>`;
  const pmSeg = mgr ? `<div class="seg"><button class="${who2==='team'?'on':''}" data-act="kpm" data-v="team">Team</button>${teamPms().map(p=>`<button class="${who2===p?'on':''}" data-act="kpm" data-v="${p}">${esc(UU(p).name.split(' ')[0])}</button>`).join('')}</div>` : '';
  const head = `<div class="page-head"><div><div class="eyebrow">Rev 6 framework · REV-PM-JD-COC-KPI-2025</div><h1>${mgr?'KPI scorecards':'My KPI scorecard'}</h1><p>18 KPIs in 3 pillars. Each KPI score is its compliance % (0 to 100). Weighted score = Σ (KPI score ÷ 100 × weight).</p></div>${qSeg}</div>${pmSeg?`<div class="toolbar">${pmSeg}</div>`:''}`;
  if (who2==='team') return head + teamKpis(q);
  return head + pmScorecard(who2, q);
}
function teamKpis(q){
  if (!teamPms().length) return noTeamNote();
  const cards = teamPms().map(p=>{ const sc=scorecard(p,q), prev=q==='Q4'?scorecard(p,'Q3').total:null; return `<button class="card kpi-pm" data-act="kpm" data-v="${p}">
    <div style="display:flex;gap:14px;align-items:center">${scoreRing(sc.total,84)}<div style="min-width:0"><div class="who">${av(p)}<b>${esc(UU(p).name)}</b></div><div style="margin-top:6px"><span class="tag ${sc.band.cls}">${sc.band.name}</span></div><div class="demo-note" style="margin-top:4px">${q==='Q4'?'Projected payout':'Payout'} ${sc.band.pay}% of variable pay${prev!=null?` · Q3 ${prev.toFixed(1)}`:''}</div></div></div>
    <div class="pill-bars">${[1,2,3].map(i=>{const pp=sc['p'+i];return `<div><span>Pillar ${i}</span><div class="bar"><i style="width:${pp.pts/pp.max*100}%;background:${scoreCol(pp.pts/pp.max*100)}"></i></div><b class="num">${pp.pts.toFixed(1)} / ${pp.max}</b></div>`}).join('')}</div>
    <div class="demo-note">Status: <b style="color:var(--ink)">${kstate(q,p)}</b></div></button>`; }).join('');
  const matrix = `<div class="card"><div class="card-h"><h2 class="h3">KPI matrix</h2><small>KPI score per PM · click a cell for the formula and evidence</small></div><div class="tbl-wrap"><table class="kmatrix"><thead><tr><th>KPI</th><th class="r">Weight</th>${teamPms().map(p=>`<th class="c">${esc(UU(p).name.split(' ')[0])}</th>`).join('')}</tr></thead><tbody>
    ${[1,2,3].map(pi=>`<tr class="pill-row"><td colspan="${2+teamPms().length}">${PILLARS[pi]}</td></tr>`+KPI_DEF.filter(d=>d.p===pi).map(d=>`<tr><td><span class="kn">${d.n}</span>${esc(d.area)}</td><td class="r num">${d.w}%</td>${teamPms().map(p=>{const s=kpiScore(d.n,kqv(q,p,d.n-1));return `<td class="c"><button class="kcell" data-act="kpi" data-n="${d.n}" data-p="${p}" style="background:color-mix(in srgb, ${scoreCol(s)} ${s<60?28:18}%, transparent);color:${scoreCol(s)}">${Math.round(s)}</button></td>`}).join('')}</tr>`).join('')).join('')}
    <tr class="tot"><td>Weighted score</td><td class="r num">100%</td>${teamPms().map(p=>{const sc=scorecard(p,q);return `<td class="c num"><b style="color:${scoreCol(sc.total)}">${sc.total.toFixed(1)}</b></td>`}).join('')}</tr>
  </tbody></table></div></div>`;
  return `<div class="grid g3">${cards}</div>${monthlyCard(null)}${matrix}${payMatrix(null)}`;
}
function pmScorecard(p,q){
  const sc = scorecard(p,q), gaps = sc.rows.slice().sort((a,b)=>(b.w-b.pts)-(a.w-a.pts)).slice(0,3);
  const st = kstate(q,p), k = UU(S.user).kind;
  let action = '';
  if (q==='Q3' && st==='Ready for review' && k==='pm' && p===S.user) action = `<button class="btn primary" data-act="ksign" data-p="${p}">Sign scorecard</button><button class="btn" data-act="toast" data-t="Data query raised. It is resolved by tracker records only.">Raise data query</button>`;
  if (q==='Q3' && st==='Ready for review' && k!=='pm') action = `<span class="demo-note">Waiting for ${esc(UU(p).name.split(' ')[0])} to sign</span>`;
  if (q==='Q3' && st==='Signed by PM' && (k==='chair'||k==='owner')) action = `<button class="btn primary" data-act="klock" data-p="${p}">Approve and lock</button>`;
  if (q==='Q3' && st==='Signed by PM' && k==='pm') action = `<span class="demo-note">Waiting for Rajiv to approve and lock</span>`;
  return `<div class="grid g21">
    <div class="card"><div class="card-b" style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
      ${scoreRing(sc.total,120)}
      <div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:8px">
        <div class="who">${av(p,true)}<div><b style="font-size:16px">${esc(UU(p).name)}</b><div class="demo-note">${q==='Q3'?'Q3 2026 · Jul to Sep · scores lock by 30 Oct':'Q4 2026 · Oct to Dec · to date, will change'}</div></div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="tag ${sc.band.cls}">${sc.band.name}</span><span class="demo-note">${q==='Q4'?'Projected payout':'Payout'}: <b style="color:var(--ink)">${sc.band.pay}% of variable pay</b></span><span class="tag plain">${st}</span></div>
        <div class="pill-bars">${[1,2,3].map(i=>{const pp=sc['p'+i];return `<div><span>Pillar ${i}</span><div class="bar"><i style="width:${pp.pts/pp.max*100}%;background:${scoreCol(pp.pts/pp.max*100)}"></i></div><b class="num">${pp.pts.toFixed(1)} / ${pp.max}</b></div>`}).join('')}</div>
        ${action?`<div class="toolbar">${action}</div>`:''}
      </div></div></div>
    <div class="card"><div class="card-h"><h2 class="h3">Biggest gaps</h2><small>Points lost</small></div><div class="list">${gaps.map(g=>`<div class="item click" data-act="kpi" data-n="${g.n}" data-p="${p}" style="cursor:pointer"><span class="kn">${g.n}</span><div class="main-t"><b>${esc(g.area)}</b><div class="meta"><span>${esc(g.ev)}</span><span>Score ${Math.round(g.s)}</span></div></div><b class="num" style="color:var(--bad)">−${(g.w-g.pts).toFixed(1)}</b></div>`).join('')}</div></div>
  </div>
  ${monthlyCard(p)}
  <div class="card"><div class="tbl-wrap"><table><thead><tr><th>KPI area</th><th>Evidence this quarter</th><th>KPI score</th><th class="r">Weight</th><th class="r">Points</th></tr></thead><tbody>
  ${[1,2,3].map(pi=>`<tr class="pill-row"><td colspan="5">${PILLARS[pi]} <span style="float:right" class="num">${sc['p'+pi].pts.toFixed(1)} / ${sc['p'+pi].max}</span></td></tr>`+sc.rows.filter(r=>r.p===pi).map(r=>`<tr class="click" data-act="kpi" data-n="${r.n}" data-p="${p}"><td><span class="kn">${r.n}</span><b style="font-weight:600">${esc(r.area)}</b><div class="demo-note" style="margin-left:30px">${esc(r.src)}</div></td><td style="font-size:13px">${r.p===3&&UU(S.user).kind==='pm'?'Annual 360° round, held by RG':esc(r.ev)}</td><td><div style="display:flex;align-items:center;gap:8px;min-width:150px"><div class="bar" style="flex:1"><i style="width:${r.s}%;background:${scoreCol(r.s)}"></i></div><b class="num" style="width:28px;text-align:right">${Math.round(r.s)}</b></div></td><td class="r num">${r.w}%</td><td class="r num"><b>${r.pts.toFixed(2)}</b></td></tr>`).join('')).join('')}
  <tr class="tot"><td colspan="3">Final weighted score</td><td class="r num">100%</td><td class="r num"><b style="color:${scoreCol(sc.total)}">${sc.total.toFixed(2)}</b></td></tr>
  </tbody></table></div></div>
  ${payMatrix(sc.total)}`;
}
// Monthly progress: the email asks for monthly target vs actual; Rev 6 pays on the quarter. Jul to Sep average back to the Q3 score; Oct is Q4 to date.
const MONTHS = ['Jul','Aug','Sep','Oct'], KTARGET = 90, KWARN = 80;
// Month-by-month KPI view. The preview invents monthly variation; the live app shows the quarter values only.
const MONTHLY = new Proxy({}, {get(cache, pm){ if (typeof pm!=='string') return undefined; if (!cache[pm]) cache[pm] = monthlyFor(pm); return cache[pm]; }});
let _ms=11; const _mr=()=> (_ms=(_ms*16807)%2147483647)/2147483647;
function monthlyFor(pm){
  return KPI_DEF.map((d,i)=>{
    const q3=kpiScore(d.n,kqv('Q3',pm,i)), q4=kpiScore(d.n,kqv('Q4',pm,i));
    if (!db.demo || d.p===3 || d.n===11 || d.n===12) return [q3,q3,q3,q4].map(x=>Math.round(x)); // banded or annual KPIs do not vary month to month
    const a=clamp(q3+(_mr()-0.45)*14), b=clamp(q3+(_mr()-0.5)*12), c=clamp(3*q3-a-b);
    return [a,b,c,q4].map(x=>Math.round(x));
  });
}
const monthTotal = (pm,m) => KPI_DEF.reduce((a,d,i)=>a+MONTHLY[pm][i][m]*d.w/100,0);
function monthChart(pms){
  const W=1000,H=250,l=40,rt=130,t=18,b=30, x=i=>l+i*(W-l-rt)/3, y=v=>t+(100-v)/50*(H-t-b);
  const yv = v=>Math.max(50,v);
  const grid=[50,60,70,80,90,100].map(v=>`<line x1="${l}" x2="${W-rt}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v===KTARGET?'stroke-dasharray="5 4" stroke="var(--good)"':v===KWARN?'stroke-dasharray="2 4" stroke="var(--warn)"':''}/><text x="${l-8}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${v}</text>`).join('');
  const lab=`<text x="${W-rt+14}" y="${y(KTARGET)+4}" font-size="12" fill="var(--good)">Target ${KTARGET}</text><text x="${W-rt+14}" y="${y(KWARN)+4}" font-size="12" fill="var(--warn)">Early warning ${KWARN}</text>`;
  const xs=MONTHS.map((m,i)=>`<text x="${x(i)}" y="${H-8}" text-anchor="middle" font-size="12" fill="var(--ink-2)">${m}${i===3?' (to date)':''}</text>`).join('');
  const lines=pms.map(p=>{const v=MONTHS.map((m,i)=>monthTotal(p,i));const c=UU(p).color;return `<polyline fill="none" stroke="${c}" stroke-width="2.5" points="${v.map((s,i)=>`${x(i)},${y(yv(s))}`).join(' ')}"/>${v.map((s,i)=>`<circle cx="${x(i)}" cy="${y(yv(s))}" r="4" fill="${c}"><title>${esc(UU(p).name)} · ${MONTHS[i]} · ${s.toFixed(1)}</title></circle>`).join('')}${pms.length===1?v.map((s,i)=>`<text x="${x(i)}" y="${y(yv(s))-10}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)">${s.toFixed(1)}</text>`).join(''):''}`}).join('');
  const key = pms.length>1?`<div class="mkey">${pms.map(p=>`<span><i style="background:${UU(p).color}"></i>${esc(UU(p).name.split(' ')[0])}</span>`).join('')}</div>`:'';
  return `<svg viewBox="0 0 ${W} ${H}" class="mchart" role="img" aria-label="Weighted KPI score by month against the target">${grid}${lab}${lines}${xs}</svg>${key}`;
}
function monthlyCard(p){
  const pms = p ? [p] : teamPms();
  const head = `<div class="card-h"><h2 class="h3">Monthly progress, target vs actual</h2><small>Reviewed every month · paid on the quarterly score</small></div>`;
  let table='';
  if (p){
    const hide = UU(S.user).kind==='pm';
    const rows = KPI_DEF.filter(d=>d.p<3).map(d=>{const v=MONTHLY[p][d.n-1];return `<tr class="click" data-act="kpi" data-n="${d.n}" data-p="${p}"><td><span class="kn">${d.n}</span>${esc(d.area)}</td>${v.map((s,i)=>`<td class="c"><span class="mcell" style="color:${scoreCol(s)};background:color-mix(in srgb, ${scoreCol(s)} 14%, transparent)">${s}</span></td>`).join('')}<td class="c">${v[3]<KWARN?'<span class="tag t-bad">Early warning</span>':v[3]<KTARGET?'<span class="tag t-warn">Below target</span>':'<span class="tag t-good">On target</span>'}</td></tr>`}).join('');
    table = `<div class="tbl-wrap"><table class="kmatrix"><thead><tr><th>KPI (target ${KTARGET} each)</th>${MONTHS.map((m,i)=>`<th class="c">${m}${i===3?'*':''}</th>`).join('')}<th class="c">October status</th></tr></thead><tbody>${rows}<tr class="pill-row"><td colspan="6">Pillar 3 · 360° is rated once a year by RG${hide?' and is not shown monthly':''}</td></tr><tr class="tot"><td>Weighted score</td>${MONTHS.map((m,i)=>{const s=monthTotal(p,i);return `<td class="c num"><b style="color:${scoreCol(s)}">${s.toFixed(1)}</b></td>`}).join('')}<td class="c num">${monthTotal(p,3)>=KTARGET?'On target':`${(KTARGET-monthTotal(p,3)).toFixed(1)} short`}</td></tr></tbody></table></div><div class="demo-note" style="padding:10px 16px">* October is month to date. Monthly scores use the same Rev 6 formulas on that month's records; the quarter's score, not the monthly one, drives variable pay.</div>`;
  } else {
    const warn = teamPms().flatMap(pm=>KPI_DEF.filter(d=>d.p<3&&MONTHLY[pm][d.n-1][3]<KWARN).map(d=>({pm,d,s:MONTHLY[pm][d.n-1][3]})));
    table = `<div class="card-b" style="padding-top:0"><div class="eyebrow" style="margin:6px 0 8px">October early warnings (${warn.length})</div><div class="list">${warn.slice(0,6).map(w=>`<div class="item click" data-act="kpi" data-n="${w.d.n}" data-p="${w.pm}" style="cursor:pointer">${av(w.pm)}<div class="main-t"><b style="font-weight:500">KPI ${w.d.n} · ${esc(w.d.area)}</b><div class="meta"><span>${esc(UU(w.pm).name)}</span><span>Score ${w.s} vs target ${KTARGET}</span></div></div><span class="tag t-bad">Below ${KWARN}</span></div>`).join('')||'<div class="demo-note">None this month.</div>'}</div></div>`;
  }
  return `<div class="card">${head}<div class="card-b"><div class="mchart-wrap">${monthChart(pms)}</div></div>${table}</div>`;
}
function payMatrix(score){
  const b = score==null?null:bandOf(score);
  return `<div class="grid g2"><div class="card"><div class="card-h"><h2 class="h3">Variable pay matrix</h2><small>Quarterly</small></div><div class="tbl-wrap"><table><thead><tr><th>Band</th><th>Weighted score</th><th class="r">Payout</th></tr></thead><tbody>${BANDS.map((x,i)=>`<tr ${b&&b.name===x[1]?'style="background:var(--accent-soft)"':''}><td><span class="tag ${x[3]}">${x[1]}</span></td><td class="num">${i===0?'90 and above':i===4?'Below 60':`${x[0]} to ${BANDS[i-1][0]-1}`}</td><td class="r num"><b>${x[2]}%</b>${i===4?' · PIP':''}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="card"><div class="card-h"><h2 class="h3">Governance</h2><small>Section 7</small></div><div class="list">
    ${[['Quarter closes','30 Sep'],['10% spot-check of tracker entries','Monthly, by RG or Ops Lead'],['Scores calculated and shared with each PM','Within 30 days'],['Quarterly review with Managing Partner','Formula-only for Pillars 1 and 2'],['Scores locked and signed by both parties','By 30 Oct']].map(([a,b2],i)=>`<div class="item"><span class="kn">${i+1}</span><div class="main-t"><b style="font-weight:500">${a}</b><div class="meta">${b2}</div></div></div>`).join('')}
    <div class="item"><div class="main-t"><div class="meta">A confirmed false entry zeroes that KPI for the quarter. Data queries are settled only by tracker records.</div></div></div>
  </div></div></div>`;
}
function drawerKpi(n, p){
  const d = KPI_DEF[n-1], q = S.kpiQ, pm = p || (isMgr()? null : S.user);
  const v = pm ? kqv(q,pm,n-1) : null, s = pm ? kpiScore(n,v) : null;
  const hide360 = d.p===3 && UU(S.user).kind==='pm';
  return `<div class="scrim" data-act="close"><div class="drawer" role="dialog" aria-label="KPI detail" data-stop>
    <div class="drawer-h"><div style="flex:1"><div class="eyebrow">${PILLARS[d.p]}</div><h2>KPI ${n}. ${esc(d.area)}</h2><div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><span class="tag t-accent plain">Weight ${d.w}%</span><span class="tag plain">${esc(d.src)}</span></div></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div>
    <div class="drawer-b">
      ${pm?`<div class="card card-b" style="display:flex;gap:16px;align-items:center;box-shadow:none">${scoreRing(s,84)}<div><div class="who">${av(pm)}<b>${esc(UU(pm).name)}</b></div><div class="demo-note" style="margin-top:4px">${q==='Q3'?'Q3 final':'Q4 to date'} · ${hide360?'Individual ratings are held by RG and not visible to you':esc(kpiEvidence(n,v))}</div><div style="margin-top:4px;font-size:13px">Contributes <b class="num">${(s*d.w/100).toFixed(2)}</b> of ${d.w} points</div></div></div>`:''}
      <div><div class="eyebrow" style="margin-bottom:8px">How it is measured</div><ul class="bul">${d.how.map(h=>`<li>${esc(h)}</li>`).join('')}</ul></div>
      <div><div class="eyebrow" style="margin-bottom:8px">Formula</div><div class="formula">${esc(d.formula)}</div></div>
      <dl class="kv"><dt>Data source</dt><dd>${esc(d.src)}</dd><dt>Recorded in Optimus</dt><dd>${esc(d.rec)}</dd><dt>Scoring</dt><dd>${n===11?'Banded (exception in Section 2)':n===14?'NPS × 2, capped 0 to 100 (exception)':'Linear: KPI score = compliance %, capped 0 to 100'}</dd>${d.p===1?'<dt>Audit</dt><dd>10% of entries spot-checked monthly against evidence</dd>':''}</dl>
      ${pm&&isMgr()?`<div><div class="eyebrow" style="margin-bottom:8px">All PMs, ${q==='Q3'?'Q3':'Q4 to date'}</div><div class="grid" style="gap:8px">${teamPms().map(x=>{const sx=kpiScore(n,kqv(q,x,n-1));return `<div style="display:flex;align-items:center;gap:10px">${av(x)}<span style="width:110px">${esc(UU(x).name.split(' ')[0])}</span><div class="bar" style="flex:1"><i style="width:${sx}%;background:${scoreCol(sx)}"></i></div><b class="num" style="width:28px;text-align:right">${Math.round(sx)}</b></div>`}).join('')}</div></div>`:''}
    </div></div></div>`;
}
function myKpiCard(){
  const sc = scorecard(S.user,'Q4'), gaps = sc.rows.slice().sort((a,b)=>(b.w-b.pts)-(a.w-a.pts)).slice(0,3);
  return `<div class="card"><div class="card-h"><h2 class="h3">My KPI score, Q4 to date</h2><button class="btn ghost sm" data-act="go" data-v="kpis">Scorecard</button></div>
    <div class="card-b grid" style="gap:14px"><div class="ring-row">${scoreRing(sc.total,84)}<div><span class="tag ${sc.band.cls}">${sc.band.name}</span><div class="demo-note" style="margin-top:6px">Projected payout ${sc.band.pay}% of variable pay. ${sc.band.min<90?`${(BANDS[BANDS.findIndex(b=>b[1]===sc.band.name)-1][0]-sc.total).toFixed(1)} points to the next band.`:''}</div></div></div>
    <div class="grid" style="gap:8px"><div class="eyebrow">Where you are losing points</div>${gaps.map(g=>`<button class="gap-row" data-act="kpi" data-n="${g.n}" data-p="${S.user}"><span class="kn">${g.n}</span><span style="flex:1;text-align:left">${esc(g.area)}</span><b class="num" style="color:var(--bad)">−${(g.w-g.pts).toFixed(1)}</b></button>`).join('')}</div></div></div>`;
}
function teamKpiCard(){
  if (!teamPms().length) return "";
  return `<div class="card"><div class="card-h"><h2 class="h3">PM KPI scorecards</h2><button class="btn ghost sm" data-act="go" data-v="kpis">Open KPIs</button></div><div class="tbl-wrap"><table><thead><tr><th>Programme Manager</th><th>Q4 to date</th><th>Band</th><th class="r">Projected payout</th><th class="r">Q3 final</th><th>Biggest gap</th><th>Q3 status</th></tr></thead><tbody>
  ${teamPms().map(p=>{const sc=scorecard(p,'Q4'),q3=scorecard(p,'Q3'),g=sc.rows.slice().sort((a,b)=>(b.w-b.pts)-(a.w-a.pts))[0];return `<tr class="click" data-act="kpm" data-v="${p}" data-go="1"><td>${who(p)}</td><td><div style="display:flex;align-items:center;gap:8px;min-width:140px"><div class="bar" style="flex:1"><i style="width:${sc.total}%;background:${scoreCol(sc.total)}"></i></div><b class="num">${sc.total.toFixed(1)}</b></div></td><td><span class="tag ${sc.band.cls}">${sc.band.name}</span></td><td class="r num">${sc.band.pay}%</td><td class="r num">${q3.total.toFixed(1)}</td><td style="font-size:13px"><span class="kn">${g.n}</span>${esc(g.area)} <span style="color:var(--bad)" class="num">−${(g.w-g.pts).toFixed(1)}</span></td><td><span class="tag plain">${KSTATE.Q3[p]}</span></td></tr>`}).join('')}
  </tbody></table></div></div>`;
}

function viewPayments(){
  const tab = S.payTab;
  const tabs = `<div class="seg"><button class="${tab==='status'?'on':''}" data-act="paytab" data-v="status">Payment and TDS status</button><button class="${tab==='conf'?'on':''}" data-act="paytab" data-v="conf">${ic('lock')} Honorariums</button></div>`;
  let body;
  if (tab==='status'){
    const list = SESSIONS.filter(s=>dayDiff(s.date)<0).sort((a,b)=>b.date.localeCompare(a.date));
    body = `<div class="card"><div class="tbl-wrap"><table><thead><tr><th>Session</th><th>Faculty</th><th>Invoice</th><th>Payment</th><th>TDS</th><th>PM</th></tr></thead><tbody>${list.map(s=>`<tr><td><b style="font-weight:600">${esc(s.title)}</b><div style="font-size:12px;color:var(--ink-3)">${fmt(s.date)}</div></td><td>${facName(s.fac)}</td><td>${payTag(s.pay.inv)}</td><td>${payTag(s.pay.paid)}</td><td>${payTag(s.pay.tds)}</td><td>${who(s.pm)}</td></tr>`).join('')}</tbody></table></div></div>`;
  } else if (!canConf()){
    body = `<div class="card"><div class="lock">${ic('lock')}<h2 class="h3">You don't have honorarium access</h2><p style="max-width:44ch;margin:0">Senior faculty honorariums are confidential. The database only sends them to people who have been given honorarium access.</p></div></div>`;
  } else {
    body = `<div class="card"><div class="card-h"><h2 class="h3">Senior faculty honorariums</h2><span class="tag t-warn">${ic('lock')} Honorarium access only</span></div><div class="tbl-wrap"><table><thead><tr><th>Faculty</th><th>Session</th><th class="r">Amount</th><th>Status</th><th>Note</th></tr></thead><tbody>${HONORARIA.map(h=>`<tr><td><b style="font-weight:600">${facName(h.fac)}</b></td><td>${esc(SESSIONS.find(s=>s.id===h.session).title)}</td><td class="r num"><b>${inr(h.amt)}</b></td><td><span class="tag ${h.status==='Paid'?'t-good':h.status==='Approved'?'t-info':''}">${h.status}</span></td><td style="color:var(--ink-2)">${esc(h.note)}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  return `<div class="page-head"><div><h1>Payments</h1><p>Faculty payment and TDS status by session.</p>${kpiFeeds([2])}</div>${tabs}</div>${body}`;
}

function viewReports(){
  const people = trackedPeople();
  return `<div class="page-head"><div><div class="eyebrow">${db.demo?'Auto-generated · Monday 12 Oct 2026, 08:00':'Live · '+fmtLong(TODAY_ISO)+' · Week '+isoWeek(TODAY)}</div><h1>Weekly compliance report</h1><p>Sent to Rajiv and Neha every Monday. Nobody has to compile it.</p></div><button class="btn" data-act="toast" data-t="Report exported (preview)">Export</button></div>
  <div class="grid g4">
    ${db.demo?`<div class="card stat"><span class="lbl">Tasks completed last week</span><span class="val num">23</span><span class="sub">Up from 17</span></div>
    <div class="card stat alert"><span class="lbl">Overdue at week end</span><span class="val num">${TASKS.filter(isOverdue).length}</span><span class="sub">3 are high priority</span></div>
    <div class="card stat"><span class="lbl">Missing updates</span><span class="val num">2</span><span class="sub">Class notes</span></div>
    <div class="card stat"><span class="lbl">Escalated to Rajiv</span><span class="val num">1</span><span class="sub">Open more than 7 working days</span></div>`:`<div class="card stat"><span class="lbl">Open tasks</span><span class="val num">${TASKS.filter(t=>t.status!=='done').length}</span><span class="sub">Across the team</span></div>
    <div class="card stat alert"><span class="lbl">Overdue</span><span class="val num">${TASKS.filter(isOverdue).length}</span><span class="sub">${TASKS.filter(t=>isOverdue(t)&&t.pri==='High').length} high priority</span></div>
    <div class="card stat"><span class="lbl">Missing class notes</span><span class="val num">${SESSIONS.filter(s=>dayDiff(s.date)<-2 && !s.notes).length}</span><span class="sub">Sessions over 2 days old</span></div>
    <div class="card stat"><span class="lbl">Open 7+ days overdue</span><span class="val num">${TASKS.filter(t=>t.status!=='done' && dayDiff(t.due)<-7).length}</span><span class="sub">Shown to Rajiv by name</span></div>`}
  </div>
  <div class="card"><div class="card-h"><h2 class="h3">By person</h2></div><div class="tbl-wrap"><table><thead><tr><th>Person</th><th class="r">Open</th><th class="r">Overdue</th><th class="r">On-time rate</th><th>Exceptions raised</th></tr></thead><tbody>
  ${people.map(p=>{const c=compliance(p);return `<tr><td>${who(p)}</td><td class="r num">${c.open}</td><td class="r num" style="color:${c.od?'var(--bad)':'inherit'}">${c.od}</td><td class="r num"><b>${c.pct}%</b></td><td style="color:var(--ink-2);font-size:13px">${c.od?(db.demo?`Raised with ${esc(UU(p).name.split(' ')[0])} on 13 Oct`:`${c.od} overdue`):'None'}</td></tr>`}).join('')}
  </tbody></table></div></div>
  ${db.demo?`  <div class="card"><div class="card-h"><h2 class="h3">Monthly spot-check, October</h2><small>10% random sample of tracker entries · Section 7</small></div><div class="tbl-wrap"><table><thead><tr><th>Programme Manager</th><th class="r">Entries sampled</th><th class="r">Confirmed</th><th class="r">Open queries</th><th class="r">False entries</th></tr></thead><tbody>
    ${[['ananya',18,17,1,0],['karan',15,15,0,0],['ishita',14,12,2,0]].map(r=>`<tr><td>${who(r[0])}</td><td class="r num">${r[1]}</td><td class="r num">${r[2]}</td><td class="r num">${r[3]?`<span class="tag t-warn">${r[3]}</span>`:'0'}</td><td class="r num">${r[4]}</td></tr>`).join('')}
  </tbody></table></div></div>`:''}
  <div class="card card-b" style="font-size:13px;color:var(--ink-2)"><b style="color:var(--ink)">Escalation rule:</b> overdue more than 3 working days, Madhav raises it with the owner. Still open after 7 working days, it appears here by name for Rajiv.</div>`;
}

function viewAdmin(){
  const t = S.adminTab;
  const tabs = `<div class="seg">${[['templates','Recurring templates'],['kpis','KPI framework'],['users','People and access'],['audit','Audit log']].map(([k,l])=>`<button class="${t===k?'on':''}" data-act="admintab" data-v="${k}">${l}</button>`).join('')}</div>`;
  let body='';
  if (t==='templates') body = `<div class="card"><div class="card-h"><h2 class="h3">Recurring templates</h2><button class="btn sm primary" data-act="toast" data-t="Template editor opens here">${ic('plus')}New template</button></div><div class="tbl-wrap"><table><thead><tr><th>Template</th><th>Assigned to</th><th>Frequency</th><th>Due</th><th>Record required</th><th>Next run</th></tr></thead><tbody>${TEMPLATES.map(x=>`<tr><td><b style="font-weight:600">${esc(x.name)}</b></td><td>${esc(x.who)}</td><td><span class="tag plain t-accent">${x.freq}</span></td><td>${esc(x.when)}</td><td>${esc(x.rec)}</td><td class="num">${x.next==='Auto'?'Per session':fmt(x.next)}</td></tr>`).join('')}</tbody></table></div></div>`;
  if (t==='users') body = usersTab();
  if (t==='kpis') body = `<div class="card"><div class="card-h"><h2 class="h3">KPI framework · Rev 6</h2><span class="tag t-good plain">Weights total ${KPI_DEF.reduce((a,d)=>a+d.w,0)}%</span></div><div class="tbl-wrap"><table><thead><tr><th>KPI</th><th>Pillar</th><th>Data source</th><th>Recorded in Optimus</th><th class="r">Weight</th></tr></thead><tbody>${KPI_DEF.map(d=>`<tr class="click" data-act="kpi" data-n="${d.n}"><td><span class="kn">${d.n}</span>${esc(d.area)}</td><td>${d.p}</td><td style="font-size:13px">${esc(d.src)}</td><td style="font-size:13px">${esc(d.rec)}</td><td class="r num"><b>${d.w}%</b></td></tr>`).join('')}</tbody></table></div></div><p class="demo-note">Only Rajiv can change weights. Each change is versioned so past quarters keep the weights they were scored on.</p>`;
  if (t==='audit') body = `<div class="card"><div class="list">${AUDIT.map(a=>`<div class="item">${av(a[1])}<div class="main-t"><b style="font-weight:500">${esc(USERS[a[1]].name)} ${esc(a[2])}</b><div class="meta">${esc(a[3])}</div></div><span class="mono" style="color:var(--ink-3)">${esc(a[0])}</span></div>`).join('')}</div></div>`;
  return `<div class="page-head"><div><h1>Admin</h1><p>Recurring work, people and access, and a full record of changes.</p></div>${tabs}</div>${body}`;
}

/* ---------------- people and access ---------------- */
const LEVELS = {
  chair:['Chairperson','All work. Approves KPIs and manages people.'],
  head:['Full access','All work. Verifies KPIs and manages people.'],
  owner:['DWM owner','Everything, whatever the hierarchy. Approves new sign-ups and manages everyone.'],
  lead:['Team view','All operational work.'],
  pm:['Own work','Own tasks, sessions, cohorts and KPIs.']
};
const canManageUsers = () => canConf() || ['chair','head','owner'].includes(UU(S.user).kind);
// Only a DWM owner can make someone else a DWM owner or change an owner's access.
const grantable = () => isOwner(S.user) ? Object.keys(LEVELS) : canConf() ? ['chair','head','lead','pm'] : ['lead','pm'];
const LEVEL_HELP = 'Access level decides which work someone sees. Honorarium access is a separate switch.';
const canEditMember = id => isOwner(S.user) || (canManageUsers() && !isOwner(id) && (canConf() || (!hasHon(id) && !['chair','head'].includes(UU(id).kind))));
function usersTab(){
  const order = Object.keys(LEVELS);
  const ids = Object.keys(USERS).sort((a,b)=>order.indexOf(UU(a).kind)-order.indexOf(UU(b).kind) || UU(a).name.localeCompare(UU(b).name));
  return `${requestsCard()}<div class="card"><div class="card-h"><h2 class="h3">People and access</h2>${canManageUsers()?`<button class="btn sm primary" data-act="modal" data-m="member">${ic('plus')}Add person</button>`:''}</div><div class="tbl-wrap"><table><thead><tr><th>Person</th><th>Title</th><th>Reports to</th><th>Access level</th><th>Email</th><th>Honorariums</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${ids.map(id=>{const u=UU(id), k=u.kind;return `<tr><td>${who(id)}</td><td>${esc(u.role)}</td><td>${u.boss&&USERS[u.boss]?esc(UU(u.boss).name):'<span class="demo-note">—</span>'}</td><td><b style="font-weight:600">${esc((LEVELS[k]||[k])[0])}</b><div style="font-size:12px;color:var(--ink-3);max-width:34ch">${esc((LEVELS[k]||['',''])[1])}</div></td><td style="font-size:13px">${esc(u.email||'')}</td><td>${hasHon(id)?'<span class="tag t-good">Visible</span>':'<span class="tag">Masked</span>'}</td><td class="r">${canEditMember(id)?`<button class="btn sm" data-act="modal" data-m="member" data-id="${id}">Edit</button>${id!==S.user?` <button class="btn sm" data-act="modal" data-m="memberdel" data-id="${id}">Remove</button>`:''}`:''}</td></tr>`}).join('')}</tbody></table></div></div>
  <p class="demo-note">${isOwner(S.user)?'As DWM owner you can give any access level and change anyone.':canConf()?'Only a DWM owner can add or change DWM owners.':'Only people with honorarium access can give it, or change people who have it.'} New people can create their own account from the sign-in page, and the DWM owner approves it here. You can also add someone directly; they then set up their account with the email you entered.</p>`;
}
function requestsCard(){
  if (!isOwner(S.user)) return '';
  const list = REQUESTS.slice().sort((a,b)=>(a.status==='pending'?0:1)-(b.status==='pending'?0:1) || String(b.requested_at).localeCompare(String(a.requested_at)));
  const when = iso => { try { return fmt(String(iso).slice(0,10)); } catch(_) { return ''; } };
  return `<div class="card"><div class="card-h"><h2 class="h3">Sign-up requests</h2><small>${pendingReqs().length} waiting</small></div>${list.length?`<div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Asked on</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${list.map(r=>`<tr><td><b style="font-weight:600">${esc(r.name||'—')}</b></td><td style="font-size:13px">${esc(r.email)}</td><td class="num">${when(r.requested_at)}</td><td>${r.status==='pending'?'<span class="tag t-warn">Waiting</span>':'<span class="tag">Declined</span>'}</td><td class="r"><button class="btn sm primary" data-act="modal" data-m="approve" data-id="${esc(r.email)}">${r.status==='pending'?'Approve':'Approve anyway'}</button>${r.status==='pending'?` <button class="btn sm" data-act="reqdecline" data-id="${esc(r.email)}">Decline</button>`:''}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No one is waiting. When someone creates an account, their request appears here.</div>'}</div>`;
}
async function reqDecline(email, btn){
  const r = REQUESTS.find(x=>x.email===email); if (!r) return;
  btn.disabled = true; btn.textContent = 'Declining…';
  try {
    if (!db.demo) await db.declineRequest(email);
    r.status = 'declined';
    AUDIT.unshift([nowStamp(), S.user, 'declined sign-up', r.name ? `${r.name} · ${email}` : email]);
    toast(`${r.name||email} declined. They cannot see anything in Optimus.`);
  } catch(e){ btn.disabled = false; btn.textContent = 'Decline'; toast(e.message || 'Could not decline.'); }
}
function memberForm(id, req){
  const u = id ? UU(id) : {name:(req&&req.name)||'',role:'',kind:'pm',email:(req&&req.email)||''};
  return `<div class="grid memberf" style="gap:12px">
    <div class="grid g2"><div class="field"><label for="mb-n">Name</label><input id="mb-n" value="${esc(u.name)}"></div><div class="field"><label for="mb-t">Title</label><input id="mb-t" value="${esc(u.role)}" placeholder="e.g. Program Manager"></div></div>
    <div class="field"><label for="mb-r">Reports to</label><select id="mb-r"><option value="">No one</option>${Object.keys(USERS).filter(k=>k!==id).sort((a,b)=>UU(a).name.localeCompare(UU(b).name)).map(k=>`<option value="${k}" ${u.boss===k?'selected':''}>${esc(UU(k).name)} · ${esc(UU(k).role)}</option>`).join('')}</select></div>
    <div class="field"><label for="mb-e">Work email (their sign-in)</label><input id="mb-e" type="email" value="${esc(u.email||'')}" ${req?'readonly':''}></div>
    <div class="field"><label for="mb-k">Access level</label><select id="mb-k">${grantable().map(k=>`<option value="${k}" ${k===u.kind?'selected':''}>${LEVELS[k][0]} · ${LEVELS[k][1]}</option>`).join('')}</select></div>
    ${canConf()?`<label id="mb-hl" style="display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line-2);border-radius:10px;padding:10px 12px;cursor:pointer"><input type="checkbox" id="mb-h" ${(id&&hasHon(id))||u.kind==='owner'?'checked':''} ${u.kind==='owner'?'disabled':''} style="margin-top:3px"><span><b>Can see honorariums</b><span style="display:block;font-size:12px;color:var(--ink-3)">Faculty rates, honorarium totals, bank details and senior-faculty invoices. Off for new people unless you tick it. Always on for a DWM owner.</span></span></label>`:`<div class="iv-ro">${ic('lock')} Honorariums stay hidden from this person. Only someone with honorarium access can switch it on.</div>`}
    <p class="demo-note" style="margin:0">${LEVEL_HELP}</p>
    <span class="sc-err" id="mb-err"></span>
  </div>`;
}
async function memberSave(id, btn){
  const req = btn.dataset.req ? REQUESTS.find(r=>r.email===btn.dataset.req) : null;
  const g=x=>document.getElementById(x), val=x=>g(x).value.trim();
  const name=val('mb-n'), title=val('mb-t'), email=val('mb-e').toLowerCase(), kind=val('mb-k'), boss=val('mb-r'), hon = kind==='owner' || (canConf() ? g('mb-h').checked : false);
  const err = !name ? 'Add their name.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Add a valid email address.' : Object.keys(USERS).some(k=>k!==id && (UU(k).email||'').toLowerCase()===email) ? 'Someone on the team already uses that email.' : !grantable().includes(kind) ? 'You cannot give that access level.' : (id===S.user && isOwner(id) && kind!=='owner' && !Object.keys(USERS).some(k=>k!==id && UU(k).kind==='owner')) ? 'Optimus needs at least one DWM owner. Make someone else DWM owner first.' : '';
  if (err){ g('mb-err').textContent = err; return; }
  let key = id;
  if (!key){ const base = (name.toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g,'') || 'user').slice(0,20); key = base; let n=2; while (USERS[key]) key = base + n++; }
  const row = {key, name, title, email, kind, reports_to: boss || null, can_see_honorariums: hon, color: (USERS[key]&&USERS[key].color) || '#525252'};
  btn.disabled = true; btn.textContent = 'Saving…';
  try {
    if (!db.demo) await db.saveMember(row);
    if (req){ if (!db.demo) { try { await db.clearRequest(req.email); } catch(e){ console.error(e); } } REQUESTS.splice(REQUESTS.indexOf(req),1); }
    USERS[key] = {name, role:title, kind, color:row.color, email, hon, boss};
    PMS.length = 0; PMS.push(...Object.keys(USERS).filter(k=>USERS[k].kind==='pm'));
    AUDIT.unshift([nowStamp(), S.user, id?'edited person':req?'approved sign-up':'added person', `${name} · ${LEVELS[kind][0]}${hon?' · honorariums visible':''}`]);
    S.modal = null; toast(id ? `${name} updated` : req ? `${name} approved. They can sign in now.` : `${name} added. They can now set up their account.`);
  } catch(e){ btn.disabled = false; btn.textContent = id?'Save changes':req?'Approve':'Add person'; g('mb-err').textContent = e.message || 'Could not save.'; }
}
async function memberRemove(id, btn){
  const name = UU(id).name; btn.disabled = true; btn.textContent = 'Removing…';
  try {
    if (!db.demo) await db.removeMember(id);
    delete USERS[id]; PMS.length = 0; PMS.push(...Object.keys(USERS).filter(k=>USERS[k].kind==='pm'));
    AUDIT.unshift([nowStamp(), S.user, 'removed person', name]);
    S.modal = null; toast(`${name} removed. They can no longer see anything in Optimus.`);
  } catch(e){ btn.disabled = false; btn.textContent = 'Remove'; toast(e.message || 'Could not remove.'); }
}

/* ---------------- cohorts ---------------- */
const pctTxt = v => v==null ? '—' : v+'%';
const pctCol = v => v==null?'var(--ink-3)':v>=85?'var(--good)':v>=75?'var(--warn)':'var(--bad)';
const ATT_C = {P:'var(--good)',L:'var(--warn)',A:'var(--bad)',E:'var(--line-2)'};
const ATT_L = {P:'Present',L:'Late',A:'Absent',E:'Excused'};

/* ---------------- attendance: mark by hand, or fill from an Excel/CSV sheet ---------------- */
// c.sess = [{n, date, title}] ; student.attRec[i] = 'P'|'L'|'A'|'E'|null for session i ; student.att = % present or late, excused not counted
const canMarkAtt = c => !!c && (c.pm===S.user || isMgr());
function attRecalc(c){
  c.students.forEach(s=>{ const rec = c.sess.map((_,i)=>s.attRec[i]||null); s.attRec = rec;
    const counted = rec.filter(v=>v && v!=='E'); s.att = counted.length ? Math.round(counted.filter(v=>v!=='A').length/counted.length*100) : null; });
  c.sessions = c.sess.length;
}
// Adds a session (date, name) to a cohort's attendance list, keeping marks lined up by date. Returns false if that date exists.
function addCohortSession(c, date, title){
  if (c.sess.some(x=>x.date===date)) return false;
  const before = c.sess.map(x=>x.date);
  c.sess.push({n:0, date, title:title||''});
  c.sess.sort((a,b)=>a.date.localeCompare(b.date));
  c.students.forEach(st=>{ const m = {}; before.forEach((d,i)=>{ m[d] = st.attRec[i] || null; }); st.attRec = c.sess.map(x=>m[x.date] || null); });
  c.sess.forEach((x,i)=>x.n=i+1);
  attRecalc(c);
  return true;
}
let ATT = null; // the open sheet: {code, idx (session index or -1 for new), marks:{studentId:code}, note}
function attOpen(code){
  const c = COHORTS.find(x=>x.code===code); if (!c) return;
  const idx = c.sess.findIndex(x=>x.date===TODAY_ISO);
  ATT = {code, idx, date:TODAY_ISO, title:'', marks:{}, note:''};
  if (idx>=0) c.students.forEach(s=>{ if (s.attRec[idx]) ATT.marks[s.id]=s.attRec[idx]; });
  S.modal = ['attmark', code];
}
function attSessOptions(c){
  const sched = SESSIONS.filter(x=>x.cohort===c.code && !c.sess.some(y=>y.date===x.date)).sort((a,b)=>a.date.localeCompare(b.date));
  return `${c.sess.map((x,i)=>`<option value="${i}" ${ATT.idx===i?'selected':''}>Session ${x.n} · ${fmtLong(x.date)}${x.title?' · '+esc(x.title):''}</option>`).join('')}
    <option value="-1" ${ATT.idx<0?'selected':''}>New session…</option>
    ${sched.length?`<optgroup label="Scheduled classes">${sched.map(x=>`<option value="s:${x.id}">${fmtLong(x.date)} · ${esc(x.title)}</option>`).join('')}</optgroup>`:''}`;
}
function attForm(code){
  const c = COHORTS.find(x=>x.code===code), A = ATT;
  const counts = {P:0,L:0,A:0,E:0}; let unmarked = 0;
  c.students.forEach(s=>{ const v=A.marks[s.id]; if (v) counts[v]++; else unmarked++; });
  return `<div class="grid attf" style="gap:14px">
    <div class="grid g2"><div class="field"><label for="at-s">Session</label><select id="at-s">${attSessOptions(c)}</select></div>
      <div class="field" ${A.idx<0?'':'hidden'}><label for="at-d">Date of the new session</label><input id="at-d" type="date" value="${A.date}"></div></div>
    <div class="field" ${A.idx<0?'':'hidden'}><label for="at-t">Topic (optional)</label><input id="at-t" value="${esc(A.title)}" placeholder="e.g. Succession planning"></div>
    <div class="att-up"><div><b>Upload instead</b><span class="demo-note" style="display:block">Excel or CSV with a Student ID, email or name column, and a Status column (P, L, A or E, or the words Present, Late, Absent, Excused). It fills in the sheet below for you to check.</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn sm" for="at-file">${ic('upload')}Choose file</label><input id="at-file" type="file" accept=".xlsx,.xls,.csv" class="sr-only"><button class="btn sm" type="button" data-act="attdltpl" data-id="${esc(code)}">${ic('download')}Template for ${esc(code)}</button></div></div>
    <div id="at-note" tabindex="-1" role="status" class="demo-note" style="margin:0">${esc(A.note)}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><span id="at-sum" class="demo-note" style="margin:0" aria-live="polite">${counts.P} present · ${counts.L} late · ${counts.A} absent · ${counts.E} excused · ${unmarked} not marked</span>
      <span style="display:flex;gap:6px"><button class="btn sm" type="button" data-act="attall" data-v="P">Mark everyone present</button><button class="btn sm" type="button" data-act="attall" data-v="">Clear</button></span></div>
    ${c.students.length?`<div class="att-list">${c.students.map(st=>`<fieldset class="att-row"><legend><b>${esc(st.name)}</b> <span class="mono" style="color:var(--ink-3)">${esc(st.id)}</span></legend><div class="att-opts">${['P','L','A','E'].map(k=>`<label class="att-opt att-${k}"><input type="radio" name="at-${esc(st.id)}" value="${k}" data-sid="${esc(st.id)}" ${A.marks[st.id]===k?'checked':''}><span>${ATT_L[k]}</span></label>`).join('')}</div></fieldset>`).join('')}</div>`:'<div class="empty">This cohort has no students yet.</div>'}
    <span class="sc-err" id="at-err"></span>
  </div>`;
}
function attSummary(){
  const c = COHORTS.find(x=>x.code===ATT.code), el = document.getElementById('at-sum'); if (!el) return;
  const counts = {P:0,L:0,A:0,E:0}; let un = 0; c.students.forEach(s=>{ const v=ATT.marks[s.id]; if (v) counts[v]++; else un++; });
  el.textContent = `${counts.P} present · ${counts.L} late · ${counts.A} absent · ${counts.E} excused · ${un} not marked`;
}
const ATT_WORDS = {p:'P',present:'P',yes:'P',y:'P','1':'P',l:'L',late:'L',a:'A',absent:'A',no:'A',n:'A','0':'A',e:'E',excused:'E',leave:'E','on leave':'E'};
async function attParse(file){
  const c = COHORTS.find(x=>x.code===ATT.code), note = document.getElementById('at-note');
  note.textContent = `Reading ${file.name}…`;
  try {
    const X = await import('xlsx'), wb = X.read(await file.arrayBuffer(), {type:'array'});
    const raw = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1, defval:'', blankrows:false});
    if (raw.length < 2) throw new Error('The file has no rows under the header.');
    const head = raw[0].map(h=>String(h).trim().toLowerCase());
    const col = (...n) => head.findIndex(h => n.some(x => h===x || h.includes(x)));
    const iId = col('student id','id','roll'), iEm = col('email'), iNm = col('student name','name'), iSt = col('status','attendance','present','mark');
    if (iSt < 0) throw new Error('No Status column found. Use the template.');
    if (iId < 0 && iEm < 0 && iNm < 0) throw new Error('No Student ID, email or name column found. Use the template.');
    let filled = 0; const missing = [], bad = [];
    raw.slice(1).forEach((r, k) => {
      const id = iId>=0 ? String(r[iId]).trim().toLowerCase() : '', em = iEm>=0 ? String(r[iEm]).trim().toLowerCase() : '', nm = iNm>=0 ? String(r[iNm]).trim().toLowerCase() : '';
      if (!id && !em && !nm) return;
      const st = c.students.find(s => (id && s.id.toLowerCase()===id) || (em && (s.email||'').toLowerCase()===em) || (nm && s.name.toLowerCase()===nm));
      const v = ATT_WORDS[String(r[iSt]).trim().toLowerCase()];
      if (!st) { missing.push(r[iId]||r[iEm]||r[iNm]); return; }
      if (!v) { bad.push(`row ${k+2}`); return; }
      ATT.marks[st.id] = v; filled++;
    });
    ATT.note = `${file.name}: filled ${filled} student${filled===1?'':'s'}.` + (missing.length ? ` Not in this cohort: ${missing.slice(0,5).join(', ')}${missing.length>5?` and ${missing.length-5} more`:''}.` : '') + (bad.length ? ` Status not understood on ${bad.slice(0,5).join(', ')}${bad.length>5?' and more':''}.` : '') + ' Check the sheet, then save.';
  } catch(e) { ATT.note = 'Could not read the file. ' + (e.message||''); }
  render();
  const n = document.getElementById('at-note'); if (n) n.focus();
}
function attSave(){
  const c = COHORTS.find(x=>x.code===ATT.code), err = document.getElementById('at-err');
  if (!Object.keys(ATT.marks).length){ err.textContent = 'Mark at least one student, or upload a sheet.'; return null; }
  let idx = ATT.idx;
  if (idx < 0){
    const date = ATT.date; if (!date){ err.textContent = 'Add the date of the session.'; return null; }
    if (c.sess.some(x=>x.date===date)){ err.textContent = `There is already a session on ${fmtLong(date)}. Choose it from the list.`; return null; }
    addCohortSession(c, date, ATT.title);
    idx = c.sess.findIndex(x=>x.date===date);
  }
  c.students.forEach(s=>{ if (ATT.marks[s.id]) s.attRec[idx] = ATT.marks[s.id]; });
  attRecalc(c);
  const n = Object.keys(ATT.marks).length, sess = c.sess[idx];
  AUDIT.unshift([nowStamp(), S.user, 'marked attendance', `${c.code} · session ${sess.n} (${fmt(sess.date)}) · ${n} student${n===1?'':'s'}`]);
  ATT = null;
  return `Attendance saved for ${c.code}, session ${sess.n} on ${fmtLong(sess.date)}`;
}
/* ---------------- past sessions: upload names and dates only, for attendance (no invites, no payments) ---------------- */
let PSU = null; // {code, rows:[{title, date, st:'new'|'dup'|'bad', raw}], note}
const markableCohorts = () => visibleCohorts().filter(canMarkAtt);
function psOpen(){ const list = markableCohorts(); if (!list.length){ toast('Add a cohort first'); return; } PSU = {code: (S.cohort && list.some(c=>c.code===S.cohort)) ? S.cohort : list[0].code, rows:[], note:''}; S.modal = ['pastsess', '']; }
const MON = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12};
function psDate(v){
  if (v instanceof Date && !isNaN(v)) return localISO(v);
  if (typeof v === 'number' && v > 20000 && v < 80000) return localISO(new Date(Math.round((v - 25569) * 864e5) + new Date().getTimezoneOffset()*6e4));
  const t = String(v||'').trim(); let m;
  if ((m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  if ((m = t.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/))) { const y = m[3].length===2 ? '20'+m[3] : m[3]; return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; } // day first, as in India
  if ((m = t.match(/^(\d{1,2})(?:st|nd|rd|th)?[\s-]+([A-Za-z]{3,9})[\s,-]+(\d{2,4})$/))) { const mo = MON[m[2].toLowerCase()] || MON[m[2].slice(0,3).toLowerCase()]; if (mo) { const y = m[3].length===2 ? '20'+m[3] : m[3]; return `${y}-${String(mo).padStart(2,'0')}-${m[1].padStart(2,'0')}`; } }
  return null;
}
const psValid = d => !!d && !isNaN(new Date(d+'T00:00:00')) && new Date(d+'T00:00:00').toISOString().slice(0,10)===d;
function psForm(){
  const list = markableCohorts(), c = COHORTS.find(x=>x.code===PSU.code), R = PSU.rows;
  const nNew = R.filter(r=>r.st==='new').length;
  return `<div class="grid psf" style="gap:14px">
    <p class="demo-note" style="margin:0">For classes that already happened. Only the session name and date are saved, so they show in the attendance list. No invites go out, and nothing is added to payments.</p>
    <div class="field"><label for="ps-c">Cohort</label><select id="ps-c">${list.map(x=>`<option value="${esc(x.code)}" ${x.code===PSU.code?'selected':''}>${esc(x.code)} · ${esc(x.prog)} · ${x.sess.length} session${x.sess.length===1?'':'s'} so far</option>`).join('')}</select></div>
    <div class="att-up"><div><b>Excel or CSV file</b><span class="demo-note" style="display:block">Two columns: Session name and Date. Dates can be 12/10/2026 (day first), 12 Oct 2026, 2026-10-12 or Excel dates.</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn sm" for="ps-file">${ic('upload')}Choose file</label><input id="ps-file" type="file" accept=".xlsx,.xls,.csv" class="sr-only"><button class="btn sm" type="button" data-act="pstpl">${ic('download')}Template</button></div></div>
    <div id="ps-note" tabindex="-1" role="status" class="demo-note" style="margin:0">${esc(PSU.note)}</div>
    ${R.length?`<div class="card" style="box-shadow:none"><div class="tbl-wrap"><table><caption class="sr-only">Sessions in the file</caption><thead><tr><th scope="col">Row</th><th scope="col">Session name</th><th scope="col">Date</th><th scope="col">Result</th></tr></thead><tbody>${R.map(r=>`<tr><td class="num">${r.row}</td><td>${esc(r.title||'—')}</td><td class="num">${r.date&&psValid(r.date)?fmtLong(r.date)+' '+r.date.slice(0,4):esc(String(r.raw||'—'))}</td><td>${r.st==='new'?'<span class="tag t-good">Will be added</span>':r.st==='dup'?'<span class="tag">Already there, skipped</span>':'<span class="tag t-bad">Date not understood, skipped</span>'}</td></tr>`).join('')}</tbody></table></div></div>`:''}
    <span class="sc-err" id="ps-err"></span>
  </div>`;
}
function psRecheck(){ const c = COHORTS.find(x=>x.code===PSU.code); const seen = new Set(c.sess.map(x=>x.date)); PSU.rows.forEach(r=>{ if (!r.date || !psValid(r.date)) r.st='bad'; else if (seen.has(r.date)) r.st='dup'; else { r.st='new'; seen.add(r.date); } }); }
async function psParse(file){
  PSU.note = `Reading ${file.name}…`; PSU.rows = [];
  try {
    const X = await import('xlsx'), wb = X.read(await file.arrayBuffer(), {type:'array', cellDates:true, raw:/\.csv$/i.test(file.name)}); // CSV dates stay as typed, so 12/10/2026 is read day first
    const raw = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1, defval:'', blankrows:false, raw:true});
    if (raw.length < 2) throw new Error('The file has no rows under the header.');
    const head = raw[0].map(h=>String(h).trim().toLowerCase());
    let iD = head.findIndex(h=>h.includes('date')), iT = head.findIndex(h=>/session|name|title|topic|class/.test(h) && !h.includes('date'));
    if (iD < 0) throw new Error('No Date column found. Use the template.');
    if (iT < 0) iT = iD === 0 ? 1 : 0;
    raw.slice(1).forEach((r,k)=>{ const title = String(r[iT]||'').trim(), v = r[iD]; if (!title && v==='') return; PSU.rows.push({row:k+2, title, raw:v instanceof Date ? v.toDateString() : v, date: psDate(v)}); });
    psRecheck();
    const n = PSU.rows.filter(r=>r.st==='new').length, d = PSU.rows.filter(r=>r.st==='dup').length, b = PSU.rows.filter(r=>r.st==='bad').length;
    PSU.note = `${file.name}: ${n} session${n===1?'':'s'} to add` + (d ? `, ${d} already there` : '') + (b ? `, ${b} with a date that could not be read` : '') + '. Check the list, then save.';
  } catch(e) { PSU.note = 'Could not read the file. ' + (e.message||''); PSU.rows = []; }
  render(); const n = document.getElementById('ps-note'); if (n) n.focus();
}
function psSave(){
  const c = COHORTS.find(x=>x.code===PSU.code), add = PSU.rows.filter(r=>r.st==='new');
  if (!add.length){ document.getElementById('ps-err').textContent = PSU.rows.length ? 'Nothing new to add from this file.' : 'Choose a file first.'; return null; }
  let n = 0; add.forEach(r=>{ if (addCohortSession(c, r.date, r.title)) n++; });
  AUDIT.unshift([nowStamp(), S.user, 'uploaded past sessions', `${c.code} · ${n} session${n===1?'':'s'}`]);
  PSU = null;
  return {c, n};
}
document.addEventListener('change', e=>{
  if (!PSU || !e.target.closest || !e.target.closest('.psf')) return;
  if (e.target.id==='ps-c'){ PSU.code = e.target.value; if (PSU.rows.length) psRecheck(); render(); const x=document.getElementById('ps-c'); if (x) x.focus(); }
  if (e.target.id==='ps-file' && e.target.files[0]) psParse(e.target.files[0]);
});
document.addEventListener('change', e=>{
  if (!ATT || !e.target.closest || !e.target.closest('.attf')) return;
  const t = e.target, c = COHORTS.find(x=>x.code===ATT.code);
  if (t.name && t.name.startsWith('at-') && t.type==='radio'){ ATT.marks[t.dataset.sid] = t.value; attSummary(); return; }
  if (t.id==='at-file' && t.files[0]){ attParse(t.files[0]); return; }
  if (t.id==='at-s'){ const v = t.value;
    if (v.startsWith('s:')){ const x = SESSIONS.find(y=>y.id===v.slice(2)); ATT.idx = -1; ATT.date = x.date; ATT.title = x.title; }
    else { ATT.idx = +v; if (ATT.idx>=0){ ATT.marks = {}; c.students.forEach(s=>{ if (s.attRec[ATT.idx]) ATT.marks[s.id]=s.attRec[ATT.idx]; }); } else { ATT.date = TODAY_ISO; ATT.title = ''; } }
    render(); const sel = document.getElementById('at-s'); if (sel) sel.focus(); return; }
  if (t.id==='at-d') ATT.date = t.value;
  if (t.id==='at-t') ATT.title = t.value.trim();
});
document.addEventListener('input', e=>{ if (ATT && e.target.id==='at-t') ATT.title = e.target.value.trim(); if (ATT && e.target.id==='at-d') ATT.date = e.target.value; });

function statusTagC(c){ return `<span class="tag ${c.status==='Running'?'t-good':'t-info'}">${c.status}</span>`; }

function viewCohorts(){
  if (S.cohort) return viewCohort(COHORTS.find(c=>c.code===S.cohort));
  const vis = visibleCohorts();
  const progs = [...new Set(['OPM','EBAP',...vis.map(c=>c.prog)])].filter(p=>vis.some(c=>c.prog===p));
  const running = vis.filter(c=>c.status==='Running');
  return `<div class="page-head"><div><h1>Cohorts</h1><p>${vis.length?`${vis.length} cohort${vis.length>1?'s':''}. Open a cohort for its profile, students, assignments, attendance and analytics.`:'No cohorts yet.'}</p></div><div class="toolbar">${db.demo&&vis.length?`<button class="btn" data-act="upload">${ic('upload')}Bulk upload</button>`:''}${isMgr()?`<button class="btn primary" data-act="modal" data-m="cohortadd">${ic('plus')}Add cohort</button>`:''}</div></div>
  ${!vis.length?`<div class="card"><div class="empty">${isMgr()?'Add your first cohort to start tracking its students.':'No cohorts are assigned to you yet.'}</div></div>`:''}
  ${progs.map(p=>`<section class="grid" style="gap:12px"><div style="display:flex;align-items:baseline;gap:10px"><h2 style="font-size:20px">${p}</h2><span class="demo-note">${vis.filter(c=>c.prog===p).length} cohort${vis.filter(c=>c.prog===p).length===1?'':'s'}</span></div>
    <div class="grid g3">${vis.filter(c=>c.prog===p).map(c=>{const st=cohortStats(c);return `<button class="card cohort-card" data-act="cohort" data-c="${c.code}">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="cohort-code">${c.code}</span>${statusTagC(c)}</div>
      <div class="demo-note">${fmt(c.start)} ${D(c.start).getFullYear()} to ${fmt(c.end)} ${D(c.end).getFullYear()} · ${c.size} students</div>
      ${c.status==='Running'?`<div class="mini-stats"><div><b class="num" style="color:${pctCol(st.att)}">${pctTxt(st.att)}</b><span>Attendance</span></div><div><b class="num">${pctTxt(st.sub)}</b><span>Submitted</span></div><div><b class="num">${pctTxt(st.score)}</b><span>Avg score</span></div><div><b class="num" style="color:${st.risk?'var(--bad)':'inherit'}">${st.risk}</b><span>At risk</span></div></div>`:`<div class="mini-stats"><div><b class="num">${c.size}</b><span>Admitted</span></div><div><b class="num">${fmt(c.start)}</b><span>Starts</span></div></div>`}
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-2)">${av(c.pm)}<span>${esc(UU(c.pm).name)}</span></div>
    </button>`}).join('')}</div></section>`).join('')}
  ${running.length>1?`<div class="card"><div class="card-h"><h2 class="h3">Compare cohorts</h2><small>Running cohorts, programme to date</small></div><div class="card-b">${compareChart(running)}</div></div>`:''}`;
}

function compareChart(list){
  const rowH=44, left=92, w=1000, h=list.length*rowH+40, X=v=>left+(w-left-40)*v/100;
  const metrics=[['att','Attendance','var(--accent)'],['sub','Submitted','var(--info)'],['score','Avg score','var(--accent-2)']];
  return `<div class="tbl-wrap"><svg viewBox="0 0 ${w} ${h}" style="width:100%;min-width:560px;display:block" role="img" aria-label="Cohort comparison">
    ${[0,25,50,75,100].map(t=>`<line x1="${X(t)}" x2="${X(t)}" y1="8" y2="${h-28}" stroke="var(--line)" ${t===75?'stroke-dasharray="4 4" stroke="var(--line-2)"':''}/><text x="${X(t)}" y="${h-10}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${t}%</text>`).join('')}
    ${list.map((c,i)=>{const st=cohortStats(c), y=14+i*rowH; return `<text x="0" y="${y+20}" font-size="13" font-weight="600" fill="var(--ink)">${c.code}</text>${metrics.map(([k,,col],j)=>`<rect x="${left}" y="${y+j*10}" width="${X(st[k])-left}" height="8" rx="3" fill="${col}"/><text x="${X(st[k])+6}" y="${y+j*10+8}" font-size="10.5" fill="var(--ink-2)">${st[k]}%</text>`).join('')}`}).join('')}
  </svg></div><div class="legend">${metrics.map(([,l,col])=>`<span><i style="background:${col}"></i>${l}</span>`).join('')}<span><i style="background:none;border-top:1px dashed var(--line-2);height:0"></i>75% attendance threshold</span></div>`;
}

function viewCohort(c){
  const tab = S.ctab, st = cohortStats(c);
  const tabs = [['profile','Profile'],['students','Students'],['assignments','Assignments'],['attendance','Attendance'],['analytics','Analytics']];
  let body = '';
  if (tab==='profile') body = `<div class="grid g21"><div class="card"><div class="card-h"><h2 class="h3">Cohort profile</h2><button class="btn sm" data-act="toast" data-t="Profile editor opens here">Edit</button></div><div class="card-b"><dl class="kv">
      <dt>Programme</dt><dd>${c.prog}</dd><dt>Cohort code</dt><dd class="mono" style="font-size:13px">${c.code}</dd><dt>Status</dt><dd>${statusTagC(c)}</dd>
      <dt>Dates</dt><dd class="num">${fmtLong(c.start)} ${D(c.start).getFullYear()} to ${fmtLong(c.end)} ${D(c.end).getFullYear()}</dd><dt>Format</dt><dd>${esc(c.format)}</dd>
      <dt>Programme Manager</dt><dd>${who(c.pm)}</dd><dt>Students</dt><dd class="num">${c.size}</dd><dt>Sessions held</dt><dd class="num">${c.sess.length}</dd><dt>Assignments set</dt><dd class="num">${c.asg.length}</dd></dl></div></div>
    <div class="grid" style="align-content:start"><div class="card"><div class="card-h"><h2 class="h3">Key dates</h2></div><div class="list">${c.keydates.map(([l,d])=>`<div class="item"><div class="main-t"><b>${esc(l)}</b></div><span class="num" style="color:var(--ink-2)">${fmt(d)} ${D(d).getFullYear()}</span></div>`).join('')}</div></div>
    <div class="card"><div class="card-h"><h2 class="h3">Faculty roster</h2></div><div class="list">${c.faculty.map(f=>`<div class="item"><div class="main-t"><b>${esc(FACULTY[f].name)}</b><div class="meta">${esc(FACULTY[f].exp)}</div></div></div>`).join('')}</div></div></div></div>`;
  if (tab==='students') body = !c.students.length ? `<div class="card"><div class="empty">No students in ${esc(c.code)} yet.${canMarkAtt(c)?`<div style="margin-top:12px"><button class="btn primary" data-act="stuadd" data-id="${esc(c.code)}">${ic('plus')}Add students</button></div>`:''}</div></div>` : `<div class="toolbar"><label class="search stu-search">${ic('search')}<span class="sr-only">Search students in ${esc(c.code)}</span><input id="co-q" type="search" placeholder="Search ${esc(c.code)} by name, email, phone or company" value="${esc(S.csq||'')}" aria-describedby="co-count" autocomplete="off"></label>${S.csq?`<button class="btn sm" data-act="coqclear">Clear</button>`:''}<span id="co-count" class="demo-note" aria-live="polite">${S.csq?(()=>{const n=c.students.filter(s=>stuMatch(s,S.csq)).length;return `${n} match${n===1?'':'es'}`})():''}</span></div><div class="card"><div class="card-h"><h2 class="h3">${c.students.length} student${c.students.length===1?'':'s'}</h2>${canMarkAtt(c)?`<button class="btn sm primary" data-act="stuadd" data-id="${esc(c.code)}">${ic('plus')}Add students</button>`:''}</div><div class="tbl-wrap"><table><thead><tr><th>Student</th><th>Attendance</th><th class="r">Submitted</th><th class="r">Avg score</th><th>Last 1:1</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>
    ${S.csq && !c.students.some(s=>stuMatch(s,S.csq)) ? `<tr><td colspan="6" class="empty">No student in ${esc(c.code)} matches “${esc(S.csq)}”.</td></tr>` : ''}${c.students.filter(s=>stuMatch(s,S.csq||'')).sort((a,b)=>(a.att??101)-(b.att??101)).map(s=>{const sub=s.subs.filter(x=>x.st!=='Missing').length;return `<tr class="click" data-act="student" data-id="${s.id}"><td><b style="font-weight:600">${esc(s.name)}</b><div style="font-size:12px;color:var(--ink-3)"><span class="mono">${s.id}</span>${[s.email,s.phone,s.company].filter(Boolean).map(x=>' · '+esc(x)).join('')}</div></td><td>${s.att==null?'<span class="demo-note">'+(c.start>TODAY_ISO?'Starts '+fmt(c.start):'Not marked yet')+'</span>':`<div style="display:flex;align-items:center;gap:8px"><div class="bar" style="width:90px"><i style="width:${s.att}%;background:${pctCol(s.att)}"></i></div><span class="num">${s.att}%</span></div>`}</td><td class="r num">${s.subs.length?`${sub} / ${s.subs.length}`:'—'}</td><td class="r num">${s.avg==null?'—':s.avg+'%'}</td><td class="num">${s.last?fmt(s.last):c.status==='Running'?'<span class="tag t-warn">Pending</span>':'—'}</td><td>${s.att!=null&&s.att<75?'<span class="tag t-bad">At risk</span>':''}</td></tr>`}).join('')}
    </tbody></table></div></div>`;
  if (tab==='assignments') body = c.asg.length? `<div class="card"><div class="card-h"><h2 class="h3">Assignments</h2><button class="btn sm primary" data-act="toast" data-t="Assignment form opens here">${ic('plus')}New assignment</button></div><div class="tbl-wrap"><table><thead><tr><th>Assignment</th><th>Due</th><th class="r">On time</th><th class="r">Late</th><th class="r">Missing</th><th class="r">Avg score</th></tr></thead><tbody>
    ${c.asg.map((a,i)=>{const subs=c.students.map(s=>s.subs[i]);const on=subs.filter(x=>x.st==='On time').length,la=subs.filter(x=>x.st==='Late').length,mi=subs.filter(x=>x.st==='Missing').length;const sc=subs.filter(x=>x.score!=null);const av2=sc.length?(sc.reduce((a,x)=>a+x.score,0)/sc.length).toFixed(1):'—';return `<tr><td><b style="font-weight:600">${esc(a.title)}</b><div class="demo-note">Assignment ${a.n} · out of ${a.max}</div></td><td class="num">${fmt(a.due)}</td><td class="r num">${on}</td><td class="r num">${la}</td><td class="r num">${mi?`<span class="tag t-bad">${mi}</span>`:'0'}</td><td class="r num"><b>${av2}</b> / ${a.max}</td></tr>`}).join('')}
    </tbody></table></div></div>` : `<div class="card"><div class="empty">No assignments yet. ${c.code} starts on ${fmtLong(c.start)} ${D(c.start).getFullYear()}.</div></div>`;
  if (tab==='attendance') { const mk = canMarkAtt(c) ? `<button class="btn sm primary" data-act="attmark" data-id="${esc(c.code)}">${ic('check')}Mark or upload attendance</button>` : '';
    body = c.sess.length? `<div class="card"><div class="card-h"><h2 class="h3">Attendance by session</h2><div class="toolbar">${db.demo?`<button class="btn sm" data-act="upload">${ic('upload')}Bulk upload</button>`:''}${mk}</div></div>
    <div class="tbl-wrap"><table class="heat"><caption class="sr-only">Attendance for ${esc(c.code)}, one column per session</caption><thead><tr><th scope="col">Student</th>${c.sess.map(x=>`<th scope="col" title="${fmt(x.date)}"><span aria-hidden="true">S${x.n}</span><span class="sr-only">Session ${x.n}, ${fmt(x.date)}</span></th>`).join('')}<th class="r" scope="col">Total</th></tr></thead><tbody>
    ${c.students.map(s=>`<tr class="click" data-act="student" data-id="${s.id}"><th scope="row" style="white-space:nowrap;font-weight:400">${esc(s.name)}</th>${c.sess.map((x,i)=>{const v=s.attRec[i];return v?`<td><span class="hcell" style="background:${ATT_C[v]}" title="${esc(s.name)}, S${i+1} ${fmt(x.date)}: ${ATT_L[v]}"><span aria-hidden="true">${v}</span><span class="sr-only">${ATT_L[v]}</span></span></td>`:`<td><span class="demo-note" title="Not marked">–</span><span class="sr-only">Not marked</span></td>`}).join('')}<td class="r num" style="color:${pctCol(s.att)}"><b>${pctTxt(s.att)}</b></td></tr>`).join('')}
    </tbody></table></div><div class="legend" style="padding:0 18px 14px">${Object.keys(ATT_C).map(k=>`<span><i style="background:${ATT_C[k]}"></i>${ATT_L[k]}</span>`).join('')}</div></div>` : `<div class="card"><div class="empty">No attendance yet. ${canMarkAtt(c)?'Mark the first session by hand, or upload a sheet.':'The programme manager marks it after each session.'}${mk?`<div style="margin-top:12px">${mk}</div>`:''}</div></div>`; }
  if (tab==='analytics') body = c.sess.length? `<div class="grid g4">
      <div class="card stat"><span class="lbl">Average attendance</span><span class="val num" style="color:${pctCol(st.att)}">${pctTxt(st.att)}</span><span class="sub">Across ${c.sess.length} session${c.sess.length===1?'':'s'}</span></div>
      <div class="card stat"><span class="lbl">Submission rate</span><span class="val num">${st.sub}%</span><span class="sub">${c.asg.length} assignments</span></div>
      <div class="card stat"><span class="lbl">Average score</span><span class="val num">${st.score}%</span><span class="sub">Of maximum marks</span></div>
      <div class="card stat ${st.risk?'alert':''}"><span class="lbl">At-risk students</span><span class="val num">${st.risk}</span><span class="sub">Below 75% attendance</span></div></div>
    <div class="grid g21"><div class="card"><div class="card-h"><h2 class="h3">Attendance per session</h2><small>Share of students present or late</small></div><div class="card-b">${trendChart(c)}</div></div>
      <div class="card"><div class="card-h"><h2 class="h3">Score distribution</h2><small>Students by average score</small></div><div class="card-b">${histChart(c)}</div></div></div>
    <div class="card"><div class="card-h"><h2 class="h3">Students to watch</h2><small>Attendance below 75% or 2+ missing assignments</small></div><div class="list">${c.students.filter(s=>s.att<75||s.subs.filter(x=>x.st==='Missing').length>=2).map(s=>`<div class="item click" data-act="student" data-id="${s.id}" style="cursor:pointer"><span class="sev" style="background:var(--bad)"></span><div class="main-t"><b>${esc(s.name)}</b><div class="meta"><span>Attendance ${s.att}%</span><span>${s.subs.filter(x=>x.st==='Missing').length} missing</span><span>Last 1:1 ${s.last?fmt(s.last):'not this month'}</span></div></div><span class="btn sm">View</span></div>`).join('')||'<div class="empty">No students at risk</div>'}</div></div>` : `<div class="card"><div class="empty">Analytics appear once ${c.code} starts.</div></div>`;
  return `<div class="page-head"><div><button class="btn ghost sm" data-act="cback" style="padding-left:0">← All cohorts</button><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><h1>${c.code}</h1>${statusTagC(c)}</div><p>${c.prog} · ${c.size} students · ${esc(UU(c.pm).name)}</p>${c.status==='Running'?kpiFeeds([4,7,8,12],'This cohort feeds'):''}</div>${db.demo?`<button class="btn" data-act="upload">${ic('upload')}Bulk upload</button>`:canMarkAtt(c)?`<div class="toolbar"><button class="btn" data-act="stuadd" data-id="${esc(c.code)}">${ic('plus')}Add students</button><button class="btn" data-act="attmark" data-id="${esc(c.code)}">${ic('check')}Mark attendance</button></div>`:''}</div>
  <div class="seg">${tabs.map(([k,l])=>`<button class="${tab===k?'on':''}" data-act="ctab" data-v="${k}">${l}</button>`).join('')}</div>${body}`;
}

function trendChart(c){
  const w=560,h=220,l=40,r=16,t=12,b=30, n=c.sess.length;
  const vals=c.sess.map((_,i)=>{const rec=c.students.map(s=>s.attRec[i]).filter(v=>v&&v!=='E');return rec.length?Math.round(rec.filter(v=>v!=='A').length/rec.length*100):0;});
  const X=i=>l+(n===1?0:i*(w-l-r)/(n-1)), Y=v=>t+(h-t-b)*(1-(v-40)/60);
  const d=vals.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join('');
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;display:block" role="img" aria-label="Attendance per session">
    ${[40,60,80,100].map(g=>`<line x1="${l}" x2="${w-r}" y1="${Y(g)}" y2="${Y(g)}" stroke="var(--line)"/><text x="${l-8}" y="${Y(g)+4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${g}%</text>`).join('')}
    <line x1="${l}" x2="${w-r}" y1="${Y(75)}" y2="${Y(75)}" stroke="var(--bad)" stroke-dasharray="4 4" opacity=".6"/><text x="${l+6}" y="${Y(75)+14}" font-size="10.5" fill="var(--bad)">75% threshold</text>
    <path d="${d}L${X(n-1)} ${Y(40)}L${X(0)} ${Y(40)}Z" fill="var(--accent)" opacity=".1"/><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2.2"/>
    ${vals.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="${i===n-1?4.5:3}" fill="${i===n-1?'var(--accent)':'var(--surface)'}" stroke="var(--accent)" stroke-width="2"><title>S${i+1}, ${fmt(c.sess[i].date)}: ${v}%</title></circle><text x="${X(i)}" y="${h-10}" text-anchor="middle" font-size="11" fill="var(--ink-3)">S${i+1}</text>`).join('')}
    <text x="${X(n-1)}" y="${Y(vals[n-1])-10}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)">${vals[n-1]}%</text>
  </svg>`;
}
function histChart(c){
  const bins=[['<50',0,50],['50s',50,60],['60s',60,70],['70s',70,80],['80s',80,90],['90+',90,101]];
  const counts=bins.map(([,a,z])=>c.students.filter(s=>s.avg!=null&&s.avg>=a&&s.avg<z).length);
  const w=300,h=220,b=30,t=16,max=Math.max(...counts,1),bw=(w-20)/bins.length;
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;display:block" role="img" aria-label="Score distribution">
    <line x1="10" x2="${w-10}" y1="${h-b}" y2="${h-b}" stroke="var(--line-2)"/>
    ${counts.map((n,i)=>{const bh=(h-b-t-14)*n/max,x=10+i*bw+6;return `<rect x="${x}" y="${h-b-bh}" width="${bw-12}" height="${bh}" rx="4" fill="${i===0?'var(--bad)':'var(--accent)'}" opacity="${i===0?1:.85}"/>${n?`<text x="${x+(bw-12)/2}" y="${h-b-bh-5}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)">${n}</text>`:''}<text x="${x+(bw-12)/2}" y="${h-10}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${bins[i][0]}</text>`}).join('')}
  </svg>`;
}

function drawerStudent(s){
  const c = COHORTS.find(x=>x.code===s.cohort), st = cohortStats(c);
  const sub = s.subs.filter(x=>x.st!=='Missing').length;
  const risk = s.att!=null && s.att<75;
  const avgFor = i => { const sc=c.students.map(x=>x.subs[i]).filter(x=>x.score!=null); return sc.length? sc.reduce((a,x)=>a+x.score,0)/sc.length : 0; };
  const w=460, rowH=34, l=150, X=v=>l+(w-l-36)*v/20, h=c.asg.length*rowH+24;
  const asgChart = c.asg.length? `<svg viewBox="0 0 ${w} ${h}" style="width:100%;display:block" role="img" aria-label="Assignment scores against cohort average">${c.asg.map((a,i)=>{const y=8+i*rowH,sc=s.subs[i],ca=avgFor(i);return `<text x="0" y="${y+14}" font-size="12" fill="var(--ink)">${esc(a.title.length>22?a.title.slice(0,21)+'…':a.title)}</text><rect x="${l}" y="${y+4}" width="${X(20)-l}" height="14" rx="4" fill="var(--surface-2)"/>${sc.score!=null?`<rect x="${l}" y="${y+4}" width="${X(sc.score)-l}" height="14" rx="4" fill="${sc.st==='Late'?'var(--warn)':'var(--accent)'}"/><text x="${X(20)+6}" y="${y+15}" font-size="12" font-weight="600" fill="var(--ink)">${sc.score}</text>`:`<text x="${l+8}" y="${y+15}" font-size="11.5" font-weight="600" fill="var(--bad)">Missing</text>`}<line x1="${X(ca)}" x2="${X(ca)}" y1="${y}" y2="${y+22}" stroke="var(--ink)" stroke-width="2"/>`}).join('')}</svg><div class="legend"><span><i style="background:var(--accent)"></i>On time</span><span><i style="background:var(--warn)"></i>Late</span><span><i style="background:var(--ink);width:2px"></i>Cohort average</span><span>Scores out of 20</span></div>`:'<div class="demo-note">No assignments yet.</div>';
  return `<div class="scrim" data-act="close"><div class="drawer" role="dialog" aria-label="Student profile" data-stop>
    <div class="drawer-h"><div style="flex:1"><div class="mono" style="color:var(--ink-3)">${s.id} · ${c.prog} · ${c.code}</div><h2>${esc(s.name)}</h2>${risk?'<span class="tag t-bad" style="margin-top:6px">At risk: attendance below 75%</span>':''}</div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div>
    <div class="drawer-b">
      <div class="grid g2" style="gap:10px">
        <div class="card stat"><span class="lbl">Attendance</span><span class="val num" style="color:${pctCol(s.att)}">${s.att==null?'—':s.att+'%'}</span><span class="sub">Cohort ${st.att??'—'}%</span></div>
        <div class="card stat"><span class="lbl">Avg score</span><span class="val num">${s.avg==null?'—':s.avg+'%'}</span><span class="sub">Cohort ${st.score??'—'}%</span></div>
        <div class="card stat"><span class="lbl">Submitted</span><span class="val num">${s.subs.length?sub+' / '+s.subs.length:'—'}</span><span class="sub">${s.subs.filter(x=>x.st==='Late').length} late</span></div>
        <div class="card stat"><span class="lbl">Last one-to-one</span><span class="val num" style="font-size:24px">${s.last?fmt(s.last):'Pending'}</span><span class="sub">${s.last?'This month':'Due by 30 Oct'}</span></div>
      </div>
      <div><div class="eyebrow" style="margin-bottom:10px">Attendance by session</div>${s.attRec.some(Boolean)?`<div class="strip">${s.attRec.map((v,i)=>v?`<div><span class="hcell lg" style="background:${ATT_C[v]}" title="${ATT_L[v]}"><span aria-hidden="true">${v}</span><span class="sr-only">Session ${i+1}: ${ATT_L[v]}</span></span><small aria-hidden="true">S${i+1}</small></div>`:`<div><span class="hcell lg" style="background:var(--surface-2);color:var(--ink-3)"><span aria-hidden="true">–</span><span class="sr-only">Session ${i+1}: not marked</span></span><small aria-hidden="true">S${i+1}</small></div>`).join('')}</div>`:'<div class="demo-note">No attendance marked yet.</div>'}</div>
      <div><div class="eyebrow" style="margin-bottom:10px">Assignment scores vs cohort average</div>${asgChart}</div>
      <div><div class="eyebrow" style="margin-bottom:10px">One-to-ones</div><div class="grid" style="gap:10px">${(s.last?[[s.last,'Monthly check-in logged']]:[]).concat(s.ones).map(([d,t])=>`<div class="comment">${av(c.pm)}<div><b>${esc(UU(c.pm).name)}</b> <small>${fmt(d)}</small><p>${esc(t)}</p></div></div>`).join('')||'<div class="demo-note">None yet.</div>'}</div></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button class="btn" data-act="toast" data-t="Student report exported (preview)">Export report</button><button class="btn primary" data-act="modal" data-m="oneone" data-id="${s.id}">${ic('chat')}Log 1:1</button></div>
    </div></div></div>`;
}

function uploadModal(){
  const u = S.up, vis = visibleCohorts().filter(c=>c.status==='Running'||u.type==='students');
  const c = COHORTS.find(x=>x.code===u.cohort) || vis[0];
  const types = {students:['Students','Student ID, name, email, phone, company'],attendance:['Attendance','Student ID, session number, status (P, L, A, E)'],scores:['Assignment scores','Student ID, assignment number, score, submitted on']};
  let body;
  if (u.step===1){
    body = `<div class="field"><label for="up-type">What are you uploading?</label><select id="up-type">${Object.entries(types).map(([k,[l]])=>`<option value="${k}" ${u.type===k?'selected':''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label for="up-cohort">Cohort</label><select id="up-cohort">${visibleCohorts().map(x=>`<option value="${x.code}" ${x.code===c.code?'selected':''}>${x.prog} · ${x.code}</option>`).join('')}</select></div>
      <div class="drop"><div style="font-weight:600">Drop an Excel or CSV file here</div><div class="demo-note">Columns: ${types[u.type][1]}</div><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><label class="btn sm" for="up-file">Choose file</label><input id="up-file" type="file" accept=".csv,.xlsx" hidden><button class="btn sm ghost" data-act="upsample">Use sample file</button></div></div>
      <button class="btn ghost sm" style="align-self:flex-start;padding-left:0" data-act="toast" data-t="Template downloads here (preview)">Download the ${types[u.type][0].toLowerCase()} template</button>`;
  } else {
    const st = c.students, rows = [];
    st.slice(0,5).forEach((s,i)=>rows.push([s.id,s.name,u.type==='attendance'?'S'+(c.sess.length||1):u.type==='scores'?'A'+(c.asg.length||1):'—',u.type==='attendance'?['P','P','L','P','A'][i]:u.type==='scores'?String(12+i):s.name.split(' ')[0].toLowerCase()+'@example.com',i===1?'upd':'new','']));
    rows.push([c.code+'-099','Unknown','—','P','err','Student ID not found in '+c.code]);
    rows.push([st[6]?.id||c.code+'-007',st[6]?.name||'—',u.type==='attendance'?'S14':'A9','—','err',u.type==='attendance'?'Session S14 does not exist yet':'Assignment 9 does not exist']);
    const total = st.length + 2, errs = 2, upd = 3;
    body = `<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="tag t-good">${total-errs-upd} new</span><span class="tag t-info">${upd} updates</span><span class="tag t-bad">${errs} errors</span><span class="demo-note">${esc(u.file||'OPM_attendance_oct.xlsx')} · ${total} rows</span></div>
      <div class="card" style="box-shadow:none"><div class="tbl-wrap"><table><thead><tr><th>Row</th><th>Student ID</th><th>Name</th><th>${u.type==='attendance'?'Session':u.type==='scores'?'Assignment':'Field'}</th><th>Value</th><th>Result</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td class="num">${i+2}</td><td class="mono">${r[0]}</td><td>${esc(r[1])}</td><td>${r[2]}</td><td>${esc(r[3])}</td><td>${r[4]==='new'?'<span class="tag t-good">New</span>':r[4]==='upd'?'<span class="tag t-info">Update</span>':`<span class="tag t-bad">Error</span><div class="demo-note">${esc(r[5])}</div>`}</td></tr>`).join('')}</tbody></table></div></div>
      <p class="demo-note" style="margin:0">Rows with errors are skipped. Fix them in the file and upload again; matching student IDs update instead of duplicating. You can undo this import for 24 hours.</p>`;
  }
  const foot = u.step===1 ? `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="upsample">Check file</button>` : `<button class="btn" data-act="upback">Back</button><button class="btn primary" data-act="upcommit">Import ${c.students.length} valid rows</button>`;
  return `<div class="scrim center" data-act="close"><div class="modal wide" role="dialog" aria-label="Bulk upload" data-stop><div class="drawer-h"><div style="flex:1"><div class="eyebrow">Step ${u.step} of 2 · ${u.step===1?'Choose file':'Check before saving'}</div><h2>Bulk upload</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b">${body}</div><div class="modal-f">${foot}</div></div></div>`;
}

/* ---------------- add cohort ---------------- */
let coStudents = null, coFileName = '';
function cohortForm(){
  coStudents = null; coFileName = '';
  const people = Object.entries(USERS).sort((a,b)=>(a[1].kind==='pm'?0:1)-(b[1].kind==='pm'?0:1) || a[1].name.localeCompare(b[1].name));
  const progs = [...new Set(['OPM','EBAP',...COHORTS.map(c=>c.prog)])];
  return `<div class="grid coform" style="gap:12px">
    <div class="grid g2"><div class="field"><label for="co-n">Cohort name</label><input id="co-n" placeholder="e.g. OPMC4" maxlength="40"></div>
    <div class="field"><label for="co-p">Programme</label><select id="co-p">${progs.map(p=>`<option>${esc(p)}</option>`).join('')}</select></div></div>
    <div class="field"><label for="co-pm">Programme manager</label><select id="co-pm"><option value="">Choose a person</option>${people.map(([k,u])=>`<option value="${k}">${esc(u.name)}${u.role?' · '+esc(u.role):''}</option>`).join('')}</select></div>
    <div class="grid g2"><div class="field"><label for="co-s">Start date</label><input id="co-s" type="date" value="${TODAY_ISO}"></div><div class="field"><label for="co-e">End date</label><input id="co-e" type="date"></div></div>
    <div class="field"><label for="co-f">Format <span style="font-weight:400;color:var(--ink-3)">(optional)</span></label><input id="co-f" placeholder="e.g. Hybrid: monthly residency and weekly online classes"></div>
    <div class="drop" id="co-drop"><div style="font-weight:600" id="co-fname">Upload the students in this cohort</div><div class="demo-note">Excel or CSV with a <b>Name</b> column. Email, Phone and Company are optional.</div><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><label class="btn sm" for="co-file">${ic('upload')}Choose file</label><button class="btn ghost sm" type="button" data-act="cotemplate">${ic('download')}Download template</button></div><input id="co-file" type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" hidden></div>
    <div id="co-prev" class="demo-note">You can also add the cohort now and upload students later.</div>
    <span class="sc-err" id="co-err"></span>
  </div>`;
}
// Reads an Excel/CSV list of students: a Name column, and optional Email, Phone and Company columns.
async function readStudentFile(file){
  const X = await import('xlsx'), wb = X.read(await file.arrayBuffer(), {type:'array', raw:/\.csv$/i.test(file.name)});
  const raw = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1, defval:'', blankrows:false});
  if (!raw.length) throw new Error('The file is empty.');
  const head = raw[0].map(h=>String(h).trim().toLowerCase());
  const col = (...names) => head.findIndex(h => names.some(n => h===n || h.includes(n)));
  let iName = col('student name','full name','name');
  const hasHeader = iName >= 0 || head.some(h=>/email|phone|company|mobile/.test(h));
  if (iName < 0) iName = 0;
  const iEmail = col('email','e-mail','mail'), iPhone = col('phone','mobile','contact'), iCo = col('company','organisation','organization','business');
  const body = hasHeader ? raw.slice(1) : raw, skipped = [], list = [];
  body.forEach((r,i)=>{ const name = String(r[iName]||'').trim(); if (!name){ if (r.some(x=>String(x).trim())) skipped.push(i+(hasHeader?2:1)); return; }
    list.push({name, email: iEmail>=0?String(r[iEmail]||'').trim():'', phone: iPhone>=0?String(r[iPhone]||'').trim():'', company: iCo>=0?String(r[iCo]||'').trim():''}); });
  if (!list.length) throw new Error('No student names found. Put the names in a column called "Name".');
  return {list, skipped};
}

/* ---------------- add students to an existing cohort: one by hand, or a list from a file ---------------- */
let STU = null; // {code, rows:[{name,email,phone,company,st:'new'|'dup'}], note}
function stuOpen(code){ const list = markableCohorts(); if (!list.length){ toast('Add a cohort first'); return; } STU = {code: list.some(c=>c.code===code) ? code : (S.cohort && list.some(c=>c.code===S.cohort) ? S.cohort : list[0].code), rows:[], note:''}; S.modal = ['stuadd','']; }
function stuCheck(){ const c = COHORTS.find(x=>x.code===STU.code); const em = new Set(c.students.map(s=>(s.email||'').toLowerCase()).filter(Boolean)), nm = new Set(c.students.map(s=>s.name.toLowerCase()));
  STU.rows.forEach(r=>{ const e=(r.email||'').toLowerCase(), n=r.name.toLowerCase(); if ((e && em.has(e)) || (!e && nm.has(n))) r.st='dup'; else { r.st='new'; if (e) em.add(e); nm.add(n); } }); }
function stuForm(){
  const list = markableCohorts(), R = STU.rows, nNew = R.filter(r=>r.st==='new').length;
  return `<div class="grid stuf" style="gap:14px">
    <div class="field"><label for="su-c">Cohort</label><select id="su-c">${list.map(x=>`<option value="${esc(x.code)}" ${x.code===STU.code?'selected':''}>${esc(x.code)} · ${esc(x.prog)} · ${x.students.length} student${x.students.length===1?'':'s'}</option>`).join('')}</select></div>
    <fieldset class="stu-one"><legend><b>Add one student</b></legend>
      <div class="grid g2"><div class="field"><label for="su-n">Full name</label><input id="su-n" autocomplete="off"></div><div class="field"><label for="su-e">Email <span style="font-weight:400;color:var(--ink-3)">(optional)</span></label><input id="su-e" type="email" autocomplete="off"></div></div>
      <div class="grid g2"><div class="field"><label for="su-p">Phone <span style="font-weight:400;color:var(--ink-3)">(optional)</span></label><input id="su-p" autocomplete="off"></div><div class="field"><label for="su-co">Company <span style="font-weight:400;color:var(--ink-3)">(optional)</span></label><input id="su-co" autocomplete="off"></div></div>
      <div><button class="btn sm" type="button" data-act="stuone">${ic('plus')}Add to the list below</button></div>
    </fieldset>
    <div class="att-up"><div><b>Or upload a list</b><span class="demo-note" style="display:block">Excel or CSV with a Name column. Email, Phone and Company are optional.</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn sm" for="su-file">${ic('upload')}Choose file</label><input id="su-file" type="file" accept=".xlsx,.xls,.csv" class="sr-only"><button class="btn sm" type="button" data-act="cotemplate">${ic('download')}Template</button></div></div>
    <div id="su-note" tabindex="-1" role="status" class="demo-note" style="margin:0">${esc(STU.note)}</div>
    ${R.length?`<div class="card" style="box-shadow:none"><div class="tbl-wrap"><table><caption class="sr-only">Students to add</caption><thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Phone</th><th scope="col">Company</th><th scope="col">Result</th><th><span class="sr-only">Remove</span></th></tr></thead><tbody>${R.map((r,i)=>`<tr><td>${esc(r.name)}</td><td style="font-size:13px">${esc(r.email||'—')}</td><td style="font-size:13px">${esc(r.phone||'—')}</td><td style="font-size:13px">${esc(r.company||'—')}</td><td>${r.st==='new'?'<span class="tag t-good">Will be added</span>':'<span class="tag">Already in cohort, skipped</span>'}</td><td class="r"><button class="btn sm ghost" type="button" data-act="sturm" data-n="${i}" aria-label="Remove ${esc(r.name)} from the list">${ic('x')}</button></td></tr>`).join('')}</tbody></table></div></div>`:''}
    <span class="sc-err" id="su-err"></span>
  </div>`;
}
async function stuParse(file){
  STU.note = `Reading ${file.name}…`;
  try { const {list, skipped} = await readStudentFile(file); STU.rows.push(...list); stuCheck();
    const n = STU.rows.filter(r=>r.st==='new').length, d = STU.rows.filter(r=>r.st==='dup').length;
    STU.note = `${file.name}: ${list.length} student${list.length===1?'':'s'} read. The list now has ${n} to add` + (d?` and ${d} already in the cohort`:'') + (skipped.length?`. Skipped ${skipped.length} row${skipped.length===1?'':'s'} without a name`:'') + '. Check the list, then save.';
  } catch(e){ STU.note = `Could not read ${file.name}. ${e.message||''}`; }
  render(); const n = document.getElementById('su-note'); if (n) n.focus();
}
function stuOne(){
  const g = id=>document.getElementById(id), name = g('su-n').value.trim(), email = g('su-e').value.trim();
  if (!name){ g('su-err').textContent = 'Add the student\'s full name.'; g('su-n').focus(); return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ g('su-err').textContent = 'That email does not look right.'; g('su-e').focus(); return; }
  STU.rows.push({name, email, phone:g('su-p').value.trim(), company:g('su-co').value.trim()}); stuCheck();
  const r = STU.rows[STU.rows.length-1];
  STU.note = r.st==='new' ? `${name} is on the list. Add another, or save.` : `${name} is already in this cohort, so they will be skipped.`;
  render(); const x = document.getElementById('su-n'); if (x) x.focus(); announce(STU.note);
}
function stuSave(){
  const c = COHORTS.find(x=>x.code===STU.code), add = STU.rows.filter(r=>r.st==='new'), err = document.getElementById('su-err');
  const g = id=>document.getElementById(id);
  if (!add.length && g('su-n') && g('su-n').value.trim()){ stuOne(); return null; } // typed one name and pressed save
  if (!add.length){ err.textContent = STU.rows.length ? 'Everyone on the list is already in this cohort.' : 'Add a student by hand, or upload a list.'; return null; }
  let next = c.students.reduce((m,s)=>{ const k = +String(s.id).split('-').pop(); return isFinite(k) && k>m ? k : m; }, 0);
  add.forEach(r=>{ next++; c.students.push({id: c.code+'-'+String(next).padStart(3,'0'), name:r.name, email:r.email, phone:r.phone, company:r.company, cohort:c.code, pm:c.pm, att:null, attRec:c.sess.map(()=>null), subs:c.asg.map(()=>({st:'Missing',score:null})), avg:null, last:null, ones:[]}); });
  c.size = c.students.length;
  STUDENTS = COHORTS.filter(x=>x.status==='Running').flatMap(x=>x.students||[]);
  AUDIT.unshift([nowStamp(), S.user, 'added students', `${c.code} · ${add.length} student${add.length===1?'':'s'}`]);
  STU = null;
  return {c, n:add.length};
}
document.addEventListener('change', e=>{
  if (!STU || !e.target.closest || !e.target.closest('.stuf')) return;
  if (e.target.id==='su-c'){ STU.code = e.target.value; stuCheck(); render(); const x=document.getElementById('su-c'); if (x) x.focus(); }
  if (e.target.id==='su-file' && e.target.files[0]) stuParse(e.target.files[0]);
});
document.addEventListener('keydown', e=>{ if (STU && e.key==='Enter' && e.target.closest && e.target.closest('.stu-one') && e.target.tagName==='INPUT'){ e.preventDefault(); stuOne(); } });

async function cohortParse(file){
  const g = id=>document.getElementById(id), prev = g('co-prev');
  coStudents = null; coFileName = file.name;
  g('co-fname').textContent = file.name + ' · reading…';
  try {
    const {list, skipped} = await readStudentFile(file);
    coStudents = list;
    g('co-fname').textContent = file.name + ' · ' + list.length + ' student' + (list.length===1?'':'s');
    g('co-drop').style.borderColor = 'var(--good)';
    prev.innerHTML = `<b style="color:var(--ink)">${list.length} student${list.length===1?'':'s'} ready to add:</b> ${list.slice(0,6).map(x=>esc(x.name)).join(', ')}${list.length>6?` and ${list.length-6} more`:''}${skipped.length?`<br>Skipped ${skipped.length} row${skipped.length===1?'':'s'} with no name (row ${skipped.slice(0,5).join(', ')}${skipped.length>5?'…':''}).`:''}`;
  } catch(e){
    coStudents = null; g('co-fname').textContent = 'Upload the students in this cohort'; g('co-drop').style.borderColor = 'var(--bad)';
    prev.innerHTML = `<span class="sc-err">Could not read ${esc(file.name)}: ${esc(e && e.message || 'unknown error')}</span>`;
  }
}
document.addEventListener('change', e=>{ if (e.target.id==='mb-k'){ const h=document.getElementById('mb-h'); if (h){ if (e.target.value==='owner'){ if (!h.disabled) h.dataset.prev = h.checked; h.checked = true; h.disabled = true; } else if (h.disabled){ h.disabled = false; h.checked = h.dataset.prev === 'true'; } } } });
document.addEventListener('change', e=>{ if (e.target.id==='co-file' && e.target.files[0]) cohortParse(e.target.files[0]); });
document.addEventListener('input', e=>{ if (e.target.closest && e.target.closest('.coform')){ const x=document.getElementById('co-err'); if (x) x.textContent=''; } });
function cohortSave(){
  const g = id=>document.getElementById(id), val = id=>g(id).value.trim();
  const code = val('co-n').replace(/\s+/g,' '), pm = val('co-pm'), start = val('co-s'), end = val('co-e');
  const err = !code ? 'Give the cohort a name.' : COHORTS.some(c=>c.code.toLowerCase()===code.toLowerCase()) ? `A cohort called ${code} already exists.` : !pm ? 'Choose the programme manager.' : !start ? 'Add the start date.' : (end && end < start) ? 'The end date is before the start date.' : (g('co-file').files[0] && !coStudents) ? 'Fix the student file, or remove it, before saving.' : '';
  if (err){ g('co-err').textContent = err; return null; }
  const students = (coStudents||[]).map((x,i)=>({id: code+'-'+String(i+1).padStart(3,'0'), name:x.name, email:x.email, phone:x.phone, company:x.company, cohort:code, pm, att:null, attRec:[], subs:[], avg:null, last:null, ones:[]}));
  const c = {code, prog: val('co-p'), status: start > TODAY_ISO ? 'In preparation' : 'Running', pm, start, end: end || start, format: val('co-f'), size: students.length, sessions:0, faculty:[], keydates:[], sess:[], asg:[], students};
  COHORTS.push(c);
  STUDENTS = COHORTS.filter(x=>x.status==='Running').flatMap(x=>x.students||[]);
  AUDIT.unshift([nowStamp(), S.user, 'added cohort', `${code} · ${students.length} student${students.length===1?'':'s'}`]);
  coStudents = null;
  return c;
}

/* ---------------- drawers & modals ---------------- */
function drawerTask(t){
  const canEdit = t.owner===S.user || t.by===S.user || canConf();
  return `<div class="scrim" data-act="close"><div class="drawer" role="dialog" aria-label="Task detail" data-stop>
    <div class="drawer-h"><div style="flex:1"><div class="mono" style="color:var(--ink-3)">${t.id} · ${esc(t.cat)}</div><h2>${esc(t.title)}</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div>
    <div class="drawer-b">
      <dl class="kv">
        <dt>Status</dt><dd>${canEdit?`<select id="st-sel" class="select" aria-label="Status" data-id="${t.id}">${[['todo','Not started'],['doing','In progress'],['blocked','Blocked'],['done','Done']].map(([k,l])=>`<option value="${k}" ${t.status===k?'selected':''}>${l}</option>`).join('')}</select> ${isOverdue(t)?'<span class="tag t-bad" style="margin-left:6px">Overdue</span>':''}`:statusTag(t)}</dd>
        <dt>Owner</dt><dd>${who(t.owner)}</dd>
        <dt>Assigned by</dt><dd>${who(t.by)}</dd>
        <dt>Due</dt><dd class="num">${fmtLong(t.due)}</dd>
        <dt>Frequency</dt><dd>${esc(t.freq)}</dd>
        <dt>Priority</dt><dd><span class="tag ${t.pri==='High'?'t-bad':t.pri==='Medium'?'t-warn':''}">${t.pri}</span></dd>
        <dt>Record needed</dt><dd>${esc(t.record)}</dd>
      </dl>
      <div><div class="eyebrow" style="margin-bottom:10px">Updates</div>
        <div class="grid" style="gap:14px">${t.comments.map(c=>`<div class="comment">${av(c.u)}<div><b>${esc(UU(c.u).name)}</b> <small>${esc(c.w)}</small><p>${esc(c.t)}</p></div></div>`).join('')||'<div class="demo-note">No updates yet.</div>'}</div>
      </div>
      <div class="field"><label for="cmt">Add an update</label><textarea id="cmt" placeholder="What changed? Use @ to mention someone."></textarea></div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" data-act="toast" data-t="Attach a file (preview)">Attach file</button><button class="btn primary" data-act="comment" data-id="${t.id}">Post update</button></div>
    </div></div></div>`;
}
function drawerSession(s){
  const f = s.fac?FACULTY[s.fac]:null;
  const mine = s.pm===S.user || isMgr();
  return `<div class="scrim" data-act="close"><div class="drawer" role="dialog" aria-label="Session detail" data-stop>
    <div class="drawer-h"><div style="flex:1"><div class="mono" style="color:var(--ink-3)">${s.id} · ${esc(s.prog)}</div><h2>${esc(s.title)}</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div>
    <div class="drawer-b">
      <dl class="kv"><dt>When</dt><dd class="num">${fmtLong(s.date)}, ${s.time}</dd><dt>Where</dt><dd>${s.mode} · ${s.zoom?`<a href="#" class="zlink">${esc(s.zoom.replace('https://','').split('?')[0])}</a>`:esc(s.venue)}${s.mode==='Hybrid'?` · ${esc(s.venue)}`:''}</dd><dt>Google Calendar</dt><dd>${s.cal?`<span class="tag t-good">Invite sent</span> <span class="demo-note">${s.zoom?'Zoom link in the invite, no Meet link':'Venue in the invite'}</span>`:'<span class="tag">Not on calendar</span>'}</dd><dt>Cohort</dt><dd>${esc(s.cohort)}</dd><dt>Faculty</dt><dd>${f?esc(f.name):'<span class="tag t-bad">Not assigned</span>'}</dd><dt>PM</dt><dd>${who(s.pm)}</dd></dl>
      <div><div class="eyebrow" style="margin-bottom:10px">Readiness checklist</div><div class="checklist">${CHECK_ITEMS.map((c,i)=>`<label><input type="checkbox" data-act="check" data-id="${s.id}" data-i="${i}" ${s.check[i]?'checked':''} ${mine?'':'disabled'}> ${c}</label>`).join('')}</div></div>
      <div><div class="eyebrow" style="margin-bottom:10px">Class notes</div>${s.notes?'<div class="card card-b" style="font-size:13px">Discussion centred on choosing successors on merit. Two families shared their transition plans. Follow-up: share the governance template with the cohort.</div>':dayDiff(s.date)<0?`<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="tag t-bad">Missing, due ${fmt(addWorkdays(s.date,2))}</span><button class="btn sm" data-act="modal" data-m="notes" data-id="${s.id}">Add notes</button></div>`:'<div class="demo-note">Notes open after the session.</div>'}</div>
      <div><div class="eyebrow" style="margin-bottom:10px">Payment</div><dl class="kv"><dt>Invoice</dt><dd>${payTag(s.pay.inv)}</dd><dt>Payment</dt><dd>${payTag(s.pay.paid)}</dd><dt>TDS</dt><dd>${payTag(s.pay.tds)}</dd><dt>Amount</dt><dd>${f&&f.senior?(canConf()?`<span class="tag t-warn">${ic('lock')} See Honorariums</span>`:`<span class="tag">${ic('lock')} Confidential</span>`):'Standard rate'}</dd></dl></div>
    </div></div></div>`;
}
// Class scheduling: PMs create the class once; Optimus writes the Google Calendar event with the Zoom link (online), the venue (offline) or both (hybrid). Google Meet is never added.
SESSIONS.forEach((s,i)=>{ if (s.mode==='Online'){ s.zoom='https://zoom.us/j/8'+String(412093310+i*7713).slice(0,9)+'?pwd=Rv'+(i+3)+'x'; } s.cal = dayDiff(s.date)>-30; });
function schedForm(){
  const coh = COHORTS.filter(c=>isMgr()||c.pm===S.user);
  const facs = activeFac();
  return `<div class="sched">
  <div class="grid" style="gap:14px">
    <div class="grid g2"><div class="field"><label for="sc-c">Cohort</label><select id="sc-c">${coh.map(c=>`<option value="${c.code}">${c.code} · ${c.prog}</option>`).join('')}<option value="All OPM cohorts">All OPM cohorts</option><option value="All EBAP cohorts">All EBAP cohorts</option></select></div>
    <div class="field"><label for="sc-f">Faculty</label><select id="sc-f"><option value="">To be confirmed</option>${facs.map(([k,f])=>`<option value="${k}">${esc(f.name)}</option>`).join('')}</select></div></div>
    <div class="field"><label for="sc-t">Class title</label><input id="sc-t" value="Family Business Valuation"></div>
    <div class="grid g3 sc-when"><div class="field"><label for="sc-d">Date</label><input id="sc-d" type="date" value="2026-10-29"></div><div class="field"><label for="sc-s">Start</label><input id="sc-s" type="time" value="11:00"></div><div class="field"><label for="sc-u">Duration</label><select id="sc-u"><option value="60">1 hour</option><option value="90" selected>1.5 hours</option><option value="120">2 hours</option><option value="180">3 hours</option><option value="360">Full day</option></select></div></div>
    <div class="field"><label>Class mode</label><div class="seg mode-seg">${['Online','Offline','Hybrid'].map((m,i)=>`<label class="${i===0?'on':''}"><input type="radio" name="sc-m" value="${m}" ${i===0?'checked':''}>${m}</label>`).join('')}</div></div>
    <div class="field sc-on"><label for="sc-z">Zoom link</label><input id="sc-z" placeholder="https://zoom.us/j/…" value="https://zoom.us/j/84120933107?pwd=OPMval29"><span class="sc-err" id="sc-zerr"></span></div>
    <div class="grid g2 sc-on"><div class="field"><label for="sc-zid">Meeting ID</label><input id="sc-zid" value="841 2093 3107"></div><div class="field"><label for="sc-zp">Passcode</label><input id="sc-zp" value="Rev2026"></div></div>
    <div class="field sc-off" hidden><label for="sc-v">Venue</label><input id="sc-v" value="Gurugram campus, Room 2.4"></div>
    <div class="field"><label>Send the invite to</label><div class="checklist">${[['stu','Cohort students',1],['fac','Faculty',1],['pm','Programme Manager',1],['mu',"Masters' Union ops",1],['rg','Rajiv (optional)',0]].map(([k,l,on])=>`<label><input type="checkbox" class="sc-inv" value="${k}" ${on?'checked':''}> ${l}</label>`).join('')}</div></div>
  </div>
  <div class="cal-prev" id="sc-prev"></div>
  </div>`;
}
function schedRead(){
  const g=id=>document.getElementById(id), m=(document.querySelector('input[name="sc-m"]:checked')||{}).value||'Online';
  const c=g('sc-c').value, co=COHORTS.find(x=>x.code===c);
  const inv=[...document.querySelectorAll('.sc-inv:checked')].map(x=>x.value);
  const n = (inv.includes('stu')?(co?co.size:24):0)+(inv.includes('fac')&&g('sc-f').value?1:0)+(inv.includes('pm')?1:0)+(inv.includes('mu')?2:0)+(inv.includes('rg')?1:0);
  return {cohort:c, prog:co?co.prog:(c.includes('EBAP')?'EBAP':'OPM'), fac:g('sc-f').value||null, title:g('sc-t').value.trim()||'Untitled class', date:g('sc-d').value, time:g('sc-s').value, dur:+g('sc-u').value, mode:m, zoom:g('sc-z').value.trim(), zid:g('sc-zid').value, zp:g('sc-zp').value, venue:g('sc-v').value.trim(), inv:n};
}
function schedCheck(d){
  if (d.mode!=='Offline'){
    if (!d.zoom) return 'Add the Zoom link for an online or hybrid class.';
    if (/meet\.google\.com/i.test(d.zoom)) return 'That is a Google Meet link. Classes use Zoom: paste the Zoom link instead.';
    if (!/^https:\/\/([a-z0-9-]+\.)?zoom\.us\//i.test(d.zoom)) return 'This does not look like a Zoom link (it should start with https://zoom.us/).';
  }
  if (d.mode!=='Online' && !d.venue) return 'Add the venue for an offline or hybrid class.';
  return '';
}
function schedPreview(){
  const box=document.getElementById('sc-prev'); if (!box) return;
  const d=schedRead(), err=schedCheck(d);
  document.querySelectorAll('.sched .sc-on').forEach(x=>x.hidden = d.mode==='Offline');
  document.querySelectorAll('.sched .sc-off').forEach(x=>x.hidden = d.mode==='Online');
  document.querySelectorAll('.mode-seg label').forEach(l=>l.classList.toggle('on', l.querySelector('input').checked));
  const ze=document.getElementById('sc-zerr'); if (ze) ze.textContent = d.mode!=='Offline'&&/zoom|meet/i.test(err)?err:'';
  const [h,mi]=(d.time||'11:00').split(':').map(Number), end=h*60+mi+d.dur, endT=`${String(Math.floor(end/60)%24).padStart(2,'0')}:${String(end%60).padStart(2,'0')}`;
  const f=d.fac?FACULTY[d.fac].name:'Faculty TBC';
  const loc = d.mode==='Online'?d.zoom:d.mode==='Offline'?d.venue:`${d.venue} · ${d.zoom}`;
  box.innerHTML = `<div class="eyebrow" style="margin-bottom:8px">Google Calendar preview</div>
  <div class="gcal"><div class="gcal-bar"></div><div class="gcal-b">
    <b class="gcal-t">[${esc(d.cohort)}] ${esc(d.title)}</b>
    <div class="gcal-r">${ic('cal')}<span>${d.date?fmtLong(d.date):'Pick a date'} · ${esc(d.time)} to ${endT} IST</span></div>
    <div class="gcal-r">${ic(d.mode==='Offline'?'pin':'video')}<span class="gcal-loc">${esc(loc||'Not set')}</span></div>
    ${d.mode!=='Offline'?`<div class="gcal-join">Join Zoom meeting</div>`:''}
    <div class="gcal-r">${ic('people')}<span>${d.inv} guests · ${esc(f)}</span></div>
    <div class="gcal-desc">${esc(d.mode)} class for ${esc(d.cohort)}.${d.mode!=='Offline'?`<br>Zoom: ${esc(d.zoom||'—')}<br>Meeting ID ${esc(d.zid)} · Passcode ${esc(d.zp)}`:''}${d.mode!=='Online'?`<br>Venue: ${esc(d.venue||'—')}`:''}<br>Please join 10 minutes early.</div>
    <div class="gcal-r muted">${ic('bell')}<span>Reminders 1 day and 30 minutes before</span></div>
    <div class="gcal-r muted">${ic('x')}<span>No Google Meet link: conferencing is switched off on this event</span></div>
  </div></div>
  ${err?`<div class="sc-warn">${esc(err)}</div>`:`<div class="demo-note" style="margin-top:8px">Saving creates the class in Optimus and this event in the PM's Google Calendar. Rescheduling or cancelling in Optimus updates every guest's invite.</div>`}`;
}
document.addEventListener('input', e=>{ if (e.target.closest && e.target.closest('.sched')) schedPreview(); });
document.addEventListener('change', e=>{ if (e.target.closest && e.target.closest('.sched')) schedPreview(); });
function modal(kind, id){
  if (kind==='invoice') return `<div class="scrim center" data-act="close"><div class="modal xwide" role="dialog" aria-label="Create invoice" data-stop><div class="drawer-h"><div style="flex:1"><div class="eyebrow">Standard Reverentia invoice</div><h2>Create invoice</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b">${invForm()}</div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn" data-act="save" data-m="invoice" data-draft="1">Save as draft</button><button class="btn" data-act="save" data-m="invoice">Create and mark as sent</button><button class="btn primary" data-act="save" data-m="invoice" data-dl="1">${ic('download')}Create and download invoice</button></div></div></div>`;
  if (kind==='member') return `<div class="scrim center" data-act="close"><div class="modal wide" role="dialog" aria-label="${id?'Edit person':'Add person'}" data-stop><div class="drawer-h"><div style="flex:1"><div class="eyebrow">People and access</div><h2>${id?'Edit '+esc(UU(id).name):'Add person'}</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b">${memberForm(id)}</div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="membersave" data-id="${id||''}">${id?'Save changes':'Add person'}</button></div></div></div>`;
  if (kind==='approve'){ const r=REQUESTS.find(x=>x.email===id); if (!r) return ''; return `<div class="scrim center" data-act="close"><div class="modal wide" role="dialog" aria-label="Approve sign-up" data-stop><div class="drawer-h"><div style="flex:1"><div class="eyebrow">Sign-up request</div><h2>Approve ${esc(r.name||r.email)}</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b"><p class="demo-note" style="margin:0">Choose their title and access. Honorariums stay hidden unless you tick the box.</p>${memberForm(null, r)}</div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="membersave" data-id="" data-req="${esc(r.email)}">Approve</button></div></div></div>`; }
  if (kind==='attmark'){ const c=COHORTS.find(x=>x.code===id); if (!c||!ATT) return ''; return `<div class="scrim center" data-act="close"><div class="modal wide" role="dialog" aria-label="Attendance for ${esc(c.code)}" data-stop><div class="drawer-h"><div style="flex:1"><div class="eyebrow">${esc(c.prog)} · ${esc(c.code)}</div><h2>Mark attendance</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b">${attForm(id)}</div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="save" data-m="attmark">Save attendance</button></div></div></div>`; }
  if (kind==='pastsess'){ if (!PSU) return ''; return `<div class="scrim center" data-act="close"><div class="modal wide" role="dialog" aria-label="Upload past sessions" data-stop><div class="drawer-h"><div style="flex:1"><div class="eyebrow">Sessions</div><h2>Upload past sessions</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b">${psForm()}</div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="save" data-m="pastsess">Add sessions</button></div></div></div>`; }
  if (kind==='stuadd'){ if (!STU) return ''; return `<div class="scrim center" data-act="close"><div class="modal wide" role="dialog" aria-label="Add students" data-stop><div class="drawer-h"><div style="flex:1"><div class="eyebrow">Students</div><h2>Add students</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b">${stuForm()}</div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="save" data-m="stuadd">Save students</button></div></div></div>`; }
  if (kind==='memberdel') return `<div class="scrim center" data-act="close"><div class="modal" role="dialog" aria-label="Remove person" data-stop><div class="drawer-h"><h2>Remove ${esc(UU(id).name)}?</h2><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b"><p style="margin:0">They will lose all access to Optimus straight away. Their past tasks, sessions and activity stay on record.</p></div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn primary" style="background:var(--bad);border-color:var(--bad)" data-act="memberdel" data-id="${id}">Remove</button></div></div></div>`;
  if (kind==='cohortadd') return `<div class="scrim center" data-act="close"><div class="modal wide" role="dialog" aria-label="Add cohort" data-stop><div class="drawer-h"><div style="flex:1"><div class="eyebrow">Cohorts</div><h2>Add cohort</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b">${cohortForm()}</div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="save" data-m="cohortadd">Add cohort</button></div></div></div>`;
  if (kind==='facform') return `<div class="scrim center" data-act="close"><div class="modal wide" role="dialog" aria-label="${id?'Edit faculty':'Add faculty'}" data-stop><div class="drawer-h"><div style="flex:1"><div class="eyebrow">Faculty directory</div><h2>${id?'Edit '+esc(FACULTY[id].name):'Add faculty'}</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b">${facForm(id)}</div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="save" data-m="facform" data-id="${id||''}">${id?'Save changes':'Add to directory'}</button></div></div></div>`;
  if (kind==='invrecv') return `<div class="scrim center" data-act="close"><div class="modal wide" role="dialog" aria-label="Attach received invoice" data-stop><div class="drawer-h"><div style="flex:1"><div class="eyebrow">Faculty invoices</div><h2>Attach received invoice</h2></div><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b">${recvForm(id)}</div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="save" data-m="invrecv">Save and send for approval</button></div></div></div>`;
  if (kind==='facdel'){ const f=FACULTY[id]; return `<div class="scrim center" data-act="close"><div class="modal" role="dialog" aria-label="Remove faculty" data-stop><div class="drawer-h"><h2>Remove ${esc(f.name)}?</h2><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b"><p style="margin:0">${esc(f.name)} will no longer appear in the directory or when scheduling classes and creating invoices.</p><p class="demo-note" style="margin:0">Past sessions, invoices and payments keep their name, so records stay complete. This is logged in the audit log.</p></div><div class="modal-f"><button class="btn" data-act="close">Keep</button><button class="btn primary" data-act="save" data-m="facdel" data-id="${id}" style="background:var(--bad);border-color:var(--bad)">Remove from directory</button></div></div></div>`; }
  if (kind==='invpay'){ const v=INVOICES.find(x=>x.id===id); return `<div class="scrim center" data-act="close"><div class="modal" role="dialog" aria-label="Record payment" data-stop><div class="drawer-h"><h2>Record payment</h2><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b">${invPayForm(v)}</div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="save" data-m="invpay" data-id="${v.id}">Save payment</button></div></div></div>`; }
  const pmStud = visibleStudents();
  const facs = activeFac().filter(([,f])=>isMgr()||f.pm===S.user);
  const sessPast = visibleSessions().filter(s=>dayDiff(s.date)<0 && !s.notes);
  const map = {
    oneone:['Log a student one-to-one',`<div class="field"><label for="m-s">Student</label><select id="m-s">${pmStud.map(s=>`<option value="${s.id}" ${s.id===id?'selected':''}>${esc(s.name)} · ${esc(s.cohort)}</option>`).join('')}</select></div><div class="grid g2"><div class="field"><label for="m-d">Date</label><input id="m-d" type="date" value="${TODAY_ISO}"></div><div class="field"><label for="m-mode">Mode</label><select id="m-mode"><option>In person</option><option>Call</option><option>Video</option></select></div></div><div class="field"><label for="m-n">Notes</label><textarea id="m-n" placeholder="What did you discuss? Any follow-up?"></textarea></div>`,'Save 1:1'],
    connect:['Log a faculty connect',`<div class="field"><label for="m-f">Faculty</label><select id="m-f">${facs.map(([k,f])=>`<option value="${k}" ${k===id?'selected':''}>${esc(f.name)}</option>`).join('')}</select></div><div class="grid g2"><div class="field"><label for="m-d2">Date</label><input id="m-d2" type="date" value="${TODAY_ISO}"></div><div class="field"><label for="m-mode2">Mode</label><select id="m-mode2"><option>Call</option><option>Meeting</option><option>Email</option></select></div></div><div class="field"><label for="m-n2">Notes and next step</label><textarea id="m-n2" placeholder="Availability, topics, next step"></textarea></div>`,'Save connect'],
    notes:['Add class notes',`<div class="field"><label for="m-ss">Session</label><select id="m-ss">${sessPast.map(s=>`<option value="${s.id}" ${s.id===id?'selected':''}>${esc(s.title)} · ${fmt(s.date)}</option>`).join('')||'<option>No sessions need notes</option>'}</select></div><div class="field"><label for="m-n3">Notes</label><textarea id="m-n3" placeholder="Key points, student questions, follow-ups"></textarea></div>`,'Save notes'],
    sched:['Schedule a class', schedForm(), 'Schedule and add to Google Calendar'],
    task:['New task',`<div class="field"><label for="m-t">Task</label><input id="m-t" placeholder="What needs to be done?"></div><div class="grid g2"><div class="field"><label for="m-o">Owner</label><select id="m-o">${(isMgr()?Object.keys(USERS):[S.user]).map(u=>`<option value="${u}">${esc(UU(u).name)}</option>`).join('')}</select></div><div class="field"><label for="m-due">Due</label><input id="m-due" type="date" value="2026-10-22"></div></div><div class="grid g2"><div class="field"><label for="m-fq">Frequency</label><select id="m-fq"><option>One-off</option><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option></select></div><div class="field"><label for="m-p">Priority</label><select id="m-p"><option>High</option><option selected>Medium</option><option>Low</option></select></div></div><div class="field"><label for="m-r">Record of completion</label><input id="m-r" placeholder="e.g. Notes attached, email sent"></div>`,'Create task']
  };
  const [h,b,cta] = map[kind];
  return `<div class="scrim center" data-act="close"><div class="modal${kind==='sched'?' wide':''}" role="dialog" aria-label="${h}" data-stop><div class="drawer-h"><h2>${h}</h2><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div><div class="drawer-b">${b}</div><div class="modal-f"><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="save" data-m="${kind}">${cta}</button></div></div></div>`;
}

/* ---------------- render ---------------- */
const root = document.getElementById('root');
function render(){
  if (!S.user){ root.innerHTML = viewLogin(); drawWeave(); return; }
  const v = {search:viewSearch,myday:viewMyDay,overview:viewOverview,tasks:viewTasks,sessions:viewSessions,faculty:viewFaculty,students:viewStudents,cohorts:viewCohorts,kpis:viewKpis,payments:viewPayments,invoices:viewInvoices,reports:viewReports,admin:viewAdmin}[S.view] || viewOverview;
  let html = shell(v());
  if (S.drawer){ const [k,id]=S.drawer; html += k==='task'?drawerTask(TASKS.find(t=>t.id===id)):k==='kpi'?drawerKpi(+id, S.drawer[2]):k==='fac'?drawerFaculty(id):k==='inv'?drawerInvoice(INVOICES.find(v=>v.id===id)):k==='student'?drawerStudent(COHORTS.flatMap(c=>c.students).find(s=>s.id===id)):drawerSession(SESSIONS.find(s=>s.id===id)); }
  if (S.up) html += uploadModal();
  if (S.modal) html += modal(S.modal[0], S.modal[1]);
  if (S.toast) html += `<div class="toast" aria-hidden="true">${esc(S.toast)}</div>`;
  const q = document.activeElement && document.activeElement.id==='q';
  const prevKey = focusKey(document.activeElement), prevOverlay = A11Y.overlay;
  root.innerHTML = html;
  if (S.modal && S.modal[0]==='sched') schedPreview();
  if (S.modal && S.modal[0]==='invoice') invPreview();
  if (S.modal && S.modal[0]==='facform') facCalc();
  if (S.modal && S.modal[0]==='invrecv') recvSum();
  if (q){ const el=document.getElementById('q'); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
  a11yAfter(q ? null : prevKey, prevOverlay);
  const sqEl = document.activeElement && ['stu-q','co-q'].includes(document.activeElement.id) ? document.activeElement : null;
  if (sqEl) sqEl.setSelectionRange(sqEl.value.length, sqEl.value.length);
}

/* ---------------- screen reader and keyboard support ----------------
   The whole screen is redrawn after each action, so focus is put back where the person was,
   moved into a form or panel when one opens, back to its button when it closes, and to the page
   title when the page changes. Clickable rows and cards get keyboard focus; messages are announced. */
const A11Y = {overlay:'', opener:null, view:null};
const NATIVE = new Set(['BUTTON','A','INPUT','SELECT','TEXTAREA','LABEL','OPTION','SUMMARY']);
const live = document.createElement('div'); live.className = 'sr-only'; live.setAttribute('aria-live','polite'); live.setAttribute('role','status'); document.body.appendChild(live);
function announce(m){ live.textContent = ''; setTimeout(()=>{ live.textContent = m; }, 60); }
function focusKey(el){
  if (!el || el===document.body || !root.contains(el)) return null;
  if (el.id) return '#'+CSS.escape(el.id);
  const d = el.dataset || {};
  if (!d.act) return null;
  let sel = `[data-act="${CSS.escape(d.act)}"]`;
  for (const k of ['v','m','id','n','p','u','t','q']) if (d[k]!=null) sel += `[data-${k}="${CSS.escape(d[k])}"]`;
  return sel;
}
function a11yAfter(prevKey, prevOverlay){
  root.querySelectorAll('[data-act]').forEach(e=>{ if (NATIVE.has(e.tagName) || e.classList.contains('scrim') || e.closest('svg')) return; e.tabIndex = 0; if (e.tagName!=='TR') e.setAttribute('role','button'); });
  root.querySelectorAll('.tbl-wrap').forEach(e=>{ if (e.scrollWidth > e.clientWidth + 1){ e.tabIndex = 0; e.setAttribute('role','region'); e.setAttribute('aria-label','Table. Scroll sideways for more columns.'); } });
  root.querySelectorAll('[role=dialog]').forEach(d=>d.setAttribute('aria-modal','true'));
  root.querySelectorAll('.sc-err').forEach(e=>e.setAttribute('role','alert'));
  const overlay = S.modal ? 'm:'+S.modal.join('|') : S.drawer ? 'd:'+S.drawer.join('|') : S.up ? 'u' : '';
  A11Y.overlay = overlay;
  const dlgs = root.querySelectorAll('[role=dialog]'), top = dlgs[dlgs.length-1];
  if (overlay && overlay!==prevOverlay && top){
    if (!prevOverlay) A11Y.opener = prevKey;
    const field = S.modal ? top.querySelector('input:not([type=hidden]):not([disabled]):not([readonly]),select,textarea') : null;
    const target = field || top.querySelector('h2') || top;
    if (!field){ target.tabIndex = -1; }
    target.focus(); return;
  }
  if (!overlay && prevOverlay){ const el = A11Y.opener && root.querySelector(A11Y.opener); A11Y.opener = null; if (el){ el.focus(); return; } }
  const typing = document.activeElement && ['q','stu-q','co-q'].includes(document.activeElement.id);
  if (S.view!==A11Y.view){ const first = A11Y.view===null; A11Y.view = S.view; if (typing) return; const h = root.querySelector('main h1'); if (h && !first){ h.tabIndex = -1; h.focus(); } return; }
  if (prevKey){ const el = root.querySelector(prevKey); if (el && el!==document.activeElement) el.focus(); }
}
document.addEventListener('keydown', e=>{
  const t = e.target;
  if ((e.key==='Enter' || e.key===' ') && t && t.dataset && t.dataset.act && !NATIVE.has(t.tagName) && root.contains(t)){ e.preventDefault(); t.click(); return; }
  if (e.key==='Tab'){ // keep Tab inside an open form or panel
    const dlgs = root.querySelectorAll('[role=dialog]'), top = dlgs[dlgs.length-1]; if (!top) return;
    const f = [...top.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')].filter(x=>x.offsetParent!==null);
    if (!f.length) return;
    const first = f[0], last = f[f.length-1];
    if (!top.contains(document.activeElement)){ e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
});
let toastT;
function toast(m){ S.toast=m; render(); announce(m); clearTimeout(toastT); toastT=setTimeout(()=>{S.toast=null; if (S.modal && ['invoice','sched','facform','invrecv'].includes(S.modal[0])){ const t=document.querySelector('.toast'); if (t) t.remove(); } else render();},2200); }

root.addEventListener('click', e=>{
  if (e.target.closest('a[target="_blank"]')) return;
  const el = e.target.closest('[data-act]');
  if (!el) { if (S.notif && !e.target.closest('.notif')) { S.notif=false; render(); } return; }
  const a = el.dataset.act;
  if (a==='close' && e.target.closest('[data-stop]') && el.classList.contains('scrim')) return;
  if (a!=='notif' && S.notif){ S.notif=false; }
  switch(a){
    case 'login': S.user=el.dataset.u; S.view=UU(S.user).kind==='pm'?'myday':'overview'; S.taskScope=UU(S.user).kind==='chair'?'assigned':'mine'; try{localStorage.setItem('optimus-role',S.user)}catch(_){} render(); window.scrollTo(0,0); break;
    case 'logout': if (!db.demo){ db.signOut(); break; } S.user=null; S.drawer=null; S.modal=null; render(); break;
    case 'go': S.view=el.dataset.v; S.q=''; S.drawer=null; S.modal=null; S.cohort=null; render(); window.scrollTo(0,0); break;
    case 'toggle': { e.stopPropagation(); const t=TASKS.find(x=>x.id===el.dataset.id); const was=t.status==='done'; t.status=was?'doing':'done'; render(); toast(was?'Marked as not done':`Done: ${t.title}`); break; }
    case 'open': S.drawer=['task',el.dataset.id]; render(); break;
    case 'session': S.drawer=['session',el.dataset.id]; render(); break;
    case 'close': if (S.modal) S.modal=null; else if (S.up) S.up=null; else S.drawer=null; render(); break;
    case 'cohort': S.csq=''; S.cohort=el.dataset.c; S.ctab='profile'; render(); window.scrollTo(0,0); break;
    case 'cback': S.cohort=null; render(); break;
    case 'ctab': S.ctab=el.dataset.v; render(); break;
    case 'student': S.drawer=['student',el.dataset.id]; render(); break;
    case 'upload': S.up={step:1,type:S.cohort&&S.ctab==='attendance'?'attendance':'attendance',cohort:S.cohort||(visibleCohorts()[0]||{}).code}; if (!S.up.cohort){ S.up=null; toast('Add a cohort first'); break; } render(); break;
    case 'upsample': S.up.step=2; render(); break;
    case 'upback': S.up.step=1; render(); break;
    case 'upcommit': { const c=COHORTS.find(x=>x.code===S.up.cohort); S.up=null; toast(`Imported ${c.students.length} rows into ${c.code}. 2 rows skipped.`); break; }
    case 'modal': S.modal=[el.dataset.m, el.dataset.id]; if (el.dataset.m==='invoice'){ S.invTried=false; invLastType='sales'; } render(); break;
    case 'inv': S.drawer=['inv',el.dataset.id]; render(); break;
    case 'invf': S.invF=el.dataset.v; render(); break;
    case 'invt': S.invT=el.dataset.v; render(); break;
    case 'invadd': document.getElementById('iv-items').insertAdjacentHTML('beforeend', invItemRow()); invPreview(); break;
    case 'invdel': { const rows=document.querySelectorAll('#iv-items .iv-item:not(.head)'); if (rows.length>1) el.closest('.iv-item').remove(); invPreview(); break; }
    case 'fac': S.drawer=['fac',el.dataset.id]; render(); break;
    case 'invapprove': { const v=INVOICES.find(x=>x.id===el.dataset.id); v.status='sent'; v.approvedBy=S.user; AUDIT.unshift([nowStamp(),S.user,'approved invoice',v.no+' · '+v.from.name]); render(); toast(`${v.no} approved. It is now waiting for payment.`); break; }
    case 'attdl': { const v=INVOICES.find(x=>x.id===el.dataset.id); if (v&&v.att&&v.att.blob) saveFile(v.att.name, v.att.blob); else if (v&&v.att&&v.att.path) db.fileBlob(v.att.path).then(b=>saveFile(v.att.name,b)).catch(()=>toast('Could not download the file')); break; }
    case 'attopen': { const v=INVOICES.find(x=>x.id===el.dataset.id); const w=window.open('about:blank','_blank'); db.fileUrl(v.att.path).then(u=>{ if (w) w.location=u; else window.open(u,'_blank'); }).catch(()=>{ if (w) w.close(); toast('Could not open the file'); }); break; }
    case 'cotemplate': { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob(['Name,Email,Phone,Company\nAarav Mehta,aarav@example.com,+91 98100 00000,Mehta Group\n'], {type:'text/csv'})); a.download='Optimus students template.csv'; document.body.appendChild(a); a.click(); a.remove(); break; }
    case 'facpay': S.facPay=el.dataset.v; render(); break;
    case 'invpdf': e.stopPropagation(); invPdf(INVOICES.find(x=>x.id===el.dataset.id)); break;
    case 'invxlsx': invXlsx(); break;
    case 'invsend': { const v=INVOICES.find(x=>x.id===el.dataset.id); v.status='sent'; render(); toast(`${v.no} marked as sent to ${v.type==='sales'?v.to.name:'Reverentia'}`); break; }
    case 'invcancel': { const v=INVOICES.find(x=>x.id===el.dataset.id); v.status='cancelled'; render(); toast(`${v.no} cancelled. It stays on record.`); break; }
    case 'invprint': { const v=INVOICES.find(x=>x.id===el.dataset.id); let pa=document.getElementById('print-area'); if (!pa){ pa=document.createElement('div'); pa.id='print-area'; document.body.appendChild(pa); } pa.innerHTML=invDoc(v); const de=document.documentElement; de.classList.add('print-inv'); try{ window.print(); }catch(_){} setTimeout(()=>de.classList.remove('print-inv'), 800); break; }
    case 'save': { const m=el.dataset.m; let msg='Saved';
      if (m==='sched'){ const d=schedRead(), err=schedCheck(d); if (err){ schedPreview(); break; } const id=newId('S-', 320+SESSIONS.length-9); SESSIONS.push({id,date:d.date,time:d.time,prog:d.prog,cohort:d.cohort,title:d.title,mode:d.mode,venue:d.mode==='Online'?'Zoom':d.venue,zoom:d.mode==='Offline'?null:d.zoom,cal:true,fac:d.fac,pm:isMgr()?((COHORTS.find(c=>c.code===d.cohort)||{}).pm||S.user):S.user,notes:false,check:[d.fac?1:0,1,0,1,0],pay:{inv:'Not due',paid:'Not due',tds:'Not due'}}); S.sessTab='upcoming'; msg=`${d.title} scheduled · Google Calendar invite sent to ${d.inv} guests with the ${d.mode==='Offline'?'venue':'Zoom link'}`; }
      if (m==='invoice'){ S.invTried=true; const v=invRead(), err=invCheck(v); if (err){ invPreview(); break; } v.items=v.items.filter(i=>i.d||i.r); v.id=newId('IV-', 49+INVOICES.length-8); invNext[v.type]++; v.status=el.dataset.draft?'draft':'sent'; INVOICES.unshift(v); S.invTried=false; S.view='invoices'; S.invF='all'; S.drawer=['inv',v.id]; msg=`${v.no} ${v.status==='draft'?'saved as a draft':'created for '+rs(invCalc(v).total)}`; if (el.dataset.dl){ S.modal=null; render(); invPdf(v); break; } }
      if (m==='stuadd'){ const r=stuSave(); if (!r) break; S.view='cohorts'; S.cohort=r.c.code; S.ctab='students'; msg=`${r.n} student${r.n===1?'':'s'} added to ${r.c.code}`; }
      if (m==='pastsess'){ const r=psSave(); if (!r) break; msg=`${r.n} past session${r.n===1?'':'s'} added to ${r.c.code}. They now show when you mark attendance.`; }
      if (m==='attmark'){ const r=attSave(); if (!r) break; msg=r; }
      if (m==='cohortadd'){ const c=cohortSave(); if (!c) break; S.view='cohorts'; S.cohort=c.code; S.ctab='profile'; msg=`${c.code} added with ${c.size} student${c.size===1?'':'s'}`; }
      if (m==='facform'){ const r=facSave(el.dataset.id||null); if (!r) break; AUDIT.unshift([nowStamp(),S.user,r.isNew?'added faculty':'edited faculty',r.name]); S.drawer=['fac',r.id]; msg = r.isNew ? `${r.name} added to the faculty directory` : `${r.name}'s profile updated`; }
      if (m==='invrecv'){ const v=recvSave(); if (!v) break; AUDIT.unshift([nowStamp(),S.user,'attached faculty invoice',v.no+' · '+v.from.name]); S.drawer=['inv',v.id]; msg=`Invoice from ${v.from.name} attached. Sent to Neha and Rajiv for approval.`; }
      if (m==='facdel'){ const f=FACULTY[el.dataset.id]; f.removed=true; AUDIT.unshift([nowStamp(),S.user,'removed faculty',f.name]); S.drawer=null; msg=`${f.name} removed from the directory`; }
      if (m==='invpay'){ const v=INVOICES.find(x=>x.id===el.dataset.id), a=+document.getElementById('ip-a').value||0, t=+document.getElementById('ip-t').value||0; if (a+t<=0){ document.getElementById('ip-a').focus(); break; } v.pays.push({date:document.getElementById('ip-d').value||TODAY_ISO,amt:a,tds:t,ref:document.getElementById('ip-r').value.trim()}); msg=`${v.no}: ${invStatus(v)==='Paid'?'paid in full':'part-paid, '+rs(invCalc(v).bal)+' still due'}`; }
      if (m==='oneone'){ const sid=document.getElementById('m-s').value; const st=STUDENTS.find(s=>s.id===sid); if(st){st.last=TODAY_ISO; msg=`1:1 with ${st.name} logged`;} }
      if (m==='connect'){ const fid=document.getElementById('m-f').value; if(FACULTY[fid]){FACULTY[fid].lastContact=TODAY_ISO; msg=`Connect with ${FACULTY[fid].name} logged`;} }
      if (m==='notes'){ const sid=document.getElementById('m-ss').value; const s=SESSIONS.find(x=>x.id===sid); if(s){s.notes=true; msg='Class notes saved';} }
      if (m==='task'){ const title=document.getElementById('m-t').value.trim()||'Untitled task'; const n=1061+TASKS.length-19; TASKS.unshift({id:newId('T-', n),title,owner:document.getElementById('m-o').value,by:S.user,due:document.getElementById('m-due').value||'2026-10-22',status:'todo',freq:document.getElementById('m-fq').value,cat:'General',pri:document.getElementById('m-p').value,record:document.getElementById('m-r').value||'Completion note',comments:[]}); msg=`Task created and assigned to ${USERS[TASKS[0].owner].name}`; }
      S.modal=null; toast(msg); break; }
    case 'comment': { const t=TASKS.find(x=>x.id===el.dataset.id); const v=document.getElementById('cmt').value.trim(); if(!v){toast('Write an update first');break;} t.comments.push({u:S.user,t:v,w:'Just now'}); render(); toast('Update posted'); break; }
    case 'check': { const s=SESSIONS.find(x=>x.id===el.dataset.id); s.check[+el.dataset.i]=el.checked?1:0; break; }
    case 'tfilter': S.taskFilter=el.dataset.v; render(); break;
    case 'scope': S.taskScope=el.dataset.v; render(); break;
    case 'sesstab': S.sessTab=el.dataset.v; render(); break;
    case 'kq': S.kpiQ=el.dataset.v; render(); break;
    case 'kpm': S.kpiPm=el.dataset.v; if (el.dataset.go){ S.view='kpis'; window.scrollTo(0,0); } render(); break;
    case 'kpi': e.stopPropagation(); S.drawer=['kpi', el.dataset.n, el.dataset.p]; render(); break;
    case 'ksign': (KSTATE.Q3=KSTATE.Q3||{})[el.dataset.p]='Signed by PM'; render(); toast('Scorecard signed. Sent to Rajiv to approve and lock.'); break;
    case 'klock': (KSTATE.Q3=KSTATE.Q3||{})[el.dataset.p]='Locked'; render(); toast(`${UU(el.dataset.p).name}'s Q3 scorecard approved and locked`); break;
    case 'paytab': S.payTab=el.dataset.v; render(); break;
    case 'membersave': memberSave(el.dataset.id||null, el); break;
    case 'memberdel': memberRemove(el.dataset.id, el); break;
    case 'attmark': attOpen(el.dataset.id); render(); break;
    case 'pastsess': psOpen(); render(); break;
    case 'stuadd': stuOpen(el.dataset.id); render(); break;
    case 'cohortgo': S.q=''; S.csq=''; S.view='cohorts'; S.cohort=el.dataset.id; S.ctab=el.dataset.v||'profile'; render(); window.scrollTo(0,0); break;
    case 'qclear': S.q=''; S.view=S.prevView||'overview'; render(); { const x=document.getElementById('q'); if (x) x.focus(); } break;
    case 'coqclear': S.csq=''; render(); { const x=document.getElementById('co-q'); if (x) x.focus(); } break;
    case 'stuqclear': S.sq=''; render(); { const x=document.getElementById('stu-q'); if (x) x.focus(); } break;
    case 'stuone': stuOne(); break;
    case 'sturm': { const r = STU.rows.splice(+el.dataset.n,1)[0]; stuCheck(); STU.note = `${r.name} removed from the list.`; render(); announce(STU.note); const x=document.getElementById('su-n'); if (x) x.focus(); break; }
    case 'cohortatt': S.view='cohorts'; S.cohort=el.dataset.id; S.ctab='attendance'; render(); window.scrollTo(0,0); break;
    case 'pstpl': { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob(['Session name,Date\nIntroduction to Family Business,12/10/2026\nSuccession Planning,26/10/2026\n'],{type:'text/csv'})); a.download='Optimus past sessions template.csv'; document.body.appendChild(a); a.click(); a.remove(); announce('Template downloaded. One row per session, with the session name and the date.'); break; }
    case 'attall': { const c=COHORTS.find(x=>x.code===ATT.code); c.students.forEach(st=>{ if (el.dataset.v) ATT.marks[st.id]=el.dataset.v; else delete ATT.marks[st.id]; }); render(); const b=document.querySelector(`[data-act="attall"][data-v="${el.dataset.v}"]`); if (b) b.focus(); announce(el.dataset.v?'Everyone marked present':'All marks cleared'); break; }
    case 'attdltpl': { const c=COHORTS.find(x=>x.code===el.dataset.id); const q=v=>/[",\n]/.test(v)?'"'+String(v).replace(/"/g,'""')+'"':v; const csv='Student ID,Name,Email,Status\n'+c.students.map(st=>[st.id,st.name,st.email||'',''].map(q).join(',')).join('\n')+'\n'; const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=`${c.code} attendance template.csv`; document.body.appendChild(a); a.click(); a.remove(); announce('Template downloaded. Fill the Status column with P, L, A or E.'); break; }
    case 'reqdecline': reqDecline(el.dataset.id, el).then(render); break;
    case 'admintab': S.adminTab=el.dataset.v; render(); break;
    case 'toast': toast(el.dataset.t); break;
    case 'notif': S.notif=!S.notif; render(); break;
    case 'easy': { const r=document.documentElement, on=!r.hasAttribute('data-easy'); if (on) r.setAttribute('data-easy',''); else r.removeAttribute('data-easy'); try{localStorage.setItem('optimus-easy', on?'1':'0')}catch(_){} render(); toast(on?'Easy reading on. Larger text and stronger contrast on this device.':'Easy reading off'); break; }
    case 'theme': { const r=document.documentElement; const next = r.dataset.theme==='dark' ? 'light' : 'dark'; r.dataset.theme = next; try{localStorage.setItem('optimus-theme', next)}catch(_){} announce(next==='dark'?'Dark theme':'Light theme'); break; }
  }
});
root.addEventListener('change', e=>{
  if (e.target.id==='up-type'){ S.up.type=e.target.value; render(); }
  if (e.target.id==='up-cohort'){ S.up.cohort=e.target.value; render(); }
  if (e.target.id==='up-file' && e.target.files[0]){ S.up.file=e.target.files[0].name; S.up.step=2; render(); }
  if (e.target.id==='st-sel'){ const t=TASKS.find(x=>x.id===e.target.dataset.id); t.status=e.target.value; render(); toast('Status updated'); }
  if (e.target.matches('input[data-act="check"]')){ const s=SESSIONS.find(x=>x.id===e.target.dataset.id); s.check[+e.target.dataset.i]=e.target.checked?1:0; }
});
root.addEventListener('input', e=>{ if (e.target.id==='stu-q'){ S.sq = e.target.value; render(); return; } if (e.target.id==='co-q'){ S.csq = e.target.value; render(); return; } });
root.addEventListener('input', e=>{ if (e.target.id==='q'){ S.q=e.target.value;
  if (S.q.trim()){ if (S.view!=='search'){ S.prevView=S.view; S.view='search'; S.drawer=null; S.cohort=null; } }
  else if (S.view==='search'){ S.view=S.prevView||'overview'; }
  render(); } });
document.addEventListener('keydown', e=>{ if (e.key==='Escape' && (S.drawer||S.modal||S.up)){ S.drawer=null; S.modal=null; S.up=null; render(); } });

/* login background: a quiet woven grid (calendar weeks) */
function drawWeave(){
  const c = document.getElementById('weave'); if (!c) return;
  const r = c.getBoundingClientRect(), dpr = window.devicePixelRatio||1;
  c.width = r.width*dpr; c.height = r.height*dpr;
  const g = c.getContext('2d'); g.scale(dpr,dpr);
  const cell = 26, cols = Math.ceil(r.width/cell)+1, rows = Math.ceil(r.height/cell)+1;
  let seed = 7; const rnd = ()=> (seed = (seed*9301+49297)%233280)/233280;
  for (let y=0;y<rows;y++) for (let x=0;x<cols;x++){
    const v = rnd();
    g.fillStyle = v>.93 ? 'rgba(138,180,255,.55)' : v>.75 ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.05)';
    g.beginPath(); g.roundRect ? g.roundRect(x*cell+3,y*cell+3,cell-6,cell-6,4) : g.rect(x*cell+3,y*cell+3,cell-6,cell-6); g.fill();
  }
  const grad = g.createLinearGradient(0,0,r.width*.7,0); grad.addColorStop(0,'rgba(11,11,11,.96)'); grad.addColorStop(1,'rgba(11,11,11,.35)');
  g.fillStyle = grad; g.fillRect(0,0,r.width,r.height);
}
window.addEventListener('resize', ()=>{ if(!S.user) drawWeave(); });

setupData(db, BRIDGE);
}
