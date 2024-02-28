DOT_ENV = .env
include $(DOT_ENV)
ifneq ("$(wildcard .env.local)","")
	DOT_ENV = .env.local
	include $(DOT_ENV)
endif
export

# Determine the executable name based on availability
EXECUTABLE :=
ifeq ($(shell command -v $(EXECUTABLE) 2>/dev/null),)
    ifeq ($(shell command -v docker 2>/dev/null),)
        $(error Neither $(EXECUTABLE) nor docker is installed. Please install either one.)
    else
        EXECUTABLE := docker compose
    endif
else
    EXECUTABLE := $(EXECUTABLE)
endif

IS_DOCKER := $(shell docker info > /dev/null 2>&1 && echo 1)
DOCKER_PARAM = --env-file $(DOT_ENV) -f ".docker/docker-compose.yml"

help:
	echo "-- start: starts the project"; \
	echo "-- stop: stops the project"; \
	echo "-- down: stops the project and remove containers"; \
	echo "-- restart: restart the project"; \
	echo "-- logs: Display logs"; \
	echo "-- purge: Delete all container and images"; \
	echo "-- node: enters Node container CLI"; \

start: do-init do-start do-finish
do-start:
	@echo "$(STEP) Starting up containers... $(STEP)"
	$(EXECUTABLE) $(DOCKER_PARAM) up -d

stop: do-init do-stop do-finish
do-stop:
	@echo "$(STEP) Stopping containers... $(STEP)"
	$(EXECUTABLE) $(DOCKER_PARAM) stop

restart: do-init do-stop do-start do-finish

down: do-init do-down do-finish
do-down:
	@echo "$(STEP) Stopping and removing containers... $(STEP)"; \
	$(EXECUTABLE) $(DOCKER_PARAM) down;

logs: do-init do-logs do-finish
do-logs:
	@echo "$(STEP) Displaying logs... $(STEP)"; \
	$(EXECUTABLE) $(DOCKER_PARAM) logs -f --tail="100";

node: do-init do-node do-finish
do-node:
	@echo "$(STEP) Cli Bash $(NODE_CONTAINER_NAME)... $(STEP)"; \
	docker exec -ti $(NODE_CONTAINER_NAME) /bin/bash;

do-init:
	@rm -f .docker-config; \
	touch .docker-config;
ifeq ($(OS),Darwin)
	@echo $$(docker-machine env default) >> .docker-config;
endif

do-finish:
	@rm -f .docker-config;
