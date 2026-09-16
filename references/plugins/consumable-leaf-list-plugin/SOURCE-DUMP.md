# SOURCE-DUMP.md — every file, full contents


## `01-internal-code/main.pjs`

```
// This is the JavaScript function that powers this plugin:
$output (list) => 
  if(!list) return "(error: no list given to consumable-leaf-list-plugin)";

	// get all leaves:
	// general strategy is to add all first level items to the leaves array, then
	// go through and replace the ones that aren't actually leaves (i.e. have children)
	// with their children, and then go through those and do the same thing, etc. until
	// we've got all the leaves.
	const isLeaf = (node) => Object.keys(node).length === 0;
	const leaves = [...list.selectAll];
	for(let i = 0; i < leaves.length; i++) { // note that `leaves` grows during the loop, so it's important that we don't "cache" leaves.length 
		if(!isLeaf(leaves[i])) {
			leaves.splice(i, 1, ...leaves[i].selectAll); // it's not actually a leaf, so we replace it with its children
			i--;
		}
	}
	if(leaves.length === 0) {
	  return "(error: no leaves in list given to consumable-leaf-list-plugin?)";
	}

	const theConsumableLeafList = {
		list: list,
		leaves: new Set(leaves),
		consumedLeaves: new Set(),
		exhaustedBranches: new Set(), // meaning all its leaves are consumed and all its branches are exhausted. this set includes ancestors of twigs too - not just twigs.
		isLeaf: function(item) { return this.leaves.has(item); },
		leafCount: leaves.length,
		get getLength() {
			return this.leafCount - this.consumedLeaves.size;
		},
		// just a copy of the actual selectMany function:
	  selectMany(...a) {
			let num;
			if(a.length === 1) {
				if(Array.isArray(a[0])) {
					num = Number(a[0][Math.floor(Math.random()*a[0].length)]);
				} else {
					num = Number(a[0]);
				}
			} else if(a.length === 2) {
				num = Number(a[0]) + Math.round(Math.random()*(a[1]-a[0]));
			} else if(a.length > 2) {
				num = Number(a[Math.floor(Math.random()*a.length)]);
			}
			if(isNaN(num)) debugger;
			let arr = [];
			for(let i = 0; i < num; i++) {
				arr.push(this.selectOne);
			}
			arr.toString = function() { return this.join(""); };
			return arr;
		},
		get selectAll() {
		  // Note that thanks to using splice when we create the leaves list, top-to-bottom order of the leaves is maintained, just like with the actual `selectAll` getter.
			let arr = [...this.leaves];
			arr.toString = function() { return this.join(""); };
			return arr;
		},
		get selectOne() {
			if(this.getLength === 0) return "(error: no more items left in consumableLeafList)";
			let i = 0;
			let done = false;
			let item = this.list;
			while(1) {
				i++;
				if(i > 10000) return "(error in consumable-leaf-list-plugin: infinite loop encountered?)";
				
				if(this.isLeaf(item)) {
					this.consumedLeaves.add(item);
					
					// now we need to apply "cascading exhaustion" to ancestor branches (i.e. mark branches as exhausted if they are exhausted):
					let branch = item.getParent; // start at parent of the leaf that was just selected
					while(1) {
            // check if all its leaves an branches are exhausted:
					  if( branch.selectAll.filter(i => this.isLeaf(i) && !this.consumedLeaves.has(i)).length === 0 /*<--has no unconsumed leaves left*/ && branch.selectAll.filter(i => !this.isLeaf(i) && !this.exhaustedBranches.has(i)).length === 0 /*<--has no unexhausted branches left*/) {
							this.exhaustedBranches.add(branch);
							if(branch === this.list) break;
							else branch = branch.getParent;
						} else {
						  break; // not exhausted, therefore no ancestors are either.
						}
					}
					
					return item;
					
				} else {
				  // go deeper, but make sure we don't choose leaves that have already been chosen, or go down exhausted branches:
          // (NOTE: the selectOne actually uses getOdds behind the scenes on the nodes in the array that is returned by selectAll, so all the odds stuff should work correctly even though we're initally grabbing ALL nodes with selectAll)
				  item = item.selectAll.filter(i => !this.exhaustedBranches.has(i) && !this.consumedLeaves.has(i)).selectOne;
					// note that it should be impossible for selectOne here to try to pull from an empty list, because we've filtered
					// out all the exhausted branches. So if it does pull from an empty list, that means there's probably a bug with my
					// "cascading exhaustion" code.
				}
			}
		},
		toString: function() {
		  return this.selectOne+"";
		},
		valueOf: function() {
		  let res = this.selectOne+"";
			if(Number(res).toString() === res) {
			  res = Number(res);
			}
			return res;
		},
	};
	return theConsumableLeafList;
	
// You can learn JavaScript here:
// https://www.khanacademy.org/computing/computer-programming
```


## `01-internal-code/index.html`

```html
<h1>🍃 consumableLeafList Plugin 🍃</h1>

<div style="text-align:left; margin:0 auto;width:100%;max-width:650px;background:white;border-radius:2px;padding:1em; box-sizing:border-box;">
	<p style="margin-top:0;">This is plugin allows you to create a consumable list out of all the "leaf" items in your hierarchy. See the <a href="https://perchance.org/select-leaf-plugin">select-leaf-plugin</a> page to see what I mean by "leaf". Very briefly: just write this in your Perchance code panel:</p>
	<pre>consumableLeafList = \{import:consumable-leaf-list-plugin\}</pre>
	<p>And then make your consumable list, and use it like a normal one:</p>
<pre>
output
  \[l = consumableLeafList(myList)\] \[l\] \[l\]
</pre>
	<p><b>Notes:</b></p>
	<ul>
		<li><a href="https://perchance.org/consumable-leaf-list-plugin-example#edit">Here's a simple example</a> showing how to use it</li>
		<li>You can also use <code>l.selectOne</code>, <code>l.selectMany(...)</code> and <code>l.selectAll</code>, just like with normal <code>consumableList</code>s</li>
		<li>Check out more plugins at <a href="/plugins">perchance.org/plugins</a></li>
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
	ul li {
	  margin-top:0.5rem;	
	}
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


## `02-external-code/select-leaf-plugin/main.pjs`

```
// This is the JavaScript function that powers this plugin:
$output (list) =>
  if(!list) return "(no list given to selectLeaf plugin)";
	let leaf = list;
	let i = 0;
	let result;
	while(1) {
		i++;
		if(i > 10000) {
      return "(error in select-leaf-plugin: infinite loop encountered?)";
    }
		result = leaf.selectOne;
		if(typeof result === "string" || Object.keys(result).length === 0) { // typeof result === "string" is for case where input list was actually just a 'property' like foo={a|b|c}
			//if(!result) debugger;
			return result;
		}
		leaf = result;
	}
	
// You can learn JavaScript here:
// https://www.codecademy.com/learn/javascript
```


## `02-external-code/select-leaf-plugin/index.html`

```html
<h1>🍂 Select Leaf Plugin 🍂</h1>

<div style="margin:0 auto;width:100%;max-width:650px;background:white;border-radius:2px;padding:1em; box-sizing:border-box;">
	<p>Put this in your Perchance code panel:</p>
	<pre>selectLeaf = \{import:select-leaf-plugin\}</pre>
	<br>
	<p>Now you can select a "<a href="https://perchance.org/select-leaf-plugin-example#edit">leaf</a>" item from your hierarchy:</p>
	<pre>\[selectLeaf(myList)\]</pre>
	<p style="text-align:left;">A "leaf" is an item that doesn't have any "children" - that is, a item that doesn't have any "sub-items" underneath it. Think of it like a tree. You start with a trunk, and then that trunk branches several times until you get to the twigs, and then you've got the leaves attached to those twigs:</p>
<pre>
trunk
  branch1
    subbranch
      leaf1
      leaf2
  branch2
    leaf3
    leaf4
		leaf5
		subbranch
			leaf6
			leaf7
</pre>
  <p>You can treat the result of the <code>selectLeaf(listName)</code> just like you would with <code>listName.selectOne</code>, so you can do stuff like this, for example:</p>
<pre>
output
  The \[a = selectLeaf(animal)\] sits with the other \[a.pluralForm\].
  
animal
  mammal
    mouse
    deer
    marsupial
      kangaroo
      opossum
    monotreme
      platypus
  reptile
    lizard
    turtle
  bird
    flamingo
    dove
</pre>
  <br>
	<p><b>Notes:</b></p>
	<ul>
		<li><a href="https://perchance.org/select-leaf-plugin-example#edit">Here's a simple example</a> showing how to use it</li>
		<li>Also see <a href="https://perchance.org/select-leaves-plugin">select-leaves-plugin</a> for getting several leaves at once, and <a href="https://perchance.org/consumable-leaf-list-plugin">consumable-leaf-list-plugin</a> if you want to make a <code>consumableList</code> out of all your leaf nodes so you can select a set of <i>unique</i> leaves.</li>
		<li>Check out more plugins at <a href="/plugins">perchance.org/plugins</a></li>
	</ul>
</div>
<br><br><br>

<style>
	body {
			background:#eee;
	}
	code {
		background-color:#eee;
		padding:0.1em 0.2em
	}
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
	ul li { margin-top: 0.4em; }
</style>
```


## `02-external-code/consumable-leaf-list-plugin-example/main.pjs`

```
trunk
  branch1
    subbranch
      leaf1 
      leaf2
  branch2
    leaf3
    leaf4
		leaf5
		subbranch
			leaf6
			leaf7
		
consumableLeafList = {import:consumable-leaf-list-plugin}
		
output
	[cll = consumableLeafList(trunk)] [cll] [cll] [cll] [cll] [a = cll.selectOne] [a] [a]
```


## `02-external-code/consumable-leaf-list-plugin-example/index.html`

```html
<h1>consumableLeafList Plugin Example</h1>
[output]
<br><br>
<button onclick="update()">randomize</button>
<p>(<a href="https://perchance.org/consumable-leaf-list-plugin">see plugin page</a>)</p>
```
