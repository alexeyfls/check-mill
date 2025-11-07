import { type Snippet } from "svelte";

export enum Views {
	Scroller = "scroller",
	Grid = "grid",
}

export interface MultiViewSectionProps {
	title: string;
	children: Snippet;
	defaultView?: Views;
}
