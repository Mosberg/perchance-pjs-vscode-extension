// This file was generated with this command:
/*
printf '\n' > bundle.js && \
wget -O - "https://cdnjs.cloudflare.com/ajax/libs/dexie/4.0.8/dexie.min.js" >> bundle.js && printf '\n%.0s' {1..10} >> bundle.js && \
wget -O - "https://unpkg.com/dexie-export-import@4.1.2/dist/dexie-export-import.js" >> bundle.js && printf '\n%.0s' {1..10} >> bundle.js && \
wget -O - "https://cdn.jsdelivr.net/npm/marked@4.2.12/marked.min.js" >> bundle.js && printf '\n%.0s' {1..10} >> bundle.js && \
wget -O - "https://cdn.jsdelivr.net/npm/dompurify@3.0.1/dist/purify.min.js" >> bundle.js && printf '\n%.0s' {1..10} >> bundle.js
*/

(function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).Dexie=t()})(this,function(){"use strict";var s=function(e,t){return(s=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])})(e,t)};var w=function(){return(w=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var i in t=arguments[n])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)};function i(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;i<o;i++)!r&&i in t||((r=r||Array.prototype.slice.call(t,0,i))[i]=t[i]);return e.concat(r||Array.prototype.slice.call(t))}var f="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:global,_=Object.keys,x=Array.isArray;function a(t,n){return"object"!=typeof n||_(n).forEach(function(e){t[e]=n[e]}),t}"undefined"==typeof Promise||f.Promise||(f.Promise=Promise);var c=Object.getPrototypeOf,n={}.hasOwnProperty;function m(e,t){return n.call(e,t)}function r(t,n){"function"==typeof n&&(n=n(c(t))),("undefined"==typeof Reflect?_:Reflect.ownKeys)(n).forEach(function(e){l(t,e,n[e])})}var u=Object.defineProperty;function l(e,t,n,r){u(e,t,a(n&&m(n,"get")&&"function"==typeof n.get?{get:n.get,set:n.set,configurable:!0}:{value:n,configurable:!0,writable:!0},r))}function o(t){return{from:function(e){return t.prototype=Object.create(e.prototype),l(t.prototype,"constructor",t),{extend:r.bind(null,t.prototype)}}}}var h=Object.getOwnPropertyDescriptor;var d=[].slice;function b(e,t,n){return d.call(e,t,n)}function p(e,t){return t(e)}function y(e){if(!e)throw new Error("Assertion Failed")}function v(e){f.setImmediate?setImmediate(e):setTimeout(e,0)}function k(e,t){if("string"==typeof t&&m(e,t))return e[t];if(!t)return e;if("string"!=typeof t){for(var n=[],r=0,i=t.length;r<i;++r){var o=k(e,t[r]);n.push(o)}return n}var a=t.indexOf(".");if(-1!==a){var u=e[t.substr(0,a)];return null==u?void 0:k(u,t.substr(a+1))}}function P(e,t,n){if(e&&void 0!==t&&!("isFrozen"in Object&&Object.isFrozen(e)))if("string"!=typeof t&&"length"in t){y("string"!=typeof n&&"length"in n);for(var r=0,i=t.length;r<i;++r)P(e,t[r],n[r])}else{var o,a,u=t.indexOf(".");-1!==u?(o=t.substr(0,u),""===(a=t.substr(u+1))?void 0===n?x(e)&&!isNaN(parseInt(o))?e.splice(o,1):delete e[o]:e[o]=n:P(u=!(u=e[o])||!m(e,o)?e[o]={}:u,a,n)):void 0===n?x(e)&&!isNaN(parseInt(t))?e.splice(t,1):delete e[t]:e[t]=n}}function g(e){var t,n={};for(t in e)m(e,t)&&(n[t]=e[t]);return n}var t=[].concat;function O(e){return t.apply([],e)}var e="BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(O([8,16,32,64].map(function(t){return["Int","Uint","Float"].map(function(e){return e+t+"Array"})}))).filter(function(e){return f[e]}),E=new Set(e.map(function(e){return f[e]}));var K=null;function S(e){K=new WeakMap;e=function e(t){if(!t||"object"!=typeof t)return t;var n=K.get(t);if(n)return n;if(x(t)){n=[],K.set(t,n);for(var r=0,i=t.length;r<i;++r)n.push(e(t[r]))}else if(E.has(t.constructor))n=t;else{var o,a=c(t);for(o in n=a===Object.prototype?{}:Object.create(a),K.set(t,n),t)m(t,o)&&(n[o]=e(t[o]))}return n}(e);return K=null,e}var j={}.toString;function A(e){return j.call(e).slice(8,-1)}var C="undefined"!=typeof Symbol?Symbol.iterator:"@@iterator",D="symbol"==typeof C?function(e){var t;return null!=e&&(t=e[C])&&t.apply(e)}:function(){return null};function T(e,t){t=e.indexOf(t);return 0<=t&&e.splice(t,1),0<=t}var q={};function I(e){var t,n,r,i;if(1===arguments.length){if(x(e))return e.slice();if(this===q&&"string"==typeof e)return[e];if(i=D(e)){for(n=[];!(r=i.next()).done;)n.push(r.value);return n}if(null==e)return[e];if("number"!=typeof(t=e.length))return[e];for(n=new Array(t);t--;)n[t]=e[t];return n}for(t=arguments.length,n=new Array(t);t--;)n[t]=arguments[t];return n}var B="undefined"!=typeof Symbol?function(e){return"AsyncFunction"===e[Symbol.toStringTag]}:function(){return!1},R=["Unknown","Constraint","Data","TransactionInactive","ReadOnly","Version","NotFound","InvalidState","InvalidAccess","Abort","Timeout","QuotaExceeded","Syntax","DataClone"],F=["Modify","Bulk","OpenFailed","VersionChange","Schema","Upgrade","InvalidTable","MissingAPI","NoSuchDatabase","InvalidArgument","SubTransaction","Unsupported","Internal","DatabaseClosed","PrematureCommit","ForeignAwait"].concat(R),M={VersionChanged:"Database version changed by other database connection",DatabaseClosed:"Database has been closed",Abort:"Transaction aborted",TransactionInactive:"Transaction has already completed or failed",MissingAPI:"IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"};function N(e,t){this.name=e,this.message=t}function L(e,t){return e+". Errors: "+Object.keys(t).map(function(e){return t[e].toString()}).filter(function(e,t,n){return n.indexOf(e)===t}).join("\n")}function U(e,t,n,r){this.failures=t,this.failedKeys=r,this.successCount=n,this.message=L(e,t)}function V(e,t){this.name="BulkError",this.failures=Object.keys(t).map(function(e){return t[e]}),this.failuresByPos=t,this.message=L(e,this.failures)}o(N).from(Error).extend({toString:function(){return this.name+": "+this.message}}),o(U).from(N),o(V).from(N);var z=F.reduce(function(e,t){return e[t]=t+"Error",e},{}),W=N,Y=F.reduce(function(e,n){var r=n+"Error";function t(e,t){this.name=r,e?"string"==typeof e?(this.message="".concat(e).concat(t?"\n "+t:""),this.inner=t||null):"object"==typeof e&&(this.message="".concat(e.name," ").concat(e.message),this.inner=e):(this.message=M[n]||r,this.inner=null)}return o(t).from(W),e[n]=t,e},{});Y.Syntax=SyntaxError,Y.Type=TypeError,Y.Range=RangeError;var $=R.reduce(function(e,t){return e[t+"Error"]=Y[t],e},{});var Q=F.reduce(function(e,t){return-1===["Syntax","Type","Range"].indexOf(t)&&(e[t+"Error"]=Y[t]),e},{});function G(){}function X(e){return e}function H(t,n){return null==t||t===X?n:function(e){return n(t(e))}}function J(e,t){return function(){e.apply(this,arguments),t.apply(this,arguments)}}function Z(i,o){return i===G?o:function(){var e=i.apply(this,arguments);void 0!==e&&(arguments[0]=e);var t=this.onsuccess,n=this.onerror;this.onsuccess=null,this.onerror=null;var r=o.apply(this,arguments);return t&&(this.onsuccess=this.onsuccess?J(t,this.onsuccess):t),n&&(this.onerror=this.onerror?J(n,this.onerror):n),void 0!==r?r:e}}function ee(n,r){return n===G?r:function(){n.apply(this,arguments);var e=this.onsuccess,t=this.onerror;this.onsuccess=this.onerror=null,r.apply(this,arguments),e&&(this.onsuccess=this.onsuccess?J(e,this.onsuccess):e),t&&(this.onerror=this.onerror?J(t,this.onerror):t)}}function te(i,o){return i===G?o:function(e){var t=i.apply(this,arguments);a(e,t);var n=this.onsuccess,r=this.onerror;this.onsuccess=null,this.onerror=null;e=o.apply(this,arguments);return n&&(this.onsuccess=this.onsuccess?J(n,this.onsuccess):n),r&&(this.onerror=this.onerror?J(r,this.onerror):r),void 0===t?void 0===e?void 0:e:a(t,e)}}function ne(e,t){return e===G?t:function(){return!1!==t.apply(this,arguments)&&e.apply(this,arguments)}}function re(i,o){return i===G?o:function(){var e=i.apply(this,arguments);if(e&&"function"==typeof e.then){for(var t=this,n=arguments.length,r=new Array(n);n--;)r[n]=arguments[n];return e.then(function(){return o.apply(t,r)})}return o.apply(this,arguments)}}Q.ModifyError=U,Q.DexieError=N,Q.BulkError=V;var ie="undefined"!=typeof location&&/^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);function oe(e){ie=e}var ae={},ue=100,e="undefined"==typeof Promise?[]:function(){var e=Promise.resolve();if("undefined"==typeof crypto||!crypto.subtle)return[e,c(e),e];var t=crypto.subtle.digest("SHA-512",new Uint8Array([0]));return[t,c(t),e]}(),R=e[0],F=e[1],e=e[2],F=F&&F.then,se=R&&R.constructor,ce=!!e;var le=function(e,t){be.push([e,t]),he&&(queueMicrotask(Se),he=!1)},fe=!0,he=!0,de=[],pe=[],ye=X,ve={id:"global",global:!0,ref:0,unhandleds:[],onunhandled:G,pgp:!1,env:{},finalize:G},me=ve,be=[],ge=0,we=[];function _e(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");this._listeners=[],this._lib=!1;var t=this._PSD=me;if("function"!=typeof e){if(e!==ae)throw new TypeError("Not a function");return this._state=arguments[1],this._value=arguments[2],void(!1===this._state&&Oe(this,this._value))}this._state=null,this._value=null,++t.ref,function t(r,e){try{e(function(n){if(null===r._state){if(n===r)throw new TypeError("A promise cannot be resolved with itself.");var e=r._lib&&je();n&&"function"==typeof n.then?t(r,function(e,t){n instanceof _e?n._then(e,t):n.then(e,t)}):(r._state=!0,r._value=n,Pe(r)),e&&Ae()}},Oe.bind(null,r))}catch(e){Oe(r,e)}}(this,e)}var xe={get:function(){var u=me,t=Fe;function e(n,r){var i=this,o=!u.global&&(u!==me||t!==Fe),a=o&&!Ue(),e=new _e(function(e,t){Ee(i,new ke(Qe(n,u,o,a),Qe(r,u,o,a),e,t,u))});return this._consoleTask&&(e._consoleTask=this._consoleTask),e}return e.prototype=ae,e},set:function(e){l(this,"then",e&&e.prototype===ae?xe:{get:function(){return e},set:xe.set})}};function ke(e,t,n,r,i){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.resolve=n,this.reject=r,this.psd=i}function Oe(e,t){var n,r;pe.push(t),null===e._state&&(n=e._lib&&je(),t=ye(t),e._state=!1,e._value=t,r=e,de.some(function(e){return e._value===r._value})||de.push(r),Pe(e),n&&Ae())}function Pe(e){var t=e._listeners;e._listeners=[];for(var n=0,r=t.length;n<r;++n)Ee(e,t[n]);var i=e._PSD;--i.ref||i.finalize(),0===ge&&(++ge,le(function(){0==--ge&&Ce()},[]))}function Ee(e,t){if(null!==e._state){var n=e._state?t.onFulfilled:t.onRejected;if(null===n)return(e._state?t.resolve:t.reject)(e._value);++t.psd.ref,++ge,le(Ke,[n,e,t])}else e._listeners.push(t)}function Ke(e,t,n){try{var r,i=t._value;!t._state&&pe.length&&(pe=[]),r=ie&&t._consoleTask?t._consoleTask.run(function(){return e(i)}):e(i),t._state||-1!==pe.indexOf(i)||function(e){var t=de.length;for(;t;)if(de[--t]._value===e._value)return de.splice(t,1)}(t),n.resolve(r)}catch(e){n.reject(e)}finally{0==--ge&&Ce(),--n.psd.ref||n.psd.finalize()}}function Se(){$e(ve,function(){je()&&Ae()})}function je(){var e=fe;return he=fe=!1,e}function Ae(){var e,t,n;do{for(;0<be.length;)for(e=be,be=[],n=e.length,t=0;t<n;++t){var r=e[t];r[0].apply(null,r[1])}}while(0<be.length);he=fe=!0}function Ce(){var e=de;de=[],e.forEach(function(e){e._PSD.onunhandled.call(null,e._value,e)});for(var t=we.slice(0),n=t.length;n;)t[--n]()}function De(e){return new _e(ae,!1,e)}function Te(n,r){var i=me;return function(){var e=je(),t=me;try{return We(i,!0),n.apply(this,arguments)}catch(e){r&&r(e)}finally{We(t,!1),e&&Ae()}}}r(_e.prototype,{then:xe,_then:function(e,t){Ee(this,new ke(null,null,e,t,me))},catch:function(e){if(1===arguments.length)return this.then(null,e);var t=e,n=arguments[1];return"function"==typeof t?this.then(null,function(e){return(e instanceof t?n:De)(e)}):this.then(null,function(e){return(e&&e.name===t?n:De)(e)})},finally:function(t){return this.then(function(e){return _e.resolve(t()).then(function(){return e})},function(e){return _e.resolve(t()).then(function(){return De(e)})})},timeout:function(r,i){var o=this;return r<1/0?new _e(function(e,t){var n=setTimeout(function(){return t(new Y.Timeout(i))},r);o.then(e,t).finally(clearTimeout.bind(null,n))}):this}}),"undefined"!=typeof Symbol&&Symbol.toStringTag&&l(_e.prototype,Symbol.toStringTag,"Dexie.Promise"),ve.env=Ye(),r(_e,{all:function(){var o=I.apply(null,arguments).map(Ve);return new _e(function(n,r){0===o.length&&n([]);var i=o.length;o.forEach(function(e,t){return _e.resolve(e).then(function(e){o[t]=e,--i||n(o)},r)})})},resolve:function(n){return n instanceof _e?n:n&&"function"==typeof n.then?new _e(function(e,t){n.then(e,t)}):new _e(ae,!0,n)},reject:De,race:function(){var e=I.apply(null,arguments).map(Ve);return new _e(function(t,n){e.map(function(e){return _e.resolve(e).then(t,n)})})},PSD:{get:function(){return me},set:function(e){return me=e}},totalEchoes:{get:function(){return Fe}},newPSD:Ne,usePSD:$e,scheduler:{get:function(){return le},set:function(e){le=e}},rejectionMapper:{get:function(){return ye},set:function(e){ye=e}},follow:function(i,n){return new _e(function(e,t){return Ne(function(n,r){var e=me;e.unhandleds=[],e.onunhandled=r,e.finalize=J(function(){var t,e=this;t=function(){0===e.unhandleds.length?n():r(e.unhandleds[0])},we.push(function e(){t(),we.splice(we.indexOf(e),1)}),++ge,le(function(){0==--ge&&Ce()},[])},e.finalize),i()},n,e,t)})}}),se&&(se.allSettled&&l(_e,"allSettled",function(){var e=I.apply(null,arguments).map(Ve);return new _e(function(n){0===e.length&&n([]);var r=e.length,i=new Array(r);e.forEach(function(e,t){return _e.resolve(e).then(function(e){return i[t]={status:"fulfilled",value:e}},function(e){return i[t]={status:"rejected",reason:e}}).then(function(){return--r||n(i)})})})}),se.any&&"undefined"!=typeof AggregateError&&l(_e,"any",function(){var e=I.apply(null,arguments).map(Ve);return new _e(function(n,r){0===e.length&&r(new AggregateError([]));var i=e.length,o=new Array(i);e.forEach(function(e,t){return _e.resolve(e).then(function(e){return n(e)},function(e){o[t]=e,--i||r(new AggregateError(o))})})})}));var qe={awaits:0,echoes:0,id:0},Ie=0,Be=[],Re=0,Fe=0,Me=0;function Ne(e,t,n,r){var i=me,o=Object.create(i);o.parent=i,o.ref=0,o.global=!1,o.id=++Me,ve.env,o.env=ce?{Promise:_e,PromiseProp:{value:_e,configurable:!0,writable:!0},all:_e.all,race:_e.race,allSettled:_e.allSettled,any:_e.any,resolve:_e.resolve,reject:_e.reject}:{},t&&a(o,t),++i.ref,o.finalize=function(){--this.parent.ref||this.parent.finalize()};r=$e(o,e,n,r);return 0===o.ref&&o.finalize(),r}function Le(){return qe.id||(qe.id=++Ie),++qe.awaits,qe.echoes+=ue,qe.id}function Ue(){return!!qe.awaits&&(0==--qe.awaits&&(qe.id=0),qe.echoes=qe.awaits*ue,!0)}function Ve(e){return qe.echoes&&e&&e.constructor===se?(Le(),e.then(function(e){return Ue(),e},function(e){return Ue(),Xe(e)})):e}function ze(){var e=Be[Be.length-1];Be.pop(),We(e,!1)}function We(e,t){var n,r=me;(t?!qe.echoes||Re++&&e===me:!Re||--Re&&e===me)||queueMicrotask(t?function(e){++Fe,qe.echoes&&0!=--qe.echoes||(qe.echoes=qe.awaits=qe.id=0),Be.push(me),We(e,!0)}.bind(null,e):ze),e!==me&&(me=e,r===ve&&(ve.env=Ye()),ce&&(n=ve.env.Promise,t=e.env,(r.global||e.global)&&(Object.defineProperty(f,"Promise",t.PromiseProp),n.all=t.all,n.race=t.race,n.resolve=t.resolve,n.reject=t.reject,t.allSettled&&(n.allSettled=t.allSettled),t.any&&(n.any=t.any))))}function Ye(){var e=f.Promise;return ce?{Promise:e,PromiseProp:Object.getOwnPropertyDescriptor(f,"Promise"),all:e.all,race:e.race,allSettled:e.allSettled,any:e.any,resolve:e.resolve,reject:e.reject}:{}}function $e(e,t,n,r,i){var o=me;try{return We(e,!0),t(n,r,i)}finally{We(o,!1)}}function Qe(t,n,r,i){return"function"!=typeof t?t:function(){var e=me;r&&Le(),We(n,!0);try{return t.apply(this,arguments)}finally{We(e,!1),i&&queueMicrotask(Ue)}}}function Ge(e){Promise===se&&0===qe.echoes?0===Re?e():enqueueNativeMicroTask(e):setTimeout(e,0)}-1===(""+F).indexOf("[native code]")&&(Le=Ue=G);var Xe=_e.reject;var He=String.fromCharCode(65535),Je="Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.",Ze="String expected.",et=[],tt="__dbnames",nt="readonly",rt="readwrite";function it(e,t){return e?t?function(){return e.apply(this,arguments)&&t.apply(this,arguments)}:e:t}var ot={type:3,lower:-1/0,lowerOpen:!1,upper:[[]],upperOpen:!1};function at(t){return"string"!=typeof t||/\./.test(t)?function(e){return e}:function(e){return void 0===e[t]&&t in e&&delete(e=S(e))[t],e}}function ut(){throw Y.Type()}function st(e,t){try{var n=ct(e),r=ct(t);if(n!==r)return"Array"===n?1:"Array"===r?-1:"binary"===n?1:"binary"===r?-1:"string"===n?1:"string"===r?-1:"Date"===n?1:"Date"!==r?NaN:-1;switch(n){case"number":case"Date":case"string":return t<e?1:e<t?-1:0;case"binary":return function(e,t){for(var n=e.length,r=t.length,i=n<r?n:r,o=0;o<i;++o)if(e[o]!==t[o])return e[o]<t[o]?-1:1;return n===r?0:n<r?-1:1}(lt(e),lt(t));case"Array":return function(e,t){for(var n=e.length,r=t.length,i=n<r?n:r,o=0;o<i;++o){var a=st(e[o],t[o]);if(0!==a)return a}return n===r?0:n<r?-1:1}(e,t)}}catch(e){}return NaN}function ct(e){var t=typeof e;if("object"!=t)return t;if(ArrayBuffer.isView(e))return"binary";e=A(e);return"ArrayBuffer"===e?"binary":e}function lt(e){return e instanceof Uint8Array?e:ArrayBuffer.isView(e)?new Uint8Array(e.buffer,e.byteOffset,e.byteLength):new Uint8Array(e)}var ft=(ht.prototype._trans=function(e,r,t){var n=this._tx||me.trans,i=this.name,o=ie&&"undefined"!=typeof console&&console.createTask&&console.createTask("Dexie: ".concat("readonly"===e?"read":"write"," ").concat(this.name));function a(e,t,n){if(!n.schema[i])throw new Y.NotFound("Table "+i+" not part of transaction");return r(n.idbtrans,n)}var u=je();try{var s=n&&n.db._novip===this.db._novip?n===me.trans?n._promise(e,a,t):Ne(function(){return n._promise(e,a,t)},{trans:n,transless:me.transless||me}):function t(n,r,i,o){if(n.idbdb&&(n._state.openComplete||me.letThrough||n._vip)){var a=n._createTransaction(r,i,n._dbSchema);try{a.create(),n._state.PR1398_maxLoop=3}catch(e){return e.name===z.InvalidState&&n.isOpen()&&0<--n._state.PR1398_maxLoop?(console.warn("Dexie: Need to reopen db"),n.close({disableAutoOpen:!1}),n.open().then(function(){return t(n,r,i,o)})):Xe(e)}return a._promise(r,function(e,t){return Ne(function(){return me.trans=a,o(e,t,a)})}).then(function(e){if("readwrite"===r)try{a.idbtrans.commit()}catch(e){}return"readonly"===r?e:a._completion.then(function(){return e})})}if(n._state.openComplete)return Xe(new Y.DatabaseClosed(n._state.dbOpenError));if(!n._state.isBeingOpened){if(!n._state.autoOpen)return Xe(new Y.DatabaseClosed);n.open().catch(G)}return n._state.dbReadyPromise.then(function(){return t(n,r,i,o)})}(this.db,e,[this.name],a);return o&&(s._consoleTask=o,s=s.catch(function(e){return console.trace(e),Xe(e)})),s}finally{u&&Ae()}},ht.prototype.get=function(t,e){var n=this;return t&&t.constructor===Object?this.where(t).first(e):null==t?Xe(new Y.Type("Invalid argument to Table.get()")):this._trans("readonly",function(e){return n.core.get({trans:e,key:t}).then(function(e){return n.hook.reading.fire(e)})}).then(e)},ht.prototype.where=function(o){if("string"==typeof o)return new this.db.WhereClause(this,o);if(x(o))return new this.db.WhereClause(this,"[".concat(o.join("+"),"]"));var n=_(o);if(1===n.length)return this.where(n[0]).equals(o[n[0]]);var e=this.schema.indexes.concat(this.schema.primKey).filter(function(t){if(t.compound&&n.every(function(e){return 0<=t.keyPath.indexOf(e)})){for(var e=0;e<n.length;++e)if(-1===n.indexOf(t.keyPath[e]))return!1;return!0}return!1}).sort(function(e,t){return e.keyPath.length-t.keyPath.length})[0];if(e&&this.db._maxKey!==He){var t=e.keyPath.slice(0,n.length);return this.where(t).equals(t.map(function(e){return o[e]}))}!e&&ie&&console.warn("The query ".concat(JSON.stringify(o)," on ").concat(this.name," would benefit from a ")+"compound index [".concat(n.join("+"),"]"));var a=this.schema.idxByName,r=this.db._deps.indexedDB;function u(e,t){return 0===r.cmp(e,t)}var i=n.reduce(function(e,t){var n=e[0],r=e[1],e=a[t],i=o[t];return[n||e,n||!e?it(r,e&&e.multi?function(e){e=k(e,t);return x(e)&&e.some(function(e){return u(i,e)})}:function(e){return u(i,k(e,t))}):r]},[null,null]),t=i[0],i=i[1];return t?this.where(t.name).equals(o[t.keyPath]).filter(i):e?this.filter(i):this.where(n).equals("")},ht.prototype.filter=function(e){return this.toCollection().and(e)},ht.prototype.count=function(e){return this.toCollection().count(e)},ht.prototype.offset=function(e){return this.toCollection().offset(e)},ht.prototype.limit=function(e){return this.toCollection().limit(e)},ht.prototype.each=function(e){return this.toCollection().each(e)},ht.prototype.toArray=function(e){return this.toCollection().toArray(e)},ht.prototype.toCollection=function(){return new this.db.Collection(new this.db.WhereClause(this))},ht.prototype.orderBy=function(e){return new this.db.Collection(new this.db.WhereClause(this,x(e)?"[".concat(e.join("+"),"]"):e))},ht.prototype.reverse=function(){return this.toCollection().reverse()},ht.prototype.mapToClass=function(r){var e,t=this.db,n=this.name;function i(){return null!==e&&e.apply(this,arguments)||this}(this.schema.mappedClass=r).prototype instanceof ut&&(function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function n(){this.constructor=e}s(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}(i,e=r),Object.defineProperty(i.prototype,"db",{get:function(){return t},enumerable:!1,configurable:!0}),i.prototype.table=function(){return n},r=i);for(var o=new Set,a=r.prototype;a;a=c(a))Object.getOwnPropertyNames(a).forEach(function(e){return o.add(e)});function u(e){if(!e)return e;var t,n=Object.create(r.prototype);for(t in e)if(!o.has(t))try{n[t]=e[t]}catch(e){}return n}return this.schema.readHook&&this.hook.reading.unsubscribe(this.schema.readHook),this.schema.readHook=u,this.hook("reading",u),r},ht.prototype.defineClass=function(){return this.mapToClass(function(e){a(this,e)})},ht.prototype.add=function(t,n){var r=this,e=this.schema.primKey,i=e.auto,o=e.keyPath,a=t;return o&&i&&(a=at(o)(t)),this._trans("readwrite",function(e){return r.core.mutate({trans:e,type:"add",keys:null!=n?[n]:null,values:[a]})}).then(function(e){return e.numFailures?_e.reject(e.failures[0]):e.lastResult}).then(function(e){if(o)try{P(t,o,e)}catch(e){}return e})},ht.prototype.update=function(e,t){if("object"!=typeof e||x(e))return this.where(":id").equals(e).modify(t);e=k(e,this.schema.primKey.keyPath);return void 0===e?Xe(new Y.InvalidArgument("Given object does not contain its primary key")):this.where(":id").equals(e).modify(t)},ht.prototype.put=function(t,n){var r=this,e=this.schema.primKey,i=e.auto,o=e.keyPath,a=t;return o&&i&&(a=at(o)(t)),this._trans("readwrite",function(e){return r.core.mutate({trans:e,type:"put",values:[a],keys:null!=n?[n]:null})}).then(function(e){return e.numFailures?_e.reject(e.failures[0]):e.lastResult}).then(function(e){if(o)try{P(t,o,e)}catch(e){}return e})},ht.prototype.delete=function(t){var n=this;return this._trans("readwrite",function(e){return n.core.mutate({trans:e,type:"delete",keys:[t]})}).then(function(e){return e.numFailures?_e.reject(e.failures[0]):void 0})},ht.prototype.clear=function(){var t=this;return this._trans("readwrite",function(e){return t.core.mutate({trans:e,type:"deleteRange",range:ot})}).then(function(e){return e.numFailures?_e.reject(e.failures[0]):void 0})},ht.prototype.bulkGet=function(t){var n=this;return this._trans("readonly",function(e){return n.core.getMany({keys:t,trans:e}).then(function(e){return e.map(function(e){return n.hook.reading.fire(e)})})})},ht.prototype.bulkAdd=function(r,e,t){var o=this,a=Array.isArray(e)?e:void 0,u=(t=t||(a?void 0:e))?t.allKeys:void 0;return this._trans("readwrite",function(e){var t=o.schema.primKey,n=t.auto,t=t.keyPath;if(t&&a)throw new Y.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");if(a&&a.length!==r.length)throw new Y.InvalidArgument("Arguments objects and keys must have the same length");var i=r.length,t=t&&n?r.map(at(t)):r;return o.core.mutate({trans:e,type:"add",keys:a,values:t,wantResults:u}).then(function(e){var t=e.numFailures,n=e.results,r=e.lastResult,e=e.failures;if(0===t)return u?n:r;throw new V("".concat(o.name,".bulkAdd(): ").concat(t," of ").concat(i," operations failed"),e)})})},ht.prototype.bulkPut=function(r,e,t){var o=this,a=Array.isArray(e)?e:void 0,u=(t=t||(a?void 0:e))?t.allKeys:void 0;return this._trans("readwrite",function(e){var t=o.schema.primKey,n=t.auto,t=t.keyPath;if(t&&a)throw new Y.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");if(a&&a.length!==r.length)throw new Y.InvalidArgument("Arguments objects and keys must have the same length");var i=r.length,t=t&&n?r.map(at(t)):r;return o.core.mutate({trans:e,type:"put",keys:a,values:t,wantResults:u}).then(function(e){var t=e.numFailures,n=e.results,r=e.lastResult,e=e.failures;if(0===t)return u?n:r;throw new V("".concat(o.name,".bulkPut(): ").concat(t," of ").concat(i," operations failed"),e)})})},ht.prototype.bulkUpdate=function(t){var h=this,n=this.core,r=t.map(function(e){return e.key}),i=t.map(function(e){return e.changes}),d=[];return this._trans("readwrite",function(e){return n.getMany({trans:e,keys:r,cache:"clone"}).then(function(c){var l=[],f=[];t.forEach(function(e,t){var n=e.key,r=e.changes,i=c[t];if(i){for(var o=0,a=Object.keys(r);o<a.length;o++){var u=a[o],s=r[u];if(u===h.schema.primKey.keyPath){if(0!==st(s,n))throw new Y.Constraint("Cannot update primary key in bulkUpdate()")}else P(i,u,s)}d.push(t),l.push(n),f.push(i)}});var s=l.length;return n.mutate({trans:e,type:"put",keys:l,values:f,updates:{keys:r,changeSpecs:i}}).then(function(e){var t=e.numFailures,n=e.failures;if(0===t)return s;for(var r=0,i=Object.keys(n);r<i.length;r++){var o,a=i[r],u=d[Number(a)];null!=u&&(o=n[a],delete n[a],n[u]=o)}throw new V("".concat(h.name,".bulkUpdate(): ").concat(t," of ").concat(s," operations failed"),n)})})})},ht.prototype.bulkDelete=function(t){var r=this,i=t.length;return this._trans("readwrite",function(e){return r.core.mutate({trans:e,type:"delete",keys:t})}).then(function(e){var t=e.numFailures,n=e.lastResult,e=e.failures;if(0===t)return n;throw new V("".concat(r.name,".bulkDelete(): ").concat(t," of ").concat(i," operations failed"),e)})},ht);function ht(){}function dt(i){function t(e,t){if(t){for(var n=arguments.length,r=new Array(n-1);--n;)r[n-1]=arguments[n];return a[e].subscribe.apply(null,r),i}if("string"==typeof e)return a[e]}var a={};t.addEventType=u;for(var e=1,n=arguments.length;e<n;++e)u(arguments[e]);return t;function u(e,n,r){if("object"!=typeof e){var i;n=n||ne;var o={subscribers:[],fire:r=r||G,subscribe:function(e){-1===o.subscribers.indexOf(e)&&(o.subscribers.push(e),o.fire=n(o.fire,e))},unsubscribe:function(t){o.subscribers=o.subscribers.filter(function(e){return e!==t}),o.fire=o.subscribers.reduce(n,r)}};return a[e]=t[e]=o}_(i=e).forEach(function(e){var t=i[e];if(x(t))u(e,i[e][0],i[e][1]);else{if("asap"!==t)throw new Y.InvalidArgument("Invalid event config");var n=u(e,X,function(){for(var e=arguments.length,t=new Array(e);e--;)t[e]=arguments[e];n.subscribers.forEach(function(e){v(function(){e.apply(null,t)})})})}})}}function pt(e,t){return o(t).from({prototype:e}),t}function yt(e,t){return!(e.filter||e.algorithm||e.or)&&(t?e.justLimit:!e.replayFilter)}function vt(e,t){e.filter=it(e.filter,t)}function mt(e,t,n){var r=e.replayFilter;e.replayFilter=r?function(){return it(r(),t())}:t,e.justLimit=n&&!r}function bt(e,t){if(e.isPrimKey)return t.primaryKey;var n=t.getIndexByKeyPath(e.index);if(!n)throw new Y.Schema("KeyPath "+e.index+" on object store "+t.name+" is not indexed");return n}function gt(e,t,n){var r=bt(e,t.schema);return t.openCursor({trans:n,values:!e.keysOnly,reverse:"prev"===e.dir,unique:!!e.unique,query:{index:r,range:e.range}})}function wt(e,o,t,n){var a=e.replayFilter?it(e.filter,e.replayFilter()):e.filter;if(e.or){var u={},r=function(e,t,n){var r,i;a&&!a(t,n,function(e){return t.stop(e)},function(e){return t.fail(e)})||("[object ArrayBuffer]"===(i=""+(r=t.primaryKey))&&(i=""+new Uint8Array(r)),m(u,i)||(u[i]=!0,o(e,t,n)))};return Promise.all([e.or._iterate(r,t),_t(gt(e,n,t),e.algorithm,r,!e.keysOnly&&e.valueMapper)])}return _t(gt(e,n,t),it(e.algorithm,a),o,!e.keysOnly&&e.valueMapper)}function _t(e,r,i,o){var a=Te(o?function(e,t,n){return i(o(e),t,n)}:i);return e.then(function(n){if(n)return n.start(function(){var t=function(){return n.continue()};r&&!r(n,function(e){return t=e},function(e){n.stop(e),t=G},function(e){n.fail(e),t=G})||a(n.value,n,function(e){return t=e}),t()})})}var e=Symbol(),xt=(kt.prototype.execute=function(e){if(void 0!==this.add){var t=this.add;if(x(t))return i(i([],x(e)?e:[],!0),t,!0).sort();if("number"==typeof t)return(Number(e)||0)+t;if("bigint"==typeof t)try{return BigInt(e)+t}catch(e){return BigInt(0)+t}throw new TypeError("Invalid term ".concat(t))}if(void 0!==this.remove){var n=this.remove;if(x(n))return x(e)?e.filter(function(e){return!n.includes(e)}).sort():[];if("number"==typeof n)return Number(e)-n;if("bigint"==typeof n)try{return BigInt(e)-n}catch(e){return BigInt(0)-n}throw new TypeError("Invalid subtrahend ".concat(n))}t=null===(t=this.replacePrefix)||void 0===t?void 0:t[0];return t&&"string"==typeof e&&e.startsWith(t)?this.replacePrefix[1]+e.substring(t.length):e},kt);function kt(e){Object.assign(this,e)}var Ot=(Pt.prototype._read=function(e,t){var n=this._ctx;return n.error?n.table._trans(null,Xe.bind(null,n.error)):n.table._trans("readonly",e).then(t)},Pt.prototype._write=function(e){var t=this._ctx;return t.error?t.table._trans(null,Xe.bind(null,t.error)):t.table._trans("readwrite",e,"locked")},Pt.prototype._addAlgorithm=function(e){var t=this._ctx;t.algorithm=it(t.algorithm,e)},Pt.prototype._iterate=function(e,t){return wt(this._ctx,e,t,this._ctx.table.core)},Pt.prototype.clone=function(e){var t=Object.create(this.constructor.prototype),n=Object.create(this._ctx);return e&&a(n,e),t._ctx=n,t},Pt.prototype.raw=function(){return this._ctx.valueMapper=null,this},Pt.prototype.each=function(t){var n=this._ctx;return this._read(function(e){return wt(n,t,e,n.table.core)})},Pt.prototype.count=function(e){var i=this;return this._read(function(e){var t=i._ctx,n=t.table.core;if(yt(t,!0))return n.count({trans:e,query:{index:bt(t,n.schema),range:t.range}}).then(function(e){return Math.min(e,t.limit)});var r=0;return wt(t,function(){return++r,!1},e,n).then(function(){return r})}).then(e)},Pt.prototype.sortBy=function(e,t){var n=e.split(".").reverse(),r=n[0],i=n.length-1;function o(e,t){return t?o(e[n[t]],t-1):e[r]}var a="next"===this._ctx.dir?1:-1;function u(e,t){e=o(e,i),t=o(t,i);return e<t?-a:t<e?a:0}return this.toArray(function(e){return e.sort(u)}).then(t)},Pt.prototype.toArray=function(e){var o=this;return this._read(function(e){var t=o._ctx;if("next"===t.dir&&yt(t,!0)&&0<t.limit){var n=t.valueMapper,r=bt(t,t.table.core.schema);return t.table.core.query({trans:e,limit:t.limit,values:!0,query:{index:r,range:t.range}}).then(function(e){e=e.result;return n?e.map(n):e})}var i=[];return wt(t,function(e){return i.push(e)},e,t.table.core).then(function(){return i})},e)},Pt.prototype.offset=function(t){var e=this._ctx;return t<=0||(e.offset+=t,yt(e)?mt(e,function(){var n=t;return function(e,t){return 0===n||(1===n?--n:t(function(){e.advance(n),n=0}),!1)}}):mt(e,function(){var e=t;return function(){return--e<0}})),this},Pt.prototype.limit=function(e){return this._ctx.limit=Math.min(this._ctx.limit,e),mt(this._ctx,function(){var r=e;return function(e,t,n){return--r<=0&&t(n),0<=r}},!0),this},Pt.prototype.until=function(r,i){return vt(this._ctx,function(e,t,n){return!r(e.value)||(t(n),i)}),this},Pt.prototype.first=function(e){return this.limit(1).toArray(function(e){return e[0]}).then(e)},Pt.prototype.last=function(e){return this.reverse().first(e)},Pt.prototype.filter=function(t){var e;return vt(this._ctx,function(e){return t(e.value)}),(e=this._ctx).isMatch=it(e.isMatch,t),this},Pt.prototype.and=function(e){return this.filter(e)},Pt.prototype.or=function(e){return new this.db.WhereClause(this._ctx.table,e,this)},Pt.prototype.reverse=function(){return this._ctx.dir="prev"===this._ctx.dir?"next":"prev",this._ondirectionchange&&this._ondirectionchange(this._ctx.dir),this},Pt.prototype.desc=function(){return this.reverse()},Pt.prototype.eachKey=function(n){var e=this._ctx;return e.keysOnly=!e.isMatch,this.each(function(e,t){n(t.key,t)})},Pt.prototype.eachUniqueKey=function(e){return this._ctx.unique="unique",this.eachKey(e)},Pt.prototype.eachPrimaryKey=function(n){var e=this._ctx;return e.keysOnly=!e.isMatch,this.each(function(e,t){n(t.primaryKey,t)})},Pt.prototype.keys=function(e){var t=this._ctx;t.keysOnly=!t.isMatch;var n=[];return this.each(function(e,t){n.push(t.key)}).then(function(){return n}).then(e)},Pt.prototype.primaryKeys=function(e){var n=this._ctx;if("next"===n.dir&&yt(n,!0)&&0<n.limit)return this._read(function(e){var t=bt(n,n.table.core.schema);return n.table.core.query({trans:e,values:!1,limit:n.limit,query:{index:t,range:n.range}})}).then(function(e){return e.result}).then(e);n.keysOnly=!n.isMatch;var r=[];return this.each(function(e,t){r.push(t.primaryKey)}).then(function(){return r}).then(e)},Pt.prototype.uniqueKeys=function(e){return this._ctx.unique="unique",this.keys(e)},Pt.prototype.firstKey=function(e){return this.limit(1).keys(function(e){return e[0]}).then(e)},Pt.prototype.lastKey=function(e){return this.reverse().firstKey(e)},Pt.prototype.distinct=function(){var e=this._ctx,e=e.index&&e.table.schema.idxByName[e.index];if(!e||!e.multi)return this;var n={};return vt(this._ctx,function(e){var t=e.primaryKey.toString(),e=m(n,t);return n[t]=!0,!e}),this},Pt.prototype.modify=function(w){var n=this,r=this._ctx;return this._write(function(d){var a,u,p;p="function"==typeof w?w:(a=_(w),u=a.length,function(e){for(var t=!1,n=0;n<u;++n){var r=a[n],i=w[r],o=k(e,r);i instanceof xt?(P(e,r,i.execute(o)),t=!0):o!==i&&(P(e,r,i),t=!0)}return t});function y(e,t){var n=t.failures,t=t.numFailures;c+=e-t;for(var r=0,i=_(n);r<i.length;r++){var o=i[r];s.push(n[o])}}var v=r.table.core,e=v.schema.primaryKey,m=e.outbound,b=e.extractKey,g=n.db._options.modifyChunkSize||200,s=[],c=0,t=[];return n.clone().primaryKeys().then(function(l){function f(s){var c=Math.min(g,l.length-s);return v.getMany({trans:d,keys:l.slice(s,s+c),cache:"immutable"}).then(function(e){for(var n=[],t=[],r=m?[]:null,i=[],o=0;o<c;++o){var a=e[o],u={value:S(a),primKey:l[s+o]};!1!==p.call(u,u.value,u)&&(null==u.value?i.push(l[s+o]):m||0===st(b(a),b(u.value))?(t.push(u.value),m&&r.push(l[s+o])):(i.push(l[s+o]),n.push(u.value)))}return Promise.resolve(0<n.length&&v.mutate({trans:d,type:"add",values:n}).then(function(e){for(var t in e.failures)i.splice(parseInt(t),1);y(n.length,e)})).then(function(){return(0<t.length||h&&"object"==typeof w)&&v.mutate({trans:d,type:"put",keys:r,values:t,criteria:h,changeSpec:"function"!=typeof w&&w,isAdditionalChunk:0<s}).then(function(e){return y(t.length,e)})}).then(function(){return(0<i.length||h&&w===Et)&&v.mutate({trans:d,type:"delete",keys:i,criteria:h,isAdditionalChunk:0<s}).then(function(e){return y(i.length,e)})}).then(function(){return l.length>s+c&&f(s+g)})})}var h=yt(r)&&r.limit===1/0&&("function"!=typeof w||w===Et)&&{index:r.index,range:r.range};return f(0).then(function(){if(0<s.length)throw new U("Error modifying one or more objects",s,c,t);return l.length})})})},Pt.prototype.delete=function(){var i=this._ctx,n=i.range;return yt(i)&&(i.isPrimKey||3===n.type)?this._write(function(e){var t=i.table.core.schema.primaryKey,r=n;return i.table.core.count({trans:e,query:{index:t,range:r}}).then(function(n){return i.table.core.mutate({trans:e,type:"deleteRange",range:r}).then(function(e){var t=e.failures;e.lastResult,e.results;e=e.numFailures;if(e)throw new U("Could not delete some values",Object.keys(t).map(function(e){return t[e]}),n-e);return n-e})})}):this.modify(Et)},Pt);function Pt(){}var Et=function(e,t){return t.value=null};function Kt(e,t){return e<t?-1:e===t?0:1}function St(e,t){return t<e?-1:e===t?0:1}function jt(e,t,n){e=e instanceof qt?new e.Collection(e):e;return e._ctx.error=new(n||TypeError)(t),e}function At(e){return new e.Collection(e,function(){return Tt("")}).limit(0)}function Ct(e,s,n,r){var i,c,l,f,h,d,p,y=n.length;if(!n.every(function(e){return"string"==typeof e}))return jt(e,Ze);function t(e){i="next"===e?function(e){return e.toUpperCase()}:function(e){return e.toLowerCase()},c="next"===e?function(e){return e.toLowerCase()}:function(e){return e.toUpperCase()},l="next"===e?Kt:St;var t=n.map(function(e){return{lower:c(e),upper:i(e)}}).sort(function(e,t){return l(e.lower,t.lower)});f=t.map(function(e){return e.upper}),h=t.map(function(e){return e.lower}),p="next"===(d=e)?"":r}t("next");e=new e.Collection(e,function(){return Dt(f[0],h[y-1]+r)});e._ondirectionchange=function(e){t(e)};var v=0;return e._addAlgorithm(function(e,t,n){var r=e.key;if("string"!=typeof r)return!1;var i=c(r);if(s(i,h,v))return!0;for(var o=null,a=v;a<y;++a){var u=function(e,t,n,r,i,o){for(var a=Math.min(e.length,r.length),u=-1,s=0;s<a;++s){var c=t[s];if(c!==r[s])return i(e[s],n[s])<0?e.substr(0,s)+n[s]+n.substr(s+1):i(e[s],r[s])<0?e.substr(0,s)+r[s]+n.substr(s+1):0<=u?e.substr(0,u)+t[u]+n.substr(u+1):null;i(e[s],c)<0&&(u=s)}return a<r.length&&"next"===o?e+n.substr(e.length):a<e.length&&"prev"===o?e.substr(0,n.length):u<0?null:e.substr(0,u)+r[u]+n.substr(u+1)}(r,i,f[a],h[a],l,d);null===u&&null===o?v=a+1:(null===o||0<l(o,u))&&(o=u)}return t(null!==o?function(){e.continue(o+p)}:n),!1}),e}function Dt(e,t,n,r){return{type:2,lower:e,upper:t,lowerOpen:n,upperOpen:r}}function Tt(e){return{type:1,lower:e,upper:e}}var qt=(Object.defineProperty(It.prototype,"Collection",{get:function(){return this._ctx.table.db.Collection},enumerable:!1,configurable:!0}),It.prototype.between=function(e,t,n,r){n=!1!==n,r=!0===r;try{return 0<this._cmp(e,t)||0===this._cmp(e,t)&&(n||r)&&(!n||!r)?At(this):new this.Collection(this,function(){return Dt(e,t,!n,!r)})}catch(e){return jt(this,Je)}},It.prototype.equals=function(e){return null==e?jt(this,Je):new this.Collection(this,function(){return Tt(e)})},It.prototype.above=function(e){return null==e?jt(this,Je):new this.Collection(this,function(){return Dt(e,void 0,!0)})},It.prototype.aboveOrEqual=function(e){return null==e?jt(this,Je):new this.Collection(this,function(){return Dt(e,void 0,!1)})},It.prototype.below=function(e){return null==e?jt(this,Je):new this.Collection(this,function(){return Dt(void 0,e,!1,!0)})},It.prototype.belowOrEqual=function(e){return null==e?jt(this,Je):new this.Collection(this,function(){return Dt(void 0,e)})},It.prototype.startsWith=function(e){return"string"!=typeof e?jt(this,Ze):this.between(e,e+He,!0,!0)},It.prototype.startsWithIgnoreCase=function(e){return""===e?this.startsWith(e):Ct(this,function(e,t){return 0===e.indexOf(t[0])},[e],He)},It.prototype.equalsIgnoreCase=function(e){return Ct(this,function(e,t){return e===t[0]},[e],"")},It.prototype.anyOfIgnoreCase=function(){var e=I.apply(q,arguments);return 0===e.length?At(this):Ct(this,function(e,t){return-1!==t.indexOf(e)},e,"")},It.prototype.startsWithAnyOfIgnoreCase=function(){var e=I.apply(q,arguments);return 0===e.length?At(this):Ct(this,function(t,e){return e.some(function(e){return 0===t.indexOf(e)})},e,He)},It.prototype.anyOf=function(){var t=this,i=I.apply(q,arguments),o=this._cmp;try{i.sort(o)}catch(e){return jt(this,Je)}if(0===i.length)return At(this);var e=new this.Collection(this,function(){return Dt(i[0],i[i.length-1])});e._ondirectionchange=function(e){o="next"===e?t._ascending:t._descending,i.sort(o)};var a=0;return e._addAlgorithm(function(e,t,n){for(var r=e.key;0<o(r,i[a]);)if(++a===i.length)return t(n),!1;return 0===o(r,i[a])||(t(function(){e.continue(i[a])}),!1)}),e},It.prototype.notEqual=function(e){return this.inAnyRange([[-1/0,e],[e,this.db._maxKey]],{includeLowers:!1,includeUppers:!1})},It.prototype.noneOf=function(){var e=I.apply(q,arguments);if(0===e.length)return new this.Collection(this);try{e.sort(this._ascending)}catch(e){return jt(this,Je)}var t=e.reduce(function(e,t){return e?e.concat([[e[e.length-1][1],t]]):[[-1/0,t]]},null);return t.push([e[e.length-1],this.db._maxKey]),this.inAnyRange(t,{includeLowers:!1,includeUppers:!1})},It.prototype.inAnyRange=function(e,t){var o=this,a=this._cmp,u=this._ascending,n=this._descending,s=this._min,c=this._max;if(0===e.length)return At(this);if(!e.every(function(e){return void 0!==e[0]&&void 0!==e[1]&&u(e[0],e[1])<=0}))return jt(this,"First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower",Y.InvalidArgument);var r=!t||!1!==t.includeLowers,i=t&&!0===t.includeUppers;var l,f=u;function h(e,t){return f(e[0],t[0])}try{(l=e.reduce(function(e,t){for(var n=0,r=e.length;n<r;++n){var i=e[n];if(a(t[0],i[1])<0&&0<a(t[1],i[0])){i[0]=s(i[0],t[0]),i[1]=c(i[1],t[1]);break}}return n===r&&e.push(t),e},[])).sort(h)}catch(e){return jt(this,Je)}var d=0,p=i?function(e){return 0<u(e,l[d][1])}:function(e){return 0<=u(e,l[d][1])},y=r?function(e){return 0<n(e,l[d][0])}:function(e){return 0<=n(e,l[d][0])};var v=p,e=new this.Collection(this,function(){return Dt(l[0][0],l[l.length-1][1],!r,!i)});return e._ondirectionchange=function(e){f="next"===e?(v=p,u):(v=y,n),l.sort(h)},e._addAlgorithm(function(e,t,n){for(var r,i=e.key;v(i);)if(++d===l.length)return t(n),!1;return!p(r=i)&&!y(r)||(0===o._cmp(i,l[d][1])||0===o._cmp(i,l[d][0])||t(function(){f===u?e.continue(l[d][0]):e.continue(l[d][1])}),!1)}),e},It.prototype.startsWithAnyOf=function(){var e=I.apply(q,arguments);return e.every(function(e){return"string"==typeof e})?0===e.length?At(this):this.inAnyRange(e.map(function(e){return[e,e+He]})):jt(this,"startsWithAnyOf() only works with strings")},It);function It(){}function Bt(t){return Te(function(e){return Rt(e),t(e.target.error),!1})}function Rt(e){e.stopPropagation&&e.stopPropagation(),e.preventDefault&&e.preventDefault()}var Ft="storagemutated",Mt="x-storagemutated-1",Nt=dt(null,Ft),Lt=(Ut.prototype._lock=function(){return y(!me.global),++this._reculock,1!==this._reculock||me.global||(me.lockOwnerFor=this),this},Ut.prototype._unlock=function(){if(y(!me.global),0==--this._reculock)for(me.global||(me.lockOwnerFor=null);0<this._blockedFuncs.length&&!this._locked();){var e=this._blockedFuncs.shift();try{$e(e[1],e[0])}catch(e){}}return this},Ut.prototype._locked=function(){return this._reculock&&me.lockOwnerFor!==this},Ut.prototype.create=function(t){var n=this;if(!this.mode)return this;var e=this.db.idbdb,r=this.db._state.dbOpenError;if(y(!this.idbtrans),!t&&!e)switch(r&&r.name){case"DatabaseClosedError":throw new Y.DatabaseClosed(r);case"MissingAPIError":throw new Y.MissingAPI(r.message,r);default:throw new Y.OpenFailed(r)}if(!this.active)throw new Y.TransactionInactive;return y(null===this._completion._state),(t=this.idbtrans=t||(this.db.core||e).transaction(this.storeNames,this.mode,{durability:this.chromeTransactionDurability})).onerror=Te(function(e){Rt(e),n._reject(t.error)}),t.onabort=Te(function(e){Rt(e),n.active&&n._reject(new Y.Abort(t.error)),n.active=!1,n.on("abort").fire(e)}),t.oncomplete=Te(function(){n.active=!1,n._resolve(),"mutatedParts"in t&&Nt.storagemutated.fire(t.mutatedParts)}),this},Ut.prototype._promise=function(n,r,i){var o=this;if("readwrite"===n&&"readwrite"!==this.mode)return Xe(new Y.ReadOnly("Transaction is readonly"));if(!this.active)return Xe(new Y.TransactionInactive);if(this._locked())return new _e(function(e,t){o._blockedFuncs.push([function(){o._promise(n,r,i).then(e,t)},me])});if(i)return Ne(function(){var e=new _e(function(e,t){o._lock();var n=r(e,t,o);n&&n.then&&n.then(e,t)});return e.finally(function(){return o._unlock()}),e._lib=!0,e});var e=new _e(function(e,t){var n=r(e,t,o);n&&n.then&&n.then(e,t)});return e._lib=!0,e},Ut.prototype._root=function(){return this.parent?this.parent._root():this},Ut.prototype.waitFor=function(e){var t,r=this._root(),i=_e.resolve(e);r._waitingFor?r._waitingFor=r._waitingFor.then(function(){return i}):(r._waitingFor=i,r._waitingQueue=[],t=r.idbtrans.objectStore(r.storeNames[0]),function e(){for(++r._spinCount;r._waitingQueue.length;)r._waitingQueue.shift()();r._waitingFor&&(t.get(-1/0).onsuccess=e)}());var o=r._waitingFor;return new _e(function(t,n){i.then(function(e){return r._waitingQueue.push(Te(t.bind(null,e)))},function(e){return r._waitingQueue.push(Te(n.bind(null,e)))}).finally(function(){r._waitingFor===o&&(r._waitingFor=null)})})},Ut.prototype.abort=function(){this.active&&(this.active=!1,this.idbtrans&&this.idbtrans.abort(),this._reject(new Y.Abort))},Ut.prototype.table=function(e){var t=this._memoizedTables||(this._memoizedTables={});if(m(t,e))return t[e];var n=this.schema[e];if(!n)throw new Y.NotFound("Table "+e+" not part of transaction");n=new this.db.Table(e,n,this);return n.core=this.db.core.table(e),t[e]=n},Ut);function Ut(){}function Vt(e,t,n,r,i,o,a){return{name:e,keyPath:t,unique:n,multi:r,auto:i,compound:o,src:(n&&!a?"&":"")+(r?"*":"")+(i?"++":"")+zt(t)}}function zt(e){return"string"==typeof e?e:e?"["+[].join.call(e,"+")+"]":""}function Wt(e,t,n){return{name:e,primKey:t,indexes:n,mappedClass:null,idxByName:(r=function(e){return[e.name,e]},n.reduce(function(e,t,n){n=r(t,n);return n&&(e[n[0]]=n[1]),e},{}))};var r}var Yt=function(e){try{return e.only([[]]),Yt=function(){return[[]]},[[]]}catch(e){return Yt=function(){return He},He}};function $t(t){return null==t?function(){}:"string"==typeof t?1===(n=t).split(".").length?function(e){return e[n]}:function(e){return k(e,n)}:function(e){return k(e,t)};var n}function Qt(e){return[].slice.call(e)}var Gt=0;function Xt(e){return null==e?":id":"string"==typeof e?e:"[".concat(e.join("+"),"]")}function Ht(e,i,t){function _(e){if(3===e.type)return null;if(4===e.type)throw new Error("Cannot convert never type to IDBKeyRange");var t=e.lower,n=e.upper,r=e.lowerOpen,e=e.upperOpen;return void 0===t?void 0===n?null:i.upperBound(n,!!e):void 0===n?i.lowerBound(t,!!r):i.bound(t,n,!!r,!!e)}function n(e){var h,w=e.name;return{name:w,schema:e,mutate:function(e){var y=e.trans,v=e.type,m=e.keys,b=e.values,g=e.range;return new Promise(function(t,e){t=Te(t);var n=y.objectStore(w),r=null==n.keyPath,i="put"===v||"add"===v;if(!i&&"delete"!==v&&"deleteRange"!==v)throw new Error("Invalid operation type: "+v);var o,a=(m||b||{length:1}).length;if(m&&b&&m.length!==b.length)throw new Error("Given keys array must have same length as given values array.");if(0===a)return t({numFailures:0,failures:{},results:[],lastResult:void 0});function u(e){++l,Rt(e)}var s=[],c=[],l=0;if("deleteRange"===v){if(4===g.type)return t({numFailures:l,failures:c,results:[],lastResult:void 0});3===g.type?s.push(o=n.clear()):s.push(o=n.delete(_(g)))}else{var r=i?r?[b,m]:[b,null]:[m,null],f=r[0],h=r[1];if(i)for(var d=0;d<a;++d)s.push(o=h&&void 0!==h[d]?n[v](f[d],h[d]):n[v](f[d])),o.onerror=u;else for(d=0;d<a;++d)s.push(o=n[v](f[d])),o.onerror=u}function p(e){e=e.target.result,s.forEach(function(e,t){return null!=e.error&&(c[t]=e.error)}),t({numFailures:l,failures:c,results:"delete"===v?m:s.map(function(e){return e.result}),lastResult:e})}o.onerror=function(e){u(e),p(e)},o.onsuccess=p})},getMany:function(e){var f=e.trans,h=e.keys;return new Promise(function(t,e){t=Te(t);for(var n,r=f.objectStore(w),i=h.length,o=new Array(i),a=0,u=0,s=function(e){e=e.target;o[e._pos]=e.result,++u===a&&t(o)},c=Bt(e),l=0;l<i;++l)null!=h[l]&&((n=r.get(h[l]))._pos=l,n.onsuccess=s,n.onerror=c,++a);0===a&&t(o)})},get:function(e){var r=e.trans,i=e.key;return new Promise(function(t,e){t=Te(t);var n=r.objectStore(w).get(i);n.onsuccess=function(e){return t(e.target.result)},n.onerror=Bt(e)})},query:(h=s,function(f){return new Promise(function(n,e){n=Te(n);var r,i,o,t=f.trans,a=f.values,u=f.limit,s=f.query,c=u===1/0?void 0:u,l=s.index,s=s.range,t=t.objectStore(w),l=l.isPrimaryKey?t:t.index(l.name),s=_(s);if(0===u)return n({result:[]});h?((c=a?l.getAll(s,c):l.getAllKeys(s,c)).onsuccess=function(e){return n({result:e.target.result})},c.onerror=Bt(e)):(r=0,i=!a&&"openKeyCursor"in l?l.openKeyCursor(s):l.openCursor(s),o=[],i.onsuccess=function(e){var t=i.result;return t?(o.push(a?t.value:t.primaryKey),++r===u?n({result:o}):void t.continue()):n({result:o})},i.onerror=Bt(e))})}),openCursor:function(e){var c=e.trans,o=e.values,a=e.query,u=e.reverse,l=e.unique;return new Promise(function(t,n){t=Te(t);var e=a.index,r=a.range,i=c.objectStore(w),i=e.isPrimaryKey?i:i.index(e.name),e=u?l?"prevunique":"prev":l?"nextunique":"next",s=!o&&"openKeyCursor"in i?i.openKeyCursor(_(r),e):i.openCursor(_(r),e);s.onerror=Bt(n),s.onsuccess=Te(function(e){var r,i,o,a,u=s.result;u?(u.___id=++Gt,u.done=!1,r=u.continue.bind(u),i=(i=u.continuePrimaryKey)&&i.bind(u),o=u.advance.bind(u),a=function(){throw new Error("Cursor not stopped")},u.trans=c,u.stop=u.continue=u.continuePrimaryKey=u.advance=function(){throw new Error("Cursor not started")},u.fail=Te(n),u.next=function(){var e=this,t=1;return this.start(function(){return t--?e.continue():e.stop()}).then(function(){return e})},u.start=function(e){function t(){if(s.result)try{e()}catch(e){u.fail(e)}else u.done=!0,u.start=function(){throw new Error("Cursor behind last entry")},u.stop()}var n=new Promise(function(t,e){t=Te(t),s.onerror=Bt(e),u.fail=e,u.stop=function(e){u.stop=u.continue=u.continuePrimaryKey=u.advance=a,t(e)}});return s.onsuccess=Te(function(e){s.onsuccess=t,t()}),u.continue=r,u.continuePrimaryKey=i,u.advance=o,t(),n},t(u)):t(null)},n)})},count:function(e){var t=e.query,i=e.trans,o=t.index,a=t.range;return new Promise(function(t,e){var n=i.objectStore(w),r=o.isPrimaryKey?n:n.index(o.name),n=_(a),r=n?r.count(n):r.count();r.onsuccess=Te(function(e){return t(e.target.result)}),r.onerror=Bt(e)})}}}var r,o,a,u=(o=t,a=Qt((r=e).objectStoreNames),{schema:{name:r.name,tables:a.map(function(e){return o.objectStore(e)}).map(function(t){var e=t.keyPath,n=t.autoIncrement,r=x(e),i={},n={name:t.name,primaryKey:{name:null,isPrimaryKey:!0,outbound:null==e,compound:r,keyPath:e,autoIncrement:n,unique:!0,extractKey:$t(e)},indexes:Qt(t.indexNames).map(function(e){return t.index(e)}).map(function(e){var t=e.name,n=e.unique,r=e.multiEntry,e=e.keyPath,r={name:t,compound:x(e),keyPath:e,unique:n,multiEntry:r,extractKey:$t(e)};return i[Xt(e)]=r}),getIndexByKeyPath:function(e){return i[Xt(e)]}};return i[":id"]=n.primaryKey,null!=e&&(i[Xt(e)]=n.primaryKey),n})},hasGetAll:0<a.length&&"getAll"in o.objectStore(a[0])&&!("undefined"!=typeof navigator&&/Safari/.test(navigator.userAgent)&&!/(Chrome\/|Edge\/)/.test(navigator.userAgent)&&[].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1]<604)}),t=u.schema,s=u.hasGetAll,u=t.tables.map(n),c={};return u.forEach(function(e){return c[e.name]=e}),{stack:"dbcore",transaction:e.transaction.bind(e),table:function(e){if(!c[e])throw new Error("Table '".concat(e,"' not found"));return c[e]},MIN_KEY:-1/0,MAX_KEY:Yt(i),schema:t}}function Jt(e,t,n,r){var i=n.IDBKeyRange;return n.indexedDB,{dbcore:(r=Ht(t,i,r),e.dbcore.reduce(function(e,t){t=t.create;return w(w({},e),t(e))},r))}}function Zt(n,e){var t=e.db,e=Jt(n._middlewares,t,n._deps,e);n.core=e.dbcore,n.tables.forEach(function(e){var t=e.name;n.core.schema.tables.some(function(e){return e.name===t})&&(e.core=n.core.table(t),n[t]instanceof n.Table&&(n[t].core=e.core))})}function en(i,e,t,o){t.forEach(function(n){var r=o[n];e.forEach(function(e){var t=function e(t,n){return h(t,n)||(t=c(t))&&e(t,n)}(e,n);(!t||"value"in t&&void 0===t.value)&&(e===i.Transaction.prototype||e instanceof i.Transaction?l(e,n,{get:function(){return this.table(n)},set:function(e){u(this,n,{value:e,writable:!0,configurable:!0,enumerable:!0})}}):e[n]=new i.Table(n,r))})})}function tn(n,e){e.forEach(function(e){for(var t in e)e[t]instanceof n.Table&&delete e[t]})}function nn(e,t){return e._cfg.version-t._cfg.version}function rn(n,r,i,e){var o=n._dbSchema;i.objectStoreNames.contains("$meta")&&!o.$meta&&(o.$meta=Wt("$meta",hn("")[0],[]),n._storeNames.push("$meta"));var a=n._createTransaction("readwrite",n._storeNames,o);a.create(i),a._completion.catch(e);var u=a._reject.bind(a),s=me.transless||me;Ne(function(){return me.trans=a,me.transless=s,0!==r?(Zt(n,i),t=r,((e=a).storeNames.includes("$meta")?e.table("$meta").get("version").then(function(e){return null!=e?e:t}):_e.resolve(t)).then(function(e){return c=e,l=a,f=i,t=[],e=(s=n)._versions,h=s._dbSchema=ln(0,s.idbdb,f),0!==(e=e.filter(function(e){return e._cfg.version>=c})).length?(e.forEach(function(u){t.push(function(){var t=h,e=u._cfg.dbschema;fn(s,t,f),fn(s,e,f),h=s._dbSchema=e;var n=an(t,e);n.add.forEach(function(e){un(f,e[0],e[1].primKey,e[1].indexes)}),n.change.forEach(function(e){if(e.recreate)throw new Y.Upgrade("Not yet support for changing primary key");var t=f.objectStore(e.name);e.add.forEach(function(e){return cn(t,e)}),e.change.forEach(function(e){t.deleteIndex(e.name),cn(t,e)}),e.del.forEach(function(e){return t.deleteIndex(e)})});var r=u._cfg.contentUpgrade;if(r&&u._cfg.version>c){Zt(s,f),l._memoizedTables={};var i=g(e);n.del.forEach(function(e){i[e]=t[e]}),tn(s,[s.Transaction.prototype]),en(s,[s.Transaction.prototype],_(i),i),l.schema=i;var o,a=B(r);a&&Le();n=_e.follow(function(){var e;(o=r(l))&&a&&(e=Ue.bind(null,null),o.then(e,e))});return o&&"function"==typeof o.then?_e.resolve(o):n.then(function(){return o})}}),t.push(function(e){var t,n,r=u._cfg.dbschema;t=r,n=e,[].slice.call(n.db.objectStoreNames).forEach(function(e){return null==t[e]&&n.db.deleteObjectStore(e)}),tn(s,[s.Transaction.prototype]),en(s,[s.Transaction.prototype],s._storeNames,s._dbSchema),l.schema=s._dbSchema}),t.push(function(e){s.idbdb.objectStoreNames.contains("$meta")&&(Math.ceil(s.idbdb.version/10)===u._cfg.version?(s.idbdb.deleteObjectStore("$meta"),delete s._dbSchema.$meta,s._storeNames=s._storeNames.filter(function(e){return"$meta"!==e})):e.objectStore("$meta").put(u._cfg.version,"version"))})}),function e(){return t.length?_e.resolve(t.shift()(l.idbtrans)).then(e):_e.resolve()}().then(function(){sn(h,f)})):_e.resolve();var s,c,l,f,t,h}).catch(u)):(_(o).forEach(function(e){un(i,e,o[e].primKey,o[e].indexes)}),Zt(n,i),void _e.follow(function(){return n.on.populate.fire(a)}).catch(u));var e,t})}function on(e,r){sn(e._dbSchema,r),r.db.version%10!=0||r.objectStoreNames.contains("$meta")||r.db.createObjectStore("$meta").add(Math.ceil(r.db.version/10-1),"version");var t=ln(0,e.idbdb,r);fn(e,e._dbSchema,r);for(var n=0,i=an(t,e._dbSchema).change;n<i.length;n++){var o=function(t){if(t.change.length||t.recreate)return console.warn("Unable to patch indexes of table ".concat(t.name," because it has changes on the type of index or primary key.")),{value:void 0};var n=r.objectStore(t.name);t.add.forEach(function(e){ie&&console.debug("Dexie upgrade patch: Creating missing index ".concat(t.name,".").concat(e.src)),cn(n,e)})}(i[n]);if("object"==typeof o)return o.value}}function an(e,t){var n,r={del:[],add:[],change:[]};for(n in e)t[n]||r.del.push(n);for(n in t){var i=e[n],o=t[n];if(i){var a={name:n,def:o,recreate:!1,del:[],add:[],change:[]};if(""+(i.primKey.keyPath||"")!=""+(o.primKey.keyPath||"")||i.primKey.auto!==o.primKey.auto)a.recreate=!0,r.change.push(a);else{var u=i.idxByName,s=o.idxByName,c=void 0;for(c in u)s[c]||a.del.push(c);for(c in s){var l=u[c],f=s[c];l?l.src!==f.src&&a.change.push(f):a.add.push(f)}(0<a.del.length||0<a.add.length||0<a.change.length)&&r.change.push(a)}}else r.add.push([n,o])}return r}function un(e,t,n,r){var i=e.db.createObjectStore(t,n.keyPath?{keyPath:n.keyPath,autoIncrement:n.auto}:{autoIncrement:n.auto});return r.forEach(function(e){return cn(i,e)}),i}function sn(t,n){_(t).forEach(function(e){n.db.objectStoreNames.contains(e)||(ie&&console.debug("Dexie: Creating missing table",e),un(n,e,t[e].primKey,t[e].indexes))})}function cn(e,t){e.createIndex(t.name,t.keyPath,{unique:t.unique,multiEntry:t.multi})}function ln(e,t,u){var s={};return b(t.objectStoreNames,0).forEach(function(e){for(var t=u.objectStore(e),n=Vt(zt(a=t.keyPath),a||"",!0,!1,!!t.autoIncrement,a&&"string"!=typeof a,!0),r=[],i=0;i<t.indexNames.length;++i){var o=t.index(t.indexNames[i]),a=o.keyPath,o=Vt(o.name,a,!!o.unique,!!o.multiEntry,!1,a&&"string"!=typeof a,!1);r.push(o)}s[e]=Wt(e,n,r)}),s}function fn(e,t,n){for(var r=n.db.objectStoreNames,i=0;i<r.length;++i){var o=r[i],a=n.objectStore(o);e._hasGetAll="getAll"in a;for(var u=0;u<a.indexNames.length;++u){var s=a.indexNames[u],c=a.index(s).keyPath,l="string"==typeof c?c:"["+b(c).join("+")+"]";!t[o]||(c=t[o].idxByName[l])&&(c.name=s,delete t[o].idxByName[l],t[o].idxByName[s]=c)}}"undefined"!=typeof navigator&&/Safari/.test(navigator.userAgent)&&!/(Chrome\/|Edge\/)/.test(navigator.userAgent)&&f.WorkerGlobalScope&&f instanceof f.WorkerGlobalScope&&[].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1]<604&&(e._hasGetAll=!1)}function hn(e){return e.split(",").map(function(e,t){var n=(e=e.trim()).replace(/([&*]|\+\+)/g,""),r=/^\[/.test(n)?n.match(/^\[(.*)\]$/)[1].split("+"):n;return Vt(n,r||null,/\&/.test(e),/\*/.test(e),/\+\+/.test(e),x(r),0===t)})}var dn=(pn.prototype._parseStoresSpec=function(r,i){_(r).forEach(function(e){if(null!==r[e]){var t=hn(r[e]),n=t.shift();if(n.unique=!0,n.multi)throw new Y.Schema("Primary key cannot be multi-valued");t.forEach(function(e){if(e.auto)throw new Y.Schema("Only primary key can be marked as autoIncrement (++)");if(!e.keyPath)throw new Y.Schema("Index must have a name and cannot be an empty string")}),i[e]=Wt(e,n,t)}})},pn.prototype.stores=function(e){var t=this.db;this._cfg.storesSource=this._cfg.storesSource?a(this._cfg.storesSource,e):e;var e=t._versions,n={},r={};return e.forEach(function(e){a(n,e._cfg.storesSource),r=e._cfg.dbschema={},e._parseStoresSpec(n,r)}),t._dbSchema=r,tn(t,[t._allTables,t,t.Transaction.prototype]),en(t,[t._allTables,t,t.Transaction.prototype,this._cfg.tables],_(r),r),t._storeNames=_(r),this},pn.prototype.upgrade=function(e){return this._cfg.contentUpgrade=re(this._cfg.contentUpgrade||G,e),this},pn);function pn(){}function yn(e,t){var n=e._dbNamesDB;return n||(n=e._dbNamesDB=new er(tt,{addons:[],indexedDB:e,IDBKeyRange:t})).version(1).stores({dbnames:"name"}),n.table("dbnames")}function vn(e){return e&&"function"==typeof e.databases}function mn(e){return Ne(function(){return me.letThrough=!0,e()})}function bn(e){return!("from"in e)}var gn=function(e,t){if(!this){var n=new gn;return e&&"d"in e&&a(n,e),n}a(this,arguments.length?{d:1,from:e,to:1<arguments.length?t:e}:{d:0})};function wn(e,t,n){var r=st(t,n);if(!isNaN(r)){if(0<r)throw RangeError();if(bn(e))return a(e,{from:t,to:n,d:1});var i=e.l,r=e.r;if(st(n,e.from)<0)return i?wn(i,t,n):e.l={from:t,to:n,d:1,l:null,r:null},On(e);if(0<st(t,e.to))return r?wn(r,t,n):e.r={from:t,to:n,d:1,l:null,r:null},On(e);st(t,e.from)<0&&(e.from=t,e.l=null,e.d=r?r.d+1:1),0<st(n,e.to)&&(e.to=n,e.r=null,e.d=e.l?e.l.d+1:1);n=!e.r;i&&!e.l&&_n(e,i),r&&n&&_n(e,r)}}function _n(e,t){bn(t)||function e(t,n){var r=n.from,i=n.to,o=n.l,n=n.r;wn(t,r,i),o&&e(t,o),n&&e(t,n)}(e,t)}function xn(e,t){var n=kn(t),r=n.next();if(r.done)return!1;for(var i=r.value,o=kn(e),a=o.next(i.from),u=a.value;!r.done&&!a.done;){if(st(u.from,i.to)<=0&&0<=st(u.to,i.from))return!0;st(i.from,u.from)<0?i=(r=n.next(u.from)).value:u=(a=o.next(i.from)).value}return!1}function kn(e){var n=bn(e)?null:{s:0,n:e};return{next:function(e){for(var t=0<arguments.length;n;)switch(n.s){case 0:if(n.s=1,t)for(;n.n.l&&st(e,n.n.from)<0;)n={up:n,n:n.n.l,s:1};else for(;n.n.l;)n={up:n,n:n.n.l,s:1};case 1:if(n.s=2,!t||st(e,n.n.to)<=0)return{value:n.n,done:!1};case 2:if(n.n.r){n.s=3,n={up:n,n:n.n.r,s:0};continue}case 3:n=n.up}return{done:!0}}}}function On(e){var t,n,r=((null===(t=e.r)||void 0===t?void 0:t.d)||0)-((null===(n=e.l)||void 0===n?void 0:n.d)||0),i=1<r?"r":r<-1?"l":"";i&&(t="r"==i?"l":"r",n=w({},e),r=e[i],e.from=r.from,e.to=r.to,e[i]=r[i],n[i]=r[t],(e[t]=n).d=Pn(n)),e.d=Pn(e)}function Pn(e){var t=e.r,e=e.l;return(t?e?Math.max(t.d,e.d):t.d:e?e.d:0)+1}function En(t,n){return _(n).forEach(function(e){t[e]?_n(t[e],n[e]):t[e]=function e(t){var n,r,i={};for(n in t)m(t,n)&&(r=t[n],i[n]=!r||"object"!=typeof r||E.has(r.constructor)?r:e(r));return i}(n[e])}),t}function Kn(t,n){return t.all||n.all||Object.keys(t).some(function(e){return n[e]&&xn(n[e],t[e])})}r(gn.prototype,((F={add:function(e){return _n(this,e),this},addKey:function(e){return wn(this,e,e),this},addKeys:function(e){var t=this;return e.forEach(function(e){return wn(t,e,e)}),this},hasKey:function(e){var t=kn(this).next(e).value;return t&&st(t.from,e)<=0&&0<=st(t.to,e)}})[C]=function(){return kn(this)},F));var Sn={},jn={},An=!1;function Cn(e){En(jn,e),An||(An=!0,setTimeout(function(){An=!1,Dn(jn,!(jn={}))},0))}function Dn(e,t){void 0===t&&(t=!1);var n=new Set;if(e.all)for(var r=0,i=Object.values(Sn);r<i.length;r++)Tn(a=i[r],e,n,t);else for(var o in e){var a,u=/^idb\:\/\/(.*)\/(.*)\//.exec(o);u&&(o=u[1],u=u[2],(a=Sn["idb://".concat(o,"/").concat(u)])&&Tn(a,e,n,t))}n.forEach(function(e){return e()})}function Tn(e,t,n,r){for(var i=[],o=0,a=Object.entries(e.queries.query);o<a.length;o++){for(var u=a[o],s=u[0],c=[],l=0,f=u[1];l<f.length;l++){var h=f[l];Kn(t,h.obsSet)?h.subscribers.forEach(function(e){return n.add(e)}):r&&c.push(h)}r&&i.push([s,c])}if(r)for(var d=0,p=i;d<p.length;d++){var y=p[d],s=y[0],c=y[1];e.queries.query[s]=c}}function qn(f){var h=f._state,r=f._deps.indexedDB;if(h.isBeingOpened||f.idbdb)return h.dbReadyPromise.then(function(){return h.dbOpenError?Xe(h.dbOpenError):f});h.isBeingOpened=!0,h.dbOpenError=null,h.openComplete=!1;var t=h.openCanceller,d=Math.round(10*f.verno),p=!1;function e(){if(h.openCanceller!==t)throw new Y.DatabaseClosed("db.open() was cancelled")}function y(){return new _e(function(s,n){if(e(),!r)throw new Y.MissingAPI;var c=f.name,l=h.autoSchema||!d?r.open(c):r.open(c,d);if(!l)throw new Y.MissingAPI;l.onerror=Bt(n),l.onblocked=Te(f._fireOnBlocked),l.onupgradeneeded=Te(function(e){var t;v=l.transaction,h.autoSchema&&!f._options.allowEmptyDB?(l.onerror=Rt,v.abort(),l.result.close(),(t=r.deleteDatabase(c)).onsuccess=t.onerror=Te(function(){n(new Y.NoSuchDatabase("Database ".concat(c," doesnt exist")))})):(v.onerror=Bt(n),e=e.oldVersion>Math.pow(2,62)?0:e.oldVersion,m=e<1,f.idbdb=l.result,p&&on(f,v),rn(f,e/10,v,n))},n),l.onsuccess=Te(function(){v=null;var e,t,n,r,i,o=f.idbdb=l.result,a=b(o.objectStoreNames);if(0<a.length)try{var u=o.transaction(1===(r=a).length?r[0]:r,"readonly");if(h.autoSchema)t=o,n=u,(e=f).verno=t.version/10,n=e._dbSchema=ln(0,t,n),e._storeNames=b(t.objectStoreNames,0),en(e,[e._allTables],_(n),n);else if(fn(f,f._dbSchema,u),((i=an(ln(0,(i=f).idbdb,u),i._dbSchema)).add.length||i.change.some(function(e){return e.add.length||e.change.length}))&&!p)return console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this."),o.close(),d=o.version+1,p=!0,s(y());Zt(f,u)}catch(e){}et.push(f),o.onversionchange=Te(function(e){h.vcFired=!0,f.on("versionchange").fire(e)}),o.onclose=Te(function(e){f.on("close").fire(e)}),m&&(i=f._deps,u=c,o=i.indexedDB,i=i.IDBKeyRange,vn(o)||u===tt||yn(o,i).put({name:u}).catch(G)),s()},n)}).catch(function(e){switch(null==e?void 0:e.name){case"UnknownError":if(0<h.PR1398_maxLoop)return h.PR1398_maxLoop--,console.warn("Dexie: Workaround for Chrome UnknownError on open()"),y();break;case"VersionError":if(0<d)return d=0,y()}return _e.reject(e)})}var n,i=h.dbReadyResolve,v=null,m=!1;return _e.race([t,("undefined"==typeof navigator?_e.resolve():!navigator.userAgentData&&/Safari\//.test(navigator.userAgent)&&!/Chrom(e|ium)\//.test(navigator.userAgent)&&indexedDB.databases?new Promise(function(e){function t(){return indexedDB.databases().finally(e)}n=setInterval(t,100),t()}).finally(function(){return clearInterval(n)}):Promise.resolve()).then(y)]).then(function(){return e(),h.onReadyBeingFired=[],_e.resolve(mn(function(){return f.on.ready.fire(f.vip)})).then(function e(){if(0<h.onReadyBeingFired.length){var t=h.onReadyBeingFired.reduce(re,G);return h.onReadyBeingFired=[],_e.resolve(mn(function(){return t(f.vip)})).then(e)}})}).finally(function(){h.openCanceller===t&&(h.onReadyBeingFired=null,h.isBeingOpened=!1)}).catch(function(e){h.dbOpenError=e;try{v&&v.abort()}catch(e){}return t===h.openCanceller&&f._close(),Xe(e)}).finally(function(){h.openComplete=!0,i()}).then(function(){var n;return m&&(n={},f.tables.forEach(function(t){t.schema.indexes.forEach(function(e){e.name&&(n["idb://".concat(f.name,"/").concat(t.name,"/").concat(e.name)]=new gn(-1/0,[[[]]]))}),n["idb://".concat(f.name,"/").concat(t.name,"/")]=n["idb://".concat(f.name,"/").concat(t.name,"/:dels")]=new gn(-1/0,[[[]]])}),Nt(Ft).fire(n),Dn(n,!0)),f})}function In(t){function e(e){return t.next(e)}var r=n(e),i=n(function(e){return t.throw(e)});function n(n){return function(e){var t=n(e),e=t.value;return t.done?e:e&&"function"==typeof e.then?e.then(r,i):x(e)?Promise.all(e).then(r,i):r(e)}}return n(e)()}function Bn(e,t,n){for(var r=x(e)?e.slice():[e],i=0;i<n;++i)r.push(t);return r}var Rn={stack:"dbcore",name:"VirtualIndexMiddleware",level:1,create:function(f){return w(w({},f),{table:function(e){var a=f.table(e),t=a.schema,u={},s=[];function c(e,t,n){var r=Xt(e),i=u[r]=u[r]||[],o=null==e?0:"string"==typeof e?1:e.length,a=0<t,a=w(w({},n),{name:a?"".concat(r,"(virtual-from:").concat(n.name,")"):n.name,lowLevelIndex:n,isVirtual:a,keyTail:t,keyLength:o,extractKey:$t(e),unique:!a&&n.unique});return i.push(a),a.isPrimaryKey||s.push(a),1<o&&c(2===o?e[0]:e.slice(0,o-1),t+1,n),i.sort(function(e,t){return e.keyTail-t.keyTail}),a}e=c(t.primaryKey.keyPath,0,t.primaryKey);u[":id"]=[e];for(var n=0,r=t.indexes;n<r.length;n++){var i=r[n];c(i.keyPath,0,i)}function l(e){var t,n=e.query.index;return n.isVirtual?w(w({},e),{query:{index:n.lowLevelIndex,range:(t=e.query.range,n=n.keyTail,{type:1===t.type?2:t.type,lower:Bn(t.lower,t.lowerOpen?f.MAX_KEY:f.MIN_KEY,n),lowerOpen:!0,upper:Bn(t.upper,t.upperOpen?f.MIN_KEY:f.MAX_KEY,n),upperOpen:!0})}}):e}return w(w({},a),{schema:w(w({},t),{primaryKey:e,indexes:s,getIndexByKeyPath:function(e){return(e=u[Xt(e)])&&e[0]}}),count:function(e){return a.count(l(e))},query:function(e){return a.query(l(e))},openCursor:function(t){var e=t.query.index,r=e.keyTail,n=e.isVirtual,i=e.keyLength;return n?a.openCursor(l(t)).then(function(e){return e&&o(e)}):a.openCursor(t);function o(n){return Object.create(n,{continue:{value:function(e){null!=e?n.continue(Bn(e,t.reverse?f.MAX_KEY:f.MIN_KEY,r)):t.unique?n.continue(n.key.slice(0,i).concat(t.reverse?f.MIN_KEY:f.MAX_KEY,r)):n.continue()}},continuePrimaryKey:{value:function(e,t){n.continuePrimaryKey(Bn(e,f.MAX_KEY,r),t)}},primaryKey:{get:function(){return n.primaryKey}},key:{get:function(){var e=n.key;return 1===i?e[0]:e.slice(0,i)}},value:{get:function(){return n.value}}})}}})}})}};function Fn(i,o,a,u){return a=a||{},u=u||"",_(i).forEach(function(e){var t,n,r;m(o,e)?(t=i[e],n=o[e],"object"==typeof t&&"object"==typeof n&&t&&n?(r=A(t))!==A(n)?a[u+e]=o[e]:"Object"===r?Fn(t,n,a,u+e+"."):t!==n&&(a[u+e]=o[e]):t!==n&&(a[u+e]=o[e])):a[u+e]=void 0}),_(o).forEach(function(e){m(i,e)||(a[u+e]=o[e])}),a}function Mn(e,t){return"delete"===t.type?t.keys:t.keys||t.values.map(e.extractKey)}var Nn={stack:"dbcore",name:"HooksMiddleware",level:2,create:function(e){return w(w({},e),{table:function(r){var y=e.table(r),v=y.schema.primaryKey;return w(w({},y),{mutate:function(e){var t=me.trans,n=t.table(r).hook,h=n.deleting,d=n.creating,p=n.updating;switch(e.type){case"add":if(d.fire===G)break;return t._promise("readwrite",function(){return a(e)},!0);case"put":if(d.fire===G&&p.fire===G)break;return t._promise("readwrite",function(){return a(e)},!0);case"delete":if(h.fire===G)break;return t._promise("readwrite",function(){return a(e)},!0);case"deleteRange":if(h.fire===G)break;return t._promise("readwrite",function(){return function n(r,i,o){return y.query({trans:r,values:!1,query:{index:v,range:i},limit:o}).then(function(e){var t=e.result;return a({type:"delete",keys:t,trans:r}).then(function(e){return 0<e.numFailures?Promise.reject(e.failures[0]):t.length<o?{failures:[],numFailures:0,lastResult:void 0}:n(r,w(w({},i),{lower:t[t.length-1],lowerOpen:!0}),o)})})}(e.trans,e.range,1e4)},!0)}return y.mutate(e);function a(c){var e,t,n,l=me.trans,f=c.keys||Mn(v,c);if(!f)throw new Error("Keys missing");return"delete"!==(c="add"===c.type||"put"===c.type?w(w({},c),{keys:f}):w({},c)).type&&(c.values=i([],c.values,!0)),c.keys&&(c.keys=i([],c.keys,!0)),e=y,n=f,("add"===(t=c).type?Promise.resolve([]):e.getMany({trans:t.trans,keys:n,cache:"immutable"})).then(function(u){var s=f.map(function(e,t){var n,r,i,o=u[t],a={onerror:null,onsuccess:null};return"delete"===c.type?h.fire.call(a,e,o,l):"add"===c.type||void 0===o?(n=d.fire.call(a,e,c.values[t],l),null==e&&null!=n&&(c.keys[t]=e=n,v.outbound||P(c.values[t],v.keyPath,e))):(n=Fn(o,c.values[t]),(r=p.fire.call(a,n,e,o,l))&&(i=c.values[t],Object.keys(r).forEach(function(e){m(i,e)?i[e]=r[e]:P(i,e,r[e])}))),a});return y.mutate(c).then(function(e){for(var t=e.failures,n=e.results,r=e.numFailures,e=e.lastResult,i=0;i<f.length;++i){var o=(n||f)[i],a=s[i];null==o?a.onerror&&a.onerror(t[i]):a.onsuccess&&a.onsuccess("put"===c.type&&u[i]?c.values[i]:o)}return{failures:t,results:n,numFailures:r,lastResult:e}}).catch(function(t){return s.forEach(function(e){return e.onerror&&e.onerror(t)}),Promise.reject(t)})})}}})}})}};function Ln(e,t,n){try{if(!t)return null;if(t.keys.length<e.length)return null;for(var r=[],i=0,o=0;i<t.keys.length&&o<e.length;++i)0===st(t.keys[i],e[o])&&(r.push(n?S(t.values[i]):t.values[i]),++o);return r.length===e.length?r:null}catch(e){return null}}var Un={stack:"dbcore",level:-1,create:function(t){return{table:function(e){var n=t.table(e);return w(w({},n),{getMany:function(t){if(!t.cache)return n.getMany(t);var e=Ln(t.keys,t.trans._cache,"clone"===t.cache);return e?_e.resolve(e):n.getMany(t).then(function(e){return t.trans._cache={keys:t.keys,values:"clone"===t.cache?S(e):e},e})},mutate:function(e){return"add"!==e.type&&(e.trans._cache=null),n.mutate(e)}})}}}};function Vn(e,t){return"readonly"===e.trans.mode&&!!e.subscr&&!e.trans.explicit&&"disabled"!==e.trans.db._options.cache&&!t.schema.primaryKey.outbound}function zn(e,t){switch(e){case"query":return t.values&&!t.unique;case"get":case"getMany":case"count":case"openCursor":return!1}}var Wn={stack:"dbcore",level:0,name:"Observability",create:function(r){var b=r.schema.name,g=new gn(r.MIN_KEY,r.MAX_KEY);return w(w({},r),{transaction:function(e,t,n){if(me.subscr&&"readonly"!==t)throw new Y.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(me.querier));return r.transaction(e,t,n)},table:function(d){var p=r.table(d),y=p.schema,v=y.primaryKey,e=y.indexes,c=v.extractKey,l=v.outbound,m=v.autoIncrement&&e.filter(function(e){return e.compound&&e.keyPath.includes(v.keyPath)}),t=w(w({},p),{mutate:function(i){function o(e){return e="idb://".concat(b,"/").concat(d,"/").concat(e),n[e]||(n[e]=new gn)}var e,a,u,t=i.trans,n=i.mutatedParts||(i.mutatedParts={}),r=o(""),s=o(":dels"),c=i.type,l="deleteRange"===i.type?[i.range]:"delete"===i.type?[i.keys]:i.values.length<50?[Mn(v,i).filter(function(e){return e}),i.values]:[],f=l[0],h=l[1],l=i.trans._cache;return x(f)?(r.addKeys(f),(l="delete"===c||f.length===h.length?Ln(f,l):null)||s.addKeys(f),(l||h)&&(e=o,a=l,u=h,y.indexes.forEach(function(t){var n=e(t.name||"");function r(e){return null!=e?t.extractKey(e):null}function i(e){return t.multiEntry&&x(e)?e.forEach(function(e){return n.addKey(e)}):n.addKey(e)}(a||u).forEach(function(e,t){var n=a&&r(a[t]),t=u&&r(u[t]);0!==st(n,t)&&(null!=n&&i(n),null!=t&&i(t))})}))):f?(h={from:f.lower,to:f.upper},s.add(h),r.add(h)):(r.add(g),s.add(g),y.indexes.forEach(function(e){return o(e.name).add(g)})),p.mutate(i).then(function(e){return!f||"add"!==i.type&&"put"!==i.type||(r.addKeys(e.results),m&&m.forEach(function(t){var n=i.values.map(function(e){return t.extractKey(e)}),r=t.keyPath.findIndex(function(e){return e===v.keyPath});e.results.forEach(function(e){return n[r]=e}),o(t.name).addKeys(n)})),t.mutatedParts=En(t.mutatedParts||{},n),e})}}),e=function(e){var t=e.query,e=t.index,t=t.range;return[e,new gn(null!==(e=t.lower)&&void 0!==e?e:r.MIN_KEY,null!==(t=t.upper)&&void 0!==t?t:r.MAX_KEY)]},f={get:function(e){return[v,new gn(e.key)]},getMany:function(e){return[v,(new gn).addKeys(e.keys)]},count:e,query:e,openCursor:e};return _(f).forEach(function(s){t[s]=function(i){var e=me.subscr,t=!!e,n=Vn(me,p)&&zn(s,i)?i.obsSet={}:e;if(t){var r=function(e){e="idb://".concat(b,"/").concat(d,"/").concat(e);return n[e]||(n[e]=new gn)},o=r(""),a=r(":dels"),e=f[s](i),t=e[0],e=e[1];if(("query"===s&&t.isPrimaryKey&&!i.values?a:r(t.name||"")).add(e),!t.isPrimaryKey){if("count"!==s){var u="query"===s&&l&&i.values&&p.query(w(w({},i),{values:!1}));return p[s].apply(this,arguments).then(function(t){if("query"===s){if(l&&i.values)return u.then(function(e){e=e.result;return o.addKeys(e),t});var e=i.values?t.result.map(c):t.result;(i.values?o:a).addKeys(e)}else if("openCursor"===s){var n=t,r=i.values;return n&&Object.create(n,{key:{get:function(){return a.addKey(n.primaryKey),n.key}},primaryKey:{get:function(){var e=n.primaryKey;return a.addKey(e),e}},value:{get:function(){return r&&o.addKey(n.primaryKey),n.value}}})}return t})}a.add(g)}}return p[s].apply(this,arguments)}}),t}})}};function Yn(e,t,n){if(0===n.numFailures)return t;if("deleteRange"===t.type)return null;var r=t.keys?t.keys.length:"values"in t&&t.values?t.values.length:1;if(n.numFailures===r)return null;t=w({},t);return x(t.keys)&&(t.keys=t.keys.filter(function(e,t){return!(t in n.failures)})),"values"in t&&x(t.values)&&(t.values=t.values.filter(function(e,t){return!(t in n.failures)})),t}function $n(e,t){return n=e,(void 0===(r=t).lower||(r.lowerOpen?0<st(n,r.lower):0<=st(n,r.lower)))&&(e=e,void 0===(t=t).upper||(t.upperOpen?st(e,t.upper)<0:st(e,t.upper)<=0));var n,r}function Qn(e,h,t,n,r,i){if(!t||0===t.length)return e;var o=h.query.index,d=o.multiEntry,p=h.query.range,y=n.schema.primaryKey.extractKey,v=o.extractKey,a=(o.lowLevelIndex||o).extractKey,t=t.reduce(function(e,t){var n=e,r=[];if("add"===t.type||"put"===t.type)for(var i=new gn,o=t.values.length-1;0<=o;--o){var a,u=t.values[o],s=y(u);i.hasKey(s)||(a=v(u),(d&&x(a)?a.some(function(e){return $n(e,p)}):$n(a,p))&&(i.addKey(s),r.push(u)))}switch(t.type){case"add":n=e.concat(h.values?r:r.map(function(e){return y(e)}));break;case"put":var c=(new gn).addKeys(t.values.map(function(e){return y(e)})),n=e.filter(function(e){return!c.hasKey(h.values?y(e):e)}).concat(h.values?r:r.map(function(e){return y(e)}));break;case"delete":var l=(new gn).addKeys(t.keys);n=e.filter(function(e){return!l.hasKey(h.values?y(e):e)});break;case"deleteRange":var f=t.range;n=e.filter(function(e){return!$n(y(e),f)})}return n},e);return t===e?e:(t.sort(function(e,t){return st(a(e),a(t))||st(y(e),y(t))}),h.limit&&h.limit<1/0&&(t.length>h.limit?t.length=h.limit:e.length===h.limit&&t.length<h.limit&&(r.dirty=!0)),i?Object.freeze(t):t)}function Gn(e,t){return 0===st(e.lower,t.lower)&&0===st(e.upper,t.upper)&&!!e.lowerOpen==!!t.lowerOpen&&!!e.upperOpen==!!t.upperOpen}function Xn(e,t){return function(e,t,n,r){if(void 0===e)return void 0!==t?-1:0;if(void 0===t)return 1;if(0===(t=st(e,t))){if(n&&r)return 0;if(n)return 1;if(r)return-1}return t}(e.lower,t.lower,e.lowerOpen,t.lowerOpen)<=0&&0<=function(e,t,n,r){if(void 0===e)return void 0!==t?1:0;if(void 0===t)return-1;if(0===(t=st(e,t))){if(n&&r)return 0;if(n)return-1;if(r)return 1}return t}(e.upper,t.upper,e.upperOpen,t.upperOpen)}function Hn(n,r,i,e){n.subscribers.add(i),e.addEventListener("abort",function(){var e,t;n.subscribers.delete(i),0===n.subscribers.size&&(e=n,t=r,setTimeout(function(){0===e.subscribers.size&&T(t,e)},3e3))})}var Jn={stack:"dbcore",level:0,name:"Cache",create:function(k){var O=k.schema.name;return w(w({},k),{transaction:function(g,w,e){var _,t,x=k.transaction(g,w,e);return"readwrite"===w&&(t=(_=new AbortController).signal,e=function(b){return function(){if(_.abort(),"readwrite"===w){for(var t=new Set,e=0,n=g;e<n.length;e++){var r=n[e],i=Sn["idb://".concat(O,"/").concat(r)];if(i){var o=k.table(r),a=i.optimisticOps.filter(function(e){return e.trans===x});if(x._explicit&&b&&x.mutatedParts)for(var u=0,s=Object.values(i.queries.query);u<s.length;u++)for(var c=0,l=(d=s[u]).slice();c<l.length;c++)Kn((p=l[c]).obsSet,x.mutatedParts)&&(T(d,p),p.subscribers.forEach(function(e){return t.add(e)}));else if(0<a.length){i.optimisticOps=i.optimisticOps.filter(function(e){return e.trans!==x});for(var f=0,h=Object.values(i.queries.query);f<h.length;f++)for(var d,p,y,v=0,m=(d=h[f]).slice();v<m.length;v++)null!=(p=m[v]).res&&x.mutatedParts&&(b&&!p.dirty?(y=Object.isFrozen(p.res),y=Qn(p.res,p.req,a,o,p,y),p.dirty?(T(d,p),p.subscribers.forEach(function(e){return t.add(e)})):y!==p.res&&(p.res=y,p.promise=_e.resolve({result:y}))):(p.dirty&&T(d,p),p.subscribers.forEach(function(e){return t.add(e)})))}}}t.forEach(function(e){return e()})}}},x.addEventListener("abort",e(!1),{signal:t}),x.addEventListener("error",e(!1),{signal:t}),x.addEventListener("complete",e(!0),{signal:t})),x},table:function(c){var l=k.table(c),i=l.schema.primaryKey;return w(w({},l),{mutate:function(t){var e=me.trans;if(i.outbound||"disabled"===e.db._options.cache||e.explicit)return l.mutate(t);var n=Sn["idb://".concat(O,"/").concat(c)];if(!n)return l.mutate(t);e=l.mutate(t);return"add"!==t.type&&"put"!==t.type||!(50<=t.values.length||Mn(i,t).some(function(e){return null==e}))?(n.optimisticOps.push(t),t.mutatedParts&&Cn(t.mutatedParts),e.then(function(e){0<e.numFailures&&(T(n.optimisticOps,t),(e=Yn(0,t,e))&&n.optimisticOps.push(e),t.mutatedParts&&Cn(t.mutatedParts))}),e.catch(function(){T(n.optimisticOps,t),t.mutatedParts&&Cn(t.mutatedParts)})):e.then(function(r){var e=Yn(0,w(w({},t),{values:t.values.map(function(e,t){var n,e=null!==(n=i.keyPath)&&void 0!==n&&n.includes(".")?S(e):w({},e);return P(e,i.keyPath,r.results[t]),e})}),r);n.optimisticOps.push(e),queueMicrotask(function(){return t.mutatedParts&&Cn(t.mutatedParts)})}),e},query:function(t){if(!Vn(me,l)||!zn("query",t))return l.query(t);var i="immutable"===(null===(o=me.trans)||void 0===o?void 0:o.db._options.cache),e=me,n=e.requery,r=e.signal,o=function(e,t,n,r){var i=Sn["idb://".concat(e,"/").concat(t)];if(!i)return[];if(!(t=i.queries[n]))return[null,!1,i,null];var o=t[(r.query?r.query.index.name:null)||""];if(!o)return[null,!1,i,null];switch(n){case"query":var a=o.find(function(e){return e.req.limit===r.limit&&e.req.values===r.values&&Gn(e.req.query.range,r.query.range)});return a?[a,!0,i,o]:[o.find(function(e){return("limit"in e.req?e.req.limit:1/0)>=r.limit&&(!r.values||e.req.values)&&Xn(e.req.query.range,r.query.range)}),!1,i,o];case"count":a=o.find(function(e){return Gn(e.req.query.range,r.query.range)});return[a,!!a,i,o]}}(O,c,"query",t),a=o[0],e=o[1],u=o[2],s=o[3];return a&&e?a.obsSet=t.obsSet:(e=l.query(t).then(function(e){var t=e.result;if(a&&(a.res=t),i){for(var n=0,r=t.length;n<r;++n)Object.freeze(t[n]);Object.freeze(t)}else e.result=S(t);return e}).catch(function(e){return s&&a&&T(s,a),Promise.reject(e)}),a={obsSet:t.obsSet,promise:e,subscribers:new Set,type:"query",req:t,dirty:!1},s?s.push(a):(s=[a],(u=u||(Sn["idb://".concat(O,"/").concat(c)]={queries:{query:{},count:{}},objs:new Map,optimisticOps:[],unsignaledParts:{}})).queries.query[t.query.index.name||""]=s)),Hn(a,s,n,r),a.promise.then(function(e){return{result:Qn(e.result,t,null==u?void 0:u.optimisticOps,l,a,i)}})}})}})}};function Zn(e,r){return new Proxy(e,{get:function(e,t,n){return"db"===t?r:Reflect.get(e,t,n)}})}var er=(tr.prototype.version=function(t){if(isNaN(t)||t<.1)throw new Y.Type("Given version is not a positive number");if(t=Math.round(10*t)/10,this.idbdb||this._state.isBeingOpened)throw new Y.Schema("Cannot add version when database is open");this.verno=Math.max(this.verno,t);var e=this._versions,n=e.filter(function(e){return e._cfg.version===t})[0];return n||(n=new this.Version(t),e.push(n),e.sort(nn),n.stores({}),this._state.autoSchema=!1,n)},tr.prototype._whenReady=function(e){var n=this;return this.idbdb&&(this._state.openComplete||me.letThrough||this._vip)?e():new _e(function(e,t){if(n._state.openComplete)return t(new Y.DatabaseClosed(n._state.dbOpenError));if(!n._state.isBeingOpened){if(!n._state.autoOpen)return void t(new Y.DatabaseClosed);n.open().catch(G)}n._state.dbReadyPromise.then(e,t)}).then(e)},tr.prototype.use=function(e){var t=e.stack,n=e.create,r=e.level,i=e.name;i&&this.unuse({stack:t,name:i});e=this._middlewares[t]||(this._middlewares[t]=[]);return e.push({stack:t,create:n,level:null==r?10:r,name:i}),e.sort(function(e,t){return e.level-t.level}),this},tr.prototype.unuse=function(e){var t=e.stack,n=e.name,r=e.create;return t&&this._middlewares[t]&&(this._middlewares[t]=this._middlewares[t].filter(function(e){return r?e.create!==r:!!n&&e.name!==n})),this},tr.prototype.open=function(){var e=this;return $e(ve,function(){return qn(e)})},tr.prototype._close=function(){var n=this._state,e=et.indexOf(this);if(0<=e&&et.splice(e,1),this.idbdb){try{this.idbdb.close()}catch(e){}this.idbdb=null}n.isBeingOpened||(n.dbReadyPromise=new _e(function(e){n.dbReadyResolve=e}),n.openCanceller=new _e(function(e,t){n.cancelOpen=t}))},tr.prototype.close=function(e){var t=(void 0===e?{disableAutoOpen:!0}:e).disableAutoOpen,e=this._state;t?(e.isBeingOpened&&e.cancelOpen(new Y.DatabaseClosed),this._close(),e.autoOpen=!1,e.dbOpenError=new Y.DatabaseClosed):(this._close(),e.autoOpen=this._options.autoOpen||e.isBeingOpened,e.openComplete=!1,e.dbOpenError=null)},tr.prototype.delete=function(n){var i=this;void 0===n&&(n={disableAutoOpen:!0});var o=0<arguments.length&&"object"!=typeof arguments[0],a=this._state;return new _e(function(r,t){function e(){i.close(n);var e=i._deps.indexedDB.deleteDatabase(i.name);e.onsuccess=Te(function(){var e,t,n;e=i._deps,t=i.name,n=e.indexedDB,e=e.IDBKeyRange,vn(n)||t===tt||yn(n,e).delete(t).catch(G),r()}),e.onerror=Bt(t),e.onblocked=i._fireOnBlocked}if(o)throw new Y.InvalidArgument("Invalid closeOptions argument to db.delete()");a.isBeingOpened?a.dbReadyPromise.then(e):e()})},tr.prototype.backendDB=function(){return this.idbdb},tr.prototype.isOpen=function(){return null!==this.idbdb},tr.prototype.hasBeenClosed=function(){var e=this._state.dbOpenError;return e&&"DatabaseClosed"===e.name},tr.prototype.hasFailed=function(){return null!==this._state.dbOpenError},tr.prototype.dynamicallyOpened=function(){return this._state.autoSchema},Object.defineProperty(tr.prototype,"tables",{get:function(){var t=this;return _(this._allTables).map(function(e){return t._allTables[e]})},enumerable:!1,configurable:!0}),tr.prototype.transaction=function(){var e=function(e,t,n){var r=arguments.length;if(r<2)throw new Y.InvalidArgument("Too few arguments");for(var i=new Array(r-1);--r;)i[r-1]=arguments[r];return n=i.pop(),[e,O(i),n]}.apply(this,arguments);return this._transaction.apply(this,e)},tr.prototype._transaction=function(e,t,n){var r=this,i=me.trans;i&&i.db===this&&-1===e.indexOf("!")||(i=null);var o,a,u=-1!==e.indexOf("?");e=e.replace("!","").replace("?","");try{if(a=t.map(function(e){e=e instanceof r.Table?e.name:e;if("string"!=typeof e)throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");return e}),"r"==e||e===nt)o=nt;else{if("rw"!=e&&e!=rt)throw new Y.InvalidArgument("Invalid transaction mode: "+e);o=rt}if(i){if(i.mode===nt&&o===rt){if(!u)throw new Y.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");i=null}i&&a.forEach(function(e){if(i&&-1===i.storeNames.indexOf(e)){if(!u)throw new Y.SubTransaction("Table "+e+" not included in parent transaction.");i=null}}),u&&i&&!i.active&&(i=null)}}catch(n){return i?i._promise(null,function(e,t){t(n)}):Xe(n)}var s=function i(o,a,u,s,c){return _e.resolve().then(function(){var e=me.transless||me,t=o._createTransaction(a,u,o._dbSchema,s);if(t.explicit=!0,e={trans:t,transless:e},s)t.idbtrans=s.idbtrans;else try{t.create(),t.idbtrans._explicit=!0,o._state.PR1398_maxLoop=3}catch(e){return e.name===z.InvalidState&&o.isOpen()&&0<--o._state.PR1398_maxLoop?(console.warn("Dexie: Need to reopen db"),o.close({disableAutoOpen:!1}),o.open().then(function(){return i(o,a,u,null,c)})):Xe(e)}var n,r=B(c);return r&&Le(),e=_e.follow(function(){var e;(n=c.call(t,t))&&(r?(e=Ue.bind(null,null),n.then(e,e)):"function"==typeof n.next&&"function"==typeof n.throw&&(n=In(n)))},e),(n&&"function"==typeof n.then?_e.resolve(n).then(function(e){return t.active?e:Xe(new Y.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"))}):e.then(function(){return n})).then(function(e){return s&&t._resolve(),t._completion.then(function(){return e})}).catch(function(e){return t._reject(e),Xe(e)})})}.bind(null,this,o,a,i,n);return i?i._promise(o,s,"lock"):me.trans?$e(me.transless,function(){return r._whenReady(s)}):this._whenReady(s)},tr.prototype.table=function(e){if(!m(this._allTables,e))throw new Y.InvalidTable("Table ".concat(e," does not exist"));return this._allTables[e]},tr);function tr(e,t){var o=this;this._middlewares={},this.verno=0;var n=tr.dependencies;this._options=t=w({addons:tr.addons,autoOpen:!0,indexedDB:n.indexedDB,IDBKeyRange:n.IDBKeyRange,cache:"cloned"},t),this._deps={indexedDB:t.indexedDB,IDBKeyRange:t.IDBKeyRange};n=t.addons;this._dbSchema={},this._versions=[],this._storeNames=[],this._allTables={},this.idbdb=null,this._novip=this;var a,r,u,i,s,c={dbOpenError:null,isBeingOpened:!1,onReadyBeingFired:null,openComplete:!1,dbReadyResolve:G,dbReadyPromise:null,cancelOpen:G,openCanceller:null,autoSchema:!0,PR1398_maxLoop:3,autoOpen:t.autoOpen};c.dbReadyPromise=new _e(function(e){c.dbReadyResolve=e}),c.openCanceller=new _e(function(e,t){c.cancelOpen=t}),this._state=c,this.name=e,this.on=dt(this,"populate","blocked","versionchange","close",{ready:[re,G]}),this.on.ready.subscribe=p(this.on.ready.subscribe,function(i){return function(n,r){tr.vip(function(){var t,e=o._state;e.openComplete?(e.dbOpenError||_e.resolve().then(n),r&&i(n)):e.onReadyBeingFired?(e.onReadyBeingFired.push(n),r&&i(n)):(i(n),t=o,r||i(function e(){t.on.ready.unsubscribe(n),t.on.ready.unsubscribe(e)}))})}}),this.Collection=(a=this,pt(Ot.prototype,function(e,t){this.db=a;var n=ot,r=null;if(t)try{n=t()}catch(e){r=e}var i=e._ctx,t=i.table,e=t.hook.reading.fire;this._ctx={table:t,index:i.index,isPrimKey:!i.index||t.schema.primKey.keyPath&&i.index===t.schema.primKey.name,range:n,keysOnly:!1,dir:"next",unique:"",algorithm:null,filter:null,replayFilter:null,justLimit:!0,isMatch:null,offset:0,limit:1/0,error:r,or:i.or,valueMapper:e!==X?e:null}})),this.Table=(r=this,pt(ft.prototype,function(e,t,n){this.db=r,this._tx=n,this.name=e,this.schema=t,this.hook=r._allTables[e]?r._allTables[e].hook:dt(null,{creating:[Z,G],reading:[H,X],updating:[te,G],deleting:[ee,G]})})),this.Transaction=(u=this,pt(Lt.prototype,function(e,t,n,r,i){var o=this;this.db=u,this.mode=e,this.storeNames=t,this.schema=n,this.chromeTransactionDurability=r,this.idbtrans=null,this.on=dt(this,"complete","error","abort"),this.parent=i||null,this.active=!0,this._reculock=0,this._blockedFuncs=[],this._resolve=null,this._reject=null,this._waitingFor=null,this._waitingQueue=null,this._spinCount=0,this._completion=new _e(function(e,t){o._resolve=e,o._reject=t}),this._completion.then(function(){o.active=!1,o.on.complete.fire()},function(e){var t=o.active;return o.active=!1,o.on.error.fire(e),o.parent?o.parent._reject(e):t&&o.idbtrans&&o.idbtrans.abort(),Xe(e)})})),this.Version=(i=this,pt(dn.prototype,function(e){this.db=i,this._cfg={version:e,storesSource:null,dbschema:{},tables:{},contentUpgrade:null}})),this.WhereClause=(s=this,pt(qt.prototype,function(e,t,n){if(this.db=s,this._ctx={table:e,index:":id"===t?null:t,or:n},this._cmp=this._ascending=st,this._descending=function(e,t){return st(t,e)},this._max=function(e,t){return 0<st(e,t)?e:t},this._min=function(e,t){return st(e,t)<0?e:t},this._IDBKeyRange=s._deps.IDBKeyRange,!this._IDBKeyRange)throw new Y.MissingAPI})),this.on("versionchange",function(e){0<e.newVersion?console.warn("Another connection wants to upgrade database '".concat(o.name,"'. Closing db now to resume the upgrade.")):console.warn("Another connection wants to delete database '".concat(o.name,"'. Closing db now to resume the delete request.")),o.close({disableAutoOpen:!1})}),this.on("blocked",function(e){!e.newVersion||e.newVersion<e.oldVersion?console.warn("Dexie.delete('".concat(o.name,"') was blocked")):console.warn("Upgrade '".concat(o.name,"' blocked by other connection holding version ").concat(e.oldVersion/10))}),this._maxKey=Yt(t.IDBKeyRange),this._createTransaction=function(e,t,n,r){return new o.Transaction(e,t,n,o._options.chromeTransactionDurability,r)},this._fireOnBlocked=function(t){o.on("blocked").fire(t),et.filter(function(e){return e.name===o.name&&e!==o&&!e._state.vcFired}).map(function(e){return e.on("versionchange").fire(t)})},this.use(Un),this.use(Jn),this.use(Wn),this.use(Rn),this.use(Nn);var l=new Proxy(this,{get:function(e,t,n){if("_vip"===t)return!0;if("table"===t)return function(e){return Zn(o.table(e),l)};var r=Reflect.get(e,t,n);return r instanceof ft?Zn(r,l):"tables"===t?r.map(function(e){return Zn(e,l)}):"_createTransaction"===t?function(){return Zn(r.apply(this,arguments),l)}:r}});this.vip=l,n.forEach(function(e){return e(o)})}var nr,F="undefined"!=typeof Symbol&&"observable"in Symbol?Symbol.observable:"@@observable",rr=(ir.prototype.subscribe=function(e,t,n){return this._subscribe(e&&"function"!=typeof e?e:{next:e,error:t,complete:n})},ir.prototype[F]=function(){return this},ir);function ir(e){this._subscribe=e}try{nr={indexedDB:f.indexedDB||f.mozIndexedDB||f.webkitIndexedDB||f.msIndexedDB,IDBKeyRange:f.IDBKeyRange||f.webkitIDBKeyRange}}catch(e){nr={indexedDB:null,IDBKeyRange:null}}function or(h){var d,p=!1,e=new rr(function(r){var i=B(h);var o,a=!1,u={},s={},e={get closed(){return a},unsubscribe:function(){a||(a=!0,o&&o.abort(),c&&Nt.storagemutated.unsubscribe(f))}};r.start&&r.start(e);var c=!1,l=function(){return Ge(t)};var f=function(e){En(u,e),Kn(s,u)&&l()},t=function(){var t,n,e;!a&&nr.indexedDB&&(u={},t={},o&&o.abort(),o=new AbortController,e=function(e){var t=je();try{i&&Le();var n=Ne(h,e);return n=i?n.finally(Ue):n}finally{t&&Ae()}}(n={subscr:t,signal:o.signal,requery:l,querier:h,trans:null}),Promise.resolve(e).then(function(e){p=!0,d=e,a||n.signal.aborted||(u={},function(e){for(var t in e)if(m(e,t))return;return 1}(s=t)||c||(Nt(Ft,f),c=!0),Ge(function(){return!a&&r.next&&r.next(e)}))},function(e){p=!1,["DatabaseClosedError","AbortError"].includes(null==e?void 0:e.name)||a||Ge(function(){a||r.error&&r.error(e)})}))};return setTimeout(l,0),e});return e.hasValue=function(){return p},e.getValue=function(){return d},e}var ar=er;function ur(e){var t=cr;try{cr=!0,Nt.storagemutated.fire(e),Dn(e,!0)}finally{cr=t}}r(ar,w(w({},Q),{delete:function(e){return new ar(e,{addons:[]}).delete()},exists:function(e){return new ar(e,{addons:[]}).open().then(function(e){return e.close(),!0}).catch("NoSuchDatabaseError",function(){return!1})},getDatabaseNames:function(e){try{return t=ar.dependencies,n=t.indexedDB,t=t.IDBKeyRange,(vn(n)?Promise.resolve(n.databases()).then(function(e){return e.map(function(e){return e.name}).filter(function(e){return e!==tt})}):yn(n,t).toCollection().primaryKeys()).then(e)}catch(e){return Xe(new Y.MissingAPI)}var t,n},defineClass:function(){return function(e){a(this,e)}},ignoreTransaction:function(e){return me.trans?$e(me.transless,e):e()},vip:mn,async:function(t){return function(){try{var e=In(t.apply(this,arguments));return e&&"function"==typeof e.then?e:_e.resolve(e)}catch(e){return Xe(e)}}},spawn:function(e,t,n){try{var r=In(e.apply(n,t||[]));return r&&"function"==typeof r.then?r:_e.resolve(r)}catch(e){return Xe(e)}},currentTransaction:{get:function(){return me.trans||null}},waitFor:function(e,t){t=_e.resolve("function"==typeof e?ar.ignoreTransaction(e):e).timeout(t||6e4);return me.trans?me.trans.waitFor(t):t},Promise:_e,debug:{get:function(){return ie},set:function(e){oe(e)}},derive:o,extend:a,props:r,override:p,Events:dt,on:Nt,liveQuery:or,extendObservabilitySet:En,getByKeyPath:k,setByKeyPath:P,delByKeyPath:function(t,e){"string"==typeof e?P(t,e,void 0):"length"in e&&[].map.call(e,function(e){P(t,e,void 0)})},shallowClone:g,deepClone:S,getObjectDiff:Fn,cmp:st,asap:v,minKey:-1/0,addons:[],connections:et,errnames:z,dependencies:nr,cache:Sn,semVer:"4.0.8",version:"4.0.8".split(".").map(function(e){return parseInt(e)}).reduce(function(e,t,n){return e+t/Math.pow(10,2*n)})})),ar.maxKey=Yt(ar.dependencies.IDBKeyRange),"undefined"!=typeof dispatchEvent&&"undefined"!=typeof addEventListener&&(Nt(Ft,function(e){cr||(e=new CustomEvent(Mt,{detail:e}),cr=!0,dispatchEvent(e),cr=!1)}),addEventListener(Mt,function(e){e=e.detail;cr||ur(e)}));var sr,cr=!1,lr=function(){};return"undefined"!=typeof BroadcastChannel&&((lr=function(){(sr=new BroadcastChannel(Mt)).onmessage=function(e){return e.data&&ur(e.data)}})(),"function"==typeof sr.unref&&sr.unref(),Nt(Ft,function(e){cr||sr.postMessage(e)})),"undefined"!=typeof addEventListener&&(addEventListener("pagehide",function(e){if(!er.disableBfCache&&e.persisted){ie&&console.debug("Dexie: handling persisted pagehide"),null!=sr&&sr.close();for(var t=0,n=et;t<n.length;t++)n[t].close({disableAutoOpen:!1})}}),addEventListener("pageshow",function(e){!er.disableBfCache&&e.persisted&&(ie&&console.debug("Dexie: handling persisted pageshow"),lr(),ur({all:new gn(-1/0,[[]])}))})),_e.rejectionMapper=function(e,t){return!e||e instanceof N||e instanceof TypeError||e instanceof SyntaxError||!e.name||!$[e.name]?e:(t=new $[e.name](t||e.message,e),"stack"in e&&l(t,"stack",{get:function(){return this.inner.stack}}),t)},oe(ie),w(er,Object.freeze({__proto__:null,Dexie:er,liveQuery:or,Entity:ut,cmp:st,PropModSymbol:e,PropModification:xt,replacePrefix:function(e,t){return new xt({replacePrefix:[e,t]})},add:function(e){return new xt({add:e})},remove:function(e){return new xt({remove:e})},default:er,RangeSet:gn,mergeRanges:_n,rangesOverlap:xn}),{default:er}),er});
//# sourceMappingURL=dexie.min.js.map









/* ========================================================================== 
 *                           dexie-export-import.js
 * ==========================================================================
 *
 * Dexie addon for exporting and importing databases to / from Blobs.
 *
 * By David Fahlander, david.fahlander@gmail.com,
 *
 * ==========================================================================
 *
 * Version 4.1.2, Mon Apr 29 2024
 *
 * https://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 * 
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('dexie')) :
    typeof define === 'function' && define.amd ? define(['exports', 'dexie'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.DexieExportImport = {}, global.Dexie));
})(this, (function (exports, Dexie) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Dexie__default = /*#__PURE__*/_interopDefaultLegacy(Dexie);

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function getSchemaString(table) {
        var primKeyAndIndexes = [table.schema.primKey].concat(table.schema.indexes);
        return primKeyAndIndexes.map(function (index) { return index.src; }).join(',');
    }
    function extractDbSchema(exportedDb) {
        var schema = {};
        for (var _i = 0, _a = exportedDb.tables; _i < _a.length; _i++) {
            var table = _a[_i];
            schema[table.name] = table.schema;
        }
        return schema;
    }
    function readBlobAsync(blob, type) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onabort = function (ev) { return reject(new Error("file read aborted")); };
            reader.onerror = function (ev) { return reject(ev.target.error); };
            reader.onload = function (ev) { return resolve(ev.target.result); };
            if (type === 'binary')
                reader.readAsArrayBuffer(blob);
            else
                reader.readAsText(blob);
        });
    }
    function readBlobSync(blob, type) {
        if (typeof FileReaderSync === 'undefined') {
            throw new Error('FileReaderSync missing. Reading blobs synchronously requires code to run from within a web worker. Use TSON.encapsulateAsync() to do it from the main thread.');
        }
        var reader = new FileReaderSync(); // Requires worker environment
        var data = type === 'binary' ?
            reader.readAsArrayBuffer(blob) :
            reader.readAsText(blob);
        return data;
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var typeson = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
      module.exports = factory() ;
    }(commonjsGlobal, (function () {
      function _typeof(obj) {
        if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
          _typeof = function (obj) {
            return typeof obj;
          };
        } else {
          _typeof = function (obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
          };
        }

        return _typeof(obj);
      }

      function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          Promise.resolve(value).then(_next, _throw);
        }
      }

      function _asyncToGenerator(fn) {
        return function () {
          var self = this,
              args = arguments;
          return new Promise(function (resolve, reject) {
            var gen = fn.apply(self, args);

            function _next(value) {
              asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }

            function _throw(err) {
              asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }

            _next(undefined);
          });
        };
      }

      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }

      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
      }

      function _defineProperty(obj, key, value) {
        if (key in obj) {
          Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          });
        } else {
          obj[key] = value;
        }

        return obj;
      }

      function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);

        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(object);
          if (enumerableOnly) symbols = symbols.filter(function (sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          });
          keys.push.apply(keys, symbols);
        }

        return keys;
      }

      function _objectSpread2(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i] != null ? arguments[i] : {};

          if (i % 2) {
            ownKeys(Object(source), true).forEach(function (key) {
              _defineProperty(target, key, source[key]);
            });
          } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
          } else {
            ownKeys(Object(source)).forEach(function (key) {
              Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
          }
        }

        return target;
      }

      function _slicedToArray(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
      }

      function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
      }

      function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr)) {
          for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

          return arr2;
        }
      }

      function _arrayWithHoles(arr) {
        if (Array.isArray(arr)) return arr;
      }

      function _iterableToArray(iter) {
        if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
      }

      function _iterableToArrayLimit(arr, i) {
        if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
          return;
        }

        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;

        try {
          for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);

            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"] != null) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }

        return _arr;
      }

      function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance");
      }

      function _nonIterableRest() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }

      /**
       * We keep this function minimized so if using two instances of this
       *   library, where one is minimized and one is not, it will still work
       *   with `hasConstructorOf`.
       * With ES6 classes, we may be able to simply use `class TypesonPromise
       *   extends Promise` and add a string tag for detection.
       * @param {function} f
       */
      // eslint-disable-next-line max-len
      // eslint-disable-next-line block-spacing, space-before-function-paren, space-before-blocks, space-infix-ops, semi, promise/avoid-new
      var TypesonPromise = function TypesonPromise(f) {
        _classCallCheck(this, TypesonPromise);

        this.p = new Promise(f);
      }; // eslint-disable-next-line max-len
      // class TypesonPromise extends Promise {get[Symbol.toStringTag](){return 'TypesonPromise'};} // eslint-disable-line keyword-spacing, space-before-function-paren, space-before-blocks, block-spacing, semi


      TypesonPromise.__typeson__type__ = 'TypesonPromise'; // Note: core-js-bundle provides a `Symbol` polyfill

      /* istanbul ignore else */

      if (typeof Symbol !== 'undefined') {
        // Ensure `isUserObject` will return `false` for `TypesonPromise`
        TypesonPromise.prototype[Symbol.toStringTag] = 'TypesonPromise';
      }
      /**
       *
       * @param {function} [onFulfilled]
       * @param {function} [onRejected]
       * @returns {TypesonPromise}
       */


      TypesonPromise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;

        return new TypesonPromise(function (typesonResolve, typesonReject) {
          // eslint-disable-next-line promise/catch-or-return
          _this.p.then(function (res) {
            // eslint-disable-next-line promise/always-return
            typesonResolve(onFulfilled ? onFulfilled(res) : res);
          })["catch"](function (res) {
            return onRejected ? onRejected(res) : Promise.reject(res);
          }).then(typesonResolve, typesonReject);
        });
      };
      /**
       *
       * @param {function} onRejected
       * @returns {TypesonPromise}
       */


      TypesonPromise.prototype["catch"] = function (onRejected) {
        return this.then(null, onRejected);
      };
      /**
       *
       * @param {Any} v
       * @returns {TypesonPromise}
       */


      TypesonPromise.resolve = function (v) {
        return new TypesonPromise(function (typesonResolve) {
          typesonResolve(v);
        });
      };
      /**
       *
       * @param {Any} v
       * @returns {TypesonPromise}
       */


      TypesonPromise.reject = function (v) {
        return new TypesonPromise(function (typesonResolve, typesonReject) {
          typesonReject(v);
        });
      };

      ['all', 'race'].forEach(function (meth) {
        /**
         *
         * @param {Promise[]} promArr
         * @returns {TypesonPromise}
         */
        TypesonPromise[meth] = function (promArr) {
          return new TypesonPromise(function (typesonResolve, typesonReject) {
            // eslint-disable-next-line promise/catch-or-return
            Promise[meth](promArr.map(function (prom) {
              return prom && prom.constructor && prom.constructor.__typeson__type__ === 'TypesonPromise' ? prom.p : prom;
            })).then(typesonResolve, typesonReject);
          });
        };
      });

      var _ref = {},
          toStr = _ref.toString,
          hasOwn = {}.hasOwnProperty,
          getProto = Object.getPrototypeOf,
          fnToString = hasOwn.toString;
      /**
       * Second argument not in use internally, but provided for utility.
       * @param {Any} v
       * @param {boolean} catchCheck
       * @returns {boolean}
       */

      function isThenable(v, catchCheck) {
        return isObject(v) && typeof v.then === 'function' && (!catchCheck || typeof v["catch"] === 'function');
      }
      /**
       *
       * @param {Any} val
       * @returns {string}
       */


      function toStringTag(val) {
        return toStr.call(val).slice(8, -1);
      }
      /**
       * This function is dependent on both constructors
       *   being identical so any minimization is expected of both.
       * @param {Any} a
       * @param {function} b
       * @returns {boolean}
       */


      function hasConstructorOf(a, b) {
        if (!a || _typeof(a) !== 'object') {
          return false;
        }

        var proto = getProto(a);

        if (!proto) {
          return b === null;
        }

        var Ctor = hasOwn.call(proto, 'constructor') && proto.constructor;

        if (typeof Ctor !== 'function') {
          return b === null;
        }

        if (b === Ctor) {
          return true;
        }

        if (b !== null && fnToString.call(Ctor) === fnToString.call(b)) {
          return true;
        }

        if (typeof b === 'function' && typeof Ctor.__typeson__type__ === 'string' && Ctor.__typeson__type__ === b.__typeson__type__) {
          return true;
        }

        return false;
      }
      /**
       *
       * @param {Any} val
       * @returns {boolean}
       */


      function isPlainObject(val) {
        // Mirrors jQuery's
        if (!val || toStringTag(val) !== 'Object') {
          return false;
        }

        var proto = getProto(val);

        if (!proto) {
          // `Object.create(null)`
          return true;
        }

        return hasConstructorOf(val, Object);
      }
      /**
       *
       * @param {Any} val
       * @returns {boolean}
       */


      function isUserObject(val) {
        if (!val || toStringTag(val) !== 'Object') {
          return false;
        }

        var proto = getProto(val);

        if (!proto) {
          // `Object.create(null)`
          return true;
        }

        return hasConstructorOf(val, Object) || isUserObject(proto);
      }
      /**
       *
       * @param {Any} v
       * @returns {boolean}
       */


      function isObject(v) {
        return v && _typeof(v) === 'object';
      }
      /**
       *
       * @param {string} keyPathComponent
       * @returns {string}
       */


      function escapeKeyPathComponent(keyPathComponent) {
        return keyPathComponent.replace(/~/g, '~0').replace(/\./g, '~1');
      }
      /**
       *
       * @param {string} keyPathComponent
       * @returns {string}
       */


      function unescapeKeyPathComponent(keyPathComponent) {
        return keyPathComponent.replace(/~1/g, '.').replace(/~0/g, '~');
      }
      /**
       * @param {PlainObject|GenericArray} obj
       * @param {string} keyPath
       * @returns {Any}
       */


      function getByKeyPath(obj, keyPath) {
        if (keyPath === '') {
          return obj;
        }

        var period = keyPath.indexOf('.');

        if (period > -1) {
          var innerObj = obj[unescapeKeyPathComponent(keyPath.slice(0, period))];
          return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.slice(period + 1));
        }

        return obj[unescapeKeyPathComponent(keyPath)];
      }
      /**
       *
       * @param {PlainObject} obj
       * @param {string} keyPath
       * @param {Any} value
       * @returns {Any}
       */


      function setAtKeyPath(obj, keyPath, value) {
        if (keyPath === '') {
          return value;
        }

        var period = keyPath.indexOf('.');

        if (period > -1) {
          var innerObj = obj[unescapeKeyPathComponent(keyPath.slice(0, period))];
          return setAtKeyPath(innerObj, keyPath.slice(period + 1), value);
        }

        obj[unescapeKeyPathComponent(keyPath)] = value;
        return obj;
      }
      /**
       *
       * @param {external:JSON} value
       * @returns {"null"|"array"|"undefined"|"boolean"|"number"|"string"|
       *  "object"|"symbol"}
       */


      function getJSONType(value) {
        return value === null ? 'null' : Array.isArray(value) ? 'array' : _typeof(value);
      }

      var keys = Object.keys,
          isArray = Array.isArray,
          hasOwn$1 = {}.hasOwnProperty,
          internalStateObjPropsToIgnore = ['type', 'replaced', 'iterateIn', 'iterateUnsetNumeric'];
      /**
       * Handle plain object revivers first so reference setting can use
       * revived type (e.g., array instead of object); assumes revived
       * has same structure or will otherwise break subsequent references.
       * @param {PlainObjectType} a
       * @param {PlainObjectType} b
       * @returns {1|-1|boolean}
       */

      function nestedPathsFirst(a, b) {
        if (a.keypath === '') {
          return -1;
        }

        var as = a.keypath.match(/\./g) || 0;
        var bs = b.keypath.match(/\./g) || 0;

        if (as) {
          as = as.length;
        }

        if (bs) {
          bs = bs.length;
        }

        return as > bs ? -1 : as < bs ? 1 : a.keypath < b.keypath ? -1 : a.keypath > b.keypath;
      }
      /**
       * An instance of this class can be used to call `stringify()` and `parse()`.
       * Typeson resolves cyclic references by default. Can also be extended to
       * support custom types using the register() method.
       *
       * @class
       * @param {{cyclic: boolean}} [options] - if cyclic (default true),
       *   cyclic references will be handled gracefully.
       */


      var Typeson =
      /*#__PURE__*/
      function () {
        function Typeson(options) {
          _classCallCheck(this, Typeson);

          this.options = options; // Replacers signature: replace (value). Returns falsy if not
          //   replacing. Otherwise ['Date', value.getTime()]

          this.plainObjectReplacers = [];
          this.nonplainObjectReplacers = []; // Revivers: [{type => reviver}, {plain: boolean}].
          //   Sample: [{'Date': value => new Date(value)}, {plain: false}]

          this.revivers = {};
          /** Types registered via `register()`. */

          this.types = {};
        }
        /**
        * @typedef {null|boolean|number|string|GenericArray|PlainObject} JSON
        */

        /**
        * @callback JSONReplacer
        * @param {""|string} key
        * @param {JSON} value
        * @returns {number|string|boolean|null|PlainObject|undefined}
        * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The%20replacer%20parameter
        */

        /**
         * Serialize given object to Typeson.
         * Initial arguments work identical to those of `JSON.stringify`.
         * The `replacer` argument has nothing to do with our replacers.
         * @param {Any} obj
         * @param {JSONReplacer|string[]} replacer
         * @param {number|string} space
         * @param {object} opts
         * @returns {string|Promise} Promise resolves to a string
         */


        _createClass(Typeson, [{
          key: "stringify",
          value: function stringify(obj, replacer, space, opts) {
            opts = _objectSpread2({}, this.options, {}, opts, {
              stringification: true
            });
            var encapsulated = this.encapsulate(obj, null, opts);

            if (isArray(encapsulated)) {
              return JSON.stringify(encapsulated[0], replacer, space);
            }

            return encapsulated.then(function (res) {
              return JSON.stringify(res, replacer, space);
            });
          }
          /**
           * Also sync but throws on non-sync result.
           * @param {Any} obj
           * @param {JSONReplacer|string[]} replacer
           * @param {number|string} space
           * @param {object} opts
           * @returns {string}
           */

        }, {
          key: "stringifySync",
          value: function stringifySync(obj, replacer, space, opts) {
            return this.stringify(obj, replacer, space, _objectSpread2({
              throwOnBadSyncType: true
            }, opts, {
              sync: true
            }));
          }
          /**
           *
           * @param {Any} obj
           * @param {JSONReplacer|string[]} replacer
           * @param {number|string} space
           * @param {object} opts
           * @returns {Promise<string>}
           */

        }, {
          key: "stringifyAsync",
          value: function stringifyAsync(obj, replacer, space, opts) {
            return this.stringify(obj, replacer, space, _objectSpread2({
              throwOnBadSyncType: true
            }, opts, {
              sync: false
            }));
          }
          /**
           * Parse Typeson back into an obejct.
           * Initial arguments works identical to those of `JSON.parse()`.
           * @param {string} text
           * @param {function} reviver This JSON reviver has nothing to do with
           *   our revivers.
           * @param {object} opts
           * @returns {external:JSON}
           */

        }, {
          key: "parse",
          value: function parse(text, reviver, opts) {
            opts = _objectSpread2({}, this.options, {}, opts, {
              parse: true
            });
            return this.revive(JSON.parse(text, reviver), opts);
          }
          /**
          * Also sync but throws on non-sync result.
          * @param {string} text
          * @param {function} reviver This JSON reviver has nothing to do with
          *   our revivers.
          * @param {object} opts
          * @returns {external:JSON}
          */

        }, {
          key: "parseSync",
          value: function parseSync(text, reviver, opts) {
            return this.parse(text, reviver, _objectSpread2({
              throwOnBadSyncType: true
            }, opts, {
              sync: true
            }));
          }
          /**
          * @param {string} text
          * @param {function} reviver This JSON reviver has nothing to do with
          *   our revivers.
          * @param {object} opts
          * @returns {Promise} Resolves to `external:JSON`
          */

        }, {
          key: "parseAsync",
          value: function parseAsync(text, reviver, opts) {
            return this.parse(text, reviver, _objectSpread2({
              throwOnBadSyncType: true
            }, opts, {
              sync: false
            }));
          }
          /**
           *
           * @param {Any} obj
           * @param {object} stateObj
           * @param {object} [opts={}]
           * @returns {string[]|false}
           */

        }, {
          key: "specialTypeNames",
          value: function specialTypeNames(obj, stateObj) {
            var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            opts.returnTypeNames = true;
            return this.encapsulate(obj, stateObj, opts);
          }
          /**
           *
           * @param {Any} obj
           * @param {PlainObject} stateObj
           * @param {PlainObject} [opts={}]
           * @returns {Promise|GenericArray|PlainObject|string|false}
           */

        }, {
          key: "rootTypeName",
          value: function rootTypeName(obj, stateObj) {
            var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            opts.iterateNone = true;
            return this.encapsulate(obj, stateObj, opts);
          }
          /**
           * Encapsulate a complex object into a plain Object by replacing
           * registered types with plain objects representing the types data.
           *
           * This method is used internally by `Typeson.stringify()`.
           * @param {Any} obj - Object to encapsulate.
           * @param {PlainObject} stateObj
           * @param {PlainObject} opts
           * @returns {Promise|GenericArray|PlainObject|string|false}
           */

        }, {
          key: "encapsulate",
          value: function encapsulate(obj, stateObj, opts) {
            opts = _objectSpread2({
              sync: true
            }, this.options, {}, opts);
            var _opts = opts,
                sync = _opts.sync;
            var that = this,
                types = {},
                refObjs = [],
                // For checking cyclic references
            refKeys = [],
                // For checking cyclic references
            promisesDataRoot = []; // Clone the object deeply while at the same time replacing any
            //   special types or cyclic reference:

            var cyclic = 'cyclic' in opts ? opts.cyclic : true;
            var _opts2 = opts,
                encapsulateObserver = _opts2.encapsulateObserver;

            var ret = _encapsulate('', obj, cyclic, stateObj || {}, promisesDataRoot);
            /**
             *
             * @param {Any} ret
             * @returns {GenericArray|PlainObject|string|false}
             */


            function finish(ret) {
              // Add `$types` to result only if we ever bumped into a
              //  special type (or special case where object has own `$types`)
              var typeNames = Object.values(types);

              if (opts.iterateNone) {
                if (typeNames.length) {
                  return typeNames[0];
                }

                return Typeson.getJSONType(ret);
              }

              if (typeNames.length) {
                if (opts.returnTypeNames) {
                  return _toConsumableArray(new Set(typeNames));
                } // Special if array (or a primitive) was serialized
                //   because JSON would ignore custom `$types` prop on it


                if (!ret || !isPlainObject(ret) || // Also need to handle if this is an object with its
                //   own `$types` property (to avoid ambiguity)
                hasOwn$1.call(ret, '$types')) {
                  ret = {
                    $: ret,
                    $types: {
                      $: types
                    }
                  };
                } else {
                  ret.$types = types;
                } // No special types

              } else if (isObject(ret) && hasOwn$1.call(ret, '$types')) {
                ret = {
                  $: ret,
                  $types: true
                };
              }

              if (opts.returnTypeNames) {
                return false;
              }

              return ret;
            }
            /**
             *
             * @param {Any} ret
             * @param {GenericArray} promisesData
             * @returns {Promise<Any>}
             */


            function checkPromises(_x, _x2) {
              return _checkPromises.apply(this, arguments);
            }
            /**
             *
             * @param {object} stateObj
             * @param {object} ownKeysObj
             * @param {function} cb
             * @returns {undefined}
             */


            function _checkPromises() {
              _checkPromises = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee2(ret, promisesData) {
                var promResults;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return Promise.all(promisesData.map(function (pd) {
                          return pd[1].p;
                        }));

                      case 2:
                        promResults = _context2.sent;
                        _context2.next = 5;
                        return Promise.all(promResults.map(
                        /*#__PURE__*/
                        function () {
                          var _ref = _asyncToGenerator(
                          /*#__PURE__*/
                          regeneratorRuntime.mark(function _callee(promResult) {
                            var newPromisesData, _promisesData$splice, _promisesData$splice2, prData, _prData, keyPath, cyclic, stateObj, parentObj, key, detectedType, encaps, isTypesonPromise, encaps2;

                            return regeneratorRuntime.wrap(function _callee$(_context) {
                              while (1) {
                                switch (_context.prev = _context.next) {
                                  case 0:
                                    newPromisesData = [];
                                    _promisesData$splice = promisesData.splice(0, 1), _promisesData$splice2 = _slicedToArray(_promisesData$splice, 1), prData = _promisesData$splice2[0];
                                    _prData = _slicedToArray(prData, 7), keyPath = _prData[0], cyclic = _prData[2], stateObj = _prData[3], parentObj = _prData[4], key = _prData[5], detectedType = _prData[6];
                                    encaps = _encapsulate(keyPath, promResult, cyclic, stateObj, newPromisesData, true, detectedType);
                                    isTypesonPromise = hasConstructorOf(encaps, TypesonPromise); // Handle case where an embedded custom type itself
                                    //   returns a `Typeson.Promise`

                                    if (!(keyPath && isTypesonPromise)) {
                                      _context.next = 11;
                                      break;
                                    }

                                    _context.next = 8;
                                    return encaps.p;

                                  case 8:
                                    encaps2 = _context.sent;
                                    parentObj[key] = encaps2;
                                    return _context.abrupt("return", checkPromises(ret, newPromisesData));

                                  case 11:
                                    if (keyPath) {
                                      parentObj[key] = encaps;
                                    } else if (isTypesonPromise) {
                                      ret = encaps.p;
                                    } else {
                                      // If this is itself a `Typeson.Promise` (because the
                                      //   original value supplied was a `Promise` or
                                      //   because the supplied custom type value resolved
                                      //   to one), returning it below will be fine since
                                      //   a `Promise` is expected anyways given current
                                      //   config (and if not a `Promise`, it will be ready
                                      //   as the resolve value)
                                      ret = encaps;
                                    }

                                    return _context.abrupt("return", checkPromises(ret, newPromisesData));

                                  case 13:
                                  case "end":
                                    return _context.stop();
                                }
                              }
                            }, _callee);
                          }));

                          return function (_x3) {
                            return _ref.apply(this, arguments);
                          };
                        }()));

                      case 5:
                        return _context2.abrupt("return", ret);

                      case 6:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));
              return _checkPromises.apply(this, arguments);
            }

            function _adaptBuiltinStateObjectProperties(stateObj, ownKeysObj, cb) {
              Object.assign(stateObj, ownKeysObj);
              var vals = internalStateObjPropsToIgnore.map(function (prop) {
                var tmp = stateObj[prop];
                delete stateObj[prop];
                return tmp;
              }); // eslint-disable-next-line callback-return

              cb();
              internalStateObjPropsToIgnore.forEach(function (prop, i) {
                stateObj[prop] = vals[i];
              });
            }
            /**
             *
             * @param {string} keypath
             * @param {Any} value
             * @param {boolean} cyclic
             * @param {PlainObject} stateObj
             * @param {boolean} promisesData
             * @param {boolean} resolvingTypesonPromise
             * @param {string} detectedType
             * @returns {Any}
             */


            function _encapsulate(keypath, value, cyclic, stateObj, promisesData, resolvingTypesonPromise, detectedType) {
              var ret;
              var observerData = {};

              var $typeof = _typeof(value);

              var runObserver = encapsulateObserver ? function (obj) {
                var type = detectedType || stateObj.type || Typeson.getJSONType(value);
                encapsulateObserver(Object.assign(obj || observerData, {
                  keypath: keypath,
                  value: value,
                  cyclic: cyclic,
                  stateObj: stateObj,
                  promisesData: promisesData,
                  resolvingTypesonPromise: resolvingTypesonPromise,
                  awaitingTypesonPromise: hasConstructorOf(value, TypesonPromise)
                }, {
                  type: type
                }));
              } : null;

              if (['string', 'boolean', 'number', 'undefined'].includes($typeof)) {
                if (value === undefined || $typeof === 'number' && (isNaN(value) || value === -Infinity || value === Infinity)) {
                  if (stateObj.replaced) {
                    ret = value;
                  } else {
                    ret = replace(keypath, value, stateObj, promisesData, false, resolvingTypesonPromise, runObserver);
                  }

                  if (ret !== value) {
                    observerData = {
                      replaced: ret
                    };
                  }
                } else {
                  ret = value;
                }

                if (runObserver) {
                  runObserver();
                }

                return ret;
              }

              if (value === null) {
                if (runObserver) {
                  runObserver();
                }

                return value;
              }

              if (cyclic && !stateObj.iterateIn && !stateObj.iterateUnsetNumeric && value && _typeof(value) === 'object') {
                // Options set to detect cyclic references and be able
                //   to rewrite them.
                var refIndex = refObjs.indexOf(value);

                if (refIndex < 0) {
                  if (cyclic === true) {
                    refObjs.push(value);
                    refKeys.push(keypath);
                  }
                } else {
                  types[keypath] = '#';

                  if (runObserver) {
                    runObserver({
                      cyclicKeypath: refKeys[refIndex]
                    });
                  }

                  return '#' + refKeys[refIndex];
                }
              }

              var isPlainObj = isPlainObject(value);
              var isArr = isArray(value);
              var replaced = // Running replace will cause infinite loop as will test
              //   positive again
              (isPlainObj || isArr) && (!that.plainObjectReplacers.length || stateObj.replaced) || stateObj.iterateIn ? // Optimization: if plain object and no plain-object
              //   replacers, don't try finding a replacer
              value : replace(keypath, value, stateObj, promisesData, isPlainObj || isArr, null, runObserver);
              var clone;

              if (replaced !== value) {
                ret = replaced;
                observerData = {
                  replaced: replaced
                };
              } else {
                // eslint-disable-next-line no-lonely-if
                if (keypath === '' && hasConstructorOf(value, TypesonPromise)) {
                  promisesData.push([keypath, value, cyclic, stateObj, undefined, undefined, stateObj.type]);
                  ret = value;
                } else if (isArr && stateObj.iterateIn !== 'object' || stateObj.iterateIn === 'array') {
                  clone = new Array(value.length);
                  observerData = {
                    clone: clone
                  };
                } else if (!['function', 'symbol'].includes(_typeof(value)) && !('toJSON' in value) && !hasConstructorOf(value, TypesonPromise) && !hasConstructorOf(value, Promise) && !hasConstructorOf(value, ArrayBuffer) || isPlainObj || stateObj.iterateIn === 'object') {
                  clone = {};

                  if (stateObj.addLength) {
                    clone.length = value.length;
                  }

                  observerData = {
                    clone: clone
                  };
                } else {
                  ret = value; // Only clone vanilla objects and arrays
                }
              }

              if (runObserver) {
                runObserver();
              }

              if (opts.iterateNone) {
                return clone || ret;
              }

              if (!clone) {
                return ret;
              } // Iterate object or array


              if (stateObj.iterateIn) {
                var _loop = function _loop(key) {
                  var ownKeysObj = {
                    ownKeys: hasOwn$1.call(value, key)
                  };

                  _adaptBuiltinStateObjectProperties(stateObj, ownKeysObj, function () {
                    var kp = keypath + (keypath ? '.' : '') + escapeKeyPathComponent(key);

                    var val = _encapsulate(kp, value[key], Boolean(cyclic), stateObj, promisesData, resolvingTypesonPromise);

                    if (hasConstructorOf(val, TypesonPromise)) {
                      promisesData.push([kp, val, Boolean(cyclic), stateObj, clone, key, stateObj.type]);
                    } else if (val !== undefined) {
                      clone[key] = val;
                    }
                  });
                };

                // eslint-disable-next-line guard-for-in
                for (var key in value) {
                  _loop(key);
                }

                if (runObserver) {
                  runObserver({
                    endIterateIn: true,
                    end: true
                  });
                }
              } else {
                // Note: Non-indexes on arrays won't survive stringify so
                //  somewhat wasteful for arrays, but so too is iterating
                //  all numeric indexes on sparse arrays when not wanted
                //  or filtering own keys for positive integers
                keys(value).forEach(function (key) {
                  var kp = keypath + (keypath ? '.' : '') + escapeKeyPathComponent(key);
                  var ownKeysObj = {
                    ownKeys: true
                  };

                  _adaptBuiltinStateObjectProperties(stateObj, ownKeysObj, function () {
                    var val = _encapsulate(kp, value[key], Boolean(cyclic), stateObj, promisesData, resolvingTypesonPromise);

                    if (hasConstructorOf(val, TypesonPromise)) {
                      promisesData.push([kp, val, Boolean(cyclic), stateObj, clone, key, stateObj.type]);
                    } else if (val !== undefined) {
                      clone[key] = val;
                    }
                  });
                });

                if (runObserver) {
                  runObserver({
                    endIterateOwn: true,
                    end: true
                  });
                }
              } // Iterate array for non-own numeric properties (we can't
              //   replace the prior loop though as it iterates non-integer
              //   keys)


              if (stateObj.iterateUnsetNumeric) {
                var vl = value.length;

                var _loop2 = function _loop2(i) {
                  if (!(i in value)) {
                    // No need to escape numeric
                    var kp = keypath + (keypath ? '.' : '') + i;
                    var ownKeysObj = {
                      ownKeys: false
                    };

                    _adaptBuiltinStateObjectProperties(stateObj, ownKeysObj, function () {
                      var val = _encapsulate(kp, undefined, Boolean(cyclic), stateObj, promisesData, resolvingTypesonPromise);

                      if (hasConstructorOf(val, TypesonPromise)) {
                        promisesData.push([kp, val, Boolean(cyclic), stateObj, clone, i, stateObj.type]);
                      } else if (val !== undefined) {
                        clone[i] = val;
                      }
                    });
                  }
                };

                for (var i = 0; i < vl; i++) {
                  _loop2(i);
                }

                if (runObserver) {
                  runObserver({
                    endIterateUnsetNumeric: true,
                    end: true
                  });
                }
              }

              return clone;
            }
            /**
             *
             * @param {string} keypath
             * @param {Any} value
             * @param {PlainObject} stateObj
             * @param {GenericArray} promisesData
             * @param {boolean} plainObject
             * @param {boolean} resolvingTypesonPromise
             * @param {function} [runObserver]
             * @returns {*}
             */


            function replace(keypath, value, stateObj, promisesData, plainObject, resolvingTypesonPromise, runObserver) {
              // Encapsulate registered types
              var replacers = plainObject ? that.plainObjectReplacers : that.nonplainObjectReplacers;
              var i = replacers.length;

              while (i--) {
                var replacer = replacers[i];

                if (replacer.test(value, stateObj)) {
                  var type = replacer.type;

                  if (that.revivers[type]) {
                    // Record the type only if a corresponding reviver
                    //   exists. This is to support specs where only
                    //   replacement is done.
                    // For example, ensuring deep cloning of the object,
                    //   or replacing a type to its equivalent without
                    //   the need to revive it.
                    var existing = types[keypath]; // type can comprise an array of types (see test
                    //   "should support intermediate types")

                    types[keypath] = existing ? [type].concat(existing) : type;
                  }

                  Object.assign(stateObj, {
                    type: type,
                    replaced: true
                  });

                  if ((sync || !replacer.replaceAsync) && !replacer.replace) {
                    if (runObserver) {
                      runObserver({
                        typeDetected: true
                      });
                    }

                    return _encapsulate(keypath, value, cyclic && 'readonly', stateObj, promisesData, resolvingTypesonPromise, type);
                  }

                  if (runObserver) {
                    runObserver({
                      replacing: true
                    });
                  } // Now, also traverse the result in case it contains its
                  //   own types to replace


                  var replaceMethod = sync || !replacer.replaceAsync ? 'replace' : 'replaceAsync';
                  return _encapsulate(keypath, replacer[replaceMethod](value, stateObj), cyclic && 'readonly', stateObj, promisesData, resolvingTypesonPromise, type);
                }
              }

              return value;
            }

            return promisesDataRoot.length ? sync && opts.throwOnBadSyncType ? function () {
              throw new TypeError('Sync method requested but async result obtained');
            }() : Promise.resolve(checkPromises(ret, promisesDataRoot)).then(finish) : !sync && opts.throwOnBadSyncType ? function () {
              throw new TypeError('Async method requested but sync result obtained');
            }() // If this is a synchronous request for stringification, yet
            //   a promise is the result, we don't want to resolve leading
            //   to an async result, so we return an array to avoid
            //   ambiguity
            : opts.stringification && sync ? [finish(ret)] : sync ? finish(ret) : Promise.resolve(finish(ret));
          }
          /**
           * Also sync but throws on non-sync result.
           * @param {*} obj
           * @param {object} stateObj
           * @param {object} opts
           * @returns {*}
           */

        }, {
          key: "encapsulateSync",
          value: function encapsulateSync(obj, stateObj, opts) {
            return this.encapsulate(obj, stateObj, _objectSpread2({
              throwOnBadSyncType: true
            }, opts, {
              sync: true
            }));
          }
          /**
           * @param {*} obj
           * @param {object} stateObj
           * @param {object} opts
           * @returns {*}
           */

        }, {
          key: "encapsulateAsync",
          value: function encapsulateAsync(obj, stateObj, opts) {
            return this.encapsulate(obj, stateObj, _objectSpread2({
              throwOnBadSyncType: true
            }, opts, {
              sync: false
            }));
          }
          /**
           * Revive an encapsulated object.
           * This method is used internally by `Typeson.parse()`.
           * @param {object} obj - Object to revive. If it has `$types` member, the
           *   properties that are listed there will be replaced with its true type
           *   instead of just plain objects.
           * @param {object} opts
           * @throws TypeError If mismatch between sync/async type and result
           * @returns {Promise|*} If async, returns a Promise that resolves to `*`
           */

        }, {
          key: "revive",
          value: function revive(obj, opts) {
            var types = obj && obj.$types; // No type info added. Revival not needed.

            if (!types) {
              return obj;
            } // Object happened to have own `$types` property but with
            //   no actual types, so we unescape and return that object


            if (types === true) {
              return obj.$;
            }

            opts = _objectSpread2({
              sync: true
            }, this.options, {}, opts);
            var _opts3 = opts,
                sync = _opts3.sync;
            var keyPathResolutions = [];
            var stateObj = {};
            var ignore$Types = true; // Special when root object is not a trivial Object, it will
            //   be encapsulated in `$`. It will also be encapsulated in
            //   `$` if it has its own `$` property to avoid ambiguity

            if (types.$ && isPlainObject(types.$)) {
              obj = obj.$;
              types = types.$;
              ignore$Types = false;
            }

            var that = this;
            /**
             * @callback RevivalReducer
             * @param {Any} value
             * @param {string} type
             * @returns {Any}
             */

            /**
             *
             * @param {string} type
             * @param {Any} val
             * @returns {[type]} [description]
             */

            function executeReviver(type, val) {
              var _ref2 = that.revivers[type] || [],
                  _ref3 = _slicedToArray(_ref2, 1),
                  reviver = _ref3[0];

              if (!reviver) {
                throw new Error('Unregistered type: ' + type);
              } // Only `sync` expected here, as problematic async would
              //  be missing both `reviver` and `reviverAsync`, and
              //  encapsulation shouldn't have added types, so
              //  should have made an early exit


              if (sync && !('revive' in reviver)) {
                // Just return value as is
                return val;
              }

              return reviver[sync && reviver.revive ? 'revive' : !sync && reviver.reviveAsync ? 'reviveAsync' : 'revive'](val, stateObj);
            }
            /**
             *
             * @returns {void|TypesonPromise<void>}
             */


            function revivePlainObjects() {
              // const references = [];
              // const reviveTypes = [];
              var plainObjectTypes = [];
              Object.entries(types).forEach(function (_ref4) {
                var _ref5 = _slicedToArray(_ref4, 2),
                    keypath = _ref5[0],
                    type = _ref5[1];

                if (type === '#') {
                  /*
                  references.push({
                      keypath,
                      reference: getByKeyPath(obj, keypath)
                  });
                  */
                  return;
                }

                [].concat(type).forEach(function (type) {
                  var _ref6 = that.revivers[type] || [null, {}],
                      _ref7 = _slicedToArray(_ref6, 2),
                      plain = _ref7[1].plain;

                  if (!plain) {
                    // reviveTypes.push({keypath, type});
                    return;
                  }

                  plainObjectTypes.push({
                    keypath: keypath,
                    type: type
                  });
                  delete types[keypath]; // Avoid repeating
                });
              });

              if (!plainObjectTypes.length) {
                return undefined;
              } // console.log(plainObjectTypes.sort(nestedPathsFirst));

              /**
              * @typedef {PlainObject} PlainObjectType
              * @property {string} keypath
              * @property {string} type
              */


              return plainObjectTypes.sort(nestedPathsFirst).reduce(function reducer(possibleTypesonPromise, _ref8) {
                var keypath = _ref8.keypath,
                    type = _ref8.type;

                if (isThenable(possibleTypesonPromise)) {
                  return possibleTypesonPromise.then(function (val) {
                    return reducer(val, {
                      keypath: keypath,
                      type: type
                    });
                  });
                } // console.log('obj', JSON.stringify(keypath), obj);


                var val = getByKeyPath(obj, keypath);
                val = executeReviver(type, val);

                if (hasConstructorOf(val, TypesonPromise)) {
                  return val.then(function (v) {
                    var newVal = setAtKeyPath(obj, keypath, v);

                    if (newVal === v) {
                      obj = newVal;
                    }

                    return undefined;
                  });
                }

                var newVal = setAtKeyPath(obj, keypath, val);

                if (newVal === val) {
                  obj = newVal;
                }

                return undefined;
              }, undefined // This argument must be explicit
              ); // references.forEach(({keypath, reference}) => {});
              // reviveTypes.sort(nestedPathsFirst).forEach(() => {});
            }

            var revivalPromises = [];
            /**
             *
             * @param {string} keypath
             * @param {Any} value
             * @param {?(Array|object)} target
             * @param {Array|object} [clone]
             * @param {string} [key]
             * @returns {Any}
             */

            function _revive(keypath, value, target, clone, key) {
              if (ignore$Types && keypath === '$types') {
                return undefined;
              }

              var type = types[keypath];
              var isArr = isArray(value);

              if (isArr || isPlainObject(value)) {
                var _clone = isArr ? new Array(value.length) : {}; // Iterate object or array


                keys(value).forEach(function (k) {
                  var val = _revive(keypath + (keypath ? '.' : '') + escapeKeyPathComponent(k), value[k], target || _clone, _clone, k);

                  var set = function set(v) {
                    if (hasConstructorOf(v, Undefined)) {
                      _clone[k] = undefined;
                    } else if (v !== undefined) {
                      _clone[k] = v;
                    }

                    return v;
                  };

                  if (hasConstructorOf(val, TypesonPromise)) {
                    revivalPromises.push(val.then(function (ret) {
                      return set(ret);
                    }));
                  } else {
                    set(val);
                  }
                });
                value = _clone; // Try to resolve cyclic reference as soon as available

                while (keyPathResolutions.length) {
                  var _keyPathResolutions$ = _slicedToArray(keyPathResolutions[0], 4),
                      _target = _keyPathResolutions$[0],
                      keyPath = _keyPathResolutions$[1],
                      _clone2 = _keyPathResolutions$[2],
                      k = _keyPathResolutions$[3];

                  var val = getByKeyPath(_target, keyPath); // Typeson.Undefined not expected here as not cyclic or
                  //   `undefined`

                  if (val !== undefined) {
                    _clone2[k] = val;
                  } else {
                    break;
                  }

                  keyPathResolutions.splice(0, 1);
                }
              }

              if (!type) {
                return value;
              }

              if (type === '#') {
                var _ret = getByKeyPath(target, value.slice(1));

                if (_ret === undefined) {
                  // Cyclic reference not yet available
                  keyPathResolutions.push([target, value.slice(1), clone, key]);
                }

                return _ret;
              } // `type` can be an array here


              return [].concat(type).reduce(function reducer(val, typ) {
                if (hasConstructorOf(val, TypesonPromise)) {
                  return val.then(function (v) {
                    // TypesonPromise here too
                    return reducer(v, typ);
                  });
                }

                return executeReviver(typ, val);
              }, value);
            }
            /**
             *
             * @param {Any} retrn
             * @returns {undefined|Any}
             */


            function checkUndefined(retrn) {
              return hasConstructorOf(retrn, Undefined) ? undefined : retrn;
            }

            var possibleTypesonPromise = revivePlainObjects();
            var ret;

            if (hasConstructorOf(possibleTypesonPromise, TypesonPromise)) {
              ret = possibleTypesonPromise.then(function () {
                return obj;
              });
            } else {
              ret = _revive('', obj, null);

              if (revivalPromises.length) {
                // Ensure children resolved
                ret = TypesonPromise.resolve(ret).then(function (r) {
                  return TypesonPromise.all([// May be a TypesonPromise or not
                  r].concat(revivalPromises));
                }).then(function (_ref9) {
                  var _ref10 = _slicedToArray(_ref9, 1),
                      r = _ref10[0];

                  return r;
                });
              }
            }

            return isThenable(ret) ? sync && opts.throwOnBadSyncType ? function () {
              throw new TypeError('Sync method requested but async result obtained');
            }() : hasConstructorOf(ret, TypesonPromise) ? ret.p.then(checkUndefined) : ret : !sync && opts.throwOnBadSyncType ? function () {
              throw new TypeError('Async method requested but sync result obtained');
            }() : sync ? checkUndefined(ret) : Promise.resolve(checkUndefined(ret));
          }
          /**
           * Also sync but throws on non-sync result.
           * @param {Any} obj
           * @param {object} opts
           * @returns {Any}
           */

        }, {
          key: "reviveSync",
          value: function reviveSync(obj, opts) {
            return this.revive(obj, _objectSpread2({
              throwOnBadSyncType: true
            }, opts, {
              sync: true
            }));
          }
          /**
          * @param {Any} obj
          * @param {object} opts
          * @returns {Promise} Resolves to `*`
          */

        }, {
          key: "reviveAsync",
          value: function reviveAsync(obj, opts) {
            return this.revive(obj, _objectSpread2({
              throwOnBadSyncType: true
            }, opts, {
              sync: false
            }));
          }
          /**
           * Register types.
           * For examples on how to use this method, see
           *   {@link https://github.com/dfahlander/typeson-registry/tree/master/types}.
           * @param {object.<string,Function[]>[]} typeSpecSets - Types and
           *   their functions [test, encapsulate, revive];
           * @param {object} opts
           * @returns {Typeson}
           */

        }, {
          key: "register",
          value: function register(typeSpecSets, opts) {
            opts = opts || {};
            [].concat(typeSpecSets).forEach(function R(typeSpec) {
              var _this = this;

              // Allow arrays of arrays of arrays...
              if (isArray(typeSpec)) {
                return typeSpec.map(function (typSpec) {
                  return R.call(_this, typSpec);
                });
              }

              typeSpec && keys(typeSpec).forEach(function (typeId) {
                if (typeId === '#') {
                  throw new TypeError('# cannot be used as a type name as it is reserved ' + 'for cyclic objects');
                } else if (Typeson.JSON_TYPES.includes(typeId)) {
                  throw new TypeError('Plain JSON object types are reserved as type names');
                }

                var spec = typeSpec[typeId];
                var replacers = spec && spec.testPlainObjects ? this.plainObjectReplacers : this.nonplainObjectReplacers;
                var existingReplacer = replacers.filter(function (r) {
                  return r.type === typeId;
                });

                if (existingReplacer.length) {
                  // Remove existing spec and replace with this one.
                  replacers.splice(replacers.indexOf(existingReplacer[0]), 1);
                  delete this.revivers[typeId];
                  delete this.types[typeId];
                }

                if (typeof spec === 'function') {
                  // Support registering just a class without replacer/reviver
                  var Class = spec;
                  spec = {
                    test: function test(x) {
                      return x && x.constructor === Class;
                    },
                    replace: function replace(x) {
                      return _objectSpread2({}, x);
                    },
                    revive: function revive(x) {
                      return Object.assign(Object.create(Class.prototype), x);
                    }
                  };
                } else if (isArray(spec)) {
                  var _spec = spec,
                      _spec2 = _slicedToArray(_spec, 3),
                      test = _spec2[0],
                      replace = _spec2[1],
                      revive = _spec2[2];

                  spec = {
                    test: test,
                    replace: replace,
                    revive: revive
                  };
                }

                if (!spec || !spec.test) {
                  return;
                }

                var replacerObj = {
                  type: typeId,
                  test: spec.test.bind(spec)
                };

                if (spec.replace) {
                  replacerObj.replace = spec.replace.bind(spec);
                }

                if (spec.replaceAsync) {
                  replacerObj.replaceAsync = spec.replaceAsync.bind(spec);
                }

                var start = typeof opts.fallback === 'number' ? opts.fallback : opts.fallback ? 0 : Infinity;

                if (spec.testPlainObjects) {
                  this.plainObjectReplacers.splice(start, 0, replacerObj);
                } else {
                  this.nonplainObjectReplacers.splice(start, 0, replacerObj);
                } // Todo: We might consider a testAsync type


                if (spec.revive || spec.reviveAsync) {
                  var reviverObj = {};

                  if (spec.revive) {
                    reviverObj.revive = spec.revive.bind(spec);
                  }

                  if (spec.reviveAsync) {
                    reviverObj.reviveAsync = spec.reviveAsync.bind(spec);
                  }

                  this.revivers[typeId] = [reviverObj, {
                    plain: spec.testPlainObjects
                  }];
                } // Record to be retrieved via public types property.


                this.types[typeId] = spec;
              }, this);
            }, this);
            return this;
          }
        }]);

        return Typeson;
      }();
      /**
       * We keep this function minimized so if using two instances of this
       * library, where one is minimized and one is not, it will still work
       * with `hasConstructorOf`.
       * @class
       */


      var Undefined = function Undefined() {
        _classCallCheck(this, Undefined);
      }; // eslint-disable-line space-before-blocks


      Undefined.__typeson__type__ = 'TypesonUndefined'; // The following provide classes meant to avoid clashes with other values
      // To insist `undefined` should be added

      Typeson.Undefined = Undefined; // To support async encapsulation/stringification

      Typeson.Promise = TypesonPromise; // Some fundamental type-checking utilities

      Typeson.isThenable = isThenable;
      Typeson.toStringTag = toStringTag;
      Typeson.hasConstructorOf = hasConstructorOf;
      Typeson.isObject = isObject;
      Typeson.isPlainObject = isPlainObject;
      Typeson.isUserObject = isUserObject;
      Typeson.escapeKeyPathComponent = escapeKeyPathComponent;
      Typeson.unescapeKeyPathComponent = unescapeKeyPathComponent;
      Typeson.getByKeyPath = getByKeyPath;
      Typeson.getJSONType = getJSONType;
      Typeson.JSON_TYPES = ['null', 'boolean', 'number', 'string', 'array', 'object'];

      return Typeson;

    })));
    });

    var structuredCloning = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}(commonjsGlobal,(function(){function _typeof$1(e){return (_typeof$1="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck$1(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties$1(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}function _defineProperty$1(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function ownKeys$1(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n);}return r}function _toConsumableArray$1(e){return function _arrayWithoutHoles$1(e){if(Array.isArray(e))return _arrayLikeToArray$1(e)}(e)||function _iterableToArray$1(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function _unsupportedIterableToArray$1(e,t){if(!e)return;if("string"==typeof e)return _arrayLikeToArray$1(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return _arrayLikeToArray$1(e,t)}(e)||function _nonIterableSpread$1(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _arrayLikeToArray$1(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function _typeof(e){return (_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function _typeof(e){return typeof e}:function _typeof(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}function _defineProperty(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function ownKeys(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n);}return r}function _objectSpread2(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(Object(r),!0).forEach((function(t){_defineProperty(e,t,r[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ownKeys(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t));}));}return e}function _slicedToArray(e,t){return function _arrayWithHoles(e){if(Array.isArray(e))return e}(e)||function _iterableToArrayLimit(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var r=[],n=!0,i=!1,o=void 0;try{for(var a,c=e[Symbol.iterator]();!(n=(a=c.next()).done)&&(r.push(a.value),!t||r.length!==t);n=!0);}catch(e){i=!0,o=e;}finally{try{n||null==c.return||c.return();}finally{if(i)throw o}}return r}(e,t)||_unsupportedIterableToArray(e,t)||function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _toConsumableArray(e){return function _arrayWithoutHoles(e){if(Array.isArray(e))return _arrayLikeToArray(e)}(e)||function _iterableToArray(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||_unsupportedIterableToArray(e)||function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _unsupportedIterableToArray(e,t){if(e){if("string"==typeof e)return _arrayLikeToArray(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return "Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(e,t):void 0}}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var e=function TypesonPromise(e){_classCallCheck(this,TypesonPromise),this.p=new Promise(e);};e.__typeson__type__="TypesonPromise","undefined"!=typeof Symbol&&(e.prototype[Symbol.toStringTag]="TypesonPromise"),e.prototype.then=function(t,r){var n=this;return new e((function(e,i){n.p.then((function(r){e(t?t(r):r);})).catch((function(e){return r?r(e):Promise.reject(e)})).then(e,i);}))},e.prototype.catch=function(e){return this.then(null,e)},e.resolve=function(t){return new e((function(e){e(t);}))},e.reject=function(t){return new e((function(e,r){r(t);}))},["all","race"].forEach((function(t){e[t]=function(r){return new e((function(e,n){Promise[t](r.map((function(e){return e&&e.constructor&&"TypesonPromise"===e.constructor.__typeson__type__?e.p:e}))).then(e,n);}))};}));var t={}.toString,r={}.hasOwnProperty,n=Object.getPrototypeOf,i=r.toString;function isThenable(e,t){return isObject(e)&&"function"==typeof e.then&&(!t||"function"==typeof e.catch)}function toStringTag(e){return t.call(e).slice(8,-1)}function hasConstructorOf(e,t){if(!e||"object"!==_typeof(e))return !1;var o=n(e);if(!o)return null===t;var a=r.call(o,"constructor")&&o.constructor;return "function"!=typeof a?null===t:t===a||(null!==t&&i.call(a)===i.call(t)||"function"==typeof t&&"string"==typeof a.__typeson__type__&&a.__typeson__type__===t.__typeson__type__)}function isPlainObject(e){return !(!e||"Object"!==toStringTag(e))&&(!n(e)||hasConstructorOf(e,Object))}function isObject(e){return e&&"object"===_typeof(e)}function escapeKeyPathComponent(e){return e.replace(/~/g,"~0").replace(/\./g,"~1")}function unescapeKeyPathComponent(e){return e.replace(/~1/g,".").replace(/~0/g,"~")}function getByKeyPath(e,t){if(""===t)return e;var r=t.indexOf(".");if(r>-1){var n=e[unescapeKeyPathComponent(t.slice(0,r))];return void 0===n?void 0:getByKeyPath(n,t.slice(r+1))}return e[unescapeKeyPathComponent(t)]}function setAtKeyPath(e,t,r){if(""===t)return r;var n=t.indexOf(".");return n>-1?setAtKeyPath(e[unescapeKeyPathComponent(t.slice(0,n))],t.slice(n+1),r):(e[unescapeKeyPathComponent(t)]=r,e)}function _await(e,t,r){return r?t?t(e):e:(e&&e.then||(e=Promise.resolve(e)),t?e.then(t):e)}var o=Object.keys,a=Array.isArray,c={}.hasOwnProperty,u=["type","replaced","iterateIn","iterateUnsetNumeric"];function _async(e){return function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];try{return Promise.resolve(e.apply(this,t))}catch(e){return Promise.reject(e)}}}function nestedPathsFirst(e,t){if(""===e.keypath)return -1;var r=e.keypath.match(/\./g)||0,n=t.keypath.match(/\./g)||0;return r&&(r=r.length),n&&(n=n.length),r>n?-1:r<n?1:e.keypath<t.keypath?-1:e.keypath>t.keypath}var s=function(){function Typeson(e){_classCallCheck(this,Typeson),this.options=e,this.plainObjectReplacers=[],this.nonplainObjectReplacers=[],this.revivers={},this.types={};}return function _createClass(e,t,r){return t&&_defineProperties(e.prototype,t),r&&_defineProperties(e,r),e}(Typeson,[{key:"stringify",value:function stringify(e,t,r,n){n=_objectSpread2(_objectSpread2(_objectSpread2({},this.options),n),{},{stringification:!0});var i=this.encapsulate(e,null,n);return a(i)?JSON.stringify(i[0],t,r):i.then((function(e){return JSON.stringify(e,t,r)}))}},{key:"stringifySync",value:function stringifySync(e,t,r,n){return this.stringify(e,t,r,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},n),{},{sync:!0}))}},{key:"stringifyAsync",value:function stringifyAsync(e,t,r,n){return this.stringify(e,t,r,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},n),{},{sync:!1}))}},{key:"parse",value:function parse(e,t,r){return r=_objectSpread2(_objectSpread2(_objectSpread2({},this.options),r),{},{parse:!0}),this.revive(JSON.parse(e,t),r)}},{key:"parseSync",value:function parseSync(e,t,r){return this.parse(e,t,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},r),{},{sync:!0}))}},{key:"parseAsync",value:function parseAsync(e,t,r){return this.parse(e,t,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},r),{},{sync:!1}))}},{key:"specialTypeNames",value:function specialTypeNames(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return r.returnTypeNames=!0,this.encapsulate(e,t,r)}},{key:"rootTypeName",value:function rootTypeName(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return r.iterateNone=!0,this.encapsulate(e,t,r)}},{key:"encapsulate",value:function encapsulate(t,r,n){var i=_async((function(t,r){return _await(Promise.all(r.map((function(e){return e[1].p}))),(function(n){return _await(Promise.all(n.map(_async((function(n){var o=!1,a=[],c=_slicedToArray(r.splice(0,1),1),u=_slicedToArray(c[0],7),s=u[0],f=u[2],l=u[3],p=u[4],y=u[5],v=u[6],b=_encapsulate(s,n,f,l,a,!0,v),d=hasConstructorOf(b,e);return function _invoke(e,t){var r=e();return r&&r.then?r.then(t):t(r)}((function(){if(s&&d)return _await(b.p,(function(e){return p[y]=e,o=!0,i(t,a)}))}),(function(e){return o?e:(s?p[y]=b:t=d?b.p:b,i(t,a))}))})))),(function(){return t}))}))})),s=(n=_objectSpread2(_objectSpread2({sync:!0},this.options),n)).sync,f=this,l={},p=[],y=[],v=[],b=!("cyclic"in n)||n.cyclic,d=n.encapsulateObserver,h=_encapsulate("",t,b,r||{},v);function finish(e){var t=Object.values(l);if(n.iterateNone)return t.length?t[0]:Typeson.getJSONType(e);if(t.length){if(n.returnTypeNames)return _toConsumableArray(new Set(t));e&&isPlainObject(e)&&!c.call(e,"$types")?e.$types=l:e={$:e,$types:{$:l}};}else isObject(e)&&c.call(e,"$types")&&(e={$:e,$types:!0});return !n.returnTypeNames&&e}function _adaptBuiltinStateObjectProperties(e,t,r){Object.assign(e,t);var n=u.map((function(t){var r=e[t];return delete e[t],r}));r(),u.forEach((function(t,r){e[t]=n[r];}));}function _encapsulate(t,r,i,u,s,v,b){var h,g={},m=_typeof(r),O=d?function(n){var o=b||u.type||Typeson.getJSONType(r);d(Object.assign(n||g,{keypath:t,value:r,cyclic:i,stateObj:u,promisesData:s,resolvingTypesonPromise:v,awaitingTypesonPromise:hasConstructorOf(r,e)},{type:o}));}:null;if(["string","boolean","number","undefined"].includes(m))return void 0===r||Number.isNaN(r)||r===Number.NEGATIVE_INFINITY||r===Number.POSITIVE_INFINITY?(h=u.replaced?r:replace(t,r,u,s,!1,v,O))!==r&&(g={replaced:h}):h=r,O&&O(),h;if(null===r)return O&&O(),r;if(i&&!u.iterateIn&&!u.iterateUnsetNumeric&&r&&"object"===_typeof(r)){var _=p.indexOf(r);if(!(_<0))return l[t]="#",O&&O({cyclicKeypath:y[_]}),"#"+y[_];!0===i&&(p.push(r),y.push(t));}var j,S=isPlainObject(r),T=a(r),w=(S||T)&&(!f.plainObjectReplacers.length||u.replaced)||u.iterateIn?r:replace(t,r,u,s,S||T,null,O);if(w!==r?(h=w,g={replaced:w}):""===t&&hasConstructorOf(r,e)?(s.push([t,r,i,u,void 0,void 0,u.type]),h=r):T&&"object"!==u.iterateIn||"array"===u.iterateIn?(j=new Array(r.length),g={clone:j}):(["function","symbol"].includes(_typeof(r))||"toJSON"in r||hasConstructorOf(r,e)||hasConstructorOf(r,Promise)||hasConstructorOf(r,ArrayBuffer))&&!S&&"object"!==u.iterateIn?h=r:(j={},u.addLength&&(j.length=r.length),g={clone:j}),O&&O(),n.iterateNone)return j||h;if(!j)return h;if(u.iterateIn){var A=function _loop(n){var o={ownKeys:c.call(r,n)};_adaptBuiltinStateObjectProperties(u,o,(function(){var o=t+(t?".":"")+escapeKeyPathComponent(n),a=_encapsulate(o,r[n],Boolean(i),u,s,v);hasConstructorOf(a,e)?s.push([o,a,Boolean(i),u,j,n,u.type]):void 0!==a&&(j[n]=a);}));};for(var P in r)A(P);O&&O({endIterateIn:!0,end:!0});}else o(r).forEach((function(n){var o=t+(t?".":"")+escapeKeyPathComponent(n);_adaptBuiltinStateObjectProperties(u,{ownKeys:!0},(function(){var t=_encapsulate(o,r[n],Boolean(i),u,s,v);hasConstructorOf(t,e)?s.push([o,t,Boolean(i),u,j,n,u.type]):void 0!==t&&(j[n]=t);}));})),O&&O({endIterateOwn:!0,end:!0});if(u.iterateUnsetNumeric){for(var I=r.length,C=function _loop2(n){if(!(n in r)){var o=t+(t?".":"")+n;_adaptBuiltinStateObjectProperties(u,{ownKeys:!1},(function(){var t=_encapsulate(o,void 0,Boolean(i),u,s,v);hasConstructorOf(t,e)?s.push([o,t,Boolean(i),u,j,n,u.type]):void 0!==t&&(j[n]=t);}));}},N=0;N<I;N++)C(N);O&&O({endIterateUnsetNumeric:!0,end:!0});}return j}function replace(e,t,r,n,i,o,a){for(var c=i?f.plainObjectReplacers:f.nonplainObjectReplacers,u=c.length;u--;){var p=c[u];if(p.test(t,r)){var y=p.type;if(f.revivers[y]){var v=l[e];l[e]=v?[y].concat(v):y;}return Object.assign(r,{type:y,replaced:!0}),!s&&p.replaceAsync||p.replace?(a&&a({replacing:!0}),_encapsulate(e,p[s||!p.replaceAsync?"replace":"replaceAsync"](t,r),b&&"readonly",r,n,o,y)):(a&&a({typeDetected:!0}),_encapsulate(e,t,b&&"readonly",r,n,o,y))}}return t}return v.length?s&&n.throwOnBadSyncType?function(){throw new TypeError("Sync method requested but async result obtained")}():Promise.resolve(i(h,v)).then(finish):!s&&n.throwOnBadSyncType?function(){throw new TypeError("Async method requested but sync result obtained")}():n.stringification&&s?[finish(h)]:s?finish(h):Promise.resolve(finish(h))}},{key:"encapsulateSync",value:function encapsulateSync(e,t,r){return this.encapsulate(e,t,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},r),{},{sync:!0}))}},{key:"encapsulateAsync",value:function encapsulateAsync(e,t,r){return this.encapsulate(e,t,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},r),{},{sync:!1}))}},{key:"revive",value:function revive(t,r){var n=t&&t.$types;if(!n)return t;if(!0===n)return t.$;var i=(r=_objectSpread2(_objectSpread2({sync:!0},this.options),r)).sync,c=[],u={},s=!0;n.$&&isPlainObject(n.$)&&(t=t.$,n=n.$,s=!1);var l=this;function executeReviver(e,t){var r=_slicedToArray(l.revivers[e]||[],1)[0];if(!r)throw new Error("Unregistered type: "+e);return i&&!("revive"in r)?t:r[i&&r.revive?"revive":!i&&r.reviveAsync?"reviveAsync":"revive"](t,u)}var p=[];function checkUndefined(e){return hasConstructorOf(e,f)?void 0:e}var y,v=function revivePlainObjects(){var r=[];if(Object.entries(n).forEach((function(e){var t=_slicedToArray(e,2),i=t[0],o=t[1];"#"!==o&&[].concat(o).forEach((function(e){_slicedToArray(l.revivers[e]||[null,{}],2)[1].plain&&(r.push({keypath:i,type:e}),delete n[i]);}));})),r.length)return r.sort(nestedPathsFirst).reduce((function reducer(r,n){var i=n.keypath,o=n.type;if(isThenable(r))return r.then((function(e){return reducer(e,{keypath:i,type:o})}));var a=getByKeyPath(t,i);if(hasConstructorOf(a=executeReviver(o,a),e))return a.then((function(e){var r=setAtKeyPath(t,i,e);r===e&&(t=r);}));var c=setAtKeyPath(t,i,a);c===a&&(t=c);}),void 0)}();return hasConstructorOf(v,e)?y=v.then((function(){return t})):(y=function _revive(t,r,i,u,l){if(!s||"$types"!==t){var y=n[t],v=a(r);if(v||isPlainObject(r)){var b=v?new Array(r.length):{};for(o(r).forEach((function(n){var o=_revive(t+(t?".":"")+escapeKeyPathComponent(n),r[n],i||b,b,n),a=function set(e){return hasConstructorOf(e,f)?b[n]=void 0:void 0!==e&&(b[n]=e),e};hasConstructorOf(o,e)?p.push(o.then((function(e){return a(e)}))):a(o);})),r=b;c.length;){var d=_slicedToArray(c[0],4),h=d[0],g=d[1],m=d[2],O=d[3],_=getByKeyPath(h,g);if(void 0===_)break;m[O]=_,c.splice(0,1);}}if(!y)return r;if("#"===y){var j=getByKeyPath(i,r.slice(1));return void 0===j&&c.push([i,r.slice(1),u,l]),j}return [].concat(y).reduce((function reducer(t,r){return hasConstructorOf(t,e)?t.then((function(e){return reducer(e,r)})):executeReviver(r,t)}),r)}}("",t,null),p.length&&(y=e.resolve(y).then((function(t){return e.all([t].concat(p))})).then((function(e){return _slicedToArray(e,1)[0]})))),isThenable(y)?i&&r.throwOnBadSyncType?function(){throw new TypeError("Sync method requested but async result obtained")}():hasConstructorOf(y,e)?y.p.then(checkUndefined):y:!i&&r.throwOnBadSyncType?function(){throw new TypeError("Async method requested but sync result obtained")}():i?checkUndefined(y):Promise.resolve(checkUndefined(y))}},{key:"reviveSync",value:function reviveSync(e,t){return this.revive(e,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},t),{},{sync:!0}))}},{key:"reviveAsync",value:function reviveAsync(e,t){return this.revive(e,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},t),{},{sync:!1}))}},{key:"register",value:function register(e,t){return t=t||{},[].concat(e).forEach((function R(e){var r=this;if(a(e))return e.map((function(e){return R.call(r,e)}));e&&o(e).forEach((function(r){if("#"===r)throw new TypeError("# cannot be used as a type name as it is reserved for cyclic objects");if(Typeson.JSON_TYPES.includes(r))throw new TypeError("Plain JSON object types are reserved as type names");var n=e[r],i=n&&n.testPlainObjects?this.plainObjectReplacers:this.nonplainObjectReplacers,o=i.filter((function(e){return e.type===r}));if(o.length&&(i.splice(i.indexOf(o[0]),1),delete this.revivers[r],delete this.types[r]),"function"==typeof n){var c=n;n={test:function test(e){return e&&e.constructor===c},replace:function replace(e){return _objectSpread2({},e)},revive:function revive(e){return Object.assign(Object.create(c.prototype),e)}};}else if(a(n)){var u=_slicedToArray(n,3);n={test:u[0],replace:u[1],revive:u[2]};}if(n&&n.test){var s={type:r,test:n.test.bind(n)};n.replace&&(s.replace=n.replace.bind(n)),n.replaceAsync&&(s.replaceAsync=n.replaceAsync.bind(n));var f="number"==typeof t.fallback?t.fallback:t.fallback?0:Number.POSITIVE_INFINITY;if(n.testPlainObjects?this.plainObjectReplacers.splice(f,0,s):this.nonplainObjectReplacers.splice(f,0,s),n.revive||n.reviveAsync){var l={};n.revive&&(l.revive=n.revive.bind(n)),n.reviveAsync&&(l.reviveAsync=n.reviveAsync.bind(n)),this.revivers[r]=[l,{plain:n.testPlainObjects}];}this.types[r]=n;}}),this);}),this),this}}]),Typeson}(),f=function Undefined(){_classCallCheck(this,Undefined);};f.__typeson__type__="TypesonUndefined",s.Undefined=f,s.Promise=e,s.isThenable=isThenable,s.toStringTag=toStringTag,s.hasConstructorOf=hasConstructorOf,s.isObject=isObject,s.isPlainObject=isPlainObject,s.isUserObject=function isUserObject(e){if(!e||"Object"!==toStringTag(e))return !1;var t=n(e);return !t||(hasConstructorOf(e,Object)||isUserObject(t))},s.escapeKeyPathComponent=escapeKeyPathComponent,s.unescapeKeyPathComponent=unescapeKeyPathComponent,s.getByKeyPath=getByKeyPath,s.getJSONType=function getJSONType(e){return null===e?"null":Array.isArray(e)?"array":_typeof(e)},s.JSON_TYPES=["null","boolean","number","string","array","object"];for(var l={userObject:{test:function test(e,t){return s.isUserObject(e)},replace:function replace(e){return function _objectSpread2$1(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?ownKeys$1(Object(r),!0).forEach((function(t){_defineProperty$1(e,t,r[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ownKeys$1(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t));}));}return e}({},e)},revive:function revive(e){return e}}},p=[{arrayNonindexKeys:{testPlainObjects:!0,test:function test(e,t){return !!Array.isArray(e)&&(Object.keys(e).some((function(e){return String(Number.parseInt(e))!==e}))&&(t.iterateIn="object",t.addLength=!0),!0)},replace:function replace(e,t){return t.iterateUnsetNumeric=!0,e},revive:function revive(e){if(Array.isArray(e))return e;var t=[];return Object.keys(e).forEach((function(r){var n=e[r];t[r]=n;})),t}}},{sparseUndefined:{test:function test(e,t){return void 0===e&&!1===t.ownKeys},replace:function replace(e){return 0},revive:function revive(e){}}}],y={undef:{test:function test(e,t){return void 0===e&&(t.ownKeys||!("ownKeys"in t))},replace:function replace(e){return 0},revive:function revive(e){return new s.Undefined}}},v={StringObject:{test:function test(e){return "String"===s.toStringTag(e)&&"object"===_typeof$1(e)},replace:function replace(e){return String(e)},revive:function revive(e){return new String(e)}},BooleanObject:{test:function test(e){return "Boolean"===s.toStringTag(e)&&"object"===_typeof$1(e)},replace:function replace(e){return Boolean(e)},revive:function revive(e){return new Boolean(e)}},NumberObject:{test:function test(e){return "Number"===s.toStringTag(e)&&"object"===_typeof$1(e)},replace:function replace(e){return Number(e)},revive:function revive(e){return new Number(e)}}},b=[{nan:{test:function test(e){return Number.isNaN(e)},replace:function replace(e){return "NaN"},revive:function revive(e){return Number.NaN}}},{infinity:{test:function test(e){return e===Number.POSITIVE_INFINITY},replace:function replace(e){return "Infinity"},revive:function revive(e){return Number.POSITIVE_INFINITY}}},{negativeInfinity:{test:function test(e){return e===Number.NEGATIVE_INFINITY},replace:function replace(e){return "-Infinity"},revive:function revive(e){return Number.NEGATIVE_INFINITY}}}],d={date:{test:function test(e){return "Date"===s.toStringTag(e)},replace:function replace(e){var t=e.getTime();return Number.isNaN(t)?"NaN":t},revive:function revive(e){return "NaN"===e?new Date(Number.NaN):new Date(e)}}},h={regexp:{test:function test(e){return "RegExp"===s.toStringTag(e)},replace:function replace(e){return {source:e.source,flags:(e.global?"g":"")+(e.ignoreCase?"i":"")+(e.multiline?"m":"")+(e.sticky?"y":"")+(e.unicode?"u":"")}},revive:function revive(e){var t=e.source,r=e.flags;return new RegExp(t,r)}}},g={map:{test:function test(e){return "Map"===s.toStringTag(e)},replace:function replace(e){return _toConsumableArray$1(e.entries())},revive:function revive(e){return new Map(e)}}},m={set:{test:function test(e){return "Set"===s.toStringTag(e)},replace:function replace(e){return _toConsumableArray$1(e.values())},revive:function revive(e){return new Set(e)}}},O="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_=new Uint8Array(256),j=0;j<O.length;j++)_[O.charCodeAt(j)]=j;var S=function encode(e,t,r){null==r&&(r=e.byteLength);for(var n=new Uint8Array(e,t||0,r),i=n.length,o="",a=0;a<i;a+=3)o+=O[n[a]>>2],o+=O[(3&n[a])<<4|n[a+1]>>4],o+=O[(15&n[a+1])<<2|n[a+2]>>6],o+=O[63&n[a+2]];return i%3==2?o=o.slice(0,-1)+"=":i%3==1&&(o=o.slice(0,-2)+"=="),o},T=function decode(e){var t,r,n,i,o=e.length,a=.75*e.length,c=0;"="===e[e.length-1]&&(a--,"="===e[e.length-2]&&a--);for(var u=new ArrayBuffer(a),s=new Uint8Array(u),f=0;f<o;f+=4)t=_[e.charCodeAt(f)],r=_[e.charCodeAt(f+1)],n=_[e.charCodeAt(f+2)],i=_[e.charCodeAt(f+3)],s[c++]=t<<2|r>>4,s[c++]=(15&r)<<4|n>>2,s[c++]=(3&n)<<6|63&i;return u},w={arraybuffer:{test:function test(e){return "ArrayBuffer"===s.toStringTag(e)},replace:function replace(e,t){t.buffers||(t.buffers=[]);var r=t.buffers.indexOf(e);return r>-1?{index:r}:(t.buffers.push(e),S(e))},revive:function revive(e,t){if(t.buffers||(t.buffers=[]),"object"===_typeof$1(e))return t.buffers[e.index];var r=T(e);return t.buffers.push(r),r}}},A="undefined"==typeof self?commonjsGlobal:self,P={};["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"].forEach((function(e){var t=e,r=A[t];r&&(P[e.toLowerCase()]={test:function test(e){return s.toStringTag(e)===t},replace:function replace(e,t){var r=e.buffer,n=e.byteOffset,i=e.length;t.buffers||(t.buffers=[]);var o=t.buffers.indexOf(r);return o>-1?{index:o,byteOffset:n,length:i}:(t.buffers.push(r),{encoded:S(r),byteOffset:n,length:i})},revive:function revive(e,t){t.buffers||(t.buffers=[]);var n,i=e.byteOffset,o=e.length,a=e.encoded,c=e.index;return "index"in e?n=t.buffers[c]:(n=T(a),t.buffers.push(n)),new r(n,i,o)}});}));var I={dataview:{test:function test(e){return "DataView"===s.toStringTag(e)},replace:function replace(e,t){var r=e.buffer,n=e.byteOffset,i=e.byteLength;t.buffers||(t.buffers=[]);var o=t.buffers.indexOf(r);return o>-1?{index:o,byteOffset:n,byteLength:i}:(t.buffers.push(r),{encoded:S(r),byteOffset:n,byteLength:i})},revive:function revive(e,t){t.buffers||(t.buffers=[]);var r,n=e.byteOffset,i=e.byteLength,o=e.encoded,a=e.index;return "index"in e?r=t.buffers[a]:(r=T(o),t.buffers.push(r)),new DataView(r,n,i)}}},C={IntlCollator:{test:function test(e){return s.hasConstructorOf(e,Intl.Collator)},replace:function replace(e){return e.resolvedOptions()},revive:function revive(e){return new Intl.Collator(e.locale,e)}},IntlDateTimeFormat:{test:function test(e){return s.hasConstructorOf(e,Intl.DateTimeFormat)},replace:function replace(e){return e.resolvedOptions()},revive:function revive(e){return new Intl.DateTimeFormat(e.locale,e)}},IntlNumberFormat:{test:function test(e){return s.hasConstructorOf(e,Intl.NumberFormat)},replace:function replace(e){return e.resolvedOptions()},revive:function revive(e){return new Intl.NumberFormat(e.locale,e)}}};function string2arraybuffer(e){for(var t=new Uint8Array(e.length),r=0;r<e.length;r++)t[r]=e.charCodeAt(r);return t.buffer}var N={file:{test:function test(e){return "File"===s.toStringTag(e)},replace:function replace(e){var t=new XMLHttpRequest;if(t.overrideMimeType("text/plain; charset=x-user-defined"),t.open("GET",URL.createObjectURL(e),!1),t.send(),200!==t.status&&0!==t.status)throw new Error("Bad File access: "+t.status);return {type:e.type,stringContents:t.responseText,name:e.name,lastModified:e.lastModified}},revive:function revive(e){var t=e.name,r=e.type,n=e.stringContents,i=e.lastModified;return new File([string2arraybuffer(n)],t,{type:r,lastModified:i})},replaceAsync:function replaceAsync(e){return new s.Promise((function(t,r){var n=new FileReader;n.addEventListener("load",(function(){t({type:e.type,stringContents:n.result,name:e.name,lastModified:e.lastModified});})),n.addEventListener("error",(function(){r(n.error);})),n.readAsBinaryString(e);}))}}},k={bigint:{test:function test(e){return "bigint"==typeof e},replace:function replace(e){return String(e)},revive:function revive(e){return BigInt(e)}}},E={bigintObject:{test:function test(e){return "object"===_typeof$1(e)&&s.hasConstructorOf(e,BigInt)},replace:function replace(e){return String(e)},revive:function revive(e){return new Object(BigInt(e))}}},B={cryptokey:{test:function test(e){return "CryptoKey"===s.toStringTag(e)&&e.extractable},replaceAsync:function replaceAsync(e){return new s.Promise((function(t,r){crypto.subtle.exportKey("jwk",e).catch((function(e){r(e);})).then((function(r){t({jwk:r,algorithm:e.algorithm,usages:e.usages});}));}))},revive:function revive(e){var t=e.jwk,r=e.algorithm,n=e.usages;return crypto.subtle.importKey("jwk",t,r,!0,n)}}};return [l,y,p,v,b,d,h,{imagedata:{test:function test(e){return "ImageData"===s.toStringTag(e)},replace:function replace(e){return {array:_toConsumableArray$1(e.data),width:e.width,height:e.height}},revive:function revive(e){return new ImageData(new Uint8ClampedArray(e.array),e.width,e.height)}}},{imagebitmap:{test:function test(e){return "ImageBitmap"===s.toStringTag(e)||e&&e.dataset&&"ImageBitmap"===e.dataset.toStringTag},replace:function replace(e){var t=document.createElement("canvas");return t.getContext("2d").drawImage(e,0,0),t.toDataURL()},revive:function revive(e){var t=document.createElement("canvas"),r=t.getContext("2d"),n=document.createElement("img");return n.addEventListener("load",(function(){r.drawImage(n,0,0);})),n.src=e,t},reviveAsync:function reviveAsync(e){var t=document.createElement("canvas"),r=t.getContext("2d"),n=document.createElement("img");return n.addEventListener("load",(function(){r.drawImage(n,0,0);})),n.src=e,createImageBitmap(t)}}},N,{file:N.file,filelist:{test:function test(e){return "FileList"===s.toStringTag(e)},replace:function replace(e){for(var t=[],r=0;r<e.length;r++)t[r]=e.item(r);return t},revive:function revive(e){return new(function(){function FileList(){_classCallCheck$1(this,FileList),this._files=arguments[0],this.length=this._files.length;}return function _createClass$1(e,t,r){return t&&_defineProperties$1(e.prototype,t),r&&_defineProperties$1(e,r),e}(FileList,[{key:"item",value:function item(e){return this._files[e]}},{key:Symbol.toStringTag,get:function get(){return "FileList"}}]),FileList}())(e)}}},{blob:{test:function test(e){return "Blob"===s.toStringTag(e)},replace:function replace(e){var t=new XMLHttpRequest;if(t.overrideMimeType("text/plain; charset=x-user-defined"),t.open("GET",URL.createObjectURL(e),!1),t.send(),200!==t.status&&0!==t.status)throw new Error("Bad Blob access: "+t.status);return {type:e.type,stringContents:t.responseText}},revive:function revive(e){var t=e.type,r=e.stringContents;return new Blob([string2arraybuffer(r)],{type:t})},replaceAsync:function replaceAsync(e){return new s.Promise((function(t,r){var n=new FileReader;n.addEventListener("load",(function(){t({type:e.type,stringContents:n.result});})),n.addEventListener("error",(function(){r(n.error);})),n.readAsBinaryString(e);}))}}}].concat("function"==typeof Map?g:[],"function"==typeof Set?m:[],"function"==typeof ArrayBuffer?w:[],"function"==typeof Uint8Array?P:[],"function"==typeof DataView?I:[],"undefined"!=typeof Intl?C:[],"undefined"!=typeof crypto?B:[],"undefined"!=typeof BigInt?[k,E]:[])}));

    });

    /*
     * base64-arraybuffer
     * https://github.com/niklasvh/base64-arraybuffer
     *
     * Copyright (c) 2017 Brett Zamir, 2012 Niklas von Hertzen
     * Licensed under the MIT license.
     */
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; // Use a lookup table to find the index.

    var lookup = new Uint8Array(256);

    for (var i = 0; i < chars.length; i++) {
      lookup[chars.codePointAt(i)] = i;
    }
    /**
     * @param {ArrayBuffer} arraybuffer
     * @param {Integer} byteOffset
     * @param {Integer} lngth
     * @returns {string}
     */


    var encode = function encode(arraybuffer, byteOffset, lngth) {
      if (lngth === null || lngth === undefined) {
        lngth = arraybuffer.byteLength; // Needed for Safari
      }

      var bytes = new Uint8Array(arraybuffer, byteOffset || 0, // Default needed for Safari
      lngth);
      var len = bytes.length;
      var base64 = '';

      for (var _i = 0; _i < len; _i += 3) {
        base64 += chars[bytes[_i] >> 2];
        base64 += chars[(bytes[_i] & 3) << 4 | bytes[_i + 1] >> 4];
        base64 += chars[(bytes[_i + 1] & 15) << 2 | bytes[_i + 2] >> 6];
        base64 += chars[bytes[_i + 2] & 63];
      }

      if (len % 3 === 2) {
        base64 = base64.slice(0, -1) + '=';
      } else if (len % 3 === 1) {
        base64 = base64.slice(0, -2) + '==';
      }

      return base64;
    };
    /**
     * @param {string} base64
     * @returns {ArrayBuffer}
     */

    var decode = function decode(base64) {
      var len = base64.length;
      var bufferLength = base64.length * 0.75;
      var p = 0;
      var encoded1, encoded2, encoded3, encoded4;

      if (base64[base64.length - 1] === '=') {
        bufferLength--;

        if (base64[base64.length - 2] === '=') {
          bufferLength--;
        }
      }

      var arraybuffer = new ArrayBuffer(bufferLength),
          bytes = new Uint8Array(arraybuffer);

      for (var _i2 = 0; _i2 < len; _i2 += 4) {
        encoded1 = lookup[base64.codePointAt(_i2)];
        encoded2 = lookup[base64.codePointAt(_i2 + 1)];
        encoded3 = lookup[base64.codePointAt(_i2 + 2)];
        encoded4 = lookup[base64.codePointAt(_i2 + 3)];
        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
      }

      return arraybuffer;
    };

    /* eslint-env browser, node */
    var _global = typeof self === 'undefined' ? global : self;
    var exportObj = {};
    [
        'Int8Array',
        'Uint8Array',
        'Uint8ClampedArray',
        'Int16Array',
        'Uint16Array',
        'Int32Array',
        'Uint32Array',
        'Float32Array',
        'Float64Array'
    ].forEach(function (typeName) {
        var arrType = typeName;
        var TypedArray = _global[arrType];
        if (TypedArray) {
            exportObj[typeName.toLowerCase() + "2"] = {
                test: function (x) { return typeson.toStringTag(x) === arrType; },
                replace: function (_a) {
                    var buffer = _a.buffer, byteOffset = _a.byteOffset, length = _a.length;
                    return {
                        buffer: buffer,
                        byteOffset: byteOffset,
                        length: length
                    };
                },
                revive: function (b64Obj) {
                    var buffer = b64Obj.buffer, byteOffset = b64Obj.byteOffset, length = b64Obj.length;
                    return new TypedArray(buffer, byteOffset, length);
                }
            };
        }
    });

    var arrayBuffer = {
        arraybuffer: {
            test: function (x) { return typeson.toStringTag(x) === 'ArrayBuffer'; },
            replace: function (b) {
                return encode(b, 0, b.byteLength);
            },
            revive: function (b64) {
                var buffer = decode(b64);
                return buffer;
            }
        }
    };
    // See also typed-arrays!

    var TSON = new typeson().register(structuredCloning);
    var readBlobsSynchronously = 'FileReaderSync' in self; // true in workers only.
    var blobsToAwait = [];
    var blobsToAwaitPos = 0;
    // Need to patch encapsulateAsync as it does not work as of typeson 5.8.2
    // Also, current version of typespn-registry-1.0.0-alpha.21 does not
    // encapsulate/revive Blobs correctly (fails one of the unit tests in
    // this library (test 'export-format'))
    TSON.register([
        arrayBuffer,
        exportObj, {
            blob2: {
                test: function (x) { return typeson.toStringTag(x) === 'Blob'; },
                replace: function (b) {
                    if (b.isClosed) { // On MDN, but not in https://w3c.github.io/FileAPI/#dfn-Blob
                        throw new Error('The Blob is closed');
                    }
                    if (readBlobsSynchronously) {
                        var data = readBlobSync(b, 'binary');
                        var base64 = encode(data, 0, data.byteLength);
                        return {
                            type: b.type,
                            data: base64
                        };
                    }
                    else {
                        blobsToAwait.push(b); // This will also make TSON.mustFinalize() return true.
                        var result = {
                            type: b.type,
                            data: { start: blobsToAwaitPos, end: blobsToAwaitPos + b.size }
                        };
                        blobsToAwaitPos += b.size;
                        return result;
                    }
                },
                finalize: function (b, ba) {
                    b.data = encode(ba, 0, ba.byteLength);
                },
                revive: function (_a) {
                    var type = _a.type, data = _a.data;
                    return new Blob([decode(data)], { type: type });
                }
            }
        }
    ]);
    TSON.mustFinalize = function () { return blobsToAwait.length > 0; };
    TSON.finalize = function (items) { return __awaiter(void 0, void 0, void 0, function () {
        var allChunks, _i, items_1, item, types, arrayType, keyPath, typeName, typeSpec, b;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readBlobAsync(new Blob(blobsToAwait), 'binary')];
                case 1:
                    allChunks = _a.sent();
                    if (items) {
                        for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                            item = items_1[_i];
                            // Manually go through all "blob" types in the result
                            // and lookup the data slice they point at.
                            if (item.$types) {
                                types = item.$types;
                                arrayType = types.$;
                                if (arrayType)
                                    types = types.$;
                                for (keyPath in types) {
                                    typeName = types[keyPath];
                                    typeSpec = TSON.types[typeName];
                                    if (typeSpec && typeSpec.finalize) {
                                        b = Dexie__default["default"].getByKeyPath(item, arrayType ? "$." + keyPath : keyPath);
                                        typeSpec.finalize(b, allChunks.slice(b.start, b.end));
                                    }
                                }
                            }
                        }
                    }
                    // Free up memory
                    blobsToAwait = [];
                    return [2 /*return*/];
            }
        });
    }); };

    var DEFAULT_ROWS_PER_CHUNK = 2000;
    function exportDB(db, options) {
        return __awaiter(this, void 0, void 0, function () {
            function exportAll() {
                return __awaiter(this, void 0, void 0, function () {
                    var tablesRowCounts, emptyExportJson, posEndDataArray, firstJsonSlice, filter, transform, _loop_1, _i, tables_1, tableName;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, Promise.all(targetTables.map(function (table) { return table.count(); }))];
                            case 1:
                                tablesRowCounts = _a.sent();
                                tablesRowCounts.forEach(function (rowCount, i) { return tables[i].rowCount = rowCount; });
                                progress.totalRows = tablesRowCounts.reduce(function (p, c) { return p + c; });
                                emptyExportJson = JSON.stringify(emptyExport, undefined, prettyJson ? 2 : undefined);
                                posEndDataArray = emptyExportJson.lastIndexOf(']');
                                firstJsonSlice = emptyExportJson.substring(0, posEndDataArray);
                                slices.push(firstJsonSlice);
                                filter = options.filter;
                                transform = options.transform;
                                _loop_1 = function (tableName) {
                                    var table, primKey, inbound, LIMIT, emptyTableExport, emptyTableExportJson, posEndRowsArray, lastKey, lastNumRows, mayHaveMoreRows, _loop_2, state_1;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                table = db.table(tableName);
                                                primKey = table.schema.primKey;
                                                inbound = !!primKey.keyPath;
                                                LIMIT = options.numRowsPerChunk || DEFAULT_ROWS_PER_CHUNK;
                                                emptyTableExport = inbound ? {
                                                    tableName: table.name,
                                                    inbound: true,
                                                    rows: []
                                                } : {
                                                    tableName: table.name,
                                                    inbound: false,
                                                    rows: []
                                                };
                                                emptyTableExportJson = JSON.stringify(emptyTableExport, undefined, prettyJson ? 2 : undefined);
                                                if (prettyJson) {
                                                    // Increase indentation according to this:
                                                    // {
                                                    //   ...
                                                    //   data: [
                                                    //     ...
                                                    //     data: [
                                                    // 123456<---- here
                                                    //     ] 
                                                    //   ]
                                                    // }
                                                    emptyTableExportJson = emptyTableExportJson.split('\n').join('\n    ');
                                                }
                                                posEndRowsArray = emptyTableExportJson.lastIndexOf(']');
                                                slices.push(emptyTableExportJson.substring(0, posEndRowsArray));
                                                lastKey = null;
                                                lastNumRows = 0;
                                                mayHaveMoreRows = true;
                                                _loop_2 = function () {
                                                    var chunkedCollection, values, filteredValues, transformedValues, tsonValues, json, keys, keyvals, tsonTuples, json;
                                                    return __generator(this, function (_c) {
                                                        switch (_c.label) {
                                                            case 0:
                                                                if (progressCallback) {
                                                                    // Keep ongoing transaction private
                                                                    Dexie__default["default"].ignoreTransaction(function () { return progressCallback(progress); });
                                                                }
                                                                chunkedCollection = lastKey == null ?
                                                                    table.limit(LIMIT) :
                                                                    table.where(':id').above(lastKey).limit(LIMIT);
                                                                return [4 /*yield*/, chunkedCollection.toArray()];
                                                            case 1:
                                                                values = _c.sent();
                                                                if (values.length === 0)
                                                                    return [2 /*return*/, "break"];
                                                                if (lastKey != null && lastNumRows > 0) {
                                                                    // Not initial chunk. Must add a comma:
                                                                    slices.push(",");
                                                                    if (prettyJson) {
                                                                        slices.push("\n      ");
                                                                    }
                                                                }
                                                                mayHaveMoreRows = values.length === LIMIT;
                                                                if (!inbound) return [3 /*break*/, 4];
                                                                filteredValues = filter ?
                                                                    values.filter(function (value) { return filter(tableName, value); }) :
                                                                    values;
                                                                transformedValues = transform ?
                                                                    filteredValues.map(function (value) { return transform(tableName, value).value; }) :
                                                                    filteredValues;
                                                                tsonValues = transformedValues.map(function (value) { return TSON.encapsulate(value); });
                                                                if (!TSON.mustFinalize()) return [3 /*break*/, 3];
                                                                return [4 /*yield*/, Dexie__default["default"].waitFor(TSON.finalize(tsonValues))];
                                                            case 2:
                                                                _c.sent();
                                                                _c.label = 3;
                                                            case 3:
                                                                json = JSON.stringify(tsonValues, undefined, prettyJson ? 2 : undefined);
                                                                if (prettyJson)
                                                                    json = json.split('\n').join('\n      ');
                                                                // By generating a blob here, we give web platform the opportunity to store the contents
                                                                // on disk and release RAM.
                                                                slices.push(new Blob([json.substring(1, json.length - 1)]));
                                                                lastNumRows = transformedValues.length;
                                                                lastKey = values.length > 0 ?
                                                                    Dexie__default["default"].getByKeyPath(values[values.length - 1], primKey.keyPath) :
                                                                    null;
                                                                return [3 /*break*/, 8];
                                                            case 4: return [4 /*yield*/, chunkedCollection.primaryKeys()];
                                                            case 5:
                                                                keys = _c.sent();
                                                                keyvals = keys.map(function (key, i) { return [key, values[i]]; });
                                                                if (filter)
                                                                    keyvals = keyvals.filter(function (_a) {
                                                                        var key = _a[0], value = _a[1];
                                                                        return filter(tableName, value, key);
                                                                    });
                                                                if (transform)
                                                                    keyvals = keyvals.map(function (_a) {
                                                                        var key = _a[0], value = _a[1];
                                                                        var transformResult = transform(tableName, value, key);
                                                                        return [transformResult.key, transformResult.value];
                                                                    });
                                                                tsonTuples = keyvals.map(function (tuple) { return TSON.encapsulate(tuple); });
                                                                if (!TSON.mustFinalize()) return [3 /*break*/, 7];
                                                                return [4 /*yield*/, Dexie__default["default"].waitFor(TSON.finalize(tsonTuples))];
                                                            case 6:
                                                                _c.sent();
                                                                _c.label = 7;
                                                            case 7:
                                                                json = JSON.stringify(tsonTuples, undefined, prettyJson ? 2 : undefined);
                                                                if (prettyJson)
                                                                    json = json.split('\n').join('\n      ');
                                                                // By generating a blob here, we give web platform the opportunity to store the contents
                                                                // on disk and release RAM.
                                                                slices.push(new Blob([json.substring(1, json.length - 1)]));
                                                                lastNumRows = keyvals.length;
                                                                lastKey = keys.length > 0 ?
                                                                    keys[keys.length - 1] :
                                                                    null;
                                                                _c.label = 8;
                                                            case 8:
                                                                progress.completedRows += values.length;
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                };
                                                _b.label = 1;
                                            case 1:
                                                if (!mayHaveMoreRows) return [3 /*break*/, 3];
                                                return [5 /*yield**/, _loop_2()];
                                            case 2:
                                                state_1 = _b.sent();
                                                if (state_1 === "break")
                                                    return [3 /*break*/, 3];
                                                return [3 /*break*/, 1];
                                            case 3:
                                                slices.push(emptyTableExportJson.substr(posEndRowsArray)); // "]}"
                                                progress.completedTables += 1;
                                                if (progress.completedTables < progress.totalTables) {
                                                    slices.push(",");
                                                }
                                                return [2 /*return*/];
                                        }
                                    });
                                };
                                _i = 0, tables_1 = tables;
                                _a.label = 2;
                            case 2:
                                if (!(_i < tables_1.length)) return [3 /*break*/, 5];
                                tableName = tables_1[_i].name;
                                return [5 /*yield**/, _loop_1(tableName)];
                            case 3:
                                _a.sent();
                                _a.label = 4;
                            case 4:
                                _i++;
                                return [3 /*break*/, 2];
                            case 5:
                                slices.push(emptyExportJson.substr(posEndDataArray));
                                progress.done = true;
                                if (progressCallback) {
                                    // Keep ongoing transaction private
                                    Dexie__default["default"].ignoreTransaction(function () { return progressCallback(progress); });
                                }
                                return [2 /*return*/];
                        }
                    });
                });
            }
            var skipTables, targetTables, slices, tables, prettyJson, emptyExport, progressCallback, progress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = options || {};
                        skipTables = options.skipTables ? options.skipTables : [];
                        targetTables = db.tables.filter(function (x) { return !skipTables.includes(x.name); });
                        slices = [];
                        tables = targetTables.map(function (table) { return ({
                            name: table.name,
                            schema: getSchemaString(table),
                            rowCount: 0
                        }); });
                        prettyJson = options.prettyJson;
                        emptyExport = {
                            formatName: "dexie",
                            formatVersion: 1,
                            data: {
                                databaseName: db.name,
                                databaseVersion: db.verno,
                                tables: tables,
                                data: []
                            }
                        };
                        progressCallback = options.progressCallback;
                        progress = {
                            done: false,
                            completedRows: 0,
                            completedTables: 0,
                            totalRows: NaN,
                            totalTables: tables.length
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 6, 7]);
                        if (!options.noTransaction) return [3 /*break*/, 3];
                        return [4 /*yield*/, exportAll()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.transaction('r', db.tables, exportAll)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        TSON.finalize(); // Free up mem if error has occurred
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/, new Blob(slices, { type: "text/json" })];
                }
            });
        });
    }

    var VERSION = 1;

    var fakeStream = {Stream: function(){}};

    var clarinet_1 = createCommonjsModule(function (module, exports) {
    (function (clarinet) {

      // non node-js needs to set clarinet debug on root
      var env =(typeof process === 'object' && process.env)
        ? process.env
        : self;

      clarinet.parser            = function (opt) { return new CParser(opt);};
      clarinet.CParser           = CParser;
      clarinet.CStream           = CStream;
      clarinet.createStream      = createStream;
      clarinet.MAX_BUFFER_LENGTH = 10 * 1024 * 1024;
      clarinet.DEBUG             = (env.CDEBUG==='debug');
      clarinet.INFO              = (env.CDEBUG==='debug' || env.CDEBUG==='info');
      clarinet.EVENTS            =
        [ "value"
        , "string"
        , "key"
        , "openobject"
        , "closeobject"
        , "openarray"
        , "closearray"
        , "error"
        , "end"
        , "ready"
        ];

      var buffers     = {
            textNode: undefined,
            numberNode: ""
        }
        , streamWraps = clarinet.EVENTS.filter(function (ev) {
              return ev !== "error" && ev !== "end";
            })
        , S           = 0
        , Stream
        ;

      clarinet.STATE =
        { BEGIN                             : S++
        , VALUE                             : S++ // general stuff
        , OPEN_OBJECT                       : S++ // {
        , CLOSE_OBJECT                      : S++ // }
        , OPEN_ARRAY                        : S++ // [
        , CLOSE_ARRAY                       : S++ // ]
        , TEXT_ESCAPE                       : S++ // \ stuff
        , STRING                            : S++ // ""
        , BACKSLASH                         : S++
        , END                               : S++ // No more stack
        , OPEN_KEY                          : S++ // , "a"
        , CLOSE_KEY                         : S++ // :
        , TRUE                              : S++ // r
        , TRUE2                             : S++ // u
        , TRUE3                             : S++ // e
        , FALSE                             : S++ // a
        , FALSE2                            : S++ // l
        , FALSE3                            : S++ // s
        , FALSE4                            : S++ // e
        , NULL                              : S++ // u
        , NULL2                             : S++ // l
        , NULL3                             : S++ // l
        , NUMBER_DECIMAL_POINT              : S++ // .
        , NUMBER_DIGIT                      : S++ // [0-9]
        };

      for (var s_ in clarinet.STATE) clarinet.STATE[clarinet.STATE[s_]] = s_;

      // switcharoo
      S = clarinet.STATE;

      const Char = {
        tab                 : 0x09,     // \t
        lineFeed            : 0x0A,     // \n
        carriageReturn      : 0x0D,     // \r
        space               : 0x20,     // " "

        doubleQuote         : 0x22,     // "
        plus                : 0x2B,     // +
        comma               : 0x2C,     // ,
        minus               : 0x2D,     // -
        period              : 0x2E,     // .

        _0                  : 0x30,     // 0
        _9                  : 0x39,     // 9

        colon               : 0x3A,     // :

        E                   : 0x45,     // E

        openBracket         : 0x5B,     // [
        backslash           : 0x5C,     // \
        closeBracket        : 0x5D,     // ]

        a                   : 0x61,     // a
        b                   : 0x62,     // b
        e                   : 0x65,     // e 
        f                   : 0x66,     // f
        l                   : 0x6C,     // l
        n                   : 0x6E,     // n
        r                   : 0x72,     // r
        s                   : 0x73,     // s
        t                   : 0x74,     // t
        u                   : 0x75,     // u

        openBrace           : 0x7B,     // {
        closeBrace          : 0x7D,     // }
      };

      if (!Object.create) {
        Object.create = function (o) {
          function f () { this["__proto__"] = o; }
          f.prototype = o;
          return new f;
        };
      }

      if (!Object.getPrototypeOf) {
        Object.getPrototypeOf = function (o) {
          return o["__proto__"];
        };
      }

      if (!Object.keys) {
        Object.keys = function (o) {
          var a = [];
          for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
          return a;
        };
      }

      function checkBufferLength (parser) {
        var maxAllowed = Math.max(clarinet.MAX_BUFFER_LENGTH, 10)
          , maxActual = 0
          ;
        for (var buffer in buffers) {
          var len = parser[buffer] === undefined ? 0 : parser[buffer].length;
          if (len > maxAllowed) {
            switch (buffer) {
              case "text":
                closeText(parser);
              break;

              default:
                error(parser, "Max buffer length exceeded: "+ buffer);
            }
          }
          maxActual = Math.max(maxActual, len);
        }
        parser.bufferCheckPosition = (clarinet.MAX_BUFFER_LENGTH - maxActual)
                                   + parser.position;
      }

      function clearBuffers (parser) {
        for (var buffer in buffers) {
          parser[buffer] = buffers[buffer];
        }
      }

      var stringTokenPattern = /[\\"\n]/g;

      function CParser (opt) {
        if (!(this instanceof CParser)) return new CParser (opt);

        var parser = this;
        clearBuffers(parser);
        parser.bufferCheckPosition = clarinet.MAX_BUFFER_LENGTH;
        parser.q        = parser.c = parser.p = "";
        parser.opt      = opt || {};
        parser.closed   = parser.closedRoot = parser.sawRoot = false;
        parser.tag      = parser.error = null;
        parser.state    = S.BEGIN;
        parser.stack    = new Array();
        // mostly just for error reporting
        parser.position = parser.column = 0;
        parser.line     = 1;
        parser.slashed  = false;
        parser.unicodeI = 0;
        parser.unicodeS = null;
        parser.depth    = 0;
        emit(parser, "onready");
      }

      CParser.prototype =
        { end    : function () { end(this); }
        , write  : write
        , resume : function () { this.error = null; return this; }
        , close  : function () { return this.write(null); }
        };

      try        { Stream = fakeStream.Stream; }
      catch (ex) { Stream = function () {}; }

      function createStream (opt) { return new CStream(opt); }

      function CStream (opt) {
        if (!(this instanceof CStream)) return new CStream(opt);

        this._parser = new CParser(opt);
        this.writable = true;
        this.readable = true;

        //var Buffer = this.Buffer || function Buffer () {}; // if we don't have Buffers, fake it so we can do `var instanceof Buffer` and not throw an error
        this.bytes_remaining = 0; // number of bytes remaining in multi byte utf8 char to read after split boundary
        this.bytes_in_sequence = 0; // bytes in multi byte utf8 char to read
        this.temp_buffs = { "2": new Buffer(2), "3": new Buffer(3), "4": new Buffer(4) }; // for rebuilding chars split before boundary is reached
        this.string = '';

        var me = this;
        Stream.apply(me);

        this._parser.onend = function () { me.emit("end"); };
        this._parser.onerror = function (er) {
          me.emit("error", er);
          me._parser.error = null;
        };

        streamWraps.forEach(function (ev) {
          Object.defineProperty(me, "on" + ev,
            { get          : function () { return me._parser["on" + ev]; }
            , set          : function (h) {
                if (!h) {
                  me.removeAllListeners(ev);
                  me._parser["on"+ev] = h;
                  return h;
                }
                me.on(ev, h);
              }
            , enumerable   : true
            , configurable : false
            });
        });
      }

      CStream.prototype = Object.create(Stream.prototype,
        { constructor: { value: CStream } });

      CStream.prototype.write = function (data) {
        data = new Buffer(data);
        for (var i = 0; i < data.length; i++) {
          var n = data[i];

          // check for carry over of a multi byte char split between data chunks
          // & fill temp buffer it with start of this data chunk up to the boundary limit set in the last iteration
          if (this.bytes_remaining > 0) {
            for (var j = 0; j < this.bytes_remaining; j++) {
              this.temp_buffs[this.bytes_in_sequence][this.bytes_in_sequence - this.bytes_remaining + j] = data[j];
            }
            this.string = this.temp_buffs[this.bytes_in_sequence].toString();
            this.bytes_in_sequence = this.bytes_remaining = 0;

            // move iterator forward by number of byte read during sequencing
            i = i + j - 1;

            // pass data to parser and move forward to parse rest of data
            this._parser.write(this.string);
            this.emit("data", this.string);
            continue;
          }

          // if no remainder bytes carried over, parse multi byte (>=128) chars one at a time
          if (this.bytes_remaining === 0 && n >= 128) {
            if ((n >= 194) && (n <= 223)) this.bytes_in_sequence = 2;
            if ((n >= 224) && (n <= 239)) this.bytes_in_sequence = 3;
            if ((n >= 240) && (n <= 244)) this.bytes_in_sequence = 4;
            if ((this.bytes_in_sequence + i) > data.length) { // if bytes needed to complete char fall outside data length, we have a boundary split

              for (var k = 0; k <= (data.length - 1 - i); k++) {
                this.temp_buffs[this.bytes_in_sequence][k] = data[i + k]; // fill temp data of correct size with bytes available in this chunk
              }
              this.bytes_remaining = (i + this.bytes_in_sequence) - data.length;

              // immediately return as we need another chunk to sequence the character
              return true;
            } else {
              this.string = data.slice(i, (i + this.bytes_in_sequence)).toString();
              i = i + this.bytes_in_sequence - 1;

              this._parser.write(this.string);
              this.emit("data", this.string);
              continue;
            }
          }

          // is there a range of characters that are immediately parsable?
          for (var p = i; p < data.length; p++) {
            if (data[p] >= 128) break;
          }
          this.string = data.slice(i, p).toString();
          this._parser.write(this.string);
          this.emit("data", this.string);
          i = p - 1;

          // handle any remaining characters using multibyte logic
          continue;
        }
      };

      CStream.prototype.end = function (chunk) {
        if (chunk && chunk.length) this._parser.write(chunk.toString());
        this._parser.end();
        return true;
      };

      CStream.prototype.on = function (ev, handler) {
        var me = this;
        if (!me._parser["on"+ev] && streamWraps.indexOf(ev) !== -1) {
          me._parser["on"+ev] = function () {
            var args = arguments.length === 1 ? [arguments[0]]
                     : Array.apply(null, arguments);
            args.splice(0, 0, ev);
            me.emit.apply(me, args);
          };
        }
        return Stream.prototype.on.call(me, ev, handler);
      };

      CStream.prototype.destroy = function () {
        clearBuffers(this._parser);
        this.emit("close");
      };

      function emit(parser, event, data) {
        if(clarinet.INFO) console.log('-- emit', event, data);
        if (parser[event]) parser[event](data);
      }

      function emitNode(parser, event, data) {
        closeValue(parser);
        emit(parser, event, data);
      }

      function closeValue(parser, event) {
        parser.textNode = textopts(parser.opt, parser.textNode);
        if (parser.textNode !== undefined) {
          emit(parser, (event ? event : "onvalue"), parser.textNode);
        }
        parser.textNode = undefined;
      }

      function closeNumber(parser) {
        if (parser.numberNode)
          emit(parser, "onvalue", parseFloat(parser.numberNode));
        parser.numberNode = "";
      }

      function textopts (opt, text) {
        if (text === undefined) {
          return text;
        }
        if (opt.trim) text = text.trim();
        if (opt.normalize) text = text.replace(/\s+/g, " ");
        return text;
      }

      function error (parser, er) {
        closeValue(parser);
        er += "\nLine: "+parser.line+
              "\nColumn: "+parser.column+
              "\nChar: "+parser.c;
        er = new Error(er);
        parser.error = er;
        emit(parser, "onerror", er);
        return parser;
      }

      function end(parser) {
        if (parser.state !== S.VALUE || parser.depth !== 0)
          error(parser, "Unexpected end");

        closeValue(parser);
        parser.c      = "";
        parser.closed = true;
        emit(parser, "onend");
        CParser.call(parser, parser.opt);
        return parser;
      }

      function isWhitespace(c) {
        return c === Char.carriageReturn || c === Char.lineFeed || c === Char.space || c === Char.tab;
      }

      function write (chunk) {
        var parser = this;
        if (this.error) throw this.error;
        if (parser.closed) return error(parser,
          "Cannot write after close. Assign an onready handler.");
        if (chunk === null) return end(parser);
        var i = 0, c = chunk.charCodeAt(0), p = parser.p;
        if (clarinet.DEBUG) console.log('write -> [' + chunk + ']');
        while (c) {
          p = c;
          parser.c = c = chunk.charCodeAt(i++);
          // if chunk doesnt have next, like streaming char by char
          // this way we need to check if previous is really previous
          // if not we need to reset to what the parser says is the previous
          // from buffer
          if(p !== c ) parser.p = p;
          else p = parser.p;

          if(!c) break;

          if (clarinet.DEBUG) console.log(i,c,clarinet.STATE[parser.state]);
          parser.position ++;
          if (c === Char.lineFeed) {
            parser.line ++;
            parser.column = 0;
          } else parser.column ++;
          switch (parser.state) {

            case S.BEGIN:
              if (c === Char.openBrace) parser.state = S.OPEN_OBJECT;
              else if (c === Char.openBracket) parser.state = S.OPEN_ARRAY;
              else if (!isWhitespace(c))
                error(parser, "Non-whitespace before {[.");
            continue;

            case S.OPEN_KEY:
            case S.OPEN_OBJECT:
              if (isWhitespace(c)) continue;
              if(parser.state === S.OPEN_KEY) parser.stack.push(S.CLOSE_KEY);
              else {
                if(c === Char.closeBrace) {
                  emit(parser, 'onopenobject');
                  this.depth++;
                  emit(parser, 'oncloseobject');
                  this.depth--;
                  parser.state = parser.stack.pop() || S.VALUE;
                  continue;
                } else  parser.stack.push(S.CLOSE_OBJECT);
              }
              if(c === Char.doubleQuote) parser.state = S.STRING;
              else error(parser, "Malformed object key should start with \"");
            continue;

            case S.CLOSE_KEY:
            case S.CLOSE_OBJECT:
              if (isWhitespace(c)) continue;
              (parser.state === S.CLOSE_KEY) ? 'key' : 'object';
              if(c === Char.colon) {
                if(parser.state === S.CLOSE_OBJECT) {
                  parser.stack.push(S.CLOSE_OBJECT);
                  closeValue(parser, 'onopenobject');
                   this.depth++;
                } else closeValue(parser, 'onkey');
                parser.state  = S.VALUE;
              } else if (c === Char.closeBrace) {
                emitNode(parser, 'oncloseobject');
                this.depth--;
                parser.state = parser.stack.pop() || S.VALUE;
              } else if(c === Char.comma) {
                if(parser.state === S.CLOSE_OBJECT)
                  parser.stack.push(S.CLOSE_OBJECT);
                closeValue(parser);
                parser.state  = S.OPEN_KEY;
              } else error(parser, 'Bad object');
            continue;

            case S.OPEN_ARRAY: // after an array there always a value
            case S.VALUE:
              if (isWhitespace(c)) continue;
              if(parser.state===S.OPEN_ARRAY) {
                emit(parser, 'onopenarray');
                this.depth++;
                parser.state = S.VALUE;
                if(c === Char.closeBracket) {
                  emit(parser, 'onclosearray');
                  this.depth--;
                  parser.state = parser.stack.pop() || S.VALUE;
                  continue;
                } else {
                  parser.stack.push(S.CLOSE_ARRAY);
                }
              }
                   if(c === Char.doubleQuote) parser.state = S.STRING;
              else if(c === Char.openBrace) parser.state = S.OPEN_OBJECT;
              else if(c === Char.openBracket) parser.state = S.OPEN_ARRAY;
              else if(c === Char.t) parser.state = S.TRUE;
              else if(c === Char.f) parser.state = S.FALSE;
              else if(c === Char.n) parser.state = S.NULL;
              else if(c === Char.minus) { // keep and continue
                parser.numberNode += "-";
              } else if(Char._0 <= c && c <= Char._9) {
                parser.numberNode += String.fromCharCode(c);
                parser.state = S.NUMBER_DIGIT;
              } else               error(parser, "Bad value");
            continue;

            case S.CLOSE_ARRAY:
              if(c === Char.comma) {
                parser.stack.push(S.CLOSE_ARRAY);
                closeValue(parser, 'onvalue');
                parser.state  = S.VALUE;
              } else if (c === Char.closeBracket) {
                emitNode(parser, 'onclosearray');
                this.depth--;
                parser.state = parser.stack.pop() || S.VALUE;
              } else if (isWhitespace(c))
                  continue;
              else error(parser, 'Bad array');
            continue;

            case S.STRING:
              if (parser.textNode === undefined) {
                parser.textNode = "";
              }

              // thanks thejh, this is an about 50% performance improvement.
              var starti              = i-1
                , slashed = parser.slashed
                , unicodeI = parser.unicodeI
                ;
              STRING_BIGLOOP: while (true) {
                if (clarinet.DEBUG)
                  console.log(i,c,clarinet.STATE[parser.state]
                             ,slashed);
                // zero means "no unicode active". 1-4 mean "parse some more". end after 4.
                while (unicodeI > 0) {
                  parser.unicodeS += String.fromCharCode(c);
                  c = chunk.charCodeAt(i++);
                  parser.position++;
                  if (unicodeI === 4) {
                    // TODO this might be slow? well, probably not used too often anyway
                    parser.textNode += String.fromCharCode(parseInt(parser.unicodeS, 16));
                    unicodeI = 0;
                    starti = i-1;
                  } else {
                    unicodeI++;
                  }
                  // we can just break here: no stuff we skipped that still has to be sliced out or so
                  if (!c) break STRING_BIGLOOP;
                }
                if (c === Char.doubleQuote && !slashed) {
                  parser.state = parser.stack.pop() || S.VALUE;
                  parser.textNode += chunk.substring(starti, i-1);
                  parser.position += i - 1 - starti;
                  break;
                }
                if (c === Char.backslash && !slashed) {
                  slashed = true;
                  parser.textNode += chunk.substring(starti, i-1);
                  parser.position += i - 1 - starti;
                  c = chunk.charCodeAt(i++);
                  parser.position++;
                  if (!c) break;
                }
                if (slashed) {
                  slashed = false;
                       if (c === Char.n) { parser.textNode += '\n'; }
                  else if (c === Char.r) { parser.textNode += '\r'; }
                  else if (c === Char.t) { parser.textNode += '\t'; }
                  else if (c === Char.f) { parser.textNode += '\f'; }
                  else if (c === Char.b) { parser.textNode += '\b'; }
                  else if (c === Char.u) {
                    // \uxxxx. meh!
                    unicodeI = 1;
                    parser.unicodeS = '';
                  } else {
                    parser.textNode += String.fromCharCode(c);
                  }
                  c = chunk.charCodeAt(i++);
                  parser.position++;
                  starti = i-1;
                  if (!c) break;
                  else continue;
                }

                stringTokenPattern.lastIndex = i;
                var reResult = stringTokenPattern.exec(chunk);
                if (reResult === null) {
                  i = chunk.length+1;
                  parser.textNode += chunk.substring(starti, i-1);
                  parser.position += i - 1 - starti;
                  break;
                }
                i = reResult.index+1;
                c = chunk.charCodeAt(reResult.index);
                if (!c) {
                  parser.textNode += chunk.substring(starti, i-1);
                  parser.position += i - 1 - starti;
                  break;
                }
              }
              parser.slashed = slashed;
              parser.unicodeI = unicodeI;
            continue;

            case S.TRUE:
              if (c === Char.r) parser.state = S.TRUE2;
              else error(parser, 'Invalid true started with t'+ c);
            continue;

            case S.TRUE2:
              if (c === Char.u) parser.state = S.TRUE3;
              else error(parser, 'Invalid true started with tr'+ c);
            continue;

            case S.TRUE3:
              if(c === Char.e) {
                emit(parser, "onvalue", true);
                parser.state = parser.stack.pop() || S.VALUE;
              } else error(parser, 'Invalid true started with tru'+ c);
            continue;

            case S.FALSE:
              if (c === Char.a) parser.state = S.FALSE2;
              else error(parser, 'Invalid false started with f'+ c);
            continue;

            case S.FALSE2:
              if (c === Char.l) parser.state = S.FALSE3;
              else error(parser, 'Invalid false started with fa'+ c);
            continue;

            case S.FALSE3:
              if (c === Char.s) parser.state = S.FALSE4;
              else error(parser, 'Invalid false started with fal'+ c);
            continue;

            case S.FALSE4:
              if (c === Char.e) {
                emit(parser, "onvalue", false);
                parser.state = parser.stack.pop() || S.VALUE;
              } else error(parser, 'Invalid false started with fals'+ c);
            continue;

            case S.NULL:
              if (c === Char.u) parser.state = S.NULL2;
              else error(parser, 'Invalid null started with n'+ c);
            continue;

            case S.NULL2:
              if (c === Char.l) parser.state = S.NULL3;
              else error(parser, 'Invalid null started with nu'+ c);
            continue;

            case S.NULL3:
              if(c === Char.l) {
                emit(parser, "onvalue", null);
                parser.state = parser.stack.pop() || S.VALUE;
              } else error(parser, 'Invalid null started with nul'+ c);
            continue;

            case S.NUMBER_DECIMAL_POINT:
              if(c === Char.period) {
                parser.numberNode += ".";
                parser.state       = S.NUMBER_DIGIT;
              } else error(parser, 'Leading zero not followed by .');
            continue;

            case S.NUMBER_DIGIT:
              if(Char._0 <= c && c <= Char._9) parser.numberNode += String.fromCharCode(c);
              else if (c === Char.period) {
                if(parser.numberNode.indexOf('.')!==-1)
                  error(parser, 'Invalid number has two dots');
                parser.numberNode += ".";
              } else if (c === Char.e || c === Char.E) {
                if(parser.numberNode.indexOf('e')!==-1 ||
                   parser.numberNode.indexOf('E')!==-1 )
                   error(parser, 'Invalid number has two exponential');
                parser.numberNode += "e";
              } else if (c === Char.plus || c === Char.minus) {
                if(!(p === Char.e || p === Char.E))
                  error(parser, 'Invalid symbol in number');
                parser.numberNode += String.fromCharCode(c);
              } else {
                closeNumber(parser);
                i--; // go back one
                parser.state = parser.stack.pop() || S.VALUE;
              }
            continue;

            default:
              error(parser, "Unknown state: " + parser.state);
          }
        }
        if (parser.position >= parser.bufferCheckPosition)
          checkBufferLength(parser);
        return parser;
      }

    })(exports);
    });

    function JsonStream(blob) {
        var pos = 0;
        var parser = JsonParser(true);
        var rv = {
            pullAsync: function (numBytes) {
                return __awaiter(this, void 0, void 0, function () {
                    var slize, jsonPart, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                slize = blob.slice(pos, pos + numBytes);
                                pos += numBytes;
                                return [4 /*yield*/, readBlobAsync(slize, 'text')];
                            case 1:
                                jsonPart = _a.sent();
                                result = parser.write(jsonPart);
                                rv.result = result || {};
                                return [2 /*return*/, result];
                        }
                    });
                });
            },
            pullSync: function (numBytes) {
                var slize = blob.slice(pos, pos + numBytes);
                pos += numBytes;
                var jsonPart = readBlobSync(slize, 'text');
                var result = parser.write(jsonPart);
                rv.result = result || {};
                return result;
            },
            done: function () {
                return parser.done();
            },
            eof: function () {
                return pos >= blob.size;
            },
            result: {}
        };
        return rv;
    }
    function JsonParser(allowPartial) {
        var parser = clarinet_1.parser();
        var level = 0;
        var result;
        var stack = [];
        var obj;
        var key;
        var done = false;
        var array = false;
        parser.onopenobject = function (newKey) {
            var newObj = {};
            newObj.incomplete = true;
            if (!result)
                result = newObj;
            if (obj) {
                stack.push([key, obj, array]);
                if (allowPartial) {
                    if (array) {
                        obj.push(newObj);
                    }
                    else {
                        obj[key] = newObj;
                    }
                }
            }
            obj = newObj;
            key = newKey;
            array = false;
            ++level;
        };
        parser.onkey = function (newKey) { return key = newKey; };
        parser.onvalue = function (value) { return array ? obj.push(value) : obj[key] = value; };
        parser.oncloseobject = function () {
            var _a;
            delete obj.incomplete;
            key = null;
            if (--level === 0) {
                done = true;
            }
            else {
                var completedObj = obj;
                _a = stack.pop(), key = _a[0], obj = _a[1], array = _a[2];
                if (!allowPartial) {
                    if (array) {
                        obj.push(completedObj);
                    }
                    else {
                        obj[key] = completedObj;
                    }
                }
            }
        };
        parser.onopenarray = function () {
            var newObj = [];
            newObj.incomplete = true;
            if (!result)
                result = newObj;
            if (obj) {
                stack.push([key, obj, array]);
                if (allowPartial) {
                    if (array) {
                        obj.push(newObj);
                    }
                    else {
                        obj[key] = newObj;
                    }
                }
            }
            obj = newObj;
            array = true;
            key = null;
            ++level;
        };
        parser.onclosearray = function () {
            var _a;
            delete obj.incomplete;
            key = null;
            if (--level === 0) {
                done = true;
            }
            else {
                var completedObj = obj;
                _a = stack.pop(), key = _a[0], obj = _a[1], array = _a[2];
                if (!allowPartial) {
                    if (array) {
                        obj.push(completedObj);
                    }
                    else {
                        obj[key] = completedObj;
                    }
                }
            }
        };
        return {
            write: function (jsonPart) {
                parser.write(jsonPart);
                return result;
            },
            done: function () {
                return done;
            }
        };
    }

    var DEFAULT_KILOBYTES_PER_CHUNK = 1024;
    function importDB(exportedData, options) {
        return __awaiter(this, void 0, void 0, function () {
            var CHUNK_SIZE, stream, dbExport, db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = options || {}; // All booleans defaults to false.
                        CHUNK_SIZE = options.chunkSizeBytes || (DEFAULT_KILOBYTES_PER_CHUNK * 1024);
                        return [4 /*yield*/, loadUntilWeGotEnoughData(exportedData, CHUNK_SIZE)];
                    case 1:
                        stream = _a.sent();
                        dbExport = stream.result.data;
                        db = new Dexie__default["default"](dbExport.databaseName);
                        db.version(dbExport.databaseVersion).stores(extractDbSchema(dbExport));
                        return [4 /*yield*/, importInto(db, stream, options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, db];
                }
            });
        });
    }
    function peakImportFile(exportedData) {
        return __awaiter(this, void 0, void 0, function () {
            var stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stream = JsonStream(exportedData);
                        _a.label = 1;
                    case 1:
                        if (!!stream.eof()) return [3 /*break*/, 3];
                        return [4 /*yield*/, stream.pullAsync(5 * 1024)];
                    case 2:
                        _a.sent(); // 5 k is normally enough for the headers. If not, it will just do another go.
                        if (stream.result.data && stream.result.data.data) {
                            // @ts-ignore - TS won't allow us to delete a required property - but we are going to cast it.
                            delete stream.result.data.data; // Don't return half-baked data array.
                            return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, stream.result];
                }
            });
        });
    }
    function importInto(db, exportedData, options) {
        return __awaiter(this, void 0, void 0, function () {
            function importAll() {
                return __awaiter(this, void 0, void 0, function () {
                    var _loop_1, _i, _a, tableExport, state_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _loop_1 = function (tableExport) {
                                    var tableName, table, tableSchemaStr, sourceRows, rows, i, obj, filter, transform, filteredRows, _c, keys, values;
                                    return __generator(this, function (_d) {
                                        switch (_d.label) {
                                            case 0:
                                                if (skipTables.includes(tableExport.tableName))
                                                    return [2 /*return*/, "continue"];
                                                if (!tableExport.rows)
                                                    return [2 /*return*/, "break"]; // Need to pull more!
                                                if (!tableExport.rows.incomplete && tableExport.rows.length === 0)
                                                    return [2 /*return*/, "continue"];
                                                if (progressCallback) {
                                                    // Keep ongoing transaction private
                                                    Dexie__default["default"].ignoreTransaction(function () { return progressCallback(progress); });
                                                }
                                                tableName = tableExport.tableName;
                                                table = db.table(tableName);
                                                tableSchemaStr = dbExport.tables.filter(function (t) { return t.name === tableName; })[0].schema;
                                                if (!table) {
                                                    if (!options.acceptMissingTables)
                                                        throw new Error("Exported table ".concat(tableExport.tableName, " is missing in installed database"));
                                                    else
                                                        return [2 /*return*/, "continue"];
                                                }
                                                if (!options.acceptChangedPrimaryKey &&
                                                    tableSchemaStr.split(',')[0] != table.schema.primKey.src) {
                                                    throw new Error("Primary key differs for table ".concat(tableExport.tableName, ". "));
                                                }
                                                sourceRows = tableExport.rows;
                                                rows = [];
                                                for (i = 0; i < sourceRows.length; i++) {
                                                    obj = sourceRows[i];
                                                    if (!obj.incomplete) {
                                                        rows.push(TSON.revive(obj));
                                                    }
                                                    else {
                                                        break;
                                                    }
                                                }
                                                filter = options.filter;
                                                transform = options.transform;
                                                filteredRows = filter ?
                                                    tableExport.inbound ?
                                                        rows.filter(function (value) { return filter(tableName, value); }) :
                                                        rows.filter(function (_a) {
                                                            var key = _a[0], value = _a[1];
                                                            return filter(tableName, value, key);
                                                        }) :
                                                    rows;
                                                if (transform) {
                                                    filteredRows = filteredRows.map(tableExport.inbound ?
                                                        function (value) { return transform(tableName, value).value; } :
                                                        function (_a) {
                                                            var key = _a[0], value = _a[1];
                                                            var res = transform(tableName, value, key);
                                                            return [res.key, res.value];
                                                        });
                                                }
                                                _c = tableExport.inbound ?
                                                    [undefined, filteredRows] :
                                                    [filteredRows.map(function (row) { return row[0]; }), rows.map(function (row) { return row[1]; })], keys = _c[0], values = _c[1];
                                                if (!options.overwriteValues) return [3 /*break*/, 2];
                                                return [4 /*yield*/, table.bulkPut(values, keys)];
                                            case 1:
                                                _d.sent();
                                                return [3 /*break*/, 4];
                                            case 2: return [4 /*yield*/, table.bulkAdd(values, keys)];
                                            case 3:
                                                _d.sent();
                                                _d.label = 4;
                                            case 4:
                                                progress.completedRows += rows.length;
                                                if (!rows.incomplete) {
                                                    progress.completedTables += 1;
                                                }
                                                sourceRows.splice(0, rows.length); // Free up RAM, keep existing array instance.
                                                return [2 /*return*/];
                                        }
                                    });
                                };
                                _i = 0, _a = dbExport.data;
                                _b.label = 1;
                            case 1:
                                if (!(_i < _a.length)) return [3 /*break*/, 4];
                                tableExport = _a[_i];
                                return [5 /*yield**/, _loop_1(tableExport)];
                            case 2:
                                state_1 = _b.sent();
                                if (state_1 === "break")
                                    return [3 /*break*/, 4];
                                _b.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4:
                                // Avoid unnescessary loops in "for (const tableExport of dbExport.data)" 
                                while (dbExport.data.length > 0 && dbExport.data[0].rows && !dbExport.data[0].rows.incomplete) {
                                    // We've already imported all rows from the first table. Delete its occurrence
                                    dbExport.data.splice(0, 1);
                                }
                                if (!(!jsonStream.done() && !jsonStream.eof())) return [3 /*break*/, 8];
                                if (!readBlobsSynchronously) return [3 /*break*/, 5];
                                // If we can pull from blob synchronically, we don't have to
                                // keep transaction alive using Dexie.waitFor().
                                // This will only be possible in workers.
                                jsonStream.pullSync(CHUNK_SIZE);
                                return [3 /*break*/, 7];
                            case 5: return [4 /*yield*/, Dexie__default["default"].waitFor(jsonStream.pullAsync(CHUNK_SIZE))];
                            case 6:
                                _b.sent();
                                _b.label = 7;
                            case 7: return [3 /*break*/, 9];
                            case 8: return [3 /*break*/, 10];
                            case 9:
                                return [3 /*break*/, 0];
                            case 10: return [2 /*return*/];
                        }
                    });
                });
            }
            var CHUNK_SIZE, jsonStream, dbExportFile, readBlobsSynchronously, dbExport, skipTables, progressCallback, progress, _i, _a, table;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        options = options || {}; // All booleans defaults to false.
                        CHUNK_SIZE = options.chunkSizeBytes || (DEFAULT_KILOBYTES_PER_CHUNK * 1024);
                        return [4 /*yield*/, loadUntilWeGotEnoughData(exportedData, CHUNK_SIZE)];
                    case 1:
                        jsonStream = _b.sent();
                        dbExportFile = jsonStream.result;
                        readBlobsSynchronously = 'FileReaderSync' in self;
                        dbExport = dbExportFile.data;
                        skipTables = options.skipTables ? options.skipTables : [];
                        if (!options.acceptNameDiff && db.name !== dbExport.databaseName)
                            throw new Error("Name differs. Current database name is ".concat(db.name, " but export is ").concat(dbExport.databaseName));
                        if (!options.acceptVersionDiff && db.verno !== dbExport.databaseVersion) {
                            // Possible feature: Call upgraders in some isolated way if this happens... ?
                            throw new Error("Database version differs. Current database is in version ".concat(db.verno, " but export is ").concat(dbExport.databaseVersion));
                        }
                        progressCallback = options.progressCallback;
                        progress = {
                            done: false,
                            completedRows: 0,
                            completedTables: 0,
                            totalRows: dbExport.tables.reduce(function (p, c) { return p + c.rowCount; }, 0),
                            totalTables: dbExport.tables.length
                        };
                        if (progressCallback) {
                            // Keep ongoing transaction private
                            Dexie__default["default"].ignoreTransaction(function () { return progressCallback(progress); });
                        }
                        if (!options.clearTablesBeforeImport) return [3 /*break*/, 5];
                        _i = 0, _a = db.tables;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        table = _a[_i];
                        if (skipTables.includes(table.name))
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, table.clear()];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        if (!options.noTransaction) return [3 /*break*/, 7];
                        return [4 /*yield*/, importAll()];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, db.transaction('rw', db.tables, importAll)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        progress.done = true;
                        if (progressCallback) {
                            // Keep ongoing transaction private
                            Dexie__default["default"].ignoreTransaction(function () { return progressCallback(progress); });
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    function loadUntilWeGotEnoughData(exportedData, CHUNK_SIZE) {
        return __awaiter(this, void 0, void 0, function () {
            var stream, dbExportFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stream = ('slice' in exportedData ?
                            JsonStream(exportedData) :
                            exportedData);
                        _a.label = 1;
                    case 1:
                        if (!!stream.eof()) return [3 /*break*/, 3];
                        return [4 /*yield*/, stream.pullAsync(CHUNK_SIZE)];
                    case 2:
                        _a.sent();
                        if (stream.result.data && stream.result.data.data)
                            return [3 /*break*/, 3];
                        return [3 /*break*/, 1];
                    case 3:
                        dbExportFile = stream.result;
                        if (!dbExportFile || dbExportFile.formatName != "dexie")
                            throw new Error("Given file is not a dexie export");
                        if (dbExportFile.formatVersion > VERSION) {
                            throw new Error("Format version ".concat(dbExportFile.formatVersion, " not supported"));
                        }
                        if (!dbExportFile.data) {
                            throw new Error("No data in export file");
                        }
                        if (!dbExportFile.data.databaseName) {
                            throw new Error("Missing databaseName in export file");
                        }
                        if (!dbExportFile.data.databaseVersion) {
                            throw new Error("Missing databaseVersion in export file");
                        }
                        if (!dbExportFile.data.tables) {
                            throw new Error("Missing tables in export file");
                        }
                        return [2 /*return*/, stream];
                }
            });
        });
    }

    //
    // Extend Dexie interface (runtime wise)
    //
    Dexie__default["default"].prototype.export = function (options) {
        return exportDB(this, options);
    };
    Dexie__default["default"].prototype.import = function (blob, options) {
        return importInto(this, blob, options);
    };
    Dexie__default["default"].import = function (blob, options) { return importDB(blob, options); };
    var dexieExportImport = (function () {
        throw new Error("This addon extends Dexie.prototype globally and does not have be included in Dexie constructor's addons options.");
    });

    exports["default"] = dexieExportImport;
    exports.exportDB = exportDB;
    exports.importDB = importDB;
    exports.importInto = importInto;
    exports.peakImportFile = peakImportFile;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=dexie-export-import.js.map










/**
 * marked v4.2.12 - a markdown parser
 * Copyright (c) 2011-2023, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).marked={})}(this,function(r){"use strict";function i(e,t){for(var u=0;u<t.length;u++){var n=t[u];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,function(e){e=function(e,t){if("object"!=typeof e||null===e)return e;var u=e[Symbol.toPrimitive];if(void 0===u)return("string"===t?String:Number)(e);u=u.call(e,t||"default");if("object"!=typeof u)return u;throw new TypeError("@@toPrimitive must return a primitive value.")}(e,"string");return"symbol"==typeof e?e:String(e)}(n.key),n)}}function s(e,t){(null==t||t>e.length)&&(t=e.length);for(var u=0,n=new Array(t);u<t;u++)n[u]=e[u];return n}function D(e,t){var u,n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(n)return(n=n.call(e)).next.bind(n);if(Array.isArray(e)||(n=function(e,t){var u;if(e)return"string"==typeof e?s(e,t):"Map"===(u="Object"===(u=Object.prototype.toString.call(e).slice(8,-1))&&e.constructor?e.constructor.name:u)||"Set"===u?Array.from(e):"Arguments"===u||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(u)?s(e,t):void 0}(e))||t&&e&&"number"==typeof e.length)return n&&(e=n),u=0,function(){return u>=e.length?{done:!0}:{done:!1,value:e[u++]}};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function e(){return{async:!1,baseUrl:null,breaks:!1,extensions:null,gfm:!0,headerIds:!0,headerPrefix:"",highlight:null,langPrefix:"language-",mangle:!0,pedantic:!1,renderer:null,sanitize:!1,sanitizer:null,silent:!1,smartypants:!1,tokenizer:null,walkTokens:null,xhtml:!1}}r.defaults=e();function u(e){return t[e]}var n=/[&<>"']/,l=new RegExp(n.source,"g"),a=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,o=new RegExp(a.source,"g"),t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function c(e,t){if(t){if(n.test(e))return e.replace(l,u)}else if(a.test(e))return e.replace(o,u);return e}var h=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;function x(e){return e.replace(h,function(e,t){return"colon"===(t=t.toLowerCase())?":":"#"===t.charAt(0)?"x"===t.charAt(1)?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""})}var p=/(^|[^\[])\^/g;function f(u,e){u="string"==typeof u?u:u.source,e=e||"";var n={replace:function(e,t){return t=(t=t.source||t).replace(p,"$1"),u=u.replace(e,t),n},getRegex:function(){return new RegExp(u,e)}};return n}var g=/[^\w:]/g,Z=/^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;function F(e,t,u){if(e){try{n=decodeURIComponent(x(u)).replace(g,"").toLowerCase()}catch(e){return null}if(0===n.indexOf("javascript:")||0===n.indexOf("vbscript:")||0===n.indexOf("data:"))return null}var n;t&&!Z.test(u)&&(e=u,A[" "+(n=t)]||(q.test(n)?A[" "+n]=n+"/":A[" "+n]=E(n,"/",!0)),t=-1===(n=A[" "+n]).indexOf(":"),u="//"===e.substring(0,2)?t?e:n.replace(O,"$1")+e:"/"===e.charAt(0)?t?e:n.replace(j,"$1")+e:n+e);try{u=encodeURI(u).replace(/%25/g,"%")}catch(e){return null}return u}var A={},q=/^[^:]+:\/*[^/]*$/,O=/^([^:]+:)[\s\S]*$/,j=/^([^:]+:\/*[^/]*)[\s\S]*$/;var d={exec:function(){}};function C(e){for(var t,u,n=1;n<arguments.length;n++)for(u in t=arguments[n])Object.prototype.hasOwnProperty.call(t,u)&&(e[u]=t[u]);return e}function k(e,t){var u=e.replace(/\|/g,function(e,t,u){for(var n=!1,r=t;0<=--r&&"\\"===u[r];)n=!n;return n?"|":" |"}).split(/ \|/),n=0;if(u[0].trim()||u.shift(),0<u.length&&!u[u.length-1].trim()&&u.pop(),u.length>t)u.splice(t);else for(;u.length<t;)u.push("");for(;n<u.length;n++)u[n]=u[n].trim().replace(/\\\|/g,"|");return u}function E(e,t,u){var n=e.length;if(0===n)return"";for(var r=0;r<n;){var i=e.charAt(n-r-1);if((i!==t||u)&&(i===t||!u))break;r++}return e.slice(0,n-r)}function m(e){e&&e.sanitize&&!e.silent&&console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options")}function b(e,t){if(t<1)return"";for(var u="";1<t;)1&t&&(u+=e),t>>=1,e+=e;return u+e}function B(e,t,u,n){var r=t.href,t=t.title?c(t.title):null,i=e[1].replace(/\\([\[\]])/g,"$1");return"!"!==e[0].charAt(0)?(n.state.inLink=!0,e={type:"link",raw:u,href:r,title:t,text:i,tokens:n.inlineTokens(i)},n.state.inLink=!1,e):{type:"image",raw:u,href:r,title:t,text:c(i)}}var w=function(){function e(e){this.options=e||r.defaults}var t=e.prototype;return t.space=function(e){e=this.rules.block.newline.exec(e);if(e&&0<e[0].length)return{type:"space",raw:e[0]}},t.code=function(e){var t,e=this.rules.block.code.exec(e);if(e)return t=e[0].replace(/^ {1,4}/gm,""),{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?t:E(t,"\n")}},t.fences=function(e){var t,u,n,r,e=this.rules.block.fences.exec(e);if(e)return t=e[0],u=t,n=e[3]||"",u=null===(u=t.match(/^(\s+)(?:```)/))?n:(r=u[1],n.split("\n").map(function(e){var t=e.match(/^\s+/);return null!==t&&t[0].length>=r.length?e.slice(r.length):e}).join("\n")),{type:"code",raw:t,lang:e[2]&&e[2].trim().replace(this.rules.inline._escapes,"$1"),text:u}},t.heading=function(e){var t,u,e=this.rules.block.heading.exec(e);if(e)return t=e[2].trim(),/#$/.test(t)&&(u=E(t,"#"),!this.options.pedantic&&u&&!/ $/.test(u)||(t=u.trim())),{type:"heading",raw:e[0],depth:e[1].length,text:t,tokens:this.lexer.inline(t)}},t.hr=function(e){e=this.rules.block.hr.exec(e);if(e)return{type:"hr",raw:e[0]}},t.blockquote=function(e){var t,u,n,e=this.rules.block.blockquote.exec(e);if(e)return t=e[0].replace(/^ *>[ \t]?/gm,""),u=this.lexer.state.top,this.lexer.state.top=!0,n=this.lexer.blockTokens(t),this.lexer.state.top=u,{type:"blockquote",raw:e[0],tokens:n,text:t}},t.list=function(e){var t=this.rules.block.list.exec(e);if(t){var u,n,r,i,s,l,a,o,D,c,h,p=1<(g=t[1].trim()).length,f={type:"list",raw:"",ordered:p,start:p?+g.slice(0,-1):"",loose:!1,items:[]},g=p?"\\d{1,9}\\"+g.slice(-1):"\\"+g;this.options.pedantic&&(g=p?g:"[*+-]");for(var F=new RegExp("^( {0,3}"+g+")((?:[\t ][^\\n]*)?(?:\\n|$))");e&&(h=!1,t=F.exec(e))&&!this.rules.block.hr.test(e);){if(u=t[0],e=e.substring(u.length),a=t[2].split("\n",1)[0].replace(/^\t+/,function(e){return" ".repeat(3*e.length)}),o=e.split("\n",1)[0],this.options.pedantic?(i=2,c=a.trimLeft()):(i=t[2].search(/[^ ]/),c=a.slice(i=4<i?1:i),i+=t[1].length),s=!1,!a&&/^ *$/.test(o)&&(u+=o+"\n",e=e.substring(o.length+1),h=!0),!h)for(var A=new RegExp("^ {0,"+Math.min(3,i-1)+"}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))"),d=new RegExp("^ {0,"+Math.min(3,i-1)+"}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)"),C=new RegExp("^ {0,"+Math.min(3,i-1)+"}(?:```|~~~)"),k=new RegExp("^ {0,"+Math.min(3,i-1)+"}#");e&&(o=D=e.split("\n",1)[0],this.options.pedantic&&(o=o.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),!C.test(o))&&!k.test(o)&&!A.test(o)&&!d.test(e);){if(o.search(/[^ ]/)>=i||!o.trim())c+="\n"+o.slice(i);else{if(s)break;if(4<=a.search(/[^ ]/))break;if(C.test(a))break;if(k.test(a))break;if(d.test(a))break;c+="\n"+o}s||o.trim()||(s=!0),u+=D+"\n",e=e.substring(D.length+1),a=o.slice(i)}f.loose||(l?f.loose=!0:/\n *\n *$/.test(u)&&(l=!0)),this.options.gfm&&(n=/^\[[ xX]\] /.exec(c))&&(r="[ ] "!==n[0],c=c.replace(/^\[[ xX]\] +/,"")),f.items.push({type:"list_item",raw:u,task:!!n,checked:r,loose:!1,text:c}),f.raw+=u}f.items[f.items.length-1].raw=u.trimRight(),f.items[f.items.length-1].text=c.trimRight(),f.raw=f.raw.trimRight();for(var E,x=f.items.length,m=0;m<x;m++)this.lexer.state.top=!1,f.items[m].tokens=this.lexer.blockTokens(f.items[m].text,[]),f.loose||(E=0<(E=f.items[m].tokens.filter(function(e){return"space"===e.type})).length&&E.some(function(e){return/\n.*\n/.test(e.raw)}),f.loose=E);if(f.loose)for(m=0;m<x;m++)f.items[m].loose=!0;return f}},t.html=function(e){var t,e=this.rules.block.html.exec(e);if(e)return t={type:"html",raw:e[0],pre:!this.options.sanitizer&&("pre"===e[1]||"script"===e[1]||"style"===e[1]),text:e[0]},this.options.sanitize&&(e=this.options.sanitizer?this.options.sanitizer(e[0]):c(e[0]),t.type="paragraph",t.text=e,t.tokens=this.lexer.inline(e)),t},t.def=function(e){var t,u,n,e=this.rules.block.def.exec(e);if(e)return t=e[1].toLowerCase().replace(/\s+/g," "),u=e[2]?e[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline._escapes,"$1"):"",n=e[3]&&e[3].substring(1,e[3].length-1).replace(this.rules.inline._escapes,"$1"),{type:"def",tag:t,raw:e[0],href:u,title:n}},t.table=function(e){e=this.rules.block.table.exec(e);if(e){var t={type:"table",header:k(e[1]).map(function(e){return{text:e}}),align:e[2].replace(/^ *|\| *$/g,"").split(/ *\| */),rows:e[3]&&e[3].trim()?e[3].replace(/\n[ \t]*$/,"").split("\n"):[]};if(t.header.length===t.align.length){t.raw=e[0];for(var u,n,r,i=t.align.length,s=0;s<i;s++)/^ *-+: *$/.test(t.align[s])?t.align[s]="right":/^ *:-+: *$/.test(t.align[s])?t.align[s]="center":/^ *:-+ *$/.test(t.align[s])?t.align[s]="left":t.align[s]=null;for(i=t.rows.length,s=0;s<i;s++)t.rows[s]=k(t.rows[s],t.header.length).map(function(e){return{text:e}});for(i=t.header.length,u=0;u<i;u++)t.header[u].tokens=this.lexer.inline(t.header[u].text);for(i=t.rows.length,u=0;u<i;u++)for(r=t.rows[u],n=0;n<r.length;n++)r[n].tokens=this.lexer.inline(r[n].text);return t}}},t.lheading=function(e){e=this.rules.block.lheading.exec(e);if(e)return{type:"heading",raw:e[0],depth:"="===e[2].charAt(0)?1:2,text:e[1],tokens:this.lexer.inline(e[1])}},t.paragraph=function(e){var t,e=this.rules.block.paragraph.exec(e);if(e)return t="\n"===e[1].charAt(e[1].length-1)?e[1].slice(0,-1):e[1],{type:"paragraph",raw:e[0],text:t,tokens:this.lexer.inline(t)}},t.text=function(e){e=this.rules.block.text.exec(e);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}},t.escape=function(e){e=this.rules.inline.escape.exec(e);if(e)return{type:"escape",raw:e[0],text:c(e[1])}},t.tag=function(e){e=this.rules.inline.tag.exec(e);if(e)return!this.lexer.state.inLink&&/^<a /i.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:this.options.sanitize?"text":"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,text:this.options.sanitize?this.options.sanitizer?this.options.sanitizer(e[0]):c(e[0]):e[0]}},t.link=function(e){e=this.rules.inline.link.exec(e);if(e){var t=e[2].trim();if(!this.options.pedantic&&/^</.test(t)){if(!/>$/.test(t))return;var u=E(t.slice(0,-1),"\\");if((t.length-u.length)%2==0)return}else{u=function(e,t){if(-1!==e.indexOf(t[1]))for(var u=e.length,n=0,r=0;r<u;r++)if("\\"===e[r])r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&--n<0)return r;return-1}(e[2],"()");-1<u&&(r=(0===e[0].indexOf("!")?5:4)+e[1].length+u,e[2]=e[2].substring(0,u),e[0]=e[0].substring(0,r).trim(),e[3]="")}var n,u=e[2],r="";return this.options.pedantic?(n=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(u))&&(u=n[1],r=n[3]):r=e[3]?e[3].slice(1,-1):"",u=u.trim(),B(e,{href:(u=/^</.test(u)?this.options.pedantic&&!/>$/.test(t)?u.slice(1):u.slice(1,-1):u)&&u.replace(this.rules.inline._escapes,"$1"),title:r&&r.replace(this.rules.inline._escapes,"$1")},e[0],this.lexer)}},t.reflink=function(e,t){var u;if(u=(u=this.rules.inline.reflink.exec(e))||this.rules.inline.nolink.exec(e))return(e=t[(e=(u[2]||u[1]).replace(/\s+/g," ")).toLowerCase()])?B(u,e,u[0],this.lexer):{type:"text",raw:t=u[0].charAt(0),text:t}},t.emStrong=function(e,t,u){void 0===u&&(u="");var n=this.rules.inline.emStrong.lDelim.exec(e);if(n&&(!n[3]||!u.match(/(?:[0-9A-Za-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDF70-\uDF81\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDE70-\uDEBE\uDEC0-\uDEC9\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD837[\uDF00-\uDF1E]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD839[\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF38\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])/))){var r=n[1]||n[2]||"";if(!r||""===u||this.rules.inline.punctuation.exec(u)){var i=n[0].length-1,s=i,l=0,a="*"===n[0][0]?this.rules.inline.emStrong.rDelimAst:this.rules.inline.emStrong.rDelimUnd;for(a.lastIndex=0,t=t.slice(-1*e.length+i);null!=(n=a.exec(t));){var o,D=n[1]||n[2]||n[3]||n[4]||n[5]||n[6];if(D)if(o=D.length,n[3]||n[4])s+=o;else if((n[5]||n[6])&&i%3&&!((i+o)%3))l+=o;else if(!(0<(s-=o)))return o=Math.min(o,o+s+l),D=e.slice(0,i+n.index+(n[0].length-D.length)+o),Math.min(i,o)%2?(o=D.slice(1,-1),{type:"em",raw:D,text:o,tokens:this.lexer.inlineTokens(o)}):(o=D.slice(2,-2),{type:"strong",raw:D,text:o,tokens:this.lexer.inlineTokens(o)})}}}},t.codespan=function(e){var t,u,n,e=this.rules.inline.code.exec(e);if(e)return n=e[2].replace(/\n/g," "),t=/[^ ]/.test(n),u=/^ /.test(n)&&/ $/.test(n),n=c(n=t&&u?n.substring(1,n.length-1):n,!0),{type:"codespan",raw:e[0],text:n}},t.br=function(e){e=this.rules.inline.br.exec(e);if(e)return{type:"br",raw:e[0]}},t.del=function(e){e=this.rules.inline.del.exec(e);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}},t.autolink=function(e,t){var u,e=this.rules.inline.autolink.exec(e);if(e)return t="@"===e[2]?"mailto:"+(u=c(this.options.mangle?t(e[1]):e[1])):u=c(e[1]),{type:"link",raw:e[0],text:u,href:t,tokens:[{type:"text",raw:u,text:u}]}},t.url=function(e,t){var u,n,r,i;if(u=this.rules.inline.url.exec(e)){if("@"===u[2])r="mailto:"+(n=c(this.options.mangle?t(u[0]):u[0]));else{for(;i=u[0],u[0]=this.rules.inline._backpedal.exec(u[0])[0],i!==u[0];);n=c(u[0]),r="www."===u[1]?"http://"+u[0]:u[0]}return{type:"link",raw:u[0],text:n,href:r,tokens:[{type:"text",raw:n,text:n}]}}},t.inlineText=function(e,t){e=this.rules.inline.text.exec(e);if(e)return t=this.lexer.state.inRawBlock?this.options.sanitize?this.options.sanitizer?this.options.sanitizer(e[0]):c(e[0]):e[0]:c(this.options.smartypants?t(e[0]):e[0]),{type:"text",raw:e[0],text:t}},e}(),y={newline:/^(?: *(?:\n|$))+/,code:/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,fences:/^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,hr:/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,heading:/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,blockquote:/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,list:/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,html:"^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",def:/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,table:d,lheading:/^((?:.|\n(?!\n))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,_paragraph:/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,text:/^[^\n]+/,_label:/(?!\s*\])(?:\\.|[^\[\]\\])+/,_title:/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/},v=(y.def=f(y.def).replace("label",y._label).replace("title",y._title).getRegex(),y.bullet=/(?:[*+-]|\d{1,9}[.)])/,y.listItemStart=f(/^( *)(bull) */).replace("bull",y.bullet).getRegex(),y.list=f(y.list).replace(/bull/g,y.bullet).replace("hr","\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def","\\n+(?="+y.def.source+")").getRegex(),y._tag="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",y._comment=/<!--(?!-?>)[\s\S]*?(?:-->|$)/,y.html=f(y.html,"i").replace("comment",y._comment).replace("tag",y._tag).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),y.paragraph=f(y._paragraph).replace("hr",y.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",y._tag).getRegex(),y.blockquote=f(y.blockquote).replace("paragraph",y.paragraph).getRegex(),y.normal=C({},y),y.gfm=C({},y.normal,{table:"^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"}),y.gfm.table=f(y.gfm.table).replace("hr",y.hr).replace("heading"," {0,3}#{1,6} ").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",y._tag).getRegex(),y.gfm.paragraph=f(y._paragraph).replace("hr",y.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("table",y.gfm.table).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",y._tag).getRegex(),y.pedantic=C({},y.normal,{html:f("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment",y._comment).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:d,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:f(y.normal._paragraph).replace("hr",y.hr).replace("heading"," *#{1,6} *[^\n]").replace("lheading",y.lheading).replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").getRegex()}),{escape:/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,autolink:/^<(scheme:[^\s\x00-\x1f<>]*|email)>/,url:d,tag:"^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",link:/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,reflink:/^!?\[(label)\]\[(ref)\]/,nolink:/^!?\[(ref)\](?:\[\])?/,reflinkSearch:"reflink|nolink(?!\\()",emStrong:{lDelim:/^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,rDelimAst:/^(?:[^_*\\]|\\.)*?\_\_(?:[^_*\\]|\\.)*?\*(?:[^_*\\]|\\.)*?(?=\_\_)|(?:[^*\\]|\\.)+(?=[^*])|[punct_](\*+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|(?:[^punct*_\s\\]|\\.)(\*+)(?=[^punct*_\s])/,rDelimUnd:/^(?:[^_*\\]|\\.)*?\*\*(?:[^_*\\]|\\.)*?\_(?:[^_*\\]|\\.)*?(?=\*\*)|(?:[^_\\]|\\.)+(?=[^_])|[punct*](\_+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/},code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,br:/^( {2,}|\\)\n(?!\s*$)/,del:d,text:/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,punctuation:/^([\spunctuation])/});function L(e){return e.replace(/---/g,"—").replace(/--/g,"–").replace(/(^|[-\u2014/(\[{"\s])'/g,"$1‘").replace(/'/g,"’").replace(/(^|[-\u2014/(\[{\u2018\s])"/g,"$1“").replace(/"/g,"”").replace(/\.{3}/g,"…")}function _(e){for(var t,u="",n=e.length,r=0;r<n;r++)t=e.charCodeAt(r),u+="&#"+(t=.5<Math.random()?"x"+t.toString(16):t)+";";return u}v._punctuation="!\"#$%&'()+\\-.,/:;<=>?@\\[\\]`^{|}~",v.punctuation=f(v.punctuation).replace(/punctuation/g,v._punctuation).getRegex(),v.blockSkip=/\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g,v.escapedEmSt=/(?:^|[^\\])(?:\\\\)*\\[*_]/g,v._comment=f(y._comment).replace("(?:--\x3e|$)","--\x3e").getRegex(),v.emStrong.lDelim=f(v.emStrong.lDelim).replace(/punct/g,v._punctuation).getRegex(),v.emStrong.rDelimAst=f(v.emStrong.rDelimAst,"g").replace(/punct/g,v._punctuation).getRegex(),v.emStrong.rDelimUnd=f(v.emStrong.rDelimUnd,"g").replace(/punct/g,v._punctuation).getRegex(),v._escapes=/\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g,v._scheme=/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/,v._email=/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/,v.autolink=f(v.autolink).replace("scheme",v._scheme).replace("email",v._email).getRegex(),v._attribute=/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/,v.tag=f(v.tag).replace("comment",v._comment).replace("attribute",v._attribute).getRegex(),v._label=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,v._href=/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/,v._title=/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/,v.link=f(v.link).replace("label",v._label).replace("href",v._href).replace("title",v._title).getRegex(),v.reflink=f(v.reflink).replace("label",v._label).replace("ref",y._label).getRegex(),v.nolink=f(v.nolink).replace("ref",y._label).getRegex(),v.reflinkSearch=f(v.reflinkSearch,"g").replace("reflink",v.reflink).replace("nolink",v.nolink).getRegex(),v.normal=C({},v),v.pedantic=C({},v.normal,{strong:{start:/^__|\*\*/,middle:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,endAst:/\*\*(?!\*)/g,endUnd:/__(?!_)/g},em:{start:/^_|\*/,middle:/^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,endAst:/\*(?!\*)/g,endUnd:/_(?!_)/g},link:f(/^!?\[(label)\]\((.*?)\)/).replace("label",v._label).getRegex(),reflink:f(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",v._label).getRegex()}),v.gfm=C({},v.normal,{escape:f(v.escape).replace("])","~|])").getRegex(),_extended_email:/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,url:/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/}),v.gfm.url=f(v.gfm.url,"i").replace("email",v.gfm._extended_email).getRegex(),v.breaks=C({},v.gfm,{br:f(v.br).replace("{2,}","*").getRegex(),text:f(v.gfm.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()});var z=function(){function u(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||r.defaults,this.options.tokenizer=this.options.tokenizer||new w,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,(this.tokenizer.lexer=this).inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};e={block:y.normal,inline:v.normal};this.options.pedantic?(e.block=y.pedantic,e.inline=v.pedantic):this.options.gfm&&(e.block=y.gfm,this.options.breaks?e.inline=v.breaks:e.inline=v.gfm),this.tokenizer.rules=e}u.lex=function(e,t){return new u(t).lex(e)},u.lexInline=function(e,t){return new u(t).inlineTokens(e)};var e,t,n=u.prototype;return n.lex=function(e){var t;for(e=e.replace(/\r\n|\r/g,"\n"),this.blockTokens(e,this.tokens);t=this.inlineQueue.shift();)this.inlineTokens(t.src,t.tokens);return this.tokens},n.blockTokens=function(r,t){var u,e,i,n,s=this;for(void 0===t&&(t=[]),r=this.options.pedantic?r.replace(/\t/g,"    ").replace(/^ +$/gm,""):r.replace(/^( *)(\t+)/gm,function(e,t,u){return t+"    ".repeat(u.length)});r;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(function(e){return!!(u=e.call({lexer:s},r,t))&&(r=r.substring(u.raw.length),t.push(u),!0)})))if(u=this.tokenizer.space(r))r=r.substring(u.raw.length),1===u.raw.length&&0<t.length?t[t.length-1].raw+="\n":t.push(u);else if(u=this.tokenizer.code(r))r=r.substring(u.raw.length),!(e=t[t.length-1])||"paragraph"!==e.type&&"text"!==e.type?t.push(u):(e.raw+="\n"+u.raw,e.text+="\n"+u.text,this.inlineQueue[this.inlineQueue.length-1].src=e.text);else if(u=this.tokenizer.fences(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.heading(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.hr(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.blockquote(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.list(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.html(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.def(r))r=r.substring(u.raw.length),!(e=t[t.length-1])||"paragraph"!==e.type&&"text"!==e.type?this.tokens.links[u.tag]||(this.tokens.links[u.tag]={href:u.href,title:u.title}):(e.raw+="\n"+u.raw,e.text+="\n"+u.raw,this.inlineQueue[this.inlineQueue.length-1].src=e.text);else if(u=this.tokenizer.table(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.lheading(r))r=r.substring(u.raw.length),t.push(u);else if(i=r,this.options.extensions&&this.options.extensions.startBlock&&!function(){var t=1/0,u=r.slice(1),n=void 0;s.options.extensions.startBlock.forEach(function(e){"number"==typeof(n=e.call({lexer:this},u))&&0<=n&&(t=Math.min(t,n))}),t<1/0&&0<=t&&(i=r.substring(0,t+1))}(),this.state.top&&(u=this.tokenizer.paragraph(i)))e=t[t.length-1],n&&"paragraph"===e.type?(e.raw+="\n"+u.raw,e.text+="\n"+u.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=e.text):t.push(u),n=i.length!==r.length,r=r.substring(u.raw.length);else if(u=this.tokenizer.text(r))r=r.substring(u.raw.length),(e=t[t.length-1])&&"text"===e.type?(e.raw+="\n"+u.raw,e.text+="\n"+u.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=e.text):t.push(u);else if(r){var l="Infinite loop on byte: "+r.charCodeAt(0);if(this.options.silent){console.error(l);break}throw new Error(l)}return this.state.top=!0,t},n.inline=function(e,t){return this.inlineQueue.push({src:e,tokens:t=void 0===t?[]:t}),t},n.inlineTokens=function(r,t){var u,e,i,n,s,l,a=this,o=(void 0===t&&(t=[]),r);if(this.tokens.links){var D=Object.keys(this.tokens.links);if(0<D.length)for(;null!=(n=this.tokenizer.rules.inline.reflinkSearch.exec(o));)D.includes(n[0].slice(n[0].lastIndexOf("[")+1,-1))&&(o=o.slice(0,n.index)+"["+b("a",n[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;null!=(n=this.tokenizer.rules.inline.blockSkip.exec(o));)o=o.slice(0,n.index)+"["+b("a",n[0].length-2)+"]"+o.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;null!=(n=this.tokenizer.rules.inline.escapedEmSt.exec(o));)o=o.slice(0,n.index+n[0].length-2)+"++"+o.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex),this.tokenizer.rules.inline.escapedEmSt.lastIndex--;for(;r;)if(s||(l=""),s=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(function(e){return!!(u=e.call({lexer:a},r,t))&&(r=r.substring(u.raw.length),t.push(u),!0)})))if(u=this.tokenizer.escape(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.tag(r))r=r.substring(u.raw.length),(e=t[t.length-1])&&"text"===u.type&&"text"===e.type?(e.raw+=u.raw,e.text+=u.text):t.push(u);else if(u=this.tokenizer.link(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.reflink(r,this.tokens.links))r=r.substring(u.raw.length),(e=t[t.length-1])&&"text"===u.type&&"text"===e.type?(e.raw+=u.raw,e.text+=u.text):t.push(u);else if(u=this.tokenizer.emStrong(r,o,l))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.codespan(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.br(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.del(r))r=r.substring(u.raw.length),t.push(u);else if(u=this.tokenizer.autolink(r,_))r=r.substring(u.raw.length),t.push(u);else if(!this.state.inLink&&(u=this.tokenizer.url(r,_)))r=r.substring(u.raw.length),t.push(u);else if(i=r,this.options.extensions&&this.options.extensions.startInline&&!function(){var t=1/0,u=r.slice(1),n=void 0;a.options.extensions.startInline.forEach(function(e){"number"==typeof(n=e.call({lexer:this},u))&&0<=n&&(t=Math.min(t,n))}),t<1/0&&0<=t&&(i=r.substring(0,t+1))}(),u=this.tokenizer.inlineText(i,L))r=r.substring(u.raw.length),"_"!==u.raw.slice(-1)&&(l=u.raw.slice(-1)),s=!0,(e=t[t.length-1])&&"text"===e.type?(e.raw+=u.raw,e.text+=u.text):t.push(u);else if(r){var c="Infinite loop on byte: "+r.charCodeAt(0);if(this.options.silent){console.error(c);break}throw new Error(c)}return t},n=u,t=[{key:"rules",get:function(){return{block:y,inline:v}}}],(e=null)&&i(n.prototype,e),t&&i(n,t),Object.defineProperty(n,"prototype",{writable:!1}),u}(),$=function(){function e(e){this.options=e||r.defaults}var t=e.prototype;return t.code=function(e,t,u){var n,t=(t||"").match(/\S*/)[0];return this.options.highlight&&null!=(n=this.options.highlight(e,t))&&n!==e&&(u=!0,e=n),e=e.replace(/\n$/,"")+"\n",t?'<pre><code class="'+this.options.langPrefix+c(t)+'">'+(u?e:c(e,!0))+"</code></pre>\n":"<pre><code>"+(u?e:c(e,!0))+"</code></pre>\n"},t.blockquote=function(e){return"<blockquote>\n"+e+"</blockquote>\n"},t.html=function(e){return e},t.heading=function(e,t,u,n){return this.options.headerIds?"<h"+t+' id="'+(this.options.headerPrefix+n.slug(u))+'">'+e+"</h"+t+">\n":"<h"+t+">"+e+"</h"+t+">\n"},t.hr=function(){return this.options.xhtml?"<hr/>\n":"<hr>\n"},t.list=function(e,t,u){var n=t?"ol":"ul";return"<"+n+(t&&1!==u?' start="'+u+'"':"")+">\n"+e+"</"+n+">\n"},t.listitem=function(e){return"<li>"+e+"</li>\n"},t.checkbox=function(e){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox"'+(this.options.xhtml?" /":"")+"> "},t.paragraph=function(e){return"<p>"+e+"</p>\n"},t.table=function(e,t){return"<table>\n<thead>\n"+e+"</thead>\n"+(t=t&&"<tbody>"+t+"</tbody>")+"</table>\n"},t.tablerow=function(e){return"<tr>\n"+e+"</tr>\n"},t.tablecell=function(e,t){var u=t.header?"th":"td";return(t.align?"<"+u+' align="'+t.align+'">':"<"+u+">")+e+"</"+u+">\n"},t.strong=function(e){return"<strong>"+e+"</strong>"},t.em=function(e){return"<em>"+e+"</em>"},t.codespan=function(e){return"<code>"+e+"</code>"},t.br=function(){return this.options.xhtml?"<br/>":"<br>"},t.del=function(e){return"<del>"+e+"</del>"},t.link=function(e,t,u){return null===(e=F(this.options.sanitize,this.options.baseUrl,e))?u:(e='<a href="'+e+'"',t&&(e+=' title="'+t+'"'),e+">"+u+"</a>")},t.image=function(e,t,u){return null===(e=F(this.options.sanitize,this.options.baseUrl,e))?u:(e='<img src="'+e+'" alt="'+u+'"',t&&(e+=' title="'+t+'"'),e+(this.options.xhtml?"/>":">"))},t.text=function(e){return e},e}(),S=function(){function e(){}var t=e.prototype;return t.strong=function(e){return e},t.em=function(e){return e},t.codespan=function(e){return e},t.del=function(e){return e},t.html=function(e){return e},t.text=function(e){return e},t.link=function(e,t,u){return""+u},t.image=function(e,t,u){return""+u},t.br=function(){return""},e}(),T=function(){function e(){this.seen={}}var t=e.prototype;return t.serialize=function(e){return e.toLowerCase().trim().replace(/<[!\/a-z].*?>/gi,"").replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,"").replace(/\s/g,"-")},t.getNextSafeSlug=function(e,t){var u=e,n=0;if(this.seen.hasOwnProperty(u))for(n=this.seen[e];u=e+"-"+ ++n,this.seen.hasOwnProperty(u););return t||(this.seen[e]=n,this.seen[u]=0),u},t.slug=function(e,t){void 0===t&&(t={});e=this.serialize(e);return this.getNextSafeSlug(e,t.dryrun)},e}(),R=function(){function u(e){this.options=e||r.defaults,this.options.renderer=this.options.renderer||new $,this.renderer=this.options.renderer,this.renderer.options=this.options,this.textRenderer=new S,this.slugger=new T}u.parse=function(e,t){return new u(t).parse(e)},u.parseInline=function(e,t){return new u(t).parseInline(e)};var e=u.prototype;return e.parse=function(e,t){void 0===t&&(t=!0);for(var u,n,r,i,s,l,a,o,D,c,h,p,f,g,F,A,d="",C=e.length,k=0;k<C;k++)if(o=e[k],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[o.type]&&(!1!==(A=this.options.extensions.renderers[o.type].call({parser:this},o))||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(o.type)))d+=A||"";else switch(o.type){case"space":continue;case"hr":d+=this.renderer.hr();continue;case"heading":d+=this.renderer.heading(this.parseInline(o.tokens),o.depth,x(this.parseInline(o.tokens,this.textRenderer)),this.slugger);continue;case"code":d+=this.renderer.code(o.text,o.lang,o.escaped);continue;case"table":for(l=D="",r=o.header.length,u=0;u<r;u++)l+=this.renderer.tablecell(this.parseInline(o.header[u].tokens),{header:!0,align:o.align[u]});for(D+=this.renderer.tablerow(l),a="",r=o.rows.length,u=0;u<r;u++){for(l="",i=(s=o.rows[u]).length,n=0;n<i;n++)l+=this.renderer.tablecell(this.parseInline(s[n].tokens),{header:!1,align:o.align[n]});a+=this.renderer.tablerow(l)}d+=this.renderer.table(D,a);continue;case"blockquote":a=this.parse(o.tokens),d+=this.renderer.blockquote(a);continue;case"list":for(D=o.ordered,E=o.start,c=o.loose,r=o.items.length,a="",u=0;u<r;u++)f=(p=o.items[u]).checked,g=p.task,h="",p.task&&(F=this.renderer.checkbox(f),c?0<p.tokens.length&&"paragraph"===p.tokens[0].type?(p.tokens[0].text=F+" "+p.tokens[0].text,p.tokens[0].tokens&&0<p.tokens[0].tokens.length&&"text"===p.tokens[0].tokens[0].type&&(p.tokens[0].tokens[0].text=F+" "+p.tokens[0].tokens[0].text)):p.tokens.unshift({type:"text",text:F}):h+=F),h+=this.parse(p.tokens,c),a+=this.renderer.listitem(h,g,f);d+=this.renderer.list(a,D,E);continue;case"html":d+=this.renderer.html(o.text);continue;case"paragraph":d+=this.renderer.paragraph(this.parseInline(o.tokens));continue;case"text":for(a=o.tokens?this.parseInline(o.tokens):o.text;k+1<C&&"text"===e[k+1].type;)a+="\n"+((o=e[++k]).tokens?this.parseInline(o.tokens):o.text);d+=t?this.renderer.paragraph(a):a;continue;default:var E='Token with "'+o.type+'" type was not found.';if(this.options.silent)return void console.error(E);throw new Error(E)}return d},e.parseInline=function(e,t){t=t||this.renderer;for(var u,n,r="",i=e.length,s=0;s<i;s++)if(u=e[s],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[u.type]&&(!1!==(n=this.options.extensions.renderers[u.type].call({parser:this},u))||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(u.type)))r+=n||"";else switch(u.type){case"escape":r+=t.text(u.text);break;case"html":r+=t.html(u.text);break;case"link":r+=t.link(u.href,u.title,this.parseInline(u.tokens,t));break;case"image":r+=t.image(u.href,u.title,u.text);break;case"strong":r+=t.strong(this.parseInline(u.tokens,t));break;case"em":r+=t.em(this.parseInline(u.tokens,t));break;case"codespan":r+=t.codespan(u.text);break;case"br":r+=t.br();break;case"del":r+=t.del(this.parseInline(u.tokens,t));break;case"text":r+=t.text(u.text);break;default:var l='Token with "'+u.type+'" type was not found.';if(this.options.silent)return void console.error(l);throw new Error(l)}return r},u}();function I(e,u,n){if(null==e)throw new Error("marked(): input parameter is undefined or null");if("string"!=typeof e)throw new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected");if("function"==typeof u&&(n=u,u=null),m(u=C({},I.defaults,u||{})),n){var r,i=u.highlight;try{r=z.lex(e,u)}catch(e){return n(e)}var s,l=function(t){var e;if(!t)try{u.walkTokens&&I.walkTokens(r,u.walkTokens),e=R.parse(r,u)}catch(e){t=e}return u.highlight=i,t?n(t):n(null,e)};return!i||i.length<3?l():(delete u.highlight,r.length?(s=0,I.walkTokens(r,function(u){"code"===u.type&&(s++,setTimeout(function(){i(u.text,u.lang,function(e,t){if(e)return l(e);null!=t&&t!==u.text&&(u.text=t,u.escaped=!0),0===--s&&l()})},0))}),void(0===s&&l())):l())}function t(e){if(e.message+="\nPlease report this to https://github.com/markedjs/marked.",u.silent)return"<p>An error occurred:</p><pre>"+c(e.message+"",!0)+"</pre>";throw e}try{var a=z.lex(e,u);if(u.walkTokens){if(u.async)return Promise.all(I.walkTokens(a,u.walkTokens)).then(function(){return R.parse(a,u)}).catch(t);I.walkTokens(a,u.walkTokens)}return R.parse(a,u)}catch(e){t(e)}}I.options=I.setOptions=function(e){return C(I.defaults,e),e=I.defaults,r.defaults=e,I},I.getDefaults=e,I.defaults=r.defaults,I.use=function(){for(var o=I.defaults.extensions||{renderers:{},childTokens:{}},e=arguments.length,t=new Array(e),u=0;u<e;u++)t[u]=arguments[u];t.forEach(function(s){var u,e=C({},s);if(e.async=I.defaults.async||e.async,s.extensions&&(s.extensions.forEach(function(r){if(!r.name)throw new Error("extension name required");var i;if(r.renderer&&(i=o.renderers[r.name],o.renderers[r.name]=i?function(){for(var e=arguments.length,t=new Array(e),u=0;u<e;u++)t[u]=arguments[u];var n=r.renderer.apply(this,t);return n=!1===n?i.apply(this,t):n}:r.renderer),r.tokenizer){if(!r.level||"block"!==r.level&&"inline"!==r.level)throw new Error("extension level must be 'block' or 'inline'");o[r.level]?o[r.level].unshift(r.tokenizer):o[r.level]=[r.tokenizer],r.start&&("block"===r.level?o.startBlock?o.startBlock.push(r.start):o.startBlock=[r.start]:"inline"===r.level&&(o.startInline?o.startInline.push(r.start):o.startInline=[r.start]))}r.childTokens&&(o.childTokens[r.name]=r.childTokens)}),e.extensions=o),s.renderer){var t,l=I.defaults.renderer||new $;for(t in s.renderer)!function(r){var i=l[r];l[r]=function(){for(var e=arguments.length,t=new Array(e),u=0;u<e;u++)t[u]=arguments[u];var n=s.renderer[r].apply(l,t);return n=!1===n?i.apply(l,t):n}}(t);e.renderer=l}if(s.tokenizer){var n,a=I.defaults.tokenizer||new w;for(n in s.tokenizer)!function(r){var i=a[r];a[r]=function(){for(var e=arguments.length,t=new Array(e),u=0;u<e;u++)t[u]=arguments[u];var n=s.tokenizer[r].apply(a,t);return n=!1===n?i.apply(a,t):n}}(n);e.tokenizer=a}s.walkTokens&&(u=I.defaults.walkTokens,e.walkTokens=function(e){var t=[];return t.push(s.walkTokens.call(this,e)),t=u?t.concat(u.call(this,e)):t}),I.setOptions(e)})},I.walkTokens=function(e,l){for(var a,o=[],t=D(e);!(a=t()).done;)!function(){var t=a.value;switch(o=o.concat(l.call(I,t)),t.type){case"table":for(var e=D(t.header);!(u=e()).done;){var u=u.value;o=o.concat(I.walkTokens(u.tokens,l))}for(var n,r=D(t.rows);!(n=r()).done;)for(var i=D(n.value);!(s=i()).done;){var s=s.value;o=o.concat(I.walkTokens(s.tokens,l))}break;case"list":o=o.concat(I.walkTokens(t.items,l));break;default:I.defaults.extensions&&I.defaults.extensions.childTokens&&I.defaults.extensions.childTokens[t.type]?I.defaults.extensions.childTokens[t.type].forEach(function(e){o=o.concat(I.walkTokens(t[e],l))}):t.tokens&&(o=o.concat(I.walkTokens(t.tokens,l)))}}();return o},I.parseInline=function(e,t){if(null==e)throw new Error("marked.parseInline(): input parameter is undefined or null");if("string"!=typeof e)throw new Error("marked.parseInline(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected");m(t=C({},I.defaults,t||{}));try{var u=z.lexInline(e,t);return t.walkTokens&&I.walkTokens(u,t.walkTokens),R.parseInline(u,t)}catch(e){if(e.message+="\nPlease report this to https://github.com/markedjs/marked.",t.silent)return"<p>An error occurred:</p><pre>"+c(e.message+"",!0)+"</pre>";throw e}},I.Parser=R,I.parser=R.parse,I.Renderer=$,I.TextRenderer=S,I.Lexer=z,I.lexer=z.lex,I.Tokenizer=w,I.Slugger=T;var d=(I.parse=I).options,P=I.setOptions,Q=I.use,U=I.walkTokens,M=I.parseInline,N=I,X=R.parse,G=z.lex;r.Lexer=z,r.Parser=R,r.Renderer=$,r.Slugger=T,r.TextRenderer=S,r.Tokenizer=w,r.getDefaults=e,r.lexer=G,r.marked=I,r.options=d,r.parse=N,r.parseInline=M,r.parser=X,r.setOptions=P,r.use=Q,r.walkTokens=U});









/*! @license DOMPurify 3.0.1 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.0.1/LICENSE */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).DOMPurify=t()}(this,(function(){"use strict";function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}function t(e,n){return t=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},t(e,n)}function n(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}function r(e,o,a){return r=n()?Reflect.construct:function(e,n,r){var o=[null];o.push.apply(o,n);var a=new(Function.bind.apply(e,o));return r&&t(a,r.prototype),a},r.apply(null,arguments)}function o(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==n)return;var r,o,a=[],i=!0,l=!1;try{for(n=n.call(e);!(i=(r=n.next()).done)&&(a.push(r.value),!t||a.length!==t);i=!0);}catch(e){l=!0,o=e}finally{try{i||null==n.return||n.return()}finally{if(l)throw o}}return a}(e,t)||i(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function a(e){return function(e){if(Array.isArray(e))return l(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||i(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function i(e,t){if(e){if("string"==typeof e)return l(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?l(e,t):void 0}}function l(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var c=Object.entries,u=Object.setPrototypeOf,s=Object.isFrozen,f=Object.getPrototypeOf,m=Object.getOwnPropertyDescriptor,p=Object.freeze,d=Object.seal,h=Object.create,y="undefined"!=typeof Reflect&&Reflect,g=y.apply,b=y.construct;g||(g=function(e,t,n){return e.apply(t,n)}),p||(p=function(e){return e}),d||(d=function(e){return e}),b||(b=function(e,t){return r(e,a(t))});var v,T=R(Array.prototype.forEach),N=R(Array.prototype.pop),A=R(Array.prototype.push),E=R(String.prototype.toLowerCase),w=R(String.prototype.toString),S=R(String.prototype.match),_=R(String.prototype.replace),x=R(String.prototype.indexOf),k=R(String.prototype.trim),O=R(RegExp.prototype.test),D=(v=TypeError,function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return b(v,t)});function R(e){return function(t){for(var n=arguments.length,r=new Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];return g(e,t,r)}}function C(e,t,n){n=n||E,u&&u(e,null);for(var r=t.length;r--;){var o=t[r];if("string"==typeof o){var a=n(o);a!==o&&(s(t)||(t[r]=a),o=a)}e[o]=!0}return e}function L(e){var t,n=h(null),r=function(e,t){var n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=i(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,o=function(){};return{s:o,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,l=!0,c=!1;return{s:function(){n=n.call(e)},n:function(){var e=n.next();return l=e.done,e},e:function(e){c=!0,a=e},f:function(){try{l||null==n.return||n.return()}finally{if(c)throw a}}}}(c(e));try{for(r.s();!(t=r.n()).done;){var a=o(t.value,2),l=a[0],u=a[1];n[l]=u}}catch(e){r.e(e)}finally{r.f()}return n}function M(e,t){for(;null!==e;){var n=m(e,t);if(n){if(n.get)return R(n.get);if("function"==typeof n.value)return R(n.value)}e=f(e)}return function(e){return console.warn("fallback value for",e),null}}var I=p(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),U=p(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","filter","font","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),F=p(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),z=p(["animate","color-profile","cursor","discard","fedropshadow","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),H=p(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover"]),j=p(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),P=p(["#text"]),B=p(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","face","for","headers","height","hidden","high","href","hreflang","id","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","pattern","placeholder","playsinline","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","xmlns","slot"]),G=p(["accent-height","accumulate","additive","alignment-baseline","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),W=p(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),q=p(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),Y=d(/\{\{[\w\W]*|[\w\W]*\}\}/gm),$=d(/<%[\w\W]*|[\w\W]*%>/gm),K=d(/\${[\w\W]*}/gm),V=d(/^data-[\-\w.\u00B7-\uFFFF]/),X=d(/^aria-[\-\w]+$/),Z=d(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),J=d(/^(?:\w+script|data):/i),Q=d(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),ee=d(/^html$/i),te=function(){return"undefined"==typeof window?null:window},ne=function(t,n){if("object"!==e(t)||"function"!=typeof t.createPolicy)return null;var r=null,o="data-tt-policy-suffix";n.currentScript&&n.currentScript.hasAttribute(o)&&(r=n.currentScript.getAttribute(o));var a="dompurify"+(r?"#"+r:"");try{return t.createPolicy(a,{createHTML:function(e){return e},createScriptURL:function(e){return e}})}catch(e){return console.warn("TrustedTypes policy "+a+" could not be created."),null}};var re=function t(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:te(),r=function(e){return t(e)};if(r.version="3.0.1",r.removed=[],!n||!n.document||9!==n.document.nodeType)return r.isSupported=!1,r;var o=n.document,i=n.document,l=n.DocumentFragment,u=n.HTMLTemplateElement,s=n.Node,f=n.Element,m=n.NodeFilter,d=n.NamedNodeMap,h=void 0===d?n.NamedNodeMap||n.MozNamedAttrMap:d,y=n.HTMLFormElement,g=n.DOMParser,b=n.trustedTypes,v=f.prototype,R=M(v,"cloneNode"),re=M(v,"nextSibling"),oe=M(v,"childNodes"),ae=M(v,"parentNode");if("function"==typeof u){var ie=i.createElement("template");ie.content&&ie.content.ownerDocument&&(i=ie.content.ownerDocument)}var le=ne(b,o),ce=le?le.createHTML(""):"",ue=i,se=ue.implementation,fe=ue.createNodeIterator,me=ue.createDocumentFragment,pe=ue.getElementsByTagName,de=o.importNode,he={};r.isSupported="function"==typeof c&&"function"==typeof ae&&se&&void 0!==se.createHTMLDocument;var ye,ge,be=Y,ve=$,Te=K,Ne=V,Ae=X,Ee=J,we=Q,Se=Z,_e=null,xe=C({},[].concat(a(I),a(U),a(F),a(H),a(P))),ke=null,Oe=C({},[].concat(a(B),a(G),a(W),a(q))),De=Object.seal(Object.create(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Re=null,Ce=null,Le=!0,Me=!0,Ie=!1,Ue=!0,Fe=!1,ze=!1,He=!1,je=!1,Pe=!1,Be=!1,Ge=!1,We=!0,qe=!1,Ye="user-content-",$e=!0,Ke=!1,Ve={},Xe=null,Ze=C({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]),Je=null,Qe=C({},["audio","video","img","source","image","track"]),et=null,tt=C({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),nt="http://www.w3.org/1998/Math/MathML",rt="http://www.w3.org/2000/svg",ot="http://www.w3.org/1999/xhtml",at=ot,it=!1,lt=null,ct=C({},[nt,rt,ot],w),ut=["application/xhtml+xml","text/html"],st="text/html",ft=null,mt=i.createElement("form"),pt=function(e){return e instanceof RegExp||e instanceof Function},dt=function(t){ft&&ft===t||(t&&"object"===e(t)||(t={}),t=L(t),ye=ye=-1===ut.indexOf(t.PARSER_MEDIA_TYPE)?st:t.PARSER_MEDIA_TYPE,ge="application/xhtml+xml"===ye?w:E,_e="ALLOWED_TAGS"in t?C({},t.ALLOWED_TAGS,ge):xe,ke="ALLOWED_ATTR"in t?C({},t.ALLOWED_ATTR,ge):Oe,lt="ALLOWED_NAMESPACES"in t?C({},t.ALLOWED_NAMESPACES,w):ct,et="ADD_URI_SAFE_ATTR"in t?C(L(tt),t.ADD_URI_SAFE_ATTR,ge):tt,Je="ADD_DATA_URI_TAGS"in t?C(L(Qe),t.ADD_DATA_URI_TAGS,ge):Qe,Xe="FORBID_CONTENTS"in t?C({},t.FORBID_CONTENTS,ge):Ze,Re="FORBID_TAGS"in t?C({},t.FORBID_TAGS,ge):{},Ce="FORBID_ATTR"in t?C({},t.FORBID_ATTR,ge):{},Ve="USE_PROFILES"in t&&t.USE_PROFILES,Le=!1!==t.ALLOW_ARIA_ATTR,Me=!1!==t.ALLOW_DATA_ATTR,Ie=t.ALLOW_UNKNOWN_PROTOCOLS||!1,Ue=!1!==t.ALLOW_SELF_CLOSE_IN_ATTR,Fe=t.SAFE_FOR_TEMPLATES||!1,ze=t.WHOLE_DOCUMENT||!1,Pe=t.RETURN_DOM||!1,Be=t.RETURN_DOM_FRAGMENT||!1,Ge=t.RETURN_TRUSTED_TYPE||!1,je=t.FORCE_BODY||!1,We=!1!==t.SANITIZE_DOM,qe=t.SANITIZE_NAMED_PROPS||!1,$e=!1!==t.KEEP_CONTENT,Ke=t.IN_PLACE||!1,Se=t.ALLOWED_URI_REGEXP||Se,at=t.NAMESPACE||ot,De=t.CUSTOM_ELEMENT_HANDLING||{},t.CUSTOM_ELEMENT_HANDLING&&pt(t.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(De.tagNameCheck=t.CUSTOM_ELEMENT_HANDLING.tagNameCheck),t.CUSTOM_ELEMENT_HANDLING&&pt(t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(De.attributeNameCheck=t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),t.CUSTOM_ELEMENT_HANDLING&&"boolean"==typeof t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements&&(De.allowCustomizedBuiltInElements=t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),Fe&&(Me=!1),Be&&(Pe=!0),Ve&&(_e=C({},a(P)),ke=[],!0===Ve.html&&(C(_e,I),C(ke,B)),!0===Ve.svg&&(C(_e,U),C(ke,G),C(ke,q)),!0===Ve.svgFilters&&(C(_e,F),C(ke,G),C(ke,q)),!0===Ve.mathMl&&(C(_e,H),C(ke,W),C(ke,q))),t.ADD_TAGS&&(_e===xe&&(_e=L(_e)),C(_e,t.ADD_TAGS,ge)),t.ADD_ATTR&&(ke===Oe&&(ke=L(ke)),C(ke,t.ADD_ATTR,ge)),t.ADD_URI_SAFE_ATTR&&C(et,t.ADD_URI_SAFE_ATTR,ge),t.FORBID_CONTENTS&&(Xe===Ze&&(Xe=L(Xe)),C(Xe,t.FORBID_CONTENTS,ge)),$e&&(_e["#text"]=!0),ze&&C(_e,["html","head","body"]),_e.table&&(C(_e,["tbody"]),delete Re.tbody),p&&p(t),ft=t)},ht=C({},["mi","mo","mn","ms","mtext"]),yt=C({},["foreignobject","desc","title","annotation-xml"]),gt=C({},["title","style","font","a","script"]),bt=C({},U);C(bt,F),C(bt,z);var vt=C({},H);C(vt,j);var Tt=function(e){var t=ae(e);t&&t.tagName||(t={namespaceURI:at,tagName:"template"});var n=E(e.tagName),r=E(t.tagName);return!!lt[e.namespaceURI]&&(e.namespaceURI===rt?t.namespaceURI===ot?"svg"===n:t.namespaceURI===nt?"svg"===n&&("annotation-xml"===r||ht[r]):Boolean(bt[n]):e.namespaceURI===nt?t.namespaceURI===ot?"math"===n:t.namespaceURI===rt?"math"===n&&yt[r]:Boolean(vt[n]):e.namespaceURI===ot?!(t.namespaceURI===rt&&!yt[r])&&(!(t.namespaceURI===nt&&!ht[r])&&(!vt[n]&&(gt[n]||!bt[n]))):!("application/xhtml+xml"!==ye||!lt[e.namespaceURI]))},Nt=function(e){A(r.removed,{element:e});try{e.parentNode.removeChild(e)}catch(t){e.remove()}},At=function(e,t){try{A(r.removed,{attribute:t.getAttributeNode(e),from:t})}catch(e){A(r.removed,{attribute:null,from:t})}if(t.removeAttribute(e),"is"===e&&!ke[e])if(Pe||Be)try{Nt(t)}catch(e){}else try{t.setAttribute(e,"")}catch(e){}},Et=function(e){var t,n;if(je)e="<remove></remove>"+e;else{var r=S(e,/^[\r\n\t ]+/);n=r&&r[0]}"application/xhtml+xml"===ye&&at===ot&&(e='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+e+"</body></html>");var o=le?le.createHTML(e):e;if(at===ot)try{t=(new g).parseFromString(o,ye)}catch(e){}if(!t||!t.documentElement){t=se.createDocument(at,"template",null);try{t.documentElement.innerHTML=it?ce:o}catch(e){}}var a=t.body||t.documentElement;return e&&n&&a.insertBefore(i.createTextNode(n),a.childNodes[0]||null),at===ot?pe.call(t,ze?"html":"body")[0]:ze?t.documentElement:a},wt=function(e){return fe.call(e.ownerDocument||e,e,m.SHOW_ELEMENT|m.SHOW_COMMENT|m.SHOW_TEXT,null,!1)},St=function(e){return e instanceof y&&("string"!=typeof e.nodeName||"string"!=typeof e.textContent||"function"!=typeof e.removeChild||!(e.attributes instanceof h)||"function"!=typeof e.removeAttribute||"function"!=typeof e.setAttribute||"string"!=typeof e.namespaceURI||"function"!=typeof e.insertBefore||"function"!=typeof e.hasChildNodes)},_t=function(t){return"object"===e(s)?t instanceof s:t&&"object"===e(t)&&"number"==typeof t.nodeType&&"string"==typeof t.nodeName},xt=function(e,t,n){he[e]&&T(he[e],(function(e){e.call(r,t,n,ft)}))},kt=function(e){var t;if(xt("beforeSanitizeElements",e,null),St(e))return Nt(e),!0;var n=ge(e.nodeName);if(xt("uponSanitizeElement",e,{tagName:n,allowedTags:_e}),e.hasChildNodes()&&!_t(e.firstElementChild)&&(!_t(e.content)||!_t(e.content.firstElementChild))&&O(/<[/\w]/g,e.innerHTML)&&O(/<[/\w]/g,e.textContent))return Nt(e),!0;if(!_e[n]||Re[n]){if(!Re[n]&&Dt(n)){if(De.tagNameCheck instanceof RegExp&&O(De.tagNameCheck,n))return!1;if(De.tagNameCheck instanceof Function&&De.tagNameCheck(n))return!1}if($e&&!Xe[n]){var o=ae(e)||e.parentNode,a=oe(e)||e.childNodes;if(a&&o)for(var i=a.length-1;i>=0;--i)o.insertBefore(R(a[i],!0),re(e))}return Nt(e),!0}return e instanceof f&&!Tt(e)?(Nt(e),!0):"noscript"!==n&&"noembed"!==n||!O(/<\/no(script|embed)/i,e.innerHTML)?(Fe&&3===e.nodeType&&(t=e.textContent,t=_(t,be," "),t=_(t,ve," "),t=_(t,Te," "),e.textContent!==t&&(A(r.removed,{element:e.cloneNode()}),e.textContent=t)),xt("afterSanitizeElements",e,null),!1):(Nt(e),!0)},Ot=function(e,t,n){if(We&&("id"===t||"name"===t)&&(n in i||n in mt))return!1;if(Me&&!Ce[t]&&O(Ne,t));else if(Le&&O(Ae,t));else if(!ke[t]||Ce[t]){if(!(Dt(e)&&(De.tagNameCheck instanceof RegExp&&O(De.tagNameCheck,e)||De.tagNameCheck instanceof Function&&De.tagNameCheck(e))&&(De.attributeNameCheck instanceof RegExp&&O(De.attributeNameCheck,t)||De.attributeNameCheck instanceof Function&&De.attributeNameCheck(t))||"is"===t&&De.allowCustomizedBuiltInElements&&(De.tagNameCheck instanceof RegExp&&O(De.tagNameCheck,n)||De.tagNameCheck instanceof Function&&De.tagNameCheck(n))))return!1}else if(et[t]);else if(O(Se,_(n,we,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==x(n,"data:")||!Je[e]){if(Ie&&!O(Ee,_(n,we,"")));else if(n)return!1}else;return!0},Dt=function(e){return e.indexOf("-")>0},Rt=function(t){var n,o,a,i;xt("beforeSanitizeAttributes",t,null);var l=t.attributes;if(l){var c={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:ke};for(i=l.length;i--;){var u=n=l[i],s=u.name,f=u.namespaceURI;if(o="value"===s?n.value:k(n.value),a=ge(s),c.attrName=a,c.attrValue=o,c.keepAttr=!0,c.forceKeepAttr=void 0,xt("uponSanitizeAttribute",t,c),o=c.attrValue,!c.forceKeepAttr&&(At(s,t),c.keepAttr))if(Ue||!O(/\/>/i,o)){Fe&&(o=_(o,be," "),o=_(o,ve," "),o=_(o,Te," "));var m=ge(t.nodeName);if(Ot(m,a,o)){if(!qe||"id"!==a&&"name"!==a||(At(s,t),o=Ye+o),le&&"object"===e(b)&&"function"==typeof b.getAttributeType)if(f);else switch(b.getAttributeType(m,a)){case"TrustedHTML":o=le.createHTML(o);break;case"TrustedScriptURL":o=le.createScriptURL(o)}try{f?t.setAttributeNS(f,s,o):t.setAttribute(s,o),N(r.removed)}catch(e){}}}else At(s,t)}xt("afterSanitizeAttributes",t,null)}},Ct=function e(t){var n,r=wt(t);for(xt("beforeSanitizeShadowDOM",t,null);n=r.nextNode();)xt("uponSanitizeShadowNode",n,null),kt(n)||(n.content instanceof l&&e(n.content),Rt(n));xt("afterSanitizeShadowDOM",t,null)};return r.sanitize=function(e){var t,n,a,i,c=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if((it=!e)&&(e="\x3c!--\x3e"),"string"!=typeof e&&!_t(e)){if("function"!=typeof e.toString)throw D("toString is not a function");if("string"!=typeof(e=e.toString()))throw D("dirty is not a string, aborting")}if(!r.isSupported)return e;if(He||dt(c),r.removed=[],"string"==typeof e&&(Ke=!1),Ke){if(e.nodeName){var u=ge(e.nodeName);if(!_e[u]||Re[u])throw D("root node is forbidden and cannot be sanitized in-place")}}else if(e instanceof s)1===(n=(t=Et("\x3c!----\x3e")).ownerDocument.importNode(e,!0)).nodeType&&"BODY"===n.nodeName||"HTML"===n.nodeName?t=n:t.appendChild(n);else{if(!Pe&&!Fe&&!ze&&-1===e.indexOf("<"))return le&&Ge?le.createHTML(e):e;if(!(t=Et(e)))return Pe?null:Ge?ce:""}t&&je&&Nt(t.firstChild);for(var f=wt(Ke?e:t);a=f.nextNode();)kt(a)||(a.content instanceof l&&Ct(a.content),Rt(a));if(Ke)return e;if(Pe){if(Be)for(i=me.call(t.ownerDocument);t.firstChild;)i.appendChild(t.firstChild);else i=t;return(ke.shadowroot||ke.shadowrootmod)&&(i=de.call(o,i,!0)),i}var m=ze?t.outerHTML:t.innerHTML;return ze&&_e["!doctype"]&&t.ownerDocument&&t.ownerDocument.doctype&&t.ownerDocument.doctype.name&&O(ee,t.ownerDocument.doctype.name)&&(m="<!DOCTYPE "+t.ownerDocument.doctype.name+">\n"+m),Fe&&(m=_(m,be," "),m=_(m,ve," "),m=_(m,Te," ")),le&&Ge?le.createHTML(m):m},r.setConfig=function(e){dt(e),He=!0},r.clearConfig=function(){ft=null,He=!1},r.isValidAttribute=function(e,t,n){ft||dt({});var r=ge(e),o=ge(t);return Ot(r,o,n)},r.addHook=function(e,t){"function"==typeof t&&(he[e]=he[e]||[],A(he[e],t))},r.removeHook=function(e){if(he[e])return N(he[e])},r.removeHooks=function(e){he[e]&&(he[e]=[])},r.removeAllHooks=function(){he={}},r}();return re}));
//# sourceMappingURL=purify.min.js.map










