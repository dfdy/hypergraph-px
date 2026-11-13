import {defineConfig} from '@playwright/test';
import {join} from 'node:path';
const directory=process.env.HPX_UI_ARTIFACTS,url=process.env.HPX_UI_BASE_URL;
if(!directory||!/^http:\/\/127\.0\.0\.1:\d+$/.test(url??''))throw Error('Use npm run test:ui: it owns fresh assets, an isolated server and unique run artifacts.');
export default defineConfig({testDir:'tests/browser',fullyParallel:false,workers:1,timeout:30000,outputDir:join(directory,'results'),use:{headless:true,baseURL:url,viewport:{width:1600,height:1000},trace:'retain-on-failure'},reporter:[['list'],['json',{outputFile:join(directory,'playwright.json')}]]});
