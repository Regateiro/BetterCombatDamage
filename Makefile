INSTALL_PATH=~/.local/share/FoundryVTT/Data/modules/bettercombatdamage

.PHONY: compress local-install lint

lint:
	npx --yes eslint@8 bettercombatdamage/scripts/ --config .eslintrc.json

compress:
	cd bettercombatdamage/ && zip -r module.zip * && mv module.zip ../

install: compress
	rm -rf $(INSTALL_PATH)
	mkdir $(INSTALL_PATH)
	unzip module.zip -d $(INSTALL_PATH)