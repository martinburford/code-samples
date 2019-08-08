<?php
// If debugging is required, enable a JSON contentType, and print_r the output to the screen (as below)
// header('Content-Type: application/json; charset=utf8');
// print_r(json_encode($fixtures));
// print_r(json_encode($score));
// print_r(json_encode($liveFeed));
// print_r(json_encode($inSummary));

require('pusher.php');

$app_id = '74568'; 
$app_key = 'a17cec27e7effdc82f72'; 
$app_secret = '16f19f1fadef5ee0db0a'; 

$pusher = new Pusher($app_key,$app_secret,$app_id);

// Simulate a pusher event to the Fixtures component
$fixtures = array(
  'fixtures' => array(
    'content' => array(
      array(
        'active' => true,
        'eventType' => 'goal',
        'finished' => true,
        'id' => 21,
        'period' => 'ShootOut',
        'status' => 'Full Time',
        'homeTeam' => array(
          'score' => 3,
          'penaltyShots' => array(
            array(
              'playerName' => 'Penalty taker 1',
              'scored' => true
            ),
            array(
              'playerName' => 'Penalty taker 2',
              'scored' => true
            ),
            array(
              'playerName' => 'Penalty taker 3',
              'scored' => false
            )
          )
        ),
        'awayTeam' => array(
          'score' => 3,
          'penaltyShots' => array(
            array(
              'playerName' => 'Penalty taker 1',
              'scored' => true
            ),
            array(
              'playerName' => 'Penalty taker 2',
              'scored' => true
            ),
            array(
              'playerName' => 'Penalty taker 3',
              'scored' => true
            )
          )
        ),
        'url' => 'pushed-url3'
      )
    )
  )
);

// Simulate a pusher event to the Score component
$score = array(
  'score' => array(
    'metaData' => array(
      'kickOff' => 'DD4.MM4.YY4 HH2:MM4',
      'referee' => 'Firstname4 Surname4',
      'attendance' => 'xx,xxx4',
      'location' => 'Location name4'
    ),
    'content' => array(
      array(
        'finished' => true,
        'period' => 'ShootOut',
        'homeTeam' => array(
          'goalsScored' => array(
            array(
              'minuteOfGoal' => '31',
              'name' => 'Player 1',
              'typeOfGoal' => 'goal'
            )
          ),          
          'penaltyShots' => array(
            array(
              'playerName' => 'Penalty taker 1',
              'scored' => true
            ),
            array(
              'playerName' => 'Penalty taker 2',
              'scored' => true
            ),
            array(
              'playerName' => 'Penalty taker 3',
              'scored' => false
            )
          )
        ),
        'awayTeam' => array(
          'goalsScored' => array(
            array(
              'minuteOfGoal' => '31',
              'name' => 'Rooney',
              'typeOfGoal' => 'goal'
            )
          ),
          'penaltyShots' => array(
            array(
              'playerName' => 'Penalty taker 1',
              'scored' => true
            ),
            array(
              'playerName' => 'Penalty taker 2',
              'scored' => true
            ),
            array(
              'playerName' => 'Penalty taker 3',
              'scored' => true
            )
          )
        )
      )
    )
  )
);

// Simulate a pusher event to the Live Feed component
$liveFeed = array(
  'liveFeed' => array(
    'content' => array(
      array(
        'type' => 'blogPost',
        'id' => 13,
        'dataOrigin' => 'escenic',
        'timeOfPost' => 'HH:MM',
        'isKeyIncident' => true,
        'incidentType' => 'goal',
        'label' => 'Goal',
        'homeTeam' => 'Home team',
        'awayTeam' => 'Away team',
        'minuteOfPost' => 'xx mins',
        'title' => '(WS) Heading 11 at vero eos et accusamus et iusto odio...',
        'summaryText' => 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex commodo.'
      ),    
      array(
        'type' => 'blogPost',
        'id' => 12,
        'timeOfPost' => 'HH:MM',
        'isKeyIncident' => true,
        'incidentType' => 'yellow-card',
        'label' => 'Yellow Card',
        'homeTeam' => 'Home team',
        'awayTeam' => 'Away team',
        'minuteOfPost' => 'xx mins',
        'title' => '(WS) Heading 10 (updated) at vero eos et accusamus et iusto odio...',
        'summaryText' => 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex commodo.'
      )
    )
  )
);

// Simulate a pusher event to the In Summary component
$inSummary = array(
  'inSummary' => array(
    'content' => array(
      array(
        'data' => array(
          array(
            'title' => 'Possession (1st half)',
            'percentages' => true,
            'values' => array(
              'home' => 65,
              'away' => 35
            )
          ),
          array(
            'title' => 'Total shots',
            'percentages' => false,
            'values' => array(
              'home' => 5,
              'away' => 13
            )
          ),
          array(
            'title' => 'Possession (2nd half)',
            'percentages' => true,
            'values' => array(
              'home' => 80,
              'away' => 20
            )
          )
        )
      )
    )
  )
);

// Simulate a pusher event to the League Table component
$leagueTable = array(
  'leagueTable' => array(
    'content' => array(
      array(
        'title' => 'A',
        'countries' => array(
          array(
            'name' => 'Brazil',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Croatia',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Mexico',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Cameroon',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          )
        )
      ),
      array(
        'title' => 'B',
        'countries' => array(
          array(
            'name' => 'Spain',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Netherlands',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Chile',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Australia',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          )
        )
      ),
      array(
        'title' => 'C',
        'countries' => array(
          array(
            'name' => 'Columbia',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Greece',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Ivory Coast',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Japan',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          )
        )
      ),
      array(
        'title' => 'D',
        'countries' => array(
          array(
            'name' => 'Uruguay',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Costa Rica',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'England',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Italy',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          )
        )
      ),
      array(
        'title' => 'E',
        'countries' => array(
          array(
            'name' => 'Switzerland',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Ecuador',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'France',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Honduras',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          )
        )
      ),
      array(
        'title' => 'F',
        'countries' => array(
          array(
            'name' => 'Argentina',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Bosnia & H',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Iran',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Nigeria',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          )
        )
      ),
      array(
        'title' => 'G',
        'countries' => array(
          array(
            'name' => 'Germany',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Portugal',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Ghana',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'USA',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          )
        )
      ),
      array(
        'title' => 'H',
        'countries' => array(
          array(
            'name' => 'Belgium',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Algeria',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'Russia',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          ),
          array(
            'name' => 'South Korea',
            'statistics' => array(
              'played' => '3',
              'won' => '3',
              'drawn' => '3',
              'lost' => '3',
              'goalDifference' => '3',
              'points' => '3'
            )
          )
        )
      )
    )
  )
);

$pusher->trigger('premierLeague.fixtures','broadcast',json_decode(json_encode($fixtures)));
$pusher->trigger('premierLeague.695005.score','broadcast',json_decode(json_encode($score)));
$pusher->trigger('premierLeague.695005.liveFeed','broadcast',json_decode(json_encode($liveFeed)));
$pusher->trigger('premierLeague.695005.inSummary','broadcast',json_decode(json_encode($inSummary)));
$pusher->trigger('premierLeague.leagueTable','broadcast',json_decode(json_encode($leagueTable)));
?>