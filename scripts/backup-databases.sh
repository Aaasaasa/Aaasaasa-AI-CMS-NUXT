#!/bin/bash

# Database Backup Script
# Erstellt Backups von PostgreSQL und MySQL Datenbanken

# Erstelle Backup-Verzeichnis mit Timestamp
BACKUP_DIR="/srv/proj/nuxt-wp-multilang-theme/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

mkdir -p "$BACKUP_PATH"

echo "📦 Starting database backups..."
echo "Backup location: $BACKUP_PATH"
echo ""

# PostgreSQL Backup
echo "🐘 Backing up PostgreSQL (${POSTGRES_DB:-postgres})..."
PGPASSWORD="${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD}" pg_dump \
  -h "${POSTGRES_HOST:-localhost}" \
  -p "${POSTGRES_PORT:-5432}" \
  -U "${POSTGRES_USER:?set POSTGRES_USER}" \
  -d "${POSTGRES_DB:?set POSTGRES_DB}" \
  -F c \
  -f "$BACKUP_PATH/postgres_${POSTGRES_DB:-postgres}.dump"

if [ $? -eq 0 ]; then
  echo "  ✓ PostgreSQL backup created: postgres_nuxt_pg_cms_db.dump"
else
  echo "  ✗ PostgreSQL backup failed!"
  exit 1
fi

# MySQL Backup
echo ""
echo "🐬 Backing up MySQL (${MYSQL_NAME:-mysql})..."
docker exec nuxt_mysql mysqldump \
  -u "${MYSQL_USER:-root}" \
  -p"${MYSQL_PASSWORD:?set MYSQL_PASSWORD}" \
  "${MYSQL_NAME:?set MYSQL_NAME}" \
  > "$BACKUP_PATH/mysql_${MYSQL_NAME:-mysql}.sql"

if [ $? -eq 0 ]; then
  echo "  ✓ MySQL backup created: mysql_sta3wp.sql"
else
  echo "  ✗ MySQL backup failed!"
  exit 1
fi

# Backup Info erstellen
echo ""
echo "📝 Creating backup info..."
cat > "$BACKUP_PATH/backup_info.txt" << EOF
Backup Information
==================
Date: $(date)
Timestamp: $TIMESTAMP

Databases:
- PostgreSQL: ${POSTGRES_DB:-postgres} (${POSTGRES_HOST:-localhost}:${POSTGRES_PORT:-5432})
- MySQL: ${MYSQL_NAME:-mysql} (Docker container)

Files:
- postgres_${POSTGRES_DB:-postgres}.dump (PostgreSQL custom format)
- mysql_${MYSQL_NAME:-mysql}.sql (MySQL SQL dump)

Restore Commands:
-----------------
PostgreSQL:
  PGPASSWORD=${POSTGRES_PASSWORD:-<postgres_password>} pg_restore -h ${POSTGRES_HOST:-localhost} -p ${POSTGRES_PORT:-5432} -U ${POSTGRES_USER:-<postgres_user>} -d ${POSTGRES_DB:-<postgres_db>} -c postgres_${POSTGRES_DB:-postgres}.dump

MySQL:
  docker exec -i nuxt_mysql mysql -u ${MYSQL_USER:-root} -p${MYSQL_PASSWORD:-<mysql_password>} ${MYSQL_NAME:-<mysql_db>} < mysql_${MYSQL_NAME:-mysql}.sql
EOF

echo "  ✓ Backup info created: backup_info.txt"

# Dateigröße anzeigen
echo ""
echo "📊 Backup sizes:"
du -h "$BACKUP_PATH"/*

echo ""
echo "✅ Backup completed successfully!"
echo "Location: $BACKUP_PATH"
echo ""
echo "To restore:"
echo "  PostgreSQL: PGPASSWORD=${POSTGRES_PASSWORD:-<postgres_password>} pg_restore -h ${POSTGRES_HOST:-localhost} -p ${POSTGRES_PORT:-5432} -U ${POSTGRES_USER:-<postgres_user>} -d ${POSTGRES_DB:-<postgres_db>} -c $BACKUP_PATH/postgres_${POSTGRES_DB:-postgres}.dump"
echo "  MySQL: docker exec -i nuxt_mysql mysql -u ${MYSQL_USER:-root} -p${MYSQL_PASSWORD:-<mysql_password>} ${MYSQL_NAME:-<mysql_db>} < $BACKUP_PATH/mysql_${MYSQL_NAME:-mysql}.sql"
