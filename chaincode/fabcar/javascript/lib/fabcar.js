/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const music = [
            {
                hashes: 'hashesHere',
                date: date+' '+time,
                copyrightID: 'CopyrightIDHere',
                owner: 'OwnerHere',
            },
        ];

        for (let i = 0; i < music.length; i++) {
            music[i].docType = 'music';
            await ctx.stub.putState('music' + i, Buffer.from(JSON.stringify(music[i])));
            console.info('Added <--> ', music[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryMusicByNumber(ctx, musicNumber) {
        const musicAsBytes = await ctx.stub.getState(musicNumber); // get the music from chaincode state
        if (!musicAsBytes || musicAsBytes.length === 0) {
            throw new Error(`${musicNumber} does not exist`);
        }
        console.log(musicAsBytes.toString());
        return musicAsBytes.toString();
    }

    async createMusic(ctx, musicNumber, hash, owner, date, copyrightID) {
        console.info('============= START : Create Music Entry ===========');
        
        const music = {
            hash,
            docType: 'music',
            date,
            copyrightID,
            owner,
        };

        await ctx.stub.putState(musicNumber, Buffer.from(JSON.stringify(music)));
        console.info('============= END : Create Music Entry ===========');
    }

    async queryAllMusic(ctx) {
        const startKey = 'music0';
        const endKey = 'music999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }


}

module.exports = FabCar;
