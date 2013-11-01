# This Makefile is part of  Linterna Mágica
#
# Copyright (C) 2011, 2012, 2013 Ivaylo Valkov <ivaylo@e-valkov.org>
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

topdir=.
srcdir=$(topdir)/src
builddir=$(topdir)
styledir=$(topdir)/data/style
docsdir=$(topdir)/doc
podir=$(topdir)/po

include $(topdir)/common.mk

rel_version="`echo $(VERSION) | $(SED) -e 's/git-//g'`"
rel_dir=releases/$(PACKAGE)-v$(VERSION)-upload

STYLEFILE=$(styledir)/template.css

HEADERLINE="// END OF LICENSE HEADER"
CSSHEADERLINE="/\* END OF LICENSE HEADER \*/"
PUSHCOPYRIGHTLINE="LinternaMagica.prototype.copyrights = new Array();"
NOMINIMISATIONLINE="// NO MINIMISATION ABOVE THIS LINE"

USRSCRIPTHDR=$(srcdir)/lm_userscript_header.txt

FIRSTJSFILES="$(srcdir)/lm_inject_script_in_page.js		\
$(srcdir)/lm_init_options.js $(srcdir)/lm_constructors.js	\
$(srcdir)/lm_config_options.js $(srcdir)/lm_sites.js"

LASTJSFILES="$(srcdir)/lm_run.js"

EXCLUDEJSFILES="$(srcdir)/lm_locale_userscript_template.js"

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

.PHONY: clean distclean minimise docs-clean

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
	echo "Checking syntax of $<";\
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

userscript-header.js: $(USRSCRIPTHDR) $(JSFILES) $(STYLEFILE) COPYING.data-files Makefile
	$(CP) $(USRSCRIPTHDR) $@;

$(PACKAGE).user.js: strip-js-comments strip-js-headers userscript-header.js $(JSFILES) $(USRSCRIPTHDR) $(STYLEFILE) $(STYLEFILE).js Makefile
	@$(CAT) userscript-header.js > $@;\
	echo "(function(){" >> $@;\
	$(CAT)  $(STRIPCOMMENTS) >> $@;\
	echo "})();" >> $@;\
	$(SED) -i -e 's/@VERSION@/$(VERSION)/g' $@;\
	echo -n "Merging style sheet ... ";\
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


docs: $(docsdir)/$(GETTEXT_PACKAGE).texi
	@cd $(docsdir); \
	$(MAKE) all-docs;

locales:
	@cd $(podir);\
	$(MAKE) generate-scripts

docs-clean:
	@cd $(docsdir); \
	$(MAKE) clean

po-distclean:
	@cd $(podir); \
	$(MAKE) distclean;

update-readme:
	@cd $(docsdir); \
	$(MAKE) update-readme;


valid-version:
	@ver=$(rel_version) ; \
	valid="`$(GIT) tag -l $$ver`"; \
	if [ ! "$$valid" ] && [ "$$ver" !=  "master" ]; \
	then \
	echo "Unknown version "$(rel_version); \
	exit 1 ; \
	fi

release-archives: valid-version
	@$(MKDIR) -p $(rel_dir) 2>/dev/null ; \
	$(GIT) archive --format=tar --prefix=$(GETTEXT_PACKAGE)-$(VERSION)/ \
		-o $(rel_dir)/$(PACKAGE)-v$(VERSION).tar $(rel_version) ; \
	$(GZIP) -c $(rel_dir)/$(PACKAGE)-v$(VERSION).tar > \
		$(rel_dir)/$(PACKAGE)-v$(VERSION).tar.gz ; \
	$(BZIP2) -c $(rel_dir)/$(PACKAGE)-v$(VERSION).tar > \
		$(rel_dir)/$(PACKAGE)-v$(VERSION).tar.bz2 ; \
	$(XZ) -c $(rel_dir)/$(PACKAGE)-v$(VERSION).tar > \
		$(rel_dir)/$(PACKAGE)-v$(VERSION).tar.xz ; \
	$(RM) -rf $(rel_dir)/$(PACKAGE)-v$(VERSION).tar

release-binary: valid-version
	@$(MKDIR) -p $(rel_dir) 2>/dev/null ; \
	$(GIT) archive --format=tar --prefix=$(GETTEXT_PACKAGE)-$(VERSION)/ $(rel_version) | tar -x -C $(rel_dir)/ ; \
	git_sources_dir="$$PWD" ; \
	cd  $(rel_dir)/$(GETTEXT_PACKAGE)-$(VERSION) ; \
	$(MAKE) ; \
	$(GZIP) -c $(PACKAGE).user.js > ../$(PACKAGE)-v$(VERSION).user.js.gz ; \
	$(BZIP2) -c $(PACKAGE).user.js > ../$(PACKAGE)-v$(VERSION).user.js.bz2 ; \
	$(XZ) -c $(PACKAGE).user.js > ../$(PACKAGE)-v$(VERSION).user.js.xz ; \
	$(CP) $(PACKAGE).user.js ../$(PACKAGE)-v$(VERSION).user.js ; \
	$(CHMOD) a-x ../$(PACKAGE)-v$(VERSION).user.js ; \
	$(CP) $${git_sources_dir}/data/linternamagica-release-template.user.js.html ../$(PACKAGE)-v$(VERSION).user.js.html ; \
	$(SED) -i -e "s/@VERSION@/$(VERSION)/g" ../$(PACKAGE)-v$(VERSION).user.js.html ; \
	if [ -e po ]; \
	then \
	$(MAKE) locales ; \
	for po in `$(LS) po/*.js` ; \
	do \
	locale="`echo $$po | $(GREP) -o -E '_[a-z]+.user.js' | $(CUT) -d'.' -f1 | $(CUT) -d '_' -f2`"; \
	po_out=`echo $$po | $(SED) -e "s/_l10n_/-v$(VERSION)-l10n-/g" \
		-e "s#po/##g"`; \
	$(GZIP) -c $$po > ../$${po_out}.gz ; \
	$(BZIP2) -c $$po > ../$${po_out}.bz2 ; \
	$(XZ) -c $$po > ../$${po_out}.xz ; \
	$(CP) $$po ../$${po_out} ; \
	$(CP) $${git_sources_dir}/data/linternamagica-release-locale-template.user.js.html ../$${po_out}.html ; \
	echo $${git_sources_dir}/data/linternamagica-release-locale-template.user.js.html ../$${po_out}.html ; \
	$(SED) -i -e "s/@VERSION@/$(VERSION)/g" -e "s/@LOCALE@/$$locale/g" ../$${po_out}.html ; \
	done; \
	fi; \
	cd $$git_sources_dir ; \
	$(RM) -rf $(rel_dir)/$(GETTEXT_PACKAGE)-$(VERSION)

release-latest_docs: valid-version
	@v=$(rel_version); \
	docs=`$(GIT) log -1 --pretty='format:%h|%ct' $$v doc`; \
	if [ ! $$docs ]; \
	then \
	exit 0; \
	fi; \
	$(MKDIR) -p $(rel_dir) 2>/dev/null ; \
	$(RM) -rf $(rel_dir)/latest_docs  ; \
	$(GIT) archive --format=tar --prefix=latest_docs/ $(rel_version) doc common.mk | tar -x -C $(rel_dir); \
	cur_dir="$$PWD"; \
	cd $(rel_dir)/latest_docs/doc ; \
	$(MV) ../common.mk . ; \
	$(SED) -i -e "s#topdir=../#topdir=./#g" Makefile ; \
	$(MAKE) all-docs; \
	$(RM) *.in *.bg.pdf ; \
	for i in `$(LS) $(GETTEXT_PACKAGE)*.pdf $(GETTEXT_PACKAGE)*.info $(GETTEXT_PACKAGE)*.txt $(GETTEXT_PACKAGE)*.html`; \
	do \
	$(GZIP) -c $$i > ../$${i}.gz; \
	$(BZIP2) -c $$i > ../$${i}.bz2; \
	$(XZ) -c $$i > ../$${i}.xz; \
	$(CP) $$i ../ ; \
	done; \
	cd ../ ; \
	$(MV) doc/ $(GETTEXT_PACKAGE)_latest_docs ; \
	$(TAR) -czf $(GETTEXT_PACKAGE)_latest_docs.tar.gz $(GETTEXT_PACKAGE)_latest_docs ; \
	$(TAR) -cjf $(GETTEXT_PACKAGE)_latest_docs.tar.bz2 $(GETTEXT_PACKAGE)_latest_docs ; \
	$(TAR) -cJf $(GETTEXT_PACKAGE)_latest_docs.tar.xz $(GETTEXT_PACKAGE)_latest_docs ; \
	$(RM) -rf $(GETTEXT_PACKAGE)_latest_docs ; \
	cd $$cur_dir


release-signatures: valid-version
	@cd $(rel_dir) ; \
	find . -type f -iname "*" | grep -E "*.sig" -v | while read file ; \
	do \
	echo -e "\n"$(rel_dir)/$$file ; \
	$(GPG) --yes --default-key $(GPG_KEY) -b --use-agent  $$file || exit 1 ; \
	done

release-verify-signatures: valid-version
	@cd $(rel_dir) ; \
	find . -type f -iname "*.sig" | while read file ; \
	do \
	echo -e "\n"$(rel_dir)/$$file ; \
	$(GPG) --verify $$file || exit 1; \
	done

release-changelog: valid-version
	@$(MKDIR) -p $(rel_dir) 2>/dev/null ; \
	v=$(rel_version) ; \
	if [ "$$v" == "master" ]; \
	then \
	exit 0 ; \
	fi;  \
	diff="`$(GIT) tag | $(XARGS) -I@ $(GIT) log --format=format:'%at @%n' -1 @ | $(SORT) | \
	       $(GREP) -B1 $$v$$ | $(CUT) -d ' ' -f2 | $(TR) '\n' ' ' | $(SED) -e 's/ $$//' -e 's/ /../'`" ; \
	$(GIT) log $$diff > $(rel_dir)/Changelog-$(PACKAGE)-$(VERSION) ; \
	$(GZIP) -c $(rel_dir)/Changelog-$(PACKAGE)-$(VERSION) >  $(rel_dir)/Changelog-$(PACKAGE)-$(VERSION).gz ; \
	$(BZIP2) -c $(rel_dir)/Changelog-$(PACKAGE)-$(VERSION) >  $(rel_dir)/Changelog-$(PACKAGE)-$(VERSION).bz2 ; \
	$(XZ) -c $(rel_dir)/Changelog-$(PACKAGE)-$(VERSION) >  $(rel_dir)/Changelog-$(PACKAGE)-$(VERSION).xz

release: release-archives release-latest_docs release-binary release-changelog release-signatures release-verify-signatures

# Clean without warnings for missing files. Sends errors in /dev/null
# and returns 0 always.
clean:
	@$(RM) $(STRIPCOMMENTS) $(STRIPHEADERS) $(BASE64FILES) $(CSSINJSFILES) $(STYLEFILE).js userscript-header.js 2>/dev/null; exit 0

# See comments for clean:
distclean: clean docs-clean po-distclean
	@$(RM) -rf $(PACKAGE).user.js releases/ 2> /dev/null; exit 0

strip-js-headers: $(STRIPHEADERS)

strip-js-comments: $(STRIPCOMMENTS)