import { type Snippet } from "svelte";

export interface SegmentedProps {
	id: string;
	data: SegmentedItem[];
	value?: string;
	defaultValue?: string;
	children: Snippet<[SegmentedItem]>;
	onChange?: (value: string) => void;
}

export interface SegmentedItem {
	value: string;
}
