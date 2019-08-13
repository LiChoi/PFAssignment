const {Builder, By, Key, until} = require("selenium-webdriver");  
export const pageObject = {
    URL: {
        home: "http://automationpractice.com/index.php",
        account: "http://automationpractice.com/index.php?controller=my-account"
    },
    topBar: {
        login: function(driver){return driver.findElement(By.className('login'));},
        logout: function(driver){return driver.findElement(By.className('logout'));},
        account: function(driver){return driver.findElement(By.className('account'));}
    },
    login: {
        title: "Login - My Store",
        email: function(driver){return driver.findElement(By.id("email"));},
        passwd: function(driver){return driver.findElement(By.id("passwd"));},
        submitLogin: function(driver){return driver.findElement(By.id("SubmitLogin"));},
        forgotPW: function(driver){return driver.findElement(By.linkText("Forgot your password?"));},
        emailCreate: function(driver){return driver.findElement(By.id("email_create"));},
        submitCreate: function(driver){return driver.findElement(By.id("SubmitCreate"));},
        alert: function(driver){return driver.findElement(By.className("alert"));}
    },
    account: {
        title: "My account - My Store"
    },
    forgotPW: {
        title: "Forgot your password - My Store"
    },
    createAccount: {
        firstname: function(driver){return driver.findElement(By.id("customer_firstname"));},
        lastname: function(driver){return driver.findElement(By.id("customer_lastname"));},
        password: function(driver){return driver.findElement(By.id("passwd"));},
        address1: function(driver){return driver.findElement(By.id("address1"));},
        city: function(driver){return driver.findElement(By.id("city"));},
        state: function(driver){return driver.findElement(By.name("id_state"));},
        stateNY: function(driver){return driver.findElement(By.xpath(`//*[@id="id_state"]/option[34]`));},
        postcode: function(driver){return driver.findElement(By.id("postcode"));},
        mobile: function(driver){return driver.findElement(By.id("phone_mobile"));},
        alias: function(driver){return driver.findElement(By.id("alias"));},
        submitAccount: function(driver){return driver.findElement(By.id("submitAccount"));}
    }
};


