INSTALL_PATH=~/.local/share/FoundryVTT/Data/modules/bettercombatdamage

.PHONY: compress local-install

compress:
	cd bettercombatdamage/ && zip -r module.zip * && mv module.zip ../

local-install: compress
	rm -rf $(INSTALL_PATH)
	mkdir $(INSTALL_PATH)
	unzip module.zip -d $(INSTALL_PATH)