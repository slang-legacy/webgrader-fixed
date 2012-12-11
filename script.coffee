# please note: this is not a very beautiful script, it uses eval, doesn't
# group functionality in functions, and doesn't use a very logical
# organization. I could have designed this with backbone or another nice
# framework, but the goal was to just make a quick project to improve the way
# that webgrader displays scores. In short, this project uses a ton of bad
# practices, don't learn from it.

round = (number, decmils) ->
	Math.round(number*Math.pow(10,decmils))/Math.pow(10,decmils)

convert_grade = (decmil_grade) ->
	scale = [
		[3.75, 4.33, 'A+'],
		[3.50, 4.00, 'A '],
		[3.25, 3.67, 'A-'],
		[3.00, 3.33, 'B+'],
		[2.75, 3.00, 'B '],
		[2.50, 2.67, 'B-'],
		[2.25, 2.33, 'C+'],
		[2.00, 2.00, 'C '],
		[1.75, 1.67, 'C-'],
		[1.50, 1.33, 'D+'],
		[1.25, 1.00, 'D '],
		[1.00, 0.67, 'D-'],
		[0.00, 0.00, 'F '],
	]
	for i, rank of scale
		if decmil_grade >= rank[0]
			i = +i

			return (
				recorded_sdw_grade: rank[0]
				# idk if the AP gpa limit on lower grades is correct
				gpa_value: if class_info['is_AP'] and decmil_grade >= 1.25 then rank[1] + 1 else rank[1]
				letter_grade: rank[2]
				points_till_increase: (
					if i is 0
						"maximum grade"
					else
						scale[i - 1][0] - decmil_grade
				)
				points_till_decrease: (
					if i is (scale.length - 1)
						"minimum grade"
					else
						# assuming 0.01 rounding
						decmil_grade - scale[i][0] + 0.005
				)
			)

print_grade = (decmil_grade) ->

class_info_html = $('.UnderlinedRow td')

class_info =
	#teacher: class_info_html[0].innerHTML
	name: $(class_info_html[1]).find('b').html()
	webgrader_grade: +/[0-9](:?\.[0-9]*)?/.exec(class_info_html[2].innerHTML)[0]
	is_AP: false

class_info['is_AP'] = /^Ap\s/i.test(class_info['name'])

for key, value of convert_grade(class_info['webgrader_grade'])
	class_info[key] = value

#get the grades
tables = $('#lblReport .ReportTable')
assignments_raw =
	formative: $(tables[4]).find('.ReportTable tr:not([class])')
	summative: $(tables[7]).find('.ReportTable tr:not([class])')

assignments = []
multiplier_sum =
	formative: 0
	summative: 0

# turn all that html garbage into a nice array of assignments
for assignment_type in ['formative', 'summative']
	for assignment in assignments_raw[assignment_type]
		assignment = $(assignment).find('td')
		if assignment[3].innerHTML == '&nbsp;' or assignment[2].innerHTML == '&nbsp;'
			score = NaN
			multiplier = 0
		else
			score = eval(assignment[3].innerHTML) / eval(assignment[2].innerHTML)
			multiplier = eval(assignment[2].innerHTML) / 4
		
		multiplier_sum[assignment_type] += multiplier

		assignments.push {
			name: assignment[0].innerHTML
			graded: score isnt NaN
			type: assignment_type
			due_date: assignment[1].innerHTML
			score: score # as a percent
			multiplier: multiplier
			defined_comment: assignment[6].innerHTML
			unique_comment: assignment[7].innerHTML
		}

total_correct_grade = 0

for assignment in assignments
	weight = if assignment['type'] is 'formative' then 0.1 else 0.9
	assignment['percent_of_grade'] = (assignment['multiplier'] / multiplier_sum[assignment['type']]) * weight
	assignment['points_gained'] = assignment['score']*4*assignment['percent_of_grade']
	assignment['points_lost'] = (1-assignment['score'])*4*assignment['percent_of_grade']
	unless isNaN(assignment['points_gained'])
		total_correct_grade += assignment['points_gained']

console.log 'grade: ' + total_correct_grade

table = ''
for assignment in assignments
	table += """
		<tr>
			<td>#{assignment['name']}</td>
			<td>#{assignment['due_date']}</td>
			<td class="has_pie">#{round(assignment['score']*4, 2)}</td>
			<td style="padding-left: 0"><span class="pie" data-colours='["green", "red"]'>#{assignment['score']}/1</span></td>
			<td class="has_pie">#{round(assignment['percent_of_grade']*100, 2)}%</td>
			<td style="padding-left: 0">
				<span class="pie" data-colours='["green","red","#D3D3D3"]'>#{assignment['points_gained']},#{assignment['points_lost']},#{(1-assignment['percent_of_grade'])*4}</span>
			</td>
			<td>#{round(assignment['points_gained'], 4)}</td>
			<td>#{round(assignment['points_lost'], 4)}</td>
			<td>#{assignment['defined_comment']}</td>
			<td>#{assignment['unique_comment']}</td>
		</tr>
	"""


# determine how much webgrader's calculation for the grade is off by
stats = ''

if round(total_correct_grade, 2) isnt class_info['webgrader_grade']
	stats += "<p>FYI: webgrader calculated your grade incorrectly. it should be #{round(total_correct_grade, 2)}</p>"

stats += """
	<p class="class_info">
		pts till (better grade)/(worse grade): <b>(#{round(class_info['points_till_increase'], 2)})/(#{round(class_info['points_till_decrease'], 2)})</b>
		<span class="small_pie" data-colours='["green", "red"]'>#{class_info['points_till_decrease']},#{class_info['points_till_increase']}</span>
	</p>
"""

delete class_info['points_till_increase']
delete class_info['points_till_decrease']

delete class_info['is_AP'] #no longer needed (gpa is already bumped up)

for key, value of class_info
	stats += """
	<p class="class_info">
		#{key}: <b>#{if isNaN(value) then value else round(value, 2)}</b>
	</p>"""

$('#lblReport').html("""
	<style>
.class_info {
	display: inline;
	padding-left: 15px;
}
#assignments{
	margin: 20px;
	display: inline-block;
}
#lblReport div {
	display: inline-block;
}
#assignments td, #assignments th{
	border-bottom:1px solid #000;
	padding: 5px 15px;
	vertical-align: middle;
}
#assignments td.has_pie{
	padding-right: 5px;
	text-align: right;
}
#assignments thead{
	font-size: 10px;
	text-align: left;
	background: #999;
}
#lblReport canvas, #lblReport p{
	vertical-align: middle;
}
table.tablesorter thead tr .header {
	background-image: url('data:image/gif;base64,R0lGODlhFQAJAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAkAAAIXjI+AywnaYnhUMoqt3gZXPmVg94yJVQAAOw==');
	background-repeat: no-repeat;
	background-position: center right;
	cursor: pointer;
}
table.tablesorter thead tr .headerSortUp {
	background-image: url('data:image/gif;base64,R0lGODlhFQAEAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAQAAAINjB+gC+jP2ptn0WskLQA7');
}
table.tablesorter thead tr .headerSortDown {
	background-image: url('data:image/gif;base64,R0lGODlhFQAEAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAQAAAINjI8Bya2wnINUMopZAQA7');
}
table.tablesorter thead tr .headerSortDown, table.tablesorter thead tr .headerSortUp {
	background-color: #8dbdd8;
}
p iframe{
	vertical-align: middle;
}
	</style>
	#{stats}
	<table id="assignments" class="tablesorter">
		<thead>
			<tr>
				<th>Name</td>
				<th>Due Date</td>
				<th colspan="2">Score</td>
				<th colspan="2">% of Total Grade</td>
				<th>Points Gained</th>
				<th>Points Lost</th>
				<th>Defined Comment</td>
				<th>Unique Comment</td>
			</tr>
		</thead>
		<tbody>
			#{table}
		</tbody>
	</table>
	<p>The documentation for "Webgrader: Fixed" is avaliable <a href="https://github.com/slang800/webgrader-fixed/blob/master/README.md">here</a>. If you have any questions or you find a bug, open an issue <a href="https://github.com/slang800/webgrader-fixed/issues">here</a>. If you find this plugin useful, tip me on Gittip: <iframe style="border: 0; margin: 0; padding: 0;" src="https://www.gittip.com/slang800/widget.html" width="48pt" height="22pt"></iframe> </p>
""")

$("span.pie").peity "pie", diameter: '30'
$("span.small_pie").peity "pie", diameter: '15'
$(".tablesorter").tablesorter()