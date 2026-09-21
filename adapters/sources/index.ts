import type { SourceAdapter } from "../contract";
import { broker } from "./broker";
import { lamudi } from "./lamudi";
import { property24 } from "./property24";
import { dotproperty } from "./dotproperty";
import { rentpad } from "./rentpad";
import { zipmatch } from "./zipmatch";
import { facebook } from "./facebook";
import { carousell } from "./carousell";

export const ADAPTERS: SourceAdapter[] = [broker, lamudi, property24, dotproperty, rentpad, zipmatch, facebook, carousell];
