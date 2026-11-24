/* Albion Flip Scanner — enhanced client-side market scanner.
   Price data: Albion Online Data Project public API. No game automation. */
const $ = id => document.getElementById(id);
const CITIES = ['Bridgewatch','Fort Sterling','Lymhurst','Martlock','Thetford','Caerleon','Brecilien'];
const BLACK_MARKET = 'Black Market';
const STARTER = ['BAG','CAPE','ORE','HIDE','WOOD','ROCK','FIBER','METALBAR','PLANKS','LEATHER','CLOTH','STONEBLOCK','MOUNT_HORSE','MEAL_PIE','POTION_HEAL'];
const RESOURCES = ['ORE','HIDE','WOOD','ROCK','FIBER','METALBAR','PLANKS','LEATHER','CLOTH','STONEBLOCK'];
const BAGS = ['BAG','CAPE'];
const WEAPONS = ['MAIN_SWORD','2H_CLAYMORE','MAIN_AXE','2H_AXE','MAIN_MACE','2H_MACE','MAIN_HAMMER','2H_HAMMER','MAIN_SPEAR','2H_SPEAR','MAIN_DAGGER','2H_DAGGERPAIR','MAIN_CROSSBOW','2H_CROSSBOW','MAIN_BOW','2H_LONGBOW','MAIN_FIRE','2H_FIRE','MAIN_FROST','2H_FROST','MAIN_ARCANESTAFF','2H_ARCANESTAFF','MAIN_HOLYSTAFF','2H_HOLYSTAFF','MAIN_NATURESTAFF','2H_NATURESTAFF','MAIN_CURSEDSTAFF','2H_CURSEDSTAFF','2H_QUARTERSTAFF','2H_IRONCLADEDSTAFF','2H_DOUBLEBLADEDSTAFF','2H_DUALSICKLE','2H_BEARPAWS','2H_SCYTHE','2H_HALBERD','2H_GLAIVE','2H_TRIDENT','2H_BOLTCASTER','2H_WARBOW','2H_WAILINGBOW'];
const ARMOR = ['HEAD_CLOTH_SET1','HEAD_CLOTH_SET2','HEAD_CLOTH_SET3','ARMOR_CLOTH_SET1','ARMOR_CLOTH_SET2','ARMOR_CLOTH_SET3','SHOES_CLOTH_SET1','SHOES_CLOTH_SET2','SHOES_CLOTH_SET3','HEAD_LEATHER_SET1','HEAD_LEATHER_SET2','HEAD_LEATHER_SET3','ARMOR_LEATHER_SET1','ARMOR_LEATHER_SET2','ARMOR_LEATHER_SET3','SHOES_LEATHER_SET1','SHOES_LEATHER_SET2','SHOES_LEATHER_SET3','HEAD_PLATE_SET1','HEAD_PLATE_SET2','HEAD_PLATE_SET3','ARMOR_PLATE_SET1','ARMOR_PLATE_SET2','ARMOR_PLATE_SET3','SHOES_PLATE_SET1','SHOES_PLATE_SET2','SHOES_PLATE_SET3'];
const MOUNTS = ['MOUNT_HORSE','MOUNT_OX','MOUNT_ARMORED_HORSE','MOUNT_GIANTSTAG','MOUNT_DIREWOLF','MOUNT_DIREBOAR','MOUNT_DIREBEAR','MOUNT_SWAMPDRAGON','MOUNT_MOABIRD','MOUNT_GREYWOLF'];
const BREEDING = ['BABY_HORSE','BABY_OX','BABY_ARMORED_HORSE','BABY_GIANTSTAG','BABY_DIREWOLF','BABY_DIREBOAR','BABY_DIREBEAR','BABY_SWAMPDRAGON','BABY_MOABIRD','BABY_GREYWOLF',...MOUNTS];
const CRAFTING = [...new Set([...BAGS,...WEAPONS,...ARMOR,...['2H_PICKAXE','2H_SKINNINGKNIFE','2H_FISHINGROD','2H_SICKLE','2H_HAMMER']])];
const REFINEMENT = RESOURCES;
const CONSUMABLES = ['MEAL_PIE','MEAL_OMELETTE','MEAL_ROAST','MEAL_SALAD','MEAL_SOUP','POTION_HEAL','POTION_ENERGY','POTION_REVIVE','POTION_CLEANSE','POTION_RESISTANCE','POTION_STONESKIN','POTION_INVISIBILITY'];
const fmt = n => Math.round(Number(n)||0).toLocaleString();
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let controller = null, running = false, timer = null, lastResults = [], lastChecked = 0, lastScanAt = null;

function setStatus(text){ $('status').textContent = text; }
function setMessage(text){ $('scanMessage').textContent = text; }
function selectedValues(el){ return Array.from(el.selectedOptions).map(o=>o.value); }
function selectedCities(){ return Array.from($('cities').selectedOptions).map(o=>o.value); }
function selectedTiers(){ return selectedValues($('tiers')); }
function selectedEnchants(){ return selectedValues($('enchantments')); }
function categoryBases(){
  switch($('category').value){
    case 'resources': return RESOURCES;
    case 'refinement': return REFINEMENT;
    case 'crafting': return CRAFTING;
    case 'breeding': return BREEDING;
    case 'bags': return BAGS;
    case 'weapons': return WEAPONS;
    case 'armor': return ARMOR;
    case 'mounts': return MOUNTS;
    case 'consumables': return CONSUMABLES;
    case 'all': return [...new Set([...STARTER,...WEAPONS,...ARMOR,...MOUNTS,...CONSUMABLES,...REFINEMENT,...CRAFTING,...BREEDING])];
    case 'custom': return [];
    default: return STARTER;
  }
}
function getItemIds(){
  if($('category').value === 'custom'){
    return [...new Set($('customItems').value.split(/[\s,;]+/).map(x=>x.trim().toUpperCase()).filter(x=>/^T[1-8]_[A-Z0-9_]+(?:@[1-4])?$/.test(x)))];
  }
  const tiers = selectedTiers(), enchants = selectedEnchants(), bases = categoryBases();
  if(!tiers.length || !enchants.length) return [];
  const ids = [];
  for(const tier of tiers) for(const base of bases) for(const enchant of enchants){
    ids.push(`T${tier}_${base}${enchant==='0'?'':`@${enchant}`}`);
  }
  return [...new Set(ids)];
}
function ageHours(date){
  if(!date) return null;
  const time = Date.parse(date);
  if(!Number.isFinite(time)) return null;
  return Math.max(0,(Date.now()-time)/3600000);
}
function ageLabel(date){
  const age = ageHours(date);
  if(age===null) return 'unknown';
  if(age<1) return `${Math.round(age*60)} min`;
  if(age<24) return `${age.toFixed(1)} hr`;
  return `${(age/24).toFixed(1)} days`;
}
function freshnessClass(date){
  const age=ageHours(date);
  return age===null || age>24 ? 'stale' : age>4 ? 'aging' : 'fresh';
}
function itemIcon(item, quality){
  const src = `https://render.albiononline.com/v1/item/${encodeURIComponent(item)}.png?quality=${encodeURIComponent(quality)}`;
  return `<img class="item-icon" src="${src}" alt="" loading="lazy" onerror="this.style.display='none'">`;
}
function currentMode(){
  const mode=$('mode').value;
  return mode==='blackmarket' ? BLACK_MARKET : mode==='custom' ? $('sellCity').value : null;
}
function locationsForScan(cities){
  const mode=$('mode').value;
  if(mode==='blackmarket') return [...new Set([...cities,BLACK_MARKET])];
  if(mode==='custom') return [...new Set([...cities,$('sellCity').value])];
  return cities;
}
function updateModeUI(){
  $('sellCityWrap').classList.toggle('hidden',$('mode').value==='all');
  $('citiesWrap').querySelector('small').textContent = $('mode').value==='all'
    ? 'Select at least two cities. The scanner checks routes between selected cities.'
    : 'Select one or more cities to buy from. The scanner compares them with the selected sell destination.';
}
function buildUrl(ids, locations){
  const server=$('server').value;
  return `https://${server}.albion-online-data.com/api/v2/stats/prices/${ids.map(encodeURIComponent).join(',')}.json?locations=${encodeURIComponent(locations.join(','))}&qualities=${encodeURIComponent($('quality').value==='all'?'1,2,3,4,5':$('quality').value)}`;
}
function createRoutes(rows, ids, cities){
  const mode=$('mode').value, destination=currentMode();
  const byKey=new Map();
  for(const row of rows){
    if(!row || !row.item_id || !row.city) continue;
    byKey.set(`${row.item_id}|${row.city}|${row.quality||1}`,row);
  }
  const tax=Math.max(0,Math.min(100,Number($('tax').value)||0))/100;
  const minProfit=Math.max(0,Number($('minProfit').value)||0);
  const minRoi=Math.max(0,Number($('minRoi').value)||0);
  const maxAge=Math.max(0,Number($('maxAge').value)||0);
  const qualitySelection=$('quality').value, qualities=qualitySelection==='all'?[1,2,3,4,5]:[Number(qualitySelection)], found=[];
  for(const item of ids){
    const possibleBuyCities = cities;
    for(const q of qualities) for(const buyCity of possibleBuyCities){
      const buyRow=byKey.get(`${item}|${buyCity}|${q}`);
      if(!buyRow) continue;
      const buy=Number(buyRow.sell_price_min)||0;
      const buyDate=buyRow.sell_price_min_date;
      if(buy<=0 || (maxAge>0 && (ageHours(buyDate)===null || ageHours(buyDate)>maxAge))) continue;
      let sellCities=[];
      if(mode==='all') sellCities=cities.filter(c=>c!==buyCity);
      else sellCities=[destination].filter(c=>c && c!==buyCity);
      for(const sellCity of sellCities){
        const sellRow=byKey.get(`${item}|${sellCity}|${q}`);
        if(!sellRow) continue;
        const gross=Number(sellRow.buy_price_max)||0, sellDate=sellRow.buy_price_max_date;
        if(gross<=0 || (maxAge>0 && (ageHours(sellDate)===null || ageHours(sellDate)>maxAge))) continue;
        const net=gross*(1-tax), profit=net-buy, roi=buy>0 ? profit/buy*100 : 0;
        if(profit>=minProfit && roi>=minRoi){
          found.push({item,buyCity,sellCity,buy,gross,net,profit,roi,buyDate,sellDate,quality:q});
        }
      }
    }
  }
  return found;
}
function renderResults(){
  const sort=$('sort').value;
  const rows=[...lastResults].sort((a,b)=>sort==='roi'?b.roi-a.roi:b.profit-a.profit);
  $('resultCount').textContent=`${rows.length} results`;
  $('count').textContent=rows.length.toLocaleString();
  $('checked').textContent=lastChecked.toLocaleString();
  $('best').textContent=rows.length?`${fmt(rows[0].profit)} silver`:'—';
  $('export').disabled=!rows.length;
  if(!rows.length){
    $('results').innerHTML='<div class="empty"><b>No flips met your filters</b><p>Try a different category, more cities, or lower minimum profit/ROI. Missing prices are not treated as zero.</p></div>';
    return;
  }
  $('results').innerHTML=rows.slice(0,250).map(r=>{
    const old=freshnessClass(r.buyDate)!=='fresh'||freshnessClass(r.sellDate)!=='fresh';
    return `<article class="flip">
      <div class="fliptop">${itemIcon(r.item,r.quality)}<div class="itemname">${esc(r.item)} <span class="quality">Q${esc(r.quality)}</span></div><div class="profit">+${fmt(r.profit)} silver</div></div>
      <div class="routes">
        <div>🛒 Buy at <strong>${esc(r.buyCity)}</strong> for ${fmt(r.buy)}</div>
        <div>↗ Sell at <strong>${esc(r.sellCity)}</strong> (${fmt(r.gross)})</div>
      </div>
      <div class="metrics">
        <div class="metric"><small>Net profit</small><b class="profit">${fmt(r.profit)}</b></div>
        <div class="metric"><small>ROI</small><b>${r.roi.toFixed(1)}%</b></div>
        <div class="metric"><small>After fee</small><b>${fmt(r.net)}</b></div>
      </div>
      <div class="fresh ${old?'stale':''}">Buy data: ${ageLabel(r.buyDate)} ago · Sell data: ${ageLabel(r.sellDate)} ago${old?' · Check freshness':''}</div>
      <span class="pill">ESTIMATE · VERIFY IN GAME</span>
    </article>`;
  }).join('');
}
function updateSummary(){
  $('lastScan').textContent=lastScanAt?lastScanAt.toLocaleTimeString():'—';
  $('summary').textContent=lastScanAt?`Last completed ${lastScanAt.toLocaleString()}`:'Run a scan to compare selected markets.';
}
function exportCsv(){
  if(!lastResults.length) return;
  const headers=['Item ID','Quality','Buy City','Buy Price','Sell City','Sell Price','Estimated Fee Adjusted Proceeds','Net Profit','ROI %','Buy Data Date','Sell Data Date'];
  const lines=[headers,...lastResults.map(r=>[r.item,r.quality,r.buyCity,r.buy,r.sellCity,r.gross,r.net,r.profit,r.roi.toFixed(2),r.buyDate||'',r.sellDate||''])];
  const csv=lines.map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`albion-flips-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
async function fetchInBatches(ids, locations, signal){
  const all=[];
  const batchSize=35;
  for(let i=0;i<ids.length;i+=batchSize){
    if(signal.aborted) throw new DOMException('Scan stopped','AbortError');
    const batch=ids.slice(i,i+batchSize), url=buildUrl(batch,locations);
    const response=await fetch(url,{signal,headers:{Accept:'application/json'}});
    if(response.status===429) throw new Error('The community API rate limit was reached. Wait before scanning again.');
    if(!response.ok) throw new Error(`Market API returned HTTP ${response.status}.`);
    const data=await response.json();
    if(Array.isArray(data)) all.push(...data);
    setMessage(`Downloaded batch ${Math.ceil((i+batchSize)/batchSize)} of ${Math.ceil(ids.length/batchSize)} · ${Math.min(i+batchSize,ids.length)} / ${ids.length} item IDs`);
    if(i+batchSize<ids.length) await new Promise((resolve,reject)=>{
      const t=setTimeout(resolve,250);
      signal.addEventListener('abort',()=>{clearTimeout(t);reject(new DOMException('Scan stopped','AbortError'));},{once:true});
    });
  }
  return all;
}
async function scanOnce(){
  const ids=getItemIds(), cities=selectedCities(), mode=$('mode').value;
  if(!ids.length) throw new Error($('category').value==='custom'?'Enter valid custom item IDs.':'Choose at least one tier and enchantment.');
  if(ids.length>250) throw new Error(`This selection creates ${ids.length} item IDs. Choose fewer tiers/enchantments or a smaller category (maximum 250 per scan).`);
  if(!cities.length) throw new Error('Select at least one buy city.');
  if(mode==='all' && cities.length<2) throw new Error('Select at least two cities for city-to-city comparison.');
  const locations=locationsForScan(cities);
  if(mode==='custom' && cities.length===1 && cities[0]===$('sellCity').value) throw new Error('Buy city and sell city must be different.');
  controller=new AbortController();
  $('scan').disabled=true;$('stop').disabled=false;
  setStatus('Scanning…');setMessage(`Preparing ${ids.length} item IDs across ${locations.length} market locations…`);
  const rows=await fetchInBatches(ids,locations,controller.signal);
  if(controller.signal.aborted) return;
  lastResults=createRoutes(rows,ids,cities);
  lastChecked=ids.length;lastScanAt=new Date();
  renderResults();updateSummary();
  setStatus(`Scan complete · ${lastResults.length} opportunities`);
  setMessage(`Checked ${ids.length} item IDs. Received ${rows.length.toLocaleString()} market price records. Community snapshots may be delayed.`);
}
async function runScanCycle(){
  if(!running) return;
  try{await scanOnce();}
  catch(e){
    if(e.name==='AbortError'){setStatus('Stopped');setMessage('Scanning stopped.');}
    else{setStatus('Scan error');setMessage(e.message||'Could not load market data. Check your connection and try again.');}
  } finally {
    $('scan').disabled=false;$('stop').disabled=true;controller=null;
    if(running){
      const minutes=Number($('refresh').value)||0;
      if(minutes>0){setStatus(`Auto-refresh on · next scan in ${minutes} min`);timer=setTimeout(runScanCycle,minutes*60000);}
      else{running=false;setStatus('Ready');}
    }
  }
}
function startScanning(){
  if(running) return;
  running=true;
  runScanCycle();
}
function stopScanning(){
  running=false;
  if(timer){clearTimeout(timer);timer=null;}
  if(controller) controller.abort();
  $('stop').disabled=true;
  if(!$('scan').disabled) setStatus('Stopped');
}
function clearResults(){
  lastResults=[];lastChecked=0;lastScanAt=null;
  $('results').innerHTML='<div class="empty"><b>No scan yet</b><p>Choose your settings and start scanning.</p></div>';
  $('count').textContent='0';$('checked').textContent='0';$('best').textContent='—';$('lastScan').textContent='—';
  $('resultCount').textContent='0 results';$('export').disabled=true;
  setStatus('Ready');setMessage('Results cleared.');
}
$('scan').addEventListener('click',startScanning);
$('stop').addEventListener('click',stopScanning);
$('clear').addEventListener('click',()=>{stopScanning();clearResults();});
$('export').addEventListener('click',exportCsv);
$('sort').addEventListener('change',renderResults);
$('mode').addEventListener('change',updateModeUI);
$('category').addEventListener('change',()=>{
  const custom=$('category').value==='custom';
  $('customItems').disabled=!custom;
});
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
updateModeUI();
$('customItems').disabled=true;
