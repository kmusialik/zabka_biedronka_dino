let S, C;
fetch('data.json').then(r=>r.json()).then(DATA=>{
  S=DATA.s; C=DATA.counts;
document.getElementById('cz').textContent=C.Z.toLocaleString('pl-PL');
document.getElementById('cb').textContent=C.B.toLocaleString('pl-PL');
document.getElementById('cd').textContent=C.D.toLocaleString('pl-PL');

const COL={Z:'#00a651',B:'#e2001a',D:'#f5a623'};
const NAME={Z:'Żabka',B:'Biedronka',D:'Dino'};
const map=L.map('map',{preferCanvas:true}).setView([52.0,19.3],6);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {attribution:'© OpenStreetMap © CARTO',maxZoom:19,subdomains:'abcd'}).addTo(map);

let on={Z:true,B:true,D:true}, clusterOn=true, hotOn=false;
let layers={};

function build(){
  Object.values(layers).forEach(l=>map.removeLayer(l)); layers={};
  for(const br of ['Z','B','D']){
    if(!on[br]) continue;
    const markers=[];
    for(const r of S){
      const [lat,lon,brand,town,street,selfnn,comp]=r;
      if(brand!==br) continue;
      if(hotOn && comp>=150) continue;
      const m=L.circleMarker([lat,lon],{radius:4,fillColor:COL[br],color:'#fff',weight:1,fillOpacity:.85});
      m.bindPopup(`<div class="pop"><div class="t ${br.toLowerCase()}">${NAME[br]}</div>
        <div>${town||''}${street?' · '+street:''}</div>
        <div class="m">najbliższy konkurent: ${comp} m<br>najbliższy własny sklep: ${selfnn} m</div></div>`);
      markers.push(m);
    }
    let layer;
    if(clusterOn){
      layer=L.markerClusterGroup({chunkedLoading:true,maxClusterRadius:50,
        iconCreateFunction:(c)=>{const n=c.getChildCount();const sz=n>500?52:n>100?44:n>20?36:30;
          return L.divIcon({html:`<div style="background:${COL[br]};color:#fff;border-radius:50%;width:${sz}px;height:${sz}px;
            display:flex;align-items:center;justify-content:center;font-family:ui-monospace,monospace;font-size:12px;
            border:3px solid rgba(255,255,255,.7);box-shadow:0 2px 7px rgba(0,0,0,.3)">${n}</div>`,
            className:'',iconSize:[sz,sz]});}});
      layer.addLayers(markers);
    } else { layer=L.layerGroup(markers); }
    map.addLayer(layer); layers[br]=layer;
  }
}
build();
function tog(br){on[br]=!on[br];document.getElementById('sw-'+br).classList.toggle('on',on[br]);build();}
function togCluster(){clusterOn=!clusterOn;document.getElementById('sw-cl').classList.toggle('on',clusterOn);build();}
function togHot(){hotOn=!hotOn;document.getElementById('sw-hot').classList.toggle('on',hotOn);build();}

}).catch(e=>{document.getElementById('map').innerHTML='<div style="padding:40px;font-family:sans-serif">Nie udało się wczytać data.json: '+e+'</div>';});
