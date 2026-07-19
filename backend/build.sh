#!/usr/bin/env bash
# Render build script: installs deps, collects static files, runs migrations,
# and seeds sample data (safe to re-run — seed_data uses get_or_create).
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py seed_data
