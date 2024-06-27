#!/bin/bash

# Переход в директорию frontend и запуск серверной части Node.js
cd /bpmn-calculator/frontend
npm start server.js &

# Переход в директорию backend и запуск серверной части Python
cd /bpmn-calculator/backend
python3 server.py
