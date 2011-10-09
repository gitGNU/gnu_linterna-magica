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


SHELL=/bin/bash

topdir=../
srcdir=$(topdir)/src

include $(topdir)/common.mk

JSFILES=$(shell for file in `ls $(srcdir)/*.js`; do printf "$$file "; done)

.SUFFIXES:
.SUFFIXES: .json .po .pot .in .user.js

.PHONY: all clean distclean update-pot update-po generate-scripts

all: generate-scripts

%.po: $(GETTEXT_PACKAGE).pot
	@echo "Updating $@";\
	if test ! -e $@ ; then \
		echo "No rule to make $@";\
		exit 1;\
	fi;\
	$(INTLTOOL_UPDATE) -g $(GETTEXT_PACKAGE) -d $(*F)

%.json: %.po
	@locale=`echo $(*F)`; \
	result=`echo $$locale | $(GREP) _ `;\
	if test ! $$result ; then\
		locale=`echo $$locale | $(SED) -e "s/\(.*\)/\1_\1/"`;\
	fi;\
	locale=`echo $$locale | $(SED) -e "s/_\(.*\)/_\U\1/"`; \
	$(MSGATTRIB) --no-wrap -s --translated --no-obsolete \
	--no-fuzzy $< | $(SED) -e '/^#/d'  -e "s/msgid//g" \
	-e "s/msgstr\(.*\)/:\1/g" -e "/^$$/d" | $(SED) \
	-e '$$!N;s/\n/ /' | $(SED) \
	-e "/Project-Id/,/Content-Trans/{s/$$/,/; \
		s/\:\s\+/\":\"/g; s/\(.*Content-Trans.*\),/\1,\},/g }" \
	-e "s/\"\{2\}\s*:\s*\"\{2\}/\"__PO_HEADER\":\{/" | $(SED) -e :a \
	-e "/\"\{2\}$$/N; s/\\n//; ta" -e "s/\"\+/\"/g" -e "s/\\\n//g" \
	-e "/\"\s\+\"/{s/\s\+:\s\+\"/: \[\"/g; s/\"\s\+\"/\", \"/g ;\
		 s/\([^,]\)$$/\1,]/g }" \
	-e "s/\([^,\{]\)$$/\1,/g"  \
	-e "1{s/^/var LM_L10N=\{\"$$locale\":\{/}" \
	-e "\$${s/$$/\},\};/g}" > $@;

$(PACKAGE)_l10n_%.user.js: %.json $(srcdir)/lm_locale_userscript_template.js
	@echo "Making $(PACKAGE)_l10n_$*.user.js";\
	tmp=`$(MKTEMP)`;\
	locale=$*;\
	result=`echo $$locale | $(GREP) _ `;\
	if test ! $$result ; then\
		locale=`echo $$locale | $(SED) -e "s/\(.*\)/\1_\1/"`;\
	fi;\
	locale=`echo $$locale | $(SED) -e "s/_\(.*\)/_\U\1/"`; \
	locale_name=`$(GREP) -E "Language-Team\":\"[A-Za-z]+" -o $< | \
		$(CUT) -d ":" -f2 | $(CUT) -d "\"" -f2`;\
	$(CP) $(srcdir)/lm_locale_userscript_template.js $$tmp; \
	$(SED) -i -e "s/@LOCALE@/$$locale/" \
	-e "s/@LOCALE_NAME@/$$locale_name/" \
	-e "s/@VERSION@/$(VERSION)/g" $$tmp;\
	l10n_up_cut=`$(GREP) -B1 -n "var LM_L10N;" $$tmp | \
		$(HEAD) -n1 | $(CUT) -d'-' -f1`;\
	l10n_down_cut=`$(TAC) $$tmp | $(GREP) -B1 -n "var LM_L10N;" \
		| $(HEAD) -n1 | $(CUT) -d'-' -f1`;\
	$(HEAD) -n $$l10n_up_cut $$tmp > $@;\
	$(CAT) $< >> $@;\
	$(TAIL) -n $$l10n_down_cut $$tmp >>$@;\
	$(CP) $@ $$tmp;\
	up_cut=`$(GREP) -n -B1 Copyright $$tmp |$(HEAD) -n 1| \
		$(CUT) -d'-' -f1 `;\
	down_cut=`$(TAC) $$tmp | $(GREP) -n -B1 Copyright | \
		$(HEAD) -n 1| $(CUT) -d'-' -f1`;\
	$(HEAD) -n $$up_cut $$tmp > $@;\
	authors=`$(GREP) "Copyright" $< $(JSFILES) | \
		$(CUT) -d':' -f2 | \
		$(SED) -e "s/\/\/\s\+\|#\s\+/\/\/ /g" \
		-e "s/\s\+/ /g"|$(SORT) |$(UNIQ)|$(TR) -d '\n' `;\
	echo $$authors | $(SED) -e "s/\/\/ /\n\/\/ /g" | $(GREP) -E "^$$" -v >> $@;\
	$(TAIL) -n $$down_cut $$tmp >>$@;\
	$(RM) $$tmp;

POTFILES.in: $(JSFILES)
	@$(LS) $(srcdir)/*.js | $(SED) -e "s/\.\.\/*//g" > $@

$(GETTEXT_PACKAGE).pot: POTFILES.in
	@$(INTLTOOL_UPDATE) -p -g $(GETTEXT_PACKAGE); \
	year=`$(DATE) +"%Y"` ; \
	$(SED) -i -e "s/VERSION/$(VERSION)/g" \
	-e "s/THE PACKAGE/PACKAGE/" \
	-e "s/'S COPYRIGHT HOLDER/'s copyright holders/g" \
	-e "s/PACKAGE/$(GETTEXT_PACKAGE)/g" \
	-e "s/SOME DESCR.*/Linterna Mágica PO file template./" $@

update-po: LINGUAS $(GETTEXT_PACKAGE).pot
	@linguas=`$(CAT) LINGUAS`;\
	for lang in $$linguas;\
	do\
		$(MAKE) $$lang.po;\
	done\

update-pot: $(GETTEXT_PACKAGE).pot

generate-scripts: LINGUAS $(GETTEXT_PACKAGE).pot
	@linguas=`$(CAT) LINGUAS`;\
	for lang in $$linguas;\
	do\
		$(MAKE) $(PACKAGE)_l10n_$$lang.user.js;\
	done

locales: generate-scripts

clean:
	@$(RM) *.user.js *.json 2> /dev/null; exit 0

distclean: clean
	@$(RM) $(GETTEXT_PACKAGE).pot POTFILES.in *.json 2> /dev/null ; exit 0
