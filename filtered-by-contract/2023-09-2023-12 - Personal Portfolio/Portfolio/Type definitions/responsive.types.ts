// Type imports
import { EBreakpoints } from "types/enums";

// Types
export type TBreakpointRender = ({ children }: { children: React.ReactElement }) => React.ReactElement | null;
export type TCurrentBreakpoint = () => EBreakpoints;