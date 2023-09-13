
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
    if (!madeShots || !attemptedShots) {
        throw new Error("Missing shot data");
    };

    return attemptedShots.filter(shot => !madeShots.includes(shot));
}

const getsHeatcheckUpgrade = (roundScore) => {
    if (typeof roundScore === 'undefined') {
        throw new Error('Missing Score');
    }

    return roundScore > 30;
}

const getsGOATUpgrade = (round) => {
    if (!round || !round.made_shots) {
        throw new Error('Missing round data.');
    }

    const allSpots = ['green1', 'yellow1', 'gray2', 'gray1', 'blue1', 'blue2', 'red1', 'red2',  'red2'];

    const allSpotsMade = allSpots.every(spot => round.made_shots.includes(spot));

    return allSpotsMade;
}

const redShots = (missedShots, madeShots) => {
    if (!missedShots || !madeShots) {
        throw new Error("Missing shot data");
    };

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

const getRoundScore = (round) => {
    if (!round) {
        throw new Error('Missing round data.');
    }

    let madeShotScore = 0;
    const madeShots = round.made_shots;

    if (madeShots.length) {
        round.made_shots.forEach(shot => {
            const spotNumber = shot.slice(-1);
            const spotColor = shot.substring(0, shot.indexOf(spotNumber));
            madeShotScore = madeShotScore + _SCORING[spotColor];
        });
    }

    return madeShotScore;
}

const getMadeShotCounts = (round) => {
    if (!round) {
        throw new Error('Missing round data.');
    }

    const madeShotCounts = new Map();

    round.made_shots.forEach(shot => {
        const spotNumber = shot.slice(-1);
        const spotColor = shot.substring(0, shot.indexOf(spotNumber));

        madeShotCounts.set(spotColor, (madeShotCounts.get(spotColor) || 0) + 1);
    });

    return madeShotCounts;
};

const getHeatcheckScore = (currentRound, roundData) => {
    // @Note - for a production application, I would do more strict type checking.
    if (!roundData || !currentRound) {
        throw new Error('Error getting heatcheck round score: Missing round data.');
    }

    const roundScore = getRoundScore(roundData);
    let heatcheckBonusScore = 0;
    const numBonusShots = 3;
    const madeBonusShots = roundData.made_bonus_shots;

    if (madeBonusShots && madeBonusShots.length !== 0) {
        if (currentRound !== 10) {
            for (let i = 0; i < numBonusShots; i++) {
                const bonusShot = madeBonusShots[i];
                const spotNumber = bonusShot.slice(-1);
                const spotColor = bonusShot.substring(0, bonusShot.indexOf(spotNumber));
                const pointsForShot = _SCORING[spotColor] * 3;

                heatcheckBonusScore = heatcheckBonusScore + pointsForShot
            }
        } else {
            for (let i = 0; i < madeBonusShots.length; i++) {
                const bonusShot = madeBonusShots[i];
                const spotNumber = bonusShot.slice(-1);
                const spotColor = bonusShot.substring(0, bonusShot.indexOf(spotNumber));
                const pointsForShot = _SCORING[spotColor] * 2;

                heatcheckBonusScore = heatcheckBonusScore + pointsForShot
            }
        }
    }

    return heatcheckBonusScore;

}

const getGOATScore = (currentRound, roundData) => {
    if (!roundData || !currentRound) {
        throw new Error('Error getting heatcheck round score: Missing round data.');
    }

    return "getGOATScore";
}

const createDescriptiveRoundMap = (rounds, descriptiveRoundMap) => {
    let cumalativeScore = 0;

    rounds.forEach((round, index) => {
        const currentRound = index + 1;
        const countMadeShots = round.made_shots.length;
        const countAttemptedShots = round.attempted_shots.length;
        const totalRoundShots = countAttemptedShots;
        const allMissedShots = determineMissedShots(round.made_shots, round.attempted_shots);
        const redShotCounts = redShots(allMissedShots, round.made_shots);
        const madeShotCountsByColor = getMadeShotCounts(round);
        let roundScore = getRoundScore(round);
        cumalativeScore = cumalativeScore + roundScore - redShotCounts.deduct;

        // Handle heatcheck bonus round

        // @NOTE -
        // It is possible that a player earns both a heatcheck upgrade and a GOAT upgrade.
        // The sample API payload shows one entry "made_bonus_shots" - It doesn't seem possible to decipher
        // if the shot should count as a Heatcheck shot (3x points) or a GOAT check shot. But since they are exclusive, I
        // am making a determination to just count `made_bonus_shots` as representing both. This is something I would clarify
        // before putting into production.


        // add heatcheck functions here.
        if (getsHeatcheckUpgrade(roundScore)) {
            const heatcheckScore = getHeatcheckScore(currentRound, round);
        }

        if (getsGOATUpgrade(round)) {
            const goatScore = getGOATScore(currentRound, round);
        }


        // Void round points at the end if the user made more than 1 layup.
        // @note - this could probably be done sooner to avoid all the calculating we have to do.
        if (redShotCounts.madeRedShots > 2) {
            roundScore = 0;
            cumalativeScore = cumalativeScore + roundScore;
        }

        descriptiveRoundMap.set(currentRound, {
            "totalRoundShots": totalRoundShots,
            "madeShotCountsByColor" : madeShotCountsByColor,
            "roundScore": roundScore,
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
    createDescriptiveRoundMap,
    getsHeatcheckUpgrade,
    getRoundScore,
    getMadeShotCounts,
    getHeatcheckScore,
    getsGOATUpgrade
};