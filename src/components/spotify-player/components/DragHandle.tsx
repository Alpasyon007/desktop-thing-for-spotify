"use client";

import { GripHorizontal } from "lucide-react";

interface DragHandleProps {
	getDragStyle: (isDragRegion?: boolean) => React.CSSProperties;
	isVisible: boolean;
}

export function DragHandle({ getDragStyle, isVisible }: DragHandleProps) {
	if (!isVisible) return null;

	return (
		<div
			className="flex items-center justify-center w-full h-6 bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors cursor-move border-b border-zinc-700/50"
			style={getDragStyle(true)}
			title="Drag to move window"
		>
			<GripHorizontal className="w-4 h-4 text-zinc-500" />
		</div>
	);
}
