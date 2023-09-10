
const data = require('./FakeHotshotData.json');
const fs = require('fs');

const _SCORING = {
    "green" : 5,
    "yellow": 4,
    "gray": 3,
    "blue": 2,
    "red": 1
};

const determineMissedShots = (madeShots, attemptedShots) => {
    return attemptedShots.filter(shot => !madeShots.includes(shot));
}

const redShots = (missedShots, madeShots) => {
    let missedRedShots = 0;
    let madeRedShots = 0;
    let deductScore = 0;

    missedShots.forEach(shot => {
        if(shot === "red1" || shot === "red2") {
            deductScore = deductScore + 2;
            missedRedShots++;
        }
    })

    madeShots.forEach(shot => {
        if(shot === "red1" || shot === "red2") {
            madeRedShots++;
        }
    })

    return {
        "missedRedShots": missedRedShots,
        "madeRedShots": madeRedShots,
        "deduct": deductScore
    }
}

const createDescriptiveRoundMap = (rounds, descriptiveRoundMap) => {
    let cumalativeScore = 0;

    rounds.forEach((round, index) => {

        const countMadeShots = round.made_shots.length;
        const countAttemptedShots = round.attempted_shots.length;
        const totalRoundShots = countAttemptedShots;

        // Made shots per spot color
        const madeShotCounts = new Map();
        let madeShotScore = 0;

        round.made_shots.forEach(shot => {
            const spotNumber = shot.slice(-1);
            const spotColor = shot.substring(0, shot.indexOf(spotNumber));

            madeShotCounts.set(spotColor, (madeShotCounts.get(spotColor) || 0) + 1);
            madeShotScore = madeShotScore + _SCORING[spotColor];
        });

        // 2 points are deducted for missed red shots. No points deducted for missed bonus red shots.
        const allMissedShots = determineMissedShots(round.made_shots, round.attempted_shots);
        const redShotCounts = redShots(allMissedShots, round.made_shots);

        if (redShotCounts.madeRedShots <= 2) {
            cumalativeScore = cumalativeScore + madeShotScore - redShotCounts.deduct;
        } else {
            cumalativeScore = cumalativeScore + 0;
        }
        // cumalativeScore = cumalativeScore + madeShotScore - missedRedShots.deduct;
        descriptiveRoundMap.set(index + 1, {
            "totalRoundShots": totalRoundShots,
            "madeShotCountsByColor" : madeShotCounts,
            "madeShotScore": madeShotScore,
            "cumalativeScore": cumalativeScore,
            "allMissedShots": allMissedShots
        });
    });
    // console.log(descriptiveRoundMap);
    return descriptiveRoundMap;
};

const createScoreboard = () => {
    const fakeGameData = data;
    const rounds = JSON.parse(JSON.stringify(fakeGameData)).data;

    const descriptiveRoundMap = new Map();
    createDescriptiveRoundMap(rounds, descriptiveRoundMap);
    return descriptiveRoundMap;
}

module.exports = {
    createScoreboard,
    determineMissedShots,
    redShots,
    createDescriptiveRoundMap
};