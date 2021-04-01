#!/usr/bin/env node

const {assembleTs, assembleIdl} = require('./assembler.js');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

function printHelp() {
    console.log(`\n  Usage: bikeshed-to-ts --in <file-path> --out <file-path> [flags]\n`);

    console.log('  Options:');
    console.log('    --in, -i\t\t Path to a bikeshed file to parse.');
    console.log('    --out, -o\t\t Path to a TypeScript definitions file to write.');
    console.log('    --forceGlobal, -f\t When present, all declarations will be added to the global context');
    console.log('    --idl, -I\t\t When present, prints webidl');
    console.log('    --nominal, -n\t When present, types declarations will be made nominal when possible');
    console.log('    --version, -v\t Print version and exit');
}

async function main(options) {
    if (options.help) {
        printHelp();
        return;
    }

    if (!options.in || !options.out) {
        console.error('This command requires the --in and --out options to be defined!');
        printHelp();
        return;
    }

    const forceGlobal = Boolean(options.forceGlobal);
    const safeNominalTypes = Boolean(options.nominal);
    const assemble = options.idl ? assembleIdl : assembleTs;
    const assembled = await assemble(options.in, forceGlobal, safeNominalTypes);

    // try to create the path to the file
    try {
        await fs.promises.mkdir(path.dirname(options.out), { recursive: true });
    } catch(e) {
        console.error(e);
    }

    // let it crash!
    await fs.promises.writeFile(options.out, assembled);
}

const argv = yargs(process.argv)
    .help(false)
    .alias('h', 'help')
    .alias('v', 'version')
    .alias('i', 'in')
    .alias('o', 'out')
    .alias('f', 'forceGlobal')
    .alias('I', 'idl')
    .alias('n', 'nominal')
    .argv
main(argv);
