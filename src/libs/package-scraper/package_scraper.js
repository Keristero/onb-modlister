const { Worker } = require('worker_threads');
const worker_script = `./package-scraper/scrape_package.js`
const max_parsing_time = 1000

function scrape_package(zip_path){
    //Spawn a worker to scrape the zip for us, if we catch it slacking, kill it
    return new Promise(async (resolve,reject)=>{
        let timeout = setTimeout(()=>{
            //automatically kill the mod scraping after a duration is up
            console.log(`worker is taking too long to parse file, aborting parsing of mod`)
            worker.terminate()
        },max_parsing_time)
        
        const worker = new Worker(worker_script, {
            workerData: zip_path
        });
        worker.on('message',(data)=>{
            resolve(data)
        });
        worker.on('error', (error)=>{
            reject(error)
        });
        worker.on('exit', (code) => {
            clearTimeout(timeout)
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    })
}

module.exports = {scrape_package}