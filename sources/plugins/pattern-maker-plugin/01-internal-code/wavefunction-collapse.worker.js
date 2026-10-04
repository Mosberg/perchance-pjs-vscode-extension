// wavefunction-collapse.worker.js
// EXTRACTED (verbatim) from the "workerScriptBlob" template string inside main.pjs.
// Runtime: classic WebWorker (Worker(URL.createObjectURL(blob)), not a module worker).
// Contents: minified build of kchapelier/wavefunctioncollapse (model.js + overlapping-model.js +
// random-indice.js, MIT) plus a project-specific worker harness (request/stop protocol).
// Upstream unminified source: ../02-external-code/wavefunctioncollapse/
// Regenerate this file from main.pjs with: node 05-build-config/extract-worker.mjs
// Copied from repo on May 19th 2022: https://github.com/kchapelier/wavefunctioncollapse
function randomIndice(t,i){let e=0,s=0,o=0;for(;o<t.length;o++)e+=t[o];for(o=0,i*=e;i&&o<t.length;){if(i<=(s+=t[o]))return o;o++}return 0}const Model=function(){};Model.prototype.FMX=0,Model.prototype.FMY=0,Model.prototype.FMXxFMY=0,Model.prototype.T=0,Model.prototype.N=0,Model.prototype.initiliazedField=!1,Model.prototype.generationComplete=!1,Model.prototype.wave=null,Model.prototype.compatible=null,Model.prototype.weightLogWeights=null,Model.prototype.sumOfWeights=0,Model.prototype.sumOfWeightLogWeights=0,Model.prototype.startingEntropy=0,Model.prototype.sumsOfOnes=null,Model.prototype.sumsOfWeights=null,Model.prototype.sumsOfWeightLogWeights=null,Model.prototype.entropies=null,Model.prototype.propagator=null,Model.prototype.observed=null,Model.prototype.distribution=null,Model.prototype.stack=null,Model.prototype.stackSize=0,Model.prototype.DX=[-1,0,1,0],Model.prototype.DY=[0,1,0,-1],Model.prototype.opposite=[2,3,0,1],Model.prototype.initialize=function(){this.distribution=new Array(this.T),this.wave=new Array(this.FMXxFMY),this.compatible=new Array(this.FMXxFMY);for(let t=0;t<this.FMXxFMY;t++){this.wave[t]=new Array(this.T),this.compatible[t]=new Array(this.T);for(let i=0;i<this.T;i++)this.compatible[t][i]=[0,0,0,0]}this.weightLogWeights=new Array(this.T),this.sumOfWeights=0,this.sumOfWeightLogWeights=0;for(let t=0;t<this.T;t++)this.weightLogWeights[t]=this.weights[t]*Math.log(this.weights[t]),this.sumOfWeights+=this.weights[t],this.sumOfWeightLogWeights+=this.weightLogWeights[t];this.startingEntropy=Math.log(this.sumOfWeights)-this.sumOfWeightLogWeights/this.sumOfWeights,this.sumsOfOnes=new Array(this.FMXxFMY),this.sumsOfWeights=new Array(this.FMXxFMY),this.sumsOfWeightLogWeights=new Array(this.FMXxFMY),this.entropies=new Array(this.FMXxFMY),this.stack=new Array(this.FMXxFMY*this.T),this.stackSize=0},Model.prototype.observe=function(t){let i=1e3,e=-1;for(let s=0;s<this.FMXxFMY;s++){if(this.onBoundary(s%this.FMX,s/this.FMX|0))continue;const o=this.sumsOfOnes[s];if(0===o)return!1;const h=this.entropies[s];if(o>1&&h<=i){const o=1e-6*t();h+o<i&&(i=h+o,e=s)}}if(-1===e){this.observed=new Array(this.FMXxFMY);for(let t=0;t<this.FMXxFMY;t++)for(let i=0;i<this.T;i++)if(this.wave[t][i]){this.observed[t]=i;break}return!0}for(let t=0;t<this.T;t++)this.distribution[t]=this.wave[e][t]?this.weights[t]:0;const s=randomIndice(this.distribution,t()),o=this.wave[e];for(let t=0;t<this.T;t++)o[t]!==(t===s)&&this.ban(e,t);return null},Model.prototype.propagate=function(){for(;this.stackSize>0;){const t=this.stack[this.stackSize-1];this.stackSize--;const i=t[0],e=i%this.FMX,s=i/this.FMX|0;for(let i=0;i<4;i++){let o=e+this.DX[i],h=s+this.DY[i];if(this.onBoundary(o,h))continue;o<0?o+=this.FMX:o>=this.FMX&&(o-=this.FMX),h<0?h+=this.FMY:h>=this.FMY&&(h-=this.FMY);const r=o+h*this.FMX,n=this.propagator[i][t[1]],l=this.compatible[r];for(let t=0;t<n.length;t++){const e=n[t],s=l[e];s[i]--,0==s[i]&&this.ban(r,e)}}}},Model.prototype.singleIteration=function(t){const i=this.observe(t);return null!==i?(this.generationComplete=i,!!i):(this.propagate(),null)},Model.prototype.iterate=function(t,i){this.wave||this.initialize(),this.initiliazedField||this.clear(),t=t||0,i=i||Math.random;for(let e=0;e<t||0===t;e++){const t=this.singleIteration(i);if(null!==t)return!!t}return!0},Model.prototype.generate=function(t){for(t=t||Math.random,this.wave||this.initialize(),this.clear();;){const i=this.singleIteration(t);if(null!==i)return!!i}},Model.prototype.isGenerationComplete=function(){return this.generationComplete},Model.prototype.ban=function(t,i){const e=this.compatible[t][i];for(let t=0;t<4;t++)e[t]=0;this.wave[t][i]=!1,this.stack[this.stackSize]=[t,i],this.stackSize++,this.sumsOfOnes[t]-=1,this.sumsOfWeights[t]-=this.weights[i],this.sumsOfWeightLogWeights[t]-=this.weightLogWeights[i];const s=this.sumsOfWeights[t];this.entropies[t]=Math.log(s)-this.sumsOfWeightLogWeights[t]/s},Model.prototype.clear=function(){for(let t=0;t<this.FMXxFMY;t++){for(let i=0;i<this.T;i++){this.wave[t][i]=!0;for(let e=0;e<4;e++)this.compatible[t][i][e]=this.propagator[this.opposite[e]][i].length}this.sumsOfOnes[t]=this.weights.length,this.sumsOfWeights[t]=this.sumOfWeights,this.sumsOfWeightLogWeights[t]=this.sumOfWeightLogWeights,this.entropies[t]=this.startingEntropy}this.initiliazedField=!0,this.generationComplete=!1};const OverlappingModel=function(t,i,e,s,o,h,r,n,l,p){p=p||0,this.N=s,this.FMX=o,this.FMY=h,this.FMXxFMY=o*h,this.periodic=n;const a=i,M=new Array(a);for(let t=0;t<a;t++)M[t]=new Array(e);this.colors=[];const g={};for(let s=0;s<e;s++)for(let e=0;e<i;e++){const o=4*(s*i+e),h=[t[o],t[o+1],t[o+2],t[o+3]],r=h.join("-");g.hasOwnProperty(r)||(g[r]=this.colors.length,this.colors.push(h)),M[e][s]=g[r]}const f=this.colors.length,u=Math.pow(f,s*s),c=function(t){let i=new Array(s*s);for(let e=0;e<s;e++)for(let o=0;o<s;o++)i[o+e*s]=t(o,e);return i},d=function(t,s){return c(function(o,h){return M[(t+o)%i][(s+h)%e]})},y=function(t){return c(function(i,e){return t[s-1-e+i*s]})},F=function(t){return c(function(i,e){return t[s-1-i+e*s]})},w=function(t){let i=0,e=1;for(let s=0;s<t.length;s++)i+=t[t.length-1-s]*e,e*=f;return i},m=function(t){let i=t,e=u;const o=new Array(s*s);for(let t=0;t<o.length;t++){e/=f;let s=0;for(;i>=e;)i-=e,s++;o[t]=s}return o},O={},X=[];for(let t=0;t<(r?e:e-s+1);t++)for(let e=0;e<(r?i:i-s+1);e++){const i=new Array(8);i[0]=d(e,t),i[1]=F(i[0]),i[2]=y(i[0]),i[3]=F(i[2]),i[4]=y(i[2]),i[5]=F(i[4]),i[6]=y(i[4]),i[7]=F(i[6]);for(let t=0;t<l;t++){const e=w(i[t]);O[e]?O[e]++:(X.push(e),O[e]=1)}}this.T=X.length,this.ground=(p+this.T)%this.T,this.patterns=new Array(this.T),this.weights=new Array(this.T);for(let t=0;t<this.T;t++){const i=parseInt(X[t],10);this.patterns[t]=m(i),this.weights[t]=O[i]}const W=function(t,i,e,o){const h=e<0?0:e,r=e<0?e+s:s,n=o<0?o+s:s;for(let l=o<0?0:o;l<n;l++)for(let n=h;n<r;n++)if(t[n+s*l]!=i[n-e+s*(l-o)])return!1;return!0};this.propagator=new Array(4);for(let t=0;t<4;t++){this.propagator[t]=new Array(this.T);for(let i=0;i<this.T;i++){const e=[];for(let s=0;s<this.T;s++)W(this.patterns[i],this.patterns[s],this.DX[t],this.DY[t])&&e.push(s);this.propagator[t][i]=e}}};(OverlappingModel.prototype=Object.create(Model.prototype)).constructor=OverlappingModel,OverlappingModel.prototype.onBoundary=function(t,i){return!this.periodic&&(t+this.N>this.FMX||i+this.N>this.FMY||t<0||i<0)},OverlappingModel.prototype.clear=function(){if(Model.prototype.clear.call(this),0!==this.ground){for(let t=0;t<this.FMX;t++){for(let i=0;i<this.T;i++)i!==this.ground&&this.ban(t+(this.FMY-1)*this.FMX,i);for(let i=0;i<this.FMY-1;i++)this.ban(t+i*this.FMX,this.ground)}this.propagate()}},OverlappingModel.prototype.graphics=function(t){return t=t||new Uint8Array(4*this.FMXxFMY),this.isGenerationComplete()?this.graphicsComplete(t):this.graphicsIncomplete(t),t},OverlappingModel.prototype.graphicsComplete=function(t){for(let i=0;i<this.FMY;i++){const e=i<this.FMY-this.N+1?0:this.N-1;for(let s=0;s<this.FMX;s++){const o=s<this.FMX-this.N+1?0:this.N-1,h=4*(i*this.FMX+s),r=this.colors[this.patterns[this.observed[s-o+(i-e)*this.FMX]][o+e*this.N]];t[h]=r[0],t[h+1]=r[1],t[h+2]=r[2],t[h+3]=r[3]}}},OverlappingModel.prototype.graphicsIncomplete=function(t){for(let i=0;i<this.FMXxFMY;i++){const e=i%this.FMX,s=i/this.FMX|0;let o=0,h=0,r=0,n=0,l=0;for(let t=0;t<this.N;t++)for(let i=0;i<this.N;i++){let p=e-i;p<0&&(p+=this.FMX);let a=s-t;if(a<0&&(a+=this.FMY),this.onBoundary(p,a))continue;const M=p+a*this.FMX;for(let e=0;e<this.T;e++)if(this.wave[M][e]){o++;const s=this.colors[this.patterns[e][i+t*this.N]];h+=s[0],r+=s[1],n+=s[2],l+=s[3]}}const p=4*i;t[p]=h/o,t[p+1]=r/o,t[p+2]=n/o,t[p+3]=l/o}};

let requestsIdsToStop = new Set();
onmessage = async function(e) {
  if(e.data.stopRequestId) {
    console.log("Worker recieved stopRequestId:", e.data.stopRequestId);
    requestsIdsToStop.add(e.data.stopRequestId);
    return;
  }
  postMessage({type:'message', message: '> WebWorker recieved message'});

  let tries = 0;
  let instance = new OverlappingModel(new Uint8Array(e.data.sampleData), e.data.sampleWidth, e.data.sampleHeight, e.data.n, e.data.width, e.data.height, e.data.periodicInput, e.data.periodic, e.data.symmetry, e.data.ground);

  postMessage({type:'message', message: '> Instanciated OverlappingModel'});

  let finished = false;
  let time;
  
  function sendResult() {
    let messageObject = {
      type: 'data',
      // data: finished ? instance.graphics(new Uint8Array(e.data.outputData)).buffer : e.data.outputData,
      data: instance.graphics(new Uint8Array(e.data.outputData)).buffer.slice(0),
      width: e.data.width,
      height: e.data.height,
      finished: finished,
      requestId: e.data.requestId,
    };
    postMessage(messageObject, [messageObject.data]);
  }
  
  let maxTries = 4;
  do {
    tries++;
    postMessage({type:'message', message: `> Generation attempt #${tries} ut of ${maxTries}`});
    time = Date.now();
    finished = instance.generate(); // if you want to "animate" it you could replace this with the contents of the generate function and then call sendResult every N iterations: https://github.com/kchapelier/wavefunctioncollapse/blob/f1374ee2c04d197afe6d01652f87663a68cbf6a5/model.js#L242
    postMessage({type:'message', message: `> Generation ${finished ? 'successful' : 'UNsuccessful'} - took ${Date.now() - time} ms`});
    
    if(!finished) {
      await new Promise(r => setTimeout(r, 50)); // wait a tiny bit for stopRequestId messages to arrive
      if(requestsIdsToStop.has(e.data.requestId)) return;
    }
  } while (tries < maxTries && !finished);
  
  sendResult();
  
};
