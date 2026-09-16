
	
	function updateMarkovModel() {
		
		document.querySelector("#output-code").innerText = "Training in progress...";
		document.querySelector("#gen-button").style.opacity = 0.3;
		setTimeout(function() {
			updateMarkovModelBegin();
			document.querySelector("#gen-button").style.opacity = 1;
		}, 100);
	}
	
	function updateMarkovModelBegin() {
		
		let text = document.querySelector("#input-text").value;
		let order = Number(document.querySelector("#order-input").value);
		if(!order) {
			document.querySelector("#output-code").innerText = `Error: Please input a valid number for the Markoc chain 'order'. Your input was '${document.querySelector("#order-input")}' which isn't a valid number.`;
			return;
		}
		
		//if(order > 4) {
		//	let yes = confirm("You input a large 'order' value. This will require a lot of computer resources and may crash this browser tab. Are you sure you want to use such a high 'order' value?")
		//	if(!yes) return;
		//}
		
		let wordMode = document.querySelector("#words-mode-check").checked;
		if(wordMode) {
			text = text.split(/[ ]+/g).map(word => " "+word);
		}
		
		let symbols = [];
		for(let i = order; i < text.length; i++) {
			let symbol = "";
			for(let j = 0; j < order; j++) symbol = text[i-j]+symbol;
			symbols.push(symbol);
		}
		let data = train(symbols);
		data.wordMode = wordMode;
		data.order = order;
		let compressedData = LZString.compressToBase64( JSON.stringify(data).replace(/`/g,"\\`") );
		//let compressedData = JSON.stringify(data).replace(/`/g,"\\`");
		
		// replace new line chars with special tokens:
		//let newlineChars = ["\u000a", "\u000b", "\u000c", "\u000d", "\u0085", "\u2028", "\u2029"];
		//let newlineCharReplacements = ["(((({{<<|||\\u000a|||>>}}))))", "(((({{<<|||\\u000b|||>>}}))))", "(((({{<<|||\\u000c|||>>}}))))", "(((({{<<|||\\u000d|||>>}}))))", "(((({{<<|||\\u0085|||>>}}))))", "(((({{<<|||\\u2028|||>>}}))))", "(((({{<<|||\\u2029|||>>}}))))"];
		//for(let i = 0; i < newlineChars.length; i++) {
		//	compressedData = compressedData.split(newlineChars[i]).join(newlineCharReplacements[i]);
		//}
		
		document.querySelector("#output-code").innerText = "m1 () => return `"+compressedData+"`;\nmarkov = {import:markov-chain-plugin}";

					/*.replace(/\[/g,"\\[")
			.replace(/\]/g, "\\]")
			.replace(/\{/g,"\\{")
			.replace(/\}/g, "\\}")
			.replace(/=/g, "\\=")
			.replace(/\^/g, "\\^")*/
		
		document.querySelector("#output-example").innerText = $output(compressedData, 300);
	}

	function train(sequence) {
		let t = {}; // transitions
		let c = {}; // totalCounts
		for(let i = 1; i < sequence.length; i++) {
			let a = sequence[i-1], b = sequence[i];
			t[a] = t[a] ? t[a] : {}; // add symbol entry
			t[a][b] = (t[a][b] || 0) + 1; // increment transition
			c[a] = (c[a] || 0) + 1; // increment total count for `a` node
		}
		
		let lookup = [];
		//c = compressKeysWithLookupTable(c, lookup);
		//t = compressKeysWithLookupTable(t, lookup);
		//for(let [k, v] of Object.entries(t)) t[k] = compressKeysWithLookupTable(v, lookup);
		//debugger;
		
		// TODO: cull down so it takes up less than 3mb
		return {transitions:t, totalCounts:c, lookup};
	}
	
	function compressKeysWithLookupTable(input, lookup) {
    let entries = Object.entries(input);
    let output = {};
    for(let [k, v] of entries) {
        let index = lookup.indexOf(k);
        if(index === -1) {
            lookup.push(k);
            index = lookup.length-1;
        }
        output[index] = v;
    }
    return output;
	}
	function decompressKeysWithLookupTable(input, lookup) {
    let entries = Object.entries(input);
    let output = {};
    for(let [k, v] of entries) {
        output[lookup[k]] = v;
    }
    return output;
	}
	
	var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);
	
