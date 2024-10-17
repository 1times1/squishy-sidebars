import { WorkspaceLeaf, Plugin, ItemView, Side, Notice, TAbstractFile, View, CorePlugin } from 'obsidian';
//i edited the obsidian.d.ts file....

const plugins = new Map<string, CorePlugin>(); 

const VIEW_TYPES: string[] = ['file-explorer', 'search', 'tag', 'backlink', 'outgoing-link', 'bookmarks', 'outline', 'all-properties'];
const PLUGIN_IDS: string[] = ['file-explorer', 'global-search', 'tag-pane', 'backlink', 'outgoing-link', 'bookmarks', 'outline', 'properties'] 
//these are the only core plugins/view pairs that register a workspace.on("layout-ready") to open a a view 
//it doesn't matter if they are disabled or not, because each always gets initialised when and only when obsidian loads.
//one day i will make a plugin to fix that, but the plugin loading code is tangled with obby's core functionality
//like i think loading the file explorer plugin registers the on("create") and on("rename") event listeners

let leafmap: Map<string, View> = new Map();

const PREFIX = "Squishy Sidebars: "

export default class Squishy extends Plugin {
	
	async onload() {

		//debug command. add commands first so if something throws while plugin is loading you still have access to the commands.
		this.addCommand({
			id: "debug",
			name: "Debug command",
			callback: () => {
					this.app.workspace.iterateAllLeaves((leaf) => console.log(leaf))
					console.log(leafmap);
				}
			})
		

		//overwrite some obsidian functions

		this.app.workspace.ensureSideLeaf = newESL.bind(this.app.workspace);
		
		
		this.app.workspace.getSideLeaf = (a: any, b: any) => { //i can't only patch ensureSideLeaf because file explorer calls getLeftLeaf() directly
			let l = this.app.workspace.getLeaf("tab"); //if obsidian tries to get a side leaf, it gets a centre leaf instead
			return l;
		};

		
		VIEW_TYPES.forEach((v, i) => plugins.set(v, this.app.internalPlugins.plugins[PLUGIN_IDS[i]]));
		
		let i=0;
		let u=1;

		for (let [key, value] of plugins) {
			
			
			if (i <3*u) { //if i love you
				//man i declared an extra variable for this
				//just couldn't miss the opportunity to make a love thing whenever <3 comes up
				
				//anyways the if statement is to only do the below patching for the first three entries in the VIEW_TYPES/PLUGINS arrays 
				//make sure they're search, bookmarks, and files!!!!!!

				const origViewFunc = value.views[key].bind(null); //i have to declare the function every time because origViewFunc is unique, ugh

				value.views[key] = function newViewFunc(e: WorkspaceLeaf): View {
					let newView: View = origViewFunc(e)

					//only need to patch this once because everything links to this instance of FZ (workspaceLeaf i think)
					//damn if only i can just make all the file explorer views link to one node tree
					Object.getPrototypeOf(e).canClose = canClose;
					
					const p = Object.getPrototypeOf(newView);
					Object.setPrototypeOf(p, new WowView(e));
					
					return newView;
				}
			}

			//I think I should stop the leaves from popping up by changing the onWorkspaceLayoutReady, but
			//then maybe i'll have to patch the individual functions of each plugin.
			//if you do a Ctrl+F in the source code, every plugin's initLeaf is just a ensureSideLeaf(), so I'm probably not damaging anything crucial
			value.instance.initLeaf = blank;
			
		
		}

		const feInstance = this.app.internalPlugins.plugins["file-explorer"].instance;
		Object.getPrototypeOf(feInstance).revealInFolder = newRIF.bind(feInstance);

		
	}

	onunload() {};
}


class WowView extends ItemView { //implemented version of itemview used to make file explorer moveable
	
	constructor(l: WorkspaceLeaf){
		super(l);
		this.containerEl.remove(); //remove ItemView elements that look really bad.
	}

	syncState() {} //Obsidian throws a TypeError while loading vault without this. I haven't looked into it much beyond that.

	getViewType(): string {
		return ""
	}

	getDisplayText(): string {
		return ""
	}

}

//new ensureSideLeaf()
async function newESL(e: any, t: any, n: any) {
	var i;
	var r = n.active;
	var o = n.split;
	var a = n.reveal;
	var s = a === void 0 || a;
	var l = n.state;
	var c = this.getLeavesOfType(e);
	if (c.length === 0) {
	  i = t === 'left' ? this.getLeftLeaf(o) : this.getRightLeaf(o);
	  if (s) {
		this.setActiveLeaf(i);
	  }
	  i.setViewState({ type: e, state: l });
	} else {
	  i = c[0];
	  if (s) {
		this.revealLeaf(i);
	  }
	  if (l) {
		i.setViewState({ type: e, state: l });
	  }
	}
	if (r) {
	  this.setActiveLeaf(i, { focus: true });
	}
  };

  function blank(){}; //only have one instance of the function and make the others point to it to save 1 byte of memory (i think). thanks javascript

  function canClose(){ return true };

  //new revealInFolder
  function newRIF (e: any) {
	var t: any;
	var n = this.app;
	var i = n.workspace.getLeavesOfType('file-explorer');
	if (i.length === 0) {
	  (t = n.workspace.getLeftLeaf(true)).setViewState({
		type: 'file-explorer',
	  }).then(() => {
		t.view.revealInFolder(e);
	  });
	} else {
	  t = i[0];
	  n.workspace.revealLeaf(t); //for some reason, it doesn't work if you don't have this line of code.... weird. 
	  //the original was revealLeaf(t), which is async, but it still works!!!????
	  //i think i'm just delusional.
	  t.view.revealInFolder(e);
	}
	
  };