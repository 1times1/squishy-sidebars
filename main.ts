import { WorkspaceLeaf, Plugin, ItemView, Side, Notice, TAbstractFile, View, CorePlugin } from 'obsidian';

const plugins = new Map<string, CorePlugin>();

const VIEW_TYPES: string[] = ['file-explorer', 'search', 'tag'];
const PLUGIN_IDS: string[] = ['file-explorer', 'global-search', 'tag-pane']
let leafarray: WorkspaceLeaf[] = [];
let leafmap: Map<string, View> = new Map();

const PREFIX = "Squishy Sidebars: "

export default class Squishy extends Plugin {
	
	async onload() {
		let finished = false; //will be set to true on LayoutReady
		
		//@ts-ignore: undocumented Obsidian method
		//re-assigning it so if obsidian tries to get a side leaf, it gets a centre leaf instead
		this.app.workspace.getSideLeaf = (a: any, b: any) => { //
			let l = this.app.workspace.getLeaf("tab");
			if (!finished)
				leafarray.push(l);
			return l;
		};

		//new ensureSideLeaf()
		function newESL(e: string, t: Side, n: any) {
			var i: WorkspaceLeaf;
			var o = n.split;
			var c = this.getLeavesOfType(e);
			
			if (c.length === 0) {
			  i = t === 'left' ? this.getLeftLeaf(o) : this.getRightLeaf(o);
			  /* let leaf = leafmap.get(e);
			  leaf ? i = leaf : i.setViewState({ type: e, ...n }); */
			  i.setViewState({ type: e, ...n });
			  //i.view.load = () => {};
			} else {
			  i = c[0];
			  if (n.active || n.reveal) {
				this.setActiveLeaf(i, { focus: true });
				this.revealLeaf(i);
			  }
			}
		  };

		VIEW_TYPES.forEach((v, i) => plugins.set(v, this.app.internalPlugins.plugins[PLUGIN_IDS[i]]))
		//file explorer Instance
		//@ts-ignore

		for (let [key, value] of plugins) {
			
			const origViewFunc = value.views[key].bind(null);

			//i have to declare the function every time because origViewFunc is unique, ugh
			value.views[key] = function newViewFunc(e: WorkspaceLeaf): View {
				let newView: View = origViewFunc(e)
				//only need to patch this once because everything links to this instance of FZ (workspaceLeaf i think)
				//damn if only i can just make all the file explorer views link to one node tree
				Object.getPrototypeOf(e).canClose = canClose;
				//}
	
				const p = Object.getPrototypeOf(newView);
				Object.setPrototypeOf(p, new WowView(e));
				//newView.leaf = e;
				
				return newView;
			}

			value.instance.initLeaf = blank;
			
		}
		const fePlugin = this.app.internalPlugins.plugins["file-explorer"];
		//it doesn't matter if they are disabled or not, because each always gets initialised when and only when
		//obsidian loads.

		const feInstance = fePlugin.instance;
		Object.getPrototypeOf(feInstance).revealInFolder = newRIF.bind(feInstance)
		
		function blank(){};
		
		function canClose(){ return true };
		
		
		
		

		//new revealInFolder
		function newRIF(e: TAbstractFile) {
			var t: WorkspaceLeaf;
			var n = this.app;
			var i = n.workspace.getLeavesOfType('file-explorer');
			if (i.length === 0) {
			  (t = n.workspace.getLeftLeaf(true)).setViewState({
				type: 'file-explorer',
			  }).then(() => {
				//n.workspace.revealLeaf(t);
				//@ts-ignore
				t.view.revealInFolder(e);
			  });
			} else {
			  t = i[0];
			  //n.workspace.revealLeaf(t);
			  //@ts-ignore
				t.view.revealInFolder(e);
			}
			
		  };

		this.app.workspace.ensureSideLeaf = newESL.bind(this.app.workspace);


		//debug command
		this.addCommand({
				id: "debug",
				name: "Debug command",
				callback: () => 
					{this.app.workspace.iterateAllLeaves((leaf) => console.log(leaf))
						console.log(leafmap);
					}
			})

		this.app.workspace.onLayoutReady(() => {
			//set finished to true so no more pushing to array
			finished = true;
			
			//debug code - if you want to see the view type strings just check workspace.json
			//this.app.workspace.iterateAllLeaves((l) => console.log(l.view.getViewType()))

		/* 	let leavesIMust: WorkspaceLeaf[] = []; //leaves I Must patch
			VIEW_TYPES.forEach((value) => leavesIMust.push(...this.app.workspace.getLeavesOfType(value)));
			leavesIMust.forEach((l) => {
					if (leafmap.get(l.view.getViewType())) {
						l.setViewState({type: "empty"})
					} else {
					leafmap.set(l.view.getViewType(), l.view)
					}
				
			});

			let notice = false;
			for (let [key, value] of PLUGINS) {
				//@ts-ignore
				if (this.app.internalPlugins.getEnabledPluginById(value) && leafmap.get(key)) {
					
				} else {
					notice = true;
				}
			}

			if (notice) {
				new Notice(PREFIX + "something went wrong. This usually goes away if you reload Obsidian.")
			}
			leafmap.forEach((value) => patch(value));
			*/
			leafarray.forEach((l,i) => {
				l.detach();
				
		}) //detach all the leaves in the array
			
			//Obsidian convienently opens a leaf of every view type we need to patch on start.
			//so running the patch code will just do it to all the view types -> yay!
			//therefore detaching has to happen after the leaves get patched. otherwise you risk missing a view.

			
		});
	}

	onunload() {

	}
}


class WowView extends ItemView { //implemented version of itemview used to make file explorer moveable
	
	constructor(l: WorkspaceLeaf){
		super(l);
		this.containerEl.remove();
	}
	
	/* open(e: any){ //this does NOT get called when first loading!!!
		//handles things when leaf init is already done
		let viewType = this.getViewType()
		let t = leafmap.get(viewType);
		if (t) { //if already loaded
			let alr = this.app.workspace.getLeavesOfType(viewType);
			if (alr.length === 1) { // the 'this' leaf has the viewtype already
				e.appendChild(t.containerEl);
			} else {
				//this.leaf.detach();
				new Notice(PREFIX + "no thanks!")
			}
		
			
			
		} else {
			throw new Error("should not be loading!!");
		}
	} */

	onUnload() {
		this.containerEl.remove();
	}

	getViewType(): string {
		return ""
	}

	getDisplayText(): string {
		return ""
	}

}


function patch(l: View) {
	/* Object.getPrototypeOf(l.leaf).canClose = () => true;
	Object.setPrototypeOf(Object.getPrototypeOf(l), new WowView(l.leaf)); */
	
}