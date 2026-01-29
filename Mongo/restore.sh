#!/bin/bash
echo "Ξεκινάει η αυτόματη επαναφορά της βάσης..."

# Χρησιμοποιούμε τις μεταβλητές περιβάλλοντος που έχει ήδη το container
mongorestore \
  --username "$MONGO_INITDB_ROOT_USERNAME" \
  --password "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --archive=/data/backup/sports_db_backup.gz \
  --gzip \
  --drop

echo "Η επαναφορά ολοκληρώθηκε!"