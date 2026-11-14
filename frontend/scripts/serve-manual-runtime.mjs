// Legacy convenience startup delegates only to the exact-tested-binary guard.
if(!process.argv.includes('--tested-sha'))throw Error('Use the guarded refresh with --tested-sha after actual verification;legacy workspace records are never recreated or redirected');
await import('./refresh-manual-runtime.mjs');
