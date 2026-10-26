.PHONY: start-n8n stop-n8n gomba1-transcript test

.DEFAULT_GOAL := start-n8n

start-n8n:
	@$(MAKE) -C n8n-docker start-n8n

stop-n8n:
	@$(MAKE) -C n8n-docker stop-n8n

gomba1-transcript:
	@python3 local-workflows/gomba-1-script-writer/run_transcript_flow.py

test:
	@python3 -m unittest discover -s tests -v

