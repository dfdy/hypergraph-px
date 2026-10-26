// SPDX-License-Identifier: AGPL-3.0-only
import {resolve} from 'node:path';
import {signDevelopmentBinary} from './development-signing.mjs';
const binary=process.argv[2]?resolve(process.argv[2]):resolve(import.meta.dirname,'../../target/debug/hypergraph');
await signDevelopmentBinary(binary);console.log('Signed and verified the dedicated Hypergraph local-development identity.');
