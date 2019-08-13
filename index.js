//Please run the tests from this file
const {Builder, By, Key, until} = require("selenium-webdriver");  
let driver = new Builder().forBrowser("firefox").build();

import * as run from "./tests"  //Need esm for node to recognize import. To install: npm install --save esm, then to run: node -r esm index.js 


//Select which test to run or run full test suite
(async function runTestSuite(){
    await run.createAccount(driver);
    await run.testForgotPW(driver);
    await run.testSignIn(driver);
    await run.postAccountURLTest(driver);
    await run.testEnterButton(driver);
    await run.multiLoginAttempt(driver);
    await run.copyPastePassword(driver);
    await run.getPasswordByValue(driver); //If fail, then that means history isn't cleared. Attacker can go back and view pages that user viewed, sign back in, and/or steal pw
    await run.openNewBrowser(driver);     //If can open multiple browsers and sign in to diff account each, allows people to deploy multiple bots to your site more easily
})();
