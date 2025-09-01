#!/bin/bash
# Database migration execution script
# Story 1.3: Database Schema and Models

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MIGRATION_DIR="./migrations"
ROLLBACK_DIR="./migrations/rollback"
DB_URL=${DATABASE_URL:-"postgresql://postgres:postgres@localhost:54322/postgres"}

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if psql is available
check_dependencies() {
    log "Checking dependencies..."
    if ! command -v psql &> /dev/null; then
        error "psql could not be found. Please install PostgreSQL client tools."
        exit 1
    fi
    log "Dependencies check passed"
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    if ! psql "$DB_URL" -c "SELECT 1;" &> /dev/null; then
        error "Cannot connect to database: $DB_URL"
        exit 1
    fi
    log "Database connection successful"
}

# Create migration tracking table if it doesn't exist
init_migration_tracking() {
    log "Initializing migration tracking..."
    psql "$DB_URL" -c "
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            version VARCHAR(255) UNIQUE NOT NULL,
            applied_at TIMESTAMP DEFAULT NOW(),
            rollback_file VARCHAR(255)
        );
    " &> /dev/null
    log "Migration tracking initialized"
}

# Check if migration has been applied
is_migration_applied() {
    local version=$1
    local count=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM schema_migrations WHERE version = '$version';" | xargs)
    [[ $count -gt 0 ]]
}

# Apply a single migration
apply_migration() {
    local migration_file=$1
    local version=$(basename "$migration_file" .sql)
    
    if is_migration_applied "$version"; then
        warn "Migration $version already applied, skipping..."
        return 0
    fi
    
    log "Applying migration: $version"
    
    # Start transaction and apply migration
    psql "$DB_URL" << EOF
BEGIN;
\i $migration_file
INSERT INTO schema_migrations (version, rollback_file) VALUES ('$version', '${ROLLBACK_DIR}/${version}_rollback.sql');
COMMIT;
EOF

    if [[ $? -eq 0 ]]; then
        log "Successfully applied migration: $version"
    else
        error "Failed to apply migration: $version"
        exit 1
    fi
}

# Rollback a single migration
rollback_migration() {
    local version=$1
    local rollback_file="${ROLLBACK_DIR}/${version}_rollback.sql"
    
    if ! is_migration_applied "$version"; then
        warn "Migration $version not applied, nothing to rollback..."
        return 0
    fi
    
    if [[ ! -f "$rollback_file" ]]; then
        error "Rollback file not found: $rollback_file"
        exit 1
    fi
    
    log "Rolling back migration: $version"
    
    # Start transaction and rollback migration
    psql "$DB_URL" << EOF
BEGIN;
\i $rollback_file
DELETE FROM schema_migrations WHERE version = '$version';
COMMIT;
EOF

    if [[ $? -eq 0 ]]; then
        log "Successfully rolled back migration: $version"
    else
        error "Failed to rollback migration: $version"
        exit 1
    fi
}

# Apply all pending migrations
migrate_up() {
    log "Starting migration up process..."
    
    for migration_file in $(ls ${MIGRATION_DIR}/*.sql 2>/dev/null | sort); do
        apply_migration "$migration_file"
    done
    
    log "All migrations applied successfully"
}

# Rollback migrations
migrate_down() {
    local steps=${1:-1}
    log "Starting rollback process (last $steps migrations)..."
    
    # Get the last N applied migrations in reverse order
    local migrations=$(psql "$DB_URL" -t -c "
        SELECT version FROM schema_migrations 
        ORDER BY applied_at DESC 
        LIMIT $steps;
    " | xargs -n 1)
    
    for version in $migrations; do
        rollback_migration "$version"
    done
    
    log "Rollback completed"
}

# Show migration status
status() {
    log "Migration Status:"
    echo
    echo "Applied Migrations:"
    psql "$DB_URL" -c "
        SELECT 
            version,
            applied_at,
            CASE WHEN rollback_file IS NOT NULL THEN '✓' ELSE '✗' END as has_rollback
        FROM schema_migrations 
        ORDER BY applied_at;
    " 2>/dev/null || echo "No migrations table found"
    
    echo
    echo "Available Migration Files:"
    ls -1 ${MIGRATION_DIR}/*.sql 2>/dev/null | xargs -n 1 basename | sed 's/\.sql$//' || echo "No migration files found"
    
    echo
    echo "Available Rollback Files:"
    ls -1 ${ROLLBACK_DIR}/*.sql 2>/dev/null | xargs -n 1 basename | sed 's/_rollback\.sql$//' || echo "No rollback files found"
}

# Reset database (rollback all migrations)
reset() {
    log "Resetting database (rolling back all migrations)..."
    
    local migrations=$(psql "$DB_URL" -t -c "
        SELECT version FROM schema_migrations 
        ORDER BY applied_at DESC;
    " | xargs -n 1)
    
    for version in $migrations; do
        rollback_migration "$version"
    done
    
    # Drop migration tracking table
    psql "$DB_URL" -c "DROP TABLE IF EXISTS schema_migrations;" &> /dev/null
    
    log "Database reset completed"
}

# Main script logic
main() {
    case "${1:-up}" in
        "up")
            check_dependencies
            test_connection
            init_migration_tracking
            migrate_up
            ;;
        "down")
            check_dependencies
            test_connection
            migrate_down "${2:-1}"
            ;;
        "status")
            check_dependencies
            test_connection
            status
            ;;
        "reset")
            check_dependencies
            test_connection
            reset
            ;;
        *)
            echo "Usage: $0 {up|down [steps]|status|reset}"
            echo "  up      - Apply all pending migrations"
            echo "  down    - Rollback last N migrations (default: 1)"
            echo "  status  - Show migration status"
            echo "  reset   - Rollback all migrations"
            exit 1
            ;;
    esac
}

main "$@"