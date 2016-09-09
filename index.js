#!/usr/bin/env node
'use strict';

const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');

var program = require('commander');
var conditionals = [];

function list(val) {
    return val.split(',');
}

program
.version(pkg.version)
.arguments('<file>')
.option('--cond <cond>', 'A comma separated list of conditional names: --cond=debug,prod,staging', list, [])
.action(function(file) {
    program.file = file;
})
.parse(process.argv);

if (!program.file || !program.file.length){
    program.help();
    process.exit(8);
} else if (!fs.existsSync(program.file)) {
    console.error("The input file could not be found.");
    process.exit(1);
} else {
    conditionals = program.cond;
    program.file = fs.realpathSync(program.file);
}

var use_conditionals = false;
if (conditionals.length){
    use_conditionals = true;
}

var contents = fs.readFileSync(program.file).toString();
var filepath = path.dirname(program.file);
var found = 0;

function get_attrib(partial, attrib) {
    attrib += '=';
    var attrib_len = attrib.length;
    var start = partial.indexOf(attrib);
    if (start === -1) {
        return null;
    }
    start += attrib_len;
    var quoteType = partial.charAt(start);
    start ++;
    return partial.slice(start, partial.indexOf(quoteType, start))
}

while (found !== -1) {
    found = contents.indexOf('<partial', found);
    if (found === -1) {
        continue;
    }
    var end = contents.indexOf('>', found) + 1;
    if (contents.charAt(end) === "\n") {
        end++;
    }
    var partial = contents.slice(found, end).toString();
    if (use_conditionals === true) {
        var to_include = false;
        var values = get_attrib(partial, 'cond');
        if (values !== null) {
            var conds = values.split(',');
            var len = conds.length;
            if (len) {
                for (var x = 0; x < len; x++) {
                    if (conditionals.indexOf(conds[x]) != -1) {
                        to_include = true;
                        break;
                    }
                }
            }
            if (!to_include) {
                contents = contents.replace(partial, "");
                continue;
            }
        }
    }
    var src = get_attrib(partial, 'src');
    var partial_contents = '';
    if (src !== null) {
        if (!path.isAbsolute(src)) {
            src = path.normalize(filepath + '/' + src);
        }
        if (fs.existsSync(src) && src !== program.file) {
            partial_contents = fs.readFileSync(src).toString();
        }
    }
    contents = contents.replace(partial, partial_contents);
}
process.stdout.write(contents);