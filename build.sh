#!/bin/bash

npm test && npm run lint --fix && docker build -t node-dummy-service .
