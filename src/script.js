(function() {
  var assignment, assignment_weight, assignments, assignments_raw, class_info, class_info_html, convert_grade, key, multiplier, multiplier_sums, piwikTracker, pkBaseURL, print_grade, round, score, stats, table, table_index, total_correct_grade, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1;

  round = function(number, decmils) {
    return Math.round(number * Math.pow(10, decmils)) / Math.pow(10, decmils);
  };

  convert_grade = function(decmil_grade) {
    var i, rank, scale;
    scale = [[3.75, 4.33, 'A+'], [3.50, 4.00, 'A '], [3.25, 3.67, 'A-'], [3.00, 3.33, 'B+'], [2.75, 3.00, 'B '], [2.50, 2.67, 'B-'], [2.25, 2.33, 'C+'], [2.00, 2.00, 'C '], [1.75, 1.67, 'C-'], [1.50, 1.33, 'D+'], [1.25, 1.00, 'D '], [1.00, 0.67, 'D-'], [0.00, 0.00, 'F ']];
    for (i in scale) {
      rank = scale[i];
      if (decmil_grade >= rank[0]) {
        i = +i;
        return {
          recorded_sdw_grade: rank[0],
          gpa_value: class_info['is_AP'] && decmil_grade >= 1.75 ? rank[1] + 1 : rank[1],
          letter_grade: rank[2],
          points_till_increase: (i === 0 ? "maximum grade" : scale[i - 1][0] - decmil_grade),
          points_till_decrease: (i === (scale.length - 1) ? "minimum grade" : decmil_grade - scale[i][0] + 0.005)
        };
      }
    }
  };

  print_grade = function(decmil_grade) {};

  class_info_html = $('.UnderlinedRow td');

  class_info = {
    name: $(class_info_html[1]).find('b').html(),
    webgrader_grade: +/[0-9](:?\.[0-9]*)?/.exec(class_info_html[2].innerHTML)[0],
    is_AP: false
  };

  class_info['is_AP'] = /^Ap\s/i.test(class_info['name']) && !/^Ap prep\s/i.test(class_info['name']);

  _ref = convert_grade(class_info['webgrader_grade']);
  for (key in _ref) {
    value = _ref[key];
    class_info[key] = value;
  }

  assignments = [];

  multiplier_sums = [0, 0, 0, 0];

  table_index = 0;

  _ref1 = $('#lblReport .ReportTable');
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    table = _ref1[_i];
    if ((assignments_raw = $(table).find('.ReportTable tr:not([class])')).length !== 0) {
      for (_j = 0, _len1 = assignments_raw.length; _j < _len1; _j++) {
        assignment = assignments_raw[_j];
        assignment = $(assignment).find('td');
        if (assignment[3].innerHTML === '&nbsp;' || assignment[2].innerHTML === '&nbsp;') {
          score = NaN;
          multiplier = 0;
        } else {
          score = eval(assignment[3].innerHTML) / eval(assignment[2].innerHTML);
          multiplier = eval(assignment[2].innerHTML) / 4;
        }
        multiplier_sums[table_index] += multiplier;
        assignments.push({
          name: assignment[0].innerHTML,
          graded: score !== NaN,
          weight: assignment_weight,
          due_date: assignment[1].innerHTML,
          score: score,
          multiplier: multiplier,
          defined_comment: assignment[6].innerHTML,
          unique_comment: assignment[7].innerHTML,
          table: table_index
        });
      }
      table_index++;
    } else if ((assignment_weight = $(table).find('i').html()) != null) {
      assignment_weight = +(/\(([0-9\.]+)\%\)/.exec(assignment_weight)[1]) / 100;
    }
  }

  total_correct_grade = 0;

  for (_k = 0, _len2 = assignments.length; _k < _len2; _k++) {
    assignment = assignments[_k];
    assignment['percent_of_grade'] = (assignment['multiplier'] / multiplier_sums[assignment['table']]) * assignment['weight'];
    assignment['points_gained'] = assignment['score'] * 4 * assignment['percent_of_grade'];
    assignment['points_lost'] = (1 - assignment['score']) * 4 * assignment['percent_of_grade'];
    if (!isNaN(assignment['points_gained'])) {
      total_correct_grade += assignment['points_gained'];
    }
  }

  table = '';

  for (_l = 0, _len3 = assignments.length; _l < _len3; _l++) {
    assignment = assignments[_l];
    table += "<tr>\n	<td>" + assignment['name'] + "</td>\n	<td>" + assignment['due_date'] + "</td>\n	<td class=\"has_pie\">" + (round(assignment['score'] * 4, 2)) + "</td>\n	<td style=\"padding-left: 0\"><span class=\"pie\" data-colours='[\"green\", \"red\"]'>" + assignment['score'] + "/1</span></td>\n	<td class=\"has_pie\">" + (round(assignment['percent_of_grade'] * 100, 2)) + "%</td>\n	<td style=\"padding-left: 0\">\n		<span class=\"pie\" data-colours='[\"green\",\"red\",\"#D3D3D3\"]'>" + assignment['points_gained'] + "," + assignment['points_lost'] + "," + ((1 - assignment['percent_of_grade']) * 4) + "</span>\n	</td>\n	<td>" + (round(assignment['points_gained'], 4)) + "</td>\n	<td>" + (round(assignment['points_lost'], 4)) + "</td>\n	<td>" + assignment['defined_comment'] + "</td>\n	<td>" + assignment['unique_comment'] + "</td>\n</tr>";
  }

  stats = '';

  if (round(total_correct_grade, 2) !== class_info['webgrader_grade']) {
    stats += "<p>FYI: webgrader calculated your grade incorrectly. it should be " + (round(total_correct_grade, 2)) + "</p>";
  }

  stats += "<p class=\"class_info\">\n	pts till (better grade)/(worse grade): <b>(" + (round(class_info['points_till_increase'], 2)) + ")/(" + (round(class_info['points_till_decrease'], 2)) + ")</b>\n	<span class=\"small_pie\" data-colours='[\"green\", \"red\"]'>" + class_info['points_till_decrease'] + "," + class_info['points_till_increase'] + "</span>\n</p>";

  delete class_info['points_till_increase'];

  delete class_info['points_till_decrease'];

  delete class_info['is_AP'];

  for (key in class_info) {
    value = class_info[key];
    stats += "<p class=\"class_info\">\n	" + key + ": <b>" + (isNaN(value) ? value : round(value, 2)) + "</b>\n</p>";
  }

  pkBaseURL = "https:" === document.location.protocol ? "https://piwik.packwi.com/" : "http://piwik.packwi.com/";

  $('#lblReport').html("<style>\n.class_info {\ndisplay: inline;\npadding-left: 15px;\n}\n#assignments{\nmargin: 20px;\ndisplay: inline-block;\n}\n#lblReport div {\ndisplay: inline-block;\n}\n#assignments td, #assignments th{\nborder-bottom:1px solid #000;\npadding: 5px 15px;\nvertical-align: middle;\n}\n#assignments td.has_pie{\npadding-right: 5px;\ntext-align: right;\n}\n#assignments thead{\nfont-size: 10px;\ntext-align: left;\nbackground: #999;\n}\n#lblReport canvas, #lblReport p{\nvertical-align: middle;\n}\ntable.tablesorter thead tr .header {\nbackground-image: url('data:image/gif;base64,R0lGODlhFQAJAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAkAAAIXjI+AywnaYnhUMoqt3gZXPmVg94yJVQAAOw==');\nbackground-repeat: no-repeat;\nbackground-position: center right;\ncursor: pointer;\n}\ntable.tablesorter thead tr .headerSortUp {\nbackground-image: url('data:image/gif;base64,R0lGODlhFQAEAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAQAAAINjB+gC+jP2ptn0WskLQA7');\n}\ntable.tablesorter thead tr .headerSortDown {\nbackground-image: url('data:image/gif;base64,R0lGODlhFQAEAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAQAAAINjI8Bya2wnINUMopZAQA7');\n}\ntable.tablesorter thead tr .headerSortDown, table.tablesorter thead tr .headerSortUp {\nbackground-color: #8dbdd8;\n}\np iframe{\nvertical-align: middle;\n}\n</style>\n" + stats + "\n<table id=\"assignments\" class=\"tablesorter\">\n	<thead>\n		<tr>\n			<th>Name</td>\n			<th>Due Date</td>\n			<th colspan=\"2\">Score</td>\n			<th colspan=\"2\">% of Total Grade</td>\n			<th>Points Gained</th>\n			<th>Points Lost</th>\n			<th>Defined Comment</td>\n			<th>Unique Comment</td>\n		</tr>\n	</thead>\n	<tbody>\n		" + table + "\n	</tbody>\n</table>\n<p>The documentation for \"Webgrader: Fixed\" is avaliable <a href=\"https://github.com/slang800/webgrader-fixed/blob/master/README.md\">here</a>. If you have any questions or you find a bug, open an issue <a href=\"https://github.com/slang800/webgrader-fixed/issues\">here</a>. If you find this plugin useful, tip me on Gittip: <iframe style=\"border: 0; margin: 0; padding: 0;\" src=\"https://www.gittip.com/slang800/widget.html\" width=\"48pt\" height=\"22pt\"></iframe> </p>\n<noscript>\n	<p><img src=\"http://piwik.packwi.com/piwik.php?idsite=3\" style=\"border:0\" alt=\"\" /></p>\n</noscript>");

  try {
    piwikTracker = Piwik.getTracker("" + pkBaseURL + "piwik.php", 3);
    piwikTracker.trackPageView();
    piwikTracker.enableLinkTracking();
  } catch (err) {
    console.log(err);
  }

  $("span.pie").peity("pie", {
    diameter: '30'
  });

  $("span.small_pie").peity("pie", {
    diameter: '15'
  });

  $(".tablesorter").tablesorter();

}).call(this);
