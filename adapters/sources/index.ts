import type { SourceAdapter } from "../contract";
// property portals
import { lamudi } from "./lamudi";
import { property24 } from "./property24";
import { dotproperty } from "./dotproperty";
import { rentpad } from "./rentpad";
import { zipmatch } from "./zipmatch";
import { onepropertee } from "./onepropertee";
import { myproperty } from "./myproperty";
import { rentph } from "./rentph";
// developers
import { smdc } from "./smdc";
import { dmci } from "./dmci";
import { camella } from "./camella";
import { megaworld } from "./megaworld";
import { ayalaland } from "./ayalaland";
// banks & foreclosure
import { pagibig } from "./pagibig";
import { buenamano } from "./buenamano";
import { bdo } from "./bdo";
import { metrobank } from "./metrobank";
import { unionbank } from "./unionbank";
import { foreclosureph } from "./foreclosureph";
// brokerages
import { hoppler } from "./hoppler";
import { filipinohomes } from "./filipinohomes";
import { ohmyhome } from "./ohmyhome";
import { remax } from "./remax";
import { propertyaccess } from "./propertyaccess";
// marketplaces & classifieds
import { facebook } from "./facebook";
import { carousell } from "./carousell";
import { locanto } from "./locanto";

export const ADAPTERS: SourceAdapter[] = [
  lamudi, property24, dotproperty, rentpad, zipmatch, onepropertee, myproperty, rentph,
  smdc, dmci, camella, megaworld, ayalaland,
  pagibig, buenamano, bdo, metrobank, unionbank, foreclosureph,
  hoppler, filipinohomes, ohmyhome, remax, propertyaccess,
  facebook, carousell, locanto,
];
