const Scoreboard = require("./scoreboard");

describe('Hotshot Scoreboard', () => {
    it('correctly counts all missed shots', () => {
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

    it('correctly maps out information about red shots made during a round. ', () => {
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

    it('correctly creates an object with computed data about each round in a game', () => {
        const descriptiveGame = Scoreboard.createScoreboard(); // Should probably mock this out
        const madeShotCountsByColorMap = new Map();
        madeShotCountsByColorMap.set('green', 1);
        madeShotCountsByColorMap.set('yellow', 1);
        madeShotCountsByColorMap.set('blue', 3);
        madeShotCountsByColorMap.set('red', 2);
        madeShotCountsByColorMap.set('gray', 2);
       // Check that it mapped a single round correctly.
        const roundThree = descriptiveGame.get(3);
        // console.log(roundThree);
        expect(roundThree.totalRoundShots).toEqual(9);
        expect(roundThree.madeShotCountsByColor).toEqual(madeShotCountsByColorMap);
        expect(roundThree.roundScore).toEqual(23);
        expect(roundThree.cumalativeScore).toEqual(44); // TO BE UPDATED
        expect(roundThree.allMissedShots.length).toEqual(0);
        // Need to test case wher round scor

       /*
       * Map(10) {
      1 => {
        totalRoundShots: 4,
        madeShotCountsByColor: Map(3) { 'green' => 1, 'gray' => 1, 'red' => 1 },
        madeShotScore: 9,
        cumalativeScore: 9,
        allMissedShots: [ 'blue2' ]
      },
      2 => {
        totalRoundShots: 5,
        madeShotCountsByColor: Map(4) { 'green' => 1, 'yellow' => 1, 'gray' => 1, 'blue' => 1 },
        madeShotScore: 14,
        cumalativeScore: 21,
        allMissedShots: [ 'red2' ]
      },
      3 => {
        totalRoundShots: 9,
        madeShotCountsByColor: Map(5) {
          'green' => 1,
          'yellow' => 1,
          'blue' => 3,
          'red' => 2,
          'gray' => 2
        },
        madeShotScore: 23,
        cumalativeScore: 44,
        allMissedShots: []
      },
      4 => {
        totalRoundShots: 4,
        madeShotCountsByColor: Map(4) { 'green' => 1, 'yellow' => 1, 'blue' => 1, 'red' => 1 },
        madeShotScore: 12,
        cumalativeScore: 56,
        allMissedShots: []
      },
      5 => {
        totalRoundShots: 5,
        madeShotCountsByColor: Map(2) { 'green' => 1, 'yellow' => 1 },
        madeShotScore: 9,
        cumalativeScore: 63,
        allMissedShots: [ 'gray2', 'blue2', 'red2' ]
      },
      6 => {
        totalRoundShots: 6,
        madeShotCountsByColor: Map(3) { 'red' => 3, 'green' => 1, 'blue' => 1 },
        madeShotScore: 10,
        cumalativeScore: 63,
        allMissedShots: []
      },
      7 => {
        totalRoundShots: 5,
        madeShotCountsByColor: Map(5) {
          'green' => 1,
          'yellow' => 1,
          'gray' => 1,
          'blue' => 1,
          'red' => 1
        },
        madeShotScore: 15,
        cumalativeScore: 78,
        allMissedShots: []
      },
      8 => {
        totalRoundShots: 5,
        madeShotCountsByColor: Map(3) { 'green' => 1, 'yellow' => 1, 'gray' => 1 },
        madeShotScore: 12,
        cumalativeScore: 88,
        allMissedShots: [ 'blue1', 'red2' ]
      },
      9 => {
        totalRoundShots: 4,
        madeShotCountsByColor: Map(4) { 'green' => 1, 'yellow' => 1, 'gray' => 1, 'blue' => 1 },
        madeShotScore: 14,
        cumalativeScore: 102,
        allMissedShots: []
      },
      10 => {
        totalRoundShots: 5,
        madeShotCountsByColor: Map(5) {
          'green' => 1,
          'yellow' => 1,
          'gray' => 1,
          'blue' => 1,
          'red' => 1
        },
        madeShotScore: 15,
        cumalativeScore: 117,
        allMissedShots: []
      }
    }

       */
    });

    it('correctly determines, if the user gets an Heatcheckround', () => {
        expect(Scoreboard.getsHeatcheckUpgrade(50)).toBe(true);
        expect(Scoreboard.getsHeatcheckUpgrade(0)).toBe(false);

        expect(() => { Scoreboard.getsHeatcheckUpgrade(); }).toThrow("Missing Score");
    });

    it('calculates a round score correctly.', () => {
        const round = {
            'made_shots': ['green1', 'yellow1', 'blue2', 'red2'],
            'attempted_shots': ['green1', 'yellow1', 'blue2', 'red2']
        };

        const roundScore = Scoreboard.getRoundScore(round);
        expect(roundScore).toEqual(12);

        // Fail cases
        expect(() => {Scoreboard.getRoundScore(); }).toThrow("Missing round data.");
    });

    it('Creates correct mapping of colored spots to shot counts', () => {
        const round = {
            'made_shots': ['green1', 'yellow1', 'blue2', 'red2'],
            'attempted_shots': ['green1', 'yellow1', 'blue2', 'red2']
        };

        const allowedColors = ["green", 'yellow', 'blue', 'red'];

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


    it.only('correcty determines if the player should get a heatcheck upgrade', () => {
        const round =             {
            "made_shots": ["green1", "yellow1", "gray2", "blue2","green1", "yellow1", "gray2", "blue2","green1", "yellow1", "gray2", "blue2","green1", "yellow1", "gray2", "blue2"],
        };

        const roundScore = Scoreboard.getRoundScore(round);
        expect(roundScore).toEqual(56);

        const getsUpgrade = Scoreboard.getsHeatcheckUpgrade(roundScore);
        expect(getsUpgrade).toBe(true);
        expect(Scoreboard.getsHeatcheckUpgrade(15)).toBe(false);

        // @TODO - Fail cases
        expect(() => { Scoreboard.getsHeatcheckUpgrade(); }).toThrow('');

    });

  });