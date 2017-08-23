#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

fs.readdir('./', (err, files) => {
    const subtitles = files.filter(file => file.substr(-4) === '.ass');
    const video = files.filter(file => file.substr(-4) === '.mkv');
    console.log('Sub list:');
    console.log(subtitles);
    console.log('MKV list:');
    console.log(video);
    subtitles.forEach((file, idx) => {
        const pattern = /^Ep. (\d+)：(.+).ass$/i;
        const found = file.match(pattern);
        if (found) {
            const ep = found[1] > 9 ? 'E' + found[1] : 'E0' + found[1];
            const epName = found[2];
            const matchFile = video.find(item => item.indexOf(ep));
            if (matchFile) {
                fs.rename(matchFile, matchFile.replace(/2011/i, epName), (err) => {
                    err && throw err;
                });
                fs.rename(file, matchFile.replace(/\.mkv/, '.ass'), (err) => {
                    err && throw err;
                });
            }
        }
    });
})
