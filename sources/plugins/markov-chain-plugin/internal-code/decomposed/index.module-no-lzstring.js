
	
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
	
	
