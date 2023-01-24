INSTALL_PATH=~/.local/share/FoundryVTT/Data/modules/betterscrollingtext

.PHONY: compress local-install

compress:
	cd betterscrollingtext/ && zip -r module.zip * && mv module.zip ../

local-install: compress
	rm -rf $(INSTALL_PATH)
	mkdir $(INSTALL_PATH)
	unzip module.zip -d $(INSTALL_PATH)