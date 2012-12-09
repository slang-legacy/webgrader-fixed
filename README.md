webgrader-fixed
===============

Since webgrader really sucks at presenting data (and makes it look like all those meaningless formative assignments are actually important), I hacked together a quick chrome plugin to fix those ugly webgrader reports. The basic goal is to show what projects actually matter, how close you are to getting a higher grade (FYI: a 3.50 is the same as a 3.74, the school cuts off any extra points), how your grade is mapped to a GPA, and to make it easier to view scores (making good and bad grades very obvious).

#how to use

Since I really don't feel like paying the fee to host this extension on the Chrome Web Store, you will need to install it manually. But don't worry, it's still pretty easy to do. Just download the file [here](https://github.com/downloads/slang800/webgrader-fixed/webgrader-fixed.crx), open `chrome://chrome/extensions/` in a new tab, then drag `webgrader-fixed.crx` on to the Extensions page to install it.

To view your grades with webgrader-fixed, go to the "detailed" report, in webgrader, for the class you want to view. The page will be automatically converted into a sortable, graphical representation of your grades.

#notes

If you are viewing an AP class, your GPA is increased by 1 point (so long as your grade is not below a ____), but your letter grade remains the same.

The school cuts off any extra points that you get above the letter grade you currently have (so a 3.50 is the same as a 3.74). To illustrate this, "pts till (better grade)/(worse grade)" shows you how close you are to the next better grade (when the circle is mostly green you are really close to getting a higher grade in the class). This rounding is not used on assignments, only class grades.

I use the word "webgrader" because that's what this site was originally called. It's actually called "Standards Score" now. But that's a really bad name, so I'll just keep calling it webgrader.

"points lost" is really just how many more points you would have if you had gotten a 4. It is useful because you can compare this value to "pts till (better grade)/(worse grade)" to determine what assignments you can turn in to get to the next highest grade.

"points gained" is how many points that assignment adds to your grade. Therefore, adding up all the values in that column equals your total grade.

This is released under [WTFPL](http://sam.zoy.org/wtfpl/).