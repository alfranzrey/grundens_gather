//set constant variables
const puppeteer = require('puppeteer');
const vo = require('vo');
const fs = require('fs');
const parse = require('csv-parse');
	
//get csv data first
var csvData=[];
fs.createReadStream('links.csv')
    .pipe(parse({delimiter: ':'}))
    .on('data', function(csvrow) {
        csvData.push(csvrow);        
    })
    .on('end',function() {
    });
//-----------------------
//-export file result
var exportToCSV = fs.createWriteStream('result.txt');
var header ='Link'  + '\t' +
			'Title'  + '\t' +
			'Description'  + '\t' +
            'Bullets'    + '\n';
console.log(header);
exportToCSV.write(header);
function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
           str += obj[p] + '\t';
        }
    }
    return str;
}
//-------------------------


//Main async function
(async function main() {
	try{
		//---------------
		const browser = await puppeteer.launch({
			headless: false});
		const page = await browser.newPage();
		page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36');
		//await page.setViewport({ width: 1920, height: 1080 });
		//block images and css
			await page.setRequestInterception(true);
		    page.on('request', (req) => {
		        if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
		            req.abort();
		        }
		        else {
		            req.continue();
		        }
		    });
		    //
		//

		//code starts here
		for(var i = 0; i < csvData.length; i++){
			var startT = new Date();
			await page.goto("https://"+csvData[i], {waitUntil: 'load', timeout: 0}); //bypass timeout
			await page.waitForSelector('#content');
			var title = "";
			var description = "";
			var bullets = "";

			if (await page.$('#content > div > h1') !== null){
				title = await page.evaluate(() => document.querySelector('#content > div > h1').innerText); 
				description = await page.evaluate(() => document.querySelector('#content > div > div.summary > div > p').innerText); 
				bullets = await page.evaluate(() => document.querySelector('#content > div > div.summary.entry-summary > form > div.rightside-variation-divide > ul').innerText); 
				bullets = bullets.replace(/\r?\n|\r/g, "|");
			}
			else{
				title = "_";
				description = "_";
				bullets = "_";
			}
			let row = {
					'Link':csvData[i],
			        'Title':title,
			        'Description':description,
			        'Bullets':bullets
			    }
			exportToCSV.write(objToString(row) + '\n','utf-8');
    		console.log(objToString(row)); 
    		var endT = new Date() - startT; //for ETC
            ETC(endT, csvData.length-i-1);
		}

		//end
		console.log("All done!");
		browser.close();
	}
	catch(err){
		console.log("!!!! >>>>>  my error",err);
	}

	function ETC(durationPerLoop, loopsRemaining){
        var etc = durationPerLoop * loopsRemaining;
        var secs = (etc / 1000).toFixed(2);
        var mins = (secs / 60).toFixed(2);
        var hours = (mins / 60).toFixed(2);
        var final_etc = "";
        if (hours >= 1) {
            final_etc = hours + " hour(s)";
        }
        if (hours < 1) {
            final_etc = mins + " min(s)";
        }
        if (mins < 1) {
            final_etc = secs + " sec(s)";
        }
        return console.log("ETC: "+final_etc+'\n');
    }
})();





	

