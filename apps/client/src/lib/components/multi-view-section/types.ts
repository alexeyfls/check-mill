import { type Snippet } from "svelte";

export enum Views {
	Scroller = "scroller",
	Grid = "grid",
}

export interface MultiViewSectionProps {
	id: string;
	title: string;
	children: Snippet;
	defaultView?: Views;
}
