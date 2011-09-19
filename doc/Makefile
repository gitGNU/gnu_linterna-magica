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

topdir=../

include $(topdir)/common.mk

SHELL=/bin/bash

MAKEINFO=/usr/bin/makeinfo
MAKE=/usr/bin/make
LS=/bin/ls
SED=/bin/sed
PO4A-UPDATEPO=/usr/bin/po4a-updatepo
PO4A-GETTEXTIZE=/usr/bin/po4a-gettextize
PO4A-TRANSLATE=/usr/bin/po4a-translate
TEXI2PDF=/usr/bin/texi2pdf
TEXI2HTML=/usr/bin/texi2html
RM=/bin/rm
DATE=/bin/date
CP=/bin/cp

.SUFIXES:
.SUFFIXES: .info .texi .pdf .html .po .txt
.PHONY: all clean distclean

PODIR=po
MASTERDOC_FILENAME=linterna_magica
MASTERDOC=$(MASTERDOC_FILENAME).texi
POFILES=$(shell ls $(PODIR)/*.po)


all: all-docs

%.info: %.texi

%.info: %.texi version.texi
	@echo -n "Updating $@..."; \
	$(MAKEINFO) $(^F) -o $@; \
	echo "done";

$(MASTERDOC_FILENAME).%.texi: %.po
	@echo -n "Updating $@..."; \
	$(PO4A-TRANSLATE) -f texinfo -m $(MASTERDOC) -M UTF-8 -L UTF-8 -p $(PODIR)/$(^F) -l $@; \
	sed -i -e "s/@setfilename $(MASTERDOC_FILENAME).info/@setfilename $(MASTERDOC_FILENAME).$*.info/g" $@; \
	echo "done";

version.texi: version.texi.in $(MASTERDOC) $(topdir)/common.mk
	@updated=`LC_ALL=C $(DATE) +"%d %B %Y"`; \
	updated_month=`LC_ALL=C $(DATE) +"%B"` ; \
	$(SED) -e "s/__VERSION__/$(VERSION)/g" -e "s/__EDITION__/$(VERSION)/g" \
	-e "s/__UPDATED-MONTH__/$$updated_month/" \
	-e "s/__UPDATED__/$$updated/" $< > $@;

%.po: $(MASTERDOC)
	@echo -n "Updating $@..."; \
	$(PO4A-UPDATEPO) -f texinfo -m $(MASTERDOC) -M UTF-8 -p $@; \
	echo "done";

$(PODIR)/$(MASTERDOC).pot: $(MASTERDOC) $(topdir)/common.mk
	@echo -n "Updating $@ ...";\
	$(PO4A-GETTEXTIZE) --package-version $(VERSION) \
	--package-name "$(GETTEXT_PACKAGE)" -f texinfo \
	-m $(MASTERDOC) -M UTF-8 -p $@; \
	echo "done";


%.pdf: %.texi version.texi
	@$(TEXI2PDF) --build=clean $< -o $@ ;

%.html: %.texi version.texi
	@$(TEXI2HTML) --l2h-clean $<;  \
	$(SED) -i -e "s/>\o320</> </g" -e "s/>\o321</> </g"  $@; \
	# ^^^ Clean broken Unicode characters left by texi2html


%.txt: %.texi version.texi
	@$(MAKEINFO) --plaintext $< > $@;

update-pot: $(PODIR)/$(MASTERDOC).pot Makefile

update-po: $(POFILES) Makefile

update-texi:
	@for i in `$(LS) $(POFILES) | $(SED) -e "s/\.po/.texi/" -e "s/^po\//$(MASTERDOC_FILENAME)./"`; \
	do \
	$(MAKE) $$i; \
	done;

update-info: update-texi
	@for i in `$(LS) $(MASTERDOC_FILENAME)*.texi | sed -e 's/\.texi/.info/'`; \
	do \
	$(MAKE) $$i; \
	done;

update-pdf: update-texi
	@for i in `$(LS) $(MASTERDOC_FILENAME)*.texi | sed -e 's/\.texi/.pdf/'`; \
	do \
	$(MAKE) $$i; \
	done;

update-html: update-texi
	@for i in `$(LS) $(MASTERDOC_FILENAME)*.texi | sed -e 's/\.texi/.html/'`; \
	do \
	$(MAKE) $$i; \
	done;

update-txt: update-texi
	@for i in `$(LS) $(MASTERDOC_FILENAME)*.texi | sed -e 's/\.texi/.txt/'`; \
	do \
	$(MAKE) $$i; \
	done;

update-readme: update-txt
	@for i in `$(LS) $(MASTERDOC_FILENAME)*.txt`; \
	do \
	readme=`echo $$i | $(SED) -e "s/$(MASTERDOC_FILENAME)/README/" -e "s/\.txt//g"`; \
	 $(CP) $$i $(topdir)/$$readme ; \
	done;

info: update-info
pdf: update-pdf
html: update-html
txt: update-txt
all-docs: update-texi update-txt update-pdf update-html update-info

clean: 
	@$(RM) $(MASTERDOC_FILENAME).*.* \
	$(MASTERDOC_FILENAME).pdf $(MASTERDOC_FILENAME).info \
	$(MASTERDOC_FILENAME).txt $(MASTERDOC_FILENAME).html \
	version.info 2> /dev/null ; exit 0

distclean: clean