Test Name
Test URL
https://peerlist.io/scroll
Total Issues
41
Automatic Issues
41
Guided Issues
0
Manual Issues
0
Critical
20
Serious
20
Moderate
1
Minor
0
WCAG 2.1 AA
Total Issues: 41
1 of 4
Ensure every ARIA button, link and menuitem has an accessible name

more information Link opens in a new window
Element Location:
.right-0.absolute > .w-fit.relative.flex > div[role="button"]
<div class="" role="button" tabindex="0">
To solve this problem, you need to fix at least (1) of the following:
Element does not have text that is visible to screen readers
aria-label attribute does not exist or is empty
aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
Element has no title attribute
Found:
Automatically
Impact:
serious
cat.aria
wcag2a
wcag412
TTv5
TT6.a
EN-301-549
EN-9.4.1.2
ACT
RGAAv4
RGAA-11.9.1
Found on:
09/04/2026 at 9:43 PM
1 of 16
Ensure buttons have discernible text

more information Link opens in a new window
Element Location:
#radix-\:r1h\:
<button type="button" id="radix-:r1h:" aria-haspopup="menu" aria-expanded="false" data-state="closed" class="outline-none absolute h-full w-full -z-10"></button>
To solve this problem, you need to fix at least (1) of the following:
Element does not have inner text that is visible to screen readers
aria-label attribute does not exist or is empty
aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
Element has no title attribute
Element does not have an implicit (wrapped) <label>
Element does not have an explicit <label>
Element's default semantics were not overridden with role="none" or role="presentation"
Found:
Automatically
Impact:
critical
cat.name-role-value
wcag2a
wcag412
section508
section508.22.a
TTv5
TT6.a
EN-301-549
EN-9.4.1.2
ACT
RGAAv4
RGAA-11.9.1
Found on:
09/04/2026 at 9:43 PM
1 of 6
Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds

more information Link opens in a new window
Element Location:
.text-green-300
<p class="text-green-300 dark:text-green-200 font-semibold text-xs ">Newest</p>
To solve this problem, you need to fix the following:
Element has insufficient color contrast of 3.07 (foreground color: #00aa45, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1

Related Node
<a class="px-4 py-2 uppercase bg-clip-padding bg-gray-00 rounded-l-xl border border-transparent flex items-center" href="/scroll"><p class="text-green-300 dark:text-green-200 font-semibold text-xs ">Newest</p></a>
Found:
Automatically
Impact:
serious
cat.color
wcag2aa
wcag143
TTv5
TT13.c
EN-301-549
EN-9.1.4.3
ACT
RGAAv4
RGAA-3.2.1
Found on:
09/04/2026 at 9:43 PM
1 of 3
Ensure <img> elements have alternative text or a role of none or presentation

more information Link opens in a new window
Element Location:
div[data-index="1"] > div > .mob\:px-6.hover\:bg-gray-25.group\/post-card > .mb-0\.5.justify-between.items-center > .justify-between.w-full.items-center > .items-center.flex > .ml-2 > .flex-wrap.gap-2.whitespace-nowrap > .max-w-fit > .gap-1.items-center.flex > a[data-for="launched-project"][data-tip="true"][data-effect="solid"] > img[src$="rocket.svg"][loading="lazy"][data-nimg="1"]
<img loading="lazy" width="16" height="16" decoding="async" data-nimg="1" src="/emojis/rocket.svg" style="color: transparent;">
To solve this problem, you need to fix at least (1) of the following:
Element does not have an alt attribute
aria-label attribute does not exist or is empty
aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
Element has no title attribute
Element's default semantics were not overridden with role="none" or role="presentation"
Found:
Automatically
Impact:
critical
cat.text-alternatives
wcag2a
wcag111
section508
section508.22.a
TTv5
TT7.a
TT7.b
EN-301-549
EN-9.1.1.1
ACT
RGAAv4
RGAA-1.1.1
Found on:
09/04/2026 at 9:43 PM
1 of 1
Ensure every form element has a label

more information Link opens in a new window
Element Location:
#react-select-peerlist-search-input
<input class="" autocapitalize="none" autocomplete="off" autocorrect="off" id="react-select-peerlis..." spellcheck="false" tabindex="0" type="text" aria-autocomplete="list" aria-expanded="false" aria-haspopup="true" role="combobox" aria-describedby="react-select-peerlis..." value="" style="color: in ...>
To solve this problem, you need to fix at least (1) of the following:
Element does not have an implicit (wrapped) <label>
Element does not have an explicit <label>
aria-label attribute does not exist or is empty
aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
Element has no title attribute
Element has no placeholder attribute
Element's default semantics were not overridden with role="none" or role="presentation"
Found:
Automatically
Impact:
critical
cat.forms
wcag2a
wcag412
section508
section508.22.n
TTv5
TT5.c
EN-301-549
EN-9.4.1.2
ACT
RGAAv4
RGAA-11.1.1
Found on:
09/04/2026 at 9:43 PM
1 of 3
Ensure links have discernible text

more information Link opens in a new window
Element Location:
a[href$="notifications"]
<a href="/notifications">
To solve this problem, you need to fix at least (1) of the following:
Element does not have text that is visible to screen readers
aria-label attribute does not exist or is empty
aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
Element has no title attribute
And fix the following:
Element is in tab order and does not have accessible text

Found:
Automatically
Impact:
serious
cat.name-role-value
wcag2a
wcag244
wcag412
section508
section508.22.a
TTv5
TT6.a
EN-301-549
EN-9.2.4.4
EN-9.4.1.2
ACT
RGAAv4
RGAA-6.2.1
Found on:
09/04/2026 at 9:43 PM
1 of 1
Ensure <meta name="viewport"> does not disable text scaling and zooming

more information Link opens in a new window
Element Location:
meta[name="viewport"]
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" data-next-head="">
To solve this problem, you need to fix the following:
maximum-scale on <meta> tag disables zooming on mobile devices

Found:
Automatically
Impact:
moderate
cat.sensory-and-visual-cues
wcag2aa
wcag144
EN-301-549
EN-9.1.4.4
ACT
RGAAv4
RGAA-10.4.2
Found on:
09/04/2026 at 9:43 PM
1 of 7
Ensure interactive controls are not nested as they are not always announced by screen readers or can cause focus problems for assistive technologies

more information Link opens in a new window
Element Location:
.right-0.absolute > .w-fit.relative.flex > div[role="button"]
<div class="" role="button" tabindex="0">
To solve this problem, you need to fix the following:
Element has focusable descendants

Related Node
<button type="button" class="relative justify-cen...">
Found:
Automatically
Impact:
serious
cat.keyboard
wcag2a
wcag412
TTv5
TT6.a
EN-301-549
EN-9.4.1.2
RGAAv4
RGAA-7.1.1
Found on: