import { type Snippet } from "svelte";

export interface SegmentedProps {
	data: SegmentedItem[];
	value?: string;
	defaultValue?: string;
	children: Snippet<[SegmentedItem]>;
}

export interface SegmentedItem {
	value: string;
}
