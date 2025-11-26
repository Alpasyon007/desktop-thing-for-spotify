"use client";

import { Button } from "@/components/ui/button";

import { DragHandle } from "../components/DragHandle";

import { Copy, Minus, Square, X } from "lucide-react";
import { motion } from "motion/react";

interface LoginViewProps {
	isAuthenticating: boolean;
	onLogin: () => void;
	windowControls: {
		isMaximized: boolean;
		showDragHandle: boolean;
		getContainerStyle: (isDragRegion?: boolean) => React.CSSProperties;
		getDragStyle: (isDragRegion?: boolean) => React.CSSProperties;
		handleMinimize: () => void;
		handleMaximize: () => void;
		handleClose: () => void;
	};
}

export function LoginView({ isAuthenticating, onLogin, windowControls }: LoginViewProps) {
	return (
		<div
			className="flex flex-col h-full bg-gradient-to-br from-green-900 via-green-800 to-green-900"
			style={windowControls.getContainerStyle(true)}
		>
			{/* Drag Handle at top */}
			<DragHandle getDragStyle={windowControls.getDragStyle} isVisible={windowControls.showDragHandle} />

			{/* Content */}
			<div className="flex items-center justify-center flex-1 p-1">
				<motion.div
					className="flex h-full flex-col justify-center items-center"
					style={windowControls.getDragStyle(false)}
					initial={{ opacity: 0, x: -20 }}
					animate={{
						opacity: 1,
						x: 0
					}}
					exit={{ opacity: 0, x: -20 }}
					transition={{
						duration: 0.3,
						ease: "easeInOut"
					}}
					onMouseDown={(e) => e.stopPropagation()}
				>
					<Button
						variant="ghost"
						size="sm"
						className="aspect-square w-8 h-8"
						onClick={windowControls.handleClose}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<X />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="aspect-square w-8 h-8"
						onClick={windowControls.handleMaximize}
						onMouseDown={(e) => e.stopPropagation()}
					>
						{windowControls.isMaximized ? <Copy className={"[transform:scaleX(-1)]"} /> : <Square />}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="aspect-square w-8 h-8"
						onClick={windowControls.handleMinimize}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<Minus />
					</Button>
				</motion.div>
				<div className="flex items-center gap-3 max-w-full w-full px-2">
					<div className={`w-8 h-8 flex-shrink-0 ${isAuthenticating ? "animate-pulse" : ""}`}>
						<svg viewBox="0 0 496 512" className="w-full h-full fill-green-400">
							<path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z" />
						</svg>
					</div>
					<div className="flex-1 min-w-0">
						<h1 className="text-sm font-bold text-white truncate">
							{isAuthenticating ? "Waiting for Login..." : "Connect to Spotify"}
						</h1>
						<p className="text-green-200 text-xs truncate">
							{isAuthenticating ? "Complete login in browser" : "Login to control playback"}
						</p>
					</div>
					<Button
						onClick={onLogin}
						disabled={isAuthenticating}
						className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
						style={windowControls.getDragStyle(false)}
						onMouseDown={(e) => e.stopPropagation()}
					>
						{isAuthenticating ? "Authenticating..." : "Login"}
					</Button>
				</div>
			</div>
		</div>
	);
}
