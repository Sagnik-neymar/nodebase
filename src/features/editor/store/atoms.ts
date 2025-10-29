import type { ReactFlowInstance } from "@xyflow/react";
import { atom } from "jotai";

// this will be global state and can be used from anywhere
export const editorAtom = atom<ReactFlowInstance | null>(null);