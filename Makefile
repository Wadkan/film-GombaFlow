.PHONY: start-n8n stop-n8n

.DEFAULT_GOAL := start-n8n

start-n8n:
	@$(MAKE) -C n8n-docker start-n8n

stop-n8n:
	@$(MAKE) -C n8n-docker stop-n8n
