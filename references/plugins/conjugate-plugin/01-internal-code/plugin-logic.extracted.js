$output(wordOrList) =>
	if(!window.alreadyAttachedNLPCompromise235326222) {
	  let fakeWindow = {};
		(function(window) {
			/* ==== compromise v11.12.4 (github.com/nlp-compromise/compromise, MIT) inlined here in main.pjs ====
			   See 01-internal-code/vendored-inline/compromise-11.12.4.min.js for the verbatim embedded bytes,
			   and 02-external-code/compromise-11.12.4/ for the original upstream distribution. ==== */
		
		})(fakeWindow);
		window.nlp235326222 = fakeWindow.nlp;
		window.alreadyAttachedNLPCompromise235326222 = true;
	}
  let word = wordOrList+"";
	if(word === "hope" || word === "hopes" || word === "hoped" || word === "hoping") return {actor:"hoper", future:"will hope", gerund:"hoping", infinitive:"hope", past:"hoped", present:"hopes"};
	if(word === "bill" || word === "bills" || word === "billed" || word === "billing") return {actor:"biller", future:"will bill", gerund:"billing", infinitive:"bill", past:"billed", present:"bills"};
	if(word === "dawn" || word === "dawns" || word === "dawned" || word === "dawning") return {actor:"dawner", future:"will dawn", gerund:"dawning", infinitive:"dawn", past:"dawned", present:"dawns"};
	let addedWords = {abolish:"Verb",abound:"Verb",abstract:"Verb",accent:"Verb",accomplish:"Verb",admonish:"Verb",alert:"Verb",ally:"Verb",appropriate:"Verb",astonish:"Verb",auction:"Verb",audition:"Verb",average:"Verb",awake:"Verb",award:"Verb",back:"Verb",backpedal:"Verb",banish:"Verb",bank:"Verb",bankrupt:"Verb",better:"Verb",bill:"Verb",blacklist:"Verb",bless:"Verb",blind:"Verb",bloody:"Verb",blossom:"Verb",board:"Verb",bob:"Verb",bombard:"Verb",bottle:"Verb",brave:"Verb",breakfast:"Verb",brief:"Verb",bus:"Verb",busy:"Verb",butcher:"Verb",butter:"Verb",cake:"Verb",calm:"Verb",captain:"Verb",care:"Verb",cash:"Verb",caution:"Verb",center:"Verb",cherish:"Verb",christen:"Verb",chronicle:"Verb",chuck:"Verb",circumvent:"Verb",clean:"Verb",clear:"Verb",club:"Verb",commission:"Verb",complete:"Verb",comply:"Verb",conceal:"Verb",condition:"Verb",content:"Verb",contrive:"Verb",cool:"Verb",correct:"Verb",corrupt:"Verb",critique:"Verb",cup:"Verb",dawn:"Verb",degenerate:"Verb",demolish:"Verb",deprive:"Verb",derive:"Verb",design:"Verb",diminish:"Verb",disable:"Verb",discard:"Verb",disregard:"Verb",don:"Verb",double:"Verb",down:"Verb",dry:"Verb",dull:"Verb",elaborate:"Verb",embellish:"Verb",empty:"Verb",engineer:"Verb",enlist:"Verb",equal:"Verb",erect:"Verb",exact:"Verb",faint:"Verb",fake:"Verb",fancy:"Verb",fine:"Verb",firm:"Verb",fish:"Verb",fit:"Verb",flatter:"Verb",flicker:"Verb",flourish:"Verb",fly:"Verb",ford:"Verb",forward:"Verb",foster:"Verb",foul:"Verb",free:"Verb",frequent:"Verb",fund:"Verb",furnish:"Verb",further:"Verb",garnish:"Verb",gossip:"Verb",grace:"Verb",grant:"Verb",ground:"Verb",group:"Verb",herald:"Verb",hoist:"Verb",hollow:"Verb",hope:"Verb",house:"Verb",hum:"Verb",humble:"Verb",ice:"Verb",impoverish:"Verb",indent:"Verb",index:"Verb",initial:"Verb",institute:"Verb",inventory:"Verb",knot:"Verb",last:"Verb",lavish:"Verb",lean:"Verb",light:"Verb",lobby:"Verb",long:"Verb",lower:"Verb",lunch:"Verb",mail:"Verb",man:"Verb",mark:"Verb",marshal:"Verb",mature:"Verb",mean:"Verb",mellow:"Verb",milk:"Verb",mimic:"Verb",mine:"Verb",model:"Verb",moderate:"Verb",motion:"Verb",mute:"Verb",narrow:"Verb",near:"Verb",nestle:"Verb",nick:"Verb",number:"Verb",nurse:"Verb",obscure:"Verb",oil:"Verb",open:"Verb",outlive:"Verb",overcrowd:"Verb",overdo:"Verb",overeat:"Verb",overflow:"Verb",overhaul:"Verb",overhear:"Verb",overheat:"Verb",overload:"Verb",overlook:"Verb",overpower:"Verb",overrule:"Verb",oversee:"Verb",overshadow:"Verb",oversleep:"Verb",overthrow:"Verb",overturn:"Verb",own:"Verb",panic:"Verb",part:"Verb",partition:"Verb",patent:"Verb",patrol:"Verb",pedal:"Verb",pepper:"Verb",perfect:"Verb",perish:"Verb",petition:"Verb",plant:"Verb",please:"Verb",ply:"Verb",police:"Verb",polish:"Verb",position:"Verb",post:"Verb",pound:"Verb",power:"Verb",press:"Verb",pressure:"Verb",prime:"Verb",pucker:"Verb",punish:"Verb",query:"Verb",quiz:"Verb",rain:"Verb",rally:"Verb",ration:"Verb",rear:"Verb",rebel:"Verb",rebound:"Verb",refurbish:"Verb",relish:"Verb",repeal:"Verb",replenish:"Verb",requisition:"Verb",research:"Verb",reserve:"Verb",rev:"Verb",revive:"Verb",right:"Verb",ring:"Verb",rival:"Verb",round:"Verb",salt:"Verb",sanction:"Verb",scent:"Verb",school:"Verb",secure:"Verb",separate:"Verb",service:"Verb",shut:"Verb",signal:"Verb",silhouette:"Verb",single:"Verb",slow:"Verb",smooth:"Verb",snicker:"Verb",snow:"Verb",sour:"Verb",space:"Verb",spare:"Verb",speed:"Verb",spike:"Verb",spiral:"Verb",spy:"Verb",square:"Verb",stable:"Verb",station:"Verb",steady:"Verb",steam:"Verb",stuff:"Verb",sue:"Verb",tame:"Verb",tan:"Verb",taper:"Verb",tarnish:"Verb",tender:"Verb",tense:"Verb",thin:"Verb",thunder:"Verb",till:"Verb",time:"Verb",top:"Verb",total:"Verb",trouble:"Verb",undercut:"Verb",underline:"Verb",undertake:"Verb",undervalue:"Verb",up:"Verb",upset:"Verb",utter:"Verb",vanish:"Verb",varnish:"Verb",void:"Verb",wade:"Verb",warm:"Verb",water:"Verb",weather:"Verb",wed:"Verb",welcome:"Verb",woo:"Verb",wound:"Verb"};
  let conjugations = nlp235326222("They "+word, addedWords).verbs().conjugate()[0]; 
  if(!conjugations) {
    console.log("Not a verb? --> ", word);
    return {actor:word, future:word, gerund:word, infinitive:word, past:word, present:word};
  }

	let typeMap = {
		Actor: "actor",
		FutureTense: "future", 
		Gerund: "gerund", 
		Infinitive: "infinitive", 
		PastTense: "past", 
		PresentTense: "present", 
	}
  let c = {};
  for(let [key, betterKey] of Object.entries(typeMap)) {
    c[betterKey] = conjugations[key] || word;
  }
	return c;
