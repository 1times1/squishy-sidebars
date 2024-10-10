import { WorkspaceLeaf, Plugin, ItemView } from 'obsidian';

const VIEW_TYPES = ['file-explorer', 'search', 'tag']

export default class Squishy extends Plugin {
	
	async onload() {
		let finished = false; //will be set to true on LayoutReady
		let leafarray: WorkspaceLeaf[] = [];

		//@ts-ignore
		this.app.workspace.getSideLeaf = (a: any, b: any) => { //if obsidian tries to open a side leaf, force it to the center
			let l = this.app.workspace.getLeaf("tab");
			
			if (!finished) { //if not finished...
				leafarray.push(l); //add the leaf into the array
				//so any side leaves obsidian tries to open before workspacelayout ready will be in the array
			} else {
				if (VIEW_TYPES.contains(l.view.getViewType())) { //skip views that I don't need to patch
					patch(l);
				}
			}
			return l;
		};

		//debug command
		/* {
				id: "help",
				name: "help",
				callback: () => this.app.workspace.iterateAllLeaves((leaf) => console.log(leaf))
			} */

		this.app.workspace.onLayoutReady(() => {
			//set finished to true so no more pushing to array
			finished = true;
			
			//debug code - if you want to see the view type strings just check workspace.json
			//this.app.workspace.iterateAllLeaves((l) => console.log(l.view.getViewType()))

			let leavesIMust: WorkspaceLeaf[] = [];
			VIEW_TYPES.forEach((value) => leavesIMust.push(...this.app.workspace.getLeavesOfType(value)));
			leavesIMust.forEach((v) => patch(v));

			leafarray.forEach((l) => l.detach()) //detach all the leaves in the array

			
		});
	}

	onunload() {

	}
}


class WowView extends ItemView { //implemented version of itemview used to make file explorer moveable
	leaf: WorkspaceLeaf;
	
	constructor(l: WorkspaceLeaf) {
		super(l);
		this.leaf = l;
		
		this.containerEl.detach(); //stop ItemView artifacts from showing up
	}

	getDisplayText(): string {
		return this.leaf.view.getDisplayText();
	};

	getViewType(): string {
		return this.leaf.view.getViewType();
	};
}


function patch(l: WorkspaceLeaf) {
	Object.getPrototypeOf(l).canClose = () => true;
	Object.setPrototypeOf(Object.getPrototypeOf(l.view), new WowView(l));
}