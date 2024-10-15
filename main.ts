import { WorkspaceLeaf, Plugin, ItemView, Side, Notice, TAbstractFile, View } from 'obsidian';

const VIEW_TYPES = ['file-explorer', 'search', 'tag']

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
			
			if (!finished) { //if not finished...
				leafarray.push(l); //add the leaf into the array
				//so any side leaves obsidian tries to open before workspacelayout ready will be in the array
			}/*  else {
				if (VIEW_TYPES.contains(l.view.getViewType())) { //skip views that I don't need to patch
					patch(l);
				}
			} */
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
			} else {
			  i = c[0];
			  if (n.active || n.reveal) {
				this.setActiveLeaf(i, { focus: true });
				this.revealLeaf(i);
			  }
			}
		  };

		//file explorer Instance
		//@ts-ignore
		const feInstance = this.app.internalPlugins.getPluginById("file-explorer").instance;
		Object.getPrototypeOf(feInstance).revealInFolder = newRIF.bind(feInstance);

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
				id: "help",
				name: "help",
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

			let leavesIMust: WorkspaceLeaf[] = []; //leaves I Must patch
			VIEW_TYPES.forEach((value) => leavesIMust.push(...this.app.workspace.getLeavesOfType(value)));
			leavesIMust.forEach((l) => {
					if (leafmap.get(l.view.getViewType())) {
						l.setViewState({type: "empty"})
					} else {
					leafmap.set(l.view.getViewType(), l.view)
					}
				
			});
			if (leafmap.size !== VIEW_TYPES.length) {
				new Notice(PREFIX + "something went wrong. This usually goes away if you reload Obsidian.")
			}
			leafmap.forEach((value) => patch(value));
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
	
	open(e: any){ //this does NOT get called when first loading!!!
		let viewType = this.getViewType()
		let t = leafmap.get(viewType);
		if (t) { //if already loaded
			let alr = this.app.workspace.getLeavesOfType(viewType);
			if (alr.length === 0) {
				e.appendChild(t.containerEl);
			} else {
				this.leaf.detach();
				new Notice(PREFIX + "no thanks!")
			}
		
			
			
		} else {
			throw new Error("should not be loading!!");
		}
	}

	getViewType(): string {
		return ""
	}

	getDisplayText(): string {
		return ""
	}

}


function patch(l: View) {
	Object.getPrototypeOf(l.leaf).canClose = () => true;
	Object.setPrototypeOf(Object.getPrototypeOf(l), new WowView(l.leaf));

}