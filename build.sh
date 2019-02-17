#!/bin/bash

npm test && npm run lint --fix && docker build -t cap-feed-fetcher-service .
