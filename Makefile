# This Makefile is part of  Linterna Mágica
#
# Copyright (C) 2011  Ivaylo Valkov <ivaylo@e-valkov.org>
#
# Linterna Mágica is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Linterna Mágica is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Linterna Mágica.  If not, see <http://www.gnu.org/licenses/>.

SHELL = /bin/bash

GREP = /bin/grep
RM = /bin/rm
SED = /bin/sed
BASE64=/usr/bin/base64
MAKE=/usr/bin/make
CAT=/bin/cat
TAC=/usr/bin/tac
CUT=/usr/bin/cut
CP=/bin/cp
HEAD=/usr/bin/head
TAIL=/usr/bin/tail
SORT=/usr/bin/sort
UNIQ=/usr/bin/uniq
TR=/usr/bin/tr
BASENAME=/usr/bin/basename
MKTEMP=/bin/mktemp
CHMOD=/bin/chmod

PACKAGE= linternamagica
VERSION = 0.0.9-6-pre-release

topdir=.
srcdir=$(topdir)/src
builddir=$(topdir)
styledir=$(topdir)/data/style

STYLEFILE=$(styledir)/template.css

HEADERLINE="// END OF LICENSE HEADER"
CSSHEADERLINE="/\* END OF LICENSE HEADER \*/"
PUSHCOPYRIGHTLINE="LinternaMagica.prototype.copyrights = new Array();"
NOMINIMISATIONLINE="// NO MINIMISATION ABOVE THIS LINE"

USRSCRIPTHDR=$(srcdir)/lm_userscript_header.txt

FIRSTJSFILES="$(srcdir)/lm_inject_script_in_page.js		\
$(srcdir)/lm_init_options.js $(srcdir)/lm_localisation.js	\
$(srcdir)/lm_constructors.js $(srcdir)/lm_config_options.js"

LASTJSFILES="$(srcdir)/lm_run.js"

EXCLUDEJSFILES=

JSFILES=$(shell files="`ls $(srcdir)/*.js | $(GREP) -E \`echo		\
	$(FIRSTJSFILES) $(LASTJSFILES) $(EXCLUDEJSFILES) | $(TR) ' '	\
	'|'\` -v`"; for file in $(FIRSTJSFILES) $$files $(LASTJSFILES)	\
	; do printf "$$file "; done)

STRIPHEADERS=$(shell for file in $(JSFILES) ; do echo -n "$$file " |	\
	$(SED) -e 's/\.js/\.nhr/'; done)

STRIPCOMMENTS=$(shell for file in $(STRIPHEADERS) ; do echo -n "$$file	\
" | $(SED) -e 's/\.nhr/.ncm/'; done)

GRAPHICSFILES=$(shell $(GREP) "url('.*')" -o "$(STYLEFILE)" | $(SORT)	\
| $(UNIQ) | $(CUT) -d"'" -f2 | while read file ;do printf		\
"$(styledir)/$$file "; done)

BASE64FILES=$(shell for file in $(GRAPHICSFILES) ; do echo -n "$$file	\
" | $(SED) -e 's/\.png/.b64/'; done)

CSSINJSFILES=$(shell for file in $(BASE64FILES) ; do echo -n "$$file "	\
| $(SED) -e 's/\.b64/.js/'; done)


.SUFFIXES:
.SUFFIXES: .nhr .js .ncm .hdr .png .b64 .min .obf .syn .cmt .cjs .css

.PHONY: clean distclean minimise

all: $(PACKAGE).user.js

.png.b64: Makefile
	@echo "Encoding image $(^F) to base64 format"
	@$(BASE64) -w0 $< > $@

.b64.js: Makefile
	@echo -e "Converting base64 encoded image $(^F) to JavaScript variable\n";\
	js_variable="`echo $(^F) | $(SED) -e 's/\.b64//' -e 's/-/_/g'`";\
	$(SED) -e "s#^#var $$js_variable=\"data:image/png;base64,#" -e	\
	"s/$$/\";/" $< > $@;

$(STYLEFILE).js: $(STYLEFILE) $(CSSINJSFILES)  $(BASE64FILES) Makefile
	@echo "Converting style sheet `$(BASENAME) $(STYLEFILE)` to JavaScript variable";\
	$(CAT) $(CSSINJSFILES) > $@;\
	echo -en "var css_data =\"" >> $@;\
	cut_line="`$(TAC) $(STYLEFILE) | $(GREP) -n $(CSSHEADERLINE) -B1 | $(HEAD) -n1 | $(CUT) -d'-' -f1`";\
	$(TAIL) -n $$cut_line $(STYLEFILE) | $(SED) -e			\
	's/\/\*.*\*\/$$//g' | $(TR) -d '\n' | $(SED) -e 's/\s\{2,\}/	\
	/g' -e "s#\s*\(:\|!\|{\|;\|}\|,\)\s*#\1#g" | $(GREP) -E		\
	'^\s*$$' -v | $(SED) -e 's/$$/\";/' >> $@;\
	for img in $(GRAPHICSFILES); do \
		css_name="`$(BASENAME) $$img`";\
		js_variable="`echo $$css_name| $(SED) -e 's/\.png//' -e 's/-/_/g'`";\
		css_name="`echo $$css_name| $(SED) -e 's/\./\\\./g' `";\
		$(SED) -i -e "s/$$css_name/\"\+$$js_variable\+\"/g" $@;\
	done;

# Strip headers
.js.nhr: Makefile 
	@echo "Checking comments in $<";\
	result="`$(GREP) -n --color=always -E '(\s+|^)//\w' $< `"; \
	if test "$$result" ; then \
		echo -e "\nInvalid comment found in file $<"  | $(GREP) --color=always -E "\w+\.js" ;\
		echo -e "$$result" | $(SED) -e 's/^/Line /g' ; \
		echo -en "\nThis might break code after ";\
		echo -e "minimization/obfuscation or comment stripping."   \
		"\nThe regular expression \"//.*\" matches (parts of) URLs too." \
		"\nIt is not an option for stripping comments." \
		"Use the format\nbellow for comments instead." \
		"\n\nFormat: //\s+Commented text" \
		"\n\n// Commented text"\
		"\n//   Another comment with several spaces"\
		"\n//\t<TAB> is OK"\
		"\n" ;\
		exit 2; \
	fi;\
	echo "Checking sytax of $<";\
	result="`$(GREP) -n --color=always -E ';$$|^$$|^\s+$$' -v $< \
	|  $(GREP) -E '(\+|\-|//\s+.*|//|\&|\{|\}|\[|\]|\)|\(|\?|\*|else|try|:|,|\.|=|\|)\s*$$' -v`" ; \
		if test "$$result" ; then \
			echo ""; \
			echo -e "\033[1;31mWarning:\033[0m Possible invalid syntax found in file $<." | $(GREP) --color=always -E "\w+\.js" ;\
			echo ""; \
			echo "$$result" | $(SED) -e 's/^\(.*\)/Line \1/';\
			echo "";\
			invalid_comment="found";\
		fi; \
	new_line=`$(TAIL) -c 1 $<`;\
	if test "$$new_line" ; then\
		echo "No new line at end of file";\
		echo "This will break JavaScript syntax while concatenating source files.";\
		exit 2;\
	fi;\
	echo "Removing headers in $<";\
	cut_line="`$(TAC) $< | $(GREP) -n $(HEADERLINE) -B1 | $(HEAD) -n1 | $(CUT) -d'-' -f1`";\
	$(TAIL) -n $$cut_line $< > $@ ;

# Strip comments
.nhr.ncm: Makefile
	@echo -e "Removing comments in $<\n";
	@result=`echo $<  | $(GREP) lm_init_options`;\
	if test ! $$result ; then \
		$(SED) -e 's#//\s\{1,\}.*\|^//.*##g' -e '/^\s*$$/d' $< > $@;\
	else\
		$(CP)  $< $@;\
	fi

userscript-header.js: $(USRSCRIPTHDR) $(JSFILES) $(STYLEFILE) README Makefile
	@echo -n "Collecting authors... ";\
	authors="`$(GREP) -E '(//)*\s*Copyright' $(JSFILES) $(USRSCRIPTHDR) $(STYLEFILE) README | $(CUT) -d ':' -f2| $(SED) -e 's/\s\s/ /g' -e 's/^[^\/]/\/\//g' -e 's/\/\/\s*/\/\/    /g' | $(SORT) | $(UNIQ) | $(TR) -d '\n'`";\
	up_cut="`$(CAT) $(USRSCRIPTHDR) | $(GREP) -n '//\s*Copyright' -B1 |$(HEAD) -n 1| $(CUT) -d'-' -f1`";\
	down_cut="`$(TAC) $(USRSCRIPTHDR) |$(GREP) -n '//\s*Copyright' -B1 |$(HEAD) -n 1| $(CUT) -d'-' -f1`";\
	$(HEAD) -n $$up_cut  $(USRSCRIPTHDR) > $@;\
	echo -e "$$authors//\n" | $(SED) -e 's#\/\/\s*#\n//  #g' | $(SED)  -e '/^$$/d' >> $@;\
	echo "done";\
	$(TAIL) -n $$down_cut $(USRSCRIPTHDR) >> $@;

$(PACKAGE).user.js: strip-js-comments strip-js-headers userscript-header.js $(JSFILES) $(USRSCRIPTHDR) $(STYLEFILE) $(STYLEFILE).js Makefile
	@$(CAT) userscript-header.js > $@;\
	 authors="`$(GREP) -E '//*\s+Copyrigh' userscript-header.js |	\
	$(SED) -e							\
	's/^\/\/\s*/LinternaMagica.prototype.copyrights.push\(\"/g' -e	\
	's/$$/\"\);\n/g'`";\
	$(CAT)  $(STRIPCOMMENTS) >> $@;\
	$(SED) -i -e 's/@VERSION@/$(VERSION)/g' $@;\
	tmp="`$(MKTEMP)`";\
	rights_up_cut="`$(CAT) $@ | $(GREP) -n $(PUSHCOPYRIGHTLINE)  |$(HEAD) -n 1| $(CUT) -d':' -f1`";\
	rights_down_cut="`$(TAC) $@ |$(GREP) -n $(PUSHCOPYRIGHTLINE) -B1 |$(HEAD) -n 1| $(CUT) -d'-' -f1`";\
	$(HEAD) -n $$rights_up_cut $@ > $$tmp;\
	echo $$authors >> $$tmp;\
	$(TAIL) -n $$rights_down_cut $@ >> $$tmp;\
	$(CP) $$tmp $@;\
	$(RM) $$tmp;\
	echo -n "Mering style sheet ... ";\
	tmp="`$(MKTEMP)`";\
	css_up_cut="`$(CAT) $@ | $(GREP) -n 'var css_data;' -B1 |$(HEAD) -n 1| $(CUT) -d'-' -f1`";\
	css_down_cut="`$(TAC) $@ |$(GREP) -n 'var css_data;' -B1 |$(HEAD) -n 1| $(CUT) -d'-' -f1`";\
	$(HEAD) -n $$css_up_cut $@ > $$tmp;\
	$(CAT) $(STYLEFILE).js >> $$tmp;\
	$(TAIL) -n $$css_down_cut $@ >> $$tmp;\
	$(CP) $$tmp $@;\
	$(RM) $$tmp;\
	echo "done";\
	$(CHMOD) +x $(PACKAGE).user.js;\
	echo -e "\n\n  \033[1;32m$(PACKAGE).user.js\033[0m is ready.\n\n";


# Not productional yet
# Minimisation of code. Keep $(SED) calls separate. Had problems with
# one call to $(SED) with various -e options
# .js.min: Makefile
# 	@$(CAT) $< | $(TR) -d '\n' | $(SED) -e 's/\s\{2,\}\|\t\{1,\}/ /g' | $(SED)  -e "s#\s*\(:\|!\|{\|;\|}\|,\|\.\|?\|+\|=\|&\|(\|)\||\|<\)\s*#\1#g" | $(SED)  -e 's#;}#}#g ' |  $(SED) -e 's#\"+\"##g' | $(SED)  -e 's#\([^?]\)"\(\w\+\)"\:#\1\2:#g' | $(SED) -e  's#}\(\w\)#};\1#g'  | $(SED) -e 's#;\(catch\|else\)#\1#g' | $(SED) -e  's#};while#}while#g'  >$@;

# $(PACKAGE).js: $(PACKAGE).user.js
# 	@echo "raw js T $< D $@";
# 	@down_cut="`$(TAC) $< |$(GREP) -n $(NOMINIMISATIONLINE)  -B1 |$(HEAD) -n 1| $(CUT) -d'-' -f1`";\
# 	$(TAIL) -n $$down_cut  $< > $@;

# minimise: $(PACKAGE).js $(PACKAGE).min userscript-header.js
# 	@echo -e "Minimising code ... ";\
# 	up_cut="`$(CAT) $(PACKAGE).user.js | $(GREP) -n $(NOMINIMISATIONLINE) -B1 |$(HEAD) -n 1| $(CUT) -d'-' -f1`";\
# 	echo "upcut minimisie $$up_cut";\
# 	$(HEAD) -n $$up_cut $(PACKAGE).user.js > $(PACKAGE).min.user.js;\
# 	$(CAT) $(PACKAGE).min >>  $(PACKAGE).min.user.js;\
# 	$(RM) $(PACKAGE).js $(PACKAGE).min;
# 	@echo "done";

# Clean without warnings for missing files. Sends errors in /dev/null
# and returns 0 always.
clean:
	@$(RM) $(STRIPCOMMENTS) $(STRIPHEADERS) $(BASE64FILES) $(CSSINJSFILES) $(STYLEFILE).js userscript-header.js 2> /dev/null; exit 0

# See comments for clean:
distclean: clean
	@$(RM) $(PACKAGE).user.js 2> /dev/null; exit 0

strip-js-headers: $(STRIPHEADERS)

strip-js-comments: $(STRIPCOMMENTS)