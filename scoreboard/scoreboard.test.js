const testGameData = require('./FakeHotshotData.json');
const Scoreboard = require("./scoreboard");

describe('Hotshot Scoreboard', () => {
    it('Correctly counts all missed shots.', () => {
        const round = {
            'made_shots': ['green1', 'yellow1', 'gray2', 'blue1'],
            'attempted_shots': ['green1', 'yellow1', 'gray2', 'blue1', 'red2']
        };

        const numMissedShots = Scoreboard.determineMissedShots(round.made_shots, round.attempted_shots);
        expect(numMissedShots.length).toEqual(1);

        // Test fail cases
        expect(() => { Scoreboard.determineMissedShots(round.made_shots); }).toThrow("Missing shot data");
        expect(() => { Scoreboard.determineMissedShots(round.attempted_shots); }).toThrow("Missing shot data");
        expect(() => { Scoreboard.determineMissedShots(); }).toThrow("Missing shot data");
    });

    it('Correctly maps out information about red shots made during a round. ', () => {
        // Test counting is correct 1
        const round = {
            'made_shots': ['green1', 'yellow1', 'gray2', 'blue1'],
            'attempted_shots': ['green1', 'yellow1', 'gray2', 'blue1', 'red2']
        };

        const numMissedShots = Scoreboard.determineMissedShots(round.made_shots, round.attempted_shots);
        const redShots = Scoreboard.redShots(numMissedShots, round.made_shots);

        expect(redShots.missedRedShots).toEqual(1);
        expect(redShots.madeRedShots).toEqual(0);
        expect(redShots.deduct).toEqual(2);


        // Test fail cases
        expect(() => { Scoreboard.redShots(numMissedShots); }).toThrow("Missing shot data");
        expect(() => { Scoreboard.redShots(round.made_shots); }).toThrow("Missing shot data");
        expect(() => { Scoreboard.redShots(); }).toThrow("Missing shot data");
    });

    it('Correctly creates an object with computed data about each round in a game.', () => {
        const rounds = JSON.parse(JSON.stringify(testGameData)).data;
        const descriptiveRoundMap = new Map();
        const descriptiveGame = Scoreboard.createDescriptiveRoundMap(rounds, descriptiveRoundMap); // Should probably mock this out
        const madeShotCountsByColorMap = new Map();
        madeShotCountsByColorMap.set('green', 1);
        madeShotCountsByColorMap.set('yellow', 1);
        madeShotCountsByColorMap.set('blue', 3);
        madeShotCountsByColorMap.set('red', 2);
        madeShotCountsByColorMap.set('gray', 2);

        // Check that it mapped a single round correctly.
        const roundThree = descriptiveGame.get(3);
        expect(roundThree.totalRoundShots).toEqual(9);
        expect(roundThree.madeShotCountsByColor).toEqual(madeShotCountsByColorMap);
        expect(roundThree.roundScore).toEqual(23);
        expect(roundThree.cumalativeScore).toEqual(56);
        expect(roundThree.allMissedShots.length).toEqual(0);

        const roundEight = descriptiveGame.get(8);
        expect(roundEight.roundScore).toEqual(10);

        // Fail cases.
        expect(() => { Scoreboard.createDescriptiveRoundMap(rounds); }).toThrow("");
        expect(() => { Scoreboard.createDescriptiveRoundMap(); }).toThrow("");
    });

    it('Correctly determines, if the user gets an Heatcheckround.', () => {
        expect(Scoreboard.getsHeatcheckUpgrade(50)).toBe(true);
        expect(Scoreboard.getsHeatcheckUpgrade(0)).toBe(false);

        expect(() => { Scoreboard.getsHeatcheckUpgrade(); }).toThrow("Missing Score");
    });

    it('Calculates a round score correctly.', () => {
        const round = {
            'made_shots':  ['green1', 'yellow1', 'blue2', 'red1', 'blue2', 'gray2', 'gray1', 'red2', 'blue1'], // 5 + 4 + 2 + 1 + 2 +  3 + 3 + 1 + 2 == 23
            'attempted_shots':  ['green1', 'yellow1', 'blue2', 'red1', 'blue2', 'gray2', 'gray1', 'red2', 'blue1'],
            'made_bonus_shots': ['green1', 'yellow1', 'gray2']
        };

        const roundScore = Scoreboard.getRoundScore(round);
        expect(roundScore).toEqual(23);

        const roundEight = {
            'made_shots': ['green1', 'yellow1', 'gray2'],
            'attempted_shots': ['green1', 'yellow1', 'gray2', 'blue1', 'red2']
        };

        const roundEightScore = Scoreboard.getRoundScore(roundEight);
        expect(roundEightScore).toEqual(10);
        // Fail cases
        expect(() => {Scoreboard.getRoundScore(); }).toThrow("Missing round data.");
    });

    it('Creates correct mapping of colored spots to shot counts.', () => {
        const round = {
            'made_shots': ['green1', 'yellow1', 'blue2', 'red2'],
            'attempted_shots': ['green1', 'yellow1', 'blue2', 'red2']
        };

        const allowedColors = ["green", 'yellow', 'gray', 'blue', 'red'];

        const madeShotCountsByColor = Scoreboard.getMadeShotCounts(round);
        expect(madeShotCountsByColor.size).toEqual(4);

        for (let [color, shotCount] of madeShotCountsByColor) {
            expect(allowedColors).toContain(color);
            if (color = "blue") {
                expect(shotCount).toEqual(1);
            }
        }

        // Fail cases
        expect(() => { Scoreboard.getMadeShotCounts(); }).toThrow("Missing round data.");

    });

    it('Correcty determines if the player should get a heatcheck upgrade.', () => {
        const round =             {
            "made_shots": ["green1", "yellow1", "gray2", "blue2","green1", "yellow1", "gray2", "blue2","green1", "yellow1", "gray2", "blue2","green1", "yellow1", "gray2", "blue2"],
            "attempted_shots": []
        };

        const roundScore = Scoreboard.getRoundScore(round);
        expect(roundScore).toEqual(56);

        const getsUpgrade = Scoreboard.getsHeatcheckUpgrade(roundScore);
        expect(getsUpgrade).toBe(true);
        expect(Scoreboard.getsHeatcheckUpgrade(15)).toBe(false);

        // Fail cases
        expect(() => { Scoreboard.getsHeatcheckUpgrade(); }).toThrow('');
    });

    it('Correctly calculates heatcheck score.', () => {
        const round = {
            'made_shots': ['green1', 'yellow1', 'blue2', 'red1', 'blue2', 'gray2', 'gray1', 'red2', 'blue1'],
            'attempted_shots':  ['green1', 'yellow1', 'blue2', 'red1', 'blue2', 'gray2', 'gray1', 'red2', 'blue1'],
            'made_bonus_shots': ['green1', 'yellow1', 'gray2'] // 10, 8, 6
        };

        // Test when in Round 1-9
        const heatcheckScore1 = Scoreboard.getHeatcheckScore(2, round);
        expect(heatcheckScore1).toEqual(36);

        // Test when in round 10
        const heatcheckScore2 = Scoreboard.getHeatcheckScore(10, round);
        expect(heatcheckScore2).toEqual(24);

        // Fail cases
        expect(() => { Scoreboard.getHeatcheckScore(); }).toThrow('');
        expect(() => { Scoreboard.getHeatcheckScore(2); }).toThrow('');
        expect(() => { Scoreboard.getHeatcheckScore(null, round); }).toThrow('');
    });

    it('Correcty determines if the player should get a GOAT upgrade.', () => {
        const goodRound = {
            'made_shots': ['green1', 'yellow1', 'blue2', 'red1', 'blue2', 'gray2', 'gray1', 'red2', 'blue1'],
        }

        expect(Scoreboard.getsGOATUpgrade(goodRound)).toBe(true);

        const badRound = {
            'made_shots': ['green1'],
        }

        expect(Scoreboard.getsGOATUpgrade(badRound)).toBe(false);

        // Fail cases
        const failRound = {
            'attempted_shots': ['green1'],
        }
        expect(() => { Scoreboard.getsGOATUpgrade(); }).toThrow('Missing round data.');
        expect(() => { Scoreboard.getsGOATUpgrade(failRound); }).toThrow('Missing round data.');
        expect(() => { Scoreboard.getsGOATUpgrade(2); }).toThrow('Missing round data.');
    });

    it('Correctly calculates GOAT score.', () => {
        const round = {
            'made_shots': ['green1', 'yellow1', 'blue2', 'red1', 'blue2', 'gray2', 'gray1','red2', 'blue1'],
            'attempted_shots':  ['green1', 'yellow1', 'blue2', 'red1', 'blue2', 'gray2', 'gray1', 'red2', 'blue1'],
            'made_bonus_shots': ['green1', 'yellow1', 'gray2'] // 5,4,3 = 12
        };

        expect(Scoreboard.getRoundScore(round)).toBe(23);

        // Round 1-9 test
        expect(Scoreboard.getGOATScore(2, round)).toBe(12);

        // Round 10 test
        expect(Scoreboard.getGOATScore(10, round)).toBe(12);
    });

    it("Corretly creates the scoreboard array.", () => {
        const scoreboard = Scoreboard.createScoreboard(testGameData);
        expect(scoreboard).toEqual([9, 21, 56, 68, 75, 75, 90, 100, 114, 129]);

        // Fail cases
        expect(() => { Scoreboard.createScoreboard(); }).toThrow('No game data.');
    });

  });