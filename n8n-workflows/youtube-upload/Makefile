.PHONY: studio login test

PYTHON ?= $(CURDIR)/.venv/bin/python
CDP_ENDPOINT ?= auto
PROFILE ?= $(HOME)/.config/film-gombaflow/youtube-studio

studio:
	@$(PYTHON) youtube_studio.py studio "$(META)" --cdp-endpoint "$(CDP_ENDPOINT)"

login:
	@$(PYTHON) youtube_studio.py login --profile "$(PROFILE)"

test:
	@PYTHONPATH="$(CURDIR)/../../tests" $(PYTHON) -m unittest -v test_youtube_studio
