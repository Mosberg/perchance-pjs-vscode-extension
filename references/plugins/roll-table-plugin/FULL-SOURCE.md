# FULL SOURCE DUMP — roll-table-plugin

Every internal and external source file, in full, with the exact path it occupies in this package.

## internal-code/main.pjs

```javascript
$output (list, num) =>
	let result;
	let arr = list.selectAll; 
	let sum = 0;
	for(let item of arr) {
		let line = item.getRawListText;
		let parts = line.split(", ");
		if(parts.length < 2) return "(roll-table-plugin error: all items in the table should be of the form <b>N-N, ITEM TEXT</b> or <b>N, ITEM TEXT</b> - the space after the comma is important)";
		let itemRange = parts[0];
		let rangeArr;
		if(String(Number(itemRange)) === itemRange) {
		  rangeArr = [Number(itemRange), Number(itemRange)];
		} else {
		  rangeArr = itemRange.split("-").map(n => Number(n));
		}
		if(isNaN(rangeArr[0]) || isNaN(rangeArr[1])) {
      return "(roll-table-plugin error: all items in the table should be of the form <b>N-N, ITEM TEXT</b> or <b>N, ITEM TEXT</b> - the space after the comma is important)";
    }
		if(num >= rangeArr[0] && num <= rangeArr[1]) {
      let out = item.evaluateItem.split(", ");
      out.shift();
      return out.join(", ");
    }
	}
	return `(roll-table-plugin error: a roll of ${num} is not in the range of the table)`; 
```

## internal-code/index.html

```html
<h1>Roll Table Plugin</h1>

<div style="margin:0 auto;width:100%;max-width:780px;background:white;border-radius:2px;padding:1em; box-sizing:border-box;">
	<p>Put these in your Perchance code panel:</p>
<pre>
rollTable = \{import:roll-table-plugin\}
dice = \{import:dice-plugin\}
</pre>
	<p>And now you can write code like this:</p>
<pre>
output
  You're holding a \[rollTable(weapon, dice("2d6"))\]
weapon
  1, club
  2-4, dagger
  5-8, sword
  9-12, mace
</pre>
	<p>As you can see, all items should be of the form <code>n1-n2, my item text</code> or <code>n, my item text</code> (the space after the comma is important). You can also <a href="pw72nzjsnz#edit">use negative numbers</a>.</p>
  <br>
	<p><b>Notes:</b></p>
	<ul>
		<li><a href="2txq99om7r#edit">Here's a simple example</a> generator.</li>
		<li><span style="color:red;font-weight:bold;">This plugin is experimental.</span> Normal perchance odds notation is better in most cases.</li>
		<li>Thanks to <a href="https://perchance.org/vionet20-gens" target="_blank">VioneT20</a> and <a href="https://www.reddit.com/r/perchance/comments/13ypdi1/bugunexpected_behavior_in_rolltableplugin/" target="_blank">mokuba_b1tch</a> for helping fix a bug with this plugin.</li>
		<li>Check out more plugins at <a href="/plugins">perchance.org/plugins</a>.</li>
	</ul>
</div>
<br><br><br>

<style>
	body {
			background:#eee;
	}
	code {
		background-color:#eee;
		padding:0.1em 0.2em;
	}
	li {margin-top:0.5em}
	pre {
		text-align:left;
		background: #333;
    color: white;
    padding: 1em;
    border-radius: 2px;
		tab-size: 2;
		-moz-tab-size: 2;
		-o-tab-size: 2;
		-webkit-tab-size: 2;
	}
</style>
```

## external-code/dice-plugin/main.pjs

```javascript
// This is the JavaScript function that powers this plugin:
$output (str) =>
  str = str.toString();
  if(str === undefined) str = "1d6";
	str = str.replace(/\s/g,""); 
	let tally = 0;
	let chunks = str.split(/(\+|-)/g);
	for(let i = 0; i < chunks.length; i++) {
	  let s = chunks[i];
		
		if(s === '+' || s === '-') continue;
		
		let sign;
		if(chunks[i-1] === undefined || chunks[i-1] === "+") sign = 1;
		else if(chunks[i-1] === "-") sign = -1;
		else return `(invalid dice notation)`;
		
		if(!isNaN(Number(s))) {
			tally += sign*Number(s);
			continue;
		}

		
		let nums = s.split("d");
		if(nums.length <= 1) return `(invalid dice notation)`;
		let numDice = Number(nums[0]);
		let diceSides = Number(nums[1]);
		
		for(let i = 0; i < numDice; i++) {
			tally += sign*Math.floor(diceSides*Math.random())+1;
		}
		
	}
	return tally;
	
// You can learn JavaScript here:
// https://www.codecademy.com/learn/javascript 
```
