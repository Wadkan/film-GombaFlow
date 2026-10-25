.PHONY: start-n8n stop-n8n test

.DEFAULT_GOAL := start-n8n

start-n8n:
	@$(MAKE) -C n8n-docker start-n8n

stop-n8n:
	@$(MAKE) -C n8n-docker stop-n8n

test:
	node --test n8n-workflows/youtube-upload/tests/meta-chat-runtime.test.js
	@$(MAKE) -C n8n-workflows/youtube-upload flow-test
	@$(MAKE) -C n8n-workflows/youtube-upload file-write-test
