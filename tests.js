const {Builder, By, Key, until} = require("selenium-webdriver");  
import {pageObject} from "./pageObject"  //must do: npm install --save esm, then to run: node -r esm index.js, otherwise npm won't recognize import

const randomEmail = Math.floor(Math.random()*1000000) + "@gmail.com";
const emails = [randomEmail, "pewpew@hotmail.com", "talosPrinciple@hotmail.com", "next@gmail.com", "marthaTalks@gmail.com", "pingu95@yahoo.com", "mona_lisa@gmail.com", "CommanderShepard@gmail.com"]; //if email already taken, try next one  
const password = "password"; //password to use to create new account 
const validEmail = "happy@hotmail.com"; //Manually created valid account used for testing 
const validPW =  "happy"; // Valid password for valid happy@hotmail.com account 
const validName = "Happy Feet"; // Name of account happy@hotmail.com
const validEmailUpCase = validEmail.toUpperCase(); //Used later for testing
const validPWUpCase = validPW.toUpperCase(); //Used later for testing

//An array of test values for one of the tests (some objects contain a function for secondary testing) 
const testCases = [
    {
        case: "Test if valid email and valid password allows login",
        email: validEmail,
        password: validPW,
        expect: "logged in"
    },
    {
        case: "Test if valid email and invalid password allows login",
        email: validEmail,
        password: "wrongPW",
        expect: "unable to login",
        assert: async function(driver){
            console.log("Test if error message displays when login fails");
            let testPass = true;
            await pageObject.login.alert(driver).catch((err)=>{
                testPass = false;
                console.log("Test failed: error message does not appear when login fails")
            });
            if (testPass){console.log("Test passed: error message displays when login fails");}
        }
    },
    {
        case: "Test case sensitivity of email using valid login credentials",
        email: validEmailUpCase,
        password: validPW,
        expect: "logged in"
    },
    {
        case: "Test case sensitivity of password using valid email and uppercase pw",
        email: validEmail,
        password: validPWUpCase,
        expect: "unable to login"
    },
    {
        case: "Test if empy email allows login",
        email: "empty",
        password: validPW,
        expect: "unable to login"
    },
    {
        case: "Test if empty password allows login",
        email: validEmail,
        password: "empty",
        expect: "unable to login"
    },
    {
        case: "Test if empy email and empty password allows login by clicking login",
        email: "empty",
        password: "empty",
        expect: "unable to login"
    },
    {
        case: "Test SQL injection attack in email field",
        email: `xxx@xxx.xxx' OR 1 = 1 LIMIT 1 -- ' ]`,
        password: validPW,
        expect: "unable to login"
    },
    {
        case: "Test SQL injection attack into password field",
        email: validEmail,
        password: `password' OR 1=1`,
        expect: "unable to login"
    },
    {
        //I'm not concerned about inserting iframe into login field, but if this were a comment field
        //then database could serve up iframe and/or script to other users if field not sanitized
        case: "Test cross-scripting vulnerability",
        email: `N"> == $0 <iframe src="http:\/\/www.hotmail.com" class="box"></iframe><input type="text`, 
        password: "<script>let i = 0; do{i++}while(true);</script>",      
        expect: "unable to login",
        assert: async function(driver){
            let input = await pageObject.login.email(driver).getAttribute("value");
            if (/[<>=]+/.test(input)){
                console.log("Secondary test failed: input not sanitized, dangerous characters remain");
            } else {
                console.log("Secondary test passed: dangerous characters sanitized");
            }
        } 
    }
];


//Functions that will be called in the following tests 
async function getLoginPage(driver){
    await driver.get(pageObject.URL.home);
    await pageObject.topBar.login(driver).click();
}

async function signOut(driver) {
    await pageObject.topBar.logout(driver).click();
}

async function validSignIn(driver){ 
    await pageObject.login.email(driver).sendKeys(validEmail);
    await pageObject.login.passwd(driver).sendKeys(validPW);
    await pageObject.login.submitLogin(driver).click();
}


//Each of these functions are self-contained tests that can be run individually or as part of test suite
export async function createAccount(driver) {
    console.log("Test ability to create new account");
    await getLoginPage(driver);
    let loop;
    let i = 0;
    //Here I could have checked character limit of create email field, but it is beyond scope of assignment
    do{
        loop = false;
        await pageObject.login.emailCreate(driver).sendKeys(emails[i]);
        await pageObject.login.submitCreate(driver).click();
        await driver.sleep(2000); 
        await pageObject.createAccount.firstname(driver).catch( (err) => { 
            console.log("Invalid/taken email, try another email. Index: " + i);
            i++;
            loop = true;
        });   
        if (loop){
            await pageObject.login.emailCreate(driver).clear();
        }
    } while(loop && i < emails.length);

    //Fill out the required fields in create account form
    await pageObject.createAccount.firstname(driver).sendKeys("John");
    await pageObject.createAccount.lastname(driver).sendKeys("Johnson");
    await pageObject.createAccount.password(driver).sendKeys(password);
    await pageObject.createAccount.address1(driver).sendKeys("123 Fake St");
    await pageObject.createAccount.city(driver).sendKeys("NYC");
    await pageObject.createAccount.state(driver).click();
    await pageObject.createAccount.stateNY(driver).click();
    await pageObject.createAccount.postcode(driver).sendKeys("12345");
    await pageObject.createAccount.mobile(driver).sendKeys("5194752345");
    await pageObject.createAccount.alias(driver).sendKeys("321 Fake St");
    await pageObject.createAccount.submitAccount(driver).click();
    await driver.sleep(2000); 
    let title = await driver.getTitle();
    if (title == pageObject.account.title){console.log("Test pass: Account successfully created.");}
    else {console.log("Test fail: Failed to create account");} 
    await signOut(driver);
}

export async function testSignIn(driver) {
    console.log("Initiate test of various email and password values");
    await getLoginPage(driver); 
    for(let i = 0; i<testCases.length; i++){
        console.log(testCases[i].case);
        console.log(`Login with email: ${testCases[i].email}, password: ${testCases[i].password}`);
        if(testCases[i].email !== "empty"){
            await pageObject.login.email(driver).sendKeys(testCases[i].email);
        }
        if(testCases[i].password !== "empty"){
            await pageObject.login.passwd(driver).sendKeys(testCases[i].password);
        }
        await pageObject.login.submitLogin(driver).click();
        let title = await driver.getTitle();
        if (title == pageObject.account.title){
            if (testCases[i].expect == "logged in"){
                console.log("Test passed: login successful");
            } else{
                console.log("Test failed: login should not be successful");
            }
            await pageObject.topBar.logout(driver).click();
        } else {
            if (testCases[i].expect == "unable to login"){
                console.log("Test passed: could not login");
            } else{
                console.log("Test failed: should be able to login");
            }
            if (testCases[i].hasOwnProperty("assert")){
                testCases[i].assert(driver);
            }
            await pageObject.login.email(driver).clear();
            await pageObject.login.passwd(driver).clear();
        }      
    }
}

export async function testForgotPW(driver){
    console.log("Test if can click forgot password link, which should take you to another page");
    await getLoginPage(driver);
    await pageObject.login.forgotPW(driver).click();
    let title = await driver.getTitle();
    if (title == pageObject.forgotPW.title){
        console.log("Test passed: Forgot password link works");
    } else {
        console.log("Test failed: Forgot password link does not work");
    }
}

export async function postAccountURLTest(driver){
    console.log("Test if can access account after logout by posting account URL");
    await getLoginPage(driver);
    await validSignIn(driver);
    await signOut(driver);
    await driver.get(pageObject.URL.account);
    let title = await driver.getTitle();
    if (title == pageObject.account.title){
        console.log("Test failed: Posting account URL after logout allows access back into account");
    } else {
        console.log("Test passed: Posting account URL after logout does not allow re-entry to account");
    }
}

export async function testEnterButton(driver){
    console.log("Test enter button after entering valid login credentials");
    await getLoginPage(driver);
    await pageObject.login.email(driver).sendKeys(validEmail);
    await pageObject.login.passwd(driver).sendKeys(validPW);
    await pageObject.login.passwd(driver).sendKeys(Key.ENTER);
    await driver.sleep(2000); 
    let title = await driver.getTitle();
    if (title == pageObject.account.title){
        console.log("Test passed: logged in successfully using enter button");
        console.log("Test if pressing back logs out user");
        await driver.navigate().back();
        await driver.navigate().forward();
        title = await driver.getTitle();
        if (title == pageObject.account.title){
            console.log("Test passed: pressing back does not log out user");
        } else {
            console.log("Test failed: pressing back logs out user");
        }
    } else {
        console.log("Test failed: pressing enter after correct login credentials does not log in user");
    }
    await signOut(driver);
}

export async function multiLoginAttempt(driver){
    console.log("Test how many times I can attempt to login with valid email");
    await getLoginPage(driver);
    await pageObject.login.email(driver).sendKeys(validEmail);
    for (let i = 1; i <= 5; i++){
        await pageObject.login.passwd(driver).sendKeys(i);
        await pageObject.login.submitLogin(driver).click();
    }
    await pageObject.login.passwd(driver).clear();
    await pageObject.login.passwd(driver).sendKeys(validPW);
    await pageObject.login.submitLogin(driver).click();
    let title = await driver.getTitle();
    if (title == pageObject.account.title){
        console.log("Test failed: Multi-login attempts allowed");
    } else {
        console.log("Test passed: Multi-login attempts not allowed");
    }
    await signOut(driver);
}

export async function copyPastePassword(driver){
    console.log("Test if password is visible/can be copied");
    await getLoginPage(driver);
    let elem = await pageObject.login.passwd(driver);
    await elem.sendKeys("CopyMe");
    await elem.sendKeys(Key.CONTROL, 'a');
    await elem.sendKeys(Key.CONTROL, 'c');
    let elem2 = await pageObject.login.email(driver);
    await elem2.sendKeys(Key.CONTROL, 'v');
    await elem2.sendKeys(Key.ENTER);
    let input = await elem2.getAttribute("value");
    if (input !== "CopyMe"){
        console.log("Test passed: Cannot copy and paste password");
    }else{
        console.log("Test failed: Password successfully copied and pasted");
    }
}
 
export async function getPasswordByValue(driver){
    console.log("Test if password still stored in history after signing out"); 
    await getLoginPage(driver);
    let elem = await pageObject.login.passwd(driver);
    await elem.sendKeys(validPW);
    await elem.sendKeys(Key.ENTER);  
    await driver.sleep(2000); 
    let elem2 = await pageObject.login.email(driver);
    await elem2.sendKeys(validEmail);
    await elem2.sendKeys(Key.ENTER);
    await driver.sleep(2000); 
    await signOut(driver);
    await driver.sleep(2000); 
    await driver.navigate().back();
    await driver.navigate().back();
    await driver.sleep(2000); 
    let input = await pageObject.login.passwd(driver).getAttribute("value");
    if (input == validPW){
        console.log("Test failed: Your password is: " + input);
    } else {
        console.log("Test passed: I cannot see your password");
    }
}

export async function openNewBrowser(driver){
    console.log("Test if opening new browser while logged-in allows you to sign-in again");
    await getLoginPage(driver);
    await validSignIn(driver); 
    let driver2 = await new Builder().forBrowser("firefox").build();
    await driver2.get(pageObject.URL.home);
    let testPass = true;
    await pageObject.topBar.account(driver2).catch((err)=>{
        testPass = false;
        console.log("Test failed: opening new browser while logged-in allows you to sign in again");
    });
    if (testPass){
        console.log("Test passed: opening new browser while logged-in does not allow you to sign in again with another account");
    } 
    await signOut(driver);
}

