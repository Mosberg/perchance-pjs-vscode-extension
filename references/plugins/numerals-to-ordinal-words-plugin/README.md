# numerals-to-ordinal-words-plugin — complete source & asset export

Perchance generator: https://perchance.org/numerals-to-ordinal-words-plugin
Spells a numeral out as an English ordinal word: `18` -> `eighteenth`, `786` -> `seven hundred and eighty-sixth`.
Uses big.js v4.0.2 (MIT) for arbitrary-precision chunking.

## Package contents

| Category | Path |
|---|---|
| Internal code | internal-code/main.pjs |
| Internal code | internal-code/index.html |
| External code (dependencies) | none - main.pjs has no `{import:...}` statements |
| Third-party assets | third-party/big.js-4.0.2/big.js, big.min.js, LICENCE |
| Project resources | none - no images/audio/models/shaders/animations/JSON/prefabs/templates |
| Metadata | MANIFEST.json (byte sizes + SHA-256 of every file) |

## main.pjs - full source

```pjs
$output(n) =>
  if(!window.numeralsToOrdinalWordsPlugin_INITIALIZED) init();
  if(n == "") return ""; 
  n = String(n).replace(/[ ,.]+/g,"");
  if(n == 0) return "zero";
  if(String(n).substring(0,1) == "-") n = String(n).substring(1);
  let answer = chunk(n).map(inEnglish).map(appendScale).filter(item => !!item).reverse().join(" ");
  // add "ands"
  answer += " ";
  answer = answer.replace(/( [a-z]+\-[a-z]+ )/g," and$1");
  answer = answer.replace(/( (?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|fourty|fifty|sixty|seventy|eighty|ninety))\s?$/g," and$1");
	answer = answer.trim();
	let endsWithSwaps = {
	  " twelve": " twelfth",
	  " eleven": " eleventh",
	  " ten": " tenth",
	  "ty": "tieth",
	  "teen": "teenth",
	  "-one": "-first",
	  "-two": "-second",
	  "-three": "-third",
	  "-four": "-fourth",
	  "-five": "-fifth",
	  "-six": "-sixth",
	  "-seven": "-seventh",
	  "-eight": "-eighth",
	  "-nine": "-nineth",
	};
	for(let [a, b] of Object.entries(endsWithSwaps)) {
		let r = new RegExp(a+"$");
	  if(answer.endsWith(a)) {
		  answer = answer.replace(r, b);
			return answer;
		}
	}
	let fullSwaps = {
	  "one": "first",
	  "two": "second",
	  "three": "third",
	  "four": "fourth",
	  "five": "fifth",
	  "six": "sixth",
	  "seven": "seventh",
	  "eight": "eighth",
	  "nine": "ninth",
	  "ten": "tenth",
	  "eleven": "eleventh",
	  "twelve": "twelfth"
	};
	for(let [a, b] of Object.entries(fullSwaps)) {
		let r = new RegExp(a+"$");
	  if(answer === a) {
		  answer = answer.replace(r, b);
			return answer;
		}
	}
	return answer+"th"; // final fallback for "hundredth", "thousandth", etc.

//convert a number into "chunks" of 0-999
chunk (number) =>
  var thousands = [];
  number = new Big(number);
  while( number.gt(0) ) {
    thousands.push( number.mod(1000).toString() );
    number = number.div(1000).round(0,0);
  }
  return thousands;


// translate a number from 1-999 into English
inEnglish (number) =>
  var thousands, hundreds, tens, ones, words = [];
  if(number < 20) {
    return window.digitsToWords_ONE_TO_NINETEEN[number - 1]; // may be undefined
  }
  if(number < 100) {
    ones = number % 10;
    tens = number / 10 | 0; // equivalent to Math.floor(number / 10)
    words.push(window.digitsToWords_TENS[tens - 1]);
    words.push(inEnglish(ones));
    return words.filter(item => !!item).join("-");
  }
  hundreds = number / 100 | 0;
  words.push(inEnglish(hundreds));
  words.push("hundred");
  words.push(inEnglish(number % 100));
  return words.filter(item => !!item).join(" ");

// append the word for a scale. Made for use with Array.map
appendScale(chunk, exp) =>
  var scale;
  if(!chunk) {
    return null;
  }
  scale = window.digitsToWords_SCALES[exp - 1];
  return [chunk, scale].filter(item => !!item).join(" ");



init () =>
  window.numeralsToOrdinalWordsPlugin_INITIALIZED = true;
	/* big.js v4.0.2 https://github.com/MikeMcl/big.js/LICENCE */
	!function(r){"use strict";function e(){function r(t){var i=this;return i instanceof r?(t instanceof r?(i.s=t.s,i.e=t.e,i.c=t.c.slice()):n(i,t),void(i.constructor=r)):t===p?e():new r(t)}return r.prototype=a,r.DP=s,r.RM=f,r.NE=h,r.PE=l,r}function t(r,e,t){var n=r.constructor,o=e-(r=new n(r)).e,s=r.c;for(s.length>++e&&i(r,o,n.RM),s[0]?t?o=e:(s=r.c,o=r.e+o+1):++o;s.length<o;)s.push(0);return o=r.e,1===t||t&&(o>=e||o<=n.NE)?(r.s<0&&s[0]?"-":"")+(s.length>1?s[0]+"."+s.join("").slice(1):s[0])+(0>o?"e":"e+")+o:r.toString()}function n(r,e){var t,n,i;if(0===e&&0>1/e)e="-0";else if(!g.test(e+=""))throw Error(w+NaN);for(r.s="-"==e.charAt(0)?(e=e.slice(1),-1):1,(t=e.indexOf("."))>-1&&(e=e.replace(".","")),(n=e.search(/e/i))>0?(0>t&&(t=n),t+=+e.slice(n+1),e=e.substring(0,n)):0>t&&(t=e.length),i=e.length,n=0;i>n&&"0"==e.charAt(n);)++n;if(n==i)r.c=[r.e=0];else{for(;i>0&&"0"==e.charAt(--i););for(r.e=t-n-1,r.c=[],t=0;i>=n;)r.c[t++]=+e.charAt(n++)}return r}function i(r,e,t,n){var i=r.c,o=r.e+e+1;if(1===t)n=i[o]>=5;else if(2===t)n=i[o]>5||5==i[o]&&(n||0>o||i[o+1]!==p||1&i[o-1]);else if(3===t)n=n||i[o]!==p||0>o;else if(n=!1,0!==t)throw Error(w+"RM: "+t);if(1>o||!i[0])n?(r.e=-e,r.c=[1]):r.c=[r.e=0];else{if(i.length=o--,n)for(;++i[o]>9;)i[o]=0,o--||(++r.e,i.unshift(1));for(o=i.length;!i[--o];)i.pop()}return r}var o,s=20,f=1,c=1e6,u=1e6,h=-7,l=21,a={},g=/^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,w="[BigError] ",p=void 0;a.abs=function(){var r=new this.constructor(this);return r.s=1,r},a.cmp=function(r){var e,t=this,n=t.c,i=(r=new t.constructor(r)).c,o=t.s,s=r.s,f=t.e,c=r.e;if(!n[0]||!i[0])return n[0]?o:i[0]?-s:0;if(o!=s)return o;if(e=0>o,f!=c)return f>c^e?1:-1;for(o=-1,s=(f=n.length)<(c=i.length)?f:c;++o<s;)if(n[o]!=i[o])return n[o]>i[o]^e?1:-1;return f==c?0:f>c^e?1:-1},a.div=function(r){var e=this,t=e.constructor,n=e.c,o=(r=new t(r)).c,s=e.s==r.s?1:-1,f=t.DP;if(f!==~~f||0>f||f>c)throw Error(w+"DP: "+f);if(!n[0]||!o[0]){if(n[0]==o[0])throw Error(w+NaN);if(!o[0])throw Error(w+s/0);return new t(0*s)}var u,h,l,a,g,v=o.slice(),d=u=o.length,E=n.length,m=n.slice(0,u),N=m.length,P=r,M=P.c=[],R=0,D=f+(P.e=e.e-r.e)+1;for(P.s=s,s=0>D?0:D,v.unshift(0);N++<u;)m.push(0);do{for(l=0;10>l;l++){if(u!=(N=m.length))a=u>N?1:-1;else for(g=-1,a=0;++g<u;)if(o[g]!=m[g]){a=o[g]>m[g]?1:-1;break}if(!(0>a))break;for(h=N==u?o:v;N;){if(m[--N]<h[N]){for(g=N;g&&!m[--g];)m[g]=9;--m[g],m[N]+=10}m[N]-=h[N]}for(;!m[0];)m.shift()}M[R++]=a?l:++l,m[0]&&a?m[N]=n[d]||0:m=[n[d]]}while((d++<E||m[0]!==p)&&s--);return M[0]||1==R||(M.shift(),P.e--),R>D&&i(P,f,t.RM,m[0]!==p),P},a.eq=function(r){return!this.cmp(r)},a.gt=function(r){return this.cmp(r)>0},a.gte=function(r){return this.cmp(r)>-1},a.lt=function(r){return this.cmp(r)<0},a.lte=function(r){return this.cmp(r)<1},a.sub=a.minus=function(r){var e,t,n,i,o=this,s=o.constructor,f=o.s,c=(r=new s(r)).s;if(f!=c)return r.s=-c,o.plus(r);var u=o.c.slice(),h=o.e,l=r.c,a=r.e;if(!u[0]||!l[0])return l[0]?(r.s=-c,r):new s(u[0]?o:0);if(f=h-a){for((i=0>f)?(f=-f,n=u):(a=h,n=l),n.reverse(),c=f;c--;)n.push(0);n.reverse()}else for(t=((i=u.length<l.length)?u:l).length,f=c=0;t>c;c++)if(u[c]!=l[c]){i=u[c]<l[c];break}if(i&&(n=u,u=l,l=n,r.s=-r.s),(c=(t=l.length)-(e=u.length))>0)for(;c--;)u[e++]=0;for(c=e;t>f;){if(u[--t]<l[t]){for(e=t;e&&!u[--e];)u[e]=9;--u[e],u[t]+=10}u[t]-=l[t]}for(;0===u[--c];)u.pop();for(;0===u[0];)u.shift(),--a;return u[0]||(r.s=1,u=[a=0]),r.c=u,r.e=a,r},a.mod=function(r){var e,t=this,n=t.constructor,i=t.s,o=(r=new n(r)).s;if(!r.c[0])throw Error(w+NaN);return t.s=r.s=1,e=1==r.cmp(t),t.s=i,r.s=o,e?new n(t):(i=n.DP,o=n.RM,n.DP=n.RM=0,t=t.div(r),n.DP=i,n.RM=o,this.minus(t.times(r)))},a.add=a.plus=function(r){var e,t=this,n=t.constructor,i=t.s,o=(r=new n(r)).s;if(i!=o)return r.s=-o,t.minus(r);var s=t.e,f=t.c,c=r.e,u=r.c;if(!f[0]||!u[0])return u[0]?r:new n(f[0]?t:0*i);if(f=f.slice(),i=s-c){for(i>0?(c=s,e=u):(i=-i,e=f),e.reverse();i--;)e.push(0);e.reverse()}for(f.length-u.length<0&&(e=u,u=f,f=e),i=u.length,o=0;i;f[i]%=10)o=(f[--i]=f[i]+u[i]+o)/10|0;for(o&&(f.unshift(o),++c),i=f.length;0===f[--i];)f.pop();return r.c=f,r.e=c,r},a.pow=function(r){var e=this,t=new e.constructor(1),n=t,i=0>r;if(r!==~~r||-u>r||r>u)throw Error(w+r);for(r=i?-r:r;1&r&&(n=n.times(e)),r>>=1,r;)e=e.times(e);return i?t.div(n):n},a.round=function(r,e){var t=this,n=t.constructor;if(r===p)r=0;else if(r!==~~r||0>r||r>c)throw Error(w+r);return i(new n(t),r,e===p?n.RM:e)},a.sqrt=function(){var r,e,t,n=this,o=n.constructor,s=n.c,f=n.s,c=n.e,u=new o("0.5");if(!s[0])return new o(n);if(0>f)throw Error(w+NaN);f=Math.sqrt(n.toString()),0===f||f===1/0?(r=s.join(""),r.length+c&1||(r+="0"),e=new o(Math.sqrt(r).toString()),e.e=((c+1)/2|0)-(0>c||1&c)):e=new o(f.toString()),f=e.e+(o.DP+=4);do t=e,e=u.times(t.plus(n.div(t)));while(t.c.slice(0,f).join("")!==e.c.slice(0,f).join(""));return i(e,o.DP-=4,o.RM)},a.mul=a.times=function(r){var e,t=this,n=t.constructor,i=t.c,o=(r=new n(r)).c,s=i.length,f=o.length,c=t.e,u=r.e;if(r.s=t.s==r.s?1:-1,!i[0]||!o[0])return new n(0*r.s);for(r.e=c+u,f>s&&(e=i,i=o,o=e,u=s,s=f,f=u),e=new Array(u=s+f);u--;)e[u]=0;for(c=f;c--;){for(f=0,u=s+c;u>c;)f=e[u]+o[c]*i[u-c-1]+f,e[u--]=f%10,f=f/10|0;e[u]=(e[u]+f)%10}for(f?++r.e:e.shift(),c=e.length;!e[--c];)e.pop();return r.c=e,r},a.toString=a.valueOf=a.toJSON=function(){var r=this,e=r.constructor,t=r.e,n=r.c.join(""),i=n.length;if(t<=e.NE||t>=e.PE)n=n.charAt(0)+(i>1?"."+n.slice(1):"")+(0>t?"e":"e+")+t;else if(0>t){for(;++t;)n="0"+n;n="0."+n}else if(t>0)if(++t>i)for(t-=i;t--;)n+="0";else i>t&&(n=n.slice(0,t)+"."+n.slice(t));else i>1&&(n=n.charAt(0)+"."+n.slice(1));return r.s<0&&r.c[0]?"-"+n:n},a.toExponential=function(r){if(r===p)r=this.c.length-1;else if(r!==~~r||0>r||r>c)throw Error(w+r);return t(this,r,1)},a.toFixed=function(r){var e,n=this,i=n.constructor,o=i.NE,s=i.PE;if(i.NE=-(i.PE=1/0),r===p?e=n.toString():r===~~r&&r>=0&&c>=r&&(e=t(n,n.e+r),n.s<0&&n.c[0]&&e.indexOf("-")<0&&(e="-"+e)),i.NE=o,i.PE=s,!e)throw Error(w+r);return e},a.toPrecision=function(r){if(r===p)return this.toString();if(r!==~~r||1>r||r>c)throw Error(w+r);return t(this,r-1,2)},o=e(),o["default"]=o.Big=o,"function"==typeof define&&define.amd?define(function(){return o}):"undefined"!=typeof module&&module.exports?module.exports=o:r.Big=o}(this);
	window.digitsToWords_ONE_TO_NINETEEN = [ "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen" ];
	window.digitsToWords_TENS = [ "ten", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety" ];
	window.digitsToWords_SCALES = ["thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion", "decillion", "undecillion", "duodecillion", "tredecillion", "quattuordecillion", "quindecillion", "sexdecillion", "septendecillion", "ocodecillion", "novemdecillion", "vigintillion", "unvigintillion", "duovigintillion", "trevigintillion","quattuorvigintillion","quinvigintillion","sexvigintillion","septenvigintillion","octovigintillion","novemvigintillion","trigintillion","untrigintillion","duotrigintillion","tretrigintillion","quattuortrigintillion","quintrigintillion","sextrigintillion","septentrigintillion","octotrigintillion","novemtrigintillion","quadragintillion","unquadragintillion","duoquadragintillion","tresquadragintillion","quattuorquadragintillion","quindragintillion","sesquadragintillion","septenquadragintillion","octoquadragintillion","novenquadragintillion","quinquagintillion","unquinquagintillion","duoquinquagintillion","tresquinquagintillion","quattuorquinquagintillion","quinquinquagintillion","sesquinquagintillion","septenquinquagintillion","octoquinquagintillion","novenquinquagintillion","sexagintillion","unsexagintillion","duosexagintillion","tresexagintillion","quattuorsexagintillion","quinsexagintillion","sesexagintillion","septensexagintillion","octosexagintillion","novensexagintillion","septuagintillion","unseptuagintillion","duoseptuagintillion","treseptuagintillion","quattuorseptuagintillion","quinseptuagintillion","seseptuagintillion","septenseptuagintillion","octoseptuagintillion","novenseptuagintillion","octogintillion","unoctogintillion","duooctogintillion","tresoctogintillion","quattuoroctogintillion","quinoctogintillion","sexoctogintillion","septemoctogintillion","octooctogintillion","novemoctogintillion","nonagintillion","unnonagintillion","duononagintillion","trenonagintillion","quattuornonagintillion","quinnonagintillion","senonagintillion","septenonagintillion","octononagintillion","novenonagintillion","centillion","uncentillion","duocentillion","trescentillion","quattuorcentillion","quincentillion","sexcentillion","septencentillion","octocentillion","novencentillion","decicentillion","undecicentillion","duodecicentillion","tredecicentillion","quattuordecicentillion","quindecicentillion","sedecicentillion","septendecicentillion","octodecicentillion","novendecicentillion","viginticentillion","unviginticentillion","duoviginticentillion","tresviginticentillion","quattuorviginticentillion","quinviginticentillion","sesviginticentillion","septemviginticentillion","octoviginticentillion","novemviginticentillion","trigintacentillion","untrigintacentillion","duotrigintacentillion","trestrigintacentillion","quattuortrigintacentillion","quintrigintacentillion","sestrigintacentillion","septentrigintacentillion","octotrigintacentillion","noventrigintacentillion","quadragintacentillion","unquadragintacentillion","duoquadragintacentillion","tresquadragintacentillion","quattuorquadragintacentillion","quinquadragintacentillion","sesquadragintacentillion","septenquadragintacentillion","octoquadragintacentillion","novenquadragintacentillion","quinquagintacentillion","unquinquagintacentillion","duoquinquagintacentillion","tresquinquagintacentillion","quattuorquinquagintacentillion","quinquinquagintacentillion","sesquinquagintacentillion","septenquinquagintacentillion","octoquinquagintacentillion","novenquinquagintacentillion","sexagintacentillion","unsexagintacentillion","duosexagintacentillion","tresexagintacentillion","quattuorsexagintacentillion","quinsexagintacentillion","sesexagintacentillion","septensexagintacentillion","octosexagintacentillion","novensexagintacentillion","septuagintacentillion","unseptuagintacentillion","duoseptuagintacentillion","treseptuagintacentillion","quattuorseptuagintacentillion","quinseptuagintacentillion","seseptuagintacentillion","septenseptuagintacentillion","octoseptuagintacentillion","novenseptuagintacentillion","octogintacentillion","unoctogintacentillion","duooctogintacentillion","tresoctogintacentillion","quattuoroctogintacentillion","quinoctogintacentillion","sexoctogintacentillion","septemoctogintacentillion","octooctogintacentillion","novemoctogintacentillion","nonagintacentillion","unnonagintacentillion","duononagintacentillion","trenonagintacentillion","quattuornonagintacentillion","quinnonagintacentillion","senonagintacentillion","septenonagintacentillion","octononagintacentillion","novenonagintacentillion","ducentillion","unducentillion","duoducentillion","treducentillion","quattuorducentillion","quinducentillion","seducentillion","septenducentillion","octoducentillion","novenducentillion","deciducentillion","undeciducentillion","duodeciducentillion","tredeciducentillion","quattuordeciducentillion","quindeciducentillion","sedeciducentillion","septendeciducentillion","octodeciducentillion","novendeciducentillion","vigintiducentillion","unvigintiducentillion","duovigintiducentillion","tresvigintiducentillion","quattuorvigintiducentillion","quinvigintiducentillion","sesvigintiducentillion","septemvigintiducentillion","octovigintiducentillion","novemvigintiducentillion","trigintaducentillion","untrigintaducentillion","duotrigintaducentillion","trestrigintaducentillion","quattuortrigintaducentillion","quintrigintaducentillion","sestrigintaducentillion","septentrigintaducentillion","octotrigintaducentillion","noventrigintaducentillion","quadragintaducentillion","unquadragintaducentillion","duoquadragintaducentillion","tresquadragintaducentillion","quattuorquadragintaducentillion","quinquadragintaducentillion","sesquadragintaducentillion","septenquadragintaducentillion","octoquadragintaducentillion","novenquadragintaducentillion","quinquagintaducentillion","unquinquagintaducentillion","duoquinquagintaducentillion","tresquinquagintaducentillion","quattuorquinquagintaducentillion","quinquinquagintaducentillion","sesquinquagintaducentillion","septenquinquagintaducentillion","octoquinquagintaducentillion","novenquinquagintaducentillion","sexagintaducentillion","unsexagintaducentillion","duosexagintaducentillion","tresexagintaducentillion","quattuorsexagintaducentillion","quinsexagintaducentillion","sesexagintaducentillion","septensexagintaducentillion","octosexagintaducentillion","novensexagintaducentillion","septuagintaducentillion","unseptuagintaducentillion","duoseptuagintaducentillion","treseptuagintaducentillion","quattuorseptuagintaducentillion","quinseptuagintaducentillion","seseptuagintaducentillion","septenseptuagintaducentillion","octoseptuagintaducentillion","novenseptuagintaducentillion","octogintaducentillion","unoctogintaducentillion","duooctogintaducentillion","tresoctogintaducentillion","quattuoroctogintaducentillion","quinoctogintaducentillion","sexoctogintaducentillion","septemoctogintaducentillion","octooctogintaducentillion","novemoctogintaducentillion","nonagintaducentillion","unnonagintaducentillion","duononagintaducentillion","trenonagintaducentillion","quattuornonagintaducentillion","quinnonagintaducentillion","senonagintaducentillion","septenonagintaducentillion","octononagintaducentillion","novenonagintaducentillion","trecentillion","untrecentillion","duotrecentillion","trestrecentillion","quattuortrecentillion","quintrecentillion","sestrecentillion","septentrecentillion","octotrecentillion","noventrecentillion","decitrecentillion","undecitrecentillion","duodecitrecentillion","tredecitrecentillion","quattuordecitrecentillion","quindecitrecentillion","sedecitrecentillion","septendecitrecentillion","octodecitrecentillion","novendecitrecentillion","vigintitrecentillion","unvigintitrecentillion","duovigintitrecentillion","tresvigintitrecentillion","quattuorvigintitrecentillion","quinvigintitrecentillion","sesvigintitrecentillion","septemvigintitrecentillion","octovigintitrecentillion","novemvigintitrecentillion","trigintatrecentillion","untrigintatrecentillion","duotrigintatrecentillion","trestrigintatrecentillion","quattuortrigintatrecentillion","quintrigintatrecentillion","sestrigintatrecentillion","septentrigintatrecentillion","octotrigintatrecentillion","noventrigintatrecentillion","quadragintatrecentillion","unquadragintatrecentillion","duoquadragintatrecentillion","tresquadragintatrecentillion","quattuorquadragintatrecentillion","quinquadragintatrecentillion","sesquadragintatrecentillion","septenquadragintatrecentillion","octoquadragintatrecentillion","novenquadragintatrecentillion","quinquagintatrecentillion","unquinquagintatrecentillion","duoquinquagintatrecentillion","tresquinquagintatrecentillion","quattuorquinquagintatrecentillion","quinquinquagintatrecentillion","sesquinquagintatrecentillion","septenquinquagintatrecentillion","octoquinquagintatrecentillion","novenquinquagintatrecentillion","sexagintatrecentillion","unsexagintatrecentillion","duosexagintatrecentillion","tresexagintatrecentillion","quattuorsexagintatrecentillion","quinsexagintatrecentillion","sesexagintatrecentillion","septensexagintatrecentillion","octosexagintatrecentillion","novensexagintatrecentillion","septuagintatrecentillion","unseptuagintatrecentillion","duoseptuagintatrecentillion","treseptuagintatrecentillion","quattuorseptuagintatrecentillion","quinseptuagintatrecentillion","seseptuagintatrecentillion","septenseptuagintatrecentillion","octoseptuagintatrecentillion","novenseptuagintatrecentillion","octogintatrecentillion","unoctogintatrecentillion","duooctogintatrecentillion","tresoctogintatrecentillion","quattuoroctogintatrecentillion","quinoctogintatrecentillion","sexoctogintatrecentillion","septemoctogintatrecentillion","octooctogintatrecentillion","novemoctogintatrecentillion","nonagintatrecentillion","unnonagintatrecentillion","duononagintatrecentillion","trenonagintatrecentillion","quattuornonagintatrecentillion","quinnonagintatrecentillion","senonagintatrecentillion","septenonagintatrecentillion","octononagintatrecentillion","novenonagintatrecentillion","quadringentillion","unquadringentillion","duoquadringentillion","tresquadringentillion","quattuorquadringentillion","quinquadringentillion","sesquadringentillion","septenquadringentillion","octoquadringentillion","novenquadringentillion","deciquadringentillion","undeciquadringentillion","duodeciquadringentillion","tredeciquadringentillion","quattuordeciquadringentillion","quindeciquadringentillion","sedeciquadringentillion","septendeciquadringentillion","octodeciquadringentillion","novendeciquadringentillion","vigintiquadringentillion","unvigintiquadringentillion","duovigintiquadringentillion","tresvigintiquadringentillion","quattuorvigintiquadringentillion","quinvigintiquadringentillion","sesvigintiquadringentillion","septemvigintiquadringentillion","octovigintiquadringentillion","novemvigintiquadringentillion","trigintaquadringentillion","untrigintaquadringentillion","duotrigintaquadringentillion","trestrigintaquadringentillion","quattuortrigintaquadringentillion","quintrigintaquadringentillion","sestrigintaquadringentillion","septentrigintaquadringentillion","octotrigintaquadringentillion","noventrigintaquadringentillion","quadragintaquadringentillion","unquadragintaquadringentillion","duoquadragintaquadringentillion","tresquadragintaquadringentillion","quattuorquadragintaquadringentillion","quinquadragintaquadringentillion","sesquadragintaquadringentillion","septenquadragintaquadringentillion","octoquadragintaquadringentillion","novenquadragintaquadringentillion","quinquagintaquadringentillion","unquinquagintaquadringentillion","duoquinquagintaquadringentillion","tresquinquagintaquadringentillion","quattuorquinquagintaquadringentillion","quinquinquagintaquadringentillion","sesquinquagintaquadringentillion","septenquinquagintaquadringentillion","octoquinquagintaquadringentillion","novenquinquagintaquadringentillion","sexagintaquadringentillion","unsexagintaquadringentillion","duosexagintaquadringentillion","tresexagintaquadringentillion","quattuorsexagintaquadringentillion","quinsexagintaquadringentillion","sesexagintaquadringentillion","septensexagintaquadringentillion","octosexagintaquadringentillion","novensexagintaquadringentillion","septuagintaquadringentillion","unseptuagintaquadringentillion","duoseptuagintaquadringentillion","treseptuagintaquadringentillion","quattuorseptuagintaquadringentillion","quinseptuagintaquadringentillion","seseptuagintaquadringentillion","septenseptuagintaquadringentillion","octoseptuagintaquadringentillion","novenseptuagintaquadringentillion","octogintaquadringentillion","unoctogintaquadringentillion","duooctogintaquadringentillion","tresoctogintaquadringentillion","quattuoroctogintaquadringentillion","quinoctogintaquadringentillion","sexoctogintaquadringentillion","septemoctogintaquadringentillion","octooctogintaquadringentillion","novemoctogintaquadringentillion","nonagintaquadringentillion","unnonagintaquadringentillion","duononagintaquadringentillion","trenonagintaquadringentillion","quattuornonagintaquadringentillion","quinnonagintaquadringentillion","senonagintaquadringentillion","septenonagintaquadringentillion","octononagintaquadringentillion","novenonagintaquadringentillion","quingentillion","unquingentillion","duoquingentillion","tresquingentillion","quattuorquingentillion","quinquingentillion","sesquingentillion","septenquingentillion","octoquingentillion","novenquingentillion","deciquingentillion","undeciquingentillion","duodeciquingentillion","tredeciquingentillion","quattuordeciquingentillion","quindeciquingentillion","sedeciquingentillion","septendeciquingentillion","octodeciquingentillion","novendeciquingentillion","vigintiquingentillion","unvigintiquingentillion","duovigintiquingentillion","tresvigintiquingentillion","quattuorvigintiquingentillion","quinvigintiquingentillion","sesvigintiquingentillion","septemvigintiquingentillion","octovigintiquingentillion","novemvigintiquingentillion","trigintaquingentillion","untrigintaquingentillion","duotrigintaquingentillion","trestrigintaquingentillion","quattuortrigintaquingentillion","quintrigintaquingentillion","sestrigintaquingentillion","septentrigintaquingentillion","octotrigintaquingentillion","noventrigintaquingentillion","quadragintaquingentillion","unquadragintaquingentillion","duoquadragintaquingentillion","tresquadragintaquingentillion","quattuorquadragintaquingentillion","quinquadragintaquingentillion","sesquadragintaquingentillion","septenquadragintaquingentillion","octoquadragintaquingentillion","novenquadragintaquingentillion","quinquagintaquingentillion","unquinquagintaquingentillion","duoquinquagintaquingentillion","tresquinquagintaquingentillion","quattuorquinquagintaquingentillion","quinquinquagintaquingentillion","sesquinquagintaquingentillion","septenquinquagintaquingentillion","octoquinquagintaquingentillion","novenquinquagintaquingentillion","sexagintaquingentillion","unsexagintaquingentillion","duosexagintaquingentillion","tresexagintaquingentillion","quattuorsexagintaquingentillion","quinsexagintaquingentillion","sesexagintaquingentillion","septensexagintaquingentillion","octosexagintaquingentillion","novensexagintaquingentillion","septuagintaquingentillion","unseptuagintaquingentillion","duoseptuagintaquingentillion","treseptuagintaquingentillion","quattuorseptuagintaquingentillion","quinseptuagintaquingentillion","seseptuagintaquingentillion","septenseptuagintaquingentillion","octoseptuagintaquingentillion","novenseptuagintaquingentillion","octogintaquingentillion","unoctogintaquingentillion","duooctogintaquingentillion","tresoctogintaquingentillion","quattuoroctogintaquingentillion","quinoctogintaquingentillion","sexoctogintaquingentillion","septemoctogintaquingentillion","octooctogintaquingentillion","novemoctogintaquingentillion","nonagintaquingentillion","unnonagintaquingentillion","duononagintaquingentillion","trenonagintaquingentillion","quattuornonagintaquingentillion","quinnonagintaquingentillion","senonagintaquingentillion","septenonagintaquingentillion","octononagintaquingentillion","novenonagintaquingentillion","sescentillion","unsescentillion","duosescentillion","tresescentillion","quattuorsescentillion","quinsescentillion","sesescentillion","septensescentillion","octosescentillion","novensescentillion","decisescentillion","undecisescentillion","duodecisescentillion","tredecisescentillion","quattuordecisescentillion","quindecisescentillion","sedecisescentillion","septendecisescentillion","octodecisescentillion","novendecisescentillion","vigintisescentillion","unvigintisescentillion","duovigintisescentillion","tresvigintisescentillion","quattuorvigintisescentillion","quinvigintisescentillion","sesvigintisescentillion","septemvigintisescentillion","octovigintisescentillion","novemvigintisescentillion","trigintasescentillion","untrigintasescentillion","duotrigintasescentillion","trestrigintasescentillion","quattuortrigintasescentillion","quintrigintasescentillion","sestrigintasescentillion","septentrigintasescentillion","octotrigintasescentillion","noventrigintasescentillion","quadragintasescentillion","unquadragintasescentillion","duoquadragintasescentillion","tresquadragintasescentillion","quattuorquadragintasescentillion","quinquadragintasescentillion","sesquadragintasescentillion","septenquadragintasescentillion","octoquadragintasescentillion","novenquadragintasescentillion","quinquagintasescentillion","unquinquagintasescentillion","duoquinquagintasescentillion","tresquinquagintasescentillion","quattuorquinquagintasescentillion","quinquinquagintasescentillion","sesquinquagintasescentillion","septenquinquagintasescentillion","octoquinquagintasescentillion","novenquinquagintasescentillion","sexagintasescentillion","unsexagintasescentillion","duosexagintasescentillion","tresexagintasescentillion","quattuorsexagintasescentillion","quinsexagintasescentillion","sesexagintasescentillion","septensexagintasescentillion","octosexagintasescentillion","novensexagintasescentillion","septuagintasescentillion","unseptuagintasescentillion","duoseptuagintasescentillion","treseptuagintasescentillion","quattuorseptuagintasescentillion","quinseptuagintasescentillion","seseptuagintasescentillion","septenseptuagintasescentillion","octoseptuagintasescentillion","novenseptuagintasescentillion","octogintasescentillion","unoctogintasescentillion","duooctogintasescentillion","tresoctogintasescentillion","quattuoroctogintasescentillion","quinoctogintasescentillion","sexoctogintasescentillion","septemoctogintasescentillion","octooctogintasescentillion","novemoctogintasescentillion","nonagintasescentillion","unnonagintasescentillion","duononagintasescentillion","trenonagintasescentillion","quattuornonagintasescentillion","quinnonagintasescentillion","senonagintasescentillion","septenonagintasescentillion","octononagintasescentillion","novenonagintasescentillion","septingentillion","unseptingentillion","duoseptingentillion","treseptingentillion","quattuorseptingentillion","quinseptingentillion","seseptingentillion","septenseptingentillion","octoseptingentillion","novenseptingentillion","deciseptingentillion","undeciseptingentillion","duodeciseptingentillion","tredeciseptingentillion","quattuordeciseptingentillion","quindeciseptingentillion","sedeciseptingentillion","septendeciseptingentillion","octodeciseptingentillion","novendeciseptingentillion","vigintiseptingentillion","unvigintiseptingentillion","duovigintiseptingentillion","tresvigintiseptingentillion","quattuorvigintiseptingentillion","quinvigintiseptingentillion","sesvigintiseptingentillion","septemvigintiseptingentillion","octovigintiseptingentillion","novemvigintiseptingentillion","trigintaseptingentillion","untrigintaseptingentillion","duotrigintaseptingentillion","trestrigintaseptingentillion","quattuortrigintaseptingentillion","quintrigintaseptingentillion","sestrigintaseptingentillion","septentrigintaseptingentillion","octotrigintaseptingentillion","noventrigintaseptingentillion","quadragintaseptingentillion","unquadragintaseptingentillion","duoquadragintaseptingentillion","tresquadragintaseptingentillion","quattuorquadragintaseptingentillion","quinquadragintaseptingentillion","sesquadragintaseptingentillion","septenquadragintaseptingentillion","octoquadragintaseptingentillion","novenquadragintaseptingentillion","quinquagintaseptingentillion","unquinquagintaseptingentillion","duoquinquagintaseptingentillion","tresquinquagintaseptingentillion","quattuorquinquagintaseptingentillion","quinquinquagintaseptingentillion","sesquinquagintaseptingentillion","septenquinquagintaseptingentillion","octoquinquagintaseptingentillion","novenquinquagintaseptingentillion","sexagintaseptingentillion","unsexagintaseptingentillion","duosexagintaseptingentillion","tresexagintaseptingentillion","quattuorsexagintaseptingentillion","quinsexagintaseptingentillion","sesexagintaseptingentillion","septensexagintaseptingentillion","octosexagintaseptingentillion","novensexagintaseptingentillion","septuagintaseptingentillion","unseptuagintaseptingentillion","duoseptuagintaseptingentillion","treseptuagintaseptingentillion","quattuorseptuagintaseptingentillion","quinseptuagintaseptingentillion","seseptuagintaseptingentillion","septenseptuagintaseptingentillion","octoseptuagintaseptingentillion","novenseptuagintaseptingentillion","octogintaseptingentillion","unoctogintaseptingentillion","duooctogintaseptingentillion","tresoctogintaseptingentillion","quattuoroctogintaseptingentillion","quinoctogintaseptingentillion","sexoctogintaseptingentillion","septemoctogintaseptingentillion","octooctogintaseptingentillion","novemoctogintaseptingentillion","nonagintaseptingentillion","unnonagintaseptingentillion","duononagintaseptingentillion","trenonagintaseptingentillion","quattuornonagintaseptingentillion","quinnonagintaseptingentillion","senonagintaseptingentillion","septenonagintaseptingentillion","octononagintaseptingentillion","novenonagintaseptingentillion","octingentillion","unoctingentillion","duooctingentillion","tresoctingentillion","quattuoroctingentillion","quinoctingentillion","sexoctingentillion","septemoctingentillion","octooctingentillion","novemoctingentillion","decioctingentillion","undecioctingentillion","duodecioctingentillion","tredecioctingentillion","quattuordecioctingentillion","quindecioctingentillion","sedecioctingentillion","septendecioctingentillion","octodecioctingentillion","novendecioctingentillion","vigintioctingentillion","unvigintioctingentillion","duovigintioctingentillion","tresvigintioctingentillion","quattuorvigintioctingentillion","quinvigintioctingentillion","sesvigintioctingentillion","septemvigintioctingentillion","octovigintioctingentillion","novemvigintioctingentillion","trigintaoctingentillion","untrigintaoctingentillion","duotrigintaoctingentillion","trestrigintaoctingentillion","quattuortrigintaoctingentillion","quintrigintaoctingentillion","sestrigintaoctingentillion","septentrigintaoctingentillion","octotrigintaoctingentillion","noventrigintaoctingentillion","quadragintaoctingentillion","unquadragintaoctingentillion","duoquadragintaoctingentillion","tresquadragintaoctingentillion","quattuorquadragintaoctingentillion","quinquadragintaoctingentillion","sesquadragintaoctingentillion","septenquadragintaoctingentillion","octoquadragintaoctingentillion","novenquadragintaoctingentillion","quinquagintaoctingentillion","unquinquagintaoctingentillion","duoquinquagintaoctingentillion","tresquinquagintaoctingentillion","quattuorquinquagintaoctingentillion","quinquinquagintaoctingentillion","sesquinquagintaoctingentillion","septenquinquagintaoctingentillion","octoquinquagintaoctingentillion","novenquinquagintaoctingentillion","sexagintaoctingentillion","unsexagintaoctingentillion","duosexagintaoctingentillion","tresexagintaoctingentillion","quattuorsexagintaoctingentillion","quinsexagintaoctingentillion","sesexagintaoctingentillion","septensexagintaoctingentillion","octosexagintaoctingentillion","novensexagintaoctingentillion","septuagintaoctingentillion","unseptuagintaoctingentillion","duoseptuagintaoctingentillion","treseptuagintaoctingentillion","quattuorseptuagintaoctingentillion","quinseptuagintaoctingentillion","seseptuagintaoctingentillion","septenseptuagintaoctingentillion","octoseptuagintaoctingentillion","novenseptuagintaoctingentillion","octogintaoctingentillion","unoctogintaoctingentillion","duooctogintaoctingentillion","tresoctogintaoctingentillion","quattuoroctogintaoctingentillion","quinoctogintaoctingentillion","sexoctogintaoctingentillion","septemoctogintaoctingentillion","octooctogintaoctingentillion","novemoctogintaoctingentillion","nonagintaoctingentillion","unnonagintaoctingentillion","duononagintaoctingentillion","trenonagintaoctingentillion","quattuornonagintaoctingentillion","quinnonagintaoctingentillion","senonagintaoctingentillion","septenonagintaoctingentillion","octononagintaoctingentillion","novenonagintaoctingentillion","nongentillion","unnongentillion","duonongentillion","trenongentillion","quattuornongentillion","quinnongentillion","senongentillion","septenongentillion","octonongentillion","novenongentillion","decinongentillion","undecinongentillion","duodecinongentillion","tredecinongentillion","quattuordecinongentillion","quindecinongentillion","sedecinongentillion","septendecinongentillion","octodecinongentillion","novendecinongentillion","vigintinongentillion","unvigintinongentillion","duovigintinongentillion","tresvigintinongentillion","quattuorvigintinongentillion","quinvigintinongentillion","sesvigintinongentillion","septemvigintinongentillion","octovigintinongentillion","novemvigintinongentillion","trigintanongentillion","untrigintanongentillion","duotrigintanongentillion","trestrigintanongentillion","quattuortrigintanongentillion","quintrigintanongentillion","sestrigintanongentillion","septentrigintanongentillion","octotrigintanongentillion","noventrigintanongentillion","quadragintanongentillion","unquadragintanongentillion","duoquadragintanongentillion","tresquadragintanongentillion","quattuorquadragintanongentillion","quinquadragintanongentillion","sesquadragintanongentillion","septenquadragintanongentillion","octoquadragintanongentillion","novenquadragintanongentillion","quinquagintanongentillion","unquinquagintanongentillion","duoquinquagintanongentillion","tresquinquagintanongentillion","quattuorquinquagintanongentillion","quinquinquagintanongentillion","sesquinquagintanongentillion","septenquinquagintanongentillion","octoquinquagintanongentillion","novenquinquagintanongentillion","sexagintanongentillion","unsexagintanongentillion","duosexagintanongentillion","tresexagintanongentillion","quattuorsexagintanongentillion","quinsexagintanongentillion","sesexagintanongentillion","septensexagintanongentillion","octosexagintanongentillion","novensexagintanongentillion","septuagintanongentillion","unseptuagintanongentillion","duoseptuagintanongentillion","treseptuagintanongentillion","quattuorseptuagintanongentillion","quinseptuagintanongentillion","seseptuagintanongentillion","septenseptuagintanongentillion","octoseptuagintanongentillion","novenseptuagintanongentillion","octogintanongentillion","unoctogintanongentillion","duooctogintanongentillion","tresoctogintanongentillion","quattuoroctogintanongentillion","quinoctogintanongentillion","sexoctogintanongentillion","septemoctogintanongentillion","octooctogintanongentillion","novemoctogintanongentillion","nonagintanongentillion","unnonagintanongentillion","duononagintanongentillion","trenonagintanongentillion","quattuornonagintanongentillion","quinnonagintanongentillion","senonagintanongentillion","septenonagintanongentillion","octononagintanongentillion","novenonagintanongentillion"];

```

## index.html - full source

```html
<h1>Numerals to Ordinal Words Plugin</h1>

<div style="margin:0 auto;width:100%;max-width:650px;background:white;border-radius:2px;padding:1em; box-sizing:border-box;">
	<p>Put this in your Perchance code panel:</p>
	<p><code>numToOrdWord = \{import:numerals-to-ordinal-words-plugin\}</code></p>
	<br>
	<p>Now you can generate the "spelled out" version of a number with th/nd/st/rd/etc.</p>
	<p><code>\[numToOrdWord(18)\]</code></p>
	<p>That would generate <code>eighteen<u>th</u></code>.</p>
	<br>
	<p>You can of course use it with variables and other plugins:</p>
	<p><code>\[numToOrdWord(num)\]</code></p>
	<p><code>\[numToOrdWord( dice("2d6") )\]</code></p>
	<p><code>\[numToOrdWord( character.hitpoints )\]</code></p>
	<br>
	<p>Test out this plugin by typing in a number:</p>
	<p><code>\[numToOrdWord(<input id="userval" oninput="update()" style="width:50px; text-align:center;" value="786"/>)\]</code></p>
	<p style="opacity:0.7; font-style:italic;">[$output(userval.value)]</p>
	<br>
	<p><b>Notes:</b></p>
	<ul>
		<li><a href="/numerals-to-ordinal-words-example#edit">Here's a simple example</a> of how to use it.</li>
		<li>Want <code>4th</code> instead of <code>fourth</code>? Check out <a href="/numerals-to-ordinals-plugin">numerals-to-ordinals-plugin</a></li>
		<li>Check out more plugins at <a href="/plugins">perchance.org/plugins</a></li>
	</ul>
</div>
<p style="text-align:center; font-size:200%; opacity:0.2; margin-top:0.5em;"><span>⚄&#xFE0E;</span></p>
<br><br><br>

<style>
	body {
			background:#eee;
	}
	code {
		background-color:#eee;
		padding:0.1em 0.2em
	}
	ul li { margin-top:0.4em; }
</style>
```

## big.js v4.0.2 - full source (third-party)

```js
/* big.js v4.0.2 https://github.com/MikeMcl/big.js/LICENCE */
;(function (global) {
  'use strict';


/*
 *  big.js v4.0.2
 *  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
 *  https://github.com/MikeMcl/big.js/
 *  Copyright (c) 2017 Michael Mclaughlin <M8ch88l@gmail.com>
 *  MIT Expat Licence
 */


/************************************** EDITABLE DEFAULTS *****************************************/

  // The default values below must be integers within the stated ranges.

  /*
   * The maximum number of decimal places (DP) of the results of operations involving division: div
   * and sqrt, and pow with negative exponents.
   */
  var DP = 20,          // 0 to MAX_DP

    /*
     * The rounding mode (RM) used when rounding to the above decimal places.
     *
     *  0  Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
     *  1  To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
     *  2  To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
     *  3  Away from zero.                                  (ROUND_UP)
     */
    RM = 1,             // 0, 1, 2 or 3

    // The maximum value of DP and Big.DP.
    MAX_DP = 1E6,       // 0 to 1000000

    // The maximum magnitude of the exponent argument to the pow method.
    MAX_POWER = 1E6,    // 1 to 1000000

    /*
     * The negative exponent (NE) at and beneath which toString returns exponential notation.
     * (JavaScript numbers: -7)
     * -1000000 is the minimum recommended exponent value of a Big.
     */
    NE = -7,            // 0 to -1000000

    /*
     * The positive exponent (PE) at and above which toString returns exponential notation.
     * (JavaScript numbers: 21)
     * 1000000 is the maximum recommended exponent value of a Big.
     * (This limit is not enforced or checked.)
     */
    PE = 21,            // 0 to 1000000

/**************************************************************************************************/


    // The shared prototype object.
    P = {},
    isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
    bigError = '[BigError] ',
    undef = void 0,
    Big;


  /*
   * Create and return a Big constructor.
   *
   */
  function bigFactory() {

    /*
     * The Big constructor and exported function.
     * Create and return a new instance of a Big number object.
     *
     * n {number|string|Big} A numeric value.
     */
    function Big(n) {
      var x = this;

      // Enable constructor usage without new.
      if (!(x instanceof Big)) return n === undef ? bigFactory() : new Big(n);

      // Duplicate.
      if (n instanceof Big) {
        x.s = n.s;
        x.e = n.e;
        x.c = n.c.slice();
      } else {
        parse(x, n);
      }

      /*
       * Retain a reference to this Big constructor, and shadow Big.prototype.constructor which
       * points to Object.
       */
      x.constructor = Big;
    }

    Big.prototype = P;
    Big.DP = DP;
    Big.RM = RM;
    Big.NE = NE;
    Big.PE = PE;

    return Big;
  }


  // Private functions


  /*
   * Return a string representing the value of Big x in normal or exponential notation to dp fixed
   * decimal places or significant digits.
   *
   * x {Big} The Big to format.
   * dp {number} Integer, 0 to MAX_DP inclusive.
   * toE {number} 1 (toExponential), 2 (toPrecision) or undefined (toFixed).
   */
  function format(x, dp, toE) {
    var Big = x.constructor,

      // The index (normal notation) of the digit that may be rounded up.
      i = dp - (x = new Big(x)).e,
      c = x.c;

    // Round?
    if (c.length > ++dp) rnd(x, i, Big.RM);

    if (!c[0]) {
      ++i;
    } else if (toE) {
      i = dp;

    // toFixed
    } else {
      c = x.c;

      // Recalculate i as x.e may have changed if value rounded up.
      i = x.e + i + 1;
    }

    // Append zeros?
    for (; c.length < i;) c.push(0);
    i = x.e;

    /*
     * toPrecision returns exponential notation if the number of significant digits specified is
     * less than the number of digits necessary to represent the integer part of the value in
     * normal notation.
     */
    return toE === 1 || toE && (dp <= i || i <= Big.NE) ? (x.s < 0 && c[0] ? '-' : '') +
      (c.length > 1 ? c[0] + '.' + c.join('').slice(1) : c[0]) + (i < 0 ? 'e' : 'e+') + i
        : x.toString();
  }


  /*
   * Parse the number or string value passed to a Big constructor.
   *
   * x {Big} A Big number instance.
   * n {number|string} A numeric value.
   */
  function parse(x, n) {
    var e, i, nL;

    // Minus zero?
    if (n === 0 && 1 / n < 0) n = '-0';
    else if (!isValid.test(n += '')) throw Error(bigError + NaN);

    // Determine sign.
    x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

    // Decimal point?
    if ((e = n.indexOf('.')) > -1) n = n.replace('.', '');

    // Exponential form?
    if ((i = n.search(/e/i)) > 0) {

      // Determine exponent.
      if (e < 0) e = i;
      e += +n.slice(i + 1);
      n = n.substring(0, i);
    } else if (e < 0) {

      // Integer.
      e = n.length;
    }

    nL = n.length;

    // Determine leading zeros.
    for (i = 0; i < nL && n.charAt(i) == '0';) ++i;

    if (i == nL) {

      // Zero.
      x.c = [x.e = 0];
    } else {

      // Determine trailing zeros.
      for (; nL > 0 && n.charAt(--nL) == '0';);
      x.e = e - i - 1;
      x.c = [];

      // Convert string to array of digits without leading/trailing zeros.
      for (e = 0; i <= nL;) x.c[e++] = +n.charAt(i++);
    }

    return x;
  }


  /*
   * Round Big x to a maximum of dp decimal places using rounding mode rm.
   * Called by div, sqrt and round.
   *
   * x {Big} The Big to round.
   * dp {number} Integer, 0 to MAX_DP inclusive.
   * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
   * [more] {boolean} Whether the result of division was truncated.
   */
  function rnd(x, dp, rm, more) {
    var xc = x.c,
      i = x.e + dp + 1;

    if (rm === 1) {

      // xc[i] is the digit after the digit that may be rounded up.
      more = xc[i] >= 5;
    } else if (rm === 2) {
      more = xc[i] > 5 || xc[i] == 5 && (more || i < 0 || xc[i + 1] !== undef || xc[i - 1] & 1);
    } else if (rm === 3) {
      more = more || xc[i] !== undef || i < 0;
    } else {
      more = false;
      if (rm !== 0) throw Error(bigError + 'RM: ' + rm);
    }

    if (i < 1 || !xc[0]) {
      if (more) {

        // 1, 0.1, 0.01, 0.001, 0.0001 etc.
        x.e = -dp;
        x.c = [1];
      } else {

        // Zero.
        x.c = [x.e = 0];
      }
    } else {

      // Remove any digits after the required decimal places.
      xc.length = i--;

      // Round up?
      if (more) {

        // Rounding up may mean the previous digit has to be rounded up.
        for (; ++xc[i] > 9;) {
          xc[i] = 0;
          if (!i--) {
            ++x.e;
            xc.unshift(1);
          }
        }
      }

      // Remove trailing zeros.
      for (i = xc.length; !xc[--i];) xc.pop();
    }

    return x;
  }


  // Prototype/instance methods


  /*
   * Return a new Big whose value is the absolute value of this Big.
   */
  P.abs = function () {
    var x = new this.constructor(this);
    x.s = 1;
    return x;
  };


  /*
   * Return 1 if the value of this Big is greater than the value of Big y,
   *       -1 if the value of this Big is less than the value of Big y, or
   *        0 if they have the same value.
  */
  P.cmp = function (y) {
    var xNeg,
      x = this,
      xc = x.c,
      yc = (y = new x.constructor(y)).c,
      i = x.s,
      j = y.s,
      k = x.e,
      l = y.e;

    // Either zero?
    if (!xc[0] || !yc[0]) return !xc[0] ? !yc[0] ? 0 : -j : i;

    // Signs differ?
    if (i != j) return i;

    xNeg = i < 0;

    // Compare exponents.
    if (k != l) return k > l ^ xNeg ? 1 : -1;

    i = -1;
    j = (k = xc.length) < (l = yc.length) ? k : l;

    // Compare digit by digit.
    for (; ++i < j;) {
      if (xc[i] != yc[i]) return xc[i] > yc[i] ^ xNeg ? 1 : -1;
    }

    // Compare lengths.
    return k == l ? 0 : k > l ^ xNeg ? 1 : -1;
  };


  /*
   * Return a new Big whose value is the value of this Big divided by the value of Big y, rounded,
   * if necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
   */
  P.div = function (y) {
    var x = this,
      Big = x.constructor,
      dvd = x.c,                  // dividend
      dvs = (y = new Big(y)).c,   // divisor
      s = x.s == y.s ? 1 : -1,
      dp = Big.DP;

    if (dp !== ~~dp || dp < 0 || dp > MAX_DP) throw Error(bigError + 'DP: ' + dp);

    // Either 0?
    if (!dvd[0] || !dvs[0]) {

      // If both are 0, throw NaN
      if (dvd[0] == dvs[0]) throw Error(bigError + NaN);

      // If dvs is 0, throw +-Infinity.
      if (!dvs[0]) throw Error(bigError + s / 0);

      // dvd is 0, return +-0.
      return new Big(s * 0);
    }

    var dvsL, dvsT, next, cmp, remI,
      dvsZ = dvs.slice(),
      dvdI = dvsL = dvs.length,
      dvdL = dvd.length,
      rem = dvd.slice(0, dvsL),   // remainder
      remL = rem.length,
      q = y,                      // quotient
      qc = q.c = [],
      qi = 0,
      digits = dp + (q.e = x.e - y.e) + 1;

    q.s = s;
    s = digits < 0 ? 0 : digits;

    // Create version of divisor with leading zero.
    dvsZ.unshift(0);

    // Add zeros to make remainder as long as divisor.
    for (; remL++ < dvsL;) rem.push(0);

    do {

      // 'next' is how many times the divisor goes into current remainder.
      for (next = 0; next < 10; next++) {

        // Compare divisor and remainder.
        if (dvsL != (remL = rem.length)) {
          cmp = dvsL > remL ? 1 : -1;
        } else {
          for (remI = -1, cmp = 0; ++remI < dvsL;) {
            if (dvs[remI] != rem[remI]) {
              cmp = dvs[remI] > rem[remI] ? 1 : -1;
              break;
            }
          }
        }

        // If divisor < remainder, subtract divisor from remainder.
        if (cmp < 0) {

          // Remainder can't be more than 1 digit longer than divisor.
          // Equalise lengths using divisor with extra leading zero?
          for (dvsT = remL == dvsL ? dvs : dvsZ; remL;) {
            if (rem[--remL] < dvsT[remL]) {
              remI = remL;
              for (; remI && !rem[--remI];) rem[remI] = 9;
              --rem[remI];
              rem[remL] += 10;
            }

            rem[remL] -= dvsT[remL];
          }

          for (; !rem[0];) rem.shift();
        } else {
          break;
        }
      }

      // Add the 'next' digit to the result array.
      qc[qi++] = cmp ? next : ++next;

      // Update the remainder.
      if (rem[0] && cmp) rem[remL] = dvd[dvdI] || 0;
      else rem = [dvd[dvdI]];

    } while ((dvdI++ < dvdL || rem[0] !== undef) && s--);

    // Leading zero? Do not remove if result is simply zero (qi == 1).
    if (!qc[0] && qi != 1) {

      // There can't be more than one zero.
      qc.shift();
      q.e--;
    }

    // Round?
    if (qi > digits) rnd(q, dp, Big.RM, rem[0] !== undef);

    return q;
  };


  /*
   * Return true if the value of this Big is equal to the value of Big y, otherwise return false.
   */
  P.eq = function (y) {
    return !this.cmp(y);
  };


  /*
   * Return true if the value of this Big is greater than the value of Big y, otherwise return
   * false.
   */
  P.gt = function (y) {
    return this.cmp(y) > 0;
  };


  /*
   * Return true if the value of this Big is greater than or equal to the value of Big y, otherwise
   * return false.
   */
  P.gte = function (y) {
    return this.cmp(y) > -1;
  };


  /*
   * Return true if the value of this Big is less than the value of Big y, otherwise return false.
   */
  P.lt = function (y) {
    return this.cmp(y) < 0;
  };


  /*
   * Return true if the value of this Big is less than or equal to the value of Big y, otherwise
   * return false.
   */
  P.lte = function (y) {
    return this.cmp(y) < 1;
  };


  /*
   * Return a new Big whose value is the value of this Big minus the value of Big y.
   */
  P.sub = P.minus = function (y) {
    var i, j, t, xLTy,
      x = this,
      Big = x.constructor,
      a = x.s,
      b = (y = new Big(y)).s;

    // Signs differ?
    if (a != b) {
      y.s = -b;
      return x.plus(y);
    }

    var xc = x.c.slice(),
      xe = x.e,
      yc = y.c,
      ye = y.e;

    // Either zero?
    if (!xc[0] || !yc[0]) {

      // y is non-zero? x is non-zero? Or both are zero.
      return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
    }

    // Determine which is the bigger number. Prepend zeros to equalise exponents.
    if (a = xe - ye) {

      if (xLTy = a < 0) {
        a = -a;
        t = xc;
      } else {
        ye = xe;
        t = yc;
      }

      t.reverse();
      for (b = a; b--;) t.push(0);
      t.reverse();
    } else {

      // Exponents equal. Check digit by digit.
      j = ((xLTy = xc.length < yc.length) ? xc : yc).length;

      for (a = b = 0; b < j; b++) {
        if (xc[b] != yc[b]) {
          xLTy = xc[b] < yc[b];
          break;
        }
      }
    }

    // x < y? Point xc to the array of the bigger number.
    if (xLTy) {
      t = xc;
      xc = yc;
      yc = t;
      y.s = -y.s;
    }

    /*
     * Append zeros to xc if shorter. No need to add zeros to yc if shorter as subtraction only
     * needs to start at yc.length.
     */
    if ((b = (j = yc.length) - (i = xc.length)) > 0) for (; b--;) xc[i++] = 0;

    // Subtract yc from xc.
    for (b = i; j > a;) {
      if (xc[--j] < yc[j]) {
        for (i = j; i && !xc[--i];) xc[i] = 9;
        --xc[i];
        xc[j] += 10;
      }

      xc[j] -= yc[j];
    }

    // Remove trailing zeros.
    for (; xc[--b] === 0;) xc.pop();

    // Remove leading zeros and adjust exponent accordingly.
    for (; xc[0] === 0;) {
      xc.shift();
      --ye;
    }

    if (!xc[0]) {

      // n - n = +0
      y.s = 1;

      // Result must be zero.
      xc = [ye = 0];
    }

    y.c = xc;
    y.e = ye;

    return y;
  };


  /*
   * Return a new Big whose value is the value of this Big modulo the value of Big y.
   */
  P.mod = function (y) {
    var yGTx,
      x = this,
      Big = x.constructor,
      a = x.s,
      b = (y = new Big(y)).s;

    if (!y.c[0]) throw Error(bigError + NaN);
    x.s = y.s = 1;
    yGTx = y.cmp(x) == 1;
    x.s = a;
    y.s = b;

    if (yGTx) return new Big(x);

    a = Big.DP;
    b = Big.RM;
    Big.DP = Big.RM = 0;
    x = x.div(y);
    Big.DP = a;
    Big.RM = b;

    return this.minus(x.times(y));
  };


  /*
   * Return a new Big whose value is the value of this Big plus the value of Big y.
   */
  P.add = P.plus = function (y) {
    var t,
      x = this,
      Big = x.constructor,
      a = x.s,
      b = (y = new Big(y)).s;

    // Signs differ?
    if (a != b) {
      y.s = -b;
      return x.minus(y);
    }

    var xe = x.e,
      xc = x.c,
      ye = y.e,
      yc = y.c;

    // Either zero? y is non-zero? x is non-zero? Or both are zero.
    if (!xc[0] || !yc[0]) return yc[0] ? y : new Big(xc[0] ? x : a * 0);

    xc = xc.slice();

    // Prepend zeros to equalise exponents.
    // Note: Faster to use reverse then do unshifts.
    if (a = xe - ye) {
      if (a > 0) {
        ye = xe;
        t = yc;
      } else {
        a = -a;
        t = xc;
      }

      t.reverse();
      for (; a--;) t.push(0);
      t.reverse();
    }

    // Point xc to the longer array.
    if (xc.length - yc.length < 0) {
      t = yc;
      yc = xc;
      xc = t;
    }

    a = yc.length;

    // Only start adding at yc.length - 1 as the further digits of xc can be left as they are.
    for (b = 0; a; xc[a] %= 10) b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;

    // No need to check for zero, as +x + +y != 0 && -x + -y != 0

    if (b) {
      xc.unshift(b);
      ++ye;
    }

    // Remove trailing zeros.
    for (a = xc.length; xc[--a] === 0;) xc.pop();

    y.c = xc;
    y.e = ye;

    return y;
  };


  /*
   * Return a Big whose value is the value of this Big raised to the power n.
   * If n is negative, round, if necessary, to a maximum of Big.DP decimal places using rounding
   * mode Big.RM.
   *
   * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
   */
  P.pow = function (n) {
    var x = this,
      one = new x.constructor(1),
      y = one,
      isNeg = n < 0;

    if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) throw Error(bigError + n);
    n = isNeg ? -n : n;

    for (;;) {
      if (n & 1) y = y.times(x);
      n >>= 1;
      if (!n) break;
      x = x.times(x);
    }

    return isNeg ? one.div(y) : y;
  };


  /*
   * Return a new Big whose value is the value of this Big rounded to a maximum of dp decimal
   * places using rounding mode rm.
   * If dp is not specified, round to 0 decimal places.
   * If rm is not specified, use Big.RM.
   *
   * [dp] {number} Integer, 0 to MAX_DP inclusive.
   * [rm] 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
   */
  P.round = function (dp, rm) {
    var x = this,
      Big = x.constructor;

    if (dp === undef) dp = 0;
    else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) throw Error(bigError + dp);

    return rnd(new Big(x), dp, rm === undef ? Big.RM : rm);
  };


  /*
   * Return a new Big whose value is the square root of the value of this Big, rounded, if
   * necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
   */
  P.sqrt = function () {
    var estimate, r, approx,
      x = this,
      Big = x.constructor,
      xc = x.c,
      i = x.s,
      e = x.e,
      half = new Big('0.5');

    // Zero?
    if (!xc[0]) return new Big(x);

    // If negative, throw NaN.
    if (i < 0) throw Error(bigError + NaN);

    // Estimate.
    i = Math.sqrt(x.toString());

    // Math.sqrt underflow/overflow?
    // Pass x to Math.sqrt as integer, then adjust the result exponent.
    if (i === 0 || i === 1 / 0) {
      estimate = xc.join('');
      if (!(estimate.length + e & 1)) estimate += '0';
      r = new Big(Math.sqrt(estimate).toString());
      r.e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
    } else {
      r = new Big(i.toString());
    }

    i = r.e + (Big.DP += 4);

    // Newton-Raphson iteration.
    do {
      approx = r;
      r = half.times(approx.plus(x.div(approx)));
    } while (approx.c.slice(0, i).join('') !== r.c.slice(0, i).join(''));

    return rnd(r, Big.DP -= 4, Big.RM);
  };


  /*
   * Return a new Big whose value is the value of this Big times the value of Big y.
   */
  P.mul = P.times = function (y) {
    var c,
      x = this,
      Big = x.constructor,
      xc = x.c,
      yc = (y = new Big(y)).c,
      a = xc.length,
      b = yc.length,
      i = x.e,
      j = y.e;

    // Determine sign of result.
    y.s = x.s == y.s ? 1 : -1;

    // Return signed 0 if either 0.
    if (!xc[0] || !yc[0]) return new Big(y.s * 0);

    // Initialise exponent of result as x.e + y.e.
    y.e = i + j;

    // If array xc has fewer digits than yc, swap xc and yc, and lengths.
    if (a < b) {
      c = xc;
      xc = yc;
      yc = c;
      j = a;
      a = b;
      b = j;
    }

    // Initialise coefficient array of result with zeros.
    for (c = new Array(j = a + b); j--;) c[j] = 0;

    // Multiply.

    // i is initially xc.length.
    for (i = b; i--;) {
      b = 0;

      // a is yc.length.
      for (j = a + i; j > i;) {

        // Current sum of products at this digit position, plus carry.
        b = c[j] + yc[i] * xc[j - i - 1] + b;
        c[j--] = b % 10;

        // carry
        b = b / 10 | 0;
      }

      c[j] = (c[j] + b) % 10;
    }

    // Increment result exponent if there is a final carry, otherwise remove leading zero.
    if (b) ++y.e;
    else c.shift();

    // Remove trailing zeros.
    for (i = c.length; !c[--i];) c.pop();
    y.c = c;

    return y;
  };


  /*
   * Return a string representing the value of this Big.
   * Return exponential notation if this Big has a positive exponent equal to or greater than
   * Big.PE, or a negative exponent equal to or less than Big.NE.
   */
  P.toString = P.valueOf = P.toJSON = function () {
    var x = this,
      Big = x.constructor,
      e = x.e,
      str = x.c.join(''),
      strL = str.length;

    // Exponential notation?
    if (e <= Big.NE || e >= Big.PE) {
      str = str.charAt(0) + (strL > 1 ? '.' + str.slice(1) : '') + (e < 0 ? 'e' : 'e+') + e;
    } else if (e < 0) {
      for (; ++e;) str = '0' + str;
      str = '0.' + str;
    } else if (e > 0) {
      if (++e > strL) for (e -= strL; e--;) str += '0';
      else if (e < strL) str = str.slice(0, e) + '.' + str.slice(e);

    // Exponent is zero.
    } else if (strL > 1) {
      str = str.charAt(0) + '.' + str.slice(1);
    }

    // Avoid '-0'
    return x.s < 0 && x.c[0] ? '-' + str : str;
  };


  /*
   * If toExponential, toFixed, toPrecision and format are not required they can safely be
   * commented-out or deleted. No redundant code will be left.
   * The format function is used only by toExponential, toFixed and toPrecision.
   */


  /*
   * Return a string representing the value of this Big in exponential notation to dp fixed decimal
   * places and rounded, if necessary, using Big.RM.
   *
   * [dp] {number} Integer, 0 to MAX_DP inclusive.
   */
  P.toExponential = function (dp) {
    if (dp === undef) dp = this.c.length - 1;
    else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) throw Error(bigError + dp);
    return format(this, dp, 1);
  };


  /*
   * Return a string representing the value of this Big in normal notation to dp fixed decimal
   * places and rounded, if necessary, using Big.RM.
   *
   * [dp] {number} Integer, 0 to MAX_DP inclusive.
   */
  P.toFixed = function (dp) {
    var str,
      x = this,
      Big = x.constructor,
      ne = Big.NE,
      pe = Big.PE;

    // Prevent the possibility of exponential notation.
    Big.NE = -(Big.PE = 1 / 0);

    if (dp === undef) {
      str = x.toString();
    } else if (dp === ~~dp && dp >= 0 && dp <= MAX_DP) {
      str = format(x, x.e + dp);

      // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.
      // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
      if (x.s < 0 && x.c[0] && str.indexOf('-') < 0) {

        //E.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.
        str = '-' + str;
      }
    }

    Big.NE = ne;
    Big.PE = pe;

    if (!str) throw Error(bigError + dp);

    return str;
  };


  /*
   * Return a string representing the value of this Big rounded to sd significant digits using
   * Big.RM. Use exponential notation if sd is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * sd {number} Integer, 1 to MAX_DP inclusive.
   */
  P.toPrecision = function (sd) {
    if (sd === undef) return this.toString();
    else if (sd !== ~~sd || sd < 1 || sd > MAX_DP) throw Error(bigError + sd);
    return format(this, sd - 1, 2);
  };


  // Export


  Big = bigFactory();

  Big['default'] = Big.Big = Big;

  //AMD.
  if (typeof define === 'function' && define.amd) {
    define(function () { return Big; });

  // Node and other CommonJS-like environments that support module.exports.
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Big;

  //Browser.
  } else {
    global.Big = Big;
  }
})(this);

```

## big.js v4.0.2 - licence

```
The MIT Expat Licence.

Copyright (c) 2017 Michael Mclaughlin

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


```

## Rebuild notes

The minified big.js v4.0.2 block inside `init()` is identical to third-party/big.js-4.0.2/big.min.js
(ignoring that file's header and //# sourceMappingURL comments). To refresh it: download
https://raw.githubusercontent.com/MikeMcl/big.js/v4.0.2/big.min.js and replace the single minified
line that begins `!function(r){"use strict"` in `init()`.

## Licences

- Generator code: as published on perchance.org.
- big.js: MIT Expat, (c) 2017 Michael Mclaughlin - full text in third-party/big.js-4.0.2/LICENCE.
