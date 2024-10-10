import { WorkspaceLeaf, Plugin, ItemView } from 'obsidian';

export default class Squishy extends Plugin {
	
	async onload() {
		let finished = false; //will be set to true on LayoutReady
		let leafarray: WorkspaceLeaf[] = [];

		//@ts-ignore
		this.app.workspace.getSideLeaf = (a: any, b: any) => { //if obsidian tries to open a side leaf, force it to the center
			let l = this.app.workspace.getLeaf("tab");
			patch(l);
			if (!finished) { //if not finished...
				leafarray.push(l); //add the leaf into the array
				//so any side leaves obsidian tries to open before workspacelayout ready will be in the array
			}
			return l;
		};

		/* {
				id: "brfind",
				name: "",
				editorCheckCallback: (checking: boolean, editor: Editor, info: MarkdownView | MarkdownFileInfo) => batchRenameCallback("findreplace", checking, editor, info),
			} */ /* {
				id: "getfiletab",
				name: "Open a file tab in the centre",
				callback: () => {
					const l = this.app.workspace.getLeaf("tab");
					l.setViewState({ type: "file-explorer", active: true})
					//@ts-ignore
					.then(() => l.view.closeable = true);
				}
			} */

				/* {
				id: "getsearchtab",
				name: "Open a search tab in the centre",
				callback: () => {
					const l = this.app.workspace.getLeaf("tab");
					l.setViewState({ type: "search", active: true})
					//@ts-ignore
					.then(() => l.view.closeable = true);
				}
			}, {
				id: "help",
				name: "help",
				callback: () => this.app.workspace.iterateAllLeaves((leaf) => console.log(leaf))
			} */

		//@ts-ignore
		/* const ogESL = this.app.workspace.ensureSideLeaf.bind(this.app.workspace); //originalEnsureSideLeaf
		//@ts-ignore
		this.app.workspace.ensureSideLeaf = function (a:any, b:any, c:any) {
			//f (finished) {
				const leaf = ogESL(a,b,c);
				//waitPatch(leaf);
				
			//}
			if (!finished) {
				leafarray.push(leaf);
			}
			return leaf;
			return undefined
			}; */

		//this.app.workspace.getRightLeaf = this.app.workspace.getLeftLeaf;

		this.app.workspace.onLayoutReady(() => {
			//set finished to true so no more pushing to array
			finished = true;
			//
			//this.app.workspace.iterateAllLeaves((l) => console.log(l.view.getViewType()))

			let leavesIMust = this.app.workspace.getLeavesOfType("file-explorer");
			leavesIMust.push(...this.app.workspace.getLeavesOfType("search"));
			leavesIMust.push(...this.app.workspace.getLeavesOfType("tag"));
			leavesIMust.forEach((v) => {
				patch(v);
			}
			)
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