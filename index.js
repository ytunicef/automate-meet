const puppeteer = require('puppeteer');

const { google } = require('googleapis');
const cron = require('node-cron');
require('dotenv').config();

// const puppet = require('./puppet');

// const spreadSheetId = "1qPyyDUIu-AdUZV3liuv64quWW9Fp9okoaK_AJiOdfrk"; MAIN
// const spreadSheetId = "1PhEQg8tK_1QnqTisAE5USiniaXuel8C9Vh2-ZMabE0g";
let rowno = 1;
const task = cron.schedule('*/1 16-20 * * 1-6',main);
task.start();

let starthr;
let startmin;

let stophr;
let stopmin;

async function main() {
    
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APP_CREDENTIALS,
        scopes: "https://www.googleapis.com/auth/spreadsheets.readonly"
    });
    
    const client = await auth.getClient();
    
    const googleSheets = google.sheets({
        version: "v4",
        auth: client,
    });
    
    // read rows
    
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: process.env.SHEET_ID,
        range: `Sheet1!A${rowno}:D${rowno}`,
    });

    const myArr = getRows.data.values[0];
    const start = myArr[0].replace(/\D+/g, ' ').trim().split(' ').map(e => parseInt(e));
    const stop = myArr[1].replace(/\D+/g, ' ').trim().split(' ').map(e => parseInt(e));
    console.log(start);
    console.log(stop);

    starthr = start[0];
    startmin = start[1];

    stophr = stop[0];
    stopmin = stop[1];

    const d = new Date();
    let minutes = d.getMinutes();
    let hours = d.getHours();


    console.log((starthr == hours && minutes == startmin));

    let task1;

    if(starthr == hours && minutes == startmin){
        console.log(myArr[3]);
        task1 = new cron('* * * * *', puppet(myArr[3],stophr,stopmin));
        task1.start();
    }

    if(stophr == hours && stopmin == minutes){
        rowno++;
        console.log(rowno);
        task1.stop()
        console.log("meeting quit");
    }
    
    // console.log(getRows.data.values[0]);
}



async function puppet(url, stophr, stopmin){
    const base_url = "https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin"
    // const loginurl1 = `https://accounts.google.com/signin/v2/identifier?ltmpl=meet&osid=1&continue=https%3A%2F%2Fmeet.google.com%2F${url}%3Fhs%3D196&flowName=GlifWebSignIn&flowEntry=ServiceLogin`;

    const browser = await puppeteer.launch({
        headless:false,
        args: ['--use-fake-ui-for-media-stream']
    });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36')
    // await page.goto( loginurl1, { waitUntil: 'networkidle0'});


		await page.goto(base_url,{
            waitUntil: 'domcontentloaded'
        });
		// Login Start
        await page.waitForSelector('input#identifierId');
		await page.type("input#identifierId", process.env.GMAIL_ID);
        await page.waitForTimeout(5000);
		await page.click("div#identifierNext");

		await page.waitForTimeout(7000);
        await page.waitForSelector("input[name=password]");

		await page.type("input[name=password]", process.env.PASSWORD, {
			delay: 0
		})
		await page.click("div#passwordNext");
		await page.waitForTimeout(7000);
        // await page.close();

        const page1 = await context.newPage();
        await page1.goto(url);
        // await page1.waitForTimeout(5000);
        // await page1.click("div.XfpsVe.J9fJmf > div.U26fgb.O0WRkf.oG5Srb.HQ8yf.C0oVfc.kHssdc.HvOprf.DEhM1b.M9Bg4d");
        await page1.waitForTimeout(3000);
        // await page1.click(".U26fgb.JRY2Pb.mUbCce.kpROve.yBiuPb.y1zVCf.HNeRed.M9Bg4d");
        await page1.$$eval('.U26fgb.JRY2Pb.mUbCce.kpROve.yBiuPb.y1zVCf.HNeRed.M9Bg4d', (options) => options.map((option) => option.click()));
        await page1.waitForTimeout(3000);
        await page1.click("div.uArJ5e.UQuaGc.Y5sE8d.uyXBBb.xKiqt");
        
        await page1.screenshot({ path: 'example.png' });

        await page1.waitForTimeout(1000);
        await page1.click('button[data-tooltip-id=tt-c11]');
               

      

      cron.schedule('*/1 * * * *', async () =>{
        const d = new Date();
        let minutes = d.getMinutes();
        let hours = d.getHours();
          console.log(stophr+ " "+ stopmin);
          console.log(hours+" "+minutes);

          console.log(stopmin-minutes);
          console.log(stopmin-minutes == 1);

          if(stopmin-minutes == 1){
            // await page1.waitForTimeout(2500);
            await page1.keyboard.type("257 P", { delay: 100 });
            await page1.keyboard.press('Enter');
          }


          if(stophr == hours && stopmin == minutes){
                await page1.click('.VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.tWDL4c.jh0Tpd.Gt6sbf.QQrMi.NKaD6');
                await page1.waitForTimeout(1500);
                await context.close();
                await browser.close();
          }
      });
  
      
}

// .U26fgb.JRY2Pb.mUbCce.kpROve.yBiuPb.y1zVCf.HNeRed.M9Bg4d id media on
// .U26fgb.JRY2Pb.mUbCce.kpROve.yBiuPb.y1zVCf.M9Bg4d.FTMc0c.N2RpBe.jY9Dbb if not on

// .VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.tWDL4c.jh0Tpd.Gt6sbf.QQrMi.NKaD6  end call