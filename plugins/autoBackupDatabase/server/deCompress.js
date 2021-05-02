const snappy = require('snappy');
const fileName = process.argv[2];
const outputFile = process.argv[3];
const fs = require('fs');

function main() {
    if (fileName === undefined) console.log('No Input File Defined...');
    if (outputFile === undefined) console.log('No Output File Defined...');
    if (fileName === undefined || outputFile === undefined) return;

    console.log(`[*] Reading Input Data - ${fileName}`);
    let filedata = fs.readFileSync(fileName);
    console.log('[*] Processing');
    let data = snappy.uncompressSync(new Buffer.from(filedata, 'binary'));
    console.log(`[*] Saving Output - ${outputFile}`);
    fs.writeFileSync(outputFile, data.toString())
    console.log('[*] Done!');
}
main()