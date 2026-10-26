import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/browser',fullyParallel:false,workers:1,timeout:30000,use:{headless:true,baseURL:'http://127.0.0.1:5173',viewport:{width:1600,height:1000},trace:'retain-on-failure'},webServer:{command:'npm run dev',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI,timeout:30000},reporter:'list'});
